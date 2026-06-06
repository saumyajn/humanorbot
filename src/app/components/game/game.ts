import { Component, effect, ElementRef, inject, ViewChild, signal, AfterViewInit, OnDestroy } from '@angular/core';
import { GameService } from '../../services/game-service';
import { ApiService } from '../../services/api-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule],
  templateUrl: './game.html',
  styleUrl: './game.scss',
})
export class Game implements AfterViewInit, OnDestroy {
  public gameService = inject(GameService);
  private apiService = inject(ApiService);

  messageInput = '';
  isRevealing = signal(false);
  gameResult = signal<any>(null);
  makeGuessClicked = signal(false);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('chatInput') chatInput!: ElementRef<HTMLInputElement>;

  constructor(private router: Router) {
    effect(() => {
      // Performance: Only trigger scroll if there are actually new messages
      if (this.gameService.messages().length > 0) {
        this.scrollToBottom();
      }
    });

  }

  ngAfterViewInit() {
    this.gameService.onMatchFound.subscribe(() => this.focusInput());
    this.focusInput();
  }

  ngOnDestroy() {
    // Redirect/Cleanup: Ensure socket listeners or intervals are cleared
    // The GameService handles most, but component-specific logic should go here.
  }

  handleSendMessage() {
    if (!this.messageInput.trim() || this.gameService.isGameOver()) return;
    this.gameService.sendMessage(this.messageInput);
    this.messageInput = '';
  }

  async selectIdentity(choice: 'AI' | 'Human') {
    this.isRevealing.set(true);
    try {
      const result = await this.apiService.submitGuess(
        this.gameService.roomId(),
        choice,
        this.gameService.playerId()
      );
      this.gameResult.set(result);
      this.gameService.isGameOver.set(true); // Game is truly over once the guess is submitted and the result is received.
    } catch (err) {
      console.error('Failed to submit guess', err);
      this.gameService.lastError.set('Could not submit your verdict. Try again.');
    } finally {
      this.isRevealing.set(false);
    }
  }

  makeGuess() {
    this.gameService.isGameOver.set(true);
    this.makeGuessClicked.set(true);
  }
  private focusInput() {
    this.chatInput?.nativeElement.focus();
  }

  private scrollToBottom() {
    // Use requestAnimationFrame for smoother performance during browser repaints
    requestAnimationFrame(() => {
      try {
        const el = this.scrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      } catch (err) { }
    });
  }
  returnToLobby() {
    this.gameService.leaveGame();
    this.router.navigate(['/']);
  }
}
