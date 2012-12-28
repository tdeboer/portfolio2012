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
			padding,
			headerHeight,
			$el,
			scr = false,
			slideAnimating = false,
			current, // current page
		 	next, // next page
		 	prev, // previous page
		 	nav;
	
		 $.widget( "custom.swipeable", {
            pos: null,
		 	
            // default options
            options: {
                selector: '.page',
                navSelector: 'nav'
            },
 
            // the constructor
            _create: function() {
                $el = this.element;
                current = $el.children().first();
                next = $el.children().first().next();
                prev = $el.children().first().prev();
                windowWidth = $(window).width();
                nav = $(this.options.navSelector);
                headerHeight = $('.header').height() + $('nav').height() + 2;
                
                // setup all pages
                $el.children().each(function() {console.log($(this));
	                var $page = $(this);
	                padding = parseInt( $page.css('padding-left') ); // todo: + padding-right
	                $page.width( windowWidth-(2*padding) );
	                $page.hide(); // Hide all pages except the first. Not with css so with javascript disabled the pages are still available
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
                
                $el.children().first().show();
                nav.find('li:first').addClass('selected');


                // bind all listeners
                this._on({
                	swipeleft: "_swipeNext",
                	swiperight: "_swipePrev"
                });
                
                //$(window).bind('resize', this._resizePages);
            },
            
            
            _swipeNext: function(event) {
            	var $el = this.element;
            	var scrolledPassHeader = $(document).scrollTop() > headerHeight;
	        
            	if (next.length) {
	        		// swipe to next
	        		newPos = -1 * windowWidth;
	        		current.css('z-index', '10');
	            	next.css('z-index', '0');
	            	next.css({ x: '0' });
	            	
	            	next.show('100', function() { // use callback to prevent timing issues resulting in a flickering in the animation
		            
		            	if (!scrolledPassHeader) {
		            		next.css({'top': headerHeight});
		            	}
		        		
		        		current.transition({ x: newPos }, function() {
			            	if (scrolledPassHeader) {
				            	$(document).scrollTop(headerHeight);	
			            	}
				            next.css({'position': 'relative', 'top': 'auto'});
			            	current.hide();
			            	current.css({'position': 'fixed', 'top': '0'});
			            	
			            	nav.find('li.selected').removeClass('selected').next().addClass('selected');
			            	prev = current;
			            	current = current.next();
			                next = next.next();
		            	});
		            });
		            
	            }
	            
	        },
	        
	        
	        _swipePrev: function(event) {
            	var $el = this.element;
            	var scrolledPassHeader = $(document).scrollTop() > headerHeight;
	        
            	if (prev.length) {
	            	// swipe to previous
	            	newPos = windowWidth;
	            	current.css('z-index', '10');
	            	prev.css('z-index', '0');
	            	prev.css({ x: '0' });
	            	
	            	prev.show('100', function() { // use callback to prevent timing issues resulting in a flickering in the animation		            
		            	
		            	if (!scrolledPassHeader) {
		            		prev.css({'top': headerHeight});
		            	}	
		            	
		            	current.transition({ x: newPos }, function() {
	            			if ($(document).scrollTop() > headerHeight) {
	            				$(document).scrollTop(headerHeight);
	            			}
			            	prev.css({'position': 'relative', 'top': 'auto'});
			            	current.hide();
			            	current.css({'position': 'fixed', 'top': '0'});
			            	
		            		nav.find('li.selected').removeClass('selected').prev().addClass('selected');
		            		next = current;
			            	current = current.prev();
			                prev = prev.prev();
	            		});
	            			
	            	});
	            	
	            	
            		
            	}
	            
	        },
	        
	        
	        _resizePages: function() {
	        windowWidth = $(window).width();
		        $el.children().each(function() {
		        	padding = parseInt( $(this).css('padding-left') ); // todo: + padding-right
	                $(this).width( windowWidth-(2*padding) );
                });
	        }
	        
             
        });
        
        
        
         $( ".wrapper" ).swipeable();
        
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
