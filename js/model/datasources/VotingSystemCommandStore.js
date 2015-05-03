/**
 *   Copyright <c> Claude Bernard - University Lyon 1 -  2013
 *   License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing
 *   Author: Lionel MEDINI(supervisor), Florian BACLE, Fiona LEPEUTREC, Benoît DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan
 *   Description: Voting module for the ESWC2015 conference.
 *   Version: 1.1
 *   Tags:  JSON, SPARQL, AJAX
 **/
define(['jquery', 'underscore', 'appConfig', 'labels', 'view/ViewAdapter', 'view/ViewAdapterText', 'modules/Vote_module_ESWC2015'],
function ($, _, appConfig, labels, ViewAdapter, ViewAdapterText, votingSystem) {
    return {
        getPublication: {
            getQuery: function (parameters) {
                return {
                    "command": "getPublication",
                    "data": {
                        "key": parameters.uri,
                        "nestedQueries": [
                            {
                                //Retrieve presentation event
                                datasource: "localDatasource",
                                command: "getEventLink",
                                targetProperty: "presentedIn"
                            }
                        ]
                    }
                };
            },

            ModelCallBack: function (dataJSON) {
                return dataJSON?dataJSON:null;
            },

            ViewCallBack: function (parameters) {
                if (_.size(parameters.JSONdata.presentedIn) > 0) {
                    //Get main category
                    var track = appConfig.app.styleMatching[parameters.JSONdata.presentedIn.mainCategory];

                    if(votingSystem.isVotingTrack(track)){
                        parameters.contentEl.append($('<br><span><img src="img/vote.gif" style="width:30px;height:30px"/> <h2 style="display:inline;">Vote for best ' + track + '</h2></span>'));
                        parameters.contentEl.append($('<p>Attention! You can vote only once in the ' + track + ' category. Enter your personal code and press "Vote!" button.</p>'));
                        parameters.contentEl.append($('<input id="personalCode" type="text" size="10" value="code"/>'));
                        parameters.contentEl.append($('<p id="msg" style="color:red"></p>'));
                        parameters.contentEl.append($('<script>var vote= ' + votingSystem.vote + ';</script>'));
                        parameters.contentEl.append($('<button id="voteButton" data-inline="true" class="button" onclick="vote('+"'"+track+"','"+parameters.JSONdata.id+"'"+'); return false;">Vote!</button>'));
                    }
                }
            }
        }
/*,

        *//**
         * Nested queries (no model or view callback)
         *//*
        getPersonLink: {
            getQuery: function (parameters) {
                return {
                    "command": "getPersonLink",
                    "data": {
                        "key": parameters.uri
                    }
                };
            }
        },

        getOrganizationLink: {
            getQuery: function (parameters) {
                return {
                    "command": "getOrganizationLink",
                    "data": {
                        "key": parameters.uri
                    }
                };
            }
        },

        getPublicationLink: {
            getQuery: function (parameters) {
                return {
                    "command": "getPublicationLink",
                    "data": {
                        "key": parameters.uri
                    }
                };
            }
        },

        getRoleLink: {
            getQuery: function (parameters) {
                return {
                    "command": "getRoleLink",
                    "data": {
                        "key": parameters.uri
                    }
                };
            }
        },

        getCategoryLink: {
            getQuery: function (parameters) {
                return {
                    "command": "getCategoryLink",
                    "data": {
                        "key": parameters.uri
                    }
                };
            }
        },

        getEventLink: {
            getQuery: function (parameters) {
                return {
                    "command": "getEventLink",
                    "data": {
                        "key": parameters.uri
                    }
                };
            }
        },

        getLocationLink: {
            getQuery: function (parameters) {
                return {
                    "command": "getLocationLink",
                    "data": {
                        "key": parameters.uri
                    }
                };
            }
        }
*/    };
});