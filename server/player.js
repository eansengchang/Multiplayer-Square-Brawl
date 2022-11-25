const { Composite, Bodies, Body, Collision } = require('matter-js')
const { LEFT_KEY, UP_KEY, RIGHT_KEY, DOWN_KEY, JUMP_KEY, SHOOT_KEY, PI, TAU, GAME_HEIGHT, GAME_WIDTH, WEIRD_CONSTANT } = require("./constants");
const Bullet = require("./bullet")

class Player {
    constructor(x, y, hue, world, id) {
        let options = {
            restitution: 0.4,
            friction: 2,
            density: 5
        }
        this.world = world;
        this.hue = hue;
        this.size = 20;
        this.body = Bodies.rectangle(x, y, this.size, this.size, options);
        Composite.add(world, this.body)

        this.heading = 0;
        this.desiredHeading = 0;

        this.keyIsDown = {
            UP_KEY: false, //w
            LEFT_KEY: false, //a
            DOWN_KEY: false, //s
            RIGHT_KEY: false, //d
            JUMP_KEY: false, //v
            SHOOT_KEY: false, //b
        }

        this.jumpCooldown = 0;
        this.fireCooldown = 0

        this.health = 100

        this.id = id;
        this.score = 0
    }

    update(game) {
        //movement
        if (this.keyIsDown[LEFT_KEY]) { //move left
            Body.applyForce(this.body, this.body.position, {
                x: -2 * this.body.velocity.x - WEIRD_CONSTANT,
                y: 0
            })
        }
        if (this.keyIsDown[RIGHT_KEY]) { //move right
            Body.applyForce(this.body, this.body.position, {
                x: -2 * this.body.velocity.x + WEIRD_CONSTANT,
                y: 0
            })
        }

        //fire
        if (this.keyIsDown[SHOOT_KEY]) {
            if (this.fireCooldown + 75 < Date.now()) {
                game.bullets.push((new Bullet(this.body.position.x, this.body.position.y, this.heading, this.hue, this.world, this.id)));
                this.fireCooldown = Date.now();
            }
        }

        //update jump cooldown
        for (let boundary of game.boundaries) {
            if (Collision.collides(this.body, boundary.body) != null) {
                this.jumpCooldown = Date.now();
                break
            }
        }

        //move the heading angle
        if (this.heading > PI) {
            this.heading -= TAU
        }
        if (this.heading < -PI) {
            this.heading += TAU
        }

        let angleDiff = this.desiredHeading - this.heading

        if (angleDiff > PI) {
            angleDiff -= TAU
        }
        if (angleDiff < -PI) {
            angleDiff += TAU
        }

        this.heading += (angleDiff) * 0.3

        //check for collisions with other bullets
        for (let bullet of game.bullets) {
            if (bullet.hue !== this.hue && Collision.collides(this.body, bullet.body) != null) {
                this.health -= 25
                if (this.health <= 0) {
                    let player = game.players[bullet.id]
                    player.score += 1
                    this.death()
                }
                break
            }
        }
    }

    death() {
        this.health = 100
        Body.setPosition(this.body, { x: Math.random() * GAME_WIDTH * 0.8, y: Math.random() * GAME_HEIGHT * 0.8 });
    }

    keyDown(keyCode) {
        this.keyIsDown[keyCode] = true

        //jumping
        if (keyCode === JUMP_KEY) {
            if (this.jumpCooldown + 150 > Date.now()) {
                Body.setVelocity(this.body, {
                    x: this.body.velocity.x,
                    y: Math.min(this.body.velocity.y, -WEIRD_CONSTANT)
                })
            }

        }

        //desired heading update
        if (this.keyIsDown[LEFT_KEY] || this.keyIsDown[RIGHT_KEY] || this.keyIsDown[UP_KEY] || this.keyIsDown[DOWN_KEY]) {
            let x = this.keyIsDown[LEFT_KEY] ? -1 : this.keyIsDown[RIGHT_KEY] ? 1 : 0;
            let y = this.keyIsDown[UP_KEY] ? -1 : this.keyIsDown[DOWN_KEY] ? 1 : 0;
            this.desiredHeading = Math.atan2(y, x);
        }
    }

    keyUp(keyCode) {
        this.keyIsDown[keyCode] = false

        //desired heading update
        if (this.keyIsDown[LEFT_KEY] || this.keyIsDown[RIGHT_KEY] || this.keyIsDown[UP_KEY] || this.keyIsDown[DOWN_KEY]) {
            let x = this.keyIsDown[LEFT_KEY] ? -1 : this.keyIsDown[RIGHT_KEY] ? 1 : 0;
            let y = this.keyIsDown[UP_KEY] ? -1 : this.keyIsDown[DOWN_KEY] ? 1 : 0;
            this.desiredHeading = Math.atan2(y, x);
        }
    }


}

module.exports = Player;