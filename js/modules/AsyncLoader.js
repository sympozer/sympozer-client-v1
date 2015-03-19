/**
 * 	Copyright <c> Claude Bernard - University Lyon 1 -  2013
 * 	License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing
 *   Author: Lionel MEDINI(supervisor), Florian BACLE, Fiona LEPEUTREC, Beno�t DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan
 *   Description: Object in charge of executing commands
 *   Version: 1.2
 *   Tags:  JSON, SPARQL, AJAX
 **/

define(['jquery', 'promise', 'config', 'localDao', 'localStorage/localStorageManager'], function($, Promise, config, dao, StorageManager){
    var conference = {};
    var asyncL;
    var AsyncLoader = {
        initialize: function () {
            asyncL = this;
            conference = config.conference;
            //Initialize storage manager
            StorageManager.initialize({conference : config.conference});
        },

        //General function that solves nested queries
        //Note: pos1 & pos2 are here to keep the indexes of the calling function, so that it can reuse them in the callback
        executeNestedCommand: function(nestedQueryParams, pos1, pos2) {
            // Fix the input parameters since they will be used after other calls to executeNestedCommand
            var nestedDatasource = config.datasources[nestedQueryParams.datasource];
            var nestedCommand    = nestedDatasource.commands[nestedQueryParams.command];
            var nestedUri = nestedQueryParams.currentUri;
            var nestedName = nestedQueryParams.name;
            return asyncL.executeCommand(nestedQueryParams).then(function(results) {
                //We have to return the positions, so that the callback knows which value to replace (lost as the promise is asynchronous)
                return {
                    position1: pos1,
                    position2: pos2,
                    data: nestedCommand.ModelCallBack(results, config.conference, nestedDatasource.uri, nestedUri, nestedName)
                };
            });
        },

        /**
         * Processes nested queries
         * Identical whether each nested query applies to a single object ir to an array
         */
        processNestedQueries: function(successParams) {
            return new Promise(function(resolve, reject) {
                //  Processing nested queries (if any) before calling the resolve function
                //  Note: nested queries are there to complete the data needed by the callback function of the current query
                //  Processing a nested query consists in replacing a targeted property that only contains an URI by the short definition (*Link) of the resources denoted by this URI
                if (successParams.nestedQueries && successParams.nestedQueries !== null) {
                    var nestedPromises = [];
                    for (var i in successParams.nestedQueries) {
                        var nestedQuery = successParams.nestedQueries[i];
                        var nestedQueryParams = {
                            datasource: nestedQuery.datasource,
                            command: nestedQuery.command,
                            name: nestedQuery.targetProperty
                        };
                        //Before resolving the nested query, nestedData only contains the URI(s) of the element(s) to retrieve
                        var nestedUri = successParams.data[nestedQuery.targetProperty];
                        if (Array.isArray(nestedUri)) {
                            for (var j in nestedUri) {
                                nestedQueryParams.currentUri = nestedUri[j];
                                nestedPromises.push(asyncL.executeNestedCommand(nestedQueryParams, i, j).then(function (result) {
                                    //Replace the URI with the result of the nested query
                                    successParams.data[successParams.nestedQueries[result.position1].targetProperty].splice(result.position2, 1, result.data);
                                }));
                            }
                        } else {
                            nestedQueryParams.currentUri = nestedUri;
                            nestedPromises.push(asyncL.executeNestedCommand(nestedQueryParams).then(function (result) {
                                successParams.data[successParams.nestedQueries[i].targetProperty] = result.data;
                            }));
                        }
                    }
                    Promise.all(nestedPromises).then(function () {
                        resolve(successParams.data);
                    });
                } else {
                    resolve(successParams.data);
                }
            });
        },

        /**
         * Command execution:
         * First, tries to find the response in local storage,
         * Then, distinguishes between local and distant sources and calls them adequately
         * And in all cases, returns a promise that executes a function processing the response
         * parameters : contains the command to be launched, and the datasource to use
         * data : contains the query built by the command's getQuery function
         **/
        executeCommand: function (parameters) {
            var currentDatasource = config.datasources[parameters.datasource];
            var currentCommand = currentDatasource.commands[parameters.command];
            var store = function (data) {
                //TODO: push only if there was no error while retrieving the data (i.e. the answer does not contain an empty response)
                StorageManager.pushCommandToStorage(parameters.currentUri, parameters.command, data);
            };

            return new Promise(function(resolve, reject){
                //Storing results to local storage just before resolving the promises
                //Adding a step to the resolve function, to store results into local storage and avoid unnecessary requests

                //Trying to retrieve data from local storage, if any...
                var data = StorageManager.pullCommandFromStorage(parameters.currentUri, parameters.command);
                if(data) {
                    console.log("...on LocalStorage " + currentDatasource.uri);
                    resolve(data);
                //...If no corresponding data in local storage:
                } else {
                    ///Build the query
                    var query = currentCommand.getQuery({
                        conferenceUri : conference.baseUri,
                        uri : parameters.currentUri,
                        datasource : currentDatasource,
                        name : parameters.name,
                        conference : conference
                    });

                    //Query local datasources
                    if (currentDatasource.local === true) {
                        console.log("...on local datasource " + currentDatasource.uri);
                        if(dao) {
                            data = dao(parameters.command, query.data);
                            if (data) {
                                asyncL.processNestedQueries({
                                    nestedQueries: query.data ? query.data.nestedQueries : null,
                                    data: data
                                }).then(function(result) {
                                    store(result);
                                    resolve(result);
                                });
                            } else {
                                reject({
                                    "message": query.data.key+ " not found in " + currentDatasource.uri,
                                    "parameters": parameters
                                });
                            }
                        } else {
                            reject({
                                "message": "Error retrieving DAO.",
                                "parameters": parameters
                            });
                        }
                    //Query distant datasources
                    } else {
                        console.log("...on AJAX datasource " + currentDatasource.uri);
                        //Preparing the cross domain technic according to datasource definition
                        jQuery.support.cors = (currentDatasource.crossDomainMode === "CORS");
                        //Sending AJAX request to the datasource
                        $.ajax({
                            url: currentDatasource.uri + currentCommand.serviceUri,
                            type: currentCommand.method,
                            cache: false,
                            dataType: currentCommand.dataType,
                            data: query,
                            success: function(data) {
                                asyncL.processNestedQueries({
                                    nestedQueries: query.data ? query.data.nestedQueries : null,
                                    data: data
                                }).then(function(result) {
                                    store(result);
                                    resolve(result);
                                });
                            },
                            error: reject
                        });
                    }
                }
            });
        }
    };
    return AsyncLoader;
});