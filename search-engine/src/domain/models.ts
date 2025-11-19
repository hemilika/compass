export interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

export interface Post {
  id: string;
  categoryId: string;
  authorId: string;
  title: string;
  body: string;
  score: number;
  createdAt: Date;
}

export interface Message {
  id: string;
  postId: string;
  parentMessageId: string | null;
  authorId: string;
  body: string;
  createdAt: Date;
}
