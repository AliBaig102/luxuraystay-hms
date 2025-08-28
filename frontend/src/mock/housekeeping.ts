import type { HousekeepingTask, TaskStatus, Priority, HousekeepingTaskType } from '@/types/models';

export const mockHousekeepingTasks: HousekeepingTask[] = [
  {
    id: '1',
    roomId: '101',
    assignedTo: 'housekeeper1',
    taskType: 'daily_cleaning',
    status: 'completed',
    priority: 'medium',
    description: 'Standard room cleaning',
    estimatedDuration: 45,
    actualDuration: 40,
    notes: 'Room cleaned thoroughly, fresh linens provided',
    scheduledDate: new Date('2024-01-15T09:00:00Z'),
    startedAt: new Date('2024-01-15T09:15:00Z'),
    completedAt: new Date('2024-01-15T09:55:00Z'),
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    roomId: '102',
    assignedTo: 'housekeeper1',
    taskType: 'daily_cleaning',
    status: 'in_progress',
    priority: 'high',
    description: 'Fix leaky faucet in bathroom',
    estimatedDuration: 60,
    actualDuration: null,
    notes: 'Guest reported dripping faucet',
    scheduledDate: new Date('2024-01-15T14:00:00Z'),
    startedAt: new Date('2024-01-15T14:10:00Z'),
    completedAt: null,
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '3',
    roomId: '201',
    assignedTo: 'housekeeper2',
    taskType: 'inspection',
    status: 'pending',
    priority: 'low',
    description: 'Weekly room inspection',
    estimatedDuration: 30,
    actualDuration: null,
    notes: 'Check all amenities and report any issues',
    scheduledDate: new Date('2024-01-16T10:00:00Z'),
    startedAt: null,
    completedAt: null,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '4',
    roomId: '202',
    assignedTo: 'housekeeper2',
    taskType: 'deep_cleaning',
    status: 'completed',
    priority: 'medium',
    description: 'Deep cleaning after checkout',
    estimatedDuration: 60,
    actualDuration: 55,
    notes: 'Room ready for next guest',
    scheduledDate: new Date('2024-01-15T11:00:00Z'),
    startedAt: new Date('2024-01-15T11:05:00Z'),
    completedAt: new Date('2024-01-15T12:00:00Z'),
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '5',
    roomId: '301',
    assignedTo: 'housekeeper1',
    taskType: 'daily_cleaning',
    status: 'pending',
    priority: 'high',
    description: 'Replace broken TV remote',
    estimatedDuration: 15,
    actualDuration: null,
    notes: 'Guest reported remote not working',
    scheduledDate: new Date('2024-01-16T09:00:00Z'),
    startedAt: null,
    completedAt: null,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

export const mockHousekeepingStaff = [
  {
    id: 'housekeeper1',
    name: 'Maria Garcia',
    shift: 'Morning (6AM - 2PM)',
    tasksAssigned: 3,
    tasksCompleted: 2
  },
  {
    id: 'housekeeper2',
    name: 'Sarah Johnson',
    shift: 'Afternoon (2PM - 10PM)',
    tasksAssigned: 2,
    tasksCompleted: 1
  }
];