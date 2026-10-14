import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import {
  User,
  Target,
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  Utensils,
  TrendingUp,
  Calendar,
  Camera,
  PlusCircle,
  Mic,
  Scale,
  Ruler,
  Activity,
  Sprout,
  ChevronRight,
  ArrowRight,
  FileDown,
  RefreshCw,
  Minus,
  Plus,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Mifflin-St Jeor Equation for BMR calculation
const calculateBMR = (weightKg, heightCm, age, gender) => {
  if (gender === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
};

// Activity level multipliers
const activityMultipliers = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9
};

// Calculate TDEE (Total Daily Energy Expenditure)
const calculateTDEE = (bmr, activityLevel) => {
  return bmr * (activityMultipliers[activityLevel] || activityMultipliers.moderately_active);
};

// Calculate BMI
const calculateBMI = (weightKg, heightCm) => {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
};

// Get BMI category
const getBMICategory = (bmi) => {
  if (bmi < 18.5) return { label: 'Underweight', color: '#f59e0b' };
  if (bmi < 25) return { label: 'Normal', color: '#10b981' };
  if (bmi < 30) return { label: 'Overweight', color: '#f97316' };
  return { label: 'Obese', color: '#ef4444' };
};

// Health Metrics Card Component
const HealthMetricCard = ({ 
  title, 
  value, 
  unit, 
  icon, 
  color, 
  onClick, 
  description, 
  trend = null,
  isEditing = false,
  editingValue = '',
  onEditChange = () => {},
  onSave = () => {}
}) => {
  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter' && editingValue.trim() !== '') {
      onSave(Number(editingValue));
    }
  };

  return (
    <div 
      className="health-metric-card"
      onClick={onClick}
      style={{
        border: isEditing ? `2px solid ${color}` : '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '20px',
        background: isEditing ? '#fff' : '#f8fafc',
        transition: 'all 0.2s ease',
        cursor: isEditing ? 'default' : 'pointer',
        boxShadow: isEditing 
          ? `0 4px 12px rgba(0,0,0,0.1)` 
          : '0 1px 3px rgba(0,0,0,0.05)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '12px', 
          background: color + '15',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center'
        }}>
          <icon size={20} color={color} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            margin: '0 0 4px 0', 
            fontSize: '0.95rem', 
            fontWeight: '600', 
            color: '#1e293b'
          }}>
            {title}
          </h3>
          {description && (
            <p style={{ 
              margin: '0', 
              fontSize: '0.75rem', 
              color: '#64748b'
            }}>
              {description}
            </p>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="text"
            value={editingValue}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyDown={handleEditKeyDown}
            autoFocus
            style={{
              flex: 1,
              padding: '8px 12px',
              border: `1px solid ${color}`,
              borderRadius: '8px',
              fontSize: '1rem',
              textAlign: 'center'
            }}
          />
          <button
            onClick={() => onSave(Number(editingValue))}
            disabled ={editingValue.trim() === '' || isNaN(editingValue)}
            style={{
              padding: '8px 16px',
              background: color,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
          <button
            onClick={() => onSave(null)} // Cancel edit
            style={{
              padding: '8px 16px',
              background: '#f1f5f9',
              color: '#64748b',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ 
            fontSize: '1.8rem', 
            fontWeight: '800', 
            color: '#1e293b'
          }}>
            {value}{unit}
          </div>
          {trend && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px'
            }}>
              {trend > 0 ? (
                <ArrowRight size={16} color="#10b981" />
              ) : (
                <ArrowRight size={16} color="#ef4444" />
              )}
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: '500', 
                color: trend > 0 ? '#10b981' : '#ef4444'
              }}>
                {Math.abs(trend)}% {trend > 0 ? 'up' : 'down'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Quick Edit Modal for Health Metrics
const QuickEditModal = ({ 
  isOpen, 
  onClose, 
  metricType, 
  currentValue, 
  onSave,
  unit = ''
}) => {
  const [value, setValue] = useState(currentValue.toString());
  
  const handleSave = () => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onSave(numValue);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="quick-edit-modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '16px',
          width: '90%',
          maxWidth: '400px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
            Update {metricType}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              color: '#64748b',
              cursor: 'pointer'
            }}
          >
            <XCircle size={24} />
          </button>
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label 
            style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#1e293b'
            }}
          >
            {metricType} ({unit})
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter value"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: '#f1f5f9',
              color: '#64748b',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={value.trim() === '' || isNaN(parseFloat(value))}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export const HealthMetrics = () => {
  const { user, showToast } = useApp();
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editStates, setEditStates] = useState({
    weight: false,
    bodyFat: false,
    hydration: false
  });
  [editingValues, setEditingValues] = useState({
    weight: '',
    bodyFat: '',
    hydration: ''
  });
  
  // Time range for charts
  const [timeRange, setTimeRange] = useState('7D'); // 7D, 30D, 90D
  
  // Chart data
  const [weightChartData, setWeightChartData] = useState([]);
  const [bodyFatChartData, setBodyFatChartData] = useState([]);
  const [hydrationChartData, setHydrationChartData] = useState([]);

  // Generate sample metrics based on user profile
  const generateSampleMetrics = useCallback(() => {
    if (!user) return [];
    
    const now = new Date();
    const sampleMetrics = [];
    
    // Generate data for the past 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateString = date.toISOString().slice(0, 10);
      
      // Weight: slight variation around user's weight
      const baseWeight = user.weight || 70;
      const weightVariation = (Math.random() - 0.5) * 0.4; // +/- 0.2kg
      sampleMetrics.push({
        id: `weight-${dateString}`,
        type: 'weight',
        value: parseFloat((baseWeight + weightVariation).toFixed(1)),
        unit: 'kg',
        recorded_at: `${dateString}T${Math.floor(Math.random()*24)}:${Math.floor(Math.random()*60)}:${Math.floor(Math.random()*60)}.000Z`
      });
      
      // Body fat: if available, slight variation
      if (user.body_fat_percentage !== null) {
        const baseBodyFat = user.body_fat_percentage;
        const bodyFatVariation = (Math.random() - 0.5) * 1.0; // +/- 0.5%
        sampleMetrics.push({
          id: `bodyfat-${dateString}`,
          type: 'body_fat',
          value: parseFloat((baseBodyFat + bodyFatVariation).toFixed(1)),
          unit: '%',
          recorded_at: `${dateString}T${Math.floor(Math.random()*24)}:${Math.floor(Math.random()*60)}:${Math.floor(Math.random()*60)}.000Z`
        });
      }
      
      // Hydration: random between 1500-3000ml
      const hydration = Math.floor(Math.random() * 1500) + 1500;
      sampleMetrics.push({
        id: `hydration-${dateString}`,
        type: 'hydration',
        value: hydration,
        unit: 'ml',
        recorded_at: `${dateString}T${Math.floor(Math.random()*24)}:${Math.floor(Math.random()*60)}:${Math.floor(Math.random()*60)}.000Z`
      });
    }
    
    return sampleMetrics;
  }, [user]);

  // Fetch health metrics
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        let data = [];
        try {
          data = await api.metrics.list(user.id);
        } catch (apiError) {
          // If API fails, we'll generate sample data below
          console.warn('API call failed, generating sample data:', apiError.message);
        }
        
        // If we got no data from API, generate sample data based on user profile
        if (!data || data.length === 0) {
          data = generateSampleMetrics();
          if (showToast) {
            showToast('Using sample data based on your profile', 'info');
          }
        }
        
        setMetrics(data);
        
        // Process data for charts
        const sortedByDate = [...data].sort((a, b) => 
          new Date(a.recorded_at) - new Date(b.recorded_at)
        );
        
        // Filter by time range
        const now = new Date();
        let filteredData = sortedByDate;
        
        if (timeRange === '7D') {
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          filteredData = sortedByDate.filter(item => 
            new Date(item.recorded_at) >= weekAgo
          );
        } else if (timeRange === '30D') {
          const monthAgo = new Date(now);
          monthAgo.setMonth(now.getMonth() - 1);
          filteredData = sortedByDate.filter(item => 
            new Date(item.recorded_at) >= monthAgo
          );
        } else if (timeRange === '90D') {
          const threeMonthsAgo = new Date(now);
          threeMonthsAgo.setMonth(now.getMonth() - 3);
          filteredData = sortedByDate.filter(item => 
            new Date(item.recorded_at) >= threeMonthsAgo
          );
        }
        
        // Prepare chart data
        const weightData = filteredData
          .filter(item => item.type === 'weight' && item.value !== null)
          .map(item => ({
            date: new Date(item.recorded_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            }),
            weight: item.value
          }));
          
        const bodyFatData = filteredData
          .filter(item => item.type === 'body_fat' && item.value !== null)
          .map(item => ({
            date: new Date(item.recorded_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            }),
            bodyFat: item.value
          }));
          
        const hydrationData = filteredData
          .filter(item => item.type === 'hydration' && item.value !== null)
          .map(item => ({
            date: new Date(item.recorded_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            }),
            hydration: item.value
          }));
        
        setWeightChartData(weightData);
        setBodyFatChartData(bodyFatData);
        setHydrationChartData(hydrationData);
      } catch (error) {
        showToast('Failed to load health metrics: ' + error.message, 'error');
        // Even if processing fails, try to show sample data for the cards
        try {
          const sampleData = generateSampleMetrics();
          setMetrics(sampleData);
        } catch (sampleError) {
          console.error('Failed to generate sample data:', sampleError);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetrics();
  }, [user?.id, timeRange, generateSampleMetrics]);

  // Handle saving metric updates
  const handleSaveMetric = async (type, value) => {
    try {
      await api.metrics.add(user.id, {
        type,
        value,
        unit: type === 'weight' ? 'kg' : 
               type === 'body_fat' ? '%' : 
               type === 'hydration' ? 'ml' : ''
      });
      
      // Update local state optimistically
      setMetrics(prev => {
        const updatedMetrics = [...prev];
        // Remove any existing metrics of this type for today (simplified)
        const today = new Date().toISOString().slice(0, 10);
        const filtered = updatedMetrics.filter(item => 
          !(item.type === type && item.recorded_at.startsWith(today))
        );
        return [
          ...filtered,
          {
            id: Date.now(), // temporary ID
            type,
            value,
            unit: type === 'weight' ? 'kg' : 
                   type === 'body_fat' ? '%' : 
                   type === 'hydration' ? 'ml' : '',
            recorded_at: new Date().toISOString()
          }
        ];
      });
      
      showToast(`${type} updated successfully!`, 'success');
    } catch (error) {
      showToast(`Failed to update ${type}: ${error.message}`, 'error');
    }
  };

  // Calculate BMI and health status
  const bmi = useMemo(() => {
    if (!user) return null;
    const weight = user.weight || 0;
    const height = user.height || 0;
    if (weight > 0 && height > 0) {
      return calculateBMI(weight, height);
    }
    return null;
  }, [user]);

  const bmiCategory = useMemo(() => {
    if (bmi === null) return { label: 'Unknown', color: '#64748b' };
    return getBMICategory(bmi);
  }, [bmi]);

  // Calculate daily targets based on user profile
  const dailyTargets = useMemo(() => {
    if (!user) return null;
    
    const weight = user.weight || 70; // default 70kg
    const height = user.height || 170; // default 170cm
    const age = user.age || 30; // default 30 years
    const gender = user.gender || 'male'; // default male
    const activityLevel = user.activity_level || 'moderately_active';
    
    const bmr = calculateBMR(weight, height, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    
    // Adjust based on health goal
    let calorieTarget = tdee;
    if (user.health_goal === 'lose') {
      calorieTarget = tdee - 500; // deficit for weight loss
    } else if (user.health_goal === 'gain') {
      calorieTarget = tdee + 500; // surplus for weight gain
    }
    
    // Standard macro split (can be customized based on goals)
    const proteinTarget = (calorieTarget * 0.3) / 4; // 30% from protein
    const carbsTarget = (calorieTarget * 0.4) / 4; // 40% from carbs
    const fatTarget = (calorieTarget * 0.3) / 9; // 30% from fat
    
    return {
      calories: Math.round(calorieTarget),
      protein: Math.round(proteinTarget),
      carbs: Math.round(carbsTarget),
      fat: Math.round(fatTarget)
    };
  }, [user]);

  // Get today's consumed metrics from summary (would come from API in real app)
  const [consumed, setConsumed] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    weight: null,
    bodyFat: null,
    hydration: 0
  });

  // In a real app, this would come from the fitness summary API
  // For now, we'll simulate with some default values
  useEffect(() => {
    // Simulate fetching today's consumption
    setConsumed({
      calories: Math.floor(Math.random() * 1500) + 500, // 500-2000 kcal
      protein: Math.floor(Math.random() * 80) + 30, // 30-110g
      carbs: Math.floor(Math.random() * 200) + 50, // 50-250g
      fat: Math.floor(Math.random() * 70) + 20, // 20-90g
      weight: user?.weight || null,
      bodyFat: user?.body_fat_percentage || null,
      hydration: Math.floor(Math.random() * 2000) + 500 // 500-2500ml
    });
  }, [user]);

  // Calculate remaining macros
  const remaining = useMemo(() => {
    if (!dailyTargets) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    return {
      calories: Math.max(0, dailyTargets.calories - consumed.calories),
      protein: Math.max(0, dailyTargets.protein - consumed.protein),
      carbs: Math.max(0, dailyTargets.carbs - consumed.carbs),
      fat: Math.max(0, dailyTargets.fat - consumed.fat)
    };
  }, [dailyTargets, consumed]);

  // Handle edit state toggling
  const toggleEdit = (type) => {
    setEditStates(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    
    if (!editStates[type]) {
      // When starting to edit, set the current value
      let currentValue = '';
      switch(type) {
        case 'weight':
          currentValue = user?.weight?.toString() || '';
          break;
        case 'bodyFat':
          currentValue = user?.body_fat_percentage?.toString() || '';
          break;
        case 'hydration':
          // For hydration, we'd get today's total from metrics
          const today = new Date().toISOString().slice(0, 10);
          const todayMetrics = metrics.filter(m => 
            m.type === 'hydration' && 
            m.recorded_at.startsWith(today)
          );
          const totalHydration = todayMetrics.reduce((sum, m) => sum + m.value, 0);
          currentValue = totalHydration.toString() || '';
          break;
      }
      setEditingValues(prev => ({
        ...prev,
        [type]: currentValue
      }));
    }
  };

  const handleEditChange = (type, value) => {
    setEditingValues(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleSaveEdit = (type) => {
    const valueStr = editingValues[type];
    const valueNum = parseFloat(valueStr);
    
    if (!isNaN(valueNum)) {
      switch(type) {
        case 'weight':
          handleSaveMetric('weight', valueNum);
          break;
        case 'bodyFat':
          handleSaveMetric('body_fat', valueNum);
          break;
        case 'hydration':
          // For hydration, we add the amount consumed today
          handleSaveMetric('hydration', valueNum);
          break;
      }
    }
    
    toggleEdit(type); // Exit edit mode
  };

  // Calculate trends (simplified - would compare to previous period in real app)
  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="health-metrics-page" style={{ padding: '20px' }}>
      {/* Quick Edit Modals */}
      {editStates.weight && (
        <QuickEditModal
          isOpen={editStates.weight}
          onClose={() => toggleEdit('weight')}
          metricType="Weight"
          currentValue={user?.weight || 0}
          onSave={(value) => handleSaveEdit('weight')}
          unit="kg"
        />
      )}
      
      {editStates.bodyFat && (
        <QuickEditModal
          isOpen={editStates.bodyFat}
          onClose={() => toggleEdit('bodyFat')}
          metricType="Body Fat"
          currentValue={user?.body_fat_percentage || 0}
          onSave={(value) => handleSaveEdit('bodyFat')}
          unit="%"
        />
      )}
      
      {editStates.hydration && (
        <QuickEditModal
          isOpen={editStates.hydration}
          onClose={() => toggleEdit('hydration')}
          metricType="Water Intake"
          currentValue={0} // Would be today's total
          onSave={(value) => handleSaveEdit('hydration')}
          unit="ml"
        />
      )}

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        
        {/* Weight Card */}
        <HealthMetricCard
          title="Weight"
          value={user?.weight || '--'}
          unit="kg"
          icon={Scale}
          color="#10b981"
          onClick={() => toggleEdit('weight')}
          description="Track your weight progress"
          trend={user?.weight ? calculateTrend(user.weight, user.weight - 1) : 0} // Example trend
          isEditing={editStates.weight}
          editingValue={editingValues.weight}
          onEditChange={(value) => handleEditChange('weight', value)}
          onSave={() => handleSaveEdit('weight')}
        />

        {/* Body Fat Card */}
        <HealthMetricCard
          title="Body Fat"
          value={user?.body_fat_percentage !== null ? `${user.body_fat_percentage}%` : '--'}
          unit=""
          icon={Droplet}
          color="#f97316"
          onClick={() => toggleEdit('bodyFat')}
          description="Monitor your body composition"
          trend={user?.body_fat_percentage ? calculateTrend(user.body_fat_percentage, user.body_fat_percentage - 0.5) : 0} // Example trend
          isEditing={editStates.bodyFat}
          editingValue={editingValues.bodyFat}
          onEditChange={(value) => handleEditChange('bodyFat', value)}
          onSave={() => handleSaveEdit('bodyFat')}
        />

        {/* Hydration Card */}
        <HealthMetricCard
          title="Water Intake"
          value={consumed.hydration}
          unit="ml"
          icon={Activity}
          color="#3b82f6"
          onClick={() => toggleEdit('hydration')}
          description="Daily water consumption goal: 3000ml"
          trend={calculateTrend(consumed.hydration, 2000)} // Example trend vs yesterday
          isEditing={editStates.hydration}
          editingValue={editingValues.hydration}
          onEditChange={(value) => handleEditChange('hydration', value)}
          onSave={() => handleSaveEdit('hydration')}
        />

        {/* BMI Card */}
        <HealthMetricCard
          title="BMI"
          value={bmi !== null ? bmi.toFixed(1) : '--'}
          unit=""
          icon={Activity}
          color={bmiCategory.color}
          onClick={() => {
            // BMI is derived from weight/height, so clicking opens weight/edit
            toggleEdit('weight');
          }}
          description={bmiCategory.label}
          isEditing={false}
        />

      </div>

      {/* Charts Section */}
      <div style={{ marginTop: '30px' }}>
        <h2 style={{ 
          marginBottom: '20px', 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: '#1e293b'
        }}>
          Health Trends
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '16px'
        }}>
          <span style={{ 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: '#64748b'
          }}>
            Time Range:
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[ 
              { label: '7D', value: '7D' },
              { label: '30D', value: '30D' },
              { label: '90D', value: '90D' }
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setTimeRange(value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: timeRange === value ? `2px solid #3b82f6` : '1px solid #e2e8f0',
                  background: timeRange === value ? '#3b82f6' : 'white',
                  color: timeRange === value ? 'white' : '#64748b',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Weight Trend Chart */}
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '20px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#1e293b'
          }}>
            Weight Trend
          </div>
          
          {/* In a real app, we would render a Recharts LineChart here */}
          {/* For now, we'll show a placeholder */}
          <div style={{ 
            height: '200px', 
            background: '#f8fafc', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            fontSize: '0.875rem'
          }}>
            Weight Chart (Recharts would go here)
            <br />
            Showing: {weightChartData.length} data points
          </div>
        </div>

        {/* Body Fat Trend Chart */}
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '20px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#1e293b'
          }}>
            Body Fat Trend
          </div>
          
          {/* Placeholder for Recharts */}
          <div style={{ 
            height: '200px', 
            background: '#f8fafc', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            fontSize: '0.875rem'
          }}>
            Body Fat Chart (Recharts would go here)
            <br />
            Showing: {bodyFatChartData.length} data points
          </div>
        </div>
      </div>
    </div>
  );
};