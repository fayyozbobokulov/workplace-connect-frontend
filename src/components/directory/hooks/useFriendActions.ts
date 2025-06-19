import { useState } from 'react';

// Type for selected item - can be either a User or a custom email entry
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
}

export type SelectedItem = User | { _id: string; email: string; isCustomEmail: true };

export const useFriendActions = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleAddFriend = (selections: SelectedItem[]) => {
    if (selections.length === 0) return;
    
    // Count existing users and custom emails
    const existingUsers = selections.filter(item => !('isCustomEmail' in item));
    const customEmails = selections.filter(item => 'isCustomEmail' in item);
    
    let message = '';
    
    if (existingUsers.length > 0 && customEmails.length > 0) {
      message = `Friend requests sent to ${existingUsers.length} user(s) and invitations sent to ${customEmails.length} email(s)`;
    } else if (existingUsers.length > 0) {
      if (existingUsers.length === 1) {
        const user = existingUsers[0] as User;
        message = `Friend request sent to ${user.firstName} ${user.lastName}`;
      } else {
        message = `Friend requests sent to ${existingUsers.length} users`;
      }
    } else if (customEmails.length > 0) {
      if (customEmails.length === 1) {
        message = `Invitation sent to ${customEmails[0].email}`;
      } else {
        message = `Invitations sent to ${customEmails.length} email addresses`;
      }
    }
    
    setSnackbarMessage(message);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return {
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    handleAddFriend,
    handleCloseSnackbar
  };
};
