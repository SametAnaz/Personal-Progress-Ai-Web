'use client';

import { useState } from 'react';
import { apiClient, PhysiqueData } from '@/lib/api';
import { toast } from './Toast';
import { ProcessingAnimation } from './ProcessingAnimation';
import { Send, Scale, Ruler, User } from 'lucide-react';

export function PhysiqueTracker() {
  const [physiqueData, setPhysiqueData] = useState<PhysiqueData>({
    weight: 0,
    height: 0,
    waist: 0,
    neck: 0,
    hip: 0,
    shoulder: 0,
    chest: 0,
    note: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState<'sending' | 'processing' | 'saving'>('sending');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);

  const measurements = [
    { key: 'weight' as keyof PhysiqueData, label: 'Kilo (kg)', icon: Scale, placeholder: '75' },
    { key: 'height' as keyof PhysiqueData, label: 'Boy (cm)', icon: Ruler, placeholder: '180' },
    { key: 'waist' as keyof PhysiqueData, label: 'Bel (cm)', icon: User, placeholder: '80' },
    { key: 'neck' as keyof PhysiqueData, label: 'Boyun (cm)', icon: User, placeholder: '35' },
    { key: 'hip' as keyof PhysiqueData, label: 'Kalça (cm)', icon: User, placeholder: '100' },
    { key: 'shoulder' as keyof PhysiqueData, label: 'Omuz (cm)', icon: User, placeholder: '110' },
    { key: 'chest' as keyof PhysiqueData, label: 'Göğüs (cm)', icon: User, placeholder: '95' },
  ];

  const handleInputChange = (key: keyof PhysiqueData, value: string) => {
    if (key === 'note') {
      setPhysiqueData(prev => ({ ...prev, [key]: value }));
    } else {
      const numValue = parseFloat(value) || 0;
      setPhysiqueData(prev => ({ ...prev, [key]: numValue }));
    }
  };

  const calculateBMI = () => {
    if (physiqueData.weight > 0 && physiqueData.height > 0) {
      const heightInM = physiqueData.height / 100;
      return (physiqueData.weight / (heightInM * heightInM)).toFixed(1);
    }
    return '0';
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Zayıf', color: 'text-blue-500' };
    if (bmi < 25) return { text: 'Normal', color: 'text-green-500' };
    if (bmi < 30) return { text: 'Fazla Kilolu', color: 'text-yellow-500' };
    return { text: 'Obez', color: 'text-red-500' };
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setMessage(null);
    setProcessingStep('sending');

    try {
      // Step 1: Sending
      setTimeout(() => setProcessingStep('processing'), 500);
      
      // Step 2: Processing (after 1.5 seconds)
      setTimeout(() => setProcessingStep('saving'), 1500);
      
      const response = await apiClient.sendPhysiqueData(physiqueData);
      
      if (response.success) {
        // Hesaplama hatası durumu kontrolü
        if (response.isCalculationError) {
          toast.error(
            'Hesaplama Hatası!', 
            'Girilen verilerle hesaplama yapılamadı. Lütfen verilerinizi kontrol edin.',
            6000
          );
          setMessage({ type: 'error', text: 'Hesaplama aşamasında hata oluştu!' });
        }
        // DB insert durumuna göre farklı toast göster
        else if (response.isDbInsertSuccessful) {
          toast.success(
            'Başarılı!', 
            'Fiziksel ölçüm verileriniz veritabanına kaydedildi.',
            4000
          );
          setMessage({ type: 'success', text: response.message || 'Başarılı!' });
          
          // Reset form after successful submission
          setPhysiqueData({
            weight: 0,
            height: 0,
            waist: 0,
            neck: 0,
            hip: 0,
            shoulder: 0,
            chest: 0,
            note: ''
          });
        } else {
          toast.warning(
            'Uyarı!', 
            'Veriler işlendi ancak veritabanına kaydedilemedi.',
            6000
          );
          setMessage({ type: 'warning', text: 'Veriler işlendi ancak veritabanına kaydedilemedi.' });
        }
      } else {
        toast.error(
          'Hata!', 
          response.message || 'Bir hata oluştu!',
          5000
        );
        setMessage({ type: 'error', text: response.message || 'Bir hata oluştu!' });
      }
    } catch (error) {
      toast.error(
        'Bağlantı Hatası!', 
        'Beklenmeyen bir hata oluştu!',
        5000
      );
      setMessage({ type: 'error', text: 'Beklenmeyen bir hata oluştu!' });
    } finally {
      setIsLoading(false);
    }
  };

  const bmi = parseFloat(calculateBMI());
  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        Fiziksel Ölçüm Takibi
      </h2>

      {/* BMI Display */}
      {physiqueData.weight > 0 && physiqueData.height > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">BMI Hesaplama</h3>
            <div className="flex items-center justify-center gap-4">
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{calculateBMI()}</span>
              <span className={`text-lg font-medium ${bmiCategory.color}`}>
                {bmiCategory.text}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Measurement Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {measurements.map((measurement) => {
          const Icon = measurement.icon;
          
          return (
            <div key={measurement.key} className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Icon size={16} className="text-gray-500" />
                {measurement.label}
              </label>
              <input
                type="number"
                step="0.1"
                value={physiqueData[measurement.key] || ''}
                onChange={(e) => handleInputChange(measurement.key, e.target.value)}
                placeholder={measurement.placeholder}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          );
        })}
      </div>

      {/* Note Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Not (Opsiyonel)
        </label>
        <textarea
          value={physiqueData.note}
          onChange={(e) => handleInputChange('note', e.target.value)}
          placeholder="Ölçümler hakkında not ekleyin..."
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-purple-500 hover:bg-purple-600 text-white'
        }`}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Gönderiliyor...
          </>
        ) : (
          <>
            <Send size={20} />
            Ölçümleri Kaydet
          </>
        )}
      </button>

      {/* Message Display */}
      {message && (
        <div className={`mt-4 p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-400' 
            : message.type === 'warning'
            ? 'bg-yellow-100 border border-yellow-400 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-600 dark:text-yellow-400'
            : 'bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/20 dark:border-red-600 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
        <p className="text-sm text-purple-800 dark:text-purple-400">
          <strong>Format:</strong> -msr {physiqueData.weight},{physiqueData.height},{physiqueData.waist},{physiqueData.neck},{physiqueData.hip},{physiqueData.shoulder},{physiqueData.chest},{physiqueData.note || 'note'}
        </p>
        <p className="text-xs text-purple-600 dark:text-purple-500 mt-1">
          Haftalık ölçüm yapmanız önerilir. Sistem otomatik olarak BMI, yağ oranı ve kas kütlesi hesaplayacaktır.
        </p>
      </div>
    </div>
  );
}
