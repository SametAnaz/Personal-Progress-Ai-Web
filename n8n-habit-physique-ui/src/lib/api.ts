import axios from 'axios';

// URL seçimi: NEXT_PUBLIC_USE_TEST_WEBHOOK=true ise test URL, yoksa production URL
const API_BASE_URL = process.env.NEXT_PUBLIC_USE_TEST_WEBHOOK === 'true'
  ? process.env.NEXT_PUBLIC_WEBHOOK_TEST_URL
  : process.env.NEXT_PUBLIC_WEBHOOK_URL;

console.log('Using API URL:', API_BASE_URL);
console.log('Test webhook enabled:', process.env.NEXT_PUBLIC_USE_TEST_WEBHOOK);

if (!API_BASE_URL) {
  throw new Error('Webhook URL environment variable is not set');
}

// API types
export interface HabitData {
  study: number;
  project: number;
  sport: number;
  social: number;
  note: string;
}

export interface PhysiqueData {
  weight: number;
  height: number;
  waist: number;
  neck: number;
  hip: number;
  shoulder: number;
  chest: number;
  note: string;
}

export interface ChatMessage {
  message: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  response?: string; // AI'ın cevabı için
  isDbInsertSuccessful?: boolean; // DB insert başarı durumu
  isCalculationError?: boolean; // Hesaplama hatası durumu
}

// API client
export class ApiClient {
  private static instance: ApiClient;
  private axiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // AI işlemleri için daha uzun timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  // Send habit data (navigate: 0)
  async sendHabitData(data: HabitData): Promise<ApiResponse> {
    try {
      const message = `-msg ${data.study},${data.project},${data.sport},${data.social},${data.note}`;
      
      // n8n webhook GET request ile çalışıyor, query parameters kullan
      const response = await this.axiosInstance.get('', {
        params: {
          message,
          navigate: 0,
          type: 'habit'
        }
      });
      
      // n8n workflow'un veritabanına kayıt yapması için 3 saniye bekle
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // HTTP status koduna göre DB insert durumunu kontrol et
      // 200 = Başarılı, 400 = Başarısız
      const isDbInsertSuccessful = response.status === 200;
      
      return {
        success: true,
        message: response.data?.message || 'Alışkanlık verisi başarıyla gönderildi!',
        data: response.data?.data,
        response: response.data?.response,
        isDbInsertSuccessful
      };
    } catch (error: any) {
      console.error('Habit data send error:', error);
      
      // HTTP 400 hatası = DB kayıt başarısız ama workflow çalıştı
      if (error.response?.status === 400) {
        return {
          success: true, // Workflow çalıştı
          message: 'Veriler işlendi ancak veritabanına kaydedilemedi.',
          data: error.response.data,
          response: error.response.data?.response,
          isDbInsertSuccessful: false
        };
      }
      
      return {
        success: false,
        message: `Alışkanlık verisi gönderilemedi: ${error.message}`,
        isDbInsertSuccessful: false
      };
    }
  }

  // Send physique data (navigate: 2)
  async sendPhysiqueData(data: PhysiqueData): Promise<ApiResponse> {
    try {
      const message = `-msr ${data.weight},${data.height},${data.waist},${data.neck},${data.hip},${data.shoulder},${data.chest},${data.note}`;
      const response = await this.axiosInstance.get('', {
        params: {
          message,
          navigate: 2,
          type: 'physique'
        }
      });
      
      // n8n workflow'un veritabanına kayıt yapması için 3 saniye bekle
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // HTTP status koduna göre işlem durumunu kontrol et
      // 211 = Veriler uygun, DB'ye kaydedildi
      // 411 = Hesaplama aşamasında hata
      const isDbInsertSuccessful = response.status === 211;
      const isCalculationError = response.status === 411;
      
      return {
        success: true,
        message: response.data?.message || 'Fiziksel ölçüm verisi başarıyla gönderildi!',
        data: response.data?.data,
        response: response.data?.response,
        isDbInsertSuccessful,
        isCalculationError
      };
    } catch (error: any) {
      console.error('Physique data send error:', error);
      
      // HTTP 411 hatası = Hesaplama aşamasında hata
      if (error.response?.status === 411) {
        return {
          success: true, // Workflow çalıştı
          message: 'Hesaplama aşamasında hata oluştu.',
          data: error.response.data,
          response: error.response.data?.response,
          isDbInsertSuccessful: false,
          isCalculationError: true
        };
      }
      
      // HTTP 400 hatası = Diğer başarısızlık durumları
      if (error.response?.status === 400) {
        return {
          success: true, // Workflow çalıştı
          message: 'Veriler işlendi ancak veritabanına kaydedilemedi.',
          data: error.response.data,
          response: error.response.data?.response,
          isDbInsertSuccessful: false,
          isCalculationError: false
        };
      }
      
      return {
        success: false,
        message: 'Fiziksel ölçüm verisi gönderilemedi. Lütfen tekrar deneyin.',
        isDbInsertSuccessful: false,
        isCalculationError: false
      };
    }
  }

  // Send chat message (navigate: 1)
  async sendChatMessage(data: ChatMessage): Promise<ApiResponse> {
    try {
      // Chat mesajının başına -chat prefix'i ekle
      const message = `-chat ${data.message}`;
      
      // Chat için sadece message ve navigate gönder
      const response = await this.axiosInstance.get('', {
        params: {
          message,
          navigate: 1
        }
      });
      
      // n8n text response döndürüyor, direkt response.data'yı kullan
      const aiResponse = typeof response.data === 'string' 
        ? response.data 
        : response.data?.response || response.data?.message || 'Cevap alınamadı.';
      
      return {
        success: true,
        message: 'Mesaj gönderildi!',
        data: response.data,
        response: aiResponse // AI'ın text cevabı
      };
    } catch (error: any) {
      console.error('Chat message send error:', error);
      
      // HTTP 400 hatası = AI cevap veremedi
      if (error.response?.status === 400) {
        return {
          success: false,
          message: 'AI şu an cevap veremiyor.',
          response: 'Üzgünüm, şu an mesajını anlayamadım veya cevap veremiyorum. Lütfen tekrar dener misin?'
        };
      }
      
      return {
        success: false,
        message: 'Mesaj gönderilemedi. Lütfen tekrar deneyin.',
        response: 'Üzgünüm, şu an cevap veremiyorum. Lütfen tekrar deneyin.'
      };
    }
  }
}

export const apiClient = ApiClient.getInstance();
