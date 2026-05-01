import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../services/chat-service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule,TranslateModule],
  templateUrl: './my-chats.html',
  styleUrls: ['./my-chats.css']
})
export class ChatComponent implements OnInit {

  rooms: any[] = [];
  messages: any[] = [];

  selectedRoom: any = null;
  messageText = '';
  searchQuery = '';

  isLoadingRooms = false;
  isLoadingMessages = false;

  currentUserId: number | null = null;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // ✅ Get logged-in user correctly
    if (isPlatformBrowser(this.platformId)) {
      const userRaw = localStorage.getItem('user_data');
      if (userRaw) {
        this.currentUserId = JSON.parse(userRaw).id;
      }
    }

    this.loadChatRooms();
  }

onSearch(): void {
  if (!this.searchQuery.trim()) {
    this.loadChatRooms();
    return;
  }

  const query = this.searchQuery.toLowerCase();
  console.log('Searching for:', query);

  this.rooms = this.rooms.filter((room: any) =>
    room.otherParty?.name?.toLowerCase().includes(query)
  );
}
  /* ======================
     LOAD CHAT ROOMS
     ====================== */
  loadChatRooms(): void {
    this.isLoadingRooms = true;

    this.chatService.getMyChatRooms().subscribe({
      next: (res: any) => {
        this.rooms = res.data || [];
        this.isLoadingRooms = false;

        // ✅ Auto-open room if coming from listing
        const roomId = Number(
          this.route.snapshot.queryParamMap.get('roomId')
        );
        if (roomId) {
          this.openRoomById(roomId);
        }
      },
      error: () => {
        this.isLoadingRooms = false;
      }
    });
  }

  /* ======================
     OPEN ROOM
     ====================== */
  openRoom(room: any): void {
    this.selectedRoom = room;
    this.loadMessages(room.id);
  }

  openRoomById(roomId: number): void {
    const room = this.rooms.find(r => r.id === roomId);
    if (room) {
      this.openRoom(room);
    }
  }

  /* ======================
     LOAD MESSAGES
     ====================== */
  loadMessages(roomId: number): void {
    this.isLoadingMessages = true;

    this.chatService.getMessages(roomId).subscribe({
      next: (res: any) => {
        this.messages = res.data || [];
        this.isLoadingMessages = false;

        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: () => {
        this.isLoadingMessages = false;
      }
    });
  }

  /* ======================
     SEND MESSAGE
     ====================== */
  sendMessage(): void {
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

  /* ======================
     SCROLL
     ====================== */
  scrollToBottom(): void {
    if (isPlatformBrowser(this.platformId)) {
      const el = document.getElementById('chatMessages');
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }
  closeChat(): void {
    this.selectedRoom = null;
    this.messages = []; // Optional: clear messages to avoid flash
  }
  
}
