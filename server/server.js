const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("node:http");

const PORT = 8000;

const app = express();
const server = createServer(app);
const io = new Server(server,{cors: { origin: "*" }});    

const gameState = {
    board: Array(5).fill(null).map(() => Array(5).fill(null)),
    players: {
        A: { characters: [], remaining: 5, started: false },
        B: { characters: [], remaining: 5, started: false }
    }
};


const characters = {
    P: { move: ['L', 'R', 'F', 'B'] },
    H1: { move: ['L', 'R', 'F', 'B'], range: 2 },
    H2: { move: ['FL', 'FR', 'BL', 'BR'], range: 2 }
};


const gameInitilize = (data)=>{
    const p1Piece = data.p1Selects;
    let revPiece = p1Piece.reverse();
    gameState.board[4] = revPiece;
    gameState.players.A.characters = p1Piece;
    gameState.board[0] = data.p2Selects;
    gameState.players.B.characters = data.p2Selects;
    console.log(gameState.board)
}

const clientGameInitilize = (socket)=>{
    let data = {board : gameState.board, ready:true}
    socket.emit("initilize",data);
}



io.on("connection",(socket)=>{
    console.log(`user connected ID: ${socket.id}`);

    socket.on("initilize",(data)=>{
        gameInitilize(data);
        clientGameInitilize(socket);
    })

    socket.on("message",(msg)=>{
        console.log(msg);  
    })

    socket.on("disconnect",()=>{
        console.log(`user disconnected ID: ${socket.id}`); 
        socket.re 
    })
})




server.listen(PORT,()=>console.log(`Server running on port : ${PORT}`));


