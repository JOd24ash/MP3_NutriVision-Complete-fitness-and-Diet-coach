import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';

/**
 * Custom hook to fetch daily nutrition summary
 * Returns consumed vs target macros with real-time updates
 */
export const useDailyNutrition = () => {
  const { user, profileRefreshTrigger } = useApp();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      setSummary(null);
      setLoading(false);
      return;
    }

    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await api.fitness.summary(user.id);
        setSummary(data);
      } catch (err) {
        setError(err.message);
        // Provide fallback data structure
        setSummary({
          consumed: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
          target: { calories: 2000, protein_g: 80, carbs_g: 250, fat_g: 65 }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [user?.id, profileRefreshTrigger]);

  // Calculate remaining macros
  const remaining = summary ? {
    calories: Math.max(0, (summary.target?.calories || 0) - (summary.consumed?.calories || 0)),
    protein_g: Math.max(0, (summary.target?.protein_g || 0) - (summary.consumed?.protein_g || 0)),
    carbs_g: Math.max(0, (summary.target?.carbs_g || 0) - (summary.consumed?.carbs_g || 0)),
    fat_g: Math.max(0, (summary.target?.fat_g || 0) - (summary.consumed?.fat_g || 0))
  } : null;

  // Calculate percentages
  const percentages = summary ? {
    calories: summary.target?.calories ? Math.round((summary.consumed?.calories || 0) / summary.target.calories * 100) : 0,
    protein: summary.target?.protein_g ? Math.round((summary.consumed?.protein_g || 0) / summary.target.protein_g * 100) : 0,
    carbs: summary.target?.carbs_g ? Math.round((summary.consumed?.carbs_g || 0) / summary.target.carbs_g * 100) : 0,
    fat: summary.target?.fat_g ? Math.round((summary.consumed?.fat_g || 0) / summary.target.fat_g * 100) : 0
  } : null;

  return { summary, remaining, percentages, loading, error };
};
