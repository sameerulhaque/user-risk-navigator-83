
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, User } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to refresh user data
  const refreshUserData = async () => {
    try {
      if (userService.checkAuth()) {
        const currentUser = await userService.getCurrentUser();
        setUser(currentUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Auth refresh error:', error);
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const success = await refreshUserData();
        if (!success) {
          // If normal auth check fails, try token refresh
          const refreshSuccess = await userService.refreshToken();
          if (refreshSuccess) {
            await refreshUserData();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Set up an interval to periodically check authentication status
    // This helps detect token changes across tabs
    const authCheckInterval = setInterval(() => {
      refreshUserData();
    }, 60000); // Check every minute

    return () => {
      clearInterval(authCheckInterval);
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await userService.login({ email, password });
      
      if (response.isSuccess && response.value) {
        setUser(response.value);
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      } else {
        toast({
          title: "Login failed",
          description: response.errors[0] || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string, phone?: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await userService.register({ fullName, email, password, phone });
      
      if (response.isSuccess && response.value) {
        setUser(response.value);
        toast({
          title: "Registration successful",
          description: "Your account has been created",
        });
      } else {
        toast({
          title: "Registration failed",
          description: response.errors[0] || "Could not create account",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    userService.logout();
    setUser(null);
    navigate('/');
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'Admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
