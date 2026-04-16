export interface Employee {
  id: string;
  name: string;
  email: string;
  salary: number;
}

export interface Payroll {
  employee_id: string;
  month: string;
  base_salary: number;
  bonus: number;
  deductions: number;
}
