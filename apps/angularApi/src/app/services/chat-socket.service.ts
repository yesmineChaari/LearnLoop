import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class ChatSocketService {
  constructor(private socket: Socket) {}

  // Send a message
  sendMessage(message: string, conversationId: string, senderId: string) {
    this.socket.emit('sendMessage', { message, conversationId, senderId });
  }

  // Send a message with files
  sendMessageWithFiles(message: string, files: any[], conversationId: string, senderId: string) {
    this.socket.emit('sendMessageWithFiles', { message, files, conversationId, senderId });
  }

  // Listen for new messages
  onNewMessage(): Observable<any> {
    return this.socket.fromEvent('newMessage');
  }

  // Listen for errors
  onError(): Observable<any> {
    return this.socket.fromEvent('error');
  }
}