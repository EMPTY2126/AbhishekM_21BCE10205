const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("node:http");

const PORT = 8000;

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const gameState = {
    board: Array(5).fill(null).map(() => Array(5).fill(null)),
    players: {
        A: { characters: [], remaining: 5, started: false },
        B: { characters: [], remaining: 5, started: false }
    },
    currentPlayer: '',
    started: false
};

const charactersName = {
    PAWN: "P", HERO1: "H1", HERO2: "H2"
}

const characters = {
    P: { move: ['L', 'R', 'F', 'B'] },
    H1: { move: ['L', 'R', 'F', 'B'], range: 2 },
    H2: { move: ['FL', 'FR', 'BL', 'BR'], range: 2 }
};


const gameInitilize = (data) => {
    gameState.started = true;
    gameState.players.A.characters = gameState.players.A.characters.map((ele) => {
        let abbreviation = charactersName[ele];
        return `A-${abbreviation ? abbreviation : ele}`;
    });
    gameState.players.B.characters = gameState.players.B.characters.map((ele) => {
        let abbreviation = charactersName[ele];
        return `B-${abbreviation ? abbreviation : ele}`;
    });
    gameState.currentPlayer = 'A'
    gameState.board[0] = gameState.players.A.characters;
    gameState.board[4] = gameState.players.B.characters;
    console.log("Game Started");

}

const playerCharacterUpdate = (data) => {
    let currPlayer = data.player;
    let currPieces = data.charecters;
    if (currPlayer === 'A') gameState.players.A.characters.push(currPieces);
    else if (currPlayer === 'B') gameState.players.B.characters.push(currPieces);
}

const removePlayer = (data) => {
    console.log(data)
    if (data.player === 'A') {
        gameState.players.A.characters = data.p1;
    } else if (data.player === 'B') {
        gameState.players.B.characters = data.p2;
    }
}

