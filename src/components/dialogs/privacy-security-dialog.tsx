import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Lock as LockIcon,
  Shield as ShieldIcon,
  Visibility as VisibilityIcon,
  Security as SecurityIcon,
  VpnKey as VpnKeyIcon,
  DataUsage as DataUsageIcon
} from '@mui/icons-material';

interface PrivacySecurityDialogProps {
  open: boolean;
  onClose: () => void;
}

export const PrivacySecurityDialog: React.FC<PrivacySecurityDialogProps> = ({
  open,
  onClose
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="primary" />
            <Typography variant="h6" component="div">
              Privacy & Security
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ py: 1 }}>
          {/* Data Protection Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShieldIcon color="primary" fontSize="small" />
              Data Protection
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <DataUsageIcon color="action" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="End-to-End Encryption"
                  secondary="All messages are encrypted in transit and at rest"
                />
                <Chip label="Active" color="success" size="small" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LockIcon color="action" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Secure Authentication"
                  secondary="JWT tokens with automatic expiration and refresh"
                />
                <Chip label="Active" color="success" size="small" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <VisibilityIcon color="action" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Privacy Controls"
                  secondary="Control who can see your online status and profile information"
                />
                <Chip label="Configurable" color="info" size="small" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Security Features Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LockIcon color="primary" fontSize="small" />
              Security Features
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <VpnKeyIcon color="action" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Password Security"
                  secondary="Strong password requirements with bcrypt hashing"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon color="action" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Session Management"
                  secondary="Automatic logout after inactivity and secure session handling"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ShieldIcon color="action" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="CORS Protection"
                  secondary="Cross-origin resource sharing protection enabled"
                />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Data Handling Section */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DataUsageIcon color="primary" fontSize="small" />
              Data Handling
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              We are committed to protecting your privacy and handling your data responsibly.
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="• We only collect data necessary for app functionality"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="• Messages are stored securely and only accessible to authorized parties"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="• Profile images are stored securely with access controls"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="• We do not share your personal data with third parties"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="• You can request data deletion at any time"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            </List>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
