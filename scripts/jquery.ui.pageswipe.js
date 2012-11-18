define(['jqui'], function() {
	
	
	
	(function( $ ){
	
		var methods = {
			init : function( options ) {
			
				//$(".page").on("click", this.touchStartRecord());
				/*
				left
				position: absolute
				*/
				console.log(this);
				var self = this;
	
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
		
			var track = {}
		
			$(".page").on("touchstart", touchStartRecord);
			$(".page").on("touchend", touchEndRecord);
	    
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
					*/
			
			function touchStartRecord(e) {
				console.log(e.touches[0].pageX);
				track.move.start = e.touches[0].pageX;
			}
			
			function touchEndRecord(e) {
				console.log('stop');
				alert(track.move.start);
			}
					
					/*
				
				methods
					loadNext
					touchMove
						swipeNext
						swipeBack
				*/
				
				
	  
		};
	
	})( jQuery );
	
	
	
});