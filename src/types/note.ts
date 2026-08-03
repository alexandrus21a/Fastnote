export interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  favorite?: boolean;
  category?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

