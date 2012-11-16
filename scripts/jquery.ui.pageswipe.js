define(['jqui'], function() {
	
	
	
	(function( $ ){
	
		var methods = {
			init : function( options ) {
				
				/*
				left
				position: absolute
				*/
	
				return this.each(function(index){
					$(this).css('position', 'absolute');
					var left = index * $('.wrapper').width();
					$(this).css('left', left+'px');
					$(window).bind('resize.tooltip', methods.reposition);
				});
	
			},
			destroy : function( ) {
	
				return this.each(function(){
					$(window).unbind('.tooltip');
				})
			}
		};
	
		$.fn.pageswipe = function( method ) {
	    
			if ( methods[method] ) {
				return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
			} else if ( typeof method === 'object' || ! method ) {
				return methods.init.apply( this, arguments );
			} else {
				$.error( 'Method ' +  method + ' does not exist on jQuery.pageswipe' );
			}
			
			/* 
				bind
					touch events
					window resize
				
				methods
					loadNext
					touchMove
						swipeNext
						swipeBack
				*/
	  
		};
	
	})( jQuery );
	
	
	
});