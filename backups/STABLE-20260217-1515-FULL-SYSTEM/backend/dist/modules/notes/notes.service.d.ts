import type { UUID, Note, PaginationParams } from '../../types/index.js';
import type { CreateNoteInput, UpdateNoteInput, NoteWithAuthor, NoteVersion, NoteSearchParams, NoteLinkInfo } from './notes.types.js';
export declare class NotesService {
    create(workspaceId: UUID, userId: UUID, input: CreateNoteInput): Promise<Note>;
    getById(noteId: UUID): Promise<Note>;
    getByIdWithAuthor(noteId: UUID): Promise<NoteWithAuthor>;
    list(workspaceId: UUID, userId: UUID, params: NoteSearchParams): Promise<{
        notes: NoteWithAuthor[];
        total: number;
    }>;
    update(noteId: UUID, userId: UUID, input: UpdateNoteInput): Promise<Note>;
    delete(noteId: UUID): Promise<void>;
    restore(noteId: UUID): Promise<Note>;
    permanentDelete(noteId: UUID): Promise<void>;
    getDeleted(workspaceId: UUID, userId: UUID, params: PaginationParams): Promise<{
        notes: Note[];
        total: number;
    }>;
    saveVersion(noteId: UUID, userId: UUID, content: string): Promise<void>;
    getVersions(noteId: UUID): Promise<NoteVersion[]>;
    restoreVersion(noteId: UUID, versionId: UUID, userId: UUID): Promise<Note>;
    addLink(sourceNoteId: UUID, targetNoteId: UUID): Promise<void>;
    removeLink(sourceNoteId: UUID, targetNoteId: UUID): Promise<void>;
    getLinks(noteId: UUID): Promise<NoteLinkInfo[]>;
    duplicate(noteId: UUID, userId: UUID, workspaceId: UUID): Promise<Note>;
    canAccess(noteId: UUID, userId: UUID, memberId?: string): Promise<boolean>;
    getTemplates(workspaceId: UUID): Promise<Note[]>;
}
export declare const notesService: NotesService;
//# sourceMappingURL=notes.service.d.ts.map