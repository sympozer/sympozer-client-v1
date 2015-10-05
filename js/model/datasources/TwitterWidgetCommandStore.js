/**
 *   Copyright <c> Claude Bernard - University Lyon 1 -  2013
 *   License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing
 *   Author: Lionel MEDINI(supervisor), Florian BACLE, Fiona LEPEUTREC, Benoît DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan
 *   Description: This object contains a json definition of all the commands that will prepare all the queries we want to send on the SemanticWebDogFood sparql endpoint.
 *   Each one of those commands declare the datatype, the method, the query string it is supposed to use on the endpoint and provide a model Callback to store results, a view CallBack to render data stored.
 *   To declare a request, each commands can use the parameters declared for the route they are called in (see Configuration.js). Those parameters can be a name, an uri or both and represents
 *   the entity which we want information on. After calling a command, the results are stored using the localStorageManager (see localStorage.js) and rendered when needed. It is the role of the router to call those commands according to the configuration file.
 *   Version: 1.1
 *   Tags:  Twitter, ESWC2015
 **/
define(['jquery', 'underscore', 'encoder', 'ViewAdapter', 'ViewAdapterText', 'Twitter_widget_ESWC2015', 'appConfig', 'labels'], function ($, _, Encoder, ViewAdapter, ViewAdapterText, twitter, appConfig, labels) {
    return {

        /**
         * Get the main conference Twitter timeline (conference-specific, ESWC2015)
         */
        getConferenceTimeline: {
            getQuery: function (parameters) {
                return {
                    "command": "getConferenceTimeline",
                    "data": null
                };
            },

            ModelCallBack: function (dataJSON) {
                return dataJSON?dataJSON:null;
            },

            ViewCallBack: function (parameters) {
                //Twitter timeline (not generic: extracted from ISWC2015 website)
				parameters.contentEl.append('<div id="block-twitter-block-1" class="block block-twitter-block clearfix"><div class="content"><a href="https://twitter.com/iswc2015" class="twitter-timeline" data-widget-id="521651017213960192" data-chrome="nofooter" data-aria-polite="polite">Tweets by iswc2015</a></div></div>');
				twitter.execute();
            }
        },
    };
});