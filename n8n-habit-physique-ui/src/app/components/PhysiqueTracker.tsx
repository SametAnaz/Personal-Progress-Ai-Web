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
  const [processingStep, setProcessingStep] = useState<'sending' | 'processing' | 'saving' | 'ai-analysis' | 'chart-generation'>('sending');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [chartUrl, setChartUrl] = useState<string>('');
  const [loadingMessages, setLoadingMessages] = useState<string[]>([]);

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
    setAiResponse('');
    setChartUrl('');
    setLoadingMessages([]);
    setProcessingStep('sending');

    try {
      // Step 1: Veriler gönderiliyor
      setLoadingMessages(['📤 Fiziksel ölçüm verileri gönderiliyor...']);
      
      // Step 2: İşleniyor (1 saniye sonra)
      setTimeout(() => {
        setProcessingStep('processing');
        setLoadingMessages(prev => [...prev, '⚙️ Veriler işleniyor...']);
      }, 1000);
      
      // Step 3: Veritabanına kaydediliyor (2 saniye sonra)
      setTimeout(() => {
        setProcessingStep('saving');
        setLoadingMessages(prev => [...prev, '💾 Veritabanına kaydediliyor...']);
      }, 2000);
      
      // Step 4: AI analizi (3 saniye sonra)
      setTimeout(() => {
        setProcessingStep('ai-analysis');
        setLoadingMessages(prev => [...prev, '🤖 Abidin verileri analiz ediyor...']);
      }, 3000);
      
      // Step 5: Grafik oluşturuluyor (4 saniye sonra)
      setTimeout(() => {
        setProcessingStep('chart-generation');
        setLoadingMessages(prev => [...prev, '📊 İlerleme grafiği oluşturuluyor...']);
      }, 4000);
      
      // Tek API çağrısı - hem AI yorumu hem grafik
      const response = await apiClient.sendPhysiqueData(physiqueData);
      
      console.log('PhysiqueTracker Response:', response);
      
      if (response.success) {
        // AI yorumu ve grafik set et
        if (response.response) {
          setAiResponse(response.response);
          setLoadingMessages(prev => [...prev, '✅ AI yorumu alındı!']);
        }
        
        if (response.chartUrl) {
          setChartUrl(response.chartUrl);
          setLoadingMessages(prev => [...prev, '📈 Grafik hazır!']);
        }
        
        toast.success(
          'Başarılı!', 
          'Fiziksel ölçüm verileriniz başarıyla işlendi.',
          4000
        );
        setMessage({ type: 'success', text: response.message || 'Başarılı!' });
        
        // Form sıfırla
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
      setTimeout(() => {
        setIsLoading(false);
      }, 7000); // 7 saniye sonra loading'i kapat
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

      {/* Processing Animation */}
      {isLoading && (
        <div className="mt-6">
          <ProcessingAnimation step={processingStep} />
          
          {/* Live Loading Messages */}
          {loadingMessages.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-400 mb-2">🔄 İşlem Durumu</h4>
              <div className="space-y-2">
                {loadingMessages.map((msg, index) => (
                  <div key={index} className="flex items-center text-blue-700 dark:text-blue-300">
                    <span className="mr-2">•</span>
                    <span>{msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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

      {/* AI Response */}
      {aiResponse && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400 mb-2">🤖 Abidin'in Yorumu</h3>
          <p className="text-blue-700 dark:text-blue-300 whitespace-pre-wrap">{aiResponse}</p>
        </div>
      )}

      {/* Chart */}
      {chartUrl && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-3">📊 Haftalık İlerleme Grafiği</h3>
          <div className="flex justify-center">
            <img 
              src={chartUrl} 
              alt="Physique Progress Chart" 
              className="max-w-full h-auto rounded-lg shadow-md"
              onError={(e) => {
                console.error('Chart image failed to load:', chartUrl);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

      {/* Demo Test Butonu - Test amaçlı */}
      {!aiResponse && !chartUrl && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-400 mb-2">📋 Test Alanı</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Ölçümlerinizi girdikten sonra "Ölçümleri Kaydet" butonuna basarak AI yorumunu ve haftalık grafiği görebilirsiniz.
          </p>
          <button
            onClick={() => {
              // Demo AI response
              setAiResponse("Kanka bak BMI'n 23.2 çıkmış, gayet normal aralıkta duruyorsun. Yağ oranın %15 civarı kas kütlen de 60kg falan, idare eder işte. Fazla kasma kendini ama düzenli sporu ihmal etme ha!");
              // Demo chart URL (QuickChart örneği)
              setChartUrl("https://quickchart.io/chart?c={type:'line',data:{labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],datasets:[{label:'Weight',data:[70,71,70.5,72,71.5,71,70.8],borderColor:'blue',fill:false}]},options:{plugins:{title:{display:true,text:'Weekly Progress'}}}}");
            }}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            🧪 Demo Görünümü Göster
          </button>
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
