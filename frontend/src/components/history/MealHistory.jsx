import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { Camera, Mic, Calendar, Flame, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';

export const MealHistory = () => {
  const { user, setActiveMeal, setActiveTab, showToast } = useApp();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSource, setFilterSource] = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.meals.listHistory(user.id);
        setMeals(data);
      } catch (err) {
        showToast('Failed to load meal history', 'danger');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user.id]);

  const filteredMeals = meals.filter(m => {
    if (filterSource === 'all') return true;
    return m.source === filterSource;
  });

  const handleInspectMeal = (meal) => {
    setActiveMeal({
      meal_log_id: meal.meal_log_id,
      plate_image: meal.items?.[0]?.box ? 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
      plate_name: meal.meal_type || 'Historical Log',
      items: meal.items || [],
      total: meal.total || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
    });
    setActiveTab('scan');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Source Filter */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>Meal Log Timeline</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Complete audit trail of Indian meals logged via Vision & Voice with guardrail checks
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn btn-sm ${filterSource === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterSource('all')}
          >
            All Logs ({meals.length})
          </button>
          <button
            className={`btn btn-sm ${filterSource === 'photo' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterSource('photo')}
          >
            <Camera size={13} />
            <span>Photo ({meals.filter(m => m.source === 'photo').length})</span>
          </button>
          <button
            className={`btn btn-sm ${filterSource === 'voice' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterSource('voice')}
          >
            <Mic size={13} />
            <span>Voice ({meals.filter(m => m.source === 'voice').length})</span>
          </button>
        </div>
      </div>

      {/* Meals Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredMeals.length === 0 ? (
          <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No meal logs found matching filter.
          </div>
        ) : (
          filteredMeals.map((meal) => {
            const date = new Date(meal.logged_at);
            const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateFormatted = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
            const hasWarnings = meal.items?.some(i => i.guardrail_status === 'warn' || i.guardrail_status === 'block');

            return (
              <div
                key={meal.meal_log_id}
                className="glass-panel glass-panel-interactive"
                onClick={() => handleInspectMeal(meal)}
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                {/* Left: Source Icon & Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: meal.source === 'photo' 
                      ? 'rgba(16, 185, 129, 0.15)' 
                      : 'rgba(245, 158, 11, 0.15)',
                    color: meal.source === 'photo' ? 'var(--emerald-400)' : 'var(--saffron-400)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {meal.source === 'photo' ? <Camera size={22} /> : <Mic size={22} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                        {meal.meal_type || (meal.source === 'photo' ? 'Thali Plate' : 'Voice Meal')}
                      </span>
                      <span className={`badge ${meal.source === 'photo' ? 'badge-success' : 'badge-warning'}`}>
                        {meal.source}
                      </span>
                      {hasWarnings ? (
                        <span className="badge badge-warning" style={{ fontSize: '0.68rem' }}>
                          Guardrail Caution
                        </span>
                      ) : (
                        <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>
                          Safe
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {dateFormatted} at {timeFormatted} • {meal.items?.length || 0} items detected
                    </div>
                  </div>
                </div>

                {/* Center: Item labels preview */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '380px' }}>
                  {meal.items?.map((item, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        color: 'var(--text-secondary)',
                        textTransform: 'capitalize'
                      }}
                    >
                      {item.food_label.replace(/_/g, ' ')} ({item.est_grams}g)
                    </span>
                  ))}
                </div>

                {/* Right: Macros & Inspect trigger */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--emerald-400)' }}>
                      {meal.total?.calories || 0} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>kcal</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {meal.total?.protein_g || 0}g P • {meal.total?.carbs_g || 0}g C • {meal.total?.fat_g || 0}g F
                    </div>
                  </div>

                  <ChevronRight size={18} color="var(--text-muted)" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
