/**
 *	Copyright <c> Claude Bernard - University Lyon 1 -  2013
 * 	License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing
 *   Author: Lionel MEDINI(supervisor), Florian BACLE, Fiona LEPEUTREC, Benoît DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan
 *   Description: This JSON object contains all the configurations of the application. It is a crucial part of the system, it describes :
 *				-> The conference information, the uri, the logo uri and the name.
 *				-> All the datasources defined by their uris, the cross domain  mode they use, and the commandStore (see /model) related to them.
 *				   This command store contains the definition of all the command (a specific parameters+query+callback implementation) that can be send on it.
 *				-> All the routes that the app will use. Each route is configured to display a specific view, if a template exist for this view name (see /templates)
 it is rendered, otherwise a generic view is used. The commands we want to send are specified in a "command" array to explicit which command has to be sent when the route is catched

 *   Tags:  JSON, ENDPOINT, SPARQL
 **/
define([], function() {
        return {
            "app" : {
                "appLogo" : "Sympozer_logo.png",
//                "conferenceEventCategory": "http:\/\/data.semanticweb.org\/conference\/eswc\/2015\/category\/conference-event",
                "presentationEventCategory": "http:\/\/data.semanticweb.org\/conference\/eswc\/2015\/category\/presentation-event",
                "sessionEventCategory": "http:\/\/data.semanticweb.org\/conference\/eswc\/2015\/category\/session-event",
                styleMatching: {
                    "http://data.semanticweb.org/ns/swc/ontology#PosterEvent": "poster",
                    "http://data.semanticweb.org/ns/swc/ontology#SessionEvent": "session",
//                    "http://data.semanticweb.org/ns/swc/ontology#SessionEvent": "research",
//                    "http://data.semanticweb.org/conference/eswc/2015/category/in-use-event": "inUse",
                    "http://data.semanticweb.org/ns/swc/ontology#DemoEvent": "demo",
                    "http://data.semanticweb.org/ns/swc/ontology#WorkshopEvent": "workshop",
                    "http://data.semanticweb.org/ns/swc/ontology#TutorialEvent": "tutorial",
                    "http://data.semanticweb.org/ns/swc/ontology#KeynoteEvent": "keynote"
                },
				"imageFolder": "data/images/", //Needs a trailing slash
                "whatsNextDelay": {"hours":2} //MomentJS notation
            },
            //User preferences
            "preferences": {
                "storage": "on"
            },
            //Defnition of the conference
            "conference" : {
                "name": "13th ESWC2016",
                "acronym": "ESWC2016",
                "logoUri": "data/images/logo_eswc2016.png",
                "website": "http://2016.eswc-conferences.org/",
                "baseUri": "http://data.semanticweb.org/conference/eswc/2016",
                "updateUri": "https://raw.githubusercontent.com/sympozer/datasets/master/ESWC2016/data_ESWC2016.json",
                "lang" : "EN",
                "momentLang" : "EN_us",
                "storage": "on",
                "timeZone": {
                    "name": "Europe/Athens",
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
                    "commands" : "DBLPCommandStore"
                },
                "DuckDuckGoDatasource" : {
                    "uri" : "http://api.duckduckgo.com/",
                    "crossDomainMode" : "JSONP",
                    "commands" : "DDGoCommandStore"
                },
                "GoogleDataSource" : {
                    "uri" : "https://ajax.googleapis.com/ajax/services/search/web",
                    "crossDomainMode" : "JSONP",
                    "commands" : "GoogleCommandStore"
                },
                "localDatasource" : {
                    "uri" : "local:/embedded",
                    //local configuration
                    "local": true,
                    "commands" : "LocalCommandStore"
                },
                "VotingSystemDatasource" : {
                    "uri" : "local:/voting",
                    //local configuration
                    "local": true,
                    "commands" : "VotingSystemCommandStore"
                },
                "TwitterWidgetDatasource" : {
                    "uri" : "local:/twitter",
                    //local configuration
                    "local": true,
                    "commands" : "TwitterWidgetCommandStore"
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
                    "view" : "homeTpl",
                    "commands" : [
                        {
                            "datasource" : "localDatasource",
                            "name" : "getConferenceEvent"
                        },
//                        {
//                            "datasource" : "localDatasource",
//                            "name" : "getEventIcs"
//                        },
                        {
                            "datasource" : "TwitterWidgetDatasource",
                            "name" : "getConferenceTimeline"
                        }
                    ]
                },
                "Schedule" : {
                    "hash" : "schedule/*locationLabel",
                    "view" : "scheduleTpl",
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
                    "view" : "whatsnextTpl",
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
                    "view" : "person-by-roleTpl",
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
                    "view" : "eventsTpl",
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
                    "view" : "eventTpl",
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
                    "view" : "event-by-categoryTpl",
                    "title": "searchByCategory",
                    "commands" : [
                        {
                            "datasource" : "localDatasource",
                            "name" : "getCategory"
                        }
                    ]
                },
                "Events-by-location" : {
                    "hash" : "events-by-location/:name/*uri",
                    "view" : "events-by-locationTpl",
                    "title": "searchByLocation",
                    "commands" : [
                        {
                            "datasource" : "localDatasource",
                            "name" : "getLocation"
                        }
                    ]
                },
                "Publication" : {
                    "hash" : "publication/:name/*uri",
                    "view" : "publicationTpl",
                    "title": "publication",
                    "commands" : [
                        {
                            "datasource" : "localDatasource",
                            "name" : "getPublication"
                        },
                        {
                            "datasource" : "VotingSystemDatasource",
                            "name" : "getPublication"
                        }
                    ]
                },
                "EventSearch" : {
                    "hash" : "search/event",
                    "view" : "eventSearchTpl",
                    "title": "searchEvent",
                    "commands" : [
                    ]
                },
                "PersonSearch" : {
                    "hash" : "search/person",
                    "view" : "personSearchTpl",
                    "title": "Search a person",
                    "commands" : [
                    ]
                },
                "PublicationSearch" : {
                    "hash" : "search/publication",
                    "view" : "publicationSearchTpl",
                    "title": "searchPublication",
                    "commands" : [
                    ]
                },
                "Publications" : {
                    "hash" : "publications",
                    "view" : "publicationsTpl",
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
                    "view" : "locationsTpl",
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
                    "view" : "organizationSearchTpl",
                    "title": "searchOrganization",
                    "commands" : [
                    ]
                },
                "Persons" : {
                    "hash" : "persons",
                    "view" : "personsTpl",
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
                    "view" : "personTpl",
                    "title": "person",
                    "commands" : [
                        {
                            "datasource" : "localDatasource",
                            "name" : "getPerson"
                        },
                        //{
                        //    "datasource" : "GoogleDataSource",
                        //    "name" : "getAuthorPersonalPage"
                        //},
                        {
                            "datasource" : "DblpDatasource",
                            "name" : "getAuthorPublications"
                        }
                    ]
                },
                "Organizations" : {
                    "hash" : "organizations",
                    "view" : "organizationsTpl",
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
                    "view" : "rolesTpl",
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
                //	"view" : "topicsTpl",
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
                //	"view" : "topicTpl",
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
                    "view" : "categoriesTpl",
                    "title": "allCategory",
                    "commands" : [
                        {
                            "datasource" : "localDatasource",
                            "name" : "getAllCategories"
                        }
                    ]
                },
                "CategoriesForPublications" : {
                    "hash" : "categories-for-publications",
                    "view" : "categoriesTpl",
                    "title": "allCategory",
                    "commands" : [
                        {
                            "datasource" : "localDatasource",
                            "name" : "getAllCategoriesForPublications"
                        }
                    ]
                },
                "Category" : {
                    "hash" : "category/:name/*uri",
                    "view" : "categoryTpl",
                    "title": "category",
                    "commands" : [
                        {
                            "datasource" : "localDatasource",
                            "name" : "getCategory"
                        }
                    ]
                },
                "Publications-by-category" : {
                    "hash" : "publications-by-category/:name/*uri",
                    "view" : "categoryTpl",
                    "title": "category",
                    "commands" : [
                        {
                            "datasource" : "localDatasource",
                            "name" : "getCategoryForPublications"
                        }
                    ]
                },
                "Authors" : {
                    "hash" : "authors",
                    "view" : "authorsTpl",
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
                    "view" : "externPublicationTpl",
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
                    "view" : "organizationTpl",
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
                    "view" : "recommendationTpl",
                    "title": "recommendation",
                    "commands" : [
                        {
                            "datasource" : "SemanticWebConferenceDatasource",
                            "name" : "getRecommendedPublications"
                        }
                    ]
                },
                "About" : {
                    "hash" : "about",
                    "view" : "aboutTpl",
                    "title": "About",
                    "commands" : []
                }
            }
        };
    }
);