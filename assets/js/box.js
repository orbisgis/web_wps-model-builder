(function(window) {
	// the current draw
	var draw;
	
	// the selected box
	var _selectedBox;
	
	// the line we are drawing
	var drawingLine;

	// constants
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
			
	function Box(x, y, process) {
		this._selected = false;

		if(arguments.length >= 3) {
			this._process = process;
			this._name = process.getName() || 'Container';
		
			var self = this;
					
			this._group = draw.group();
			
			// set the box name
			var text = draw.text(this._name).move(10, 0);
			
			// get height and width for the box container
			var height = BOX_HEIGHT * (process.getInputs() + 2);
			var width = 20 + text.bbox().width;
			
			// the container
			var boxContainer = draw.path('M10,10L' + (width + 10) + ',10L' + (width + 10) + ',' + (height + 10) + 'L10,' + (height + 10) + 'L10,10')
				.attr({ 
					'fill': 'white',
					'stroke': BOX_STROKE_COLOR,
					'stroke-width': 1
				});
			
			// the header
			var boxHeader = draw.path('M10,10L' + (width + 10) + ',10L' + (width + 10) + ',' + (BOX_HEIGHT + 10) + 'L10,' + (BOX_HEIGHT + 10) + 'L10,10')
				.attr({ 
					'fill': 'white',
					'stroke': BOX_STROKE_COLOR,
					'stroke-width': 1
				});
			
			var inputGroup = draw.group();
			
			for(var i=0, j=process.getInputs(); i<j; i++) {
				var circle = draw.circle(LINE_DIRECTION_RADIUS)
					.move(-LINE_DIRECTION_RADIUS/2, (BOX_HEIGHT * (i + 2)) - (LINE_DIRECTION_RADIUS/2));
				
				inputGroup.add(circle);
			}
			
			
			// add everything to the group	
			this._group.add(boxContainer);
			this._group.add(boxHeader);
			this._group.add(text);
			this._group.remember('inputes-circle', inputGroup);
			this._group.add(inputGroup);
			
			// move the group and set it draggable
			this._group.move(x, y).attr('cursor', 'move').draggable();
			
			// select the box when we click on it
			this._group.click(function() {
				// the line end in the box
				if(drawingLine) {
					self.endLine();
				} else {
					// the destination is not selected when we draw a line
					self.select();
				}
			});
			
			// set a color when enter in the box
			this._group.on('mouseenter', function(e) {
				self.setStrokeColor(BOX_SELECTED_COLOR);
			});
			
			// remove the color when enter in the box
			this._group.on('mouseleave', function(e) {
				if(!self.isSelected()) {
					self.setStrokeColor(BOX_STROKE_COLOR);
				}
			});
			
			// remember the lines we linked to this box
			this._group.remember('lines-start', []);
			this._group.remember('lines-end', []);
			
			// remember the start and end of the line
			this._group.dragstart = function() {
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
			this._group.dragmove = function(delta, event) {
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
				}
			}
		}
	};
	
	Box.setDraw = function(drawId) {
		draw = SVG(drawId);
		
		var getGroupFromElement = function(el) {
			if(el.type === 'g') {
				return el;
			} else if(el.parent) {
				return getGroupFromElement(el.parent);
			} else {
				return;
			}
		}	
	
		// move the line as the mouse does
		draw.on('mousemove', function(e) {
			if(drawingLine) {
				drawingLine.attr('x2', e.offsetX).attr('y2', e.offsetY);
				
				if(!Box.isSelectedBox(e.target) && e.target.id !== draw.node.id) {
					var element = getGroupFromElement(SVG.get(e.target.id));
					
					if(element) {	
						var inputGroup = element.remember('inputes-circle');
						var bbox = element.bbox();
						
						if(inputGroup && inputGroup.children().length > 0) {
							var inputs = inputGroup.children(),
								minY = Math.abs(bbox.y + inputs[0].attr('cy') - e.offsetY),
								minIndex = 0;
								
							for(var i=1, j=inputs.length; i<j; i++) {
								if(minY > Math.abs(bbox.y + inputs[i].attr('cy') - e.offsetY)) {
									minY = Math.abs(bbox.y + inputs[i].attr('cy') - e.offsetY);
									minIndex = i;
								}
							}
							
							drawingLine.attr('x2', bbox.x).attr('y2', bbox.y + inputs[minIndex].attr('cy'));
						}
					}
				} 
			}
		});
		
		// unselect the selected box when we click on the draw
		draw.on('click', function(e) {
			if(e.target.id === draw.node.id) {
				Box.unselect();
			}
		});
	}
	
	Box.prototype.getId = function() {
		return this._group ? this._group.node.id : '';
	}
	
	Box.prototype.remove = function() {
		if(this._group) {
			// delete all lines
			var linesStart = this._group.remember('lines-start'),
				linesEnd = this._group.remember('lines-end'),
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
				
				line.remove();
			}						
			
			this._group.remove();
		}
	};
	
	Box.prototype.startLine = function() {
		if(this._group) {
			var bbox = this._group.bbox();
			var line = draw.line(bbox.x + bbox.width, bbox.y + BOX_HEIGHT + (bbox.height-BOX_HEIGHT)/2, bbox.cx, bbox.cy)
				.stroke({ width: 1 });
				
			// remember the line
			var lines = this._group.remember('lines-start');
			lines.push(line);
			this._group.remember('lines-start', lines);
			
			// set the id of the starting box
			line.remember('start', this._group.node.id);

			// we have now a drawing line
			drawingLine = line;
		}
	};
	
	Box.prototype.endLine = function() {
		if(this._group) {
			var lines = this._group.remember('lines-end');
			lines.push(drawingLine);
			this._group.remember('lines-end', lines);
			
			drawingLine.remember('end', this._group.node.id);
			
			// set to null the drawing line
			drawingLine = null;
		}
	}

	Box.prototype.isSelected = function() {
		return this._selected;
	}

	Box.prototype.setStrokeColor = function(color) {
		if(this._group) {	
			this._group.each(function() { 
				if(this.type === 'path') {
					this.stroke({ color: color });
				}
			});
		}
	}
	
	Box.prototype.select = function() {
		// clear the old selected box
		Box.unselect();
		
		// set the new one
		_selectedBox = this;
		this._selected = true;
		
		this.setStrokeColor(BOX_SELECTED_COLOR);
		
		window.dispatchEvent(new Event('select-box'));
	}
	
	Box.prototype.unselect = function() {
		this._selected = false;
		this.setStrokeColor(BOX_STROKE_COLOR);
		
		window.dispatchEvent(new Event('unselect-box'));
	}
	
	Box.unselect = function() {
		if(_selectedBox) {
			_selectedBox.unselect();
		}
	}
	
	var testId = function(el, id) {
		return !!id && !!el && ((!!el.id && el.id === id) || (!!el.node && !!el.node.id && el.node.id === id))
	}
	
	var testIdRev = function(el, id) {
		if(testId(el, id)) {
			return true;
		} else {
			return el.parentNode ? testIdRev(el.parentNode, id) : false;
		}
	}
	
	Box.isSelectedBox = function(el) {
		if(_selectedBox && _selectedBox._group) {
			var id = _selectedBox._group.node.id;
			
			return testIdRev(el, id);
		} else {
			return false;
		}
	}
	
	Box.getSelectedBox = function() {
		return !!_selectedBox ? _selectedBox : new Box();
	}
	
	Box.prototype.getSVGBox = function() {
		return this._group;
	}
		
	window.Box = Box;
})(window);