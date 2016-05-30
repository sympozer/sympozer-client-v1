define(['AppRouter','tpl'], function(appRouter, templateLoader) {

    //Loading templates from /templates directory
	templateLoader.loadTemplates([
        'headerTpl',
        'footerTpl',
        'navBarTpl',
        'homeTpl',
        'personSearchTpl',
        'publicationSearchTpl',
        'organizationSearchTpl',
        'eventSearchTpl',
        'scheduleTpl',
        'settingsPanelTpl',
        'bonusPanelTpl',
        'aboutTpl'
    ]).then(
        function () {
            //Initialize the Settings panel slider (sometimes throws an error on FF instead)
            $('#flip-storage').slider();
        	//Instantiate the router with configuration (see config.js)
        	new appRouter();
            Backbone.history.start();
        }
    );
});