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
				headerHeight = $('.header').height() + $('nav').height() + 2;
				
				// setup all pages
				$el.children().each(function() {
					var $page = $(this);
					padding = parseInt( $page.css('padding-left') );
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
					touchstart: "_touchStart",
					touchmove: "_touchMove",
					touchend: "_touchEnd",
					scrollstart: "_scrollStart"
				});

				$(window).bind('scrollstop', this._scrollStop);
			},
 
			_touchStart: function(event) {
				if (!slideAnimating) {
					this.curPos = parseInt( this.element.css('x') );
					
					// set starting point of the potential swipe
					var data = event.originalEvent.touches[0];
					
					this.swipeStart = {
						coords: [ data.pageX, data.pageY ]
					};
				}
			},
			
			_touchMove: function(event) {
				var $el = this.element;
				var data = event.originalEvent.touches[0];
				var start = this.swipeStart;
				var currentTouch = { coords: [ data.pageX, data.pageY ] };
				var diffX = start.coords[0] - currentTouch.coords[0];
				var diffY = start.coords[1] - currentTouch.coords[1];
				//$('.debug').text(slideAnimating);
				
				if (!slideAnimating) {
				
					if (!scr) {
						if( (Math.abs(diffX) > this.options.scrollSupressionThreshold && Math.abs(diffY) < this.options.verticalDistanceThreshold) || this.options.sliding ) {
							next.show();
							prev.show();
							event.preventDefault();
							diffX = start.coords[0] - currentTouch.coords[0];
							
							this.options.sliding = true;
							var newPos = this.curPos - diffX;
							current.css({ x: newPos });
							this.swipeStop = currentTouch;
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
					var scrolledPassHeader = $(document).scrollTop() > headerHeight;
					//$('.debug').text(current.attr('id'));
					
					// snap to point
					if (Math.abs(diff) > this.options.swipeThreshold){
						if (diff > 0 && next.length) { // swipe to next
							current.transition({ x: -1*windowWidth }, function() {
								slideAnimating = false;
								if (scrolledPassHeader) {
									$(document).scrollTop(headerHeight); // scroll to the point just below the header
								}
								next.css({'position': 'relative', 'top': 'auto'});
								current.hide();
								current.css({'position': 'fixed', 'top': '0'});
								current.css('z-index', '0');
								next.css('z-index', '10');
								
								nav.find('li.selected').removeClass('selected').next().addClass('selected');
								prev = current;
								current = current.next();
								next = next.next();
								next.css({ x: '0' });
								prev.css({ x: '0' });
							});
							
						} else if (diff < 0 && prev.length) { // swipe to previous
							current.transition({ x: windowWidth }, function() {
								slideAnimating = false;
								if (scrolledPassHeader) {
									$(document).scrollTop(headerHeight); // scroll to the point just below the header
								}
								prev.css({'position': 'relative', 'top': 'auto'});
								current.hide();
								current.css({'position': 'fixed', 'top': '0'});
								current.css('z-index', '0');
								prev.css('z-index', '10');
								
								nav.find('li.selected').removeClass('selected').prev().addClass('selected');
								next = current;
								current = current.prev();
								prev = prev.prev();
								next.css({ x: '0' });
								prev.css({ x: '0' });
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
				
				// todo: also prev page
				if ($(document).scrollTop() <= headerHeight) {
					var pageOffset = headerHeight - $(document).scrollTop();
					next.css( 'top', pageOffset );
				} else {
					next.css( 'top', 0 );
				}
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