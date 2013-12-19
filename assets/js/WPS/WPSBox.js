define([
	'SVG', 
	'process/Box',
	'litteral/LitteralManager',
	'popup/popup', 
	'svg/svg.draggable'
], function(SVG, Box, LitteralManager, Popup) {	
	// constants
	var BOX_WIDTH = 50;
	var BOX_HEIGHT = 25;
	var BOX_STROKE_COLOR = 'black';
	var BOX_SELECTED_COLOR = '#0193FE';
	var LINE_DIRECTION_RADIUS = 6;
		
	function WPSBox(x, y, process) {
		Box.call(this);

		if(arguments.length >= 3) {
			this._process = process;
			this._name = process.getDisplayName() || 'Container';
			
			// intputs and outputs
			var inputs = process.getInputs(),
				outputs = process.getOutputs();

			var self = this;
					
			// the container
			this._group = this._draw.group();
			
			// set the box name
			var text = this._draw.text(this._name);
			
			// get height and width for the box container
			var height = BOX_HEIGHT * (inputs.length + 2);
			var width = 20 + text.bbox().width;
			
			// circle for inputs and outputs
			var inputGroup = this._draw.group();
			var outputGroup = this._draw.group();

			$(inputs).each(function(i, input) {
				var circle = self._draw.circle(LINE_DIRECTION_RADIUS)
					.move(-LINE_DIRECTION_RADIUS/2, (BOX_HEIGHT * (i + 2)) - (LINE_DIRECTION_RADIUS/2));

				var textProcess = self._draw.text(input.getDisplayName()),
					textBBox = textProcess.bbox();
				textProcess.move(LINE_DIRECTION_RADIUS, circle.bbox().cy + (LINE_DIRECTION_RADIUS / 2) - textBBox.height);

				// add line if we are drawing one or add an inputbox
				textProcess.click(function() {
					var drawingLine = self.getDrawingLine();
					// add line if we are drawing one
					if(drawingLine) {
						// check if the data are compatibles
						var outputData = drawingLine._process.getOutputs()[0],
							outputDataType = outputData.getType();

						// TODO: We asume that the output is always a ComplexData
						if(outputDataType === input.getType()) {
							var startBBox = drawingLine._group.bbox(),
								endBBox = self._group.bbox(),
								x1 = startBBox.x + startBBox.width - LINE_DIRECTION_RADIUS / 2,
								y1 = startBBox.y + BOX_HEIGHT + (startBBox.height - BOX_HEIGHT) / 2 + LINE_DIRECTION_RADIUS / 2,
								x2 = endBBox.x,
								y2 = endBBox.y + BOX_HEIGHT + (BOX_HEIGHT * (i + 1));

							var line = self._draw.line(x1, y1, x2, y2).stroke({ width: 1 });

							drawingLine._group.remember('lines-start').push(line);
							self._group.remember('lines-end').push(line);

							// save the link in the input and output data
							input.addLink(outputData, drawingLine._process);
							outputData.addLink(input, process);

							// we are done drawing the line
							self.endLine();
						} else {
							Popup.notification("Types incompatibles... (" + outputDataType + ", " + input.getType() + ")");
						}
					} else {
						Popup.confirm("Voulez-vous ajouter une littéral " + input.getType() + "?", function() {
							LitteralManager.addLitteral(input.getType());
						})
					}
				});

				var canAcceptInput = function() {
					var drawingLine = self.getDrawingLine();
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

				var circle = this._draw.circle(LINE_DIRECTION_RADIUS)
					.move(width - LINE_DIRECTION_RADIUS/2, BOX_HEIGHT * (1 + ((1 + inputs.length) / 2)));
			
				outputGroup.add(circle);
			}

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
	}
	
	WPSBox.prototype = new Box();

	WPSBox.prototype.getId = function() {
		return this._group ? this._group.node.id : '';
	}
	
	WPSBox.prototype.remove = function() {
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
	
	WPSBox.prototype.startLine = function() {
		if(this._group) {
			Box.prototype.startLine.call(this);
		}
	};
	
	WPSBox.prototype.isSelected = function() {
		return this._selected;
	}

	WPSBox.prototype.setStrokeColor = function(color) {
		if(this._group) {	
			this._group.each(function() { 
				if(this.type === 'path') {
					this.stroke({ color: color });
				}
			});
		}
	}
	
	WPSBox.prototype.onSelected = function() {	
		this.setStrokeColor(BOX_SELECTED_COLOR);
	}
	
	WPSBox.prototype.onUnselected = function() {
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

	return WPSBox;
});