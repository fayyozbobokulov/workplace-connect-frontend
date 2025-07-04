import { useRef, type ReactNode } from 'react';
import { Box, IconButton } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

interface FilePickerProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  children?: ReactNode;
  size?: number;
}

const FilePicker = ({ 
  onFileSelect, 
  accept = "image/*", 
  children, 
  size = 80 
}: FilePickerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        style={{ display: 'none' }}
      />
      
      <Box
        onClick={handleClick}
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          '&:hover .file-picker-overlay': {
            opacity: 1,
          }
        }}
      >
        {children}
        
        {/* Hover overlay */}
        <Box
          className="file-picker-overlay"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.2s ease-in-out',
            borderRadius: '50%',
          }}
        >
          <IconButton
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <CameraAltIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default FilePicker;
