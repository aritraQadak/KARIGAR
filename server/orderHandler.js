import jwt from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET || 'karigar_secret_jwt_artisan_2026_key';

function extractToken(req) {
  const authHeader =
    req.headers['authorization'] || req.headers['Authorization'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

function jsonResponse(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();

  return `KGR-${timestamp}-${random}`;
}

async function authenticateBuyer(req, prisma) {
  const token = extractToken(req);

  if (!token) {
    return {
      error: 'Authorization token required',
      statusCode: 401
    };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded?.id) {
      return {
        error: 'Invalid authentication token',
        statusCode: 401
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || !user.isActive) {
      return {
        error: 'User not found or inactive',
        statusCode: 401
      };
    }

    if (user.role !== 'PATRON') {
      return {
        error: 'Only buyers can place orders',
        statusCode: 403
      };
    }

    return { user };
  } catch {
    return {
      error: 'Session expired or invalid token',
      statusCode: 401
    };
  }
}

function normalizeCartItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const quantities = new Map();

  for (const item of items) {
    const productId = String(item?.productId || '').trim();
    const quantity = Number(item?.quantity);

    if (!productId) {
      throw new Error('Each cart item must have a productId');
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Product quantity must be a positive whole number');
    }

    quantities.set(
      productId,
      (quantities.get(productId) || 0) + quantity
    );
  }

  return Array.from(quantities.entries()).map(
    ([productId, quantity]) => ({
      productId,
      quantity
    })
  );
}

/**
 * POST /api/orders
 *
 * Creates an order in PAYMENT_PENDING state.
 *
 * IMPORTANT:
 * The client-provided product prices and totals are never trusted.
 * Prices are loaded from the database and calculated on the server.
 */
export async function createOrder({ req, res, prisma, body }) {
  const auth = await authenticateBuyer(req, prisma);

  if (auth.error) {
    return jsonResponse(res, auth.statusCode, {
      error: auth.error
    });
  }

  const { user } = auth;

  try {
    const items = normalizeCartItems(body.items);

    if (!items) {
      return jsonResponse(res, 400, {
        error: 'Your cart is empty'
      });
    }

    const shippingAddress = body.shippingAddress;

    if (
      !shippingAddress ||
      typeof shippingAddress !== 'object'
    ) {
      return jsonResponse(res, 400, {
        error: 'Shipping address is required'
      });
    }

    const requiredAddressFields = [
      'fullName',
      'email',
      'mobile',
      'address',
      'city',
      'state',
      'pincode'
    ];

    for (const field of requiredAddressFields) {
      if (!String(shippingAddress[field] || '').trim()) {
        return jsonResponse(res, 400, {
          error: `${field} is required`
        });
      }
    }

    const paymentMethod = String(
      body.paymentMethod || ''
    ).trim();

    const allowedPaymentMethods = [
      'escrow_upi',
      'escrow_card'
    ];

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return jsonResponse(res, 400, {
        error: 'Invalid payment method'
      });
    }

    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: {
          id: {
            in: items.map(item => item.productId)
          }
        },
        include: {
          artisan: {
            select: {
              id: true,
              fullName: true,
              businessName: true,
              isActive: true
            }
          }
        }
      });

      if (products.length !== items.length) {
        throw new Error('One or more products are no longer available');
      }

      const productMap = new Map(
        products.map(product => [product.id, product])
      );

      let totalAmount = 0;

      const orderItems = [];

      for (const item of items) {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new Error('Product not found');
        }

        if (!product.artisan?.isActive) {
          throw new Error(
            `The artisan for "${product.title}" is currently unavailable`
          );
        }

        if (!Number.isFinite(product.price) || product.price < 0) {
          throw new Error(
            `Invalid price configured for "${product.title}"`
          );
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Only ${product.stock} unit(s) of "${product.title}" are available`
          );
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price
        });
      }

      if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
        throw new Error('Order total must be greater than zero');
      }

      const createdOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          buyerId: user.id,
          totalAmount,
          paymentMethod,
          status: 'PAYMENT_PENDING',
          shippingAddressJson: JSON.stringify({
            fullName: String(shippingAddress.fullName).trim(),
            email: String(shippingAddress.email).trim(),
            mobile: String(shippingAddress.mobile).trim(),
            address: String(shippingAddress.address).trim(),
            city: String(shippingAddress.city).trim(),
            state: String(shippingAddress.state).trim(),
            pincode: String(shippingAddress.pincode).trim()
          }),
          items: {
            create: orderItems
          },
          escrow: {
            create: {
              amount: totalAmount,
              method: paymentMethod,
              status: 'PENDING'
            }
          }
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  artisanId: true
                }
              }
            }
          },
          escrow: true
        }
      });

      return createdOrder;
    });

    return jsonResponse(res, 201, {
      success: true,
      message: 'Order created. Payment confirmation is required.',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);

    return jsonResponse(res, 400, {
      error: error.message || 'Unable to create order'
    });
  }
}

/**
 * GET /api/orders
 *
 * Returns orders belonging only to the authenticated buyer.
 */
export async function getBuyerOrders({ req, res, prisma }) {
  const auth = await authenticateBuyer(req, prisma);

  if (auth.error) {
    return jsonResponse(res, auth.statusCode, {
      error: auth.error
    });
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        buyerId: auth.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                category: true,
                price: true,
                artisanId: true,
                artisan: {
                  select: {
                    id: true,
                    fullName: true,
                    businessName: true,
                    giTagNumber: true
                  }
                }
              }
            }
          }
        },
        escrow: true
      }
    });

    return jsonResponse(res, 200, {
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get buyer orders error:', error);

    return jsonResponse(res, 500, {
      error: 'Unable to load orders'
    });
  }
}

/**
 * POST /api/orders/:id/payment/confirm
 *
 * TEST PAYMENT ONLY.
 *
 * This does NOT move real money.
 * It simulates a successful payment gateway confirmation
 * and changes the escrow state to HELD.
 */
export async function confirmTestPayment({
  req,
  res,
  prisma,
  orderId
}) {
  const auth = await authenticateBuyer(req, prisma);

  if (auth.error) {
    return jsonResponse(res, auth.statusCode, {
      error: auth.error
    });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          buyerId: auth.user.id
        },
        include: {
          escrow: true
        }
      });

      if (!order) {
        return {
          error: 'Order not found',
          statusCode: 404
        };
      }

      if (!order.escrow) {
        return {
          error: 'Escrow record not found',
          statusCode: 500
        };
      }

      if (order.status === 'ESCROW_HELD') {
        return {
          order,
          alreadyConfirmed: true
        };
      }

      if (order.status !== 'PAYMENT_PENDING') {
        return {
          error: `Payment cannot be confirmed for order in ${order.status} state`,
          statusCode: 409
        };
      }

      const transactionId =
        `TEST-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase()}`;

      const updatedOrder = await tx.order.update({
        where: {
          id: order.id
        },
        data: {
          status: 'ESCROW_HELD',
          escrow: {
            update: {
              status: 'HELD',
              transactionId,
              fundedAt: new Date()
            }
          }
        },
        include: {
          items: true,
          escrow: true
        }
      });

      return {
        order: updatedOrder,
        alreadyConfirmed: false
      };
    });

    if (result.error) {
      return jsonResponse(res, result.statusCode, {
        error: result.error
      });
    }

    return jsonResponse(res, 200, {
      success: true,
      testPayment: true,
      message: result.alreadyConfirmed
        ? 'Payment was already confirmed'
        : 'Test payment confirmed and escrow marked as held',
      order: result.order
    });
  } catch (error) {
    console.error('Confirm test payment error:', error);

    return jsonResponse(res, 500, {
      error: 'Unable to confirm payment'
    });
  }
}