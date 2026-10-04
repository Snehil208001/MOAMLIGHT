'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Customer,
  CustomerCreateInput,
  CustomerAccessTokenCreateInput,
  registerCustomer,
  recoverCustomerPassword,
} from '@/src/integrations/shopify';

const CART_STORAGE_KEY = 'moamlight_cart_v1';

export interface AuthContextType {
  customer: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: CustomerAccessTokenCreateInput) => Promise<{ success: boolean; error?: string }>;
  register: (input: CustomerCreateInput) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  recoverPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshCustomer: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to sync cart with customer identity
  const syncCartIdentity = useCallback(async (customerEmail?: string) => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.shopifyCartId) {
          await fetch('/api/auth/sync-cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cartId: parsed.shopifyCartId,
              email: customerEmail,
            }),
          });
        }
      }
    } catch (err) {
      console.warn('[AuthContext] Cart identity sync skipped:', err);
    }
  }, []);

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    async function rehydrateSession() {
      if (typeof window === 'undefined') return;
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const { customer: profile } = await res.json();
          if (profile) {
            setCustomer(profile);
            syncCartIdentity(profile.email);
          } else {
            setCustomer(null);
          }
        }
      } catch (err) {
        console.error('[AuthContext] Rehydration error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    rehydrateSession();
  }, [syncCartIdentity]);

  // Login handler
  const login = useCallback(
    async (credentials: CustomerAccessTokenCreateInput): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setIsLoading(false);
          return { success: false, error: data.error || 'Invalid email or password. Please try again.' };
        }

        if (data.profile) {
          setCustomer(data.profile);
          syncCartIdentity(data.profile.email);
        }

        setIsLoading(false);
        return { success: true };
      } catch (err) {
        setIsLoading(false);
        const msg = err instanceof Error ? err.message : 'An unexpected error occurred during sign in.';
        return { success: false, error: msg };
      }
    },
    [syncCartIdentity]
  );

  // Register handler (creates customer, then automatically logs in)
  const register = useCallback(
    async (input: CustomerCreateInput): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        const res = await registerCustomer(input);
        if (res.userErrors && res.userErrors.length > 0) {
          setIsLoading(false);
          return { success: false, error: res.userErrors[0].message };
        }

        // Automatic login upon successful registration
        return await login({ email: input.email, password: input.password });
      } catch (err) {
        setIsLoading(false);
        const msg = err instanceof Error ? err.message : 'An error occurred during account registration.';
        return { success: false, error: msg };
      }
    },
    [login]
  );

  // Logout handler
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('[AuthContext] Remote logout error:', err);
    } finally {
      setCustomer(null);
      setIsLoading(false);
    }
  }, []);

  // Recover Password handler
  const recoverPassword = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await recoverCustomerPassword(email);
        if (res.userErrors && res.userErrors.length > 0) {
          return { success: false, error: res.userErrors[0].message };
        }
        return { success: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to send recovery email.';
        return { success: false, error: msg };
      }
    },
    []
  );

  // Refresh customer profile (e.g. after editing address or placing order)
  const refreshCustomer = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const { customer: profile } = await res.json();
        if (profile) {
          setCustomer(profile);
        } else {
          setCustomer(null);
        }
      }
    } catch (err) {
      console.warn('[AuthContext] Refresh customer error:', err);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        customer,
        token: customer ? 'http-only' : null, // Mock token for compatibility if any component checks for it
        isAuthenticated: Boolean(customer),
        isLoading,
        login,
        register,
        logout,
        recoverPassword,
        refreshCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
