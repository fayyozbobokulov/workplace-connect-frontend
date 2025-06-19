import { Avatar, Box } from '@mui/material';
import { GroupOutlined } from '@mui/icons-material';

interface Participant {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface GroupAvatarProps {
  participants: Participant[];
  size?: number;
}

const GroupAvatar = ({ participants, size = 40 }: GroupAvatarProps) => {
  // If no participants or only one, show default group icon
  if (!participants || participants.length <= 1) {
    return (
      <Avatar
        sx={{
          width: size,
          height: size,
          bgcolor: '#1976d2',
          color: 'white'
        }}
      >
        <GroupOutlined />
      </Avatar>
    );
  }

  // For 2 participants - side by side layout like iMessage
  if (participants.length === 2) {
    return (
      <Box
        sx={{
          position: 'relative',
          width: size,
          height: size,
          display: 'flex'
        }}
      >
        <Avatar
          src={participants[0].profilePicture}
          alt={`${participants[0].firstName} ${participants[0].lastName}`}
          sx={{
            width: size * 0.7,
            height: size * 0.7,
            position: 'absolute',
            left: 0,
            top: size * 0.15,
            border: '1px solid white',
            zIndex: 1
          }}
        >
          {participants[0].firstName[0]}
        </Avatar>
        <Avatar
          src={participants[1].profilePicture}
          alt={`${participants[1].firstName} ${participants[1].lastName}`}
          sx={{
            width: size * 0.7,
            height: size * 0.7,
            position: 'absolute',
            right: 0,
            top: size * 0.15,
            border: '1px solid white',
            zIndex: 2
          }}
        >
          {participants[1].firstName[0]}
        </Avatar>
      </Box>
    );
  }

  // For 3 participants - triangle layout like iMessage
  if (participants.length === 3) {
    const smallSize = size * 0.55;
    return (
      <Box
        sx={{
          position: 'relative',
          width: size,
          height: size
        }}
      >
        {/* Top avatar */}
        <Avatar
          src={participants[0].profilePicture}
          alt={`${participants[0].firstName} ${participants[0].lastName}`}
          sx={{
            width: smallSize,
            height: smallSize,
            position: 'absolute',
            left: '50%',
            top: 0,
            transform: 'translateX(-50%)',
            border: '1px solid white',
            zIndex: 3
          }}
        >
          {participants[0].firstName[0]}
        </Avatar>
        {/* Bottom left avatar */}
        <Avatar
          src={participants[1].profilePicture}
          alt={`${participants[1].firstName} ${participants[1].lastName}`}
          sx={{
            width: smallSize,
            height: smallSize,
            position: 'absolute',
            left: 0,
            bottom: 0,
            border: '1px solid white',
            zIndex: 2
          }}
        >
          {participants[1].firstName[0]}
        </Avatar>
        {/* Bottom right avatar */}
        <Avatar
          src={participants[2].profilePicture}
          alt={`${participants[2].firstName} ${participants[2].lastName}`}
          sx={{
            width: smallSize,
            height: smallSize,
            position: 'absolute',
            right: 0,
            bottom: 0,
            border: '1px solid white',
            zIndex: 1
          }}
        >
          {participants[2].firstName[0]}
        </Avatar>
      </Box>
    );
  }

  // For 4+ participants - 2x2 grid layout like iMessage
  const gridSize = size * 0.48;
  const displayParticipants = participants.slice(0, 4);
  
  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '1px'
      }}
    >
      {displayParticipants.map((participant) => (
        <Avatar
          key={participant._id}
          src={participant.profilePicture}
          alt={`${participant.firstName} ${participant.lastName}`}
          sx={{
            width: gridSize,
            height: gridSize,
            border: '1px solid white',
            fontSize: '0.7rem'
          }}
        >
          {participant.firstName[0]}
        </Avatar>
      ))}
    </Box>
  );
};

export default GroupAvatar;
