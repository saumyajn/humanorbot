import { Injectable } from '@angular/core';
import { getRuntimeConfig } from '../app-settings';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly API_URL = getRuntimeConfig().middlewareUrl;

  async submitGuess(roomId: string | null, choice: 'AI' | 'Human', playerId: string | null) {
    const response = await fetch(`${this.API_URL}/api/guess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ roomId, guess: choice, playerId })
    });

    if (!response.ok) {
      throw new Error('Failed to submit guess');
    }
    return await response.json();
  }


  getAvatarUrl(seed: string): string {
    return `https://api.dicebear.com/9.x/bottts/svg?seed=${seed}&backgroundColor=b6e3f4`;
  }
}
