
export type ConnectionStatus = 'IDLE' | 'SEARCHING' | 'MATCHED' | 'DISCONNECTED';

export interface Message {
  text: string;
  sender: 'me' | 'opponent' | 'system';
  timestamp: number;
}

export const GAME_LIMITS = {
  MAX_MESSAGES: 10,
  TOTAL_TIME_SECONDS: 120
};