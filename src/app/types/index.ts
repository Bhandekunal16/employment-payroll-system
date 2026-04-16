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
