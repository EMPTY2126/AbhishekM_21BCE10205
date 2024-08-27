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
        A: { characters: [], moveList: [], remaining: 5, started: false },
        B: { characters: [], moveList: [], remaining: 5, started: false }
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
    H2: { move: ['FL', 'FR', 'BL', 'BR'], range: 2 },
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
    if (data.player === 'A') {
        gameState.players.A.characters = data.p1;
    } else if (data.player === 'B') {
        gameState.players.B.characters = data.p2;
    }
}


// const movePawn = (data) => {
//     const boardSize = 5;
//     const { ele, currentIndex, currentPawn } = data;
//     let { row, column } = currentIndex;
//     const player = currentPawn.split('-')[0];
//     const pieceType = currentPawn.split('-')[1];

//     const isWithinBounds = (r, c) => {
//         return r >= 0 && r < boardSize && c >= 0 && c < boardSize;
//     };

//     const isOpponentPiece = (r, c) => {
//         if (!isWithinBounds(r, c)) return false;
//         const targetCell = gameState.board[r][c];
//         return targetCell && targetCell.split('-')[0] !== player;
//     };

//     const isOwnPiece = (r, c) => {
//         if (!isWithinBounds(r, c)) return false;
//         const targetCell = gameState.board[r][c];
//         return targetCell && targetCell.split('-')[0] === player;
//     };

//     const moveAndCapture = (targetRow, targetColumn) => {
//         if (!isWithinBounds(targetRow, targetColumn)) {
//             return { status: "Invalid", reason: "Out of bounds." };
//         }

//         if (isOwnPiece(targetRow, targetColumn)) {
//             return { status: "Invalid", reason: "Own piece in target cell." };
//         }

//         let capturedPiece = null;
//         if (isOpponentPiece(targetRow, targetColumn)) {
//             capturedPiece = gameState.board[targetRow][targetColumn];
//         }

//         gameState.board[row][column] = null;
//         gameState.board[targetRow][targetColumn] = currentPawn;

//         if (capturedPiece) {
//             gameState.players[player === 'A' ? 'B' : 'A'].remaining -= 1;
//         }

//         const opponentPlayer = player === 'A' ? 'B' : 'A';
//         const opponentRemaining = gameState.players[opponentPlayer].remaining;
//         const isWin = opponentRemaining === 0;

//         gameState.currentPlayer = opponentPlayer;

//         return {
//             status: "Valid",
//             newPosition: { row: targetRow, column: targetColumn },
//             currentPiece: currentPawn,
//             capturedPiece: capturedPiece,
//             move:ele,
//             isWin: isWin,
//             winner: isWin ? player : null
//         };
//     };

//     let targetRow = row;
//     let targetColumn = column;

//     switch (pieceType) {
//         case 'P':
//             switch (ele) {
//                 case 'F':
//                     targetRow -= 1;
//                     break;
//                 case 'B':
//                     targetRow += 1;
//                     break;
//                 case 'L':
//                     targetColumn -= 1;
//                     break;
//                 case 'R':
//                     targetColumn += 1;
//                     break;
//                 default:
//                     return { status: "Invalid", reason: "Unknown command." };
//             }
//             return moveAndCapture(targetRow, targetColumn);

//         case 'H1':
//             switch (ele) {
//                 case 'F':
//                     targetRow -= 2;
//                     break;
//                 case 'B':
//                     targetRow += 2;
//                     break;
//                 case 'L':
//                     targetColumn -= 2;
//                     break;
//                 case 'R':
//                     targetColumn += 2;
//                     break;
//                 default:
//                     return { status: "Invalid", reason: "Unknown command." };
//             }

//             const midRow = (row + targetRow) / 2;
//             const midCol = (column + targetColumn) / 2;
//             let capturedPieceH1 = null;
//             if (isOpponentPiece(midRow, midCol)) {
//                 capturedPieceH1 = gameState.board[midRow][midCol];
//             }
//             return moveAndCapture(targetRow, targetColumn);

//         case 'H2':
//             switch (ele) {
//                 case 'FL':
//                     targetRow -= 2; targetColumn -= 2;
//                     break;
//                 case 'FR':
//                     targetRow -= 2; targetColumn += 2;
//                     break;
//                 case 'BL':
//                     targetRow += 2; targetColumn -= 2;
//                     break;
//                 case 'BR':
//                     targetRow += 2; targetColumn += 2;
//                     break;
//                 default:
//                     return { status: "Invalid", reason: "Unknown command." };
//             }
//             return moveAndCapture(targetRow, targetColumn);

//         default:
//             return { status: "Invalid", reason: "Unknown piece type." };
//     }
// };

