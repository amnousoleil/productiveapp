/**
 * Module Comptabilité - Service Départements & Budgets
 * @description Gestion des départements, lignes budgétaires et analyse des écarts
 */
import { Pool } from 'pg';
import { Department, CreateDepartmentDTO, UpdateDepartmentDTO, BudgetLine, CreateBudgetDTO, BudgetOverview } from './accounting.types.js';
export declare const initDepartmentsService: (dbPool: Pool) => void;
/**
 * Crée un nouveau département
 */
export declare const createDepartment: (workspaceId: string, data: CreateDepartmentDTO) => Promise<Department>;
/**
 * Liste tous les départements actifs d'un workspace
 */
export declare const listDepartments: (workspaceId: string) => Promise<Department[]>;
/**
 * Met à jour un département
 */
export declare const updateDepartment: (workspaceId: string, departmentId: string, data: UpdateDepartmentDTO) => Promise<Department | null>;
/**
 * Désactive un département (soft delete)
 */
export declare const deleteDepartment: (workspaceId: string, departmentId: string) => Promise<boolean>;
/**
 * Crée ou met à jour une ligne budgétaire (UPSERT)
 * Si une ligne existe déjà pour le même department_id + category_id + year + month,
 * elle est mise à jour avec le nouveau montant alloué.
 */
export declare const setBudgetLine: (workspaceId: string, data: CreateBudgetDTO) => Promise<BudgetLine>;
/**
 * Vue globale du budget : toutes les lignes avec montants réels calculés depuis les factures
 */
export declare const getBudgetOverview: (workspaceId: string, year: number) => Promise<BudgetOverview>;
/**
 * Analyse des écarts budget vs réel avec pourcentage d'utilisation
 * Optionnel: filtrer par département
 */
export declare const getBudgetVariance: (workspaceId: string, year: number, departmentId?: string) => Promise<Array<BudgetLine & {
    actual_amount: number;
    utilization_pct: number;
    variance: number;
}>>;
/**
 * Budget détaillé pour un département spécifique avec ventilation mensuelle
 */
export declare const getDepartmentBudget: (workspaceId: string, departmentId: string, year: number) => Promise<{
    department: Department;
    budget_lines: BudgetLine[];
    monthly_actuals: Array<{
        month: number;
        actual: number;
    }>;
    total_allocated: number;
    total_actual: number;
    variance: number;
    utilization_pct: number;
}>;
//# sourceMappingURL=accounting.departments.d.ts.map