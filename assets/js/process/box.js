define([
	'SVG',
	'underscore', 
	'process/Events',
	'svg/svg.draggable'
], function(SVG, _, Events) {
	// the current draw
	Box._draw;

	// the selected box
	Box._selectedBox;

	// the line we are drawing
	var drawingLine;

	function Box() {
		this._selected = false;	
		this._draw = Box._draw;

		Box.listenTo(this, 'select-box', _.bind(function() { Box.trigger('select-box', this); }, this));
		Box.listenTo(this, 'unselect-box', _.bind(function() { Box.trigger('unselect-box', this); }, this));
	}

	_.extend(Box, Events);
	_.extend(Box.prototype, Events);

	Box.getDraw = function() {
		return Box._draw;
	}

	Box.setDraw = function(drawId) {
		Box._draw = SVG(drawId);
			
		// unselect the selected box when we click on the draw
		Box._draw.on('click', function(e) {
			if(e.target.id === Box._draw.node.id) {
				Box.unselect();
			}
		});
	}

	Box.prototype.getProcess = function() {
		return this._process;
	};

	Box.prototype.startLine = function() {
		drawingLine = this;
	};

	Box.prototype.endLine = function() {
		drawingLine = undefined;
	}

	Box.prototype.getDrawingLine = function() {
		return drawingLine;
	}

	Box.prototype.select = function() {
		// clear the old selected box
		Box.unselect();
		
		// set the new one
		Box._selectedBox = this;
		this._selected = true;
		
		this.onSelected();
		
		this.trigger('select-box');

		return this;
	}

	Box.prototype.onSelected = function() {
		return this;
	}
	
	Box.prototype.unselect = function() {
		if(this._selected) {
			Box._selectedBox = undefined;

			this._selected = false;
			
			this.onUnselected();

			this.trigger('unselect-box');
		}

		return this;
	}

	Box.prototype.onUnselected = function() {
		return this;
	}

	Box.unselect = function() {
		if(Box._selectedBox) {
			Box._selectedBox.unselect();
		}
	}

	Box.getSelectedBox = function() {
		return !!Box._selectedBox ? Box._selectedBox : new Box();
	}
	
	return Box;
});