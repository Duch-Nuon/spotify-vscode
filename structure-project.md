spotify-controller/
├── .vscode/
│   └── launch.json
├── src/
│   ├── extension.ts          # Entry point - activate/deactivate
│   ├── commands/
│   │   ├── index.ts          # Export all commands
│   │   ├── play.ts           # Toggle play/pause
│   │   ├── next.ts           # Skip to next track
│   │   ├── previous.ts       # Go to previous track
│   │   └── favorite.ts       # Add current track to liked songs
│   ├── api/
│   │   ├── spotifyClient.ts  # Axios/fetch wrapper for Spotify Web API
│   │   ├── auth.ts           # OAuth2 PKCE flow + token refresh
│   │   └── endpoints.ts      # API URL constants
│   ├── player/
│   │   ├── playerController.ts  # Orchestrates all playback actions
│   │   └── playerState.ts       # Track current state (playing, track info)
│   ├── statusBar/
│   │   ├── statusBarManager.ts  # Create & update status bar items
│   │   └── statusBarIcons.ts    # Icon/label definitions
│   ├── auth/
│   │   ├── authProvider.ts   # VSCode AuthenticationProvider implementation
│   │   └── tokenStorage.ts   # SecretStorage wrapper for tokens
│   └── utils/
│       ├── logger.ts         # Output channel logger
│       └── errorHandler.ts   # Centralized error handling
├── package.json              # Contributes commands, keybindings, config
├── tsconfig.json
├── .eslintrc.json
├── .vscodeignore
└── README.md