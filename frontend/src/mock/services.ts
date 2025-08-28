import { 
  mockRooms, 
  mockRoomTypes, 
  mockReservations, 
  mockGuests, 
  mockHousekeepingTasks, 
  mockHousekeepingStaff, 
  mockUsers, 
  mockCurrentUser 
} from './index';
import type { Room, Reservation, HousekeepingTask, User, Guest, RoomType } from '@/types/models';

// Simulate API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API Response wrapper
const createMockResponse = <T>(data: T, success: boolean = true) => ({
  data,
  success,
  message: success ? 'Operation successful' : 'Operation failed',
  timestamp: new Date().toISOString()
});

// Room Services
export const mockRoomServices = {
  async getRooms(): Promise<{ data: Room[], success: boolean }> {
    await delay();
    return createMockResponse(mockRooms);
  },

  async getRoomTypes(): Promise<{ data: RoomType[], success: boolean }> {
    await delay();
    return createMockResponse(mockRoomTypes);
  },

  async createRoom(roomData: Partial<Room>): Promise<{ data: Room, success: boolean }> {
    await delay();
    const newRoom: Room = {
      _id: Date.now().toString(),
      roomNumber: roomData.roomNumber || '101',
      type: roomData.type || 'standard',
      floor: roomData.floor || 1,
      capacity: roomData.capacity || 2,
      pricePerNight: roomData.pricePerNight || 100,
      amenities: roomData.amenities || [],
      status: roomData.status || 'available',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };
    mockRooms.push(newRoom);
    return createMockResponse(newRoom);
  },

  async updateRoom(id: string, roomData: Partial<Room>): Promise<{ data: Room, success: boolean }> {
    await delay();
    const roomIndex = mockRooms.findIndex(room => room._id === id);
    if (roomIndex === -1) {
      return createMockResponse(null as any, false);
    }
    mockRooms[roomIndex] = { ...mockRooms[roomIndex], ...roomData, updatedAt: new Date() };
    return createMockResponse(mockRooms[roomIndex]);
  },

  async deleteRoom(id: string): Promise<{ success: boolean }> {
    await delay();
    const roomIndex = mockRooms.findIndex(room => room._id === id);
    if (roomIndex === -1) {
      return createMockResponse(null as any, false);
    }
    mockRooms.splice(roomIndex, 1);
    return createMockResponse(null as any);
  }
};

