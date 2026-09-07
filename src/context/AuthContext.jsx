import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { safeFetch } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Clear any legacy auth state from localStorage so past permanent logins never bypass login
  try {
    localStorage.removeItem('karigar-auth-token');
    localStorage.removeItem('karigar-user');
  } catch (_e) {
    // Ignore storage errors
  }

  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem('karigar-auth-token') || null;
    } catch (e) {
      console.warn('Error reading karigar-auth-token:', e);
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem('karigar-user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.warn('Error reading karigar-user:', e);
      return null;
    }
  });

  // Fast loading resolution: if no session exists, loading is immediately false
  const [loading, setLoading] = useState(() => {
    try {
      return Boolean(sessionStorage.getItem('karigar-auth-token'));
    } catch (_e) {
      return false;
    }
  });

  // Validate session on mount if token exists in sessionStorage
  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      let storedToken = null;
      try {
        storedToken = sessionStorage.getItem('karigar-auth-token');
      } catch (_e) {}

      if (!storedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const data = await safeFetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (isMounted && data?.user) {
          setUser(data.user);
          try {
            sessionStorage.setItem('karigar-user', JSON.stringify(data.user));
          } catch (_e) {}
        }
      } catch (err) {
        console.warn('Session verification network error:', err);
        // Token expired, invalid or server unreachable
        if (isMounted) {
          setToken(null);
          setUser(null);
          try {
            sessionStorage.removeItem('karigar-auth-token');
            sessionStorage.removeItem('karigar-user');
          } catch (_e) {}
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Log in with Email/Mobile, Password and Selected Role
   */
  const login = async (identifier, password, selectedRole = 'ARTISAN') => {
    const data = await safeFetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ identifier, password, selectedRole })
    });

    setToken(data.token);
    setUser(data.user);

    try {
      sessionStorage.setItem('karigar-auth-token', data.token);
      sessionStorage.setItem('karigar-user', JSON.stringify(data.user));
    } catch (e) {
      console.warn('Error storing auth token in sessionStorage:', e);
    }

    return data.user;
  };

  /**
   * Register a new account
   */
  const signup = async (formData) => {
    const data = await safeFetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    setToken(data.token);
    setUser(data.user);

    try {
      sessionStorage.setItem('karigar-auth-token', data.token);
      sessionStorage.setItem('karigar-user', JSON.stringify(data.user));
    } catch (e) {
      console.warn('Error storing auth token in sessionStorage:', e);
    }

    return data.user;
  };

  /**
   * Log in with Google authentication
   */
  const loginWithGoogle = async (googleToken, selectedRole) => {
    const data = await safeFetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token: googleToken, selectedRole })
    });

    setToken(data.token);
    setUser(data.user);

    try {
      sessionStorage.setItem('karigar-auth-token', data.token);
      sessionStorage.setItem('karigar-user', JSON.stringify(data.user));
    } catch (e) {
      console.warn('Error storing auth token in sessionStorage:', e);
    }

    return data.user;
  };

  /**
   * Refresh current user profile data from backend
   */
  const refreshUser = useCallback(async () => {
    const currentToken = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('karigar-auth-token')) || token;
    if (!currentToken) return null;

    try {
      const data = await safeFetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      if (data?.user) {
        setUser(data.user);
        try {
          sessionStorage.setItem('karigar-user', JSON.stringify(data.user));
        } catch (_e) {}
        return data.user;
      }
    } catch (err) {
      console.warn('refreshUser error:', err);
    }
    return null;
  }, [token]);

  /**
   * Update current user profile in backend and local state
   */
  const updateUserProfile = async (updates) => {
    const currentToken = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('karigar-auth-token')) || token;
    if (!currentToken) throw new Error('Not authenticated');

    const data = await safeFetch('/api/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify(updates)
    });

    setUser(data.user);
    try {
      sessionStorage.setItem('karigar-user', JSON.stringify(data.user));
    } catch (e) {
      console.warn('Error persisting updated user:', e);
    }

    return data.user;
  };

  /**
   * Upload and save a new profile picture
   */
  const uploadAvatar = async (file) => {
    const currentToken = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('karigar-auth-token')) || token;
    if (!currentToken) throw new Error('Not authenticated');

    // Validate type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Please select a valid image file (JPEG, PNG, or WEBP).');
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE) {
      throw new Error('Image size must be less than 5 MB.');
    }

    // Convert to base64 data URL
    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });

    const data = await safeFetch('/api/profile/avatar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({
        image: base64Data,
        mimeType: file.type,
        filename: file.name
      })
    });

    setUser(data.user);
    try {
      sessionStorage.setItem('karigar-user', JSON.stringify(data.user));
    } catch (e) {
      console.warn('Error persisting updated user:', e);
    }

    return data;
  };

  /**
   * Log out: clears auth session while strictly preserving karigar-theme & karigar-language in localStorage
   */
  const logout = useCallback(async () => {
    try {
      await safeFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch (e) {
      // Ignore network errors on logout
    }

    setToken(null);
    setUser(null);

    try {
      sessionStorage.removeItem('karigar-auth-token');
      sessionStorage.removeItem('karigar-user');
      localStorage.removeItem('karigar-auth-token');
      localStorage.removeItem('karigar-user');
      // karigar-theme and karigar-language are strictly preserved in localStorage
    } catch (e) {
      console.warn('Error clearing auth storage:', e);
    }
  }, []);

  const isAuthenticated = Boolean(token && user);
  const role = user?.role || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated,
        loading,
        login,
        loginWithGoogle,
        signup,
        logout,
        setUser,
        updateUserProfile,
        uploadAvatar,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
