import { useState, useEffect } from 'react';
import { useMockApi } from '@/hooks/useMockApi';
import type { HousekeepingTask, TaskStatus, Priority, Room, User } from '@/types/models';
import { TASK_STATUSES } from '@/types/models';
import { ENDPOINT_URLS } from '@/constants/endpoints';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Plus, Edit, Trash2, Search, Filter, CheckCircle, Clock, AlertTriangle, Calendar, User as UserIcon } from 'lucide-react';

import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { StaffOnly } from '@/components/auth/ProtectedRoute';

interface TaskFormData {
  title: string;
  description: string;
  roomId: string;
  assignedTo: string;
  priority: Priority;
  estimatedDuration: number;
  dueDate: string;
}

const initialFormData: TaskFormData = {
  title: '',
  description: '',
  roomId: '',
  assignedTo: '',
  priority: 'medium',
  estimatedDuration: 30,
  dueDate: ''
};

const taskStatusOptions = [
  { value: TASK_STATUSES.PENDING, label: 'Pending', icon: Clock },
  { value: TASK_STATUSES.IN_PROGRESS, label: 'In Progress', icon: AlertTriangle },
  { value: TASK_STATUSES.COMPLETED, label: 'Completed', icon: CheckCircle }
];

const taskPriorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

const predefinedTasks = [
  { title: 'Room Cleaning', description: 'Complete room cleaning including bathroom, bedroom, and common areas' },
  { title: 'Bed Making', description: 'Change bed linens and make beds' },
  { title: 'Bathroom Cleaning', description: 'Deep clean bathroom including toilet, shower, and sink' },
  { title: 'Vacuum Cleaning', description: 'Vacuum all carpeted areas and rugs' },
  { title: 'Trash Removal', description: 'Empty all trash bins and replace liners' },
  { title: 'Towel Replacement', description: 'Replace used towels with fresh ones' },
  { title: 'Amenity Restocking', description: 'Restock toiletries and room amenities' },
  { title: 'Maintenance Check', description: 'Check for any maintenance issues or damages' }
];

