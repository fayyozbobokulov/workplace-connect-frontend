import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, PublicRoute } from './components/auth/auth.provider';

// Import pages
import Auth from './pages/auth';

// Placeholder components for protected routes
const Home = () => <div>Home Page</div>;
const Messages = () => <div>Messages Page</div>;
const Account = () => <div>Account Page</div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public route - only accessible when not authenticated */}
          <Route path="/auth" element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          } />
          
          {/* Protected routes - require authentication */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          
          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          
          <Route path="/account" element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          } />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
