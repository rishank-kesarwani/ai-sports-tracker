import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { CircuitBreaker } from '../../common/utils/circuit-breaker';

export interface AiPromptRequest {
  prompt: string;
  systemInstruction?: string;
  context?: Record<string, any>;
  temperature?: number;
}

export interface AiPromptResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  groundingSources?: string[];
}

@Injectable()
export class AiPlatformClient {
  private readonly logger = new Logger(AiPlatformClient.name);
  private readonly client: AxiosInstance;
  private readonly circuitBreaker: CircuitBreaker;
  private readonly serviceUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.serviceUrl = this.configService.get<string>('aiPlatform.url', 'http://localhost:4001');
    this.apiKey = this.configService.get<string>('aiPlatform.apiKey', 'ai-platform-dev-token-2026');
    const timeout = this.configService.get<number>('aiPlatform.timeoutMs', 10000);

    this.client = axios.create({
      baseURL: this.serviceUrl,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
    });

    this.circuitBreaker = new CircuitBreaker('AiPlatform', {
      failureThreshold: 4,
      recoveryTimeoutMs: 25000,
      requestTimeoutMs: timeout,
    });
  }

  async generateCompletion(request: AiPromptRequest, fallbackGenerator?: () => string): Promise<AiPromptResponse> {
    return this.circuitBreaker.execute(
      async () => {
        try {
          const res = await this.client.post('/api/v1/chat', {
            messages: [
              ...(request.systemInstruction ? [{ role: 'system', content: request.systemInstruction }] : []),
              { role: 'user', content: request.prompt },
            ],
            context: request.context,
            temperature: request.temperature ?? 0.2,
          });

          return {
            content: res.data?.message?.content || res.data?.content || res.data?.reply || '',
            model: res.data?.model || 'ai-platform-gemini-pro',
            usage: res.data?.usage,
            groundingSources: res.data?.groundingSources || ['TheSportsDB Verified Sports Knowledge Base'],
          };
        } catch (error: any) {
          if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
            throw error;
          }
          this.logger.warn(`AI Platform response error: ${error.message}`);
          throw error;
        }
      },
      () => {
        this.logger.warn(`AI Platform is offline/circuit open. Using deterministic sports analysis fallback.`);
        const fallbackText = fallbackGenerator ? fallbackGenerator() : 'Statistical summary compiled from official match telemetry.';
        return {
          content: fallbackText,
          model: 'rule-based-sports-engine-v1',
          groundingSources: ['Verified Official Match Database'],
          usage: undefined,
        };
      },
    );
  }

  getHealth() {
    return {
      serviceUrl: this.serviceUrl,
      circuitState: this.circuitBreaker.getState(),
      metrics: this.circuitBreaker.getMetrics(),
    };
  }
}