export function HousekeepingTasks() {
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<HousekeepingTask[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<HousekeepingTask | null>(null);
  const [formData, setFormData] = useState<TaskFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState('all');

  const { data: tasksData, get, post, put, delete: del } = useMockApi<HousekeepingTask[]>('/housekeeping');
  const { data: roomsData } = useMockApi<Room[]>('/rooms');
  const { data: usersData } = useMockApi<User[]>('/users');
  const { user } = useAuth();

  // Update data when mock data changes
  useEffect(() => {
    if (tasksData) {
      setTasks(tasksData);
      setFilteredTasks(tasksData);
    }
  }, [tasksData]);

  useEffect(() => {
    if (roomsData) {
      setRooms(roomsData);
    }
  }, [roomsData]);

  useEffect(() => {
    if (usersData) {
      const housekeepingStaff = usersData.filter(user => user.role === 'HOUSEKEEPING');
      setStaff(housekeepingStaff);
    }
  }, [usersData]);

  // Filter tasks based on search and filters
  useEffect(() => {
    let filtered = tasks;

    // Filter by active tab
    if (activeTab !== 'all') {
      if (activeTab === 'my-tasks') {
        filtered = filtered.filter(task => task.assignedTo === user?.id);
      } else {
        filtered = filtered.filter(task => task.status === activeTab);
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(task => {
        const room = rooms.find(r => r.id === task.roomId);
        const assignee = staff.find(s => s.id === task.assignedTo);
        const roomNumber = room ? room.roomNumber : '';
        const assigneeName = assignee ? `${assignee.firstName} ${assignee.lastName}` : '';
        
        return task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
               roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
               assigneeName.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    if (assigneeFilter !== 'all') {
      filtered = filtered.filter(task => task.assignedTo === assigneeFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, statusFilter, priorityFilter, assigneeFilter, activeTab, user, rooms, staff]);

  const fetchTasks = async () => {
    try {
      const response = await get<HousekeepingTask[]>('/housekeeping');
      setTasks(response.data);
      setFilteredTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTask) {
        await put(`/housekeeping/${editingTask._id}`, formData);
      } else {
        await post('/housekeeping', formData);
      }

      setIsDialogOpen(false);
      setEditingTask(null);
      resetForm();
      fetchTasks();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleEdit = (task: HousekeepingTask) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      roomId: task.roomId,
      assignedTo: task.assignedTo,
      priority: task.priority,
      estimatedDuration: task.estimatedDuration,
      dueDate: format(new Date(task.dueDate), 'yyyy-MM-dd')
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await del(`/housekeeping/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await put(ENDPOINT_URLS.HOUSEKEEPING.UPDATE_STATUS(taskId), { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleQuickTask = (predefinedTask: { title: string; description: string }) => {
    setFormData(prev => ({
      ...prev,
      title: predefinedTask.title,
      description: predefinedTask.description
    }));
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingTask(null);
  };

  const getStatusBadgeVariant = (status: TaskStatus) => {
    switch (status) {
      case TASK_STATUSES.PENDING:
        return 'secondary';
      case TASK_STATUSES.IN_PROGRESS:
        return 'default';
      case TASK_STATUSES.COMPLETED:
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: Priority) => {
  switch (priority) {
    case 'low':
      return 'secondary';
    case 'medium':
      return 'default';
    case 'high':
      return 'destructive';
    case 'urgent':
      return 'destructive';
    default:
      return 'default';
  }
};

  const getRoomNumber = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.roomNumber : 'Unknown Room';
  };

  const getAssigneeName = (assigneeId: string) => {
    const assignee = staff.find(s => s.id === assigneeId);
    return assignee ? `${assignee.firstName} ${assignee.lastName}` : 'Unassigned';
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === TASK_STATUSES.PENDING).length;
    const inProgress = tasks.filter(t => t.status === TASK_STATUSES.IN_PROGRESS).length;
    const completed = tasks.filter(t => t.status === TASK_STATUSES.COMPLETED).length;
    const myTasks = tasks.filter(t => t.assignedTo === user?.id).length;
    
    return { total, pending, inProgress, completed, myTasks };
  };

  const stats = getTaskStats();
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <StaffOnly>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Housekeeping Tasks</h1>
            <p className="text-muted-foreground">Manage cleaning tasks and room maintenance</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTask ? 'Edit Task' : 'New Task'}</DialogTitle>
                <DialogDescription>
                  {editingTask ? 'Update task details' : 'Create a new housekeeping task'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomId">Room</Label>
                    <Select value={formData.roomId} onValueChange={(value) => setFormData(prev => ({ ...prev, roomId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map(room => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.roomNumber} - {room.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assign To</Label>
                    <Select value={formData.assignedTo} onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map(member => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.firstName} {member.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value: Priority) => setFormData(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {taskPriorityOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedDuration">Duration (minutes)</Label>
                    <Input
                      id="estimatedDuration"
                      type="number"
                      min="5"
                      value={formData.estimatedDuration}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                     {loading ? 'Saving...' : (editingTask ? 'Update Task' : 'Create Task')}
                   </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.myTasks}</div>
              <Progress value={completionRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{completionRate}% completion rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Task Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Task Templates</CardTitle>
            <CardDescription>Create common tasks quickly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {predefinedTasks.map((task, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickTask(task)}
                  className="justify-start h-auto p-3"
                >
                  <div className="text-left">
                    <div className="font-medium text-sm">{task.title}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter and search tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks, rooms, or assignees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {taskStatusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  {taskPriorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  {staff.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
            <CardDescription>Manage housekeeping tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
                <TabsTrigger value={TASK_STATUSES.PENDING}>Pending</TabsTrigger>
                <TabsTrigger value={TASK_STATUSES.IN_PROGRESS}>In Progress</TabsTrigger>
                <TabsTrigger value={TASK_STATUSES.COMPLETED}>Completed</TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab} className="mt-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTasks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="text-muted-foreground">
                              No tasks found
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{task.title}</div>
                                <div className="text-sm text-muted-foreground">{task.description}</div>
                              </div>
                            </TableCell>
                            <TableCell>{getRoomNumber(task.roomId)}</TableCell>
                            <TableCell>{getAssigneeName(task.assignedTo)}</TableCell>
                            <TableCell>
                              <Badge variant={getPriorityBadgeVariant(task.priority)}>
                                {task.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={task.status}
                                onValueChange={(value: TaskStatus) => handleStatusUpdate(task.id, value)}
                              >
                                <SelectTrigger className="w-[130px]">
                                  <Badge variant={getStatusBadgeVariant(task.status)}>
                                    {task.status}
                                  </Badge>
                                </SelectTrigger>
                                <SelectContent>
                                  {taskStatusOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>{format(new Date(task.dueDate), 'MMM dd, yyyy')}</TableCell>
                            <TableCell>{task.estimatedDuration} min</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(task)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(task.id)}
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </StaffOnly>
  );
}