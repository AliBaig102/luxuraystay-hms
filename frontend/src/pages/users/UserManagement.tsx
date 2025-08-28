import { useState, useEffect } from "react";
import { useMockApi } from "@/hooks/useMockApi";
import {
  USER_ROLES,
  USER_STATUSES,
  type User,
  type UserRole,
  type UserStatus,
} from "@/types/models";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Users,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { ManagerOrAdmin } from "@/components/auth/ProtectedRoute";
import { getRoleDisplayName } from "@/utils/permissions";

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  password?: string;
  confirmPassword?: string;
}

const initialFormData: UserFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: USER_ROLES.RECEPTIONIST,
  status: USER_STATUSES.ACTIVE,
};

const userRoleOptions = [
  { value: USER_ROLES.ADMIN, label: "Administrator" },
  { value: USER_ROLES.MANAGER, label: "Manager" },
  { value: USER_ROLES.RECEPTIONIST, label: "Receptionist" },
  { value: USER_ROLES.HOUSEKEEPING, label: "Housekeeping Staff" },
  { value: USER_ROLES.MAINTENANCE, label: "Maintenance Staff" },
];

const userStatusOptions = [
  { value: USER_STATUSES.ACTIVE, label: "Active" },
  { value: USER_STATUSES.INACTIVE, label: "Inactive" },
  { value: USER_STATUSES.SUSPENDED, label: "Suspended" },
];

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState("all");
  const [showPassword, setShowPassword] = useState(false);

  const {
    data: usersData,
    get,
    post,
    put,
    delete: del,
  } = useMockApi<User[]>("/users");
  const { user: currentUser } = useAuth();

  // Update data when mock data changes
  useEffect(() => {
    if (usersData) {
      setUsers(usersData);
      setFilteredUsers(usersData);
    }
  }, [usersData]);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Filter by active tab
    if (activeTab !== "all") {
      if (activeTab === "staff") {
        filtered = filtered.filter(
          (user) =>
            user.role !== USER_ROLES.GUEST && user.role !== USER_ROLES.ADMIN
        );
      } else if (activeTab === "admins") {
        filtered = filtered.filter((user) => user.role === USER_ROLES.ADMIN);
      } else {
        filtered = filtered.filter((user) => user.status === activeTab);
      }
    }

    if (searchTerm) {
      filtered = filtered.filter((user) => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const email = user.email.toLowerCase();
        const phone = user.phone?.toLowerCase() || "";
        const role = getRoleDisplayName(user.role).toLowerCase();

        return (
          fullName.includes(searchTerm.toLowerCase()) ||
          email.includes(searchTerm.toLowerCase()) ||
          phone.includes(searchTerm.toLowerCase()) ||
          role.includes(searchTerm.toLowerCase())
        );
      });
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter, activeTab]);

  const fetchUsers = async () => {
    try {
      const response = await get<User[]>("/users");
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await put(`/users/${editingUser._id}`, updateData);
      } else {
        await post("/users", formData);
      }

      setIsDialogOpen(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      status: user.status,
    });
    setShowPassword(false);
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (userId === currentUser?._id) {
      toast.error("You cannot delete your own account");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    )
      return;

    try {
      await del(`/users/${userId}`);
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleStatusToggle = async (
    userId: string,
    currentStatus: UserStatus
  ) => {
    if (userId === currentUser?._id) {
      toast.error("You cannot change your own status");
      return;
    }

    const newStatus =
      currentStatus === USER_STATUSES.ACTIVE
        ? USER_STATUSES.INACTIVE
        : USER_STATUSES.ACTIVE;

    try {
      const response = await put(`/users/${userId}`, { status: newStatus });
      if (response.response.success) {
        toast.success(
          `User ${
            newStatus === USER_STATUSES.ACTIVE ? "activated" : "deactivated"
          } successfully`
        );
        fetchUsers();
      }
    } catch (err) {
      console.error("Error updating user status:", err);
      toast.error("Failed to update user status");
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingUser(null);
    setShowPassword(false);
  };

  const getStatusBadgeVariant = (status: UserStatus) => {
    switch (status) {
      case USER_STATUSES.ACTIVE:
        return "default";
      case USER_STATUSES.INACTIVE:
        return "secondary";
      case USER_STATUSES.SUSPENDED:
        return "destructive";
      default:
        return "outline";
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return "destructive";
      case USER_ROLES.MANAGER:
        return "default";
      case USER_ROLES.RECEPTIONIST:
        return "secondary";
      case USER_ROLES.HOUSEKEEPING:
      case USER_ROLES.MAINTENANCE:
        return "outline";
      default:
        return "outline";
    }
  };

  const getUserInitials = (user: User) => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(
      0
    )}`.toUpperCase();
  };

  const getUserStats = () => {
    const total = users.length;
    const active = users.filter(
      (u) => u.status === USER_STATUSES.ACTIVE
    ).length;
    const inactive = users.filter(
      (u) => u.status === USER_STATUSES.INACTIVE
    ).length;
    const staff = users.filter(
      (u) => u.role !== USER_ROLES.GUEST && u.role !== USER_ROLES.ADMIN
    ).length;
    const admins = users.filter((u) => u.role === USER_ROLES.ADMIN).length;

    return { total, active, inactive, staff, admins };
  };

  const stats = getUserStats();

  return (
    <ManagerOrAdmin>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage staff accounts and permissions
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? "Edit User" : "Add New User"}
                </DialogTitle>
                <DialogDescription>
                  {editingUser
                    ? "Update user information and permissions"
                    : "Create a new user account"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: UserRole) =>
                        setFormData((prev) => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {userRoleOptions.map((option) => {
                          // Only allow admin creation for admin users
                          if (
                            option.value === USER_ROLES.ADMIN &&
                            currentUser?.role !== USER_ROLES.ADMIN
                          ) {
                            return null;
                          }
                          return (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: UserStatus) =>
                        setFormData((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {userStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {(!editingUser || showPassword) && (
                  <div className="space-y-4">
                    {editingUser && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="change-password"
                          checked={showPassword}
                          onCheckedChange={setShowPassword}
                        />
                        <Label htmlFor="change-password">Change Password</Label>
                      </div>
                    )}
                    {(!editingUser || showPassword) && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                password: e.target.value,
                              }))
                            }
                            required={!editingUser}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">
                            Confirm Password
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                confirmPassword: e.target.value,
                              }))
                            }
                            required={!editingUser}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingUser ? "Update User" : "Create User"}
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
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactive}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.staff}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Administrators
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.admins}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter and search users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name, email, phone, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {userRoleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {userStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All Users</TabsTrigger>
                <TabsTrigger value="staff">Staff</TabsTrigger>
                <TabsTrigger value="admins">Administrators</TabsTrigger>
                <TabsTrigger value={USER_STATUSES.ACTIVE}>Active</TabsTrigger>
                <TabsTrigger value={USER_STATUSES.INACTIVE}>
                  Inactive
                </TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab} className="mt-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="text-muted-foreground">
                              {"No users found"}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user._id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.profileImage} />
                                  <AvatarFallback>
                                    {getUserInitials(user)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center text-sm">
                                  <Mail className="mr-2 h-3 w-3" />
                                  {user.email}
                                </div>
                                {user.phone && (
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Phone className="mr-2 h-3 w-3" />
                                    {user.phone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getRoleBadgeVariant(user.role)}>
                                {getRoleDisplayName(user.role)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant={getStatusBadgeVariant(user.status)}
                                >
                                  {user.status}
                                </Badge>
                                {user._id !== currentUser?._id && (
                                  <Switch
                                    checked={
                                      user.status === USER_STATUSES.ACTIVE
                                    }
                                    onCheckedChange={() =>
                                      handleStatusToggle(user._id, user.status)
                                    }
                                  />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="mr-2 h-3 w-3" />
                                {format(
                                  new Date(user.createdAt),
                                  "MMM dd, yyyy"
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(user)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {user._id !== currentUser?._id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(user._id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
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
    </ManagerOrAdmin>
  );
}
