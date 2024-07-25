export interface ArticleMetadata {
  cid: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
  tags: string[];
  description: string;
}

export interface Article extends ArticleMetadata {
  content: string;
}
