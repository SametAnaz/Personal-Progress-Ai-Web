'use client';

import { useState } from 'react';
import { apiClient, HabitData } from '@/lib/api';
import { CheckCircle, XCircle, Send, BookOpen, Code, Dumbbell, Users } from 'lucide-react';

export function HabitTracker() {
  const [habitData, setHabitData] = useState<HabitData>({
    study: 0,
    project: 0,
    sport: 0,
    social: 0,
    note: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const habits = [
    { key: 'study' as keyof HabitData, label: 'Çalışma', icon: BookOpen, color: 'text-blue-500' },
    { key: 'project' as keyof HabitData, label: 'Proje', icon: Code, color: 'text-green-500' },
    { key: 'sport' as keyof HabitData, label: 'Spor', icon: Dumbbell, color: 'text-red-500' },
    { key: 'social' as keyof HabitData, label: 'Sosyal', icon: Users, color: 'text-purple-500' },
  ];

  const toggleHabit = (habit: keyof HabitData) => {
    if (habit !== 'note') {
      setHabitData(prev => ({
        ...prev,
        [habit]: prev[habit] === 1 ? 0 : 1
      }));
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await apiClient.sendHabitData(habitData);
      
      if (response.success) {
        setMessage({ type: 'success', text: response.message || 'Başarılı!' });
        // Reset form after successful submission
        setHabitData({
          study: 0,
          project: 0,
          sport: 0,
          social: 0,
          note: ''
        });
      } else {
        setMessage({ type: 'error', text: response.message || 'Bir hata oluştu!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Beklenmeyen bir hata oluştu!' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        Günlük Alışkanlık Takibi
      </h2>

      {/* Habit Toggles */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {habits.map((habit) => {
          const Icon = habit.icon;
          const isActive = habitData[habit.key] === 1;
          
          return (
            <button
              key={habit.key}
              onClick={() => toggleHabit(habit.key)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                isActive
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className={`${habit.color} ${isActive ? 'scale-110' : ''} transition-transform`} size={24} />
                  <span className="font-medium text-gray-800 dark:text-white">
                    {habit.label}
                  </span>
                </div>
                {isActive ? (
                  <CheckCircle className="text-green-500" size={24} />
                ) : (
                  <XCircle className="text-gray-400" size={24} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Note Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Not (Opsiyonel)
        </label>
        <textarea
          value={habitData.note}
          onChange={(e) => setHabitData(prev => ({ ...prev, note: e.target.value }))}
          placeholder="Bugün hakkında not ekleyin..."
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
            : 'bg-blue-500 hover:bg-blue-600 text-white'
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
            Alışkanlıkları Kaydet
          </>
        )}
      </button>

      {/* Message Display */}
      {message && (
        <div className={`mt-4 p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-400' 
            : 'bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/20 dark:border-red-600 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <p className="text-sm text-blue-800 dark:text-blue-400">
          <strong>Format:</strong> -msg {habitData.study},{habitData.project},{habitData.sport},{habitData.social},{habitData.note || 'note'}
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
          1 = Yaptım, 0 = Yapmadım
        </p>
      </div>
    </div>
  );
}
