/**
 * Module Comptabilité - Types et Interfaces
 * @description Définitions TypeScript pour le module comptabilité v2.0
 * Inclut les types étendus pour contacts, départements, budgets, notes de frais,
 * rapprochement bancaire, alertes, FEC et prédictions IA
 */

// ============================================
// TYPES DE BASE (v1.0)
// ============================================

export type InvoiceType = 'expense' | 'income';
export type InvoiceStatus = 'draft' | 'pending' | 'validated' | 'paid';
export type InvoiceSource = 'manual' | 'scan' | 'photo';
export type CategoryType = 'expense' | 'income';
export type PeriodStatus = 'open' | 'closed';
export type ExportFormat = 'csv' | 'pdf' | 'excel';
export type ExportType = 'invoices' | 'tva' | 'analytics';

// ============================================
// TYPES ÉTENDUS (v2.0)
// ============================================

export type InvoiceStatusV2 = 'draft' | 'pending' | 'validated' | 'paid' | 'overdue' | 'cancelled' | 'sent';
export type DocumentType = 'invoice' | 'quote' | 'credit_note' | 'proforma';
export type ContactType = 'client' | 'supplier' | 'both';
export type ExpenseStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'reimbursed';
export type AlertType = 'overdue_invoice' | 'upcoming_deadline' | 'budget_exceeded' | 'budget_warning' | 'payment_received' | 'anomaly_detected' | 'fec_reminder' | 'cash_flow_warning';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type ReconciliationStatus = 'unmatched' | 'matched' | 'partial' | 'excluded';
export type TransactionType = 'credit' | 'debit';

// ============================================
// INTERFACES DE BASE (v1.0)
// ============================================

export interface AccountingCategory {
  id: string;
  workspace_id: string;
  slug: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface LineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tva_rate: number;
  amount: number;
  created_at: Date;
}

export interface Invoice {
  id: string;
  workspace_id: string;
  category_id: string | null;
  type: InvoiceType;
  status: InvoiceStatus;
  fournisseur: string;
  reference: string | null;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  tva_rate: number;
  date_facture: Date;
  date_echeance: Date | null;
  source: InvoiceSource;
  ai_confidence: number | null;
  image_url: string | null;
  notes: string | null;
  client_name: string | null;
  client_email: string | null;
  document_type: DocumentType | null;
  currency: string | null;
  contact_id: string | null;
  department_id: string | null;
  created_at: Date;
  updated_at: Date;
  // Relations
  category?: AccountingCategory;
  line_items?: LineItem[];
  contact?: Contact;
}

export interface Period {
  id: string;
  workspace_id: string;
  month: number;
  year: number;
  status: PeriodStatus;
  total_income: number;
  total_expense: number;
  balance: number;
  created_at: Date;
  updated_at: Date;
}

export interface TVASummary {
  id: string;
  period_id: string;
  taux: number;
  base_ht: number;
  montant_tva: number;
  created_at: Date;
}

export interface AccountingExport {
  id: string;
  workspace_id: string;
  type: ExportType;
  format: ExportFormat;
  file_url: string | null;
  filters: ExportFilters;
  status: 'pending' | 'completed' | 'failed';
  created_at: Date;
}

export interface AIExtractionResult {
  success: boolean;
  confidence: number;
  data: {
    fournisseur: string | null;
    reference: string | null;
    date_facture: string | null;
    date_echeance: string | null;
    montant_ht: number | null;
    montant_tva: number | null;
    montant_ttc: number | null;
    tva_rate: number | null;
    category_slug: string | null;
    line_items: Partial<LineItem>[];
  };
  raw_text: string;
  errors: string[];
}

// ============================================
// PARAMÈTRES SOCIÉTÉ
// ============================================

