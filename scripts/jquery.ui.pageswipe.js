define(['jqui'], function() {


	
	$(function() {
	
		 $.widget( "custom.swipeable", {
            // default options
            options: {
                red: 255,
                green: 0,
                blue: 0,
 
                // callbacks
                change: null,
                random: null,
                selector: '.page',
                swipeStart: {},
                swipeStop: {},
                test: 0,
                windowWidth: null,
                scrollSupressionThreshold: 100, // More than this horizontal displacement, and we will suppress scrolling.
                durationThreshold: 1000, // More time than this, and it isn't a swipe.
                horizontalDistanceThreshold: 30,  // Swipe horizontal displacement must be more than this.
                verticalDistanceThreshold: 75
            },
 
            // the constructor
            _create: function() {
                var $el = this.element;
                
                padding = parseInt( $el.css('padding-left') );
                windowWidth = $(window).width();
                $el.width( windowWidth-(2*padding) );
                this.options.windowWidth = windowWidth;
                
                // Hide all pages except the first.
                // Not with css for the javascript-frightened people.
                if (!$el.prev('.page').length) {
	                $el.data('order', 'first');
                } else {
	                $el.css('display', 'none');
	                $el.css('left', windowWidth+'px');
                }
                
                
                if ($el.is(':empty')) {
	                $el.data('content', false);
                } else {
	                $el.data('content', true);
	            }

                // jqm only for this?
                this._on({
                	touchstart: "_touchStart",
                	touchmove: "_touchMove",
                	touchend: "_touchEnd"
                });
            },
 
            // called when created, and later when changing options
            _touchStart: function(event) {
            	// show next or previous page
            	this.element.next('.page').show();

            	// record starting point of the swipe
            	var data = event.originalEvent.touches[0];
            	            	
            	this.options.swipeStart = {
					coords: [ data.pageX, data.pageY ]
				};

            	//$('.debug').text(event.originalEvent.touches[0].pageX);
            },
            
            _touchMove: function(event) {
                var data = event.originalEvent.touches[0],
				start = this.options.swipeStart;
				
				
				
				this.options.swipeStop = {
					coords: [ data.pageX, data.pageY ]
				};
				
				end = this.options.swipeStop;
                
                diff = start.coords[0] - end.coords[0];
                //diffAbs = Math.abs(start - end);
                
                // move pages
                newPos = 0 - diff;
                this.element.css('left', newPos + 'px');
                var posLeft = this.options.windowWidth - diff;
                this.element.next('.page').css('left', posLeft + 'px');
                
                // prevent scrolling
				if ( Math.abs( start.coords[1] - end.coords[1] ) > this.options.scrollSupressionThreshold ) {
					event.preventDefault();
				}
            },
            
            _touchEnd: function(event) {
	            var $el = this.element;
	            
	            /*
	            if (this.options.test == 1) {
	                console.log('_touchStart');
	                //alert('_touchStart');
	                $el.hide();
	                if ($el.next().length) {
		                $el.next('.page').show();
	               } else {
		               $el.prev('.page').show();
	               }
                }
                this.options.test ++;
                */
                
                start = this.options.swipeStart;
                end = this.options.swipeStop;
            	diffAbs = Math.abs(start.coords[0] - end.coords[0]);

            	// snap!
            	if (diffAbs > this.options.horizontalDistanceThreshold){
	            	//alert('snap');
	            	newPos = 0 - this.options.windowWidth;
	            	this.element.css('left', newPos + 'px');
	            	this.element.next('.page').css('left', '0px');
            	}
                
                
                // unset swipeStop
                this.options.swipeStart = {};
                this.options.swipeStop = {};
                
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
	
	
	
});