import type { Reservation, ReservationStatus, Guest } from '@/types/models';
import { RESERVATION_STATUSES } from '@/types/models';

export const mockGuests: Guest[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+1234567890',
    address: '123 Main St, City, State 12345',
    dateOfBirth: new Date('1985-06-15'),
    nationality: 'American',
    idType: 'passport',
    idNumber: 'P123456789',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@email.com',
    phone: '+1234567891',
    address: '456 Oak Ave, City, State 12345',
    dateOfBirth: new Date('1990-03-22'),
    nationality: 'Canadian',
    idType: 'passport',
    idNumber: 'C987654321',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@email.com',
    phone: '+1234567892',
    address: '789 Pine St, City, State 12345',
    dateOfBirth: new Date('1988-11-08'),
    nationality: 'British',
    idType: 'passport',
    idNumber: 'B456789123',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }
];

export const mockReservations: Reservation[] = [
  {
    id: '1',
    guestId: '1',
    roomId: '102',
    checkInDate: new Date('2024-01-10'),
    checkOutDate: new Date('2024-01-15'),
    actualCheckInDate: new Date('2024-01-10T15:00:00Z'),
    actualCheckOutDate: null,
    adults: 2,
    children: 0,
    totalAmount: 500,
    paidAmount: 500,
    status: RESERVATION_STATUSES.CHECKED_IN,
    specialRequests: 'Late check-in requested',
    paymentStatus: 'paid',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '2',
    guestId: '2',
    roomId: '201',
    checkInDate: new Date('2024-01-20'),
    checkOutDate: new Date('2024-01-25'),
    actualCheckInDate: null,
    actualCheckOutDate: null,
    adults: 1,
    children: 1,
    totalAmount: 750,
    paidAmount: 200,
    status: RESERVATION_STATUSES.CONFIRMED,
    specialRequests: 'Extra bed for child',
    paymentStatus: 'partial',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08')
  },
  {
    id: '3',
    guestId: '3',
    roomId: '301',
    checkInDate: new Date('2024-01-12'),
    checkOutDate: new Date('2024-01-18'),
    actualCheckInDate: new Date('2024-01-12T14:00:00Z'),
    actualCheckOutDate: null,
    adults: 2,
    children: 0,
    totalAmount: 1500,
    paidAmount: 1500,
    status: RESERVATION_STATUSES.CHECKED_IN,
    specialRequests: 'Champagne and flowers for anniversary',
    paymentStatus: 'paid',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '4',
    guestId: '1',
    roomId: '202',
    checkInDate: new Date('2024-02-01'),
    checkOutDate: new Date('2024-02-05'),
    actualCheckInDate: null,
    actualCheckOutDate: null,
    adults: 2,
    children: 1,
    totalAmount: 600,
    paidAmount: 0,
    status: RESERVATION_STATUSES.PENDING,
    specialRequests: '',
    paymentStatus: 'pending',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];