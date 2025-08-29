import { Search, Command, Sun, Cloud, Moon } from "lucide-react";

import { Button, Input, SidebarTrigger } from "@/components/ui";
import { ProfileDropdown } from "./ProfileDropdown";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    return (
      <>
        {hour < 12 ? (
          <Sun className="h-4 w-4" />
        ) : hour < 18 ? (
          <Cloud className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
        {hour < 12
          ? "Good morning"
          : hour < 18
          ? "Good afternoon"
          : "Good evening"}
        ,{" "}
      </>
    );
  };

  return (
    <header className="flex h-16 items-center gap-4 border-b px-6">
      <SidebarTrigger className="hover:bg-accent" />

      <div className="flex flex-1 items-center gap-4 md:gap-8">
        {/* Welcome Message */}
        <div className="hidden lg:block">
          <p className="text-sm font-medium flex items-center gap-1.5">
            {getGreeting()}
            <span className="font-semibold ">
              {user?.firstName + " " + user?.lastName || "User"}
            </span>
          </p>
        </div>

        {/* Enhanced Search Bar */}
        <form className="hidden flex-1 md:flex max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search rooms, guests, reservations..."
              className="w-full pl-10 pr-20 "
            />
            <div className="absolute right-2 top-1.5 flex items-center gap-1">
              <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs to-muted-foreground">
                <Command className="h-3 w-3" />K
              </kbd>
            </div>
          </div>
        </form>

        {/* Right Side Actions */}
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-2 mr-10">
            <Button variant="outline" size="sm">
              Quick Check-in
            </Button>
            <Button size="sm">New Reservation</Button>
          </div>
          <NotificationsDropdown />
          <ThemeToggle />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}
