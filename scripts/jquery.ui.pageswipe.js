define(['jqui','events','transit'], function() {

	/*
	todo:
	- call widget lik this: $('wrapper').swipeable({ options });
	- make independent plugin and add listener to the swipe
	- use var instead of options
	- modernizr checks
	*/
	
	$(function() {
	
		var windowWidth,
			scr = false,
			slideAnimating = false,
			current, // current page
		 	next, // next page
		 	prev, // previous page
		 	nav;
	
		 $.widget( "custom.swipeable", {
		 	swipeStart: {},
            swipeStop: {},
            pos: null,
            preventScroll: false,
		 	
            // default options
            options: {
                selector: '.page',
                navSelector: 'nav',
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
                current = $el.children().first();
                next = $el.children().first().next();
                prev = $el.children().first().prev();
                windowWidth = $(window).width();
                nav = $(this.options.navSelector);
                
                // setup all pages
                $el.children().each(function() {
	                var $page = $(this);
	                var padding = parseInt( $page.css('padding-left') );
	                $page.width( windowWidth-(2*padding) );
	                $page.find('article').css('display', 'none'); // Hide all pages except the first. Not with css so with javascript disabled the pages are still available
	                if ($page.is(':empty')) {
		                $page.data('content', false);
	                }
	                
	                // add navigation
	                /*
	                navEl = $('<li><a></a></li>');
					navEl.find('a').attr({
						href: '#'+$page.attr('id'),
						alt: $page.attr('id')
					});
	                nav.append(navEl);
	                */
                });
                
                // Good to know what page is first and last when handling the swipe
                $el.children().first().data('first');
                $el.children().last().data('last');
                
                $el.children().first().find('article').show();
                nav.find('li:first').addClass('selected');
                
                // css .shadow so it won't influence size of scrollbar: max-height or bottom: 0
                var shadowEl = $('<div></div>');
            	shadowEl.attr('class', 'shadow-next');
            	next.find('article').clone().appendTo(shadowEl);
            	shadowEl.find('article').css('display', 'inline-block');
            	next.append(shadowEl);
            	

                // bind all listeners
                this._on({
                	touchstart: "_touchStart",
                	touchmove: "_touchMove",
                	touchend: "_touchEnd",
                	scrollstart: "_scrollStart"
                });

                $(window).bind('scrollstop', this._scrollStop);
            },
 
            _touchStart: function(event) {$('.debug').text('');
            	if (!slideAnimating) {	
	            	this.curPos = parseInt( this.element.css('x') );
	
	            	// set starting point of the potential swipe
	            	var data = event.originalEvent.touches[0];
	            	// use var instead of options!
	            	
	            	this.swipeStart = {
						coords: [ data.pageX, data.pageY ]
					};
				}
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
			                next.find('article').css('display', 'inline-block'); // not needed with shadow element
			            	prev.find('article').css('display', 'inline-block');
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
            
            // todo: setup shadow element
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
	            	//$('.debug').text(current.attr('id'));
	
	            	// snap to point
	            	if (Math.abs(diff) > this.options.swipeThreshold){
		            	if (diff > 0 && next.length) {
		            		// swipe to next
		            		newPos = this.curPos - windowWidth;
		            		$el.transition({ x: newPos }, function() {
		            			slideAnimating = false;
				            	current.find('article').css('display','none'); // since the pages are positioned absolute, the child element have to be hidden for the document height to be updated and therefore also the scrollbar
				            	
				            	//next.offset({ top: 60 });
				            	//$(document).scrollTop(1);
				            	
				            	nav.find('li.selected').removeClass('selected').next().addClass('selected');
				            	prev = current;
				            	current = current.next();
				                next = next.next();
			            	});
			            	
		            	} else if (diff < 0 && prev.length) {
			            	// swipe to previous
			            	newPos = this.curPos + windowWidth;
		            		$el.transition({ x: newPos }, function() {
			            		slideAnimating = false;
			            		current.find('article').css('display','none');
			            		nav.find('li.selected').removeClass('selected').prev().addClass('selected');
			            		next = current;
				            	current = current.prev();
				                prev = prev.prev();
		            		});
			                
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
            	//scr = true; // Get's called even before the user actually scrolls
            },
            
            _scrollStop: function(event) {
            	scr = false;
            	
            	// todo: only when scrollTop is more than 60
            	$('.shadow-next').offset({ top: $(document).scrollTop() });
            },
            
            bounceBack: function() {
	            this.element.transition({ x: this.curPos }, function(){
		            slideAnimating = false;
	            });
            }
             
        });
        
        
        
         $( ".view" ).swipeable();
        
	});
	
	
	
	
	// Special page outside the swipe interaction
	$('.btn-about').click(function(event) {
		event.preventDefault();
		
		// show about-page
		$('.special-page').css('display', 'inline-block');
		
		
		$('.special-page').css({
			rotateY: '-90deg'
		});
		
		// animate current page
		// todo: ease back (Vera's slides)
		$('.front').transition({
			rotateY: '90deg'
		}, 400, 'linear', function() {
			
			this.css('display', 'none');
			// animate about-page
			$('.special-page').transition({
				rotateY: '0deg'
			}, 400, 'linear');
			
		});
		
	});
	
	// Return to projects
	$('.btn-back').click(function(event) {
		event.preventDefault();
		
		// show about-page
		$('.front').css('display', 'block');
		
		
		$('.front').css({
			rotateY: '-90deg'
		});
		
		// animate current page
		// todo: ease back (Vera's slides)
		$('.special-page').transition({
			rotateY: '90deg'
		}, 400, 'linear', function() {
			
			this.css('display', 'none');
			// animate about-page
			$('.front').transition({
				rotateY: '0deg'
			}, 400, 'linear');
			
		});
		
	});
	

	
});