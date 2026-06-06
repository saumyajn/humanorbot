import { effect, EventEmitter, Injectable, signal, inject, DestroyRef, computed, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { ApiService } from './api-service';
import { getRuntimeConfig } from '../app-settings';

export interface ChatMessage {
  text: string;
  sender: 'me' | 'opponent' | 'system';
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class GameService {
  private socket: Socket;
  private apiService = inject(ApiService);
  private destroyRef = inject(DestroyRef);
  private readonly runtimeConfig = getRuntimeConfig();
  private readonly API_URL = this.runtimeConfig.middlewareUrl;
  private ngZone = inject(NgZone);
  // --- SIGNALS ---
  public connectionStatus = signal<'DISCONNECTED' | 'SEARCHING' | 'MATCHED'>('DISCONNECTED');

  public messages = signal<ChatMessage[]>([]);
  public typingSender = signal<'me' | 'opponent' | null>(null);
  public messageCount = computed(() => this.messages().filter(m => m.sender === 'me').length);
  public gameTimer = signal<number>(1200);
  public isGameOver = signal<boolean>(false);
  public searchSeconds = signal<number>(10);

  public roomId = signal<string | null>(null);
  public playerId = signal<string | null>(null);
  public lastError = signal<string | null>(null);
  public myAvatarUrl = signal<string>('');
  public opponentAvatarUrl = signal<string>('');

  private gameInterval: any;
  private searchInterval: any;
  public onMatchFound = new EventEmitter<void>();

  constructor() {
    this.socket = io(this.API_URL, { autoConnect: true });
    this.setupSocketListeners();
    this.destroyRef.onDestroy(() => this.cleanup());

    // Auto-end game if timer hits 0
    effect(() => {
      if (this.gameTimer() <= 0 && this.connectionStatus() === 'MATCHED' && !this.isGameOver()) {
        this.endGame();
      }
    });
  }

  private setupSocketListeners() {
    this.socket.on('connect', () => {
      this.ngZone.run(() => {
        this.playerId.set(this.socket.id ?? null);
        this.lastError.set(null);
      });
    });

    this.socket.on('disconnect', () => {
      this.ngZone.run(() => {
        this.stopSearchTimer();
        clearInterval(this.gameInterval);
        this.connectionStatus.set('DISCONNECTED');
        this.lastError.set('Connection lost. Return to the lobby and start a new match.');
      });
    });

    this.socket.on('connect_error', () => {
      this.ngZone.run(() => {
        this.connectionStatus.set('DISCONNECTED');
        this.lastError.set('Unable to connect to the game server.');
      });
    });

    this.socket.on('match_found', (data) => {
      this.ngZone.run(() => {
        this.stopSearchTimer();
        this.roomId.set(data.roomId);
        this.playerId.set(data.playerId ?? this.socket.id ?? null);
        this.connectionStatus.set('MATCHED');
        this.startGame();
        this.onMatchFound.emit();
      });
    });

    this.socket.on('receive_message', (msg: any) => {
      this.ngZone.run(() => {
        if (msg.sender !== 'me') {
          const senderRole = msg.sender === 'system' ? 'system' : 'opponent';
          if (senderRole === 'opponent') {
            this.typingSender.set('opponent');
            const typingDuration = Math.floor(Math.random() * 4000) + 2000; // 1-5 seconds
            setTimeout(() => {
              this.typingSender.set(null);
              this.addMessage(msg.text, senderRole);
            }, typingDuration);
          } else {
            this.addMessage(msg.text, senderRole);
          }
        }
      });
    });

    this.socket.on('message_rejected', (data: any) => {
      this.ngZone.run(() => {
        this.lastError.set(data?.message ?? 'Message rejected by server.');
      });
    });

    this.socket.on('rate_limited', (data: any) => {
      this.ngZone.run(() => {
        this.lastError.set(data?.message ?? 'Slow down for a moment.');
      });
    });

    this.socket.on('opponent_guessed', () => {
      this.ngZone.run(() => {
        if (!this.isGameOver()) {
          clearInterval(this.gameInterval);
          this.isGameOver.set(true);
          this.addMessage('Opponent has made their guess! The session is over.', 'system');
          this.addMessage('Cast your verdict now.', 'system');
        }
      });
    });
  }

  // --- LOBBY ACTIONS ---
  public findMatch() {
    this.lastError.set(null);
    this.isGameOver.set(false);
    this.connectionStatus.set('SEARCHING');
    this.searchSeconds.set(this.runtimeConfig.matchTimeoutSeconds);
    if (this.searchInterval) {
      clearInterval(this.searchInterval);
    }
    this.socket.emit('find_match');
    this.searchInterval = setInterval(() => {
      const currentSeconds = this.searchSeconds();
      if (currentSeconds <= 1) {
        this.searchSeconds.set(0);
        this.stopSearchTimer();
      } else {
        this.searchSeconds.set(currentSeconds - 1);
      }
    }, 1000);
  }

  public cancelSearch() {
    if (this.searchInterval) {
      clearInterval(this.searchInterval);
    }
    this.stopSearchTimer();
    this.socket.emit('cancel_search');
    this.connectionStatus.set('DISCONNECTED');
  }

  // --- GAME ACTIONS ---
  private startGame() {
    this.messages.set([]);
    this.isGameOver.set(false);
    this.lastError.set(null);
    this.gameTimer.set(this.runtimeConfig.gameDurationSeconds);
    this.myAvatarUrl.set(this.apiService.getAvatarUrl('me' + Date.now()));
    this.opponentAvatarUrl.set(this.apiService.getAvatarUrl('opp' + Date.now()));

    this.gameInterval = setInterval(() => {
      this.gameTimer.update(v => v > 0 ? v - 1 : 0);
    }, 1000);
  }

  public sendMessage(text: string) {
    if (!text.trim() || this.isGameOver()) return;

    this.typingSender.set('me');
    const typingDuration = Math.floor(Math.random() * 4000) + 1000; // 1-5 seconds

    setTimeout(() => {
      this.ngZone.run(() => {
        this.typingSender.set(null);
        this.socket.emit('send_message', { roomId: this.roomId(), text });
        this.addMessage(text, 'me');
        this.checkMessageLimit();
      });
    }, typingDuration);
  }

  private checkMessageLimit() {
    if (this.messageCount() >= this.runtimeConfig.maxMessagesPerPlayer) this.endGame();
  }

  private endGame() {
    clearInterval(this.gameInterval);
    this.isGameOver.set(true);
    this.addMessage('Session expired. Cast your verdict.', 'system');
  }

  public leaveGame() {
    this.socket.emit('leave_game', this.roomId());
    this.cleanupGame();
  }

  private cleanupGame() {
    clearInterval(this.gameInterval);
    this.connectionStatus.set('DISCONNECTED');
    this.isGameOver.set(false);
    this.messages.set([]);
    this.roomId.set(null);
    this.lastError.set(null);
  }

  private stopSearchTimer() {
    if (this.searchInterval) clearInterval(this.searchInterval);
  }

  private addMessage(text: string, sender: 'me' | 'opponent' | 'system') {
    this.messages.update(m => [...m, { text, sender, timestamp: Date.now() }]);
  }

  private cleanup() {
    this.stopSearchTimer();
    clearInterval(this.gameInterval);
    this.socket.disconnect();
  }
}
