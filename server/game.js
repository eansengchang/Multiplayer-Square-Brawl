module.exports = {
    initGame,
    gameLoop
}

const { Engine, Render, Runner, Body, Events, Composite, Composites, Common, Mouse, Bodies, Collision } = require('matter-js');

function initGame() {
    const state = createGameState()
    //first person has random hue
    let hue = Math.floor(Math.random() * 360)
    state.players[1].hue = hue;
    state.bullets[hue] = [];

    return state;
}

function createGameState() {
    return gameState = {
        players: {
            1: {
                pos: {
                    x: 300,
                    y: 300
                },
                heading: 0,
                angle: 0,
                hue: 200,
                health: 100,
                health: 100,
            }
        },
        bullets: {

        },
        gameStarted: false
    }
}

function gameLoop(game) {
    let { state, players, engine, boundaries, bullets } = game;

    if (!state) {
        return;
    }

    //update players
    for (const [key, player] of Object.entries(players)) {
        player.update(game)
    }

    //update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update()
        if (bullets[i].lifetime <= 0) {
            Composite.remove(engine.world, bullets[i].body)
            bullets.splice(i, 1)
            continue
        }
        for (let boundary of boundaries) {
            if (Collision.collides(bullets[i].body, boundary.body) != null) {
                Composite.remove(engine.world, bullets[i].body)
                bullets.splice(i, 1)
                break
            }
        }
    }

    Engine.update(engine)

    //updating the state to be sent
    for (const [key, value] of Object.entries(players)) {
        state.players[key].pos.x = players[key].body.position.x;
        state.players[key].pos.y = players[key].body.position.y;
        state.players[key].angle = players[key].body.angle;
        state.players[key].heading = players[key].heading;
        state.players[key].health = players[key].health;
        state.players[key].score = players[key].score;
    }

    //clear bullets and re-add
    state.bullets = []
    for (let bullet of bullets) {
        state.bullets.push({
            x: bullet.body.position.x,
            y: bullet.body.position.y,
            hue: bullet.hue,
            lifetime: bullet.lifetime
        })
    }

    return 0
}