const movePawn = (data) => {
    const boardSize = 5;
    const { ele, currentIndex, currentPawn } = data;
    let { row, column } = currentIndex;
    const player = currentPawn.split('-')[0];
    const pieceType = currentPawn.split('-')[1];

    const isWithinBounds = (r, c) => r >= 0 && r < boardSize && c >= 0 && c < boardSize;

    const isOpponentPiece = (r, c) => {
        if (!isWithinBounds(r, c)) return false;
        const targetCell = gameState.board[r][c];
        return targetCell && targetCell.split('-')[0] !== player;
    };

    const isOwnPiece = (r, c) => {
        if (!isWithinBounds(r, c)) return false;
        const targetCell = gameState.board[r][c];
        return targetCell && targetCell.split('-')[0] === player;
    };

    const moveAndCapture = (targetRow, targetColumn, capturedPiece) => {
        if (!isWithinBounds(targetRow, targetColumn)) {
            return { status: "Invalid", reason: "Out of bounds." };
        }

        if (isOwnPiece(targetRow, targetColumn)) {
            return { status: "Invalid", reason: "Own piece in target cell." };
        }

        gameState.board[row][column] = null;
        gameState.board[targetRow][targetColumn] = currentPawn;

        if (capturedPiece) {
            gameState.players[player === 'A' ? 'B' : 'A'].remaining -= 1;
        }

        const opponentPlayer = player === 'A' ? 'B' : 'A';
        const opponentRemaining = gameState.players[opponentPlayer].remaining;
        const isWin = opponentRemaining === 0;

        gameState.currentPlayer = opponentPlayer;

        return {
            status: "Valid",
            newPosition: { row: targetRow, column: targetColumn },
            currentPiece: currentPawn,
            capturedPiece: capturedPiece,
            move: ele,
            isWin: isWin,
            winner: isWin ? player : null
        };
    };

    const checkPathForCapture = (startRow, startCol, endRow, endCol, stepRow, stepCol) => {
        let capturedPiece = null;
        let pieceCount = 0;

        for (let r = startRow + stepRow, c = startCol + stepCol; r !== endRow || c !== endCol; r += stepRow, c += stepCol) {
            if (isOpponentPiece(r, c)) {
                pieceCount++;
                if (pieceCount > 1) {
                    return { status: "Invalid", reason: "Only one pawn can be captured in a single move." };
                }
                capturedPiece = gameState.board[r][c];
            } else if (isOwnPiece(r, c)) {
                return { status: "Invalid", reason: "Own piece in the path." };
            }
        }
        return { status: "Valid", capturedPiece };
    };

    let targetRow = row;
    let targetColumn = column;

    switch (pieceType) {
        case 'P':
            switch (ele) {
                case 'F':
                    targetRow -= 1;
                    break;
                case 'B':
                    targetRow += 1;
                    break;
                case 'L':
                    targetColumn -= 1;
                    break;
                case 'R':
                    targetColumn += 1;
                    break;
                default:
                    return { status: "Invalid", reason: "Unknown command." };
            }
            return moveAndCapture(targetRow, targetColumn, null);

        case 'H1':
            switch (ele) {
                case 'F':
                    targetRow -= 2;
                    break;
                case 'B':
                    targetRow += 2;
                    break;
                case 'L':
                    targetColumn -= 2;
                    break;
                case 'R':
                    targetColumn += 2;
                    break;
                default:
                    return { status: "Invalid", reason: "Unknown command." };
            }
            const checkResultH1 = checkPathForCapture(row, column, targetRow, targetColumn, (targetRow - row) / 2, (targetColumn - column) / 2);
            if (checkResultH1.status === "Invalid") {
                return checkResultH1;
            }
            return moveAndCapture(targetRow, targetColumn, checkResultH1.capturedPiece);

        case 'H2':
            switch (ele) {
                case 'FL':
                    targetRow -= 2; targetColumn -= 2;
                    break;
                case 'FR':
                    targetRow -= 2; targetColumn += 2;
                    break;
                case 'BL':
                    targetRow += 2; targetColumn -= 2;
                    break;
                case 'BR':
                    targetRow += 2; targetColumn += 2;
                    break;
                default:
                    return { status: "Invalid", reason: "Unknown command." };
            }
            const checkResultH2 = checkPathForCapture(row, column, targetRow, targetColumn, (targetRow - row) / 2, (targetColumn - column) / 2);
            if (checkResultH2.status === "Invalid") {
                return checkResultH2;
            }
            return moveAndCapture(targetRow, targetColumn, checkResultH2.capturedPiece);

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

    socket.on("reInitilize", (data)=>{
        reInitilize(io);
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
        const res = movePawn(data);
        // console.log(res);
        // console.log(gameState);
        if (res.status === 'Invalid') sendWarning(socket, res);
        else if (res.isWin) {
            moveListUpdate(res);
            clientMoveUpdate(io);
            sendWin(io, res);
        }
        else {
            moveListUpdate(res)
            clientMoveUpdate(io);
        }
    })


    socket.on("disconnect", () => {
        console.log(`user disconnected ID: ${socket.id}`);
    })
})

const moveListUpdate = (res)=>{
    if (gameState.currentPlayer === 'A') {
        let len = gameState.players.B.moveList.length;
        (res.capturedPiece !== null) ?
            gameState.players.B.moveList.push(`${res.currentPiece}: ${res.move} -> ${res.capturedPiece}`)
            : gameState.players.B.moveList.push(`${res.currentPiece}: ${res.move}`);
    }
    if (gameState.currentPlayer === 'B') {
        let len = gameState.players.A.moveList.length;
        (res.capturedPiece !== null) ?
            gameState.players.A.moveList.push(`${res.currentPiece}: ${res.move} ->  ${res.capturedPiece}`)
            : gameState.players.A.moveList.push(`${res.currentPiece}: ${res.move}`);
    }
}

const reInitilize = (io)=>{

    gameState.board = Array(5).fill(null).map(() => Array(5).fill(null));
    gameState.players = {
        A: { characters: [], moveList: [], remaining: 5, started: false },
        B: { characters: [], moveList: [], remaining: 5, started: false }
    };
    gameState.currentPlayer = '';
    gameState.started = false;

    io.emit("restartGame",gameState);
}

const sendWin = (io, data) => {
    io.emit("gameWon", data);
}

const sendWarning = (socket, data) => {
    socket.emit("invalidWarning", data);
}

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


