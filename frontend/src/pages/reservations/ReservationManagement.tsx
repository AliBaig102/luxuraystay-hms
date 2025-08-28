import { useState, useEffect } from 'react';
import { useMockApi } from '@/hooks/useMockApi';
import type { Reservation, ReservationStatus, Room, User } from '@/types/models';
import { RESERVATION_STATUSES, USER_ROLES } from '@/types/models';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Edit, Trash2, Search, Filter, Eye, Calendar as CalendarIcon, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { StaffOnly } from '@/components/auth/ProtectedRoute';

interface ReservationFormData {
  guestId: string;
  roomId: string;
  checkInDate: Date | undefined;
  checkOutDate: Date | undefined;
  numberOfGuests: number;
  totalAmount: number;
  status: ReservationStatus;
  specialRequests: string;
}

const initialFormData: ReservationFormData = {
  guestId: '',
  roomId: '',
  checkInDate: undefined,
  checkOutDate: undefined,
  numberOfGuests: 1,
  totalAmount: 0,
  status: RESERVATION_STATUSES.PENDING,
  specialRequests: ''
};

const reservationStatusOptions = [
  { value: RESERVATION_STATUSES.PENDING, label: 'Pending' },
  { value: RESERVATION_STATUSES.CONFIRMED, label: 'Confirmed' },
  { value: RESERVATION_STATUSES.CHECKED_IN, label: 'Checked In' },
  { value: RESERVATION_STATUSES.CHECKED_OUT, label: 'Checked Out' },
  { value: RESERVATION_STATUSES.CANCELLED, label: 'Cancelled' },
  { value: RESERVATION_STATUSES.NO_SHOW, label: 'No Show' }
];

