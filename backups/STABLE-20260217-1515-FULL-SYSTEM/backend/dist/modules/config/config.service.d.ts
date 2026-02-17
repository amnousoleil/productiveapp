interface WorkspaceConfig {
    name?: string;
    logo_url?: string | null;
    primary_color?: string;
    default_theme?: string;
    timezone?: string;
    locale?: string;
}
export declare function getUserFirstWorkspace(userId: string): Promise<string | null>;
export declare function getWorkspaceConfig(workspaceId: string): Promise<any>;
export declare function updateWorkspaceConfig(workspaceId: string, config: WorkspaceConfig): Promise<any>;
export declare function uploadLogoToLocal(file: Express.Multer.File): Promise<string>;
export {};
//# sourceMappingURL=config.service.d.ts.map