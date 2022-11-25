const { Composite, Bodies, Body } = require('matter-js')

class Boundary {
	constructor(x, y, w, h, world) {
		let options = {
			isStatic: true
		}
		this.body = Bodies.rectangle(x, y, w, h, options);
		this.w = w
		this.h = h
		Composite.add(world, this.body)
	}

	show() {
		fill(255);
		stroke(255);
		let pos = this.body.position
		push()
		translate(pos.x, pos.y)
		rectMode(CENTER)
		rect(0, 0, this.w, this.h)

		pop()
	}
}

module.exports = Boundary