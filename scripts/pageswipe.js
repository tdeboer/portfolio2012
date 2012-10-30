define(['jquery'], function() {
	var showName = function(n) {
		$("#project1 section").html("<p>" + n + "</p>");
	};
	return {
		showName: showName
	};
});