/**
 * 3 things in this file
 * - require configuration
 * - call require and apply this config
 * - start the app
 */

//Require.js configurations
require.config({
    baseUrl: "js",
    shim: {
        'jquery': {
            exports: '$'
        },
        'underscore': {
            exports: '_'
        },
        'backbone': {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        'jqueryMobile': {
            deps: [
                'jquery',
                'jqueryMobile.config'
            ]
        },
        'promise': {
            exports: 'Promise'
        },
        'jStorage' : {
            deps: [
                'jquery'
            ]
        },
        'jqueryMobile.config': {
            deps: [
                'jquery'
            ]
        }
    },
    paths: {
//Libraries
        'jquery' : 'lib/jquery-2.1.3.min',
        'underscore' : 'lib/underscore-min',
        'backbone' : 'lib/backbone-min',
        'jqueryMobile.config' : 'lib/jquerymobile.config',
        'jqueryMobile' : 'lib/jquery.mobile-1.4.0-rc.1.min',
        'promise' : 'lib/promise-6.1.0.min',
        'encoder': 'lib/encoder',
        'blob': 'lib/blob.min',
        'fileSaver' : 'lib/FileSaver.min',
        'jStorage' : 'lib/jstorage.min',
        'moment' : 'lib/moment.min',
        'jsesc' : 'lib/jsesc',
//App specific modules
        'appConfig' : 'appConfig',
        'labels' : 'modules/labels',
        'eventHelper': 'modules/EventHelper',
        'tpl' : 'modules/templateLoader',
        'localStorageManager': 'modules/localStorage/localStorageManager',
        'Twitter_widget_ESWC2015': 'lib/Twitter_widget_ESWC2015.min',
        'Vote_module_ESWC2015': 'modules/Vote_module_ESWC2015',
//Router
        "CommandProcessor" : 'router/CommandProcessor',
        'AppRouter': 'router/AppRouter',
//View
        'AbstractView': 'view/AbstractView',
        'ViewAdapter': 'view/ViewAdapter',
        'ViewAdapterText': 'view/ViewAdapterText',
//DAO
        'localDao': 'modules/LocalDAO',
        'localData' : '../data/data_ESWC2015',
//Data sources
        'CommandStores': 'model/CommandStores',
        'DBLPCommandStore': 'model/datasources/DBLPCommandStore',
        'DDGoCommandStore': 'model/datasources/DDGoCommandStore',
        'GoogleCommandStore': 'model/datasources/GoogleCommandStore',
        'GoogleKGCommandStore': 'model/datasources/GoogleKGCommandStore',
        'LocalCommandStore': 'model/datasources/localCommandStore',
        'VotingSystemCommandStore': 'model/datasources/VotingSystemCommandStore',
        'TwitterWidgetCommandStore': 'model/datasources/TwitterWidgetCommandStore'
/* Unused for the moment (LM)
         'twttr' :'lib/widget',
         'socialite': 'lib/socialite.min',
         'jsw' : 'reasoner/jsw',
         'jswui' : 'reasoner/jswui',
         'query' : 'reasoner/query',
*/
    }
});

//Configurations
require(['jquery', 'moment', 'appConfig', 'tpl'], function($, moment, appConfig, tpl){

    //Change page title
    $("title").html(appConfig.conference.acronym + " app");
    $("#logo-loading-panel").attr("src", appConfig.conference.logoUri);

    //Modules configuration
    var modules = [];

    //Add publications and organizations support
    modules.push("persons");
    modules.push("publications");
    modules.push("organizations");

    tpl.modules = modules;
    tpl.uri = "templates/";

    //Language configuration
    moment.lang(appConfig.conference.momentLang);
});

//Entry point
require(['app']);
