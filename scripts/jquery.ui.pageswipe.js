define(['jqui','events','transit'], function() {


	
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
	                //$el.data('order', 'first');
	                this.pos = 'first';
	                $el.addClass('current');
                } else {
	                $el.css('display', 'none');
	                //$el.css('left', windowWidth+'px');  //!transit
	                $el.transition({ x: windowWidth + "px" }, 0); // possible with css({}) ?
	                if (!this.next.length) {
	                	//$el.data('order', 'last');
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
 
            // called when created, and later when changing options
            _touchStart: function(event) {
            	this.next.show();
            	this.prev.show();

            	// set starting point of the potential swipe
            	var data = event.originalEvent.touches[0];
            	// use var instead of options!
            	this.swipeStart = {
					coords: [ data.pageX, data.pageY ]
				};
            },
            
            // todo: 	- use a touch library
            //			- make independent plugin and add listener to the swipe
            _touchMove: function(event) {
	            var $el = this.element;
                var data = event.originalEvent.touches[0];
				var start = this.swipeStart;
				var current = { coords: [ data.pageX, data.pageY ] };
                var diffX = start.coords[0] - current.coords[0];
                var diffY = start.coords[1] - current.coords[1];
                //$('.debug').text(this.options.slideInAction);
                
                // bug: when scrolled to top of page and bounced back: "Uncaught TypeError: Cannot set property 'scrolling' of undefined"
                if( (Math.abs(diffX) > this.options.scrollSupressionThreshold && Math.abs(diffY) < this.options.verticalDistanceThreshold && !this.options.scrolling) || this.options.slideInAction ) {
	                event.preventDefault();
                	diffX = start.coords[0] - current.coords[0];
                	
	                this.options.slideInAction = true;
	                var newPos = -1* diffX;
	                //$el.css('left', newPos + 'px'); // 'px' needed? //!transit
	                $el.transition({ x: newPos }, 0);
	                var newNextPosTrans = windowWidth - diffX;
	                var newPrevPosTrans = -1*windowWidth - diffX;
	                //var newNextPos = this.options.windowWidth - diff; //!transit
	                //$next.css('left', newNextPos + 'px'); // todo: previous //!transit
	                $next.transition({ x: newNextPosTrans }, 0);
	                $prev.transition({ x: newPrevPosTrans }, 0);
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
	            		// swipe left
	            		newPos = -1*windowWidth;
	            		$el.transition({ x: newPos });
		            	this.next.transition({ x: '0px' });
	            	} else if (diff < 0 && this.pos != 'first') {
		            	// swipe right
		            	newPos = windowWidth;
	            		$el.transition({ x: newPos });
		            	this.prev.transition({ x: '0px' });
		            	
		            	/* !transit
		            	newPos = this.options.windowWidth;
		            	$el.css('left', newPos + 'px');
		            	$el.prev('.page').css('left', '0px');
		            	*/
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
            	// emulate scrollEnd event -> better copy jquery mobile scrollstop
            	this.options.scrolling = false;
	            /*
this.options.scrolling = true;
	            clearTimeout(this.options.timer);
		        this.options.timer = setTimeout( this._refresh , 150 );
*/
            },
            
            /*
_refresh: function() {
            	console.log(this);
	            this.options.scrolling = false;
            },
*/
            
            bounceBack: function() {
	            this.element.transition({ x: "0" });
            	this.next.transition({ x: windowWidth });
            	this.prev.transition({ x: -1*windowWidth });
            	
            	//var t=setTimeout(function(){ $('.debug').text( $el.next('.page').css('x') ) },3000); // debug
            },
 
            // a public method to change the color to a random value
            // can be called directly via .colorize( "random" )
            random: function( event ) {
                var colors = {
                    red: Math.floor( Math.random() * 256 ),
                    green: Math.floor( Math.random() * 256 ),
                    blue: Math.floor( Math.random() * 256 )
                };
 
                // trigger an event, check if it's canceled
                if ( this._trigger( "random", event, colors ) !== false ) {
                    this.option( colors );
                }
            },
 
            // events bound via _on are removed automatically
            // revert other modifications here
            _destroy: function() {
                // remove generated elements
                this.changer.remove();
 
                this.element
                    .removeClass( "custom-colorize" )
                    .enableSelection()
                    .css( "background-color", "transparent" );
            },
 
            // _setOptions is called with a hash of all options that are changing
            // always refresh when changing options
            _setOptions: function() {
                // _super and _superApply handle keeping the right this-context
                this._superApply( arguments );
                this._refresh();
            },
 
            // _setOption is called for each individual option that is changing
            _setOption: function( key, value ) {
                // prevent invalid color values
                if ( /red|green|blue/.test(key) && (value < 0 || value > 255) ) {
                    return;
                }
                this._super( key, value );
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