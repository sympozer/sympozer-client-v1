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
        }/*,
         'twttr' :{
         exports : 'widget',
         init: function () {
         return this.twttr;
         }
         },
         'localJsonData': {
         exports: 'localData'
         }*/
    },
    paths: {
//Libraries
        'jquery' : 'lib/jquery',
        'underscore' : 'lib/underscore-min',
        'backbone' : 'lib/backbone',
        'jqueryMobile.config' : 'lib/jquerymobile.config',
        'jqueryMobile' : 'lib/jquery.mobile-1.4.0-rc.1.min',
        'promise' : 'lib/promise-done-6.1.0.min',
        'encoder': 'lib/encoder',
        'blob': 'lib/blob',
        'fileSaver' : 'lib/FileSaver',
        'jStorage' : 'lib/jstorage.min',
        'moment' : 'lib/moment.min',
//App specific modules
        'appConfig' : 'appConfig',
        'labels' : 'modules/labels',
        'eventHelper': 'modules/EventHelper',
        'tpl' : 'modules/templateLoader',
        'asyncLoader' : 'router/AsyncLoader',
        'localDao': 'modules/LocalDAO',
        'localData' : '../data/data_ESWC2015',
//Data sources
        'CommandStores': 'model/CommandStores',
        'DBLPCommandStore': 'model/datasources/DBLPCommandStore',
        'DDGoCommandStore': 'model/datasources/DDGoCommandStore',
        'GoogleCommandStore': 'model/datasources/GoogleCommandStore',
        'LocalCommandStore': 'model/datasources/localCommandStore',
        'VotingSystemCommandStore': 'model/datasources/VotingSystemCommandStore'
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
require(['appConfig', 'tpl', 'moment'], function(appConfig, tpl, moment){

    //Modules configuration
    var modules = [];

    //Add publications and organizations support
    modules.push("publications");
    modules.push("organizations");

    tpl.modules = modules;
    tpl.uri = "templates/";

    //Language configuration
    moment.lang(appConfig.conference.momentLang);
});

//Entry point
require(['app']);
