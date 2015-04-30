/**
 * 	Copyright <c> Claude Bernard - University Lyon 1 -  2013
 * 	License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing
 *   Author: Lionel MEDINI(supervisor), Florian BACLE, Fiona LEPEUTREC, Benoît DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan
 *   Description: Object in charge of executing commands
 *   Version: 1.2
 *   Tags:  JSON, SPARQL, AJAX
 **/

define(['jquery', 'promise', 'configuration', 'localDao', 'localStorage/localStorageManager'], function($, Promise, config, dao, StorageManager){
    var conference = {};
    var asyncL;
    return {
        initialize: function () {
            asyncL = this;
            conference = config.conference;
            //Initialize depending objects
            dao.initialize();
            StorageManager.initialize({conference : config.conference});
        },

        /**
         * Processes nested queries
         * Regardless whether each nested query applies to a single object or to an array
         */
        processNestedQueries: function(nestedQueriesParams) {
            return new Promise(function(resolve, reject) {
                //  Processing nested queries (if any) before calling the resolve function
                //  Note: nested queries are there to complete the data needed by the callback function of the current query
                //  Processing a nested query consists in replacing a targeted property that only contains an URI by the short definition (*Link) of the resources denoted by this URI
                if (nestedQueriesParams.nestedQueries && nestedQueriesParams.nestedQueries !== null && !nestedQueriesParams.data.solved) {
                    var nestedPromises = [];
                    for (var i in nestedQueriesParams.nestedQueries) {
                        var nestedQuery = nestedQueriesParams.nestedQueries[i];
                        var nestedQueryParams = {
                            datasource: nestedQuery.datasource,
                            command: nestedQuery.command,
                            name: nestedQuery.targetProperty
                        };
                        //Before resolving the nested query, nestedData only contains the URI(s) of the element(s) to retrieve
                        var nestedData = nestedQueriesParams.data[nestedQuery.targetProperty];
                        if (nestedData != null) {
                            if (Array.isArray(nestedData)) {
                                for (var j in nestedData) {
                                    nestedQueryParams.currentUri = nestedData[j];
                                    nestedPromises.push(asyncL.executeNestedCommand(nestedQueryParams, reject, i, j).then(function (result) {
                                        //Replace the URI with the result of the nested query
                                        nestedQueriesParams.data[nestedQueriesParams.nestedQueries[result.position1].targetProperty].splice(result.position2, 1, result.data);
                                    }).catch(reject));
                                }
                            } else {
                                nestedQueryParams.currentUri = nestedData;
                                nestedPromises.push(asyncL.executeNestedCommand(nestedQueryParams, reject, i).then(function (result) {
                                    nestedQueriesParams.data[nestedQueriesParams.nestedQueries[result.position1].targetProperty] = result.data;
                                }).catch(reject));
                            }
                        }
                    }
                    if (nestedPromises.length > 0) {
                        Promise.all(nestedPromises).then(function () {
                            nestedQueriesParams.data.solved = true;
                            resolve(nestedQueriesParams.data)
                        });
                    }
                } else {
                    resolve(nestedQueriesParams.data);
                }
            });
        },

        /**
         * Actually solves nested queries by recursively calling the executeCommand method
         * Note: pos1 & pos2 are here to keep the indexes of the calling function, so that it can reuse them in the callback
         */
        executeNestedCommand: function(nestedQueryParams, reject, pos1, pos2) {
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
                    data: results
//                    data: nestedCommand.ModelCallBack(results, config.conference, nestedDatasource.uri, nestedUri, nestedName)
                };
            }).catch(reject);
        },

        /**
         * Command execution:
         * Distinguishes between local and distant sources and calls them adequately
         * In all cases, returns a promise that executes a function processing the response
         * parameters: the command to be launched and the datasource to use
         * data: the query built by the getQuery function of the command
         **/
        executeCommand: function (parameters) {
            var currentDatasource = config.datasources[parameters.datasource];
            var currentCommand = currentDatasource.commands[parameters.command];
            /**
             * Build the query
             */
            var buildQuery = function() {
                return currentCommand.getQuery({
                    conferenceUri : conference.baseUri,
                    uri : parameters.currentUri,
                    datasource : currentDatasource,
                    name : parameters.name,
                    conference : conference
                });
            }

            /**
             * Query the datasource
             * Different ways to run the querying process regarding if the datasource is local or distant
             * If distant: use localStorage to store and retrieve previous query results, to speed up the app
             * If local: Don't need localStorage as objects are already in memory -> just run the query
             */
            return new Promise(function(resolve, reject){
                //Query local datasource
                if (currentDatasource.local === true) {
                    console.log("...on local datasource " + currentDatasource.uri);
                    if(dao) {
                        var query = buildQuery();
                        var data = dao.query(parameters.command, query.data);
                        if (data) {
                            asyncL.processNestedQueries({
                                nestedQueries: query.data ? query.data.nestedQueries : null,
                                data: data
                            }).then(resolve).catch(function(error) {
                                console.log({
                                    "message": "Error in nested query: " + error.message,
                                    "parameters": {
                                        nestedQueries: query.data ? query.data.nestedQueries : null
                                    }
                                });
                                resolve(data);
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
                    //Query distant datasource
                } else {
                    //Trying to retrieve data from local storage, if any...
                    var data = StorageManager.pullCommandFromStorage(parameters.currentUri, parameters.command);
                    if(data) {
                        console.log("...on LocalStorage " + currentDatasource.uri);
                        resolve(data);
                        //...If no corresponding data in local storage:
                    } else {
                        console.log("...on AJAX datasource " + currentDatasource.uri);
                        //Building the query
                        var query = buildQuery();
                        //Preparing the cross domain technique according to datasource definition
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
                                    //Adding a step to the resolve function to store results into local storage and avoid unnecessary requests
                                    //Storing results to local storage is done just before resolving the promises
                                    //TODO: push only if there was no error while retrieving the data (i.e. the answer does not contain an empty response)
                                    StorageManager.pushCommandToStorage(parameters.currentUri, parameters.command, data);
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
});