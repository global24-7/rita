import { createContext, useContext, useState, useEffect } from 'react';
import {
  loginCustomer,
  registerCustomer,
  logoutCustomer,
  getCustomerProfile,
  updateCustomerProfile,
} from '../api';

const CustomerContext = createContext();

export const useCustomer = () => useContext(CustomerContext);

export const CustomerProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomerProfile()
      .then((res) => setCustomer(res.data))
      .catch(() => {
        setCustomer(null);
        localStorage.removeItem('customerToken');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await loginCustomer({ email, password });
    setCustomer(res.data.customer || res.data);
    return res.data;
  };

  const register = async (data) => {
    const res = await registerCustomer(data);
    setCustomer(res.data.customer || res.data);
    return res.data;
  };

  const logout = async () => {
    await logoutCustomer().catch(() => {});
    setCustomer(null);
  };

  const updateProfile = async (data) => {
    const res = await updateCustomerProfile(data);
    setCustomer(res.data.customer || res.data);
    return res.data;
  };

  const isAuthenticated = !!customer;

  return (
    <CustomerContext.Provider
      value={{ customer, loading, login, register, logout, updateProfile, isAuthenticated }}
    >
      {children}
    </CustomerContext.Provider>
  );
};
