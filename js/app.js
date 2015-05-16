define(['AppRouter','tpl'], function(appRouter, templateLoader) {

    //Loading templates from /templates directory
	templateLoader.loadTemplates([
        'header',
        'footer',
        'navBar',
        'home',
        'personSearch',
        'publicationSearch',
        'organizationSearch',
        'eventSearch',
        'schedule',
        'settingsPanel',
        'bonusPanel',
        'about'
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