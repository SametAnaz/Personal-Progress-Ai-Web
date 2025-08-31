import axios from 'axios';

// Development için test URL, production için ana URL kullan
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? process.env.NEXT_PUBLIC_WEBHOOK_TEST_URL
  : process.env.NEXT_PUBLIC_WEBHOOK_URL;

console.log('Environment:', process.env.NODE_ENV);
console.log('API_BASE_URL:', API_BASE_URL);

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
}

// API client
export class ApiClient {
  private static instance: ApiClient;
  private axiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
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
      console.log('Sending habit data:', { message, navigate: 0, type: 'habit' });
      console.log('To URL:', API_BASE_URL);
      
      // n8n webhook GET request ile çalışıyor, query parameters kullan
      const response = await this.axiosInstance.get('', {
        params: {
          message,
          navigate: 0,
          type: 'habit'
        }
      });
      
      console.log('Response:', response.data);
      
      return {
        success: true,
        message: 'Alışkanlık verisi başarıyla gönderildi!',
        data: response.data
      };
    } catch (error: any) {
      console.error('Habit data send error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      return {
        success: false,
        message: `Alışkanlık verisi gönderilemedi: ${error.message}`
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
      
      return {
        success: true,
        message: 'Fiziksel ölçüm verisi başarıyla gönderildi!',
        data: response.data
      };
    } catch (error) {
      console.error('Physique data send error:', error);
      return {
        success: false,
        message: 'Fiziksel ölçüm verisi gönderilemedi. Lütfen tekrar deneyin.'
      };
    }
  }

  // Send chat message (navigate: 1)
  async sendChatMessage(data: ChatMessage): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.get('', {
        params: {
          message: data.message,
          navigate: 1,
          type: 'chat'
        }
      });
      
      return {
        success: true,
        message: 'Mesaj gönderildi!',
        data: response.data
      };
    } catch (error) {
      console.error('Chat message send error:', error);
      return {
        success: false,
        message: 'Mesaj gönderilemedi. Lütfen tekrar deneyin.'
      };
    }
  }
}

export const apiClient = ApiClient.getInstance();
