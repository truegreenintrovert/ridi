
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Calendar, CreditCard, FileText, Activity, UserCog, Pill, Menu, UserX as UserMd, LogOut, User, Shield, FlaskRound as Flask, Package, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Patients", path: "/patients" },
  { icon: UserMd, label: "Doctors", path: "/doctors" },
  { icon: Calendar, label: "Appointments", path: "/appointments" },
  { icon: CreditCard, label: "Payments", path: "/payments" },
  { icon: FileText, label: "Invoices", path: "/invoices" },
  { icon: Pill, label: "Prescriptions", path: "/prescriptions" },
  { icon: Package, label: "Inventory", path: "/inventory" },
  { icon: UserCog, label: "Staff", path: "/staff" },
  { icon: Activity, label: "Health Records", path: "/health-records" },
  { icon: Flask, label: "Lab Tests", path: "/lab-tests" },
];

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user, userRole } = useAuth();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth/signin");
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-500';
      case 'doctor':
        return 'bg-blue-500';
      case 'staff':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Toggle */}
      <Button
        variant="ghost"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 border-r bg-card",
          !isSidebarOpen && "hidden md:block md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center border-b px-4">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span className="font-bold">HMS</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {sidebarItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Footer with User Controls */}
          <div className="border-t p-4">
            <div className="space-y-4">
              {/* User Profile */}
              <Link
                to="/profile"
                className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium">{user?.email}</p>
                  <p className="truncate text-xs text-muted-foreground">View Profile</p>
                </div>
              </Link>

              {/* Theme, Role Badge and Logout Controls */}
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <ThemeToggle />
                  <div className={cn(
                    "px-2 py-1 rounded-full text-white font-medium text-xs capitalize",
                    getRoleBadgeColor(userRole)
                  )}>
                    {userRole || 'User'}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="hover:bg-destructive hover:text-destructive-foreground"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          isSidebarOpen ? "md:ml-64" : "md:ml-0"
        )}
      >
        <div className="container mx-auto p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

export default Layout;
