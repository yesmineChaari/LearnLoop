export class CommentResponseDto {
  id: string;
  content: string;
  postId: string;
  userId: string;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    profileImage?: string | null;
  };
}
