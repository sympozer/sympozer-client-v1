/**
 *   Copyright <c> Claude Bernard - University Lyon 1 -  2013
 *   License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing
 *   Author: Lionel MEDINI(supervisor), Florian BACLE, Fiona LEPEUTREC, Benoît DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan
 *   Description: Voting module for the ESWC2015 conference.
 *   Version: 1.1
 *   Tags:  JSON, SPARQL, AJAX
 **/
define(['jquery', 'underscore', 'appConfig', 'labels', 'ViewAdapter', 'ViewAdapterText', 'Vote_module_ESWC2015'],
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
                    //Get paper number instead of URI
                    var number = parameters.JSONdata.id.split("/")[parameters.JSONdata.id.split("/").length -1];

                    if(votingSystem.isVotingTrack(track)){
                        parameters.contentEl.append($('<br><span><img src="img/vote.gif" style="width:30px;height:30px"/> <h2 style="display:inline;">Vote for best ' + track + ' track award </h2></span>'));
                        parameters.contentEl.append($('<p>Attention! You can vote only once in the ' + track + ' category. Enter your personal code and press "Vote!" button.</p>'));
                        parameters.contentEl.append($('<input id="personalCode" type="text" size="10" value="code"/>'));
                        parameters.contentEl.append($('<p id="msg" style="color:red"></p>'));
                        parameters.contentEl.append($('<script>var vote= ' + votingSystem.vote + ';</script>'));
                        parameters.contentEl.append($('<button id="voteButton" data-inline="true" class="button" onclick="vote('+"'"+track+"','"+number+"'"+'); return false;">Vote!</button>'));
                    }
                }
            }
        }
    };
});
