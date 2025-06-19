import { List } from '@mui/material';
import { type ReactNode } from 'react';

interface ScrollableListProps {
  children: ReactNode;
  flex?: number;
}

const ScrollableList = ({ children, flex = 1 }: ScrollableListProps) => {
  return (
    <List 
      sx={{ 
        flex: flex, 
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(0,0,0,0.05)',
        }
      }} 
      disablePadding
    >
      {children}
    </List>
  );
};

export default ScrollableList;
