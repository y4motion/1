import React, { useState, useRef } from 'react';
import { X, Tag, ImageIcon, FileText, CheckCircle, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from './constants';
import '../../styles/glassmorphism.css';

const CreateWizard = ({ isMinimalMod, t, categories, onClose, onSuccess }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    condition: 'good',
    location: '',
    accepts_trade: false,
    trade_preferences: '',
    images: [],
    tags: []
  });
  
  const WIZARD_STEPS = [
    { num: 1, icon: Tag, label: t('swap.stepCategory') },
    { num: 2, icon: ImageIcon, label: t('swap.stepPhotos') },
    { num: 3, icon: FileText, label: t('swap.stepDetails') },
    { num: 4, icon: CheckCircle, label: t('swap.stepDone') },
  ];
  
  const aiTips = {
    1: t('swap.aiTip1'),
    2: t('swap.aiTip2'),
    3: t('swap.aiTip3'),
    4: t('swap.aiTip4'),
  };

  const conditionOptions = [
    { value: 'new', label: t('swap.conditionNew') },
    { value: 'like_new', label: t('swap.conditionLikeNew') },
    { value: 'excellent', label: t('swap.conditionExcellent') },
    { value: 'good', label: t('swap.conditionGood') },
    { value: 'fair', label: t('swap.conditionFair') },
    { value: 'parts', label: t('swap.conditionParts') }
  ];

  const handleFileUpload = async (files) => {
    if (uploadedImages.length + files.length > 5) {
      alert(t('swap.maxPhotos'));
      return;
    }
    
    setUploading(true);
    const token = localStorage.getItem('auth_token');
    
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) continue;
      
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      
      try {
        const res = await fetch(`${API_URL}/api/upload/image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formDataUpload
        });
        
        if (res.ok) {
          const data = await res.json();
          setUploadedImages(prev => [...prev, data]);
          setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }));
        }
      } catch (err) {
        console.error('Upload error:', err);
      }
    }
    
    setUploading(false);
  };
  
  const handleSubmit = async () => {
    if (!user) {
      alert('Login to create a listing');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/swap/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          images: formData.images.map((url, i) => ({ url, is_primary: i === 0 }))
        })
      });
      
      if (res.ok) {
        onSuccess();
      } else {
        const err = await res.json();
        alert(err.detail || 'Error creating listing');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <div 
        className="dark-bg w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ borderRadius: isMinimalMod ? '0' : '20px 20px 0 0' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress */}
        <div className="sticky top-0 z-10 p-4 border-b border-white/5 glass">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">{t('swap.newListing')}</h2>
            <button onClick={onClose} className="opacity-50 hover:opacity-100">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {WIZARD_STEPS.map((s, i) => (
              <React.Fragment key={s.num}>
                <div 
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: step >= s.num ? '#8b5cf6' : 'inherit', opacity: step >= s.num ? 1 : 0.3 }}
                >
                  <s.icon size={14} />
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < WIZARD_STEPS.length - 1 && (
                  <div className="flex-1 h-px" style={{ background: step > s.num ? '#8b5cf6' : 'currentColor', opacity: 0.1 }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* AI Tip */}
        <div className="mx-4 mt-4 p-3 flex items-center gap-2 glass" style={{ borderRadius: isMinimalMod ? '0' : '10px', borderColor: 'rgba(139,92,246,0.2)' }}>
          <Sparkles size={14} style={{ color: '#8b5cf6' }} />
          <span className="text-xs opacity-70">{aiTips[step]}</span>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 opacity-70">{t('swap.titleLabel')}</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="RTX 4090 Founders Edition"
                  className="glass w-full px-4 py-3 outline-none"
                  style={{ borderRadius: isMinimalMod ? '0' : '10px' }}
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2 opacity-70">{t('swap.categoryLabel')}</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="glass w-full px-4 py-3 outline-none cursor-pointer"
                  style={{ borderRadius: isMinimalMod ? '0' : '10px' }}
                >
                  <option value="">{t('swap.selectCategory')}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name.ru || cat.name.en}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              <label className="block text-sm mb-2 opacity-70">{t('swap.photos')}</label>
              
              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={async (e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                  if (files.length > 0) await handleFileUpload(files);
                }}
                className="glass border-2 border-dashed p-8 text-center cursor-pointer transition-all hover:bg-white/5"
                style={{ borderRadius: isMinimalMod ? '0' : '12px' }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) await handleFileUpload(files);
                  }}
                />
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    <ImageIcon size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm opacity-50">{t('swap.dragPhotos')}</p>
                    <p className="text-xs mt-1 opacity-30">{t('swap.maxPhotos')}</p>
                  </>
                )}
              </div>
              
              {/* Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {uploadedImages.map((img, i) => (
                    <div 
                      key={i} 
                      className="relative w-20 h-20 overflow-hidden"
                      style={{ 
                        borderRadius: isMinimalMod ? '0' : '8px',
                        border: i === 0 ? '2px solid #8b5cf6' : '2px solid transparent' 
                      }}
                    >
                      <img src={`${API_URL}${img.url}`} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => {
                          setUploadedImages(prev => prev.filter((_, idx) => idx !== i));
                          setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
                        }}
                        className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-black/60 rounded-full text-white text-xs"
                      >
                        ×
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-purple-600/80 text-white text-xs py-0.5 text-center">
                          {t('swap.main')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Or use URL */}
              <div className="relative">
                <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
                <span className="relative px-3 text-xs mx-auto block w-fit opacity-40" style={{ background: 'inherit' }}>
                  {t('swap.orPasteUrl')}
                </span>
              </div>
              
              <input
                type="text"
                placeholder="https://example.com/photo.jpg"
                className="glass w-full px-4 py-3 outline-none text-sm"
                style={{ borderRadius: isMinimalMod ? '0' : '10px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    const url = e.target.value.trim();
                    if (url.startsWith('http')) {
                      setUploadedImages(prev => [...prev, { url }]);
                      setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
                      e.target.value = '';
                    }
                  }
                }}
              />
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-2 opacity-70">{t('swap.priceLabel')}</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="glass w-full px-4 py-3 outline-none"
                    style={{ borderRadius: isMinimalMod ? '0' : '10px' }}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 opacity-70">{t('swap.condition')}</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                    className="glass w-full px-4 py-3 outline-none cursor-pointer"
                    style={{ borderRadius: isMinimalMod ? '0' : '10px' }}
                  >
                    {conditionOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-2 opacity-70">{t('swap.location')}</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Moscow"
                  className="glass w-full px-4 py-3 outline-none"
                  style={{ borderRadius: isMinimalMod ? '0' : '10px' }}
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2 opacity-70">{t('swap.descriptionLabel')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="glass w-full px-4 py-3 outline-none resize-none"
                  style={{ borderRadius: isMinimalMod ? '0' : '10px' }}
                />
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.accepts_trade}
                  onChange={(e) => setFormData(prev => ({ ...prev, accepts_trade: e.target.checked }))}
                />
                <span className="text-sm opacity-70">{t('swap.openToTrade')}</span>
              </label>
            </div>
          )}
          
          {step === 4 && (
            <div className="text-center py-8">
              <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
              <h3 className="text-lg font-medium mb-2">{t('swap.allSet')}</h3>
              <p className="text-sm opacity-50">{t('swap.clickPublish')}</p>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="sticky bottom-0 p-4 border-t border-white/5 flex gap-3 glass">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-5 py-2.5 text-sm opacity-60"
            >
              {t('swap.back')}
            </button>
          )}
          <div className="flex-1" />
          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && (!formData.title || !formData.category)}
              className="px-6 py-2.5 text-sm font-medium transition-all disabled:opacity-30"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                borderRadius: isMinimalMod ? '0' : '10px',
                color: '#fff'
              }}
            >
              {t('swap.next')}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-medium transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                borderRadius: isMinimalMod ? '0' : '10px',
                color: '#fff'
              }}
            >
              {isSubmitting ? '...' : t('swap.publish')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateWizard;
