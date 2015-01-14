define(['underscore', 'jquery', 'jqueryMobile', 'router/AppRouter','tpl'], function( _, $, jqueryMobile, appRouter, templateLoader) {
 
	//Loading templates from /templates directory
	templateLoader.loadTemplates(['header', 'footer', 'navBar', 'home','personSearch', 'publicationSearch', 'organizationSearch','eventSearch', 'schedule','settingsPanel','bonusPanel'], 

	function () {
		//Instantiate the router with configuration (see Configuration.js)
		var app_router = new appRouter();
		Backbone.history.start();
	});

});
