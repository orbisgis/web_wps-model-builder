define([
	'SVG', 
	'process/Box',
	'alertify'
], function(SVG, Box, alertify) {

	// constants
	var BOX_WIDTH = 50;
	var BOX_HEIGHT = 25;
	var BOX_STROKE_COLOR = 'black';
	var BOX_SELECTED_COLOR = '#0193FE';
	var LINE_DIRECTION_RADIUS = 6;

	function LitteralBox(x, y, process) {
		Box.call(this);

		var self = this;

		// create a process with just one output
		this._process = process;
					
		// the container
		this._group = this._draw.group();

		// set the box name
		var text = this._draw.text(this._process.get('displayName'));
			
		// get height and width for the box container
		var height = BOX_HEIGHT * 3; // 1 output
		var width = 20 + 100; // space for input element
			
		// circle for inputs and outputs
		var outputGroup = this._draw.group();

		// We suppose there is only 0 or 1 output
		var circle = this._draw.circle(LINE_DIRECTION_RADIUS)
			.move(width - LINE_DIRECTION_RADIUS / 2, BOX_HEIGHT * 2);
	
		outputGroup.add(circle);

		// the container
		var boxContainer = this._draw.path('M10,10L' + (width + 10) + ',10L' + (width + 10) + ',' + (height + 10) + 'L10,' + (height + 10) + 'L10,10')
			.attr({ 
				'fill': 'none',
				'stroke': BOX_STROKE_COLOR,
				'stroke-width': 1
			});
		
		// the header
		var boxHeader = this._draw.path('M10,10L' + (width + 10) + ',10L' + (width + 10) + ',' + (BOX_HEIGHT + 10) + 'L10,' + (BOX_HEIGHT + 10) + 'L10,10')
			.attr({ 
				'fill': 'none',
				'stroke': BOX_STROKE_COLOR,
				'stroke-width': 1
			});

		// center the text
		text.move((width - text.bbox().width) / 2, 0);

		// the input element
		var valueRect = this._draw.rect(100, BOX_HEIGHT)
			.attr({
				'rx': 2,
				'ry': 2,
				'stroke-width': 1,
				'stroke': BOX_SELECTED_COLOR,
				'fill': 'white'
			}).move(LINE_DIRECTION_RADIUS, BOX_HEIGHT * 1.5);
		
		var valueText = this._draw.text('<Cliquez>').move(LINE_DIRECTION_RADIUS * 2, BOX_HEIGHT * 1.5);
		var fnEditValue = function() {
			alertify.prompt("Entrer votre valeur", function(e, value) {
				if(e) {
					valueText.text(value);
					process.setValue(value);
				}
			}, valueText.text());
		};

		valueRect.click(fnEditValue);
		valueText.click(fnEditValue);

		// add everything to the group	
		this._group.add(boxContainer);
		this._group.add(boxHeader);
		this._group.add(text);
		this._group.remember('outputs-circle', outputGroup);
		this._group.add(outputGroup);
		this._group.add(valueRect);
		this._group.add(valueText);

		// move the group and set it draggable
		this._group.move(x, y).attr('cursor', 'move').draggable();
		
		// select the box when we click on it
		this._group.click(function() {
			if(!self.getDrawingLine()) {
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
			
		// remember the start and end of the line
		this._group.dragstart = function() {
			var linesStart = this.remember('lines-start'),
				i, j, l
			
			for(i=0, j=linesStart.length; i<j; i++) {
				l = linesStart[i];
				
				l.remember('start-x', l.attr('x1'));
				l.remember('start-y', l.attr('y1'));
			}
		}
			
		// move the line
		this._group.dragmove = function(delta, event) {
			var linesStart = this.remember('lines-start'),
				i, j, l, x, y, circle;
			
			for(i=0, j=linesStart.length; i<j; i++) {
				l = linesStart[i],
				x = l.remember('start-x') + delta.x,
				y = l.remember('start-y') + delta.y;
					
				l.attr('x1', x).attr('y1', y);
			}
		}
	}

	LitteralBox.prototype = new Box();

	LitteralBox.prototype.getId = function() {
		return this._group ? this._group.node.id : '';
	}
	
	LitteralBox.prototype.remove = function() {
		if(this._group) {
			// delete all lines
			var linesStart = this._group.remember('lines-start'),
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

			// unselect the box then remove it 
			this.unselect();
			this._group.remove();
		}
	};
	
	LitteralBox.prototype.isSelected = function() {
		return this._selected;
	}

	LitteralBox.prototype.setStrokeColor = function(color) {
		if(this._group) {	
			this._group.each(function() { 
				if(this.type === 'path') {
					this.stroke({ color: color });
				}
			});
		}
	}
	
	LitteralBox.prototype.onSelected = function() {	
		this.setStrokeColor(BOX_SELECTED_COLOR);
	}
	
	LitteralBox.prototype.onUnselected = function() {
		this.setStrokeColor(BOX_STROKE_COLOR);
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
	
	Box.prototype.getSVGBox = function() {
		return this._group;
	}

	return LitteralBox;
});