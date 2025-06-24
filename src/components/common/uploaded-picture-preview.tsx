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
    // Show uploaded image using img element instead of background
    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: 'primary.main',
        }}
        role="img"
        aria-label={alt}
      >
        <img
          src={imageUrl}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
          onError={(e) => {
            // Hide broken image if load fails
            e.currentTarget.style.display = 'none';
          }}
        />
      </Box>
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
