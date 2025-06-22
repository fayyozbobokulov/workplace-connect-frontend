import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, PublicRoute } from './components/auth/auth.provider';
import { MessagingProvider } from './contexts/messaging.context';

// Import pages
import Auth from './pages/auth';
import Home from './pages/home';
import MainLayout from './components/layout/main-layout';

// Placeholder components for protected routes
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
              <MessagingProvider>
                <MainLayout>
                  <Home />
                </MainLayout>
              </MessagingProvider>
            </ProtectedRoute>
          } />
          
          <Route path="/messages" element={
            <ProtectedRoute>
              <MessagingProvider>
                <MainLayout>
                  <Messages />
                </MainLayout>
              </MessagingProvider>
            </ProtectedRoute>
          } />
          
          <Route path="/account" element={
            <ProtectedRoute>
              <MessagingProvider>
                <MainLayout>
                  <Account />
                </MainLayout>
              </MessagingProvider>
            </ProtectedRoute>
          } />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={
            <ProtectedRoute>
              <MessagingProvider>
                <MainLayout>
                  <Home />
                </MainLayout>
              </MessagingProvider>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
