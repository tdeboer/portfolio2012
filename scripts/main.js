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
		//$('.page').swipeApp();
		//swipeApp();
	}
);