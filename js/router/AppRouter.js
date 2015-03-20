/**
 *	Copyright <c> Claude Bernard - University Lyon 1 -  2013
 * 	License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing
 *   Author: Lionel MEDINI(supervisor), Florian BACLE, Fiona LEPEUTREC, Benoît DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan
 *   Description: This file contains the implementation of the application's router. It has three main role :
 *				INITIALIZATION:
 *					-> The router is initialized to use the route declared in the configuration file (see configuration.js).
 *					-> For each route, the action is prepared and setted to retrieve all commands that have been declared for the route and send an AJAX request.
 *				RUNTIME:
 *					-> Using the powerfull routing system of backbone, the router catch url changes. If a change occurs, the router execute the action prepared at initialization time
 *					and process the view changes plus the AJAX call.
 *	Version: 1.2
 *   Tags:  BACKBONE, AJAX, ROUTING
 **/
define(['backbone', 'jquery', 'jqueryMobile', 'config', 'encoder', 'view/ViewAdapter', 'asyncLoader'], function(Backbone, $, jqueryMobile, config, Encoder, ViewAdapter, AsyncLoader){

    return Backbone.Router.extend({

        /** Initialization function, launched at the start of the application.
         *	It reads the configuration file and prepares all the routes and their actions it will use on runtime
         */
        initialize: function (options){
            var self = this;

            $.each(config.datasources,function(i,datasourceItem){
                console.log("******* DATASOURCE ********");
                console.log(datasourceItem);
            });

            //Initialize AsyncLoader
            AsyncLoader.initialize();

            //Initialize ViewAdapter to text mode
//            ViewAdapter.initialize("text");

            //Preparing all the routes and their actions
            $.each(config.routes, function(i, routeItem){

                //console.log("******* ROUTE ********");
                //console.log(routeItem);

                jqueryMobile.loading( 'show' );

                //Preparing the function to use when catching the current route
                self.route(routeItem.hash, function(name, uri) {

                    //Default route
                    if(name === undefined && uri === undefined){
                        uri = config.conference.baseUri;
                        name = routeItem.title ? routeItem.title : config.conference.name;
                    } else {
                        //Not sure this is useful
                        if (uri === undefined) {
                            uri = Encoder.encode(name);
                        }
                        //But sure about that one
                        if (name !== undefined) {
                            name = Encoder.decode(name);
                        }
                    }

                    var hashtag = Encoder.getHashtag(config.conference.acronym, name);

                    //Appending button and keeping track of new route
                    var currentPage = ViewAdapter.update(routeItem ,hashtag, config.conference, config.datasources, uri, name);

                    //Prepare AJAX call according to the commands declared
                    $.each(routeItem.commands, function(i, commandItem){
                        var currentDatasource = config.datasources[commandItem.datasource];
                        var currentCommand    = currentDatasource.commands[commandItem.name];

                        console.log("Call : " + commandItem.name);
                        //asynchronous call
                        AsyncLoader.executeCommand({
                            datasource: commandItem.datasource,
                            command: commandItem.name,
                            currentUri: uri,
                            name: name
                        }).then(function(results) {
                            return currentCommand.ModelCallBack(results, config.conference, currentDatasource.uri, uri, name);
                        }).then(function(data) {
                            jqueryMobile.loading('hide');
                            currentCommand.ViewCallBack({
                                JSONdata : data,
                                contentEl : currentPage.find("#" + commandItem.name),
                                name : name,
                                conference : config.conference
                            });
                            ViewAdapter.generateJQMobileElement();
                        }).catch(function(ex) {
                            console.log(ex);
                            jqueryMobile.loading('hide');
                        });
                    });

                    //When all commands are done
                    ViewAdapter.generateJQMobileElement();
                });
            });
        }
    });
});