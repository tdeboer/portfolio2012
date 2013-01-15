define(['jqui','transit'], function() {

	/*
	todo:
	
	*/
	
	$(function() {
	
		var windowWidth,
			windowHeight,
			padding,
			headerHeight,
			that,
			scr = false,
			slideAnimating = false,
			current, // current page
			next, // next page
			prev, // previous page
			last, // previous visible page
			nav,
			logging = false;
			
	
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
				verticalDistanceThreshold: 5, // Swipe vertical displacement must be less than this.
				sliding: false,
				swipeBoundry: 40, // Stop the swipe at this point if there is nothing to swipe to
				disableSwipe: false,
				scrolling: false,
				timer: null
			},
			

			// the constructor
			_create: function() {
				var $el = this.element;
				that = this;
				current = $el.children('.page').first();
				next = $el.children('.page').first().next('.page');
				prev = $el.children('.page').first().prev('.page');
				nav = $(this.options.navSelector);
				headerHeight = $('.header').outerHeight();
									
				// setup all pages
				that.windowResized();
				$el.children('.page').each(function() {
					var $page = $(this);
					
					if ($page.is(':empty')) {
						$page.data('content', false);
					}
					
					$page.css('min-height', windowHeight);
					
					// add navigation
					// todo: do not build dynamically
					var navEl = $('<a></a>');
					navEl.attr({
						href: '#'+$page.attr('id'),
						alt: $page.attr('id'),
						class: $page.attr('id')
					}).text($page.attr('data-title'));
					nav.append(navEl);
					
				});
				
				// setup first page
				current.addClass('current').data('content', true);
				nav.find('a:first').addClass('selected');
					
				if (Modernizr.touch){
					
					// some more setup for all pages except the first
					$el.children('.page:gt(0)').each(function() {
						$(this).css('top', headerHeight);
					});
					
					
					// load content for second page
					var nextFile = next.attr('data-url');
					next.load(nextFile, function() {
						$(this).data('content', true).css('z-index', 5);
					});
					
					$el.find(this.options.selector).last().addClass('last');
					
					// bind all listeners
					this._on({
						touchstart: "_touchStart",
						touchmove: "_touchMove",
						touchend: "_touchEnd"
					});
	
					$(window).bind({
						resize: this.windowResized
					});
					
				} else { // no touch support
					
					// some more setup for all pages except the first
					$el.children('.page:gt(0)').each(function() {
						//$(this).css({ x: windowWidth });
					});
					
					$('nav a').on({
						click: this._gotoPage
					});
					
				}
			},
			
 
			_touchStart: function(event) {
				event.stopImmediatePropagation();
				if (!slideAnimating) {
					this.curPos = parseInt( this.element.css('x') );
					
					// set starting point of the potential swipe
					var data = event.originalEvent.touches[0];
					
					this.swipeStart = { coords: [data.pageX, data.pageY] };
				}
			},
			
			
			_touchMove: function(event) {
				event.stopImmediatePropagation();
				var diffX = this.swipeStart.coords[0] - event.originalEvent.touches[0].pageX;
				var diffY = this.swipeStart.coords[1] - event.originalEvent.touches[0].pageY;
				
				if( Math.abs(diffY) < this.options.verticalDistanceThreshold || this.options.sliding ) {
					event.preventDefault();
					current.css({ x: this.curPos - diffX });
					this.options.sliding = true;
				}
				
			},
			
			
			// todo: unbind listeners instead of slideAnimating
			_touchEnd: function(event) {
				// check if a swipe occurred
				if (this.options.sliding && !slideAnimating) {
					that._log('swiped:true');
					
					var start = this.swipeStart,
						end = event.originalEvent.changedTouches[0],
						diff = start.coords[0] - end.pageX,
						$el = this.element,
						scrolledPassHeader = $(document).scrollTop() > headerHeight;
					
					this.options.sliding = false;
					scr = false;
					slideAnimating = true;
					//$('.debug').text(current.attr('id'));
					
					// snap to point
					if (Math.abs(diff) > this.options.swipeThreshold){that._log('enough swipe');
						if (diff > 0 && next.length) { // swipe to next
							that._log('swipe next');
							current.transition({ x: -1*windowWidth }, function() {
								slideAnimating = false;
								var pageOffset = headerHeight - $(document).scrollTop();
								if (scrolledPassHeader) {
									$(document).scrollTop(headerHeight); // scroll to the point just below the header
									pageOffset = 0;
								}
								next.css({'position':'relative','top':'auto', 'z-index':'10'});
								current.css({'position':'fixed','top':pageOffset, 'z-index':'0'});
								
								nav.find('a.selected').removeClass('selected').next().addClass('selected');
								prev = current;
								current = current.next('.page');
								next = next.next('.page');
								next.css({ x:'0' });
								prev.css({ x:'0' });
								prev.removeClass('current');
								current.addClass('current');
								that.loadNeighbours();
							});
							
						} else if (diff < 0 && prev.length) { // swipe to previous
							that._log('swipe prev');
							current.transition({ x: windowWidth }, function() {
								slideAnimating = false;
								var pageOffset = headerHeight - $(document).scrollTop();
								if (scrolledPassHeader) {
									$(document).scrollTop(headerHeight); // scroll to the point just below the header
									pageOffset = 0;
								}
								prev.css({'position':'relative', 'top':'auto', 'z-index':'10'}); // todo: changing position is causing a flash of background color
								current.css({'position':'fixed', 'top':pageOffset, 'z-index':'0'});
								
								nav.find('a.selected').removeClass('selected').prev().addClass('selected');
								next = current;
								current = current.prev('.page');
								prev = prev.prev('.page');
								next.css({ x:'0' });
								prev.css({ x:'0' });
								next.removeClass('current');
								current.addClass('current');
								that.loadNeighbours();
							});
							
						} else {that._log('no page available');
							// no page available
							this.bounceBack();
						}
					} else {that._log('not enough swipe');
						// not enough swipe
						this.bounceBack();
					}
					
				}
			},
			
			
			_gotoPage: function(event) {
				event.preventDefault();
				var target = $(this).attr('href');
				var placeholder = $(target);
				
				if (typeof placeholder.attr('data-url') !== 'undefined') {
					
					if ( !placeholder.data('content') ) {
						var nextFile = placeholder.attr('data-url');
						placeholder.load(nextFile, function() {
							$(this).data('content', true);
							that.showPage(placeholder);
						});
					} else {
						that.showPage(placeholder);
					}
					
				} else {
					
					console.log('No data-url set for this page');
					
				}
			},
			
			
			showPage: function(newPage) {
				current.hide();
				newPage.show().css({'position':'relative', 'top':'auto', 'z-index':'10', 'min-height':windowHeight});
				past = current;
				current = newPage;
			},
			
			
			bounceBack: function() {
				current.transition({ x: 0 }, function(){
					slideAnimating = false;
				});
			},
			
			
			loadNeighbours: function() {
				if ( !next.data('content') && typeof next.attr('data-url') !== 'undefined' ) {
					var nextFile = next.attr('data-url');
					next.load(nextFile, function() {
						$(this).data('content', true).css('z-index', 1);
					});
				}
				
				if ( !prev.data('content') && typeof prev.attr('data-url') !== 'undefined' ) {
					var prevFile = prev.attr('data-url');
					prev.load(prevFile, function() {
						$(this).data('content', true).css('z-index', 1);
					});
				}
			},
			
			
			_scrollStart: function(event) {
				//scr = true; // Get's called even before the user actually scrolls
			},
			
			
			_scrollStop: function(event) {
				scr = false;
				
				if ( $(document).scrollTop() > headerHeight ) {
					$('.page:not(.current)').each(function() {
						$(this).css('top', 0);
					});
				} else if ( $(document).scrollTop() < headerHeight ) {
					$('.page:not(.current)').each(function() {
						$(this).css('top', headerHeight-$(document).scrollTop());
					});
				}
			},
			
			
			windowResized: function() {
				windowWidth = $(window).width();
				windowHeight = $(window).height();
			},
			
			
			_log: function(message) {
				if (logging) {
					console.log(message);
				}
			}
			
			
		});
		
		
	});
	
	
	
	
	
	

	
});