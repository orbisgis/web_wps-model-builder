define(['SVG'], function(SVG) {
	SVG.Title = function(title) {
		this.constructor.call(this, SVG.create('title'))

		/* store type */
		this.type = 'title'
	}

	SVG.Title.prototype = new SVG.Shape
});