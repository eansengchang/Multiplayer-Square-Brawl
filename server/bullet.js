const { Composite, Bodies, Body } = require('matter-js');
const { HALF_PI } = require("./constants")

class Bullet {
	constructor(x, y, heading, hue, world, id) {
		let options = {
			restitution: 0.1,
			friction: 1,
			density: 1,
			frictionAir: 0,
			timeScale: 0.2
		}
		this.lifetime = 100
		this.r = 10
		this.hue = hue
		this.id = id

		//aim slightly higher
		if (heading > HALF_PI || heading < -HALF_PI) {
			heading += 0.01 + Math.random() * 0.02
		} else {
			heading -= 0.01 + Math.random() * 0.02
		}

		this.body = Bodies.circle(x + Math.cos(heading) * 20, y + Math.sin(heading) * 20, this.r / 2, options);

		Body.setVelocity(this.body, {
			x: Math.cos(heading) * 15,
			y: Math.sin(heading) * 15
		})

		Composite.add(world, this.body)
	}

	update() {
		//decrease lifetime
		this.lifetime -= 1;
	}
}

module.exports = Bullet;