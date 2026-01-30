import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat-service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-chats.html',
  styleUrls: ['./my-chats.css']
})
export class ChatComponent implements OnInit {

  rooms: any[] = [];
  messages: any[] = [];

  selectedRoom: any = null;
  messageText = '';
  isLoadingRooms = false;
  isLoadingMessages = false;
  currentUserId:any=null;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
  this.currentUserId = user.id; 


    this.loadChatRooms();
  }

  // ======================
  // LOAD ROOMS
  // ======================
  loadChatRooms() {
    this.isLoadingRooms = true;

    this.chatService.getMyChatRooms().subscribe({
      next: (res: any) => {
        this.rooms = res.data || [];
        this.isLoadingRooms = false;
      },
      error: () => (this.isLoadingRooms = false)
    });
  }

  // ======================
  // SELECT ROOM
  // ======================
  openRoom(room: any) {
    this.selectedRoom = room;
    this.loadMessages(room.id);
  }

  // ======================
  // LOAD MESSAGES
  // ======================
  loadMessages(roomId: number) {
    this.isLoadingMessages = true;

    this.chatService.getMessages(roomId).subscribe({
      next: (res: any) => {
        this.messages = res.data || [];
        this.isLoadingMessages = false;
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: () => (this.isLoadingMessages = false)
    });
  }

  // ======================
  // SEND MESSAGE
  // ======================
  sendMessage() {
    if (!this.messageText.trim() || !this.selectedRoom) return;

    const text = this.messageText;
    this.messageText = '';

    this.chatService.sendMessage(this.selectedRoom.id, text).subscribe({
      next: (res: any) => {
        this.messages.push(res.data);
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  scrollToBottom() {
    const el = document.getElementById('chatMessages');
    if (el) el.scrollTop = el.scrollHeight;
  }
}
