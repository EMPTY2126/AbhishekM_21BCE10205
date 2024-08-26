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
    currentPlayer:'',
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

    socket.on("refreshGame", (msg) => {
        refreshUpdate(socket);
    });

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

const refreshUpdate = (socket) => {
    socket.emit("refreshUpdate", gameState);
}







server.listen(PORT, () => console.log(`Server running on port : ${PORT}`));


