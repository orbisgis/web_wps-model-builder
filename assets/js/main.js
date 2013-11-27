$(function() {
	var $addFilter = $('#add-filter'),
		$deleteFilter = $('#delete-filter'),
		$addLink = $('#add-link'),
		$selectedBoxSpan = $('#selected-box');
	
	$addFilter.click(function(e) {				
		// add the box to the boxes list
		new Box(Math.random() * 800, Math.random() * 400);
	});
	
	$deleteFilter.click(function() {
		Box.getSelectedBox().remove();
	});
	
	$addLink.click(function(e) {
		Box.getSelectedBox().startLine();
	});
	
	$(window).on('unselect-box', function(e) {
		$selectedBoxSpan.text('<nothing>');
	});
	
	$(window).on('select-box', function(e) {					
		$selectedBoxSpan.text(Box.getSelectedBox().getId());
	});
	
});