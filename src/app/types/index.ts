export interface Employee {
  id: string;
  name: string;
  email: string;
  salary: number;
  createdAt?: string;
}

export interface Payroll {
  employee_id: string;
  month: string;
  base_salary: number;
  bonus: number;
  deductions: number;
}

export interface FormData {
  name: string;
  email: string;
  salary: number;
}

export interface Payroll_ {
  id: string;
  employee_id: string;
  employee_name?: string;
  month: string;
  base_salary: number;
  bonus: number;
  deductions: number;
  net_salary: number;
  created_at?: string;
}

export interface PayrollForm {
  employee_id: string;
  month: string;
  base_salary: number;
  bonus: number;
  deductions: number;
}
