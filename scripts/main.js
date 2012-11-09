require.config({ 
	appDir: "../",
	baseUrl: "scripts",
	dir: "../../webapp-build",
	optimize: "none",
	paths: {
		"jqm":   "jquery.mobile"
	},
	modules: [
        {
            name: "main",
            exclude: ["jquery"]
        }
    ],
    urlArgs: "bust=" +  (new Date()).getTime()
});

require(["jquery", 'pageswipe'], 
	function($, pageswipe) {
		//console.log(jqm);
	}
);