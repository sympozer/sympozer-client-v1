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
define(['backbone', 'jquery', 'config', 'encoder', 'localStorage/localStorageManager', 'view/ViewAdapter', 'ajaxLoader'], function(Backbone, $, configuration, Encoder, StorageManager, ViewAdapter, AjaxLoader){

	AppRouter = Backbone.Router.extend({

		/** Initialization function, launched at the start of the application.
		*	It reads the configuration file and prepare all the routes and their action it will use on runtime
		*/
		initialize: function (options){
			var self = this;
			
			//Saving the conference definition
			this.conference = configuration.conference;
			//Saving the datasources definition
			this.datasources = configuration.datasources;
			
			//Saving the routes definition
			this.routes = configuration.routes; 

			$.each(this.datasources,function(i,datasourceItem){
				console.log("******* DATASOURCE ********");
				console.log(datasourceItem);
			});

		
			//Initialize storage manager
			StorageManager.initialize({conference : this.conference});
			//Initialize ViewAdapter to text mode
			ViewAdapter.initialize("text");	
			//Initialize ajax Loader 
			AjaxLoader.initialize(ViewAdapter);
		
			//Preparing all the routes and their actions
			$.each(this.routes,function(i,routeItem){
				
				console.log("******* ROUTE ********");
				console.log(routeItem);
				
				
				//Preparing the function to use when catching the current route
				self.route(routeItem.hash, function(name, uri) {

					var title = "";
					if(name !== undefined){
						name = Encoder.decode(name);
						title = name;
					}
					if(uri == undefined){
						title = routeItem.title;	
						uri = name;
					}else{
						uri = Encoder.decode(uri);
					}
					
					if(name == undefined && uri == undefined){
						uri = self.conference.baseUri;
					}
					 
					//Appending button and keeping track of new route in case the mode changes
					var currentPage = ViewAdapter.update(routeItem ,title, self.conference, self.datasources,uri,name); 
					
					//We try if informations are in the local storage before call getQuery and executeCommand
					var JSONdata = StorageManager.pullCommandFromStorage(uri);
				  
					//Prepare AJAX call according to the commands declared
					$.each(routeItem.commands,function(i,commandItem){
					
						var currentDatasource = self.datasources[commandItem.datasource];
						var currentCommand    = currentDatasource.commands[commandItem.name];
						
						if(currentDatasource.activated == true){
						
							var doRequest = true;
							if(JSONdata != null){
								if(JSONdata.hasOwnProperty(commandItem.name)){
									doRequest = false;
									console.log("CAll : "+commandItem.name+" ON Storage");
									//Informations already exists so we directly call the command callBack view to render them 
									currentCommand.ViewCallBack({JSONdata : JSONdata[commandItem.name], contentEl : currentPage.find("#"+commandItem.name), name : name, mode : ViewAdapter.mode, conference : self.conference});
									
								}
							}
							if(doRequest){
								console.log("CAll : "+commandItem.name+" ON "+commandItem.datasource);
								//Retrieveing the query built by the command function "getQuery"
								try {
									//Preparing Ajax call 
									var ajaxData   = currentCommand.getQuery({conferenceUri : self.conference.baseUri, uri : uri,datasource : currentDatasource, name : name, conference : self.conference})
							    } catch (e) {
							    	e.message = "cannot find command '"+commandItem.name+"' in the commandStore '"+commandItem.datasource+"'";
							    	throw e;
							    }

								if(ajaxData != null){
									AjaxLoader.executeCommand({datasource : currentDatasource, command : currentCommand,data : ajaxData, currentUri : uri, contentEl :  currentPage.find("#"+commandItem.name), name : name, conference : self.conference});
								}
								
								
							}
						}
					
						
					});

					ViewAdapter.generateJQMobileElement();
					
					
				});
			});

		}

  });
 	return AppRouter;
});
