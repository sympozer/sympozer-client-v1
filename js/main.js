
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
        'jStorage' : {
            deps: [
                'jquery'
            ]
        },
        'jqueryMobile.config': {
            deps: [
                'jquery',
            ]
        },
        'twttr' :{
            exports : 'widget',
            init: function () {
                return this.twttr;
            }
        },
        'localJsonData': {
            exports: 'localData'
        }
    },
    paths: {
        'jquery' : 'lib/jquery',
        'underscore' : 'lib/underscore-min',
        'backbone' : 'lib/backbone',
        'jqueryMobile.config' : 'lib/jquerymobile.config',
        'jqueryMobile' : 'lib/jquery.mobile-1.4.0-rc.1.min',
        'twttr' :'lib/widget',
        'encoder': 'lib/encoder',
        'blob': 'lib/blob',
        'fileSaver' : 'lib/FileSaver',
        'jStorage' : 'lib/jstorage.min',
        'moment' : 'lib/moment.min',
        'tpl' : 'modules/templateLoader',
        'labels' : 'modules/labels',
        'ajaxLoader' : 'modules/AjaxLoader',
/* Unused for the moment (LM)
        'socialite': 'lib/socialite.min',
        'jsw' : 'reasoner/jsw',
        'jswui' : 'reasoner/jswui',
        'query' : 'reasoner/query',*/
//Specific modules
        'localData' : '../data/data_ESWC2014',
        'personDao': 'model/person/LocalPersonDAO',
        'person': 'model/person/person'
    }
});

//Configurations
require(['config', 'tpl', 'model/datasources/swcEventCommandStore', 'model/datasources/liveconSparqlCommandStore', 'model/datasources/LocalCommandStore','moment'], function(configuration, tpl, liveconApiCommandStore, liveconSparqlCommandStore, LocalCommandStore, moment){

    //Modules configuration
    var modules = []

    //Add publications and organizations support
    modules.push("publications");
    modules.push("organizations");

    tpl.modules = modules;
    tpl.uri = "templates/";

    //Language configuration
    moment.lang('EN_us');
});

//Entry point
require(['app']);
