define([
	'SVG', 
	'process/data', 
	'popup/confirm', 
	'popup/input',
	'svg/svg.draggable'
], function(SVG, Data, PopupConfirm, PopupInput) {
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
		
	function Box(x, y, process) {
		this._selected = false;

		if(arguments.length >= 3) {
			this._process = process;
			this._name = process.getDisplayName() || 'Container';
			
			// intputs and outputs
			var inputs = process.getInputs(),
				outputs = process.getOutputs();

			var self = this;
					
			// the container
			this._group = draw.group();
			
			// set the box name
			var text = draw.text(this._name);
			
			// get height and width for the box container
			var height = BOX_HEIGHT * (inputs.length + 2);
			var width = 20 + text.bbox().width;
			
			// circle for inputs and outputs
			var inputGroup = draw.group();
			var outputGroup = draw.group();

			$(inputs).each(function(i, input) {
				var circle = draw.circle(LINE_DIRECTION_RADIUS)
					.move(-LINE_DIRECTION_RADIUS/2, (BOX_HEIGHT * (i + 2)) - (LINE_DIRECTION_RADIUS/2));

				var textProcess = draw.text(input.getDisplayName()),
					textBBox = textProcess.bbox();
				textProcess.move(LINE_DIRECTION_RADIUS, circle.bbox().cy + (LINE_DIRECTION_RADIUS / 2) - textBBox.height);

				// add line if we are drawing one or add an inputbox
				textProcess.click(function() {
					// add line if we are drawing one
					if(drawingLine) {
						// check if the data are compatibles
						var outputDataType = drawingLine._process.getOutputs()[0].getType();

						// TODO: We asume that the output is always a ComplexData
						if(outputDataType === input.getType()) {
							var startBBox = drawingLine._group.bbox(),
								endBBox = self._group.bbox(),
								x1 = startBBox.x + startBBox.width - LINE_DIRECTION_RADIUS / 2,
								y1 = startBBox.y + BOX_HEIGHT + (startBBox.height - BOX_HEIGHT) / 2 + LINE_DIRECTION_RADIUS / 2,
								x2 = endBBox.x,
								y2 = endBBox.y + BOX_HEIGHT + (BOX_HEIGHT * (i + 1));

							var line = draw.line(x1, y1, x2, y2).stroke({ width: 1 });

							drawingLine._group.remember('lines-start').push(line);
							self._group.remember('lines-end').push(line);

							drawingLine = null;
						} else {
							alert("Types incompatibles... (" + outputDataType + ", " + input.getType() + ")");
						}
					} else {
						PopupConfirm("Voulez-vous ajouter une littéral " + input.getType() + "?", function() {
							var litteralBox = new LitteralBox(x, y, input.getType());
						})
					}
				});

				var canAcceptInput = function() {
					if(drawingLine && drawingLine._process.getOutputs()[0].getType() === input.getType()) {
						circle.attr({ fill: 'red' });
						textProcess.attr({ fill: 'red' })
					}
				};

				var setCircleColor = function() {
					circle.attr({ fill: 'black' });
					textProcess.attr({ fill: 'black' })
				}

				// set a color when enter in the box
				circle.on('mouseenter', canAcceptInput);

				textProcess.on('mouseenter', canAcceptInput);
				
				// remove the color when enter in the box
				circle.on('mouseleave', setCircleColor);

				textProcess.on('mouseleave', setCircleColor);

				// add the input name and circle to the groups
				self._group.add(textProcess);
				inputGroup.add(circle);

				// get the max with
				width = Math.max(width, textBBox.width + 2 * LINE_DIRECTION_RADIUS);
			});

			// We suppose there is only 0 or 1 output
			if(outputs.length > 0) {
				var output = outputs[0];

				var circle = draw.circle(LINE_DIRECTION_RADIUS)
					.move(width - LINE_DIRECTION_RADIUS/2, BOX_HEIGHT * (1 + ((1 + inputs.length) / 2)));
			
				outputGroup.add(circle);
			}


			// the container
			var boxContainer = draw.path('M10,10L' + (width + 10) + ',10L' + (width + 10) + ',' + (height + 10) + 'L10,' + (height + 10) + 'L10,10')
				.attr({ 
					'fill': 'none',
					'stroke': BOX_STROKE_COLOR,
					'stroke-width': 1
				});
			
			// the header
			var boxHeader = draw.path('M10,10L' + (width + 10) + ',10L' + (width + 10) + ',' + (BOX_HEIGHT + 10) + 'L10,' + (BOX_HEIGHT + 10) + 'L10,10')
				.attr({ 
					'fill': 'none',
					'stroke': BOX_STROKE_COLOR,
					'stroke-width': 1
				});

			// center the text
			text.move((width - text.bbox().width) / 2, 0);

			// add everything to the group	
			this._group.add(boxContainer);
			this._group.add(boxHeader);
			this._group.add(text);
			this._group.remember('inputes-circle', inputGroup);
			this._group.add(inputGroup);
			this._group.add(outputGroup);
			
			// move the group and set it draggable
			this._group.move(x, y).attr('cursor', 'move').draggable();
			
			// select the box when we click on it
			this._group.click(function() {
				if(!drawingLine) {
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
			
		// unselect the selected box when we click on the draw
		draw.on('click', function(e) {
			if(e.target.id === draw.node.id) {
				Box.unselect();
				drawingLine = null;
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
			
			// unselect the box then remove it 
			this.unselect();
			this._group.remove();
		}
	};
	
	Box.prototype.startLine = function() {
		if(this._group) {
			drawingLine = this;
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
		if(this._selected) {
			_selectedBox = undefined;

			this._selected = false;
			this.setStrokeColor(BOX_STROKE_COLOR);
			
			window.dispatchEvent(new Event('unselect-box'));
		}
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


	function LitteralBox(x, y, type) {
		this._type = type;

		var self = this;

		// create a process with just one output
		this._process = {
			_outputs: [],
			getOutputs: function() {
				return this._outputs;
			},
			addOutput: function(output) {
				this._outputs.push(output);
			}
		};

		this._process.addOutput(new Data({
			displayName: type,
			minOccurs: 1,
			maxOccurs: 1,
			type: type
		}));
					
		// the container
		this._group = draw.group();

		// set the box name
		var text = draw.text(this._type);
			
		// get height and width for the box container
		var height = BOX_HEIGHT * 3; // 1 output
		var width = 20 + 100; // space for input element
			
		// circle for inputs and outputs
		var outputGroup = draw.group();

		// We suppose there is only 0 or 1 output
		var circle = draw.circle(LINE_DIRECTION_RADIUS)
			.move(width - LINE_DIRECTION_RADIUS / 2, BOX_HEIGHT * 2);
	
		outputGroup.add(circle);

		// the container
		var boxContainer = draw.path('M10,10L' + (width + 10) + ',10L' + (width + 10) + ',' + (height + 10) + 'L10,' + (height + 10) + 'L10,10')
			.attr({ 
				'fill': 'none',
				'stroke': BOX_STROKE_COLOR,
				'stroke-width': 1
			});
		
		// the header
		var boxHeader = draw.path('M10,10L' + (width + 10) + ',10L' + (width + 10) + ',' + (BOX_HEIGHT + 10) + 'L10,' + (BOX_HEIGHT + 10) + 'L10,10')
			.attr({ 
				'fill': 'none',
				'stroke': BOX_STROKE_COLOR,
				'stroke-width': 1
			});

		// center the text
		text.move((width - text.bbox().width) / 2, 0);

		// the input element
		var valueRect = draw.rect(100, BOX_HEIGHT)
			.attr({
				'rx': 2,
				'ry': 2,
				'stroke-width': 1,
				'stroke': BOX_SELECTED_COLOR,
				'fill': 'white'
			}).move(LINE_DIRECTION_RADIUS, BOX_HEIGHT * 1.5);
		
		var valueText = draw.text('<Cliquez>').move(LINE_DIRECTION_RADIUS * 2, BOX_HEIGHT * 1.5);
		var fnEditValue = function() {
			PopupInput(valueText.text(), function(value) {
				valueText.text(value);
			})
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
			if(!drawingLine) {
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

	return Box;
});