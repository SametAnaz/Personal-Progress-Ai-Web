'use client';

import { useState } from 'react';
import { HabitTracker, PhysiqueTracker, ChatInterface } from './components';
import { Activity, User, MessageCircle } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'habits' | 'physique' | 'chat'>('habits');

  const tabs = [
    { id: 'habits', label: 'Alışkanlık Takibi', icon: Activity },
    { id: 'physique', label: 'Fiziksel Ölçümler', icon: User },
    { id: 'chat', label: 'Abidin Chat', icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Kişisel Gelişim Takip Sistemi
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Alışkanlıklarınızı takip edin, fiziksel gelişiminizi ölçün, AI asistanınız Abidin ile sohbet edin
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'habits' && <HabitTracker />}
          {activeTab === 'physique' && <PhysiqueTracker />}
          {activeTab === 'chat' && <ChatInterface />}
        </div>
      </div>
    </div>
  );
}
