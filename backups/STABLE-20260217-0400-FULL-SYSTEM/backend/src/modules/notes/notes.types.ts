import type { UUID, Note } from '../../types/index.js';

export interface CreateNoteInput {
  title?: string;
  content?: string;
  project_id?: UUID | null;
  parent_id?: UUID | null;
  tags?: string[];
  is_pinned?: boolean;
  is_public?: boolean;
  is_template?: boolean;
  member_id?: string;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  project_id?: UUID | null;
  parent_id?: UUID | null;
  tags?: string[];
  is_pinned?: boolean;
  is_public?: boolean;
  is_template?: boolean;
  position?: number;
  member_id?: string;
}

export interface NoteWithAuthor extends Note {
  author: {
    id: UUID;
    name: string;
    avatar_url: string | null;
  };
}

export interface NoteVersion {
  id: UUID;
  note_id: UUID;
  user_id: UUID;
  content: string;
  created_at: Date;
  user_name: string;
}

export interface NoteSearchParams {
  q?: string;
  project_id?: UUID | null;
  tags?: string[];
  is_pinned?: boolean;
  is_template?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  member_id?: string;
}

export interface NoteLinkInfo {
  id: UUID;
  title: string;
  direction: 'outgoing' | 'incoming';
}
