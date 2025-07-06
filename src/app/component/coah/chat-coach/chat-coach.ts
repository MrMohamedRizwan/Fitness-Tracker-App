import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

interface Message {
  senderId: string;
  content: string;
  sentAt: Date;
}

@Component({
  selector: 'app-chat-coach',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './chat-coach.html',
  styleUrl: './chat-coach.css',
})
export class ChatCoach {
  currentUserId = 'coach-id'; // This is the coach
  selectedClientId = signal<string | null>(null); // Currently active chat
  clientList = signal(['test1', 'test2', 'test3']); // Can come from API

  // Store messages per client
  chatMap = signal<Record<string, Message[]>>({
    test1: [
      {
        senderId: 'test1',
        content: 'Hi Coach, I have a question.',
        sentAt: new Date(),
      },
      {
        senderId: 'coach-id',
        content: 'Sure! Go ahead.',
        sentAt: new Date(),
      },
    ],
    test2: [],
    test3: [],
  });

  messageControl = new FormControl('');

  get activeMessages(): Message[] {
    const id = this.selectedClientId();
    return id ? this.chatMap()[id] || [] : [];
  }

  selectClient(clientId: string) {
    this.selectedClientId.set(clientId);
  }

  sendMessage() {
    const content = this.messageControl.value?.trim();
    if (!content || !this.selectedClientId()) return;

    const clientId = this.selectedClientId();
    const newMessage: Message = {
      senderId: this.currentUserId,
      content,
      sentAt: new Date(),
    };

    this.chatMap.update((chats) => {
      const existing = chats[clientId!] || [];
      return {
        ...chats,
        [clientId!]: [...existing, newMessage],
      };
    });

    this.messageControl.reset();
  }
}
