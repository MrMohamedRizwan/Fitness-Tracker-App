import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-component',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './chat-component.html',
  styleUrl: './chat-component.css',
})
export class ChatComponent {
  currentUserId = 'client-id';

  messageControl = new FormControl('');
  messages = signal([
    {
      senderId: 'client-id',
      content: 'Hi Coach, I have a question.',
      sentAt: new Date(),
    },
    { senderId: 'coach-id', content: 'Sure! Go ahead.', sentAt: new Date() },
  ]);

  sendMessage() {
    const content = this.messageControl.value?.trim();
    if (!content) return;

    this.messages.update((msgs) => [
      ...msgs,
      { senderId: this.currentUserId, content, sentAt: new Date() },
    ]);
    this.messageControl.reset();
  }
}
