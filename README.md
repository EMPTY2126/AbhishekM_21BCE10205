# Multiplayer Turn-Based Game Server

This project is a server-side implementation of a multiplayer turn-based game built using Node.js, Express, and Socket.io. The game involves two players, each controlling a set of characters on a 5x5 board. Players take turns moving their characters, with the goal of capturing all of the opponent's pieces.

## Features

- **Real-time Multiplayer**: Uses Socket.io to manage real-time interactions between players.
- **Turn-Based Mechanics**: Alternating turns between two players, with validation for legal moves.
- **Character Movement**: Different character types with unique movement capabilities.
- **Capture Mechanism**: Players can capture opponent pieces, with the game tracking each player's remaining characters.
- **Game Initialization and Reset**: Supports starting a new game, resetting the game state, and reinitializing the board.
- **Move History**: Keeps track of each player's moves throughout the game.

## Getting Started

### Prerequisites

- **Node.js** (v14+ recommended)
- **npm** (v6+ recommended)

### Installation

1. Clone the repository:
```bash
   git clone https://github.com/yourusername/multiplayer-turn-based-game.git
   cd multiplayer-turn-based-game
```
2. install dependency 
```bash
    npm install
``` 
 3. Start the server:
```bash
    npm start
```

## Game Structure
### Game State

- **Board:** A 5x5 grid where characters are placed.
- **Players:** Two players (A and B), each with a set of characters, a move list, and a count of remaining characters.
- **Current Player:** Tracks whose turn it is to move.
- **Started:** A flag indicating whether the game has begun.

### Characters

- **PAWN (P):** Moves one square in any direction.
- **HERO1 (H1):** Moves up to two squares horizontally or vertically, with the ability to capture opponent pieces in its path.
-**HERO2 (H2):** Moves up to two squares diagonally, with similar capturing capabilities as HERO1.

### Game Flow

-**Initialization:** Players connect and choose their characters.
-**Turn Management:** Players take turns moving their characters, with the server validating each move.
 -**Capture Mechanism:** Characters can capture opponent pieces, with the game checking for win conditions after each move.
-**Game End:** The game ends when all of one player's characters are captured, declaring the other player as the winner.

### Socket.io Events

- **initilize:** Initializes the game with the players' characters.
    - **reInitilize:** Resets the game state and reinitializes the board.
    - **selectPlayer:** Updates the player's selected characters.
    - **characterRemove:** Handles the removal of a player's character.
    - **updateMove:** Processes a move request from a player.
    - **refreshGame:** Sends the current game state to a reconnecting client.
    - **gameWon:** Announces the winner when the game ends.
    - **invalidWarning:** Sends a warning if a player makes an invalid move.

