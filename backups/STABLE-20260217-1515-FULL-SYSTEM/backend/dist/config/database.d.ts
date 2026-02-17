import postgres from 'postgres';
declare const queryClient: postgres.Sql<{}>;
export declare const db: import("drizzle-orm/postgres-js").PostgresJsDatabase<Record<string, never>>;
export declare const closeDb: () => Promise<void>;
export { queryClient as sql };
//# sourceMappingURL=database.d.ts.map