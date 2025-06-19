import { Box, Typography } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

interface SectionHeaderProps {
  title: string;
  showIcon?: boolean;
}

const SectionHeader = ({ title, showIcon = false }: SectionHeaderProps) => {
  return (
    <Box sx={{ 
      px: 2, 
      py: 1.5,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      borderTop: '1px solid #f0f0f0',
      mt: 1
    }}>
      {showIcon && (
        <ChatBubbleOutlineIcon sx={{ fontSize: '16px', color: 'text.secondary' }} />
      )}
      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
        {title}
      </Typography>
    </Box>
  );
};

export default SectionHeader;
