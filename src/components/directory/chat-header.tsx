import { Box, Typography } from '@mui/material';

const ChatHeader = () => {
  return (
    <Box sx={{ 
      p: 3, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      borderBottom: '1px solid #f0f0f0'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <img 
          src="/icon.webp" 
          alt="Workplace Connect" 
          style={{ width: '32px', height: '32px', borderRadius: '8px' }} 
        />
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            fontSize: '1.25rem',
            background: 'linear-gradient(90deg, #1976d2 0%, #21CBF3 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Workplace Connect
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatHeader;
