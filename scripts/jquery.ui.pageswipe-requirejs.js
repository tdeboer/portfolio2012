define(['jqui', 'events', 'scrollTo', 'transit'], function() {


	
	$(function() {

	
		var windowWidth,
			windowHeight,
			headerHeight,
			that,
			current, // current page
			next, // next page
			prev, // previous page
			last, // previous visible page
			nav, // navigation element as jQuery object
			slideAnimating = false,
			logging = false, // turn logs on/off
			scrolling = false,
			sliding = false,
			offset = false;
			
	
		$.widget( "custom.swipeable", {
			swipeStart: {},
			swipeStop: {},
			curPos: 0,
			
			// default options
			options: {
				selector: '.page',
				navSelector: 'nav',
				scrollSupressionThreshold: 20, // More than this horizontal displacement, and we will suppress scrolling.
				swipeThreshold: 0.25,  // Swipe horizontal displacement must be more than this to go to next page
				verticalDistanceThreshold: 5, // Swipe vertical displacement must be less than this.
				load: true
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
					
					if (that.options.load && $page.is(':empty')) {
						$page.data('content', false);
					}
					
					$page.css('min-height', windowHeight);
					
					// add navigation
					// todo: do not build dynamically
					var navEl = $('<a></a>');
					var pageId = $page.attr('id');
					//navEl.attr({ href: href, alt: $page.attr('id'), class: $page.attr('id') }).text($page.attr('data-title'));  // tis notation break yui compressor
					navEl.attr('href', '#'+pageId);
					navEl.attr('alt', pageId);
					navEl.attr('class', pageId);
					navEl.text($page.attr('data-title'));
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
					if (this.options.load) {
						var nextFile = next.attr('data-url');
						next.load(nextFile, function() {
							$(this).data('content', true).css('z-index', 1);
						});
					} else {
						$(this).data('content', true);
					}
					
					$el.find(this.options.selector).last().addClass('last');
					
					// bind all listeners
					this._on({
						touchstart: "_touchStart",
						touchmove: "_touchMove",
						touchend: "_touchEnd"
					});
	
					$(window).bind({
						scrollstop: this._scrollStop,
						resize: this.windowResized
					});
					
				} else { // no touch support
					
					// some more setup for all pages except the first
					if (this.options.load) {
						$el.children('.page:gt(0)').each(function() {
							that._loadPage($(this), function() {
								$(this).data('content', true);
							});
						});
					} else {
						$(this).data('content', true);
					}
					
					$('nav a, .btn-about').on({
						click: this._gotoPage
					});
					
					// bind all listeners
					$(window).bind({
						scrollstop: this._updateNav
					});
					
				}
			},
			
 
			_touchStart: function(event) {
				event.stopImmediatePropagation();
				if (!slideAnimating) {
					// set starting point of the potential swipe
					var data = event.originalEvent.touches[0];
					this.swipeStart = { coords: [data.pageX, data.pageY] };
				}
			},
			
			
			_touchMove: function(event) {
				if (!slideAnimating && !scrolling) {
					event.stopImmediatePropagation();
					var diffX = this.swipeStart.coords[0] - event.originalEvent.touches[0].pageX;
					
					var diffY = this.swipeStart.coords[1] - event.originalEvent.touches[0].pageY;
					/*
					if( Math.abs(diffY) < this.options.verticalDistanceThreshold || sliding ) { // could (also e.g. combined with diffX) be used to seperate scroll from swipe
					*/
					if( sliding || Math.abs(diffX) > this.options.scrollSupressionThreshold ) {
						event.preventDefault();
						current.css({ x: 0 - diffX });
						
						if (!sliding) {
							if (diffX > this.options.scrollSupressionThreshold/2) {
								if (current.hasClass('last')) {
									$('.shutter').css('z-index', 5); // hide pages underneath with a dummy page
								} else {
									next.css('z-index', 5);
									$('.shutter').css('z-index', 0);
								}
							} else if ( diffX < ((this.options.scrollSupressionThreshold/2)*-1) ){
								if (current.hasClass('first')) {
									$('.shutter').css('z-index', 5);
								} else {
									prev.css('z-index', 5);
									$('.shutter').css('z-index', 0);
								}
							}
						}
						
						sliding = true;
					} else if (Math.abs(diffY) >= 5) {
						scrolling = true;
					}
				}
				
			},
			
			
			_touchEnd: function(event) {
				// check if a swipe occurred
				if (sliding && !slideAnimating) {
					that._log('swiped:true');
					
					var start = this.swipeStart,
						end = event.originalEvent.changedTouches[0],
						diff = start.coords[0] - end.pageX,
						$el = this.element,
						scrolledPassHeader = $(document).scrollTop() > headerHeight;
					
					sliding = false;
					scrolling = false;
					slideAnimating = true;
					
					// snap to point
					if (Math.abs(diff) > (windowWidth*this.options.swipeThreshold) ) {
						that._log('enough swipe');
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
								if (that.options.load) {
									that.loadNeighbours();
								}
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
								if (that.options.load) {
									that.loadNeighbours();
								}
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
				event.stopImmediatePropagation();
				event.preventDefault();
				
				$('.header .selected').removeClass('selected');
				$(this).addClass('selected');
				
				var target = $(this).attr('href');
				var placeholder = $(target);
				
				$.scrollTo(placeholder, 1400, {
					onAfter: function() {
						window.location.hash = target;
					}
				});
			},
			
			
			_loadPage: function(placeholder, callback) {
				var nextFile = placeholder.attr('data-url');
				placeholder.load(nextFile, callback);
			},
			
			
			_updateNav: function() {
				$('.header .selected').removeClass('selected');
				var visibleId;
				$('.page, .special-page').each(function() {
					if ( $(document).scrollTop() >= $(this).offset().top ) {
						visibleId = $(this).attr('id');
					}
				});
				
				$('.header').find('.'+visibleId).addClass('selected');
			},
			
			
			bounceBack: function() {
				current.transition({ x: 0 }, function(){
					slideAnimating = false;
					prev.add(next).css('z-index', 0);
				});
			},
			
			
			loadNeighbours: function() {
				if ( !next.data('content') && typeof next.attr('data-url') !== 'undefined' ) {
					this._loadPage(next, function() {
						$(this).data('content', true).css('z-index', 1);
					});
				}
				
				if ( !prev.data('content') && typeof prev.attr('data-url') !== 'undefined' ) {
					this._loadPage(prev, function() {
						$(this).data('content', true).css('z-index', 1);
					});
				}
			},
			
			
			_scrollStop: function(event) {
				scrolling = false;

					if ( !offset && $(document).scrollTop() > headerHeight ) {
						$('.page:not(.current)').each(function() {
							$(this).css('top', 0);
						});
						offset = true;
					} else if ( $(document).scrollTop() < headerHeight ) {
						$('.page:not(.current)').each(function() {
							$(this).css('top', headerHeight-$(document).scrollTop());
						});
						offset = false;
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