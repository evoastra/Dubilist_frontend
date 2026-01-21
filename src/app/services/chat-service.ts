import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private baseUrl = `${environment.apiUrl}/api/chat`;

  constructor(private http: HttpClient) {}

  // 41. Get My Chat Rooms
  getMyChatRooms() {
    return this.http.get(`${this.baseUrl}/rooms`);
  }

  // 42. Create / Get Chat Room
  createOrGetRoom(listingId: number) {
    return this.http.post(`${this.baseUrl}/rooms`, { listingId });
  }

  // 43. Get Messages
  getMessages(roomId: number, page = 1, limit = 50) {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);
    return this.http.get(`${this.baseUrl}/rooms/${roomId}/messages`, { params });
  }

  // 44. Send Message
  sendMessage(roomId: number, content: string) {
    return this.http.post(`${this.baseUrl}/rooms/${roomId}/messages`, { content });
  }

  // 45. Unread count
  getUnreadCount() {
    return this.http.get(`${this.baseUrl}/unread`);
  }
  

}
