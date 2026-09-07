import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getStoredUser, checkBackendStatus } from '../api/client';
import { SAMPLE_PLATES } from '../api/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false); // Can be toggled
  const [toasts, setToasts] = useState([]);
  
  // Current meal being inspected / logged
  const [activeMeal, setActiveMeal] = useState({
    meal_log_id: 'meal-init',
    plate_image: SAMPLE_PLATES[0].image,
    plate_name: SAMPLE_PLATES[0].name,
    items: SAMPLE_PLATES[0].items,
    total: {
      calories: 740,
      protein_g: 27.5,
      carbs_g: 88.0,
      fat_g: 23.5,
    },
    reference_object: 'credit_card',
    reference_scale_cm: 8.56
  });

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
      showToast('Medical profile updated successfully', 'success');
      return saved;
    } catch (err) {
      showToast('Failed to update profile: ' + err.message, 'danger');
    }
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
