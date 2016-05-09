/**
 *	Copyright <c> Claude Bernard - University Lyon 1 -  2013
 * 	License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing
 *   Author: Lionel MEDINI(supervisor), Florian BACLE, Fiona LEPEUTREC, Benoît DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan
 *   Description: This file contains the implementation of the application's router. It has three main role :
 *				INITIALIZATION:
 *					-> The router is initialized to use the route declared in the configuration file (see configuration.js).
 *					-> For each route, the action is prepared and set to retrieve all commands that have been declared for the route and send an AJAX request.
 *				RUNTIME:
 *					-> Using the powerful routing system of backbone, the router catch url changes. If a change occurs, the router execute the action prepared at initialization time
 *					and process the view changes plus the AJAX call.
 *	Version: 1.2
 *   Tags:  BACKBONE, AJAX, ROUTING
 **/
define(['backbone', 'appConfig', 'CommandProcessor', 'ViewAdapter'], function(Backbone, config, commandProcessor, ViewAdapter){

    return Backbone.Router.extend({

        /** Initialization function, launched at the start of the application.
         *	It reads the configuration file and prepares all the routes and their actions it will use on runtime
         */
        initialize: function (options){
            var router = this;

            //Call super method
            Backbone.Router.prototype.initialize.call(options);
            //Initialize CommandProcessor
            commandProcessor.initialize();

            //Preparing all routes and their actions
            for(var routeKey in config.routes){
                var routeItem = config.routes[routeKey];

                //console.log("******* ROUTE ********");
                //console.log(routeKey + " -> " + routeItem);

                //Closing values of routeKey as runRoute calls a promise
                (function (routeKey, routeItem) {
                    //Defining the callback to use when catching each given route
                    //Note: parameters name and uri are those that are likely to happen in the route parameters
                    router.route(routeItem.hash, routeItem.title, function(name, uri) {

                        //Route arguments
                        console.log("Name: " + name);
                        console.log("URI: " + uri);

/*
                        //For "main" routes (home, getAll*...)
                        if(!uri){
                            uri = config.conference.baseUri;
                        }
                        //For routes that don't have a name parameter
                        if (!name) {
                            name = routeItem.title;
                        }
*/
                        //Depends on the category and serves for styling the current view
                        commandProcessor.viewTypeClassName = null;

                        //Prepare the context of the command processing functions
                        var context = {
                            routeName: routeKey,
                            command: routeItem,
                            queryString: name?name:routeItem.title, //with alternate value for routes that don't have a name parameter
                            currentUri: uri?uri:config.conference.baseUri //with alternate value for "main" routes (home, getAll*...)
                        };

                        //Call the commandProcessor to do the job for a given route
                        commandProcessor.processCommands(context) //, results)
                            .then(function(data) {
                                console.log("End of process for command " + routeKey + " -> " + JSON.stringify(data));
                            })
                            .catch(function(error) {
                                console.log("Error: " + error);
                            })
                        ;

                    });
                })(routeKey, routeItem);
            }
        }
    });
});