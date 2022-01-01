class Boundary {
	constructor(x, y, w, h) {
		this.x = x
		this.y = y
		this.w = w
		this.h = h
	}

	show() {
		fill(255);
		stroke(255);
		push()
		translate(this.x, this.y)
		rectMode(CENTER)
		rect(0, 0, this.w, this.h)

		pop()
	}
}
