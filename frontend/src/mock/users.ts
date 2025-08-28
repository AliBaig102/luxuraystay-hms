import type { User } from '@/types/models';
import { USER_ROLES, USER_STATUSES } from '@/types/models';

export const mockUsers: User[] = [
  {
    _id: '1',
    email: 'admin@luxuraystay.com',
    firstName: 'Admin',
    password: 'hashed_password_here',
    isActive: true,
    lastName: 'User',
    role: USER_ROLES.ADMIN,
    status: USER_STATUSES.ACTIVE,
    phone: '+1234567890',
    lastLogin: new Date('2024-01-15T08:00:00Z'),
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: '2',
    email: 'manager@luxuraystay.com',
    firstName: 'John',
    password: 'hashed_password_here',
    isActive: true,
    lastName: 'Manager',
    role: USER_ROLES.MANAGER,
    status: USER_STATUSES.ACTIVE,
    phone: '+1234567891',
    lastLogin: new Date('2024-01-15T07:30:00Z'),
    createdAt: new Date('2023-02-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: '3',
    email: 'receptionist@luxuraystay.com',
    firstName: 'Emily',
    lastName: 'Reception',
    role: USER_ROLES.RECEPTIONIST,
    status: USER_STATUSES.ACTIVE,
    phone: '+1234567892',
    password: 'hashed_password_here',
    isActive: true,
    lastLogin: new Date('2024-01-15T06:00:00Z'),
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: '4',
    email: 'housekeeper@luxuraystay.com',
    firstName: 'Maria',
    lastName: 'Garcia',
    role: USER_ROLES.HOUSEKEEPING,
    status: USER_STATUSES.ACTIVE,
    phone: '+1234567893',
    password: 'hashed_password_here',
    isActive: true,
    lastLogin: new Date('2024-01-15T05:30:00Z'),
    createdAt: new Date('2023-08-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: '5',
    email: 'maintenance@luxuraystay.com',
    firstName: 'Robert',
    lastName: 'Maintenance',
    role: USER_ROLES.MAINTENANCE,
    password: 'hashed_password_here',
    isActive: true,
    status: USER_STATUSES.ACTIVE,
    phone: '+1234567894',

    lastLogin: new Date('2024-01-14T16:00:00Z'),
    createdAt: new Date('2023-09-01'),
    updatedAt: new Date('2024-01-14')
  },
];

// Current logged in user for auth context
export const mockCurrentUser: User = mockUsers[0]; // Admin user