import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography
} from '@mui/material';

// Define password requirement interface
interface PasswordRequirement {
  regex: RegExp;
  label: string;
}

// Define password requirements
const passwordRequirements: PasswordRequirement[] = [
  { regex: /.{8,}/, label: 'Must be at least 8 characters' },
  { regex: /[A-Z]/, label: 'Must contain at least one uppercase letter' },
  { regex: /[a-z]/, label: 'Must contain at least one lowercase letter' },
  { regex: /[0-9]/, label: 'Must contain at least one number' },
  { regex: /[^A-Za-z0-9]/, label: 'Must contain at least one special character' }
];

// Define schema for form validation
const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onSubmit: (data: SignUpFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const SignUpForm = ({ onSubmit, loading, error }: SignUpFormProps) => {
  // Setup form for sign up
  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    mode: 'onChange',
    reValidateMode: 'onChange'
  });

  return (
    <Box component="form" onSubmit={signUpForm.handleSubmit(onSubmit)} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Controller
          name="firstName"
          control={signUpForm.control}
          render={({ field, fieldState }) => (
            <TextField
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              name={field.name}
              margin="normal"
              required
              fullWidth
              id="signup-firstName"
              label="First Name"
              autoFocus
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
        
        <Controller
          name="lastName"
          control={signUpForm.control}
          render={({ field, fieldState }) => (
            <TextField
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              name={field.name}
              margin="normal"
              required
              fullWidth
              id="signup-lastName"
              label="Last Name"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      </Box>
      
      <Controller
        name="email"
        control={signUpForm.control}
        render={({ field, fieldState }) => (
          <TextField
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            name={field.name}
            margin="normal"
            required
            fullWidth
            id="signup-email"
            label="Email Address"
            autoComplete="email"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
      
      <Controller
        name="password"
        control={signUpForm.control}
        render={({ field, fieldState }) => (
          <>
            <TextField
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              name={field.name}
              margin="normal"
              required
              fullWidth
              id="signup-password"
              label="Password"
              type="password"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
            {/* Password requirements list */}
            <Box sx={{ mt: 1, mb: 2 }}>
              {passwordRequirements.map((requirement, index) => {
                const isMet = field.value ? requirement.regex.test(field.value) : false;
                return (
                  <Typography
                    key={index}
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: isMet ? 'success.main' : 'text.secondary',
                      '&::before': {
                        content: '"• "'
                      }
                    }}
                  >
                    {requirement.label}
                  </Typography>
                );
              })}
            </Box>
          </>
        )}
      />
      
      <Controller
        name="confirmPassword"
        control={signUpForm.control}
        render={({ field, fieldState }) => (
          <TextField
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            name={field.name}
            margin="normal"
            required
            fullWidth
            id="signup-confirmPassword"
            label="Confirm Password"
            type="password"
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
        {loading ? <CircularProgress size={24} /> : 'Sign Up'}
      </Button>
    </Box>
  );
};

export default SignUpForm;
export type { SignUpFormData };
