export class MessageResponseDto {
  id: string;
  text: string;
  senderId: string;
  conversationId: string;
  fileUrls?: string[];
  createdAt: Date;
}
