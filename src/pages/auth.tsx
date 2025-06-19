import { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/auth/auth.provider';
import SignInForm, { type SignInFormData } from '../components/auth/signin.form';
import SignUpForm, { type SignUpFormData } from '../components/auth/signup.form';
import { type ApiError } from '../types/api';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper
} from '@mui/material';

const Auth = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'signin';
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(tab === 'signup' ? 'signup' : 'signin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';
  
  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: 'signin' | 'signup') => {
    setActiveTab(newValue);
    setSearchParams({ tab: newValue });
    setError(null);
  };
  
  // Handle sign in form submission
  const handleSignIn = async (data: SignInFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      await signIn(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle sign up form submission
  const handleSignUp = async (data: SignUpFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      await signUp(data.firstName, data.lastName, data.email, data.password, data.confirmPassword);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography 
          component="h1" 
          variant="h4" 
          sx={{ 
            mb: 4, 
            fontWeight: 600,
            background: 'linear-gradient(90deg, #1976d2 0%, #21CBF3 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Workplace Connect
        </Typography>
        
        <Paper sx={{ width: '100%', p: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab value="signin" label="Sign In" />
            <Tab value="signup" label="Sign Up" />
          </Tabs>
          
          {activeTab === 'signin' ? (
            <SignInForm 
              onSubmit={handleSignIn} 
              loading={loading} 
              error={error} 
            />
          ) : (
            <SignUpForm 
              onSubmit={handleSignUp} 
              loading={loading} 
              error={error} 
            />
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Auth;
