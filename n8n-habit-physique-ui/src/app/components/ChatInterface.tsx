'use client';

import { useState, useRef, useEffect } from 'react';
import { apiClient, ChatMessage } from '@/lib/api';
import { Send, Bot, User, Check, X } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'failed'; // WhatsApp tarzı durum
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Selam! Ben Abidin, senin AI asistanın. Alışkanlıkların, fiziksel gelişimin veya genel olarak her konuda konuşabiliriz. Nasılsın bugün?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessageId = Date.now().toString();
    const userMessage: Message = {
      id: userMessageId,
      text: currentMessage,
      isUser: true,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = currentMessage;
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await apiClient.sendChatMessage({ message: messageToSend });
      
      // User message status'unu güncelle
      setMessages(prev => prev.map(msg => 
        msg.id === userMessageId 
          ? { ...msg, status: response.success ? 'sent' : 'failed' }
          : msg
      ));
      
      // n8n'den gelen text response'unu handle et
      let botResponseText = 'Üzgünüm, cevap alınamadı.';
      
      if (response.success && response.response) {
        botResponseText = response.response;
      } else if (response.message) {
        botResponseText = response.message;
      }
      
      // Bot response (sadece başarılı ise)
      if (response.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: botResponseText,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      // User message'ı failed olarak işaretle
      setMessages(prev => prev.map(msg => 
        msg.id === userMessageId 
          ? { ...msg, status: 'failed' }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
          <Bot className="text-white" size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Abidin</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">AI Asistanınız</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.isUser ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              message.isUser 
                ? 'bg-blue-500' 
                : 'bg-gradient-to-r from-green-400 to-blue-500'
            }`}>
              {message.isUser ? (
                <User className="text-white" size={16} />
              ) : (
                <Bot className="text-white" size={16} />
              )}
            </div>

            {/* Message */}
            <div className={`max-w-[70%] ${message.isUser ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-3 rounded-lg ${
                message.isUser
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
              <div className={`flex items-center gap-1 mt-1 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(message.timestamp)}
                </p>
                {/* WhatsApp tarzı status indicator (sadece user mesajları için) */}
                {message.isUser && message.status && (
                  <div className="flex items-center">
                    {message.status === 'sending' && (
                      <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin ml-1"></div>
                    )}
                    {message.status === 'sent' && (
                      <div className="flex">
                        <Check size={12} className="text-green-500" />
                        <Check size={12} className="text-green-500 -ml-1" />
                      </div>
                    )}
                    {message.status === 'failed' && (
                      <div className="flex">
                        <X size={12} className="text-red-500" />
                        <X size={12} className="text-red-500 -ml-1" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <Bot className="text-white" size={16} />
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Abidin'e mesaj yazın..."
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!currentMessage.trim() || isLoading}
            className={`px-4 py-3 rounded-lg font-medium transition-colors ${
              !currentMessage.trim() || isLoading
                ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            <Send size={20} />
          </button>
        </form>
      </div>

      {/* Info */}
      <div className="px-4 pb-4">
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
          <p className="text-sm text-green-800 dark:text-green-400">
            <strong>Abidin özellikleri:</strong> Argo ve samimi dil kullanır, alışkanlık ve fiziksel verilerinizi analiz edebilir, haftalık raporlar üretir ve genel sohbet edebilir.
          </p>
        </div>
      </div>
    </div>
  );
}