const movePawn = (data) => {
    const boardSize = 5;
    const { ele, currentIndex, currentPawn } = data;
    let { row, column } = currentIndex;
    const player = currentPawn.split('-')[0];
    const pieceType = currentPawn.split('-')[1];

    const isWithinBounds = (r, c) => {
        return r >= 0 && r < boardSize && c >= 0 && c < boardSize;
    };

    const isOpponentPiece = (r, c) => {
        const targetCell = gameState.board[r][c];
        return targetCell && targetCell.split('-')[0] !== player;
    };

    const isOwnPiece = (r, c) => {
        const targetCell = gameState.board[r][c];
        return targetCell && targetCell.split('-')[0] === player;
    };

    const moveAndCapture = (targetRow, targetColumn) => {
        if (!isWithinBounds(targetRow, targetColumn)) {
            return { status: "Invalid", reason: "Out of bounds." };
        }

        if (isOwnPiece(targetRow, targetColumn)) {
            return { status: "Invalid", reason: "Own piece in target cell." };
        }

        const captured = isOpponentPiece(targetRow, targetColumn);
        if (captured) {
            gameState.players[player === 'A' ? 'B' : 'A'].remaining -= 1;
            console.log(`Captured opponent's piece at (${targetRow}, ${targetColumn})`);
        }

        gameState.board[row][column] = null;
        gameState.board[targetRow][targetColumn] = currentPawn;

        console.log(`Moved ${currentPawn} from (${row}, ${column}) to (${targetRow}, ${targetColumn})`);

        return {
            status: "Valid",
            newPosition: { row: targetRow, column: targetColumn },
            captured: captured
        };
    };

    let targetRow = row;
    let targetColumn = column;

    switch (pieceType) {
        case 'P':
            switch (ele) {
                case 'F':
                    console.log("Move: Forward (F)");
                    targetRow -= 1;
                    break;
                case 'B':
                    console.log("Move: Backward (B)");
                    targetRow += 1;
                    break;
                case 'L':
                    console.log("Move: Left (L)");
                    targetColumn -= 1;
                    break;
                case 'R':
                    console.log("Move: Right (R)");
                    targetColumn += 1;
                    break;
                default:
                    return { status: "Invalid", reason: "Unknown command." };
            }
            return moveAndCapture(targetRow, targetColumn);

        case 'H1':
            switch (ele) {
                case 'F':
                    console.log("Move: Forward 2 (F)");
                    targetRow -= 2;
                    break;
                case 'B':
                    console.log("Move: Backward 2 (B)");
                    targetRow += 2;
                    break;
                case 'L':
                    console.log("Move: Left 2 (L)");
                    targetColumn -= 2;
                    break;
                case 'R':
                    console.log("Move: Right 2 (R)");
                    targetColumn += 2;
                    break;
                default:
                    return { status: "Invalid", reason: "Unknown command." };
            }

            const midRow = (row + targetRow) / 2;
            const midCol = (column + targetColumn) / 2;
            if (isOpponentPiece(midRow, midCol)) {
                gameState.board[midRow][midCol] = null;
                gameState.players[player === 'A' ? 'B' : 'A'].remaining -= 1;
                console.log(`Captured opponent's piece at (${midRow}, ${midCol})`);
            }
            return moveAndCapture(targetRow, targetColumn);

        case 'H2':
            switch (ele) {
                case 'FL':
                    console.log("Move: Forward-Left (FL)");
                    targetRow -= 2; targetColumn -= 2;
                    break;
                case 'FR':
                    console.log("Move: Forward-Right (FR)");
                    targetRow -= 2; targetColumn += 2;
                    break;
                case 'BL':
                    console.log("Move: Backward-Left (BL)");
                    targetRow += 2; targetColumn -= 2;
                    break;
                case 'BR':
                    console.log("Move: Backward-Right (BR)");
                    targetRow += 2; targetColumn += 2;
                    break;
                default:
                    return { status: "Invalid", reason: "Unknown command." };
            }
            return moveAndCapture(targetRow, targetColumn);

        case 'H3':
            switch (ele) {
                case 'FL':
                    console.log("Move: Forward-Left (FL)");
                    targetRow -= 1; targetColumn -= 1;
                    break;
                case 'FR':
                    console.log("Move: Forward-Right (FR)");
                    targetRow -= 1; targetColumn += 1;
                    break;
                case 'BL':
                    console.log("Move: Backward-Left (BL)");
                    targetRow += 1; targetColumn -= 1;
                    break;
                case 'BR':
                    console.log("Move: Backward-Right (BR)");
                    targetRow += 1; targetColumn += 1;
                    break;
                default:
                    return { status: "Invalid", reason: "Unknown command." };
            }
            return moveAndCapture(targetRow, targetColumn);

        default:
            return { status: "Invalid", reason: "Unknown piece type." };
    }
};



io.on("connection", (socket) => {
    console.log(`user connected ID: ${socket.id}`);

    socket.on("initilize", (data) => {
        gameInitilize(data);
        clientGameInitilize(io);
    })

    socket.on("selectPlayer", (data) => {
        playerCharacterUpdate(data);
        clientCharacterUpdate(io);
    })

    socket.on("characterRemove", (data) => {
        removePlayer(data);
        clientCharacterUpdate(io);
    })

    socket.on("refreshGame", (msg) => {
        refreshUpdate(socket);
    });

    socket.on("updateMove", (data) => {
        movePawn(data);
        clientMoveUpdate(io);
    })




    socket.on("disconnect", () => {
        console.log(`user disconnected ID: ${socket.id}`);
    })
})

const clientCharacterUpdate = (io) => {
    let data = { A: gameState.players.A.characters, B: gameState.players.B.characters };
    io.emit("characterUpdate", data);
}

const clientGameInitilize = (io) => {
    io.emit("initilize", gameState);
}

const clientMoveUpdate = (io) => {
    io.emit("clientMoveUpdate", gameState);
}

const refreshUpdate = (socket) => {
    socket.emit("refreshUpdate", gameState);
}







server.listen(PORT, () => console.log(`Server running on port : ${PORT}`));


