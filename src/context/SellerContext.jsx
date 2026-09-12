import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialSellerProfile,
  initialOrders,
  initialProducts,
  initialTransactions,
  initialCustomers,
  initialMessages
} from '../data/sellerData';
import i18n from '../i18n/i18n';
import { useAuth } from './AuthContext';
import useSellerProducts from '../hooks/useSellerProducts';
import { formatCurrency } from '../utils/formatters';

const SellerContext = createContext();

export const SellerProvider = ({ children }) => {
  const { user, token, updateUserProfile } = useAuth();
  const {products,productsLoading,productsError,refreshProducts}=useSellerProducts(user?.role==='ARTISAN'?token:null);

  // Language (synced with i18n and localStorage 'karigar-language')
  const [lang, setLangState] = useState(() => localStorage.getItem('karigar-language') || i18n.language || 'en');

  const setLang = (newLang) => {
    setLangState(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem('karigar-language', newLang);
  };

  useEffect(() => {
    const handleLangChanged = (newLang) => {
      setLangState(newLang);
    };
    i18n.on('languageChanged', handleLangChanged);
    return () => {
      i18n.off('languageChanged', handleLangChanged);
    };
  }, []);

  // Seller Profile dynamically derived from authenticated user
  const [profile, setProfile] = useState(() => {
    const base = { ...initialSellerProfile };
    if (user && user.role === 'ARTISAN') {
      base.name = user.fullName || base.name;
      base.email = user.email || base.email;
      base.phone = user.mobile || base.phone;
      base.avatar = user.avatarUrl || base.avatar;
      base.businessName = user.businessName || base.businessName;
      base.craftType = user.craftType || base.craftType;
      base.experienceYears = user.yearsOfExperience ?? base.experienceYears;
      base.district = user.district || base.district;
      base.state = user.state || base.state;
      base.giTagNumber = user.giTagNumber || base.giTagNumber;
      base.cluster = user.clusterName || base.cluster;
      base.location = [user.district, user.state].filter(Boolean).join(', ') || base.location;
    }
    return base;
  });

  // Keep profile synchronized whenever user changes in AuthContext
  useEffect(() => {
    if (user && user.role === 'ARTISAN') {
      setProfile((prev) => ({
        ...prev,
        name: user.fullName || prev.name,
        email: user.email || prev.email,
        phone: user.mobile || prev.phone,
        avatar: user.avatarUrl || prev.avatar,
        businessName: user.businessName || prev.businessName,
        craftType: user.craftType || prev.craftType,
        experienceYears: user.yearsOfExperience ?? prev.experienceYears,
        district: user.district || prev.district,
        state: user.state || prev.state,
        giTagNumber: user.giTagNumber || prev.giTagNumber,
        cluster: user.clusterName || prev.cluster,
        location: [user.district, user.state].filter(Boolean).join(', ') || prev.location
      }));
    }
  }, [user]);

  // Products
  const [legacyProducts, setProducts] = useState(() => {
    const saved = localStorage.getItem('karigar_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  // Orders
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('karigar_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  // Transactions
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('karigar_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  // Customers
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('karigar_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  // Messages
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('karigar_messages');
    return saved ? JSON.parse(saved) : initialMessages;
  });

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // Selected Order for Modal / Drawer
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('karigar-language', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('karigar_products', JSON.stringify(legacyProducts));
  }, [legacyProducts]);

  useEffect(() => {
    localStorage.setItem('karigar_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('karigar_orders', JSON.stringify(orders));
  }, [orders]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addProduct = (newProduct) => {
    const created = {
      ...newProduct,
      id: Date.now(),
      status: 'Live',
      views: 12,
      orders: 0,
      authenticityScore: newProduct.authenticityScore || 92
    };
    setProducts((prev) => [created, ...prev]);
    addToast(i18n.t('sellerToasts.productPublished'), 'success');
  };

  const updateProduct = (id, updated) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
    addToast(i18n.t('sellerToasts.productUpdated'), 'success');
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast(i18n.t('sellerToasts.productRemoved'), 'info');
  };

  const updateProfile = async (updated) => {
    setProfile((prev) => ({ ...prev, ...updated }));
    if (updateUserProfile) {
      try {
        await updateUserProfile({
          fullName: updated.name,
          mobile: updated.phone,
          craftType: updated.craftType,
          district: updated.district,
          state: updated.state,
          businessName: updated.businessName,
          avatarUrl: updated.avatar,
          yearsOfExperience: updated.experienceYears,
          giTagNumber: updated.giTagNumber,
          clusterName: updated.cluster
        });
      } catch (err) {
        console.warn('Backend profile sync error:', err);
      }
    }
    addToast(i18n.t('sellerToasts.profileUpdated'), 'success');
  };

  const withdrawFunds = (amount) => {
    if (amount > profile.availableBalance) {
      addToast(i18n.t('sellerToasts.withdrawalExceeds'), 'error');
      return false;
    }
    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: `PAYOUT-${new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase()}`,
      amount: amount,
      status: 'Transferred',
      date: 'Just now',
      type: 'Bank Withdrawal',
      channel: profile.bankAccount
    };
    setTransactions((prev) => [newTxn, ...prev]);
    setProfile((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance - amount
    }));
    addToast(`${formatCurrency(amount, i18n.language)} transferred to your verified bank account!`, 'success');
    return true;
  };

  const sendMessageReply = (conversationId, replyText) => {
    setMessages((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          const newThread = [
            ...conv.thread,
            { sender: 'artisan', text: replyText, time: 'Just now' }
          ];
          return {
            ...conv,
            lastMessage: replyText,
            time: 'Just now',
            unread: false,
            thread: newThread
          };
        }
        return conv;
      })
    );
    addToast(i18n.t('sellerToasts.replySent'), 'success');
  };

  const t = (key) => {
    return i18n.t(key);
  };

  return (
    <SellerContext.Provider
      value={{
        lang,
        setLang,
        t,
        profile: {...profile,totalProducts:products.length,totalOrders:orders.length},
        updateProfile,
        products,
        productsLoading,productsError,refreshProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        orders,
        setOrders,
        transactions,
        customers,
        messages,
        sendMessageReply,
        withdrawFunds,
        toasts,
        addToast,
        removeToast,
        selectedOrder,
        setSelectedOrder
      }}
    >
      {children}
    </SellerContext.Provider>
  );
};

export const useSeller = () => useContext(SellerContext);
