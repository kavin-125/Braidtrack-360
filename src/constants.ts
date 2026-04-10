import { Machine, Operator, IssueRecord } from './types';

export const MOCK_MACHINES: Machine[] = Array.from({ length: 10 }, (_, i) => ({
  id: `BM${(i + 1).toString().padStart(3, '0')}`,
  status: i % 4 === 0 ? 'running' : i % 4 === 1 ? 'issue' : i % 4 === 2 ? 'service' : 'off',
  production: Math.floor(Math.random() * 100),
  runtime: `${Math.floor(Math.random() * 20)}h ${Math.floor(Math.random() * 60)}m`,
  operatorId: 'OP001',
}));

export const MOCK_OPERATORS: Operator[] = [
  {
    id: 'OP001',
    name: 'John Doe',
    phone: '+1 234 567 890',
    shift: 'Day',
    machinesControlled: ['BM001', 'BM002', 'BM003'],
    performance: 92,
    status: 'active',
    username: 'johndoe',
  },
  {
    id: 'OP002',
    name: 'Jane Smith',
    phone: '+1 987 654 321',
    shift: 'Night',
    machinesControlled: ['BM004', 'BM005'],
    performance: 88,
    status: 'active',
    username: 'janesmith',
  },
];

export const MOCK_ISSUES: IssueRecord[] = [
  {
    id: 'ISS001',
    machineId: 'BM002',
    type: 'Yarn Break',
    startTime: '2024-05-20 10:30',
    duration: '15m',
    status: 'resolved',
  },
  {
    id: 'ISS002',
    machineId: 'BM005',
    type: 'Low Voltage',
    startTime: '2024-05-20 11:45',
    status: 'open',
  },
];

export const ISSUE_TYPES = [
  'No Power',
  'Low Voltage',
  'Yarn Break',
  'Needle Issue',
  'Mechanical Fault',
  'Planned Stop',
];
