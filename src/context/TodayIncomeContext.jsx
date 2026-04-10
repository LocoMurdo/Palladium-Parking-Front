import React, { createContext, useState, useCallback } from 'react';
import { parkingService } from '../services/parkingService';

const TodayIncomeContext = createContext();

export const TodayIncomeProvider = ({ children }) => {
  const [todayIncome, setTodayIncome] = useState(null);
  const [loadingIncome, setLoadingIncome] = useState(false);

  const refreshTodayIncome = useCallback(async () => {
    setLoadingIncome(true);
    try {
      const data = await parkingService.getTodayIncome();
      setTodayIncome(data);
    } catch (err) {
      console.error('Error fetching today income:', err);
    } finally {
      setLoadingIncome(false);
    }
  }, []);

  const value = {
    todayIncome,
    loadingIncome,
    refreshTodayIncome,
  };

  return (
    <TodayIncomeContext.Provider value={value}>
      {children}
    </TodayIncomeContext.Provider>
  );
};

export default TodayIncomeContext;
