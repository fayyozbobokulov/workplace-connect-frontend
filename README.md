# Workplace Connect Frontend

Workplace Connect is a modern social networking platform for workplace connections built with React, TypeScript, and Material UI.

This is a frontend repository for Workplace Connect.

Please find the backend repository here: https://github.com/fayyozbobokulov/workplace-connect-server

## Features

- User authentication (signup, login, logout)
- Session management
- User profiles with customizable thumbnails
- Member directory
- Friend connections
- Public and private messaging
- Modern UI with Material UI components

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **Styling**: Material UI (MUI)
- **Form Management**: react-hook-form with zod validation
- **State Management**: Zustand
- **API Communication**: Axios with React Query
- **Routing**: React Router
- **Real-time Communication**: Socket.io (for messaging)

## Requirements

- Node.js >= 18.0.0
- npm >= 9.0.0
- TypeScript knowledge

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to http://localhost:5173

## Project Structure

```
src/
├── assets/         # Static assets like images, icons
├── components/     # Reusable UI components
│   ├── auth/       # Authentication related components
│   ├── common/     # Shared components
│   ├── friends/    # Friend management components
│   ├── layout/     # Layout components
│   ├── messaging/  # Messaging components
│   └── profile/    # User profile components
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── services/       # API services
├── store/          # State management
├── theme/          # MUI theme customization
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## API Integration

This frontend connects to a REST API backend. Make sure the backend server is running for full functionality.

## Contributing

1. Follow the established project structure
2. Use TypeScript for type safety
3. Follow the component patterns established in the codebase
4. Write clean, maintainable, and scalable code
