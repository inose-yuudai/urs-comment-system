export interface Comment {
  text: string;
}

export interface Stamp {
  code: string;
}

export interface CommentSource {
  start(): void;
  stop(): void;
  subscribe(handler: (comment: Comment) => void): () => void;
  subscribeStamps(handler: (stamp: Stamp) => void): () => void;
}
