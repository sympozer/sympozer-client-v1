 /**   
*	Copyright <c> Claude Bernard - University Lyon 1 -  2013
* 	License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing 
*   Author: Lionel MEDINI(supervisor), Florian BACLE, Fiona LEPEUTREC, Benoît DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan
*   Description: This JSON object contains all the configurations of the application. It is a crucial part of the system, it describes :
*				-> The conference information, the uri, the logo uri and the name.
*				-> All the datasources defined by their uris, the cross domain  mode they use, and the commandStore (see /model) related to them.
*				   This command store contains the definition of all the command (a specific parameters+query+callback implementation) that can be send on it.
*				-> All the routes that the app will use. Each route is configured to display a specific view, if a template exist for this view name (see /templates)
				   it is rendered, otherwise a generic view is used. The commands we want to send are specified in a "command" array to explicit which command has to be send when the route is catched
				   
*   Tags:  JSON, ENDPOINT, SPARQL
**/
define(['DBLPCommandStore', 'DDGoCommandStore','GoogleCommandStore', 'localCommandStore'],
	function(DBLPCommandStore, DDGoCommandStore, GoogleCommandStore, LocalCommandStore) {
		return {
			"app" : {
				"liveconLogo" : "livecon.png"
			},
			//Defnition of the conference
			"conference" : {
				"name": "12th ESWC2015",
				"acronym": "ESWC2015",
				"logoUri": "data/images/miniLogo_eswc15_red_0.png",
				"website": "http://2015.eswc-conferences.org/",
				"baseUri": "http://data.semanticweb.org/conference/eswc/2015",
                "lang" : "EN",
                "momentLang" : "EN_us",
				"storage": "on",
                "timeZone": {
                    "name": "Europe/Ljubljana",
                    "standardOffset": "+01",
                    "daylightOffset": "+02",
                    "changeToDaylightMonth": "3",
                    "changeToStandardMonth": "10"
                }
			},

			//Defnition of the datasources
			// uri : It correspond to the uri to be used to access the service
			// crossDomainMode : "CORS" or "JSONP" explicits the cross domain technique to be used on the service 
			// commands : Name of the json var that implements all the commands that can be used on the service
			"datasources" : {
				"DblpDatasource" : {
					"uri" : "http://dblp.rkbexplorer.com/sparql/",
					"crossDomainMode" : "CORS",
					"commands" : DBLPCommandStore
				},
				"DuckDuckGoDatasource" : {   
					"uri" : "http://api.duckduckgo.com/",
					"crossDomainMode" : "JSONP",
					"commands" : DDGoCommandStore
				},
				"GoogleDataSource" : {  
					"uri" : "https://ajax.googleapis.com/ajax/services/search/web",
					"crossDomainMode" : "JSONP",
					"commands" : GoogleCommandStore
                },
/*
                "eventDatasource" : {
                    "uri" : "http://sparql.sympozer.com/sparql",
                    "crossDomainMode" : "JSONP",
                    "commands" : liveconSparqlCommandStore
                },
*/
                "localDatasource" : {
                    "uri" : "local:/embedded",
                    //local configuration
                    "local": true,
                    "commands" : LocalCommandStore
				}
			},
			//Declaration of all the routes to be used by the router
			// hash : url to be catched by the router
			// view : the name of the view to display when catching the route (if a template in /templates matches the name, it is used, otherwise a generic view is used)
			// title : the title to display on the header when showing the view
			// commands : array of datasource/name to precise which command of which datasource to send when catching the route
			"routes" : {
		    "Home" : {
					"hash" : "",
					"view" : "home",
					"commands" : [
                        {
                            "datasource" : "localDatasource",
                            "name" : "getConferenceEvent"
                        },
                        {
                            "datasource" : "localDatasource",
                            "name" : "getEventIcs"
                        }
					]
				},
		    	"Schedule" : {
					"hash" : "schedule/*locationLabel",
					"view" : "schedule",
					"title": "schedule",
					"commands" : [
						{
						    "datasource" : "localDatasource",
						    "name" : "getConferenceSchedule"
						}/*,
						{
							"datasource" : "eventDatasource",
							"name" : "getConferenceScheduleIcs"
						}*/
					]
				},
				"WhatsNext" : {
					"hash" : "whatsnext/",
					"view" : "whatsnext",
					"title": "whatsnext",
					"commands" : [
						{
						    "datasource" : "localDatasource",
						    "name" : "getWhatsNext"
						}
					]
				},
				"person-by-role" : { 
					"hash" : "person-by-role/:name/*uri",
					"view" : "person-by-role",
					"title": "allRole",
					"commands" : [
					    {
							"datasource" : "localDatasource",
							"name" : "getPersonsByRole"
						}
					]
				},
                //"Proceedings-search-by-theme" : {
				//	"hash" : "search/by-theme/*uri",
				//	"view" : "",
				//	"title": "allTopic",
				//	"commands" : [
				//	    {
				//			"datasource" : "eventDatasource",
				//			"name" : "getAllTheme"
				//		}
				//	]
				//},
                //"Proceedings-search-by-category" : {
				//	"hash" : "search/by-category/*uri",
				//	"view" : "",
				//	"title": "allCategory",
				//	"commands" : [
				//	    {
				//			"datasource" : "eventDatasource",
				//			"name" : "getAllCategories"
				//		}
				//	]
				//},
				"Events" : {
					"hash" : "events",
					"view" : "events",
					"title": "allEvent",
					"commands" : [
						{
							"datasource" : "localDatasource",
							"name" : "getAllEvents"
						}
					]
				},
				"Event" : { 
					"hash" : "event/:name/*uri",
					"view" : "event",
					"title": "event",
					"commands" : [
						{
							"datasource" : "localDatasource",
							"name" : "getEvent"	
						},
						{
							"datasource" : "localDatasource",
							"name" : "getEventIcs"
						}						
					]
				},
				"Event-by-category" : {
					"hash" : "event-by-category/:name/*uri",
					"view" : "event-by-category",
					"title": "searchByCategory",
					"commands" : [
					    {
							"datasource" : "localDatasource",
							"name" : "getCategory"
						}
					]
				},
				"Publication" : {
					"hash" : "publication/:name/*uri",
					"view" : "publication",
					"title": "publication",
					"commands" : [
						{
							"datasource" : "localDatasource",
							"name" : "getPublication"
						}
					]
				},
				"EventSearch" : {
					"hash" : "search/event",
					"view" : "eventSearch",
					"title": "searchEvent",
					"commands" : [
					]
				},
				"PersonSearch" : {
					"hash" : "search/person",
					"view" : "personSearch",
					"title": "Search person",
					"commands" : [
					]
				},
				"PublicationSearch" : {
					"hash" : "search/publication",
					"view" : "publicationSearch",
					"title": "searchPublication",
					"commands" : [
					]
				},
				"Publications" : { 
					"hash" : "publications",
					"view" : "publications",
					"title": "allPublication",
					"commands" : [
						{
							"datasource" : "localDatasource",
							"name" : "getAllPublications"
						}
					]
				},
				"Locations" : { 
					"hash" : "locations",
					"view" : "locations",
					"title": "allLocation",
					"commands" : [
						{
							"datasource" : "localDatasource",
							"name" : "getAllLocations"
						}
					]
				},
				"OrganizationSearch" : {
					"hash" : "search/organization",
					"view" : "organizationSearch",
					"title": "searchOrganization",
					"commands" : [
					]
				},
				"Persons" : {
					"hash" : "persons",
					"view" : "persons",
					"title": "allPerson",
					"commands" : [
						{
							"datasource" : "localDatasource",
							"name" : "getAllPersons"
						}
					]
				},
				"Person" : {
					"hash" : "person/:name/*uri",
					"view" : "person",
					"title": "person",
					"commands" : [
						{
							"datasource" : "localDatasource",
							"name" : "getPerson"
						},
						{
							"datasource" : "GoogleDataSource",
							"name" : "getAuthorPersonalPage"
						},
						{
							"datasource" : "DblpDatasource",
							"name" : "getAuthorPublications"
						}
					]
				},
				"Organizations" : {
					"hash" : "organizations",
					"view" : "organizations",
					"title": "allOrganization",
					"commands" : [
						{
							"datasource" : "localDatasource",
							"name" : "getAllOrganizations"
						}
					]
				},
				"Roles" : {
					"hash" : "roles",
					"view" : "roles",
					"title": "allRole",
					"commands" : [
						{
							"datasource" : "localDatasource",
							"name" : "getAllRoles"
						}
					]
				},
				//"Topics" : {
				//	"hash" : "topics",
				//	"view" : "topics",
				//	"title": "allTopic",
				//	"commands" : [
				//		{
				//			"datasource" : "eventDatasource",
				//			"name" : "getAllTopics"
				//		}
				//	]
				//},
				//"Topic" : {
				//	"hash" : "topic/:name/*uri",
				//	"view" : "topic",
				//	"title": "topic",
				//	"commands" : [
				//		{
				//			"datasource" : "eventDatasource",
				//			"name" : "getTopic"
				//		}
				//	]
				//},
				"Categories" : {
					"hash" : "categories",
					"view" : "categories",
					"title": "allCategory",
					"commands" : [
						{
							"datasource" : "localDatasource",
							"name" : "getAllCategories"
						}
					]
				},
                //This one seems useless...
				"Category" : {
					"hash" : "category/:name/*uri",
					"view" : "category",
					"title": "category",
					"commands" : [
						{
							"datasource" : "localDatasource",
							"name" : "getCategory"
						}
					]
				},
				"Authors" : {
					"hash" : "authors",
					"view" : "authors",
					"title": "allAuthor",
					"commands" : [
						{
							"datasource" : "localDatasource",
							"name" : "getAllAuthors"
						}
					]
				},
				"ExternPublication" : {
					"hash" : "externPublication/*uri",
					"view" : "externPublication",
					"title": "externalPublication",
					"commands" : [
					    {
							"datasource" : "DblpDatasource",
							"name" : "getExternPublicationInfo"
						},
						{
							"datasource" : "DblpDatasource",
							"name" : "getExternPublicationAuthors"
						}
					]
				},
				"Organization" : {
					"hash" : "organization/:name/*uri",
					"view" : "organization",
					"title": "organization",
					"commands" : [
						{
							"datasource" : "DuckDuckGoDatasource",
							"name" : "getResultOrganization"
						},
						{
							"datasource" : "localDatasource",
							"name" : "getOrganization"
						}
					]
				},
				"Recommendation" : {
					"hash" : "recommendation",
					"view" : "recommendation",
					"title": "recommendation",
					"commands" : [
						{
							"datasource" : "SemanticWebConferenceDatasource",
							"name" : "getRecommendedPublications"
						}
					]
				}
			}
		};
    }
);