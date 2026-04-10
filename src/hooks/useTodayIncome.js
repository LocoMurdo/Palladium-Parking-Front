import React from 'react';
import TodayIncomeContext from '../context/TodayIncomeContext';

export const useTodayIncome = () => {
  const context = React.useContext(TodayIncomeContext);
  if (!context) {
    throw new Error('useTodayIncome must be used within a TodayIncomeProvider');
  }
  return context;
};
