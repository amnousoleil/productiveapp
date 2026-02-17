import type { UUID, HumanDesignProfile, JournalEntry, AuditReport, PaginationParams } from '../../types/index.js';
import type { CreateJournalEntryInput, UpdateJournalEntryInput, CreateHumanDesignInput, GenerateReportInput, JournalStats, CreatePsychoAuditInput, PsychoAudit } from './audit.types.js';
export declare class AuditService {
    createJournalEntry(userId: UUID, workspaceId: UUID, input: CreateJournalEntryInput): Promise<JournalEntry>;
    getJournalEntry(entryId: UUID): Promise<JournalEntry>;
    getJournalEntries(userId: UUID, workspaceId: UUID, params: PaginationParams & {
        from?: string;
        to?: string;
    }): Promise<{
        entries: JournalEntry[];
        total: number;
    }>;
    updateJournalEntry(entryId: UUID, input: UpdateJournalEntryInput): Promise<JournalEntry>;
    deleteJournalEntry(entryId: UUID): Promise<void>;
    getJournalStats(userId: UUID, workspaceId: UUID): Promise<JournalStats>;
    createHumanDesignProfile(userId: UUID, input: CreateHumanDesignInput): Promise<HumanDesignProfile>;
    getHumanDesignProfile(userId: UUID): Promise<HumanDesignProfile | null>;
    updateHumanDesignProfile(userId: UUID, input: Partial<CreateHumanDesignInput>): Promise<HumanDesignProfile>;
    generateReport(userId: UUID, workspaceId: UUID, input: GenerateReportInput): Promise<AuditReport>;
    getReport(reportId: UUID): Promise<AuditReport>;
    getReports(userId: UUID, workspaceId: UUID, params: PaginationParams): Promise<{
        reports: AuditReport[];
        total: number;
    }>;
    deleteReport(reportId: UUID): Promise<void>;
    createPsychoAudit(userId: UUID, workspaceId: UUID, input: CreatePsychoAuditInput): Promise<PsychoAudit>;
    listPsychoAudits(workspaceId: UUID): Promise<PsychoAudit[]>;
}
export declare const auditService: AuditService;
//# sourceMappingURL=audit.service.d.ts.map