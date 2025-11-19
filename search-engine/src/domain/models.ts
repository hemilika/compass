export interface Bu {
  id: number;
  name: string;
}

export interface User {
  id: number;
  email: string;
  firstname?: string;
  lastname?: string;
  buId?: number | null;
  roles?: string[];
  techstack?: string[];
  userRoles?: string[];
  hobbies?: string[];
  createdAt: Date;
}

export interface Thread {
  id: number;
  name: string;
  description?: string | null;
  buId: number | null;
  createdAt: Date;
}

export interface Post {
  id: number;
  buId: number | null;
  threadId: number;
  authorId: number;
  title: string;
  content: string;
  iconUrl?: string | null;
  imageUrls?: string[] | null;
  upvoteCount: number;
  createdAt: Date;
  updatedAt?: Date | null;
}

export interface Reply {
  id: number;
  postId: number;
  authorId: number;
  parentReplyId?: number | null;
  content: string;
  imageUrls?: string[] | null;
  upvoteCount: number;
  createdAt: Date;
  updatedAt?: Date | null;
}
