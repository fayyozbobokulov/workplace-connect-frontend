import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';

// Define schema for form validation
const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

type SignInFormData = z.infer<typeof signInSchema>;

interface SignInFormProps {
  onSubmit: (data: SignInFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const SignInForm = ({ onSubmit, loading, error }: SignInFormProps) => {
  // Setup form for sign in
  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    },
    mode: 'onChange',
    reValidateMode: 'onChange'
  });

  return (
    <Box component="form" onSubmit={signInForm.handleSubmit(onSubmit)} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Controller
        name="email"
        control={signInForm.control}
        render={({ field, fieldState }) => (
          <TextField
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            name={field.name}
            margin="normal"
            required
            fullWidth
            id="signin-email"
            label="Email Address"
            autoComplete="email"
            autoFocus
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
      
      <Controller
        name="password"
        control={signInForm.control}
        render={({ field, fieldState }) => (
          <TextField
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            name={field.name}
            margin="normal"
            required
            fullWidth
            id="signin-password"
            label="Password"
            type="password"
            autoComplete="current-password"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Sign In'}
      </Button>
    </Box>
  );
};

export default SignInForm;
export type { SignInFormData };
