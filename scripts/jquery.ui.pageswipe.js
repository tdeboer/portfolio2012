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
                swipeStart: null
            },
 
            // the constructor
            _create: function() {
                var $el = this.element;
                
                // !first: display: none
                if (!$el.prev('.page').length) {
	                $el.data('order', 'first');
                } else {
	                $el.css('display', 'none');
                }
                
                padding = parseInt( $el.css('padding-left') );
                windowWidth = $(window).width();
                $el.width( windowWidth-(2*padding) );
                
                if ($el.is(':empty')) {
	                $el.data('content', false);
                } else {
	                $el.data('content', true);
	            }
                
                // jqm only for this?
                this._on({
                	vmousedown: "_touchStart",
                	vmousemove: "_touchMove",
                	vmouseup: "_touchEnd"
                });
            },
 
            // called when created, and later when changing options
            _touchStart: function(event) {
                console.log('_touchStart');
                this.options.swipeStart = event.touches[0];
            },
            
            _touchMove: function() {
                //console.log('_touchMove');
            },
            
            _touchEnd: function(event) {
            	start = this.options.swipeStart;
            	end = event.touches[0];
                console.log('_touchEnd');
                console.log( Math.abs(start.pageX - end.pageX) );
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