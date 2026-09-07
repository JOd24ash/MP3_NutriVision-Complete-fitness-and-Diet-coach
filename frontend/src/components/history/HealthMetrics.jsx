import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { Activity, Plus, HeartPulse, Droplet, Scale, Calendar, CheckCircle2 } from 'lucide-react';

export const HealthMetrics = () => {
  const { user, showToast } = useApp();
  const [metrics, setMetrics] = useState([]);
  const [metricType, setMetricType] = useState('blood_glucose');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('mg/dL');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, [user.id]);

  const loadMetrics = async () => {
    try {
      const data = await api.metrics.list(user.id);
      setMetrics(data);
    } catch (e) {
      showToast('Could not load health metrics', 'danger');
    }
  };

  const handleMetricTypeChange = (type) => {
    setMetricType(type);
    if (type === 'blood_glucose') setUnit('mg/dL');
    else if (type === 'blood_pressure_systolic') setUnit('mmHg');
    else if (type === 'weight') setUnit('kg');
    else if (type === 'water_intake') setUnit('ml');
  };

  const handleAddMetric = async (e) => {
    e.preventDefault();
    if (!value) return;

    try {
      await api.metrics.add(user.id, {
        metric_type: metricType,
        value: Number(value),
        unit
      });
      showToast(`Logged ${metricType.replace(/_/g, ' ')}: ${value} ${unit}`, 'success');
      setValue('');
      setIsAdding(false);
      loadMetrics();
    } catch (err) {
      showToast('Failed to add metric', 'danger');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>Health Metrics & Biometrics</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Synchronized with medical guardrail rules (e.g. glucose thresholds for diabetic flags)
          </span>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setIsAdding(!isAdding)}
        >
          <Plus size={16} />
          <span>{isAdding ? 'Close Form' : 'Log New Reading'}</span>
        </button>
      </div>

      {/* Log Form if open */}
      {isAdding && (
        <form 
          onSubmit={handleAddMetric}
          className="glass-panel" 
          style={{ padding: '20px 24px', display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}
        >
          <div className="input-group" style={{ flex: 1, minWidth: '180px' }}>
            <label className="input-label">Biometric Type</label>
            <select 
              value={metricType}
              onChange={(e) => handleMetricTypeChange(e.target.value)}
              className="select-input"
            >
              <option value="blood_glucose">Blood Glucose (mg/dL)</option>
              <option value="blood_pressure_systolic">Blood Pressure Systolic (mmHg)</option>
              <option value="weight">Body Weight (kg)</option>
              <option value="water_intake">Water Intake (ml)</option>
            </select>
          </div>

          <div className="input-group" style={{ flex: 1, minWidth: '120px' }}>
            <label className="input-label">Measured Value</label>
            <input 
              type="number" 
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. 104"
              className="text-input"
              required
            />
          </div>

          <div className="input-group" style={{ width: '90px' }}>
            <label className="input-label">Unit</label>
            <input 
              type="text" 
              value={unit}
              readOnly
              className="text-input"
              style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
            <CheckCircle2 size={16} />
            <span>Record</span>
          </button>
        </form>
      )}

      {/* Metric Cards Grid */}
      <div className="grid-4">
        {/* Glucose */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>FASTING GLUCOSE</span>
            <div style={{ color: 'var(--emerald-400)', background: 'rgba(16, 185, 129, 0.12)', padding: '4px', borderRadius: '6px' }}>
              <Activity size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '4px' }}>
            104 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>mg/dL</span>
          </div>
          <span className="badge badge-success">Optimal Range (&lt;110)</span>
        </div>

        {/* Blood Pressure */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>BLOOD PRESSURE</span>
            <div style={{ color: 'var(--saffron-400)', background: 'rgba(245, 158, 11, 0.12)', padding: '4px', borderRadius: '6px' }}>
              <HeartPulse size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '4px' }}>
            122/80 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>mmHg</span>
          </div>
          <span className="badge badge-warning">Pre-hypertension</span>
        </div>

        {/* Weight */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>BODY WEIGHT</span>
            <div style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', padding: '4px', borderRadius: '6px' }}>
              <Scale size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '4px' }}>
            74.2 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>kg</span>
          </div>
          <span className="badge badge-success">-0.3 kg this week</span>
        </div>

        {/* Hydration */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>HYDRATION</span>
            <div style={{ color: '#06b6d4', background: 'rgba(6, 182, 212, 0.12)', padding: '4px', borderRadius: '6px' }}>
              <Droplet size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '4px' }}>
            2,400 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ml</span>
          </div>
          <span className="badge badge-success">80% of 3L goal</span>
        </div>
      </div>

      {/* Recent Log Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Recorded Readings Log</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {metrics.map((m) => {
            const date = new Date(m.recorded_at);
            return (
              <div 
                key={m.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <strong style={{ textTransform: 'capitalize', fontSize: '0.92rem' }}>
                    {m.metric_type.replace(/_/g, ' ')}
                  </strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {m.value} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
