export type MachineStatus = 'running' | 'off' | 'issue' | 'service';

export interface Machine {
  id: string;
  status: MachineStatus;
  production: number;
  runtime: string;
  operatorId?: string;
  lastIssue?: string;
  startTime?: string;
}

export interface Operator {
  id: string;
  name: string;
  phone: string;
  shift: 'Day' | 'Night';
  machinesControlled: string[];
  performance: number;
  status: 'active' | 'inactive';
  username: string;
}

export interface IssueRecord {
  id: string;
  machineId: string;
  type: string;
  startTime: string;
  endTime?: string;
  duration?: string;
  status: 'open' | 'resolved';
}

export type UserRole = 'operator' | 'admin';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  username: string;
}
