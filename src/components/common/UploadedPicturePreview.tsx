import { Box } from '@mui/material';

interface UploadedPicturePreviewProps {
  imageUrl: string;
  alt?: string;
  size?: number;
}

const UploadedPicturePreview = ({ 
  imageUrl, 
  alt = "Profile picture", 
  size = 80
}: UploadedPicturePreviewProps) => {
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
};

export default UploadedPicturePreview;
