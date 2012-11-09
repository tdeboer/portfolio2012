define(['jqui'], function() {
	
	
	
	(function($) {

	    $.widget("ui.pageswipe", {
			options: {
				location: "bottom",
				color: "#fff",
				backgroundColor: "#000"
			},
					
			_create: function() {
				
				var self = this,
					o = self.options,
					el = self.element,
					
				
				el.bind('touchstart', this._touchStart);
				el.bind('touchend', this._touchEnd);
				el.bind('touchmove', this._touchMove);
			},
			
			_touchStart: function() {
				$('section:first').text(e.originalEvent.touches[0].clientX);
			},
			_touchEnd: function() {

				
			},
			_touchMove: function(e) {
					
				
			},
					
			destroy: function() {			
				this.element.next().remove();
			},
			
			_setOption: function(option, value) {
				$.Widget.prototype._setOption.apply( this, arguments );
				
			}
		});
	})(jQuery);

	
	
	
});