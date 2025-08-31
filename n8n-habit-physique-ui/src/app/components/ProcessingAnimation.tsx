'use client';

import { Database, CheckCircle, Clock } from 'lucide-react';

interface ProcessingAnimationProps {
  step: 'sending' | 'processing' | 'saving';
}

export function ProcessingAnimation({ step }: ProcessingAnimationProps) {
  const steps = [
    { id: 'sending', label: 'Veriler gönderiliyor...', icon: Clock },
    { id: 'processing', label: 'İşleniyor...', icon: Database },
    { id: 'saving', label: 'Veritabanına kaydediliyor...', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-blue-200 dark:border-blue-700">
      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="w-16 h-16 border-4 border-blue-100 dark:border-blue-900 rounded-full animate-spin">
            <div className="w-full h-full border-t-4 border-blue-500 rounded-full animate-pulse"></div>
          </div>
          
          {/* Inner icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Database className="text-blue-500 animate-bounce" size={24} />
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="space-y-3">
        {steps.map((stepItem, index) => {
          const Icon = stepItem.icon;
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          
          return (
            <div
              key={stepItem.id}
              className={`flex items-center gap-3 p-2 rounded transition-all duration-300 ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                  : isCompleted
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-400 dark:text-gray-600'
              }`}
            >
              <div className={`transition-all duration-300 ${
                isActive ? 'animate-pulse' : ''
              }`}>
                <Icon size={20} />
              </div>
              
              <span className="text-sm font-medium">
                {stepItem.label}
              </span>
              
              {isCompleted && (
                <CheckCircle className="text-green-500 ml-auto animate-in zoom-in" size={16} />
              )}
              
              {isActive && (
                <div className="ml-auto">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          {currentStepIndex + 1} / {steps.length} adım tamamlandı
        </p>
      </div>
    </div>
  );
}
