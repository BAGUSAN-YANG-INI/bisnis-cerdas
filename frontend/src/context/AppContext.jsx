import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USER, INITIAL_TRANSACTIONS } from '../data/mockData';
import { calculateHealthMetrics } from '../utils/formatters';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("umkm_user");
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("umkm_transactions");
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [period, setPeriod] = useState("30d");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("umkm_user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("umkm_transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (newTx) => {
    const tx = {
      ...newTx,
      id: Date.now(),
      amount: Number(newTx.amount) || 0,
      date: newTx.date || new Date().toISOString().split("T")[0]
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const resetData = () => {
    setUser(INITIAL_USER);
    setTransactions(INITIAL_TRANSACTIONS);
    localStorage.removeItem("umkm_user");
    localStorage.removeItem("umkm_transactions");
  };

  const metrics = calculateHealthMetrics(transactions, user.initial_cash_balance);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        transactions,
        addTransaction,
        deleteTransaction,
        resetData,
        metrics,
        period,
        setPeriod,
        isAddModalOpen,
        setIsAddModalOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
