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

/*
define(['model/datasources/SWDFCommandStore', 'model/datasources/DBLPCommandStore', 'model/datasources/DDGoCommandStore','model/datasources/GoogleCommandStore','model/datasources/swcEventCommandStore', 'model/datasources/DPCommandStore', 'model/datasources/liveconSparqlCommandStore', 'model/datasources/localCommandStore'],
 function(SWDFCommandStore, DBLPCommandStore, DDGoCommandStore, GoogleCommandStore, swcEventCommandStore, DPCommandStore, liveconSparqlCommandStore, LocalCommandStore) {
 */
define(['model/datasources/DBLPCommandStore', 'model/datasources/DDGoCommandStore','model/datasources/GoogleCommandStore', 'model/datasources/liveconSparqlCommandStore', 'model/datasources/localCommandStore'],
	function(DBLPCommandStore, DDGoCommandStore, GoogleCommandStore, liveconSparqlCommandStore, LocalCommandStore) {
		var AppConfig = {
			"app" : {
				"liveconLogo" : "livecon.png"
			},
			//Defnition of the conference
			"conference" : {
				"id": "1",
				"eventId": "1",
				"name": "11th ESWC2014",
				"acronym": "ESWC2014",
				"logoUri": "img/logo.png",
				"website": "http://2014.eswc-conferences.org/",
				"baseUri": "http://sparql.sympozer.com/resource/conference/38/3811th-eswc-2014",
				"lang" : "EN",
				"storage": "on"
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
                "eventDatasource" : {
                    "uri" : "http://sparql.sympozer.com/sparql",
                    "crossDomainMode" : "JSONP",
                    "commands" : liveconSparqlCommandStore
                },
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
					"graphView" : "no",
					"commands" : [
						{
							"datasource" : "eventDatasource",
							"name" : "getConferenceEvent"
						},
						/*{
							"datasource" : "eventDatasource",
							"name" : "getConferenceTalk",
						},
						{
							"datasource" : "eventDatasource",
							"name" : "getConferenceWorkshop",
						},
						{
							"datasource" : "eventDatasource",
							"name" : "getSessionEvent",
						},
						{
							"datasource" : "eventDatasource",
							"name" : "getConferenceSpecialEvent",
						}*/
						
					]
				},
		    	"Schedule" : {
					"hash" : "schedule/*locationLabel",
					"view" : "schedule",
					"graphView" : "no",
					"title": "schedule",
					"commands" : [
						{
						    "datasource" : "eventDatasource",
						    "name" : "getConferenceSchedule"
						},
						{
							"datasource" : "eventDatasource",
							"name" : "getConferenceScheduleIcs"
						}
					]
				},
				"WhatsNext" : {
					"hash" : "whatsnext/",
					"view" : "whatsnext",
					"graphView" : "no",
					"title": "whatsnext",
					"commands" : [
						{
						    "datasource" : "eventDatasource",
						    "name" : "getWhatsNext"
						}
					]
				},  
				"person-by-role" : { 
					"hash" : "person-by-role/:name/*uri",
					"view" : "person-by-role",
					"graphView" : "no",
					"title": "allRole",
					"commands" : [
					    {
							"datasource" : "localDatasource",
							"name" : "getPersonsByRole"
						}
					]
				},
			    "Proceedings-search-by-theme" : { 
					"hash" : "search/by-theme/*uri",
					"view" : "",
					"graphView" : "no",
					"title": "allTopic",
					"commands" : [
					    {
							"datasource" : "eventDatasource",
							"name" : "getAllTheme"
						}
					]
				},
			    "Proceedings-search-by-category" : { 
					"hash" : "search/by-category/*uri",
					"view" : "",
					"graphView" : "no",
					"title": "allCategory",
					"commands" : [
					    {
							"datasource" : "eventDatasource",
							"name" : "getAllCategories"
						}
					]
				},
				"Events" : {
					"hash" : "events",
					"view" : "events",
					"graphView" : "no",
					"title": "allEvent",
					"commands" : [
						{
							"datasource" : "eventDatasource",
							"name" : "getAllEvents"
						}
					]
				},
				"Event" : { 
					"hash" : "event/:name/*uri",
					"view" : "event",
					"graphView" : "no",
					"title": "event",
					"commands" : [
						{
							"datasource" : "eventDatasource",
							"name" : "getEvent"	
						},
						{
							"datasource" : "eventDatasource",
							"name" : "getEventIcs"
						}						
					]
				},
				"Event-by-category" : { 
					"hash" : "event-by-category/:name/*uri",
					"view" : "event-by-category",
					"graphView" : "no",
					"title": "searchByCategory",
					"commands" : [
					    {
							"datasource" : "eventDatasource",
							"name" : "getEventByCategory"
						}
					]
				},
				"Publication" : { 
					"hash" : "publication/:name/*uri",
					"view" : "publication",
					"graphView" : "no",
					"title": "publication",
					"commands" : [
						{
							"datasource" : "eventDatasource",
							"name" : "getPublication"
						}
					]
				},
				"EventSearch" : {
					"hash" : "search/event",
					"view" : "eventSearch",
					"graphView" : "no",
					"title": "searchEvent",
					"commands" : [
					]
				},
				"PersonSearch" : {
					"hash" : "search/person",
					"view" : "personSearch",
					"graphView" : "no",
					"title": "Search person",
					"commands" : [
					]
				},
				"PublicationSearch" : {
					"hash" : "search/publication",
					"view" : "publicationSearch",
					"graphView" : "no",
					"title": "searchPublication",
					"commands" : [
					]
				},
				"Publications" : { 
					"hash" : "publications",
					"view" : "publications",
					"graphView" : "no",
					"title": "allPublication",
					"commands" : [
						{
							"datasource" : "eventDatasource",
							"name" : "getAllPublications"
						}
					]
				},
				"Locations" : { 
					"hash" : "locations",
					"view" : "locations",
					"graphView" : "no",
					"title": "allLocation",
					"commands" : [
						{
							"datasource" : "eventDatasource",
							"name" : "getAllLocations"
						}
					]
				},
				"OrganizationSearch" : {
					"hash" : "search/organization",
					"view" : "organizationSearch",
					"graphView" : "no",
					"title": "searchOrganization",
					"commands" : [
					]
				},
				"Persons" : {
					"hash" : "persons",
					"view" : "persons",
					"graphView" : "no",
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
					"graphView" : "no",
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
					"graphView" : "no",
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
					"graphView" : "no",
					"title": "allRole",
					"commands" : [
						{
							"datasource" : "localDatasource",
							"name" : "getAllRoles"
						}
					]
				},
				"Countries" : {
					"hash" : "countries",
					"view" : "countries",
					"graphView" : "no",
					"title": "allCountry",
					"commands" : [
						{
							"datasource" : "eventDatasource",
							"name" : "getAllCountries"
						}
					]
				},
				"Topics" : {
					"hash" : "topics",
					"view" : "topics",
					"graphView" : "no",
					"title": "allTopic",
					"commands" : [
						{
							"datasource" : "eventDatasource",
							"name" : "getAllTopics"
						},
					]
				},
				"Topic" : {
					"hash" : "topic/:name/*uri",
					"view" : "topic",
					"graphView" : "no",
					"title": "topic",
					"commands" : [
						{
							"datasource" : "eventDatasource",
							"name" : "getTopic"
						},
					]
				},
				"Categories" : {
					"hash" : "categories",
					"view" : "categories",
					"graphView" : "no",
					"title": "allCategory",
					"commands" : [
						{
							"datasource" : "eventDatasource",
							"name" : "getAllCategories"
						}
					]
				},
				"Category" : {
					"hash" : "category/:name",
					"view" : "category",
					"graphView" : "no",
					"title": "category",
					"commands" : [
						{
							"datasource" : "eventDatasource",
							"name" : "getEventbyCategory"
						},
					]
				},
				"Authors" : {
					"hash" : "authors",
					"view" : "authors",
					"graphView" : "no",
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
					"graphView" : "no",
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
					"graphView" : "no",
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
					"graphView" : "no",
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
		return AppConfig;
})