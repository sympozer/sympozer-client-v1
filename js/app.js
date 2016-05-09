define(['jquery', 'backbone', 'AppRouter','tpl', 'ViewAdapter'], function($, Backbone, AppRouter, templateLoader, ViewAdapter) {

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
            //$('#flip-storage').slider();
            //Instantiate the router with configuration (see config.js)
            new AppRouter();
            //Start routing
            Backbone.history.start();
        }
    );
});