/**
 * 	Copyright <c> Claude Bernard - University Lyon 1 -  2013
 * 	License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing
 *   Author: Lionel MEDINI(supervisor), Florian BACLE, Fiona LEPEUTREC, Benoît DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan
 *   Description: Object in charge of executing commands
 *   Version: 1.2
 *   Tags:  JSON, SPARQL, AJAX
 **/

define(['jquery', 'promise', 'appConfig', 'CommandStores', 'localDao', 'localStorageManager', 'ViewAdapter', 'encoder'], function($, Promise, config, CommandStores, dao, StorageManager, ViewAdapter, Encoder){
    var commandProcessor;
    return {
        initialize: function () {
            commandProcessor = this;
            //Initialize depending objects
            StorageManager.initialize({
                conference: config.conference.baseUri,
                preferences : config.preferences
            });
            dao.initialize();
            //Preparing storage slider (must be done after StorageManager initialization)
            ViewAdapter.initSettings();
        },

        /**
         * Upper-level function for calling commands from a CommandStore, corresponding to a given route.
         * Iterates over all commands in the current context and regardless whether they apply to a single object or to an array.
         * Will be called recursively to process nested commands according to application configuration.
         * @param context object containing the parameters required to process the command and run the query/queries
         * TODO check it is no longer useful: @param results results of a given query; lost between 2 queries; should be integrated in context.data before processing nested queries
         * @returns {Promise} a promise to be fulfilled when all (nested) queries of the current commands have ended 
         */
        processCommands: function(context) {
            return new Promise(function (resolve, reject) {

                //  Processing queries (if any)
                //  Note: nested queries are there to complement the data needed by the callback function of the current query
                //  Processing a nested query consists in replacing a targeted property that only contains an URI by the short definition (*Link) of the resources denoted by this URI
                if (context.command && !context.solved) {
                    context.commands = context.command.commands ? context.command.commands : context.command.nestedCommands;
                    if (context.commands) {
                        let commandPromises = [];
                        let resultData = {};

                        //Appending button and keeping track of new route
                        context.currentPage = context.currentPage ? context.currentPage : ViewAdapter.update(context.routeName, context.queryString);

                        //Iterate over the (nested)commands array
                        for (let position in context.commands) {
                            (function (context) {
                                context.commandPosition = position;
                                context.command = context.commands[position];

                                //URI(s) of the element(s) to retrieve
                                //For an upper-level query, it is the URI in the route
                                //For a nested query, it is indicated in a "targetProperty" field of the upper-level results

                                //Define in the context where to place the result data in the variable results
                                context.targetProperty = context.command.targetProperty ? context.command.targetProperty : context.command.name;

                                //The object to collect results in
//                                var nestedResults = {};
                                //Create the corresponding field in nestedResults
//                                nestedResults[context.targetProperty] = results[context.targetProperty]?results[context.targetProperty]:context.currentUri;

                                //Debug
                                console.log("\nProcessing command: " + context.command.name);

                                //Execute the workflow in a separate function
                                //TODO correct and finish the executeWorkflow function, and replace runCallbacks in next instruction
                                commandPromises.push(commandProcessor.queryDatasource(context).then(function(results){
                                    resultData[results.targetProperty] = results.data;
                                }));
                            })(context);
                        }
                        if (commandPromises.length > 0) {
                            //TODO change this to a workflow
                            Promise.all(commandPromises)
                                .then(function () {
                                    context.solved = true;
                                    //Trigger view creation
                                    ViewAdapter.generateJQMobileElement(commandProcessor.viewTypeClassName);
                                    //Setting links in social buttons according to the actual contents
                                    //TODO do some more intelligent hashtag guest from page contents
                                    var hashtag = Encoder.getHashtag(config.conference.acronym, context.queryString);
                                    ViewAdapter.customizeSocialButtons(hashtag);
                                    resolve(resultData);
                                })
/*
                                .catch(
                                    function (error) {
                                        reject(error);
                                    }
                                )
*/
                            ;
                        }
                    } else {
                        resolve({});
                    }
                } else {
                    resolve({});
                }
            });
        },

        /**
         * Run a workflow (to be done)
         * for the moment, only launches the queryDatasource method for each command on all entities
         * Replaces the value(s) in the target properties with the result(s) of the nested queries
         */
        executeWorkflow: function(context, results) {
            return new Promise(function (resolve, reject) {

                //Two different behaviors if the result of the upper level query is an array (list of persons for example)...
                if (Array.isArray(results[context.targetProperty])) {
                    var queryArrayPromises = [];
                    for (var arrayPosition in results[context.targetProperty]) {
                        //context.currentUri = results[context.targetProperty][arrayPosition];
                        (function(context, results, position2) {
                            queryArrayPromises.push(
                                commandProcessor.runCallbacks(context, results).then(
                                    function(data) {
                                        //Replace the URI with the result of the nested query for this array element
                                        results[context.targetProperty][context.commands[context.commandPosition].targetProperty].splice(position2, 1, data);
                                    }
                                )
                                /*
                                 .catch(
                                 function (error) {
                                 reject(error);
                                 }
                                 )
                                 */
                            );
                        })(context, results, arrayPosition);
                    }
                    //TODO potential bug here!
                    Promise.all(queryArrayPromises).then(function() {
                        resolve(results[context.targetProperty]); //why results[context.targetProperty] ?
                    });

                    //...or if it is a single entity (e.g. a given organisation)
                } else {
                    //context.currentUri = results[context.targetProperty];
                    (function(parameters, results) {
                        commandProcessor.runCallbacks(parameters, results).then(
                            function (data) {
                                //Replace the URI with the result of the nested query in the property value
                                results[context.targetProperty][parameters.commands[parameters.commandPosition].targetProperty] = data;
                            }
                        )
                        /*
                         .catch(
                         function (error) {
                         reject(error);
                         }
                         )
                         */
                        ;
                    })(context, results);
                    resolve(results);
                }
            });
        },

        callNestedQueries: function(context) {
            return new Promise(function(resolve, reject){

                // Launch eventual nested commands
                commandProcessor.processCommands(context)
                    .then(function(nestedData) {
                        if(nestedData) {
                            results.data[nestedData.targetProperty] = nestedData.data;
                        }
                        resolve(result);
                    })
                    .catch(function(error) {
                        console.log({
                            "message": "Error in nested query: " + error.message,
                            "parameters": {
                                nestedQueries: query.data ? query.data.nestedQueries : null
                            }
                        });
                        resolve(result);
                    })
                ;
            });
        },

        /**
         * Query a datasource
         * Distinguishes between local and distant sources and calls them adequately
         * If distant: use localStorage to store and retrieve previous query results, to speed up the app
         * If local: don't need localStorage as objects are already in memory -> just run the query
         * In all cases: calls the getQuery function from the command and sends the query to the datasource
         * /!\ before resolving the promise, calls the runCallbacks synchronously
         * @param context all necessary data to query the datasource
         * @returns {Promise} a promise that resolves with the context enriched with the query results (in the context.data property)
         */
        queryDatasource: function (context) {
            //Retrieve objects to solve the query
            var currentDatasource = config.datasources[context.command.datasource];
            var currentCommand = CommandStores[currentDatasource.commands][context.command.name];

            //Retrieve the eventual callbacks, as the current command is available in the scope of this function
            context.modelCallback = currentCommand.ModelCallBack?currentCommand.ModelCallBack:null;
            context.viewCallback = currentCommand.ViewCallBack?currentCommand.ViewCallBack:null;

            //Build the query parameters
            var queryParameters = {
                uri : context.currentUri,
                name : context.queryString,
                conference : config.conference
            };

            //Query the datasource
            return new Promise(function(resolve, reject){
                var queryResult = {};

                //Query local datasource
                if (currentDatasource.local === true) {
                    console.log("...on local datasource " + currentDatasource.uri);
                    if(dao) {
                        var query = currentCommand.getQuery(queryParameters);
                        queryResult = dao.query(context.command.name, query.data);
                        if (queryResult) {
                            context.data = queryResult;
                            commandProcessor.runCallbacks(context);
                            resolve(context);
                        } else {
                            //This is a hack: avoiding processing queries when not needed.
                            console.log("Warning:" + query.command + " not found in " + currentDatasource.uri + ' Continuing anyway...');
                            commandProcessor.runCallbacks(context);
                            resolve(context);
                        }
                    } else {
                        reject({
                            "message": "Error retrieving DAO.",
                            "parameters": context
                        });
                    }
                    //Query distant datasource
                } else {
                    //Trying to retrieve data from local storage, if any...
                    queryResult = StorageManager.pullCommandFromStorage(context.currentUri, context.command.name);
                    if(queryResult) {
                        console.log("...on LocalStorage " + currentDatasource.uri);
                        context.data = queryResult;
                        commandProcessor.runCallbacks(context);
                        resolve(context);
                        //...If no corresponding data in local storage:
                    } else {
                        console.log("...on AJAX datasource " + currentDatasource.uri);

                        //Preparing the cross domain technique according to datasource definition
                        $.support.cors = (currentDatasource.crossDomainMode === "CORS");

                        //Sending AJAX request to the datasource
                        $.ajax({
                            url: currentDatasource.uri + currentCommand.serviceUri,
                            type: currentCommand.method,
                            cache: false,
                            crossDomain: true,
                            dataType: currentCommand.dataType,
                            //Building the query
                            data: currentCommand.getQuery(queryParameters),
                            success: function(data) {
                                queryResult = data;

                                // Adding a step to the resolve function to store results into local storage and avoid unnecessary requests
                                // Storing results to local storage is done just before resolving the promises
                                // TODO: push only if there was no error while retrieving the data (i.e. the answer does not contain an empty response)
                                StorageManager.pushCommandToStorage(context.currentUri, context.command.name, queryResult);

                                context.data = queryResult;
                                commandProcessor.runCallbacks(context);
                                resolve(context);
                            },
                            error: function(error) {
                                reject(error);
                            }
                        });
                    }
                }
            });
        },

        /**
         * Executes the eventual model and view callbacks corresponding to the query
         * @param context All necessary information (including query results) to run the callbacks
         * @param modelCallback the model callback or null
         * @param viewCallback the view callback or null
         */
        runCallbacks: function(context) {
//            (function(context) {
//            return new Promise(function(resolve, reject) {
//                    commandProcessor.queryDatasource(context)
//                        .then(function (result) {
            // Store data in the corresponding property of the context variable
//                            context.data[context.targetProperty] = result.data;
//                            commandProcessor.callNestedQueries(context);

            //Call the model callback (if any)
            if (context.modelCallback) {
                context.data = context.modelCallback(context.data);
            }
            //Call the view callback
            if (context.viewCallback) {
                commandProcessor.viewTypeClassName = context.viewCallback({
                        JSONdata: context.data,
                        contentEl: context.currentPage.find("#" + context.command.name),
                        name: context.routeName,
                        conference: config.conference
                    }) || commandProcessor.viewTypeClassName;
            }
            //Only send back the data
//                            resolve(context.data);
//                        })
//                        .catch(function (error) {
//                            reject(error);
//                        })
//                    ;
//            });
//            })(context);
        }
    };
});