define(['jqui','events','transit'], function() {

	/*
	todo:
	- call widget lik this: $('wrapper').swipeable({ options });
	- make independent plugin and add listener to the swipe
	- use var instead of options
	*/
	
	$(function() {
	
		var windowWidth;
	
		 $.widget( "custom.swipeable", {
		 	next: null,
		 	prev: null,
		 	swipeStart: {},
            swipeStop: {},
            pos: null,
		 	
            // default options
            options: {
                // callbacks
                change: null,
                random: null,
                selector: '.page',
                scrollSupressionThreshold: 20, // More than this horizontal displacement, and we will suppress scrolling.
                swipeThreshold: 100,  // Swipe horizontal displacement must be more than this to go to next page
                verticalDistanceThreshold: 40, // Swipe vertical displacement must be less than this.
                slideInAction: false,
                swipeBoundry: 40, // Stop the swipe at this point if there is nothing to swipe to
                disableSwipe: false,
                scrolling: false,
                timer: null
            },
 
            // the constructor
            _create: function() {
                var $el = this.element;

                padding = parseInt( $el.css('padding-left') );
                windowWidth = $(window).width();
                $el.width( windowWidth-(2*padding) );
                this.next = $el.next('.page');
                this.prev = $el.prev('.page');
                
                // Hide all pages except the first.
                // Not with css so with javascript disabled the pages are still available
                if (!this.prev.length) {
	                this.pos = 'first';
	                $el.addClass('current');
                } else {
	                $el.css('display', 'none');
	                $el.css({ x: 0 });
	                if (!this.next.length) {
	                	this.pos = 'last';
	                }
                }
                
                
                if ($el.is(':empty')) {
	                $el.data('content', false);
                } else {
	                $el.data('content', true);
	            }

                this._on({
                	touchstart: "_touchStart",
                	touchmove: "_touchMove",
                	touchend: "_touchEnd",
                	scrollstop: "_scroll"
                });
            },
 
            _touchStart: function(event) {
	            this.next.show();
            	this.next.find('article').show(); // to make sure the parent .page doesn't influence the document size
            	this.prev.show();
            	this.prev.find('article').show();

            	// set starting point of the potential swipe
            	var data = event.originalEvent.touches[0];
            	// use var instead of options!
            	this.swipeStart = {
					coords: [ data.pageX, data.pageY ]
				};
            },
            
            _touchMove: function(event) {
	            var $el = this.element;
                var data = event.originalEvent.touches[0];
				var start = this.swipeStart;
				var current = { coords: [ data.pageX, data.pageY ] };
                var diffX = start.coords[0] - current.coords[0];
                var diffY = start.coords[1] - current.coords[1];
                
                if( (Math.abs(diffX) > this.options.scrollSupressionThreshold && Math.abs(diffY) < this.options.verticalDistanceThreshold && !this.options.scrolling) || this.options.slideInAction ) {
	                event.preventDefault();
                	diffX = start.coords[0] - current.coords[0];
               	
	                this.options.slideInAction = true;
	                var newPos = -1* diffX;
	                $el.css({ x: newPos });
	                this.next.css({ x: newPos });
	                this.prev.css({ x: newPos });
	                this.swipeStop = current;
                }
            },
            
            _touchEnd: function(event) {
            	this.options.scrolling = false;
	            var start = this.swipeStart;
                var end = this.swipeStop;
            	var diff = start.coords[0] - end.coords[0];
            	var $el = this.element;
            	this.options.slideInAction = false;

            	// snap to point
            	// todo: modernizr check
            	if (Math.abs(diff) > this.options.swipeThreshold){
	            	if (diff > 0 && this.pos != 'last') {
	            		// swipe to next
	            		newPos = -1*windowWidth;
	            		$el.transition({ x: newPos });
		            	this.next.transition({ x: newPos }, function() {
			            	$el.find('article').hide(); // since the pages are positioned absolute, the child element have to be hidden for the document height to be updated and therefore also the scrollbar
		            	});
	            	} else if (diff < 0 && this.pos != 'first') {
		            	// swipe to previous
		            	newPos = windowWidth;
	            		$el.transition({ x: newPos });
		            	this.prev.transition({ x: '0px' }, function() {
			            	$el.find('article').hide();	
		            	});
	            	} else {
		            	// no page available -> bounce back
		            	this.bounceBack();
	            	}
            	} else {
	            	// not enough swipe -> bounce back
	            	this.bounceBack();
            	}
            },
            
            
            _scroll: function(event) {
            	this.options.scrolling = false;
            },
            
            bounceBack: function() {
	            this.element.transition({ x: "0" });
            	this.next.transition({ x: windowWidth });
            	this.prev.transition({ x: -1*windowWidth });
            	this.next.css('display', 'none');
            	this.prev.css('display', 'none');
            }
             
        });
        
        
        
         $( ".page" ).swipeable();
        
	});
	
	
	
	
	// Special page outside the swipe interaction
	$('.btn-about').click(function(event) {
		event.preventDefault();
		
		// show about-page
		$('.special-page').show();
		
		
		$('.special-page').css({
			perspective: '1000px',
			rotateY: '-90deg'
		});
		
		// animate current page
		// todo: ease back (Vera's slides)
		$('.page.current').transition({
			perspective: '1000px',
			rotateY: '90deg'
		}, 400, 'linear', function() {
			// animate about-page
			$('.special-page').transition({
				perspective: '1000px',
				rotateY: '0deg'
			}, 400, 'linear');	
		});
		
		
		
	});
	

	
});