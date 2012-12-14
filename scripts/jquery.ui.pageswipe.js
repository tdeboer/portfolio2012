define(['jqui','events','transit'], function() {

	/*
	todo:
	- call widget lik this: $('wrapper').swipeable({ options });
	- make independent plugin and add listener to the swipe
	- use var instead of options
	- modernizr checks
	*/
	
	$(function() {
	
		var windowWidth;
		var scr = false;
		var slideAnimating = false;
	
		 $.widget( "custom.swipeable", {
		 	current: null,
		 	next: null,
		 	prev: null,
		 	swipeStart: {},
            swipeStop: {},
            pos: null,
            preventScroll: false,
		 	
            // default options
            options: {
                // callbacks
                change: null,
                random: null,
                selector: '.page',
                scrollSupressionThreshold: 20, // More than this horizontal displacement, and we will suppress scrolling.
                swipeThreshold: 100,  // Swipe horizontal displacement must be more than this to go to next page
                verticalDistanceThreshold: 60, // Swipe vertical displacement must be less than this.
                sliding: false,
                swipeBoundry: 40, // Stop the swipe at this point if there is nothing to swipe to
                disableSwipe: false,
                scrolling: false,
                timer: null
            },
 
            // the constructor
            _create: function() {
                var $el = this.element;
                this.current = $el.children().first();
                this.next = $el.children().first().next();
                this.prev = $el.children().first().prev();
                windowWidth = $(window).width();
                
                // setup all pages
                $el.children().each(function() {
	                var $page = $(this);
	                var padding = parseInt( $page.css('padding-left') );
	                $page.width( windowWidth-(2*padding) );
	               // $page.css('display', 'none'); // Hide all pages except the first. Not with css so with javascript disabled the pages are still available
	                if ($page.is(':empty')) {
		                $page.data('content', false);
	                }
                });
                
                // Good to know what page is first and last when handling the swipe
                $el.children().first().show().data('first');
                $el.children().last().data('last');

                // bind all listeners
                this._on({
                	touchstart: "_touchStart",
                	touchmove: "_touchMove",
                	touchend: "_touchEnd",
                	scrollstart: "_scrollStart"
                });
                
                $(window).bind('scrollstop', this._scrollStop);
            },
 
            _touchStart: function(event) {
	            this.next.css('display', 'inline-block');
            	//this.next.find('article').show(); // to make sure the parent .page doesn't influence the document size
            	
            	//this.prev.show();
            	//this.prev.find('article').show();

            	this.curPos = parseInt( this.element.css('x') );

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
                //$('.debug').text(slideAnimating);
                
                if (!slideAnimating) {
	               
	                if (!scr) {
		                if( (Math.abs(diffX) > this.options.scrollSupressionThreshold && Math.abs(diffY) < this.options.verticalDistanceThreshold) || this.options.sliding ) {
			                event.preventDefault();
		                	diffX = start.coords[0] - current.coords[0];
		               	
			                this.options.sliding = true;
			                var newPos = this.curPos - diffX;
			                $el.css({ x: newPos });
			                this.swipeStop = current;
		                } else if (Math.abs(diffY) >= 5) {
			                scr = true;
		                }
	                }
	                
                } else {
                
                	// prevent scroll because an animation is running
	                event.preventDefault();
	                
                }
                
                
                
            },
            
            _touchEnd: function(event) {
            	// check if a swipe action occured
            	if (this.options.sliding && !slideAnimating) {
            	
	            	scr = false;
		            var start = this.swipeStart;
	                var end = this.swipeStop;
	            	var diff = start.coords[0] - end.coords[0];
	            	var $el = this.element;
	            	this.options.sliding = false;
	            	slideAnimating = true;
	            	//$('.debug').text(Math.abs(diff));
	
	            	// snap to point
	            	if (Math.abs(diff) > this.options.swipeThreshold){
		            	if (diff > 0 && this.next.length) {
		            		// swipe to next
		            		newPos = this.curPos - windowWidth;
		            		$el.transition({ x: newPos }, function() {
		            			slideAnimating = false;
		            			//this.options.slideAnimating = false;alert('1');
				            	//this.currrent.find('article').hide(); // since the pages are positioned absolute, the child element have to be hidden for the document height to be updated and therefore also the scrollbar
			            	});
			            	this.prev = this.current;
			            	this.current = this.current.next();
			                this.next = this.next.next();
		            	} else if (diff < 0 && this.prev.length) {
			            	// swipe to previous
			            	newPos = this.curPos + windowWidth;
		            		$el.transition({ x: newPos }, function() {
			            		slideAnimating = false;
		            		});
			            	/*
				            	this.prev.transition({ x: '0px' }, function() {
				            	$el.find('article').hide();	
			            	});
			            	*/
			            	this.next = this.current;
			            	this.current = this.current.prev();
			                this.prev = this.prev.prev();
		            	} else {
			            	// no page available -> bounce back
			            	this.bounceBack();
		            	}
	            	} else {
		            	// not enough swipe -> bounce back
		            	this.bounceBack();
	            	}
	            	
	            }
            },
            
            _scrollStart: function(event) {
            	//scr = true; // Get's called even befor the user actually scrolls
            },
            
            _scrollStop: function(event) {
            	scr = false;
            },
            
            // todo: busy when animating
            bounceBack: function() {
	            //this.element.transition({ x: "0" });

	            this.element.transition({ x: this.curPos }, function(){
		            slideAnimating = false;
	            });
	            
            	/*
            	this.prev.transition({ x: -1*windowWidth });
            	this.next.css('display', 'none');
            	this.prev.css('display', 'none');
            	*/
            }
             
        });
        
        
        
         $( ".view" ).swipeable();
        
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