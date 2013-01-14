require.config({ 
	appDir: "../",
	baseUrl: "scripts",
	dir: "../../webapp-build",
	optimize: "none",
	paths: {
		"jqm": "jquery.mobile",
		"jqui":	"jquery-ui-1.9.2.custom.min",
		"swipe": "jquery.ui.pageswipe",
		"events": "jquery.custom.events"
	},
	modules: [
        {
            name: "main",
            exclude: ["jquery"]
        }
    ],
    urlArgs: "bust=" +  (new Date()).getTime()
});

require(["jquery", 'swipe'], 
	function($, swipe) {
	
		$(".content").swipeable();
		
		
		// Special page outside the swipe interaction
		$('.btn-about').click(function(event) {
			event.preventDefault();
			
			$('.special-page').show();
			
			$('.special-page').css({
				rotateY: '-90deg'
			});
			
			// animate current page
			// todo: ease back (Vera's slides)
			$('.header, nav, .page').transition({
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
		
		
	}
);