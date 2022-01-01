const PLAYER1_COLOUR = '#55FF00';
const PLAYER2_COLOUR = '#00AAFF';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

const PLAYER_SIZE = 20;

boundaryWidth = 40;

const socket = io.connect("http://localhost:3000");

socket.on("init", handleInit);
socket.on("gameState", handleGameState)
socket.on("gameOver", handleGameOver)
socket.on("gameCode", handleGameCode)
socket.on("unknownCode", handleUnknownGame)
socket.on("tooManyPlayers", handleTooManyPlayers)

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBut = document.getElementById('newGameButton')
const joinGameBut = document.getElementById('joinGameButton')
const gameCodeInput = document.getElementById('gameCodeInput')
const gameCodeDisplay = document.getElementById('gameCodeDisplay')

const scorePositions = {
    1: { x: 50, y: 70 },
    2: { x: GAME_WIDTH - 50, y: 70 },
    3: { x: 50, y: GAME_HEIGHT - 50 },
    4: { x: GAME_WIDTH - 50, y: GAME_HEIGHT - 50 }
}

function setup() {
    newGameBut.addEventListener('click', newGame)
    joinGameBut.addEventListener('click', joinGame)

    function newGame() {
        socket.emit("newGame");
        init()
    }

    function joinGame() {
        const code = gameCodeInput.value;
        socket.emit('joinGame', code)
        init()
    }
}


let canvas;
let playerNumber;

let boundaries = []

function init() {
    initialScreen.style.display = "none";
    gameScreen.style.display = "block";
    document.body.style.background = "#81d0ef"

    canvas = createCanvas(800, 600);
    canvas.parent('canvasDiv');
    colorMode(HSB)

    boundaries.push(new Boundary(GAME_WIDTH / 2, GAME_HEIGHT, GAME_WIDTH, boundaryWidth))
    boundaries.push(new Boundary(GAME_WIDTH / 2, 0, GAME_WIDTH, boundaryWidth))
    boundaries.push(new Boundary(0, GAME_HEIGHT / 2, boundaryWidth, GAME_HEIGHT))
    boundaries.push(new Boundary(GAME_WIDTH, GAME_HEIGHT / 2, boundaryWidth, GAME_HEIGHT))
    boundaries.push(new Boundary(GAME_WIDTH / 2, GAME_HEIGHT / 3, 400, 20))
    boundaries.push(new Boundary(GAME_WIDTH / 2, GAME_HEIGHT * 2 / 3, 400, 20))
    boundaries.push(new Boundary(GAME_WIDTH / 2, GAME_HEIGHT - 50, 20, 100))

    background(20)
}

function paintGame(state) {
    background(20)
    //paint the boundaries already set
    for (let boundary of boundaries) {
        boundary.show()
    }

    //paint player
    paintPlayers(state.players)
    paintBullets(state.bullets)
}

function paintPlayers(players) {
    for (const [id, player] of Object.entries(players)) {
        fill(player.hue, 255, 255, 0.5);
        noStroke();
        push()
        rectMode(CENTER)
        translate(player.pos.x, player.pos.y)
        //the actual square player
        push()
        rotate(player.angle)
        rect(0, 0, PLAYER_SIZE, PLAYER_SIZE)
        //the health square thing
        let healthSize = map(player.health, 0, 100, 0, PLAYER_SIZE)
        rect(0, 0, healthSize, healthSize)
        pop()
        //the looking circle thing
        rotate(player.heading)

        fill(player.hue, 255, 255);
        circle(20, 0, 6)

        pop()

        //draw score
        textAlign(CENTER)
        textSize(50)
        fill(player.hue, 255, 255, 1);
        text(`${player.score}`, scorePositions[id].x, scorePositions[id].y)
    }
}

function paintBullets(bullets) {
    bullets.forEach(bullet => {
        fill(bullet.hue, 255, 255, map(bullet.lifetime, 0, 100, 0, 1));
        noStroke();
        push()
        translate(bullet.x, bullet.y)
        circle(0, 0, 10) //bullet width of 10

        pop()
    });

}

function keyPressed() {
    socket.emit('keyDown', keyCode);
}

function keyReleased() {
    socket.emit('keyUp', keyCode);
}

function handleInit(number) {
    playerNumber = number;
}

function handleGameState(gameState) {
    gameState = JSON.parse(gameState);
    paintGame(gameState)
}

function handleGameOver() {

}

function handleGameCode(gameCode) {
    gameCodeDisplay.innerText = gameCode;
}

function handleUnknownGame() {
    reset();
    alert("unknown game code!")
}

function handleTooManyPlayers() {
    reset();
    alert("this game is already full")
}

function reset() {
    playerNumber = null;
    gameCodeInput.value = "";
    gameCodeDisplay.innerText = "";
    initialScreen.style.display = "block"
    gameScreen.style.display = "none"
    document.body.style.background = "white"
}