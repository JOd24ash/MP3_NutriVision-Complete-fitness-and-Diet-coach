import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';

/**
 * Custom hook to fetch and manage health metrics (weight, water, body fat, etc.)
 * Supports time range filtering and automatic data generation if API is unavailable
 */
export const useHealthMetrics = (timeRange = '30D') => {
  const { user, showToast } = useApp();
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate sample metrics based on user profile when API is unavailable
  const generateSampleMetrics = useCallback(() => {
    if (!user) return [];
    
    const now = new Date();
    const sampleMetrics = [];
    const days = timeRange === '7D' ? 7 : timeRange === '30D' ? 30 : 90;
    
    // Generate data for the time range
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateString = date.toISOString();
      
      // Weight: slight variation around user's weight
      const baseWeight = user.weight_kg || user.weight || 70;
      const weightVariation = (Math.random() - 0.5) * 0.4 - (i * 0.02); // Slight downward trend
      sampleMetrics.push({
        id: `weight-${i}`,
        metric_type: 'weight',
        value: parseFloat((baseWeight + weightVariation).toFixed(1)),
        unit: 'kg',
        recorded_at: dateString
      });
      
      // Body fat: if available, slight variation
      if (user.body_fat_percentage !== null && user.body_fat_percentage !== undefined) {
        const baseBodyFat = user.body_fat_percentage;
        const bodyFatVariation = (Math.random() - 0.5) * 0.5 - (i * 0.01);
        sampleMetrics.push({
          id: `bodyfat-${i}`,
          metric_type: 'body_fat',
          value: parseFloat((baseBodyFat + bodyFatVariation).toFixed(1)),
          unit: '%',
          recorded_at: dateString
        });
      }
      
      // Hydration: random between 1500-3500ml
      const hydration = Math.floor(Math.random() * 2000) + 1500;
      sampleMetrics.push({
        id: `water-${i}`,
        metric_type: 'water',
        value: hydration,
        unit: 'ml',
        recorded_at: dateString
      });
    }
    
    return sampleMetrics;
  }, [user, timeRange]);

  // Fetch health metrics
  useEffect(() => {
    if (!user?.id) {
      setMetrics([]);
      setLoading(false);
      return;
    }
    
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let data = [];
        try {
          data = await api.metrics.list(user.id);
        } catch (apiError) {
          console.warn('API call failed, generating sample data:', apiError.message);
          data = generateSampleMetrics();
          if (showToast) {
            showToast('Using sample health data based on your profile', 'info');
          }
        }
        
        // If we got no data from API, generate sample data
        if (!data || data.length === 0) {
          data = generateSampleMetrics();
        }
        
        setMetrics(data);
      } catch (err) {
        setError(err.message);
        const fallbackData = generateSampleMetrics();
        setMetrics(fallbackData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetrics();
  }, [user?.id, timeRange, generateSampleMetrics, showToast]);

  // Filter metrics by time range
  const filteredMetrics = useMemo(() => {
    const now = new Date();
    let daysToFilter = 30;
    
    if (timeRange === '7D') daysToFilter = 7;
    else if (timeRange === '30D') daysToFilter = 30;
    else if (timeRange === '90D') daysToFilter = 90;
    
    const cutoffDate = new Date(now);
    cutoffDate.setDate(now.getDate() - daysToFilter);
    
    return metrics.filter(m => new Date(m.recorded_at) >= cutoffDate);
  }, [metrics, timeRange]);

  // Get latest weight
  const latestWeight = useMemo(() => {
    const weightMetrics = metrics
      .filter(m => m.metric_type === 'weight')
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
    return weightMetrics[0]?.value || user?.weight_kg || user?.weight || null;
  }, [metrics, user]);

  // Get today's total hydration
  const todayHydration = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayWater = metrics.filter(m => 
      m.metric_type === 'water' && 
      m.recorded_at.startsWith(today)
    );
    return todayWater.reduce((sum, m) => sum + m.value, 0);
  }, [metrics]);

  // Get latest body fat
  const latestBodyFat = useMemo(() => {
    const bodyFatMetrics = metrics
      .filter(m => m.metric_type === 'body_fat')
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
    return bodyFatMetrics[0]?.value || user?.body_fat_percentage || null;
  }, [metrics, user]);

  // Prepare chart data for weight trend
  const weightChartData = useMemo(() => {
    const weightMetrics = filteredMetrics
      .filter(m => m.metric_type === 'weight')
      .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
    
    return weightMetrics.map(m => ({
      date: new Date(m.recorded_at).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      weight: m.value,
      timestamp: new Date(m.recorded_at).getTime()
    }));
  }, [filteredMetrics]);

  // Add a new metric
  const addMetric = async (metricType, value, unit) => {
    try {
      const newMetric = await api.metrics.add(user.id, {
        metric_type: metricType,
        value,
        unit
      });
      
      setMetrics(prev => [newMetric, ...prev]);
      
      if (showToast) {
        showToast(`${metricType} logged successfully!`, 'success');
      }
      
      return newMetric;
    } catch (err) {
      if (showToast) {
        showToast(`Failed to log ${metricType}: ${err.message}`, 'error');
      }
      throw err;
    }
  };

  // Recent measurements (last 5)
  const recentMeasurements = useMemo(() => {
    return [...metrics]
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at))
      .slice(0, 5)
      .map(m => ({
        id: m.id,
        type: m.metric_type,
        value: m.value,
        unit: m.unit,
        recorded_at: m.recorded_at
      }));
  }, [metrics]);

  return {
    metrics: filteredMetrics,
    allMetrics: metrics,
    loading,
    error,
    latestWeight,
    todayHydration,
    latestBodyFat,
    weightChartData,
    recentMeasurements,
    addMetric
  };
};
