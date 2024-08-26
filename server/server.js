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
    player = data.player;
    pieces = data.pieces;
    if(player === 'A')
    {
        pieces.reverse();
        gameState.board[4] = pieces;
        gameState.players.A.characters = pieces;
    }
    if(player === 'B')
    {
        gameState.board[0] = pieces;
        gameState.players.B.characters = pieces;
    }
    console.log(gameState.board)
}


io.on("connection",(socket)=>{
    console.log(`user connected ID: ${socket.id}`);

    socket.on("initilize",(data)=>{
        gameInitilize(data);
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


