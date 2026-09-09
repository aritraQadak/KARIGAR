import { initialProducts } from './sellerData';
import { categoryImage } from './demoImages';

// Order snapshots may predate category fields; resolve their catalogue product.
export function sellerOrderImage(order) {
  const product = initialProducts.find(item => item.name === order.product);
  const name = String(order.product || '').toLowerCase();
  const inferred = /terracotta|clay|pottery/.test(name) ? 'Pottery'
    : /painting|madhubani/.test(name) ? 'Folk Painting'
    : /brass|dhokra|metal/.test(name) ? 'Metal Craft'
    : /embroidery|chikankari|zardozi/.test(name) ? 'Embroidery'
    : /saree|sari|shawl|handloom/.test(name) ? 'Handloom' : undefined;
  return categoryImage({ ...product, ...order, category: order.category || product?.category || inferred });
}