export interface CompanySettings {
  id: string;
  workspace_id: string;
  company_name: string;
  siret: string | null;
  tva_number: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  cgv: string | null;
  mentions_legales: string | null;
  default_currency: string;
  fiscal_year_start: number;
  default_tva_rate: number;
  default_payment_terms: number;
  bank_name: string | null;
  bank_iban: string | null;
  bank_bic: string | null;
  invoice_prefix: string | null;
  quote_prefix: string | null;
  credit_note_prefix: string | null;
  next_invoice_number: number | null;
  next_quote_number: number | null;
  next_credit_note_number: number | null;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// CONTACTS
// ============================================

export interface Contact {
  id: string;
  workspace_id: string;
  type: ContactType;
  name: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  country: string;
  siret: string | null;
  tva_number: string | null;
  default_payment_terms: number | null;
  default_currency: string | null;
  tags: string | null;
  notes: string | null;
  total_invoiced: number;
  total_paid: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateContactDTO {
  type: ContactType;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  siret?: string;
  tva_number?: string;
  default_payment_terms?: number | null;
  default_currency?: string;
  tags?: string;
  notes?: string;
}

export interface UpdateContactDTO extends Partial<CreateContactDTO> {
  is_active?: boolean;
}

export interface ContactFilters {
  type?: ContactType;
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

// ============================================
// DÉPARTEMENTS & BUDGETS
// ============================================

export interface Department {
  id: string;
  workspace_id: string;
  name: string;
  code: string;
  manager_name: string | null;
  annual_budget: number | null;
  monthly_budget: number | null;
  color: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDepartmentDTO {
  name: string;
  code: string;
  manager_name?: string;
}

export interface UpdateDepartmentDTO extends Partial<CreateDepartmentDTO> {
  is_active?: boolean;
}

export interface BudgetLine {
  id: string;
  workspace_id: string;
  department_id: string;
  category_id: string | null;
  year: number;
  month: number | null;
  budget_amount: number;
  actual_amount: number;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  // Computed
  department_name?: string;
  category_name?: string;
  utilization_pct?: number;
  variance?: number;
}

export interface CreateBudgetDTO {
  department_id: string;
  category_id?: string;
  year: number;
  month?: number;
  budget_amount: number;
  notes?: string;
}

export interface BudgetOverview {
  year: number;
  total_allocated: number;
  total_actual: number;
  total_variance: number;
  utilization_pct: number;
  by_department: DepartmentBudgetSummary[];
}

export interface DepartmentBudgetSummary {
  department_id: string;
  department_name: string;
  allocated: number;
  actual: number;
  variance: number;
  utilization_pct: number;
}

// ============================================
// NOTES DE FRAIS
// ============================================

export interface ExpenseReport {
  id: string;
  workspace_id: string;
  member_id: string;
  member_name: string;
  department_id: string | null;
  title: string;
  description: string | null;
  status: ExpenseStatus;
  total_amount: number;
  currency: string;
  submitted_at: Date | null;
  reviewed_at: Date | null;
  reviewer_name: string | null;
  review_notes: string | null;
  reimbursed_at: Date | null;
  created_at: Date;
  updated_at: Date;
  // Relations
  items?: ExpenseItem[];
  department?: Department;
}

export interface ExpenseItem {
  id: string;
  expense_report_id: string;
  date: Date;
  description: string;
  category_id: string | null;
  amount: number;
  currency: string;
  tva_rate: number;
  tva_amount: number;
  receipt_url: string | null;
  notes: string | null;
  created_at: Date;
  // Computed
  category_name?: string;
}

export interface CreateExpenseReportDTO {
  member_id: string;
  member_name: string;
  department_id?: string;
  title: string;
  description?: string;
  currency?: string;
}

export interface UpdateExpenseReportDTO {
  title?: string;
  description?: string;
  department_id?: string;
}

export interface CreateExpenseItemDTO {
  date: string;
  description: string;
  category_id?: string;
  amount: number;
  currency?: string;
  tva_rate?: number;
  receipt_url?: string;
  notes?: string;
}

export interface ExpenseReportFilters {
  status?: ExpenseStatus;
  member_id?: string;
  department_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

// ============================================
// RAPPROCHEMENT BANCAIRE
// ============================================

export interface BankTransaction {
  id: string;
  workspace_id: string;
  bank_account_name: string | null;
  transaction_date: Date;
  value_date: Date | null;
  description: string;
  reference: string | null;
  amount: number;
  type: TransactionType;
  matched_invoice_id: string | null;
  match_confidence: number | null;
  is_reconciled: boolean;
  category_suggestion: string | null;
  raw_data: string | null;
  imported_at: Date | null;
  created_at: Date;
  // Relations
  matched_invoice?: Invoice;
  category_name?: string;
}

export interface ImportBankTransactionDTO {
  transaction_date: string;
  value_date?: string;
  description: string;
  reference?: string;
  amount: number;
  type: TransactionType;
  bank_account_name?: string;
}

export interface BankTransactionFilters {
  date_from?: string;
  date_to?: string;
  type?: TransactionType;
  is_reconciled?: boolean;
  min_amount?: number;
  max_amount?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ReconciliationSummary {
  total_transactions: number;
  matched_count: number;
  unmatched_count: number;
  partial_count: number;
  excluded_count: number;
  total_credits: number;
  total_debits: number;
  matched_amount: number;
  unmatched_amount: number;
}

export interface AutoMatchResult {
  transaction_id: string;
  invoice_id: string;
  confidence: number;
  match_reason: string;
}

// ============================================
// ALERTES COMPTABLES
// ============================================

export interface AccountingAlert {
  id: string;
  workspace_id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  related_entity_id: string | null;
  related_entity_type: string | null;
  is_read: boolean;
  is_dismissed: boolean;
  metadata: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

export interface AlertCounts {
  total: number;
  unread: number;
  info: number;
  warning: number;
  critical: number;
}

// ============================================
// FEC (Fichier des Écritures Comptables)
// ============================================

export interface FECEntry {
  JournalCode: string;
  JournalLib: string;
  EcritureNum: string;
  EcritureDate: string;
  CompteNum: string;
  CompteLib: string;
  CompAuxNum: string;
  CompAuxLib: string;
  PieceRef: string;
  PieceDate: string;
  EcritureLib: string;
  Debit: string;
  Credit: string;
  EcritureLet: string;
  DateLet: string;
  ValidDate: string;
  Montantdevise: string;
  Idevise: string;
}

export interface FECGenerationResult {
  filename: string;
  filepath: string;
  entry_count: number;
  period: { year: number; start: string; end: string };
  generated_at: string;
}

// ============================================
// ÉTATS FINANCIERS
// ============================================

export interface BalanceSheet {
  workspace_id: string;
  date: string;
  assets: {
    current: BalanceSheetLine[];
    non_current: BalanceSheetLine[];
    total: number;
  };
  liabilities: {
    current: BalanceSheetLine[];
    non_current: BalanceSheetLine[];
    total: number;
  };
  equity: {
    lines: BalanceSheetLine[];
    total: number;
  };
}

export interface BalanceSheetLine {
  account_code: string;
  label: string;
  amount: number;
}

export interface ProfitLoss {
  workspace_id: string;
  period: { start: string; end: string };
  revenue: ProfitLossLine[];
  total_revenue: number;
  cost_of_goods: ProfitLossLine[];
  total_cogs: number;
  gross_profit: number;
  operating_expenses: ProfitLossLine[];
  total_operating_expenses: number;
  operating_income: number;
  other_income: ProfitLossLine[];
  other_expenses: ProfitLossLine[];
  net_income_before_tax: number;
  tax: number;
  net_income: number;
}

export interface ProfitLossLine {
  category_id: string | null;
  label: string;
  amount: number;
  count: number;
}

// ============================================
// PRÉDICTIONS IA
// ============================================

export interface CashFlowPrediction {
  month: string;
  predicted_income: number;
  predicted_expense: number;
  predicted_balance: number;
  confidence: number;
  factors: string[];
}

export interface CashFlowForecast {
  workspace_id: string;
  generated_at: string;
  current_balance: number;
  predictions: CashFlowPrediction[];
  summary: string;
  risk_level: 'low' | 'medium' | 'high';
}

export interface AnomalyDetectionResult {
  workspace_id: string;
  generated_at: string;
  anomalies: Anomaly[];
  summary: string;
}

export interface Anomaly {
  type: string;
  severity: AlertSeverity;
  description: string;
  entity_id: string | null;
  entity_type: string | null;
  expected_value: number | null;
  actual_value: number | null;
  deviation_pct: number | null;
  recommendation: string;
}

export interface SmartCategorization {
  suggested_category: string;
  confidence: number;
  reasoning: string;
  alternatives: Array<{ category: string; confidence: number }>;
}

// ============================================
// FILTRES (v1.0)
// ============================================

export interface InvoiceFilters {
  type?: InvoiceType;
  status?: InvoiceStatus;
  category_id?: string;
  contact_id?: string;
  department_id?: string;
  document_type?: DocumentType;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ExportFilters {
  date_from?: string;
  date_to?: string;
  type?: InvoiceType;
  category_id?: string;
  status?: InvoiceStatus;
}

// ============================================
// STATS & ANALYTICS (v1.0)
// ============================================

export interface DashboardStats {
  total_income: number;
  total_expense: number;
  balance: number;
  invoice_count: number;
  pending_count: number;
  top_categories: CategoryStats[];
  monthly_trend: MonthlyTrend[];
}

export interface CategoryStats {
  category_id: string;
  category_name: string;
  type: CategoryType;
  total: number;
  count: number;
}

export interface MonthlyTrend {
  month: number;
  year: number;
  income: number;
  expense: number;
}

export interface MonthlyAnalytics {
  period: { month: number; year: number };
  income: { total: number; by_category: CategoryStats[] };
  expense: { total: number; by_category: CategoryStats[] };
  tva: TVAAnalytics[];
  comparison: {
    previous_month: { income: number; expense: number };
    variation_income: number;
    variation_expense: number;
  };
}

export interface TVAAnalytics {
  taux: number;
  base_ht: number;
  montant_collecte: number;
  montant_deductible: number;
  solde: number;
}

// ============================================
// DTOs (v1.0 + v2.0 extensions)
// ============================================

export interface CreateInvoiceDTO {
  category_id?: string;
  type: InvoiceType;
  fournisseur: string;
  reference?: string;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  tva_rate?: number;
  date_facture: string;
  date_echeance?: string;
  notes?: string;
  line_items?: CreateLineItemDTO[];
  // v2.0 extensions
  client_name?: string;
  client_email?: string;
  document_type?: DocumentType;
  currency?: string;
  contact_id?: string;
  department_id?: string;
}

export interface CreateLineItemDTO {
  description: string;
  quantity: number;
  unit_price: number;
  tva_rate: number;
}

export interface UpdateInvoiceDTO extends Partial<CreateInvoiceDTO> {
  status?: InvoiceStatus;
}

export interface CreateCategoryDTO {
  name: string;
  slug?: string;
  type: CategoryType;
  icon?: string;
  color?: string;
}

// ============================================
// RÉPONSES API PAGINÉES
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
