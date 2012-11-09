require.config({ 
	appDir: "../",
	baseUrl: "scripts",
	dir: "../../webapp-build",
	optimize: "none",
	paths: {
		"jqm": "jquery.mobile",
		"jqui":	"jquery-ui-1.9.1.custom.min",
		"swipe": "jquery.ui.pageswipe"
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
		$(".page").pageswipe();
	}
);