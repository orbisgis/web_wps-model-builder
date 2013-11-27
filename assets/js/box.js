(function(window) {
	var draw = SVG('svg-container');
	var _selectedBox;
	var drawingLine;

	var BOX_WIDTH = 50;
	var BOX_HEIGHT = 25;
	var BOX_STROKE_COLOR = 'black';
	var BOX_SELECTED_COLOR = '#0193FE';
	var LINE_DIRECTION_RADIUS = 6;
	
	var getRandomColor = (function() {
		var letters = '0123456789ABCDEF'.split('');
		
		return function() {
			var color = '#';
			for (var i = 0; i < 6; i++ ) {
				color += letters[Math.round(Math.random() * 15)];
			}
			return color;
		}
	})();
	
	// move the line as the mouse does
	draw.on('mousemove', function(e) {
		if(drawingLine) {
			drawingLine.attr('x2', e.offsetX).attr('y2', e.offsetY);
			
			if(!Box.isSelectedBox(e.target) && e.target.id !== draw.node.id) {
				var element = SVG.get(e.target.id);
				
				if(element) {								
					var bbox = element.bbox();
					drawingLine.attr('x2', bbox.cx).attr('y2', bbox.cy);
				}
			} 
		}
	});
	
	draw.on('click', function(e) {
		if(e.target.id === draw.node.id) {
			Box.unselect();
		}
	});
				
	function Box(x, y) {
		this._selected = false;
		
		if(arguments.length > 1) {
			var self = this;
			
			this._box = draw.rect(BOX_WIDTH, BOX_HEIGHT)
				.attr({ 
					fill: 'white',
					'stroke': BOX_STROKE_COLOR,
					'stroke-width': 1,
					'cursor': 'move',
				})
				.move(x, y)
				.draggable();
			
			// select the box when we click on it
			this._box.click(function() {
				// the line end in the box
				if(drawingLine) {
					self.endLine();
				} else {
					// the destination is not selected when we draw a line
					self.select();
				}
			});
			
			// set a color when enter in the box
			this._box.on('mouseenter', function(e) {
				self._box.stroke({ color: BOX_SELECTED_COLOR });
			});
			
			// remove the color when enter in the box
			this._box.on('mouseleave', function(e) {
				if(!self.isSelected()) {
					self._box.stroke({ color: BOX_STROKE_COLOR });
				}
			});

			// remember the lines we linked to this box
			this._box.remember('lines-start', []);
			this._box.remember('lines-end', []);
			
			// remember the start and end of the line
			this._box.dragstart = function() {
				var linesStart = this.remember('lines-start'),
					linesEnd = this.remember('lines-end'),
					i, j, l
				
				for(i=0, j=linesStart.length; i<j; i++) {
					l = linesStart[i];
					
					l.remember('start-x', l.attr('x1'));
					l.remember('start-y', l.attr('y1'));
				}
				
				for(i=0, j=linesEnd.length; i<j; i++) {
					l = linesEnd[i];
					
					l.remember('end-x', l.attr('x2'));
					l.remember('end-y', l.attr('y2'));
				}
			}
			
			// move the line
			this._box.dragmove = function(delta, event) {
				var linesStart = this.remember('lines-start'),
					linesEnd = this.remember('lines-end'),
					i, j, l, x, y, circle;
				
				for(i=0, j=linesStart.length; i<j; i++) {
					l = linesStart[i],
					x = l.remember('start-x') + delta.x,
					y = l.remember('start-y') + delta.y;
						
					l.attr('x1', x).attr('y1', y);
				}
				
				for(i=0, j=linesEnd.length; i<j; i++) {
					l = linesEnd[i],
					x = l.remember('end-x') + delta.x,
					y = l.remember('end-y') + delta.y;
						
					l.attr('x2', x).attr('y2', y);
					
					circle = l.remember('circle');
					circle.move(x-LINE_DIRECTION_RADIUS/2, y-LINE_DIRECTION_RADIUS/2);
				}
			}
		}
	};
		
	Box.prototype.getId = function() {
		return this._box ? this._box.node.id : '';
	}
	
	Box.prototype.remove = function() {
		if(this._box) {
			// delete all lines
			var linesStart = this._box.remember('lines-start'),
				linesEnd = this._box.remember('lines-end'),
				i, j, line, b, 
				lines, k, l, index;
				
			for(i=0, j=linesStart.length; i<j; i++) {
				line = linesStart[i],
				b = SVG.get(line.remember('end'));
				
				if(b) {
					lines = b.remember('lines-end');
					k=0, l=lines.length, index=-1;
					
					while(k<l && index === -1) {
						if(lines[k].node.id === line.node.id) {
							index = k;
						}
						k++;
					}
					
					if(index >= 0) {
						lines.splice(index, 1);
					}
					
					b.remember('lines-end', lines);
				}
				
				line.remember('circle').remove();
				line.remove();
			}
			
			for(i=0, j=linesEnd.length; i<j; i++) {
				line = linesEnd[i],
				b = SVG.get(line.remember('start'));
				
				if(b) {
					lines = b.remember('lines-start');
					k=0, l=lines.length, index=-1;
					
					while(k<l && index === -1) {
						if(lines[k].node.id === line.node.id) {
							index = k;
						}
						k++;
					}
					
					if(index >= 0) {
						lines.splice(index, 1);
					}
					
					b.remember('lines-start', lines);
				}
				
				line.remember('circle').remove();
				line.remove();
			}						
			
			this._box.remove();
		}
	};
	
	Box.prototype.startLine = function() {
		if(this._box) {
			var bbox = this._box.bbox();
			var line = draw.line(bbox.cx, bbox.cy, bbox.cx, bbox.cy)
				.stroke({ width: 1 });
				
			// remember the line
			var lines = this._box.remember('lines-start');
			lines.push(line);
			this._box.remember('lines-start', lines);
			
			// set the id of the starting box
			line.remember('start', this._box.node.id);

			// we have now a drawing line
			drawingLine = line;
		}
	};
	
	Box.prototype.endLine = function() {
		if(this._box) {
			var lines = this._box.remember('lines-end');
			lines.push(drawingLine);
			this._box.remember('lines-end', lines);
			
			drawingLine.remember('end', this._box.node.id);
			
			// draw a circle to set the direction
			var x = drawingLine.attr('x2'),
				y = drawingLine.attr('y2');
			var circle = draw.circle(LINE_DIRECTION_RADIUS)
				.move(x-LINE_DIRECTION_RADIUS/2, y-LINE_DIRECTION_RADIUS/2)
				.fill('black')
				.stroke({ width: 1 });
			drawingLine.remember('circle', circle);	
			
			// set to null the drawing line
			drawingLine = null;
		}
	}

	Box.prototype.isSelected = function() {
		return this._selected;
	}

	Box.prototype.select = function() {
		// clear the old selected box
		Box.unselect();
		
		// set the new one
		_selectedBox = this;
		this._selected = true;
		
		_selectedBox._box.stroke({ color: BOX_SELECTED_COLOR });
		
		window.dispatchEvent(new Event('select-box'));
	}
	
	Box.prototype.unselect = function() {
		this._selected = false;
		
		if(this._box) {
			this._box.stroke({ color: BOX_STROKE_COLOR });
		}
		
		window.dispatchEvent(new Event('unselect-box'));
	}
	
	Box.unselect = function() {
		if(_selectedBox) {
			_selectedBox.unselect();
		}
	}
	
	Box.isSelectedBox = function(box) {
		return !!_selectedBox && !!_selectedBox._box && !!box && 
			((!!box.id && box.id === _selectedBox._box.node.id) || (!!box.node && !!box.node.id && box.node.id === _selectedBox._box.node.id));
	}
	
	Box.getSelectedBox = function() {
		return _selectedBox;
	}
	
	Box.prototype.getSVGBox = function() {
		return this._box;
	}
		
	window.Box = Box;
})(window);