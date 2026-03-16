import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  RATE: '@kiosko_exchange_rate',
  RATE_DATE: '@kiosko_rate_date',
  PRINTER_KITCHEN: '@kiosko_printer_kitchen',
  PRINTER_CASH: '@kiosko_printer_cash',
};

const defaultPrinter = { ip: '', port: '9100' };

export const AppContext = createContext({
  exchangeRate: 36.5,
  setExchangeRate: () => {},
  printerKitchen: defaultPrinter,
  setPrinterKitchen: () => {},
  printerCash: defaultPrinter,
  setPrinterCash: () => {},
  needsRateUpdate: false,
  confirmRateUpdate: () => {},
});

export function AppProvider({ children }) {
  const [exchangeRate, setExchangeRateState] = useState(36.5);
  const [printerKitchen, setPrinterKitchenState] = useState(defaultPrinter);
  const [printerCash, setPrinterCashState] = useState(defaultPrinter);
  const [needsRateUpdate, setNeedsRateUpdate] = useState(false);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const [rate, kitchen, cash] = await Promise.all([
          AsyncStorage.getItem(KEYS.RATE),
          AsyncStorage.getItem(KEYS.PRINTER_KITCHEN),
          AsyncStorage.getItem(KEYS.PRINTER_CASH),
        ]);
        if (rate) setExchangeRateState(parseFloat(rate));
        if (kitchen) setPrinterKitchenState(JSON.parse(kitchen));
        if (cash) setPrinterCashState(JSON.parse(cash));
      } catch (e) {
        console.warn('Error loading settings:', e);
      }
    })();
  }, []);

  // Check if rate needs daily update
  const checkDailyRate = async () => {
    try {
      const lastDate = await AsyncStorage.getItem(KEYS.RATE_DATE);
      const today = new Date().toISOString().split('T')[0];
      if (lastDate !== today) {
        setNeedsRateUpdate(true);
      }
    } catch (e) {
      setNeedsRateUpdate(true);
    }
  };

  const setExchangeRate = async (value) => {
    const numVal = parseFloat(value);
    setExchangeRateState(numVal);
    const today = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem(KEYS.RATE, String(numVal));
    await AsyncStorage.setItem(KEYS.RATE_DATE, today);
  };

  const confirmRateUpdate = () => setNeedsRateUpdate(false);

  const setPrinterKitchen = async (val) => {
    setPrinterKitchenState(val);
    await AsyncStorage.setItem(KEYS.PRINTER_KITCHEN, JSON.stringify(val));
  };

  const setPrinterCash = async (val) => {
    setPrinterCashState(val);
    await AsyncStorage.setItem(KEYS.PRINTER_CASH, JSON.stringify(val));
  };

  return (
    <AppContext.Provider value={{
      exchangeRate, setExchangeRate,
      printerKitchen, setPrinterKitchen,
      printerCash, setPrinterCash,
      needsRateUpdate, checkDailyRate, confirmRateUpdate,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
