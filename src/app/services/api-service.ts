import {  Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {
  // private readonly API_URL = 'https://humanvsbot-middleware.onrender.com';
    private readonly API_URL = 'http://localhost:3000'; // For local testing 

  async submitGuess(roomId: string | null, choice: 'AI' | 'Human') {
    const response = await fetch(`${this.API_URL}/api/guess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ roomId, guess: choice })
    });

    if (!response.ok) {
      throw new Error('Failed to submit guess');
    }
console.log("Received response from /api/guess:", response);
    return await response.json();

  }


  getAvatarUrl(seed: string): string {
    return `https://api.dicebear.com/9.x/bottts/svg?seed=${seed}&backgroundColor=b6e3f4`;
  }
}