import React, { createContext, useContext, useState } from 'react';
import { MOCK_USER, MOCK_SAVED_PLACES, WALLET_TRANSACTIONS } from '../data/mockData';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(MOCK_USER);
  const [savedPlaces, setSavedPlaces] = useState(MOCK_SAVED_PLACES);
  const [walletBalance, setWalletBalance] = useState(MOCK_USER.walletBalance);
  const [transactions, setTransactions] = useState(WALLET_TRANSACTIONS);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState({
    type: 'wallet',
    title: 'UrbanRide Wallet',
    detail: `₹${MOCK_USER.walletBalance.toFixed(2)} available`,
  });

  const [preferences, setPreferences] = useState({
    defaultVehicle: 'bike',
    rideInsurance: true,
    quietRide: false,
    acTemperature: 'Normal (22°C)',
    language: 'English',
    notifications: {
      rideUpdates: true,
      promotions: false,
      safetyAlerts: true,
    },
  });

  const updateProfile = (updatedFields) => {
    setUser((prev) => ({ ...prev, ...updatedFields }));
  };

  const addSavedPlace = (newPlace) => {
    setSavedPlaces((prev) => [
      ...prev,
      { id: `place_${Date.now()}`, ...newPlace },
    ]);
  };

  const deleteSavedPlace = (placeId) => {
    setSavedPlaces((prev) => prev.filter((p) => p.id !== placeId));
  };

  const addMoneyToWallet = (amount) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return false;

    setWalletBalance((prev) => {
      const newBal = prev + numericAmount;
      return newBal;
    });

    const newTx = {
      id: `tx_${Date.now()}`,
      type: 'credit',
      title: 'Wallet Top-up (Instant)',
      date: 'Just now',
      amount: numericAmount,
    };
    setTransactions((prev) => [newTx, ...prev]);
    return true;
  };

  const deductWallet = (amount, title) => {
    setWalletBalance((prev) => Math.max(0, prev - amount));
    const newTx = {
      id: `tx_${Date.now()}`,
      type: 'debit',
      title: title || 'Ride Fare Payment',
      date: 'Just now',
      amount: amount,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const updatePreferences = (newPrefs) => {
    setPreferences((prev) => ({ ...prev, ...newPrefs }));
  };

  return (
    <UserContext.Provider
      value={{
        user,
        updateProfile,
        savedPlaces,
        addSavedPlace,
        deleteSavedPlace,
        walletBalance,
        addMoneyToWallet,
        deductWallet,
        transactions,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        preferences,
        updatePreferences,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