// Reservation Services
export const mockReservationServices = {
  async getReservations(): Promise<{ data: Reservation[], success: boolean }> {
    await delay();
    return createMockResponse(mockReservations);
  },

  async getGuests(): Promise<{ data: Guest[], success: boolean }> {
    await delay();
    return createMockResponse(mockGuests);
  },

  async createReservation(reservationData: Partial<Reservation>): Promise<{ data: Reservation, success: boolean }> {
    await delay();
    const newReservation: Reservation = {
      _id: Date.now().toString(),
      guestId: reservationData.guestId || '',
      roomId: reservationData.roomId || '',
      checkInDate: reservationData.checkInDate || new Date(),
      checkOutDate: reservationData.checkOutDate || new Date(),
      numberOfGuests: reservationData.numberOfGuests || 1,
      status: reservationData.status || 'pending',
      totalAmount: reservationData.totalAmount || 0,
      depositAmount: reservationData.depositAmount || undefined,
      specialRequests: reservationData.specialRequests || undefined,
      source: reservationData.source || 'online',
      assignedRoomId: reservationData.assignedRoomId || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockReservations.push(newReservation);
    return createMockResponse(newReservation);
  },

  async updateReservation(id: string, reservationData: Partial<Reservation>): Promise<{ data: Reservation, success: boolean }> {
    await delay();
    const reservationIndex = mockReservations.findIndex(reservation => reservation._id === id);
    if (reservationIndex === -1) {
      return createMockResponse(null as any, false);
    }
    mockReservations[reservationIndex] = { ...mockReservations[reservationIndex], ...reservationData, updatedAt: new Date() };
    return createMockResponse(mockReservations[reservationIndex]);
  },

  async deleteReservation(id: string): Promise<{ success: boolean }> {
    await delay();
    const reservationIndex = mockReservations.findIndex(reservation => reservation._id === id);
    if (reservationIndex === -1) {
      return createMockResponse(null as any, false);
    }
    mockReservations.splice(reservationIndex, 1);
    return createMockResponse(null as any);
  }
};

// Housekeeping Services
export const mockHousekeepingServices = {
  async getTasks(): Promise<{ data: HousekeepingTask[], success: boolean }> {
    await delay();
    return createMockResponse(mockHousekeepingTasks);
  },

  async getStaff(): Promise<{ data: typeof mockHousekeepingStaff, success: boolean }> {
    await delay();
    return createMockResponse(mockHousekeepingStaff);
  },

  async createTask(taskData: Partial<HousekeepingTask>): Promise<{ data: HousekeepingTask, success: boolean }> {
    await delay();
    const newTask: HousekeepingTask = {
      _id: Date.now().toString(),
      roomId: taskData.roomId || '',
      assignedStaffId: taskData.assignedStaffId || '',
      taskType: taskData.taskType || 'daily_cleaning',
      status: taskData.status || 'pending',
      scheduledDate: taskData.scheduledDate || new Date(),
      completedDate: taskData.completedDate || undefined,
      notes: taskData.notes || undefined,
      priority: taskData.priority || 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockHousekeepingTasks.push(newTask);
    return createMockResponse(newTask);
  },

  async updateTask(id: string, taskData: Partial<HousekeepingTask>): Promise<{ data: HousekeepingTask, success: boolean }> {
    await delay();
    const taskIndex = mockHousekeepingTasks.findIndex(task => task._id === id);
    if (taskIndex === -1) {
      return createMockResponse(null as any, false);
    }
    mockHousekeepingTasks[taskIndex] = { ...mockHousekeepingTasks[taskIndex], ...taskData, updatedAt: new Date() };
    return createMockResponse(mockHousekeepingTasks[taskIndex]);
  },

  async deleteTask(id: string): Promise<{ success: boolean }> {
    await delay();
    const taskIndex = mockHousekeepingTasks.findIndex(task => task._id === id);
    if (taskIndex === -1) {
      return createMockResponse(null as any, false);
    }
    mockHousekeepingTasks.splice(taskIndex, 1);
    return createMockResponse(null as any);
  }
};

// User Services
export const mockUserServices = {
  async getUsers(): Promise<{ data: User[], success: boolean }> {
    await delay();
    return createMockResponse(mockUsers);
  },

  async getCurrentUser(): Promise<{ data: User, success: boolean }> {
    await delay();
    return createMockResponse(mockCurrentUser);
  },

  async createUser(userData: Partial<User>): Promise<{ data: User, success: boolean }> {
    await delay();
    const newUser: User = {
      _id: Date.now().toString(),
      email: userData.email || '',
      password: userData.password || 'defaultPassword123',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      phone: userData.phone || '',
      role: userData.role || 'guest',
      status: userData.status || 'active',
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      lastLogin: userData.lastLogin || undefined,
      profileImage: userData.profileImage || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockUsers.push(newUser);
    return createMockResponse(newUser);
  },

  async updateUser(id: string, userData: Partial<User>): Promise<{ data: User, success: boolean }> {
    await delay();
    const userIndex = mockUsers.findIndex(user => user._id === id);
    if (userIndex === -1) {
      return createMockResponse(null as any, false);
    }
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData, updatedAt: new Date() };
    return createMockResponse(mockUsers[userIndex]);
  },

  async deleteUser(id: string): Promise<{ success: boolean }> {
    await delay();
    const userIndex = mockUsers.findIndex(user => user._id === id);
    if (userIndex === -1) {
      return createMockResponse(null as any, false);
    }
    mockUsers.splice(userIndex, 1);
    return createMockResponse(null as any);
  }
};

// Auth Services
export const mockAuthServices = {
  async login(email: string): Promise<{ data: { user: User, token: string }, success: boolean }> {
    await delay();
    const user = mockUsers.find(u => u.email === email);
    if (user && user.status === 'active') {
      return createMockResponse({
        user,
        token: 'mock-jwt-token-' + Date.now()
      });
    }
    return createMockResponse(null as any, false);
  },

  async logout(): Promise<{ success: boolean }> {
    await delay();
    return createMockResponse(null as any);
  },

  async register(userData: Partial<User>): Promise<{ data: { user: User, token: string }, success: boolean }> {
    await delay();
    const newUser: User = {
      _id: Date.now().toString(),
      email: userData.email || '',
      password: userData.password || 'defaultPassword123',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      phone: userData.phone || '',
      role: 'guest',
      status: 'active',
      isActive: true,
      lastLogin: new Date(),
      profileImage: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockUsers.push(newUser);
    return createMockResponse({
      user: newUser,
      token: 'mock-jwt-token-' + Date.now()
    });
  }
};

// Export aliases for compatibility
export const authService = mockAuthServices;
export const roomService = mockRoomServices;
export const reservationService = mockReservationServices;
export const housekeepingService = mockHousekeepingServices;
export const userService = mockUserServices;