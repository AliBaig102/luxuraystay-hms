import { useState } from "react";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function ProfileDropdown() {
  const { user, handelLogout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await handelLogout();
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-500";
      case "MANAGER":
        return "bg-blue-500";
      case "RECEPTIONIST":
        return "bg-green-500";
      case "HOUSEKEEPING":
        return "bg-yellow-500";
      case "MAINTENANCE":
        return "bg-purple-500";
      case "GUEST":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full hover:bg-accent/50 transition-colors duration-200"
        >
          <Avatar className="h-9 w-9 ring-2 ring-background shadow-md">
            <AvatarImage src={user?.profileImage} alt={user?.firstName} />
            <AvatarFallback
              className={`${getRoleColor(
                user?.role || ""
              )} text-white font-semibold`}
            >
              {getInitials(user?.firstName || "User")}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.profileImage} alt={user?.firstName} />
                <AvatarFallback
                  className={`${getRoleColor(
                    user?.role || ""
                  )} text-white font-semibold`}
                >
                  {getInitials(user?.firstName || "User")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-none">
                  {user?.firstName}
                </p>
                <p className="text-xs leading-none text-muted-foreground mt-1">
                  {user?.email || "No email available"}
                </p>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer hover:bg-accent/50 transition-colors">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
