import type { Room, RoomType, RoomStatus } from '@/types/models';

// Room types are now string literals as defined in models.ts
export const mockRoomTypes: RoomType[] = ['standard', 'deluxe', 'suite', 'presidential'];

export const mockRooms: Room[] = [
  {
    _id: '101',
    roomNumber: '101',
    type: 'standard',
    floor: 1,
    capacity: 2,
    pricePerNight: 100,
    status: 'available',
    amenities: ['WiFi', 'TV', 'Air Conditioning'],
    description: 'Comfortable standard room with basic amenities',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: '102',
    roomNumber: '102',
    type: 'standard',
    floor: 1,
    capacity: 2,
    pricePerNight: 100,
    status: 'occupied',
    amenities: ['WiFi', 'TV', 'Air Conditioning'],
    description: 'Comfortable standard room with basic amenities',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-14')
  },
  {
    _id: '201',
    roomNumber: '201',
    type: 'deluxe',
    floor: 2,
    capacity: 3,
    pricePerNight: 150,
    status: 'maintenance',
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony'],
    description: 'Spacious deluxe room with premium amenities',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-13')
  },
  {
    _id: '202',
    roomNumber: '202',
    type: 'deluxe',
    floor: 2,
    capacity: 3,
    pricePerNight: 150,
    status: 'available',
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony'],
    description: 'Spacious deluxe room with premium amenities',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: '301',
    roomNumber: '301',
    type: 'suite',
    floor: 3,
    capacity: 4,
    pricePerNight: 250,
    status: 'occupied',
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony', 'Jacuzzi', 'Living Room'],
    description: 'Luxury suite with separate living area',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-14')
  }
];