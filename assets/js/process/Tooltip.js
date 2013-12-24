define([
	'underscore'
], function(_) {
	var _draw;
	var _currentTooltip;

	function Tooltip(x, y, msg) {
		this._text = _draw.text(function(add) {
			_.each(msg, function(value, key) {
				if(value) {
					if(_.isArray(value)) {
						add.tspan(key + ':').newLine();
						_.each(value, function(subValue) {
							add.tspan(' - ' + subValue).newLine();
						})
					} else {
						add.tspan(key + ': ' + value).newLine();
					}	
				}
			});
		});

		var bbox = this._text.bbox(),
			width = bbox.width + 20,
			height = 20;

		height = Math.max(height, bbox.height + 20);

		this._rect = _draw.path('M10,10L' + (width + 10) + ',10L' + (width + 10) + ',' + (height + 10) + 'L10,' + (height + 10) + 'L10,10')
				.attr({ 
					'fill': '#EFEFEF',
					'stroke': '#9A9A9A',
					'stroke-width': 0.5
				});
		this._text.move(10,5);

		this._group = _draw.group().move(x, y);
		this._group.add(this._rect).add(this._text);
	}

	Tooltip.prototype.destroy = function() {
		this._rect.remove();
		this._text.remove();
		this._group.remove();
	};

	var setDraw = function(draw) {
		_draw = draw;
	};

	var showTooltip = function(x, y, msg) {
		if(_currentTooltip) {
			_currentTooltip.destroy();
		}

		_currentTooltip = new Tooltip(x, y, msg);
	}

	var hideTooltip = function() {
		if(_currentTooltip) {
			_currentTooltip.destroy();
		}
	}

	return {
		setDraw: setDraw,
		show: showTooltip,
		hide: hideTooltip
	};
});