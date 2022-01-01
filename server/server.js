const io = require("socket.io")({
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

const { initGame, gameLoop } = require("./game");
const { FRAME_RATE, GAME_WIDTH, GAME_HEIGHT, BOUNDARY_WIDTH } = require("./constants");
const { makeid } = require("./utils");

const Matter = require('matter-js');
const { Engine, Render, Runner, Body, Events, Composite, Composites, Common, Mouse, Bodies, Collision } = require('matter-js');
const Boundary = require('./boundary');
const Player = require('./player');

const socketRooms = {};

/*
game is a dictionary with the keys as the roomNumbers
    state: the payload being sent and information on stuff
    engine: the engine of the game
    players: the dictionary of players mapped by their player numbers
    bullets: the list of bullets 
    boundaries: the list of boundaries
*/
const game = {}

io.on('connect', socket => {

    socket.on('keyDown', handleKeyDown);
    socket.on('keyUp', handleKeyUp);
    socket.on('newGame', handleNewGame);
    socket.on('joinGame', handleJoinGame);

    function handleJoinGame(roomName) {
        console.log(!roomName)
        if (!roomName) {
            console.log("what")
            socket.emit('unknownCode');
            return
        }
        //room is a set
        const room = io.sockets.adapter.rooms.get(roomName);

        //get the size of the room if its a thing
        let numsockets;
        if (room) {
            numsockets = room.size
        }

        if (!room || numsockets === 0) {
            socket.emit('unknownCode');
            return
        } else if (numsockets >= 4) {
            socket.emit('tooManyPlayers');
            return
        }

        socketRooms[socket.id] = roomName;
        socket.join(roomName);

        //to get socket number we loop through to get the highest socket nunber and add one

        //create random coords
        let x = Math.random() * GAME_WIDTH;
        let y = Math.random() * GAME_HEIGHT;
        let hue = Math.floor(Math.random() * 360);

        //find the lowest free player id
        let playerId = 1;
        while (game[roomName].players[playerId] != null) {
            playerId += 1;
        }

        //add the players to the world, both the matter world and the state object
        game[roomName].players[playerId] = (new Player(x, y, hue, game[roomName].engine.world, playerId))
        game[roomName].state.players[playerId] = {
            pos: {
                x: x,
                y: y
            },
            heading: 0,
            angle: 0,
            hue: hue,
            health: 100,
        }

        socket.number = playerId;
        socket.emit('init', playerId);
        socket.emit("gameCode", roomName)
    }

    function handleNewGame() {
        let roomName = makeid(5);
        socketRooms[socket.id] = roomName;
        socket.emit("gameCode", roomName)

        socket.join(roomName);
        socket.number = 1;
        socket.emit("init", 1)
        startNewGame(roomName);
    }

    function handleKeyDown(keyCode) {
        const roomName = socketRooms[socket.id]

        if (!roomName) {
            return;
        }

        try {
            keyCode = parseInt(keyCode)
        } catch (error) {
            console.log(error);
            return
        }

        if (game[roomName].state.gameStarted) {
            game[roomName].players[socket.number].keyDown(keyCode)
        }
    }

    function handleKeyUp(keyCode) {
        const roomName = socketRooms[socket.id]

        if (!roomName) {
            return;
        }

        try {
            keyCode = parseInt(keyCode)
        } catch (error) {
            console.log(error);
            return
        }
        if (game[roomName].state.gameStarted) {
            game[roomName].players[socket.number].keyUp(keyCode)
        }
    }

    function startNewGame(roomName) {
        //game stuff for easy use
        game[roomName] = {}
        game[roomName].state = initGame();
        game[roomName].state.gameStarted = true;
        let engine = Engine.create();
        game[roomName].engine = engine
        engine.gravity.y = 2;
        game[roomName].bullets = []

        //get the hue from newly created state (first player's hue)
        let hue = game[roomName].state.players[1].hue
        game[roomName].players = { 1: new Player(300, 300, hue, engine.world, 1) };

        game[roomName].boundaries = []
        game[roomName].boundaries.push(new Boundary(GAME_WIDTH / 2, GAME_HEIGHT, GAME_WIDTH, BOUNDARY_WIDTH, engine.world))
        game[roomName].boundaries.push(new Boundary(GAME_WIDTH / 2, 0, GAME_WIDTH, BOUNDARY_WIDTH, engine.world))
        game[roomName].boundaries.push(new Boundary(0, GAME_HEIGHT / 2, BOUNDARY_WIDTH, GAME_HEIGHT, engine.world))
        game[roomName].boundaries.push(new Boundary(GAME_WIDTH, GAME_HEIGHT / 2, BOUNDARY_WIDTH, GAME_HEIGHT, engine.world))
        game[roomName].boundaries.push(new Boundary(GAME_WIDTH / 2, GAME_HEIGHT / 3, 400, 20, engine.world))
        game[roomName].boundaries.push(new Boundary(GAME_WIDTH / 2, GAME_HEIGHT * 2 / 3, 400, 20, engine.world))
        game[roomName].boundaries.push(new Boundary(GAME_WIDTH / 2, GAME_HEIGHT - 50, 20, 100, engine.world))

        const intervalId = setInterval(() => {
            const winner = gameLoop(game[roomName]);

            if (!winner) {
                emitGameState(roomName, game[roomName].state)
            } else {
                emitGameOver(roomName, winner);
                game[roomName] = null;

                socketRooms[socket.id] = null;
                clearInterval(intervalId);
            }

        }, 1000 / FRAME_RATE);
    }
})

function emitGameState(roomName, state) {
    io.sockets.in(roomName).emit('gameState', JSON.stringify(state))
}

function emitGameOver(roomName, winner) {
    io.sockets.in(roomName).emit('gameOver', JSON.stringify({ winner }))
}

io.listen(process.env.PORT || 3000);