import { Box, Typography } from '@mui/material';

interface UploadedPicturePreviewProps {
  imageUrl?: string;
  alt?: string;
  size?: number;
  fallbackText?: string;
}

const UploadedPicturePreview = ({ 
  imageUrl, 
  alt = "Profile picture", 
  size = 80,
  fallbackText = "U"
}: UploadedPicturePreviewProps) => {
  if (imageUrl) {
    // Show uploaded image
    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          borderColor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        role="img"
        aria-label={alt}
      />
    );
  }

  // Show default avatar with initials
  return (
    <Box 
      sx={{ 
        width: size, 
        height: size, 
        borderRadius: '50%', 
        bgcolor: 'primary.main', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'white',
        fontSize: '2rem',
        fontWeight: 'bold'
      }}
    >
      <Typography
        sx={{
          fontSize: 'inherit',
          fontWeight: 'inherit',
          color: 'inherit',
        }}
      >
        {fallbackText}
      </Typography>
    </Box>
  );
};

export default UploadedPicturePreview;
