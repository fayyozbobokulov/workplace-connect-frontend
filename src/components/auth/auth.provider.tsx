import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService, { type Session, type User } from '../../services/auth.service';

// Define Auth object interface for localStorage
interface Auth {
  session: Session;
  user: User;
}

// Define AuthContext interface
interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
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
        // Try to get auth from localStorage
        const authStr = localStorage.getItem('auth');
        if (authStr) {
          const auth: Auth = JSON.parse(authStr);
          setSession(auth.session);
          setUser(auth.user);
          authService.setupAxiosInterceptors(auth.session.token);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear potentially corrupted auth data
        localStorage.removeItem('auth');
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
      setUser(newSession.user);
      
      // Store auth in localStorage
      const auth: Auth = {
        session: newSession,
        user: newSession.user
      };
      localStorage.setItem('auth', JSON.stringify(auth));
      
      authService.setupAxiosInterceptors(newSession.token);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (firstName: string, lastName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const newSession = await authService.signUp(firstName, lastName, email, password);
      setSession(newSession);
      setUser(newSession.user);
      
      // Store auth in localStorage
      const auth: Auth = {
        session: newSession,
        user: newSession.user
      };
      localStorage.setItem('auth', JSON.stringify(auth));
      
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
    // Remove auth from localStorage
    localStorage.removeItem('auth');
    setSession(null);
    setUser(null);
  };

  // Auth context value
  const value = {
    session,
    user,
    isAuthenticated: !!session,
    isLoading,
    signIn,
    signUp,
    signOut
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