import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getStoredUser, checkBackendStatus, setStoredUser } from '../api/client';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  // Current meal being inspected / logged
  const [activeMeal, setActiveMeal] = useState({ meal_log_id: null, plate_image: '', plate_name: '', items: [], total: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 } });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Poll / check backend once on mount
  useEffect(() => {
    const probe = async () => {
      const online = await checkBackendStatus();
      setIsBackendOnline(online);
      setIsLiveMode(online);
    };
    probe();
  }, []);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const updateUserProfile = async (updatedData) => {
    try {
      const saved = await api.profile.update(user.id, updatedData);
      setUser(saved);
      setStoredUser(saved);
      showToast('Medical profile updated successfully', 'success');
      return saved;
    } catch (err) {
      showToast('Failed to update profile: ' + err.message, 'danger');
    }
  };

  const authenticate = async (mode, values) => {
    const result = mode === 'signup'
      ? await api.auth.signup(values.name, values.email, values.password)
      : await api.auth.login(values.email, values.password);
    setUser(result.user);
    return result;
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
    setActiveMeal({ meal_log_id: null, plate_image: '', plate_name: '', items: [], total: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 } });
  };

  // Recalculate totals whenever items in activeMeal are edited
  const updateActiveMealItems = (newItems) => {
    const okItems = newItems.filter(i => i.calories !== null && i.calories !== undefined);
    const total = {
      calories: Math.round(okItems.reduce((acc, i) => acc + (i.calories || 0), 0)),
      protein_g: Math.round(okItems.reduce((acc, i) => acc + (i.protein_g || 0), 0) * 10) / 10,
      carbs_g: Math.round(okItems.reduce((acc, i) => acc + (i.carbs_g || 0), 0) * 10) / 10,
      fat_g: Math.round(okItems.reduce((acc, i) => acc + (i.fat_g || 0), 0) * 10) / 10,
    };
    setActiveMeal(prev => ({
      ...prev,
      items: newItems,
      total
    }));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        authenticate,
        logout,
        updateUserProfile,
        activeTab,
        setActiveTab,
        isBackendOnline,
        isLiveMode,
        setIsLiveMode,
        toasts,
        showToast,
        removeToast,
        activeMeal,
        setActiveMeal,
        updateActiveMealItems,
        isChatOpen,
        setIsChatOpen,
        isProfileModalOpen,
        setIsProfileModalOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
