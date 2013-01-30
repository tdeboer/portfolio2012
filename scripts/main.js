require.config({ 
	appDir: "../",
	baseUrl: "scripts",
	dir: "../../webapp-build",
	optimize: "none",
	paths: {
		"jqm": "jquery.mobile",
		"jqui":	"jquery-ui-1.9.2.custom.min",
		"swipe": "jquery.ui.pageswipe-requirejs",
		"scrollTo": "jquery.scrollTo-1.4.3.1-min",
		"events": "jquery.custom.events"
	},
	modules: [
        {
            name: "main",
            exclude: ["jquery"]
        }
    ]
});

require(["jquery", 'swipe'], 
	function($, swipe) {
	
		$(".wrapper").swipeable({ load: false });
		$('.special-page').css('min-height',$(window).height());
		
		if (Modernizr.touch) {
		
			// Special page outside the swipe interaction
			$('.btn-about').click(function(event) {
				event.preventDefault();
				
				$('.special-page').show();
				$('.wrapper').hide();
				
				
			});
			
			// Return to projects
			$('.btn-back').click(function(event) {
				event.preventDefault();
				
				$('.wrapper').show(0, function() {
					$('.special-page').hide();
				});
				
			});
		
		}
		
		
		$('div.code').click(function() {
			$(this).disableSelection().find('.simple, .tech').toggle(); // todo: css animation
		});
		
		
	}
);