export declare function hashPassword(password: string): Promise<string>;
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
export declare function isStrongPassword(password: string): {
    isValid: boolean;
    errors: string[];
};
//# sourceMappingURL=password.d.ts.map