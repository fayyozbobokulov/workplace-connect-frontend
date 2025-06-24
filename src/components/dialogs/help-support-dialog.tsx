import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Link,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  Email as EmailIcon,
  Chat as ChatIcon,
  Phone as PhoneIcon,
  Description as DocumentationIcon,
  BugReport as BugReportIcon,
  Feedback as FeedbackIcon,
  QuestionAnswer as FAQIcon
} from '@mui/icons-material';

interface HelpSupportDialogProps {
  open: boolean;
  onClose: () => void;
}

export const HelpSupportDialog: React.FC<HelpSupportDialogProps> = ({
  open,
  onClose
}) => {
  const [expandedPanel, setExpandedPanel] = useState<string | false>('faq');

  const handleAccordionChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

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
            <HelpIcon color="primary" />
            <Typography variant="h6" component="div">
              Help & Support
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
          {/* Contact Support Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ChatIcon color="primary" fontSize="small" />
              Contact Support
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon color="action" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Email Support"
                  secondary={
                    <Link href="mailto:support@workplace-connect.com" color="primary">
                      support@workplace-connect.com
                    </Link>
                  }
                />
                <Chip label="24/7" color="success" size="small" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ChatIcon color="action" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Live Chat"
                  secondary="Available during business hours (9 AM - 6 PM EST)"
                />
                <Chip label="Business Hours" color="info" size="small" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon color="action" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Phone Support"
                  secondary="+1 (555) 123-4567"
                />
                <Chip label="Emergency Only" color="warning" size="small" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* FAQ Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FAQIcon color="primary" fontSize="small" />
              Frequently Asked Questions
            </Typography>

            <Accordion
              expanded={expandedPanel === 'faq'}
              onChange={handleAccordionChange('faq')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>How do I change my profile information?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Click on the menu icon (☰) in the top-left corner, then select "Profile" from the settings menu. 
                  You can edit your first name, last name, and email address in the dialog that opens.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={expandedPanel === 'messaging'}
              onChange={handleAccordionChange('messaging')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>How do I start a new conversation?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Use the search bar to find users or groups, then click on a user to start a direct message 
                  or join a group conversation. You can also create new groups by clicking the "+" button.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={expandedPanel === 'notifications'}
              onChange={handleAccordionChange('notifications')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>How do I manage notifications?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Click the notifications icon in the settings menu to view and manage your notification preferences. 
                  You can enable/disable notifications for different types of activities.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={expandedPanel === 'groups'}
              onChange={handleAccordionChange('groups')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>How do group chats work?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Group chats allow multiple users to communicate together. Messages are delivered in real-time 
                  to all group members. You can see who has read messages and manage group settings if you're an admin.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Resources Section */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DocumentationIcon color="primary" fontSize="small" />
              Additional Resources
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <BugReportIcon color="action" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Report a Bug"
                  secondary={
                    <Link href="mailto:bugs@workplace-connect.com" color="primary">
                      bugs@workplace-connect.com
                    </Link>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <FeedbackIcon color="action" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Feature Requests"
                  secondary={
                    <Link href="mailto:feedback@workplace-connect.com" color="primary">
                      feedback@workplace-connect.com
                    </Link>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <DocumentationIcon color="action" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="User Documentation"
                  secondary={
                    <Link href="https://docs.workplace-connect.com" color="primary" target="_blank">
                      docs.workplace-connect.com
                    </Link>
                  }
                />
              </ListItem>
            </List>
          </Box>

          {/* App Info */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              Workplace Connect v1.0.0
              <br />
              For technical support, please include your user ID and a description of the issue.
            </Typography>
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
