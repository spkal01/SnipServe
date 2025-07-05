import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Menu, 
  BarChart2, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Home
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Pastes', href: '/admin/pastes', icon: FileText },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  // Fixed Animation variants with proper typing
  const sidebarVariants: Variants = {
    hidden: { 
      x: -280, 
      opacity: 0 
    },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring" as const,
        stiffness: 300, 
        damping: 30,
        staggerChildren: 0.1
      }
    }
  };

  const navItemVariants: Variants = {
    hidden: { 
      x: -20, 
      opacity: 0 
    },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring" as const, 
        stiffness: 400, 
        damping: 25 
      }
    }
  };

  const contentVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4, 
        ease: "easeOut" 
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { 
        duration: 0.3, 
        ease: "easeIn" 
      }
    }
  };

  const SidebarContent = () => (
    <motion.div 
      className="flex flex-col h-full"
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="p-7 border-b border-border"
        variants={navItemVariants}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent hover:from-orange-600 hover:to-red-600 transition-all duration-300">
            SnipServe
          </Link>
        </motion.div>
        <motion.div 
          className="mt-4"
          variants={navItemVariants}
        >
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition-all duration-300">
            Admin Panel
          </Badge>
        </motion.div>
      </motion.div>
      
      {/* Navigation */}
      <motion.nav 
        className="flex-1 p-4 space-y-2"
        variants={navItemVariants}
      >
        {navigation.map((item, index) => (
          <motion.div
            key={item.name}
            variants={navItemVariants}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-500 border border-orange-500/30 shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted hover:shadow-md'
              }`}
            >
              <motion.div
                animate={{ 
                  rotate: isActive(item.href) ? 360 : 0,
                  scale: isActive(item.href) ? 1.1 : 1
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <item.icon className="w-5 h-5" />
              </motion.div>
              <span className="font-medium">{item.name}</span>
              {isActive(item.href) && (
                <motion.div
                  className="ml-auto w-2 h-2 bg-orange-500 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                />
              )}
            </Link>
          </motion.div>
        ))}
      </motion.nav>

      {/* User Section */}
      <motion.div 
        className="p-4 border-t border-border"
        variants={navItemVariants}
      >
        <motion.div 
          className="flex items-center space-x-3 mb-3 p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200"
          whileHover={{ scale: 1.02 }}
        >
          <motion.div 
            className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            {user?.username?.[0]?.toUpperCase()}
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.username}
            </p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <motion.div 
        className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-sm"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent hover:from-orange-600 hover:to-red-600 transition-all duration-300">
            SnipServe Admin
          </Link>
        </motion.div>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="ghost" size="sm" className="hover:bg-muted transition-colors duration-200">
                <motion.div
                  animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-5 h-5" />
                </motion.div>
              </Button>
            </motion.div>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </motion.div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <motion.div 
          className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-card border-r border-border shadow-lg"
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <SidebarContent />
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-72">
          <motion.main 
            className="p-6"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={contentVariants}
            key={location.pathname}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={contentVariants}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
