import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService, { type Session, type User } from '../../services/auth.service';

// No need for a separate Auth interface since we're only storing the session

// Define AuthContext interface
interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (firstName: string, lastName: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// Create AuthProvider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Try to get session from localStorage
        const sessionStr = localStorage.getItem('session');
        if (sessionStr) {
          const storedSession: Session = JSON.parse(sessionStr);
          setSession(storedSession);
          setUser(storedSession);
          authService.setupAxiosInterceptors(storedSession.token);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear potentially corrupted session data
        localStorage.removeItem('session');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const newSession = await authService.signIn(email, password);
      setSession(newSession);
      setUser(newSession);
      
      // Store session in localStorage
      localStorage.setItem('session', JSON.stringify(newSession));
      
      authService.setupAxiosInterceptors(newSession.token);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (firstName: string, lastName: string, email: string, password: string, confirmPassword: string) => {
    setIsLoading(true);
    try {
      const newSession = await authService.signUp(firstName, lastName, email, password, confirmPassword);
      setSession(newSession);
      setUser(newSession);
      
      // Store session in localStorage
      localStorage.setItem('session', JSON.stringify(newSession));
      
      authService.setupAxiosInterceptors(newSession.token);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = () => {
    // Remove session from localStorage
    localStorage.removeItem('session');
    setSession(null);
    setUser(null);
  };

  // Update user function
  const updateUser = (updates: Partial<User>) => {
    if (session) {
      const updatedSession = { ...session, ...updates };
      setSession(updatedSession);
      setUser(updatedSession);
      
      // Update localStorage
      localStorage.setItem('session', JSON.stringify(updatedSession));
    }
  };

  // Auth context value
  const value = {
    session,
    user,
    isAuthenticated: !!session,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected Route component
interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // You can replace this with a loading spinner or component
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to auth page if not authenticated
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Public Route component (only accessible when not authenticated)
interface PublicRouteProps {
  children: ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    // You can replace this with a loading spinner or component
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    // Redirect to home page if already authenticated
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};