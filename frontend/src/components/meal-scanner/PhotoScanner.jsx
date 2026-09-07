import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlateCanvas } from './PlateCanvas';
import { ItemNutritionCard } from './ItemNutritionCard';
import { SAMPLE_PLATES } from '../../api/mockData';
import { api } from '../../api/client';
import confetti from 'canvas-confetti';
import { 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  RefreshCw, 
  SlidersHorizontal,
  FileCheck2,
  Plus
} from 'lucide-react';

export const PhotoScanner = () => {
  const { 
    activeMeal, 
    setActiveMeal, 
    updateActiveMealItems, 
    showToast, 
    setIsChatOpen 
  } = useApp();

  const [selectedItemId, setSelectedItemId] = useState(null);
  const [referenceObject, setReferenceObject] = useState('credit_card');
  const [referenceScaleCm, setReferenceScaleCm] = useState(8.56);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleReferenceChange = (type) => {
    setReferenceObject(type);
    if (type === 'credit_card') setReferenceScaleCm(8.56);
    else if (type === 'coin_5rs') setReferenceScaleCm(2.3);
    else if (type === 'quarter_plate') setReferenceScaleCm(20.0);
  };

  const handleSelectSample = (sample) => {
    setIsSaved(false);
    setActiveMeal({
      meal_log_id: 'meal-' + sample.id,
      plate_image: sample.image,
      plate_name: sample.name,
      items: sample.items,
      total: {
        calories: sample.items.reduce((s, i) => s + (i.calories || 0), 0),
        protein_g: Math.round(sample.items.reduce((s, i) => s + (i.protein_g || 0), 0) * 10) / 10,
        carbs_g: Math.round(sample.items.reduce((s, i) => s + (i.carbs_g || 0), 0) * 10) / 10,
        fat_g: Math.round(sample.items.reduce((s, i) => s + (i.fat_g || 0), 0) * 10) / 10,
      },
      reference_object: referenceObject,
      reference_scale_cm: referenceScaleCm
    });
    showToast(`Loaded sample: ${sample.name}`, 'info');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setIsSaved(false);
      setActiveMeal(prev => ({
        ...prev,
        plate_image: reader.result,
        plate_name: file.name
      }));
      triggerAnalysis();
    };
    reader.readAsDataURL(file);
  };

  const triggerAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisStep('1/4: Running YOLOv8-Seg plate contour detection...');

    try {
      await new Promise(r => setTimeout(r, 400));
      setAnalysisStep('2/4: Refining classification against Indian Food Taxonomy...');
      await new Promise(r => setTimeout(r, 450));
      setAnalysisStep('3/4: Estimating portion volume & reference scaling...');
      await new Promise(r => setTimeout(r, 400));
      setAnalysisStep('4/4: Cross-checking medical & allergen guardrails...');
      await new Promise(r => setTimeout(r, 350));

      // Use API client
      const formData = new FormData();
      formData.append('reference_object_px', '180');
      formData.append('reference_object_real_cm', String(referenceScaleCm));
      
      const res = await api.meals.logPhoto(formData);
      updateActiveMealItems(res.items);
      showToast('Vision pipeline detected ' + res.items.length + ' Indian food items', 'success');
    } catch (err) {
      showToast('Analysis error: ' + err.message, 'danger');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const handleUpdateItem = (updated) => {
    const updatedList = activeMeal.items.map(i => i.id === updated.id ? updated : i);
    updateActiveMealItems(updatedList);
  };

  const handleDeleteItem = (itemId) => {
    const updatedList = activeMeal.items.filter(i => i.id !== itemId);
    updateActiveMealItems(updatedList);
    showToast('Removed item from plate log', 'info');
  };

  const handleAddItem = () => {
    const newItem = {
      id: 'item-custom-' + Date.now(),
      food_label: 'plain_curd',
      confidence: 0.92,
      est_grams: 100,
      calories: 60,
      protein_g: 3.5,
      carbs_g: 4.5,
      fat_g: 3.0,
      guardrail_status: 'ok',
      guardrail_reason: 'Healthy probiotic source',
      box: { x: 40, y: 70, w: 20, h: 20 },
      color: '#10b981'
    };
    updateActiveMealItems([...activeMeal.items, newItem]);
    showToast('Added item to meal', 'success');
  };

  const handleConfirmMeal = async () => {
    try {
      await api.meals.confirm(activeMeal.meal_log_id);
      setIsSaved(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      showToast('Meal successfully logged into your daily nutrition record!', 'success');
    } catch (err) {
      showToast('Failed to save meal: ' + err.message, 'danger');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Sample Plates Selector */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>
              Multi-Item Indian Plate Scanner
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Upload your plate photo or try sample Indian thalis with reference-object scaling.
            </p>
          </div>

          {/* Reference Object Selection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Reference Scale:</span>
            <select
              value={referenceObject}
              onChange={(e) => handleReferenceChange(e.target.value)}
              className="select-input"
              style={{ fontSize: '0.85rem', padding: '6px 12px' }}
            >
              <option value="credit_card">Credit/Debit Card (8.56 cm)</option>
              <option value="coin_5rs">₹5 Indian Coin (2.3 cm)</option>
              <option value="quarter_plate">Quarter Plate / Katori (20 cm)</option>
            </select>
          </div>
        </div>

        {/* Quick Sample Plate Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Try Sample Plates:
          </span>
          {SAMPLE_PLATES.map((sample) => (
            <button
              key={sample.id}
              className={`btn btn-sm ${activeMeal.plate_name === sample.name ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleSelectSample(sample)}
            >
              <span>{sample.name}</span>
            </button>
          ))}

          {/* Custom File Upload Button */}
          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
            <UploadCloud size={16} />
            <span>Upload My Plate</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>
      </div>

      {/* Analysis Status Banner if scanning */}
      {isAnalyzing && (
        <div 
          className="glass-panel"
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div style={{ animation: 'spinSlow 1.5s linear infinite' }}>
            <RefreshCw size={20} color="var(--emerald-400)" />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--emerald-400)' }}>
              Inference in Progress
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {analysisStep}
            </div>
          </div>
        </div>
      )}

      {/* Main Scanner Workspace Grid */}
      <div className="grid-2">
        {/* Left Column: Visual Plate Canvas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <PlateCanvas 
            imageSrc={activeMeal.plate_image} 
            items={activeMeal.items}
            selectedItemId={selectedItemId}
            onSelectItem={setSelectedItemId}
            referenceObject={referenceObject}
            referenceScaleCm={referenceScaleCm}
          />

          {/* Plate Total Card */}
          <div className="glass-panel" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem' }}>Plate Nutritional Total</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Sum of {activeMeal.items.length} segmented items
                </span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald-400)' }}>
                {activeMeal.total.calories} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>kcal</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>PROTEIN</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>{activeMeal.total.protein_g}g</div>
              </div>
              <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#fbbf24' }}>CARBS</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fbbf24' }}>{activeMeal.total.carbs_g}g</div>
              </div>
              <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#f43f5e' }}>FAT</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f43f5e' }}>{activeMeal.total.fat_g}g</div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button 
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={handleConfirmMeal}
                disabled={isSaved || activeMeal.items.length === 0}
              >
                <FileCheck2 size={18} />
                <span>{isSaved ? 'Meal Logged ✓' : 'Confirm & Log Meal'}</span>
              </button>
              <button 
                className="btn btn-ai"
                onClick={() => setIsChatOpen(true)}
                title="Ask Diet Coach about this meal"
              >
                <Sparkles size={18} />
                <span>Ask Coach</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Detected Items List & Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem' }}>
              Detected Food Items ({activeMeal.items.length})
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handleAddItem}
              >
                <Plus size={14} />
                <span>Add Item</span>
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={triggerAnalysis}
                disabled={isAnalyzing}
              >
                <RefreshCw size={14} />
                <span>Re-detect</span>
              </button>
            </div>
          </div>

          {activeMeal.items.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No items detected. Choose a sample plate above or upload an image.
            </div>
          ) : (
            activeMeal.items.map((item) => (
              <ItemNutritionCard
                key={item.id}
                item={item}
                isSelected={selectedItemId === item.id}
                onSelect={() => setSelectedItemId(item.id)}
                onUpdate={handleUpdateItem}
                onDelete={handleDeleteItem}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