export function ReservationManagement() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [viewingReservation, setViewingReservation] = useState<Reservation | null>(null);
  const [formData, setFormData] = useState<ReservationFormData>(initialFormData);

  const { data: reservationsData, get, post, put, delete: del } = useMockApi<Reservation[]>('/reservations');
  const { data: roomsData } = useMockApi<Room[]>('/rooms');
  const { data: usersData } = useMockApi<User[]>('/users');

  // Update data when mock data changes
  useEffect(() => {
    if (reservationsData) {
      setReservations(reservationsData);
      setFilteredReservations(reservationsData);
    }
  }, [reservationsData]);

  useEffect(() => {
    if (roomsData) {
      setRooms(roomsData);
    }
  }, [roomsData]);

  useEffect(() => {
    if (usersData) {
      const guestUsers = usersData.filter(user => user.role === USER_ROLES.GUEST);
      setGuests(guestUsers);
    }
  }, [usersData]);

  // Filter reservations based on search and filters
  useEffect(() => {
    let filtered = reservations;

    if (searchTerm) {
      filtered = filtered.filter(reservation => {
        const guest = guests.find(g => g._id === reservation.guestId);
        const room = rooms.find(r => r._id === reservation.roomId);
        const guestName = guest ? `${guest.firstName} ${guest.lastName}` : '';
        const roomNumber = room ? room.roomNumber : '';
        
        return guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
               reservation._id.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      filtered = filtered.filter(reservation => {
        const checkInDate = new Date(reservation.checkInDate);
        const checkOutDate = new Date(reservation.checkOutDate);
        
        switch (dateFilter) {
          case 'today':
            return checkInDate <= todayStart && checkOutDate >= todayStart;
          case 'upcoming':
            return checkInDate > todayStart;
          case 'past':
            return checkOutDate < todayStart;
          default:
            return true;
        }
      });
    }

    setFilteredReservations(filtered);
  }, [reservations, searchTerm, statusFilter, dateFilter, guests, rooms]);

  // Calculate total amount when dates or room changes
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate && formData.roomId) {
      const room = rooms.find(r => r._id === formData.roomId);
      if (room) {
        const nights = Math.ceil(
          (formData.checkOutDate.getTime() - formData.checkInDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const total = nights * room.pricePerNight;
        setFormData(prev => ({ ...prev, totalAmount: total }));
      }
    }
  }, [formData.checkInDate, formData.checkOutDate, formData.roomId, rooms]);

  const fetchReservations = async () => {
    try {
      const response = await get<Reservation[]>('/reservations');
      setReservations(response.data);
      setFilteredReservations(response.data);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.checkInDate || !formData.checkOutDate) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (formData.checkOutDate <= formData.checkInDate) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    const reservationData = {
      ...formData,
      checkInDate: formData.checkInDate.toISOString(),
      checkOutDate: formData.checkOutDate.toISOString()
    };

    try {
      if (editingReservation) {
        await put(`/reservations/${editingReservation._id}`, reservationData);
      } else {
        await post('/reservations', reservationData);
      }

      setIsDialogOpen(false);
      setEditingReservation(null);
      resetForm();
      fetchReservations();
    } catch (error) {
      console.error('Failed to save reservation:', error);
    }
  };

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setFormData({
      guestId: reservation.guestId,
      roomId: reservation.roomId,
      checkInDate: new Date(reservation.checkInDate),
      checkOutDate: new Date(reservation.checkOutDate),
      numberOfGuests: reservation.numberOfGuests,
      totalAmount: reservation.totalAmount,
      status: reservation.status,
      specialRequests: reservation.specialRequests || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (reservationId: string) => {
    if (!confirm('Are you sure you want to delete this reservation?')) return;

    try {
      await del(`/reservations/${reservationId}`);
      fetchReservations();
    } catch (error) {
      console.error('Failed to delete reservation:', error);
    }
  };

  const handleView = (reservation: Reservation) => {
    setViewingReservation(reservation);
    setIsViewDialogOpen(true);
  };

  const handleStatusUpdate = async (reservationId: string, newStatus: ReservationStatus) => {
    try {
      const response = await put(`/reservations/${reservationId}`, { status: newStatus });
      if (response.response.success) {
        toast.success('Reservation status updated successfully');
        fetchReservations();
      }
    } catch (err) {
      console.error('Error updating reservation status:', err);
      toast.error('Failed to update reservation status');
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingReservation(null);
  };

  const getStatusBadgeVariant = (status: ReservationStatus) => {
    switch (status) {
      case RESERVATION_STATUSES.CONFIRMED:
        return 'default';
      case RESERVATION_STATUSES.PENDING:
        return 'secondary';
      case RESERVATION_STATUSES.CHECKED_IN:
        return 'default';
      case RESERVATION_STATUSES.CHECKED_OUT:
        return 'outline';
      case RESERVATION_STATUSES.CANCELLED:
        return 'destructive';
      case RESERVATION_STATUSES.NO_SHOW:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getGuestName = (guestId: string) => {
    const guest = guests.find(g => g._id === guestId);
    return guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown Guest';
  };

  const getRoomNumber = (roomId: string) => {
    const room = rooms.find(r => r._id === roomId);
    return room ? room.roomNumber : 'Unknown Room';
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <StaffOnly>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reservation Management</h1>
            <p className="text-muted-foreground">Manage hotel reservations and bookings</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                New Reservation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingReservation ? 'Edit Reservation' : 'New Reservation'}</DialogTitle>
                <DialogDescription>
                  {editingReservation ? 'Update reservation details' : 'Create a new reservation'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guestId">Guest</Label>
                    <Select value={formData.guestId} onValueChange={(value) => setFormData(prev => ({ ...prev, guestId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select guest" />
                      </SelectTrigger>
                      <SelectContent>
                        {guests.map(guest => (
                          <SelectItem key={guest._id} value={guest._id}>
                            {guest.firstName} {guest.lastName} ({guest.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roomId">Room</Label>
                    <Select value={formData.roomId} onValueChange={(value) => setFormData(prev => ({ ...prev, roomId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map(room => (
                          <SelectItem key={room._id} value={room._id}>
                            {room.roomNumber} - {room.type} (${room.pricePerNight}/night)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Check-in Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.checkInDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.checkInDate ? format(formData.checkInDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.checkInDate}
                          onSelect={(date) => setFormData(prev => ({ ...prev, checkInDate: date }))}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Check-out Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.checkOutDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.checkOutDate ? format(formData.checkOutDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.checkOutDate}
                          onSelect={(date) => setFormData(prev => ({ ...prev, checkOutDate: date }))}
                          disabled={(date) => date <= (formData.checkInDate || new Date())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numberOfGuests">Number of Guests</Label>
                    <Input
                      id="numberOfGuests"
                      type="number"
                      min="1"
                      value={formData.numberOfGuests}
                      onChange={(e) => setFormData(prev => ({ ...prev, numberOfGuests: parseInt(e.target.value) }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: ReservationStatus) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reservationStatusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Total Amount ($)</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) }))}
                    required
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea
                    id="specialRequests"
                    value={formData.specialRequests}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                    rows={3}
                    placeholder="Any special requests or notes..."
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" >
                    { (editingReservation ? 'Update Reservation' : 'Create Reservation')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter and search reservations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by guest name, room number, or reservation ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {reservationStatusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reservations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Reservations ({filteredReservations.length})</CardTitle>
            <CardDescription>List of all reservations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {'No reservations found'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReservations.map((reservation) => (
                      <TableRow key={reservation._id}>
                        <TableCell className="font-medium">
                          {getGuestName(reservation.guestId)}
                        </TableCell>
                        <TableCell>{getRoomNumber(reservation.roomId)}</TableCell>
                        <TableCell>{format(new Date(reservation.checkInDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{format(new Date(reservation.checkOutDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="mr-1 h-4 w-4" />
                            {reservation.numberOfGuests}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={reservation.status}
                            onValueChange={(value: ReservationStatus) => handleStatusUpdate(reservation._id, value)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <Badge variant={getStatusBadgeVariant(reservation.status)}>
                                {reservation.status}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {reservationStatusOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>${reservation.totalAmount}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(reservation)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(reservation)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(reservation._id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* View Reservation Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reservation Details</DialogTitle>
              <DialogDescription>
                Detailed information about the reservation
              </DialogDescription>
            </DialogHeader>
            {viewingReservation && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Guest</Label>
                    <p className="text-lg font-semibold">{getGuestName(viewingReservation.guestId)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Room</Label>
                    <p className="text-lg font-semibold">{getRoomNumber(viewingReservation.roomId)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Check-in Date</Label>
                    <p className="text-lg font-semibold">{format(new Date(viewingReservation.checkInDate), 'PPP')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Check-out Date</Label>
                    <p className="text-lg font-semibold">{format(new Date(viewingReservation.checkOutDate), 'PPP')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Number of Guests</Label>
                    <p className="text-lg font-semibold">{viewingReservation.numberOfGuests}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Nights</Label>
                    <p className="text-lg font-semibold">
                      {calculateNights(viewingReservation.checkInDate.toString(), viewingReservation.checkOutDate.toString())}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge variant={getStatusBadgeVariant(viewingReservation.status)}>
                      {viewingReservation.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Total Amount</Label>
                    <p className="text-lg font-semibold">${viewingReservation.totalAmount}</p>
                  </div>
                </div>
                {viewingReservation.specialRequests && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Special Requests</Label>
                    <p className="mt-1">{viewingReservation.specialRequests}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                  <p className="text-sm">{format(new Date(viewingReservation.createdAt), 'PPP pp')}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </StaffOnly>
  );
}