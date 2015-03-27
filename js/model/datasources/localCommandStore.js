/**
 *   Copyright <c> Claude Bernard - University Lyon 1 -  2013
 *   License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing
 *   Author: Lionel MEDINI(supervisor), Florian BACLE, Fiona LEPEUTREC, Benoît DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan
 *   Description: This object contains a json definition of all the commands that will prepare all the queries we want to send on the SemanticWebDogFood sparql endpoint.
 *   Each one of those commands declare the datatype, the method, the query string it is supposed to use on the endpoint and provide a model Callback to store results, a view CallBack to render data stored.
 *   To declare a request, each commands can use the parameters declared for the route they are called in (see Configuration.js). Those parameters can be a name, an uri or both and represents
 *   the entity which we want informations on. After calling a command, the results are stored using the localStorageManager (see localStorage.js) and rendered when needed. It is the role of the router to call those commands according to the configuration file.
 *   Version: 1.1
 *   Tags:  JSON, SPARQL, AJAX
 **/
define(['jquery', 'underscore', 'encoder', 'view/ViewAdapter', 'view/ViewAdapterText', 'moment', 'lib/FileSaver', 'labels'], function ($, _, Encoder, ViewAdapter, ViewAdapterText, moment, FileSaver, labels) {
    var localCommandStore = {

        /**
         * Retrieve lists
         */
        //TODO
        getAllTopics: {
            dataType: "JSONP",
            method: "GET",
            serviceUri: "",
            getQuery: function (parameters) {
                var prefix = 'PREFIX dc: <http://purl.org/dc/elements/1.1/> PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#> PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> ';

                var query = 'SELECT DISTINCT ?topicLabel  WHERE  {\
							 {	<' + parameters.uri + '>    swc:isSuperEventOf    ?eventUri.\
							  	?eventUri dc:subject ?topicLabel.\
							 } UNION { \
							 	<' + parameters.uri + '>    swc:hasRelatedDocument ?publiUri.\
							  	?publiUri dc:subject ?topicLabel.}\
							 } ORDER BY ASC(?topicLabel) ';

                var ajaxData = {query: prefix + query, output: "json"};

                return ajaxData;
            },

            ModelCallBack: function (dataJSON, conferenceUri, datasourceUri, currentUri) {
                var JSONfile = {};
                $.each(dataJSON.results.bindings, function (i) {
                    var JSONToken = {};
                    JSONToken.uri = this.topicLabel ? this.topicLabel.value : null;
                    JSONToken.name = this.topicLabel ? this.topicLabel.value : null;
                    JSONfile[i] = JSONToken;
                });
                //console.log(JSONfile);
                //StorageManager.pushCommandToStorage(currentUri, "getAllTopics", JSONfile);
                return JSONfile;
            },

            ViewCallBack: function (parameters) {
                if (parameters.JSONdata != null) {
                    if (_.size(parameters.JSONdata) > 0) {
                        ViewAdapterText.appendList(parameters.JSONdata,
                            {
                                baseHref: '#topic/',
                                hrefCllbck: function (str) {
                                    return Encoder.encode(str["name"]) + "/" + Encoder.encode(str["uri"])
                                }
                            },
                            "name",
                            parameters.contentEl,
                            {
                                type: "Node",
                                labelCllbck: function (str) {
                                    return "event : " + str["name"];
                                }
                            }
                        );
                    }
                }
            }
        },

        //TODO
        getAllLocations: {
            dataType: "JSONP",
            method: "GET",
            serviceUri: "",
            getQuery: function (parameters) {
                var prefix = 'PREFIX dc: <http://purl.org/dc/elements/1.1/> PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#> PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> ';

                var query = 'SELECT DISTINCT ?locationName  ?locationUri WHERE  {\
							 <' + parameters.uri + '>    swc:isSuperEventOf    ?eventUri.\
							  	?eventUri swc:hasLocation ?locationUri.\
							  	?locationUri rdfs:label ?locationName.\
							 } ORDER BY ASC(?locationName) ';

                var ajaxData = {query: prefix + query, output: "json"};

                return ajaxData;
            },

            ModelCallBack: function (dataJSON, conferenceUri, datasourceUri, currentUri) {
                var JSONfile = {};
                $.each(dataJSON.results.bindings, function (i) {
                    var JSONToken = {};
                    JSONToken.uri = this.locationUri ? this.locationUri.value : null;
                    JSONToken.name = this.locationName ? this.locationName.value : null;
                    JSONfile[i] = JSONToken;
                });
                //console.log(JSONfile);
                //StorageManager.pushCommandToStorage(currentUri, "getAllTopics", JSONfile);
                return JSONfile;
            },

            ViewCallBack: function (parameters) {
                if (parameters.JSONdata != null) {
                    if (_.size(parameters.JSONdata) > 0) {
                        ViewAdapterText.appendList(parameters.JSONdata,
                            {
                                baseHref: '#schedule/',
                                hrefCllbck: function (str) {
                                    return Encoder.encode(str["name"])
                                }
                            },
                            "name",
                            parameters.contentEl,
                            {
                                type: "Node",
                                labelCllbck: function (str) {
                                    return "event : " + str["name"];
                                }
                            }
                        );
                    }
                }
            }
        },

        //TODO
        getAllEvents: {
            dataType: "JSONP",
            method: "GET",
            serviceUri: "",
            getQuery: function (parameters) {
                var prefix = 'PREFIX rdf:    <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
                    PREFIX swc:     <http://data.semanticweb.org/ns/swc/ontology#>\
                    PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>\
                    PREFIX event:   <http://purl.org/NET/c4dm/event.owl#> \
                    PREFIX ical: <http://www.w3.org/2002/12/cal/ical#> ';

                var query = "SELECT DISTINCT  ?eventUri ?eventSummary WHERE {\
                    	<" + parameters.conference.baseUri + ">    swc:isSuperEventOf    ?eventUri.\
                       ?eventUri     ical:summary 	?eventSummary.\
                    }";

                var ajaxData = {query: prefix + query, output: "json"};
                return ajaxData;
            },

            ModelCallBack: function (dataJSON, conferenceUri, datasourceUri, currentUri) {
                var JSONfile = {};
                $.each(dataJSON.results.bindings, function (i) {
                    var JSONToken = {};
                    JSONToken.uri = this.eventUri.value || null;
                    JSONToken.name = this.eventSummary.value || null;
                    JSONfile[i] = JSONToken;
                })

                //StorageManager.pushCommandToStorage(currentUri, "getAllEvents", JSONfile);
                return JSONfile;
            },

            ViewCallBack: function (parameters) {
                if (parameters.JSONdata != null) {
                    if (_.size(parameters.JSONdata) > 0) {
                        ViewAdapterText.appendList(parameters.JSONdata,
                            {
                                baseHref: '#event/',
                                hrefCllbck: function (str) {
                                    return Encoder.encode(str["name"]) + "/" + Encoder.encode(str["uri"])
                                }
                            },
                            "name",
                            parameters.contentEl,
                            {
                                type: "Node",
                                labelCllbck: function (str) {
                                    return "event : " + str["name"];
                                }
                            }
                        );
                    }
                }
            }
        },

        getAllAuthors: {
            getQuery: function (parameters) {
                return {
                    "command": "getAllAuthors",
                    "data": null
                }
            },

            ModelCallBack: function (dataJSON, conferenceUri, datasourceUri, currentUri) {
                return dataJSON ? dataJSON : null;
            },

            ViewCallBack: function (parameters) {
                if (parameters.JSONdata != null) {
                    if (_.size(parameters.JSONdata) > 0) {
                        ViewAdapterText.appendListImage(
                            parameters.JSONdata,
                            {
                                baseHref: '#person/',
                                hrefCllbck: function (str) {
                                    return Encoder.encode(str["name"]) + "/" + Encoder.encode(str.id)
                                }
                            },
                            "name",
                            "depiction",
                            parameters.contentEl,
                            {
                                type: "Node",
                                labelCllbck: function (str) {
                                    return "person : " + str.id;
                                }
                            }
                        );
                    }
                }
            }
        },

        getAllPersons: {
            getQuery: function (parameters) {
                return {
                    "command": "getAllPersons",
                    "data": null
                }
            },

            ModelCallBack: function (dataJSON, conferenceUri, datasourceUri, currentUri) {
                return dataJSON ? dataJSON : null;
            },

            ViewCallBack: function (parameters) {
                if (parameters.JSONdata != null) {
                    if (_.size(parameters.JSONdata) > 0) {
                        ViewAdapterText.appendListImage(
                            parameters.JSONdata,
                            {
                                baseHref: '#person/',
                                hrefCllbck: function (str) {
                                    return Encoder.encode(str["name"]) + "/" + Encoder.encode(str.id)
                                }
                            },
                            "name",
                            "depiction",
                            parameters.contentEl,
                            {
                                type: "Node",
                                labelCllbck: function (str) {
                                    return "person : " + str.id;
                                }
                            }
                        );
                    }
                }
            }
        },

        getAllPublications: {
            dataType: "JSONP",
            method: "GET",
            serviceUri: "",
            getQuery: function (parameters) {
                return {
                    "command": "getAllPublications",
                    "data": null
                }
            },

            ModelCallBack: function (dataJSON, conferenceUri, datasourceUri, currentUri) {
                return dataJSON ? dataJSON : null;
            },

            ViewCallBack: function (parameters) {
                if (parameters.JSONdata != null) {
                    if (_.size(parameters.JSONdata) > 0) {
                        ViewAdapterText.appendListImage(
                            parameters.JSONdata,
                            {
                                baseHref: '#publication/',
                                hrefCllbck: function (str) {
                                    return Encoder.encode(str["title"]) + "/" + Encoder.encode(str.id)
                                }
                            },
                            "title",
                            "thumbnail",
                            parameters.contentEl,
                            {
                                type: "Node",
                                labelCllbck: function (str) {
                                    return "paper : " + str.id;
                                }
                            }
                        );
                    }
                }
            }
        },

        getAllOrganizations: {
            getQuery: function (parameters) {
                return {
                    "command": "getAllOrganizations",
                    "data": null
                }
            },

            ModelCallBack: function (dataJSON, conferenceUri, datasourceUri, currentUri) {
                return dataJSON ? dataJSON : null;
            },

            ViewCallBack: function (parameters) {
                if (parameters.JSONdata != null) {
                    if (_.size(parameters.JSONdata) > 0) {
                        ViewAdapterText.appendListImage(parameters.JSONdata,
                            {
                                baseHref: '#organization/',
                                hrefCllbck: function (str) {
                                    return Encoder.encode(str["name"]) + "/" + Encoder.encode(str.id)
                                }
                            },
                            "name",
                            "depiction",
                            parameters.contentEl,
                            {
                                type: "Node",
                                labelCllbck: function (str) {
                                    return "organization : " + str.id;
                                }
                            }
                        );
                    }
                }
            }
        },

        getAllRoles: {
            getQuery: function (parameters) {
                return {
                    "command": "getAllRoles",
                    "data": null
                }
            },

            ModelCallBack: function (dataJSON, conferenceUri, datasourceUri, currentUri) {
                return dataJSON ? dataJSON : null;
            },

            ViewCallBack: function (parameters) {
                if (parameters.JSONdata != null) {
                    if (_.size(parameters.JSONdata) > 0) {
                        ViewAdapterText.appendList(parameters.JSONdata,
                            {
                                baseHref: '#person-by-role/',
                                hrefCllbck: function (str) {
                                    return Encoder.encode(str["label"]) + '/' + Encoder.encode(str.id)
                                }
                            },
                            "label",
                            parameters.contentEl,
                            {
                                type: "Node",
                                labelCllbck: function (str) {
                                    return "Role : " + str["label"];
                                }
                            }
                        );
                    }
                }
            }
        },

        getPersonsByRole: {
            getQuery: function (parameters) {
                return {
                    command: "getPersonsByRole",
                    data: {
                        key: parameters.name,
                        nestedQueries: null
                    }
                }
            },

            ModelCallBack: function (dataJSON, conferenceUri, datasourceUri, currentUri) {
                return dataJSON ? dataJSON : null;
            },

            ViewCallBack: function (parameters) {
                if (parameters.JSONdata != null) {
                    if (_.size(parameters.JSONdata) > 0) {
                        ViewAdapterText.appendListImage(
                            parameters.JSONdata,
                            {
                                baseHref: '#person/',
                                hrefCllbck: function (str) {
                                    return Encoder.encode(str["name"]) + "/" + Encoder.encode(str.id)
                                }
                            },
                            "name",
                            "depiction",
                            parameters.contentEl,
                            {
                                type: "Node",
                                labelCllbck: function (str) {
                                    return "person : " + str.id;
                                }
                            }
                        );
                    }
                }
            }
        },

        //TODO
        getAllCategories: {
            dataType: "JSONP",
            method: "GET",
            serviceUri: "",
            getQuery: function (parameters) {
                var prefix = 'PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#> PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>';
                var query = 'SELECT DISTINCT ?categoryUri  WHERE  { ' +
                    '    <' + parameters.conference.baseUri + '> swc:isSuperEventOf ?eventUri.' +
                    '    ?eventUri  rdf:type  ?categoryUri.' +
                    '} ORDER BY ASC(?categoryUri)';
                var ajaxData = {query: prefix + query, output: "json"};
                return ajaxData;
            },

            ModelCallBack: function (dataJSON, conferenceUri, datasourceUri, currentUri) {
                var JSONfile = {};
                $.each(dataJSON.results.bindings, function (i) {
                    var JSONToken = {};
                    JSONToken.name = this.categoryUri ? this.categoryUri.value : "";
                    JSONToken.uri = this.categoryUri ? this.categoryUri.value : "";
                    JSONfile[i] = JSONToken;
                });
                //console.log(JSONfile);
                //StorageManager.pushCommandToStorage(currentUri, "getAllCategories", JSONfile);
                return JSONfile;
            },

            ViewCallBack: function (parameters) {
                if (parameters.JSONdata != null) {
                    if (_.size(parameters.JSONdata) > 0) {
                        for (var i = 0; i < _.size(parameters.JSONdata); i++) {
                            var eventType = parameters.JSONdata[i];
                            if (eventType.uri != "http://data.semanticweb.org/ns/swc/ontology#ConferenceEvent") {
                                var categoryName = eventType.uri.split('#')[1];
                                ViewAdapterText.appendButton(parameters.contentEl, '#event-by-category/' + Encoder.encode(categoryName) + '/' + Encoder.encode(eventType.uri), labels[parameters.conference.lang].category[categoryName], {tiny: false});
                            }
                        }
                    }
                }
            }
        },

        /**
         * Retrieve list elements (individuals)
         */
        //TODO
        getTopic: {
            dataType: "JSONP",
            method: "GET",
            serviceUri: "",
            getQuery: function (parameters) {
                var prefix = 'PREFIX dc: <http://purl.org/dc/elements/1.1/> PREFIX ical: <http://www.w3.org/2002/12/cal/ical#> PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#> PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#> ';

                var query = 'SELECT DISTINCT ?eventUri  ?eventSummary ?publiUri ?publiTitle WHERE  {\
							 {	 <' + parameters.conference.baseUri + '> swc:isSuperEventOf ?eventUri.\
							  	?eventUri dc:subject  "' + parameters.uri + '";\
							  	ical:summary ?eventSummary.\
							 } UNION { \
							 	<' + parameters.conference.baseUri + '> swc:hasRelatedDocument ?publiUri.\
							  	?publiUri dc:subject  "' + parameters.uri + '";\
							  	 dc:title ?publiTitle. }\
							 } ';

                var ajaxData = {query: prefix + query, output: "json"};
                return ajaxData;
            },

            ModelCallBack: function (dataJSON, conferenceUri, datasourceUri, currentUri) {
                var JSONToken = {};
                var results = dataJSON.results.bindings;
                if (_.size(results) > 0) {

                    JSONToken.events = [];
                    JSONToken.made = [];
                    j = 0;
                    k = 0;
                    $.each(results, function (i, token) {
                        if (token.hasOwnProperty("eventUri")) {
                            JSONToken.events[j] = token;
                            j++;
                        }
                        if (token.hasOwnProperty("publiUri")) {
                            JSONToken.made[k] = token;
                            k++;
                        }
                    });

                }
                //console.log(JSONToken);
                //StorageManager.pushCommandToStorage(currentUri, "getTopic", JSONToken);
                return JSONToken;
            },

            ViewCallBack: function (parameters) {
                //Reasoner.getMoreSpecificKeywords();
                if (parameters.JSONdata != null) {
                    if (_.size(parameters.JSONdata) > 0) {
                        if (parameters.JSONdata.events.length > 0) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].topic.relatedEvents + '</h2>'));
                            for (var i = 0; i < parameters.JSONdata.events.length; i++) {
                                var eventtoken = parameters.JSONdata.events[i];
                                ViewAdapterText.appendButton(parameters.contentEl, '#event/' + Encoder.encode(eventtoken.eventSummary.value) + '/' + Encoder.encode(eventtoken.eventUri.value), eventtoken.eventSummary.value, {tiny: false});
                            }
                        }

                        if (parameters.JSONdata.made.length > 0) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].topic.relatedPublications + '</h2>'));
                            for (var i = 0; i < parameters.JSONdata.made.length; i++) {
                                var publication = parameters.JSONdata.made[i];
                                ViewAdapterText.appendButton(parameters.contentEl, '#publication/' + Encoder.encode(publication.publiTitle.value) + '/' + Encoder.encode(publication.publiUri.value), publication.publiTitle.value, {tiny: false});

                            }
                        }
                    }
                }
            }
        },

        //Retrieve one particular person in the DAO
        getPerson: {
            getQuery: function (parameters) {
                return {
                    "command": "getPerson",
                    "data": {
                        "key": parameters.uri,
                        "nestedQueries": [{
                            //Retrieve organizations
                            datasource: "localDatasource",
                            command: "getOrganizationLink",
                            targetProperty: "affiliation"
                        }, {
                            //Retrieve publications
                            datasource: "localDatasource",
                            command: "getPublicationLink",
                            targetProperty: "made"
                        }, {
                            //Retrieve roles
                            datasource: "localDatasource",
                            command: "getRoleLink",
                            targetProperty: "holdsRole"
                        }]
                    }
                };
            },

            ModelCallBack: function (dataJSON, conferenceUri, datasourceUri, currentUri) {
                if (_.size(dataJSON.holdsRole) >0) {
                    for(var i in dataJSON.holdsRole) {
                        var role = dataJSON.holdsRole[i];
                        //TODO: match with roleDAO properties
                        if (role.eventUri && role.eventName) {
                            role.isRoleAt = {
                                    "id": role.eventUri,
                                    "name": role.eventName
                                };
                        }
                    }
                }
                return dataJSON;
            },

            ViewCallBack: function (parameters) {
                //Reasoner.getMoreSpecificKeywords();
                if (parameters.JSONdata != null) {
                    if (_.size(parameters.JSONdata) > 0) {
                        if (parameters.JSONdata.img) {
                            parameters.contentEl.append($('<div style="min-height:50px; width:20%"><img style="width:100%;height:auto;" src="' + parameters.JSONdata.depiction + '"/></div>'));
                        }
                        if (parameters.JSONdata.name) {
                            $("[data-role = page]").find("#header-title").html(parameters.JSONdata.name);
                        }
                        if (parameters.JSONdata.description) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].person.description + '</h2>'));
                            parameters.contentEl.append($('<p>' + parameters.JSONdata.description + '</p>'));
                        }
                        if (parameters.JSONdata.websites) {
                            parameters.contentEl.append($('<h2 id="person_homepage">' + labels[parameters.conference.lang].person.websites + '</h2>'));

                            parameters.contentEl.append($('<a href=' + parameters.JSONdata.websites + '>' + parameters.JSONdata.websites + '</a>'));
                        }

                        if (_.size(parameters.JSONdata.affiliation) > 0) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].person.affiliations + '</h2>'));
                            for (var i in parameters.JSONdata.affiliation) {
                                var organization = parameters.JSONdata.affiliation[i];
                                ViewAdapterText.appendButton(parameters.contentEl, '#organization/' + Encoder.encode(organization.name) + '/' + Encoder.encode(organization.id), organization.name, {tiny: true});
                            }
                        }

                        if (_.size(parameters.JSONdata.holdsRole) > 0) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].person.holdsRole + '</h2>'));
                            for (var i in parameters.JSONdata.holdsRole) {
                                var role = parameters.JSONdata.holdsRole[i];
                                ViewAdapterText.appendButton(parameters.contentEl, '#person-by-role/' + Encoder.encode(role.label) + '/' + Encoder.encode(role.id), role.label, {tiny: true});
                                if (role.isRoleAt) {
                                    parameters.contentEl.append($(' at '));
                                    var event = role.isRoleAt;
                                    ViewAdapterText.appendButton(parameters.contentEl, '#event/' + Encoder.encode(event.name) + '/' + Encoder.encode(event.id), event.name, {tiny: true});
                                }
                            }
                        }

                        if (_.size(parameters.JSONdata.made) > 0) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].person.made + '</h2>'));
                            for (var i in parameters.JSONdata.made) {
                                var publication = parameters.JSONdata.made[i];
                                try {
                                    // LM: Should work as soon as organizations are available
                                    ViewAdapterText.appendButton(parameters.contentEl, '#publication/' + Encoder.encode(publication.title) + '/' + Encoder.encode(publication.id), publication.title, {tiny: false});
                                } catch (e) {
                                }
                            }
                        }
                    }
                }
            }
        },

        getOrganization: {
            getQuery: function (parameters) {
                return {
                    "command": "getOrganization",
                    "data": {
                        "key": parameters.uri,
                        "nestedQueries": [{
                            datasource: "localDatasource",
                            command: "getPersonLink",
                            targetProperty: "members"
                        }]
                    }
                }
            },

            ModelCallBack: function (dataJSON, conferenceUri, datasourceUri, currentUri) {
                var JSONToken = {"id": currentUri, // "@context": "http://json-ld.org/contexts/person.jsonld"
                    "name": dataJSON.name,
                    "img": dataJSON.depiction ? dataJSON.depiction : null,
                    "homepage": dataJSON.homepage ? dataJSON.homepage : null,
                    "based_near" : dataJSON.based_near ? dataJSON.based_near : null,
                    "members": dataJSON.members ? dataJSON.members : []
                };
                return JSONToken;
            },

            ViewCallBack: function (parameters) {
                //Reasoner.getMoreSpecificKeywords();
                if (parameters.JSONdata != null) {
                    if (_.size(parameters.JSONdata) > 0) {
                        if (parameters.JSONdata.orgaName) {
                            $("[data-role = page]").find("#header-title").html(parameters.JSONdata.orgaName);
                        }

                        if (parameters.JSONdata.homepage) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].organization.homepage + '</h2>'));
                            parameters.contentEl.append($('<a href=' + parameters.JSONdata.page + '>' + parameters.JSONdata.homepage + '</a>'));
                        }

                        if (parameters.JSONdata.based_near) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].organization.country + '</h2>'));
                            parameters.contentEl.append($('<p>' + parameters.JSONdata.based_near + '</p>'));
                        }

                        if (parameters.JSONdata.members.length > 0) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].organization.members + '</h2>'));
                            for (var i = 0; i < parameters.JSONdata.members.length; i++) {
                                var member = parameters.JSONdata.members[i];
                                // TODO change appendButton to "appendImage", since the person's photo may be available in member.img
                                ViewAdapterText.appendButton(parameters.contentEl, '#person/' + Encoder.encode(member.name) + '/' + Encoder.encode(member.id), member.name, {tiny: true});
                            }
                        }
                    }
                }
            }
        },

        getPublication: {
            getQuery: function (parameters) {
                return {
                    "command": "getPublication",
                    "data": {
                        "key": parameters.uri,
                        "nestedQueries": [{
                            //Retrieve authors
                            datasource: "localDatasource",
                            command: "getPersonLink",
                            targetProperty: "authors"
                        }
                           //TODO
                           //Retrieve the corresponding track of the conference
                        ]
                    }
                };
            },

            ModelCallBack: function (dataJSON, conferenceUri, datasourceUri, currentUri) {
                var JSONToken = {"id": currentUri, // "@context": "http://json-ld.org/contexts/person.jsonld"
                    "title": dataJSON.title,
                    "abstract": dataJSON.abstract,
                    "authors": dataJSON.authors,
                    "track": dataJSON.track ? dataJSON.track : null,
                    "img": dataJSON.thumbnail ? dataJSON.thumbnail : null,
                    "hashtag": dataJSON.hashtag ? dataJSON.hashtag : null
                };
                return JSONToken;
            },

            //In previous versions, it was possible to retrieve the publisher, publication date, as well as the location of the paper PDF.
            // Even if is not possible in modelCallback, I left it there, in case...
            ViewCallBack: function (parameters) {
                //Reasoner.getMoreSpecificKeywords();
                if (parameters.JSONdata != null) {
                    if (_.size(parameters.JSONdata) > 0) {
                        if (parameters.JSONdata.title) {
                            $("[data-role = page]").find("#header-title").html(parameters.JSONdata.title);
                        }
                        if (parameters.JSONdata.abstract) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].publication.abstract + '</h2>'));
                            parameters.contentEl.append($('<p>' + parameters.JSONdata.abstract + '</p>'));
                        }
                        if (parameters.JSONdata.publishDate) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].publication.publishDate + '</h2>'));
                            parameters.contentEl.append($('<p>' + parameters.JSONdata.publishDate + '</p>'));
                        }
                        if (parameters.JSONdata.url) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].publication.url + '</h2>'));
                            parameters.contentEl.append($('<a href=' + parameters.JSONdata.url + '>' + parameters.JSONdata.url + '</a>'));
                        }
                        if (parameters.JSONdata.publisher) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].publication.publishBy + '</h2>'));
                            parameters.contentEl.append($('<a href=' + parameters.JSONdata.publisher + '>' + parameters.JSONdata.publisher + '</a>'));
                        }
                        if (_.size(parameters.JSONdata.authors) > 0) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].publication.authors + '</h2>'));
                            for (var i = 0; i < parameters.JSONdata.authors.length; i++) {
                                var author = parameters.JSONdata.authors[i];
                                ViewAdapterText.appendButton(parameters.contentEl, '#person/' + Encoder.encode(author.name) + '/' + Encoder.encode(author.id), author.name, {tiny: true});
                            }
                        }
                        if (_.size(parameters.JSONdata.keywords) > 0) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].publication.topics + '</h2>'));
                            for (var i = 0; i < parameters.JSONdata.keywords.length; i++) {
                                var keyword = parameters.JSONdata.keywords[i];
                                ViewAdapterText.appendButton(parameters.contentEl, '#topic/' + Encoder.encode(keyword.keywordLabel.value) + '/' + Encoder.encode(keyword.keywordUri.value), keyword.keywordLabel.value, {tiny: true});
                            }
                        }
                        
                        //voting system
                        var tokens = parameters.JSONdata.id.split('/');
                        var id = tokens[tokens.length - 1];
                        var track = tokens[tokens.length - 2];
                        //if(track == 'demo' || track =='poster'){
                        if(track == 'research' || track == 'in-use'){
                        	parameters.contentEl.append($('<br><span><h2 style="display:inline;">Vote for best '+track.toUpperCase()+' track award</h2><img src="img/vote.gif" style="width:30px;height:30px"/></span>'));
                        	parameters.contentEl.append($('<p>Attention! You can only vote once for one demo/poster! Enter your personal code and press "Vote!" button.</p>'));
                        	parameters.contentEl.append($('<input id="personalCode" type="text" size="10" value="code"/>'));
                        	parameters.contentEl.append($('<p id="msg" style="color:red"></p>'));
                        	parameters.contentEl.append($('<button id="voteButton" data-inline="true" class="button" onclick="vote('+"'"+track+"','"+id+"'"+'); return false;">Vote!</button>'));
                        }
                    }
                }
            }
        },

        //TODO
        getEventByCategory: {
            dataType: "JSONP",
            method: "GET",
            serviceUri: "",
            getQuery: function (parameters) {
                var prefix = 'PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#> PREFIX ical: <http://www.w3.org/2002/12/cal/ical#>  PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>';
                var query = 'SELECT DISTINCT ?eventUri ?eventName WHERE  { ' +
                    '    <' + parameters.conference.baseUri + '> swc:isSuperEventOf ?eventUri.' +
                    '    ?eventUri  rdf:type  <' + parameters.uri + '>;' +
                    '    ical:summary  ?eventName.' +
                    '} ORDER BY ASC(?eventName)';
                var ajaxData = {query: prefix + query, output: "json"};
                return ajaxData;
            },

            ModelCallBack: function (dataJSON, conferenceUri, datasourceUri, currentUri) {
                var JSONfile = {};
                $.each(dataJSON.results.bindings, function (i) {
                    var JSONToken = {};
                    JSONToken.eventUri = this.eventUri ? this.eventUri.value : "";
                    JSONToken.eventName = this.eventName ? this.eventName.value : "";
                    JSONfile[i] = JSONToken;
                });
                //console.log(JSONfile);
                //StorageManager.pushCommandToStorage(currentUri, "getEventByCategory", JSONfile);
                return JSONfile;
            },

            ViewCallBack: function (parameters) {
                if (parameters.JSONdata != null) {
                    if (_.size(parameters.JSONdata) > 0) {
                        $("[data-role = page]").find("#header-title").html(labels[parameters.conference.lang].category[parameters.name]);
                        for (var i = 0; i < _.size(parameters.JSONdata); i++) {
                            var eventType = parameters.JSONdata[i];

                            ViewAdapterText.appendButton(parameters.contentEl, '#event/' + Encoder.encode(eventType.eventName) + '/' + Encoder.encode(eventType.eventUri), eventType.eventName, {tiny: false});
                        }
                    }
                }
            }
        },

        /** Command used to get the panel events of a given conference **/
        //TODO
        getConferenceEvent: {
            dataType: "JSONP",
            method: "GET",
            serviceUri: "",
            getQuery: function (parameters) {
                var prefix = 'PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#>         ' +
                    'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>               ' +
                    'PREFIX dc: <http://purl.org/dc/elements/1.1/>                      ' +
                    'PREFIX ical: <http://www.w3.org/2002/12/cal/ical#> 				' +
                    'PREFIX swrc: <http://swrc.ontoware.org/ontology#>                  ' +
                    'PREFIX foaf: <http://xmlns.com/foaf/0.1/>            		        ';

                var query = 'SELECT DISTINCT  ?eventSummary ?eventStart ?eventEnd ?eventDesc ?eventComent ?eventUrl ?eventContact ?locationUri ?locationName ?subEventSummary ?subEventUri ?roleUri ?subEventUri ?personUri ?personName ?eventTwitterWidgetUrl ?eventTwitterWidgetToken WHERE  {  ' +
                    '{ <' + parameters.uri + '>  ical:dtstart ?eventStart;' +
                    '	 ical:dtend ?eventEnd;' +
                    ' OPTIONAL {<' + parameters.uri + '> ical:description ?eventDesc.}' +
                    '	OPTIONAL {<' + parameters.uri + '>  ical:comment ?eventComent.}' +
                    '	OPTIONAL {<' + parameters.uri + '>  ical:url ?eventUrl.}' +
                    '	OPTIONAL {<' + parameters.uri + '>  ical:resources ?eventTwitterWidgetUrl.}' +
                    '	OPTIONAL {<' + parameters.uri + '>  ical:attach ?eventTwitterWidgetToken.}' +
                    '	OPTIONAL {<' + parameters.uri + '>  ical:contact ?eventContact.}' +
                    ' } UNION {	<' + parameters.uri + '>  swc:hasLocation ?locationUri. ' +
                    '   ?locationUri  rdfs:label ?locationName. ' +
                    ' }' +
                    '}';
                var ajaxData = {query: prefix + query, output: "json"};
                return ajaxData;
            },
            ModelCallBack: function (dataJSON, conferenceUri, datasourceUri, currentUri) {
                var JSONfile = {};
                var results = dataJSON.results.bindings;
                if (_.size(results) > 0) {

                    var JSONToken = {};
                    JSONfile.eventLabel = results[0].eventSummary ? results[0].eventSummary.value : null;
                    JSONfile.eventDescription = results[0].eventDesc ? results[0].eventDesc.value : null;
                    JSONfile.eventTwitterWidgetUrl = results[0].eventTwitterWidgetUrl ? results[0].eventTwitterWidgetUrl.value : null;
                    JSONfile.eventTwitterWidgetToken = results[0].eventTwitterWidgetToken ? results[0].eventTwitterWidgetToken.value : null;
                    JSONfile.eventComment = results[0].eventComent ? results[0].eventComent.value : null;
                    JSONfile.eventHomepage = results[0].eventUrl ? results[0].eventUrl.value : null;
                    JSONfile.eventStart = results[0].eventStart ? results[0].eventStart.value : null;
                    JSONfile.eventEnd = results[0].eventEnd ? results[0].eventEnd.value : null;

                    JSONfile.hasRoles = [];
                    JSONfile.locations = [];
                    j = 0;
                    k = 0;

                    $.each(results, function (i, token) {
                        if (token.hasOwnProperty("roleUri")) {
                            JSONfile.hasRoles[j] = token;
                            j++;
                        }
                        if (token.hasOwnProperty("locationUri")) {
                            JSONfile.locations[k] = token;
                            k++;
                        }
                    });
                }

                //StorageManager.pushCommandToStorage(currentUri, "getConferenceEvent", JSONfile);
                return JSONfile;
            },

            ViewCallBack: function (parameters) {
                var JSONdata = parameters.JSONdata;
                var conferenceUri = parameters.conferenceUri;

                if (parameters.JSONdata != null) {

                    var eventInfo = parameters.JSONdata;

                    if (_.size(eventInfo) > 0) {
                        if (eventInfo.eventLabel) {
                            $("[data-role = page]").find("#header-title").html(eventInfo.eventLabel);
                        }

                        if (eventInfo.eventStart && eventInfo.eventEnd) {
                            parameters.contentEl.append($('<p style="text-align:center">' + labels[parameters.conference.lang].event.from + ' ' + moment(eventInfo.eventStart).format('LLLL') + ' ' + labels[parameters.conference.lang].event.to + ' ' + moment(eventInfo.eventEnd).format('LLLL') + '</p>'));
                        }

                        if (eventInfo.eventDescription) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].conference.description + '</h2>'));
                            parameters.contentEl.append($('<p>' + eventInfo.eventDescription + '</p>'));
                        }
                        if (eventInfo.eventComment) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].conference.comment + '</h2>'));
                            parameters.contentEl.append($('<p>' + eventInfo.eventComment + '</p>'));
                        }
                        if (eventInfo.eventHomepage) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].conference.homepage + '</h2>'));
                            parameters.contentEl.append($('<a href="' + eventInfo.eventHomepage + '">' + eventInfo.eventHomepage + '</p>'));
                        }

                        // if( && eventInfo.eventStart){
                        // 	parameters.contentEl.append($('<h2>Duration : <span class="inline">'+ moment(eventInfo.eventStart).from(moment(eventInfo.eventEnd),true)+'</span></h2>'));
                        // }

                        if (_.size(parameters.JSONdata.locations) > 0) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].conference.location + '</h2>'));
                            for (var i = 0; i < parameters.JSONdata.locations.length; i++) {
                                var location = parameters.JSONdata.locations[i];
                                parameters.contentEl.append($('<p>' + location.locationName.value + '</p>'));
                            }
                            ;
                        }

                        if (eventInfo.eventTwitterWidgetToken) {
                            ViewAdapterText.appendTwitterTimeline(parameters.contentEl, eventInfo.eventTwitterWidgetToken, {});
                        }
                    }
                }
            }
        },

        /** Command used to get and display the name, the start and end time and location of a given event  **/
        //TODO
        getEvent: {
            dataType: "JSONP",
            method: "GET",
            serviceUri: "",
            getQuery: function (parameters) {

                var prefix = 'PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#>         ' +
                    'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>               ' +
                    'PREFIX dc: <http://purl.org/dc/elements/1.1/>                      ' +
                    'PREFIX ical: <http://www.w3.org/2002/12/cal/ical#> 				' +
                    'PREFIX swrc: <http://swrc.ontoware.org/ontology#>                  ' +
                    'PREFIX foaf: <http://xmlns.com/foaf/0.1/>            		        ';

                var query = 'SELECT DISTINCT  ?eventSummary ?eventStart ?eventEnd ?eventDesc ?eventComent  ?eventTwitterWidgetUrl ?eventTwitterWidgetToken ?eventUrl ?eventContact ?locationUri ?locationName ?subEventSummary ?subEventUri ?roleUri ?roleName ?personUri ?personName WHERE  {  ' +
                    ' { <' + parameters.uri + '>  ical:summary ?eventSummary; ' +
                    '	ical:dtstart ?eventStart;' +
                    '	ical:dtend ?eventEnd.' +
                    '	OPTIONAL {<' + parameters.uri + '>  ical:description ?eventDesc.}' +
                    '	OPTIONAL {<' + parameters.uri + '>  ical:comment ?eventComent.}' +
                    '	OPTIONAL {<' + parameters.uri + '>  ical:resources ?eventTwitterWidgetUrl.}' +
                    '	OPTIONAL {<' + parameters.uri + '>  ical:attach ?eventTwitterWidgetToken.}' +
                    '	OPTIONAL {<' + parameters.uri + '>  ical:url ?eventUrl.}' +
                    '	OPTIONAL {<' + parameters.uri + '>  ical:contact ?eventContact.}' +
                    ' } UNION {	<' + parameters.uri + '>  swc:hasLocation ?locationUri. ' +
                    '   ?locationUri  rdfs:label ?locationName. ' +
                    ' } UNION { ?subEventUri  swc:isSubEventOf <' + parameters.uri + '> . ' +
                    '   ?subEventUri  ical:summary ?subEventSummary.  ' +
                    ' } UNION { <' + parameters.uri + '>  swc:hasRole ?roleUri. ' +
                    '   ?roleUri  swc:heldBy ?personUri. ' +
                    '   ?roleUri  rdfs:label ?roleName. ' +
                    '	?personUri  foaf:name ?personName. }' +
                    '}';
                var ajaxData = {query: prefix + query, output: "json"};
                return ajaxData;
            },

            ModelCallBack: function (dataJSON, conferenceUri, datasourceUri, currentUri) {
                var JSONfile = {};
                var results = dataJSON.results.bindings;
                if (_.size(results) > 0) {

                    JSONfile.eventLabel = results[0].eventSummary ? results[0].eventSummary.value : null;
                    JSONfile.eventDescription = results[0].eventDesc ? results[0].eventDesc.value : null;
                    JSONfile.eventAbstract = results[0].eventComent ? results[0].eventComent.value : null;
                    JSONfile.eventHomepage = results[0].eventUrl ? results[0].eventUrl.value : null;
                    JSONfile.eventStart = results[0].eventStart ? results[0].eventStart.value : null;
                    JSONfile.eventEnd = results[0].eventEnd ? results[0].eventEnd.value : null;
                    JSONfile.eventTwitterWidgetUrl = results[0].eventTwitterWidgetUrl ? results[0].eventTwitterWidgetUrl.value : null;
                    JSONfile.eventTwitterWidgetToken = results[0].eventTwitterWidgetToken ? results[0].eventTwitterWidgetToken.value : null;

                    JSONfile.hasRoles = [];
                    JSONfile.subEvents = [];
                    JSONfile.made = [];
                    JSONfile.topics = [];
                    JSONfile.locations = [];
                    j = 0;
                    k = 0;
                    l = 0;
                    m = 0;
                    n = 0;
                    $.each(results, function (i, token) {
                        if (token.hasOwnProperty("roleUri")) {
                            if (!JSONfile.hasRoles[token.roleName.value]) {
                                JSONfile.hasRoles[token.roleName.value] = [];
                            }
                            JSONfile.hasRoles[token.roleName.value].push(token);
                        }
                        if (token.hasOwnProperty("subEventUri")) {
                            JSONfile.subEvents[k] = token;
                            k++;
                        }
                        if (token.hasOwnProperty("publiUri")) {
                            JSONfile.made[l] = token;
                            l++;
                        }
                        if (token.hasOwnProperty("topicUri")) {
                            JSONfile.topics[m] = token;
                            m++;
                        }
                        if (token.hasOwnProperty("locationUri")) {
                            JSONfile.locations[m] = token;
                            n++;
                        }
                    });
                }

                //StorageManager.pushCommandToStorage(currentUri, "getEvent", JSONfile);
                return JSONfile;

            },

            ViewCallBack: function (parameters) {
                var JSONdata = parameters.JSONdata;
                var conferenceUri = parameters.conferenceUri;

                if (parameters.JSONdata != null) {

                    var eventInfo = parameters.JSONdata;

                    if (_.size(eventInfo) > 0) {
                        if (eventInfo.eventLabel) {
                            $("[data-role = page]").find("#header-title").html(eventInfo.eventLabel);
                        }

                        if (eventInfo.eventStart) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].event.startAtLe + ' : <span class="inline">' + moment(eventInfo.eventStart).format('LLLL') + '</span></h2>'));
                            isDefined = true;
                        }
                        if (eventInfo.eventEnd) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].event.endAt + ' : <span class="inline">' + moment(eventInfo.eventEnd).format('LLLL') + '</span></h2>'));
                        }

                        if (eventInfo.eventEnd && eventInfo.eventStart) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].event.duration + ' : <span class="inline">' + moment(eventInfo.eventStart).from(moment(eventInfo.eventEnd), true) + '</span></h2>'));
                        }

                        if (_.size(parameters.JSONdata.locations) > 0) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].event.location + '</h2>'));
                            for (var i = 0; i < parameters.JSONdata.locations.length; i++) {
                                var location = parameters.JSONdata.locations[i];
                                ViewAdapterText.appendButton(parameters.contentEl, '#schedule/' + Encoder.encode(location.locationName.value), location.locationName.value, {tiny: true});
                            }
                            ;
                        }

                        if (eventInfo.eventDescription) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].event.description + '</h2>'));
                            parameters.contentEl.append($('<p>' + eventInfo.eventDescription + '</p>'));
                        }
                        if (eventInfo.eventAbstract) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].event.abstract + '</h2>'));
                            parameters.contentEl.append($('<p>' + eventInfo.eventAbstract + '</p>'));
                        }
                        if (eventInfo.eventHomepage) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].event.homepage + '</h2>'));
                            parameters.contentEl.append($('<a href="' + eventInfo.eventHomepage + '">' + eventInfo.eventHomepage + '</p>'));
                        }

                        if (parameters.JSONdata.hasRoles) {

                            for (var roleName in parameters.JSONdata.hasRoles) {
                                parameters.JSONdata.hasRoles[roleName];
                                parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].role[roleName] + '</h2>'));
                                $.each(parameters.JSONdata.hasRoles[roleName], function (i, currentPerson) {
                                    ViewAdapterText.appendButton(parameters.contentEl, '#person/' + Encoder.encode(currentPerson.personName.value) + '/' + Encoder.encode(currentPerson.personUri.value), currentPerson.personName.value, {tiny: true});
                                });
                            }
                        }

                        if (_.size(parameters.JSONdata.topics) > 0) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].event.topic + '</h2>'));
                            for (var i = 0; i < parameters.JSONdata.topics.length; i++) {
                                var topic = parameters.JSONdata.topics[i];
                                ViewAdapterText.appendButton(parameters.contentEl, '#topic/' + Encoder.encode(topic.topicName.value) + '/' + Encoder.encode(topic.topicUri.value), topic.topicName.value, {tiny: true});
                            }
                            ;
                        }

                        if (_.size(parameters.JSONdata.made) > 0) {
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].event.relatedDocument + '</h2>'));
                            for (var i = 0; i < parameters.JSONdata.made.length; i++) {
                                var publication = parameters.JSONdata.made[i];
                                ViewAdapterText.appendButton(parameters.contentEl, '#publication/' + Encoder.encode(publication.publiName.value) + '/' + Encoder.encode(publication.publiUri.value), publication.publiName.value, {tiny: true});
                            }
                            ;
                        }

                        if (_.size(parameters.JSONdata.subEvents) > 0) {
                            parameters.contentEl.append('<h2>' + labels[parameters.conference.lang].event.subEvent + '</h2>');
                            for (var i = 0; i < parameters.JSONdata.subEvents.length; i++) {
                                var subEvent = parameters.JSONdata.subEvents[i];
                                ViewAdapterText.appendButton(parameters.contentEl, '#event/' + Encoder.encode(subEvent.subEventSummary.value) + "/" + Encoder.encode(subEvent.subEventUri.value), subEvent.subEventSummary.value, {tiny: 'true'});
                            }
                            ;
                        }

                        if (eventInfo.eventTwitterWidgetToken) {
                            ViewAdapterText.appendTwitterTimeline(parameters.contentEl, eventInfo.eventTwitterWidgetToken, {});
                        }
                    }
                }
            }
        },

        /** Command used Schedule of the conf **/
        //TODO
        getConferenceSchedule: {

            dataType: "JSONP",
            method: "GET",
            serviceUri: "",
            getQuery: function (parameters) {
                var prefix = 'PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#>         ' +
                    'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>               ' +
                    'PREFIX dc: <http://purl.org/dc/elements/1.1/>                      ' +
                    'PREFIX ical: <http://www.w3.org/2002/12/cal/ical#> 				' +
                    'PREFIX swrc: <http://swrc.ontoware.org/ontology#>                  ' +
                    'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>			' +
                    'PREFIX foaf: <http://xmlns.com/foaf/0.1/>            		        ';

                var query = 'SELECT DISTINCT  ?eventUri ?eventSummary ?eventStart ?eventEnd ?eventType ?locationUri ?locationName WHERE  {  ' +
                    '  <' + parameters.conference.baseUri + '>  swc:isSuperEventOf ?eventUri. ' +
                    '	  ?eventUri ical:summary ?eventSummary;' +
                    '   ical:dtstart ?eventStart;' +
                    '   ical:dtend ?eventEnd;' +
                    '   rdf:type ?eventType.' +
                    '   OPTIONAL {?eventUri  swc:hasLocation ?locationUri. ' +
                    '   ?locationUri  rdfs:label ?locationName. }' +
                    '}ORDER BY ASC(?eventStart)';

                var ajaxData = {query: prefix + query, output: "json"};
                return ajaxData;
            },
            //Declaring the callback function to use when sending the command
            ModelCallBack: function (dataJSON, conferenceUri, datasourceUri, currentUri) {

                var JSONfile = {};
                $(dataJSON.results.bindings).each(function (i, event) {
                    //console.log(event);

                    //////////////////////////////
                    /// look for special event ///
                    //////////////////////////////
                    var currentEvent = {};
                    currentEvent.eventType = event.eventType ? event.eventType.value : "";

                    if (currentEvent.eventType != "Event" && currentEvent.eventType != "http://data.semanticweb.org/ns/swc/ontology#ConferenceEvent") {

                        //retrieve current Start Slot
                        var currentStartSlot = event.eventStart.value;
                        if (!JSONfile[currentStartSlot]) JSONfile[currentStartSlot] = {};
                        currentStartSlot = JSONfile[currentStartSlot];

                        //retrieve current End Slot
                        var currentEndSlot = event.eventEnd.value;
                        if (!currentStartSlot[currentEndSlot]) currentStartSlot[currentEndSlot] = {
                            bigEvents: {},
                            events: []
                        };
                        currentEndSlot = currentStartSlot[currentEndSlot];

                        //retrieve current eventType slot
                        if (!currentEndSlot.bigEvents[currentEvent.eventType]) currentEndSlot.bigEvents[currentEvent.eventType] = [];

                        //then push to the correct start/end slot
                        if (event.eventStart.value)
                            currentEvent.eventUri = event.eventUri ? event.eventUri.value : null;
                        currentEvent.eventLabel = event.eventSummary ? event.eventSummary.value : null;
                        //  currentEvent.eventDesc =  $(this).find("[name = eventDesc]").text();
                        currentEvent.locationLabel = event.locationName ? event.locationName.value : null;
                        currentEndSlot.bigEvents[currentEvent.eventType].push(currentEvent);
                    } else {
                        //currentEndSlot.events.push(currentEvent);
                    }
                });
                //StorageManager.pushCommandToStorage(currentUri, "getConferenceSchedule", JSONfile);
                return JSONfile;
            },

            ViewCallBack: function (parameters) {

                if (parameters.JSONdata != null) {
                    if (_.size(parameters.JSONdata) > 0) {
                        if (parameters.name != "null" && parameters.name != "")$("[data-role = page]").find("#header-title").html(parameters.name);
                        var content = $("<div data-role='collapsible-set' data-inset='false'></div>");
                        var currentDay, currentUl;
                        for (var startAt in parameters.JSONdata) {

                            //if the day has changed
                            if (currentDay != moment(startAt).format('MMMM Do YYYY')) {
                                currentCollabsible = $('<div data-role="collapsible" data-theme="d" ><h2>' + moment(startAt).format('LL') + '</h2></div>');
                                currentUl = $('<ul data-role="listview" data-inset="true" ></ul>');
                                //content.append(currentUl);
                                content.append(currentCollabsible);
                                currentCollabsible.append(currentUl);
                            }
                            currentDay = moment(startAt).format('MMMM Do YYYY');

                            var startTime = moment(startAt).format('h:mm a');

                            currentUl.append("<li data-role='list-divider' >" + labels[parameters.conference.lang].event.startAt + " " + startTime + "</li>");

                            for (var endAt in parameters.JSONdata[startAt]) {

                                var lasts = moment(startAt).from(moment(endAt), true);

                                var bigEvents = parameters.JSONdata[startAt][endAt].bigEvents;
                                if (_.size(bigEvents) > 0) {
                                    for (var eventType in bigEvents) {

                                        for (var i = 0; i < bigEvents[eventType].length; i++) {

                                            var LocationHtml = '';

                                            if (parameters.name && parameters.name != "null" && parameters.name != "") {
                                                LocationHtml = '<p>' + parameters.name + '</p>';
                                            } else {
                                                if (bigEvents[eventType][i].locationLabel) {

                                                    LocationHtml += '<p><a href="#schedule/' + Encoder.encode(bigEvents[eventType][i].locationLabel) + '" data-role="button" data-icon="search" data-inline="true">' + bigEvents[eventType][i].locationLabel + '</a></p>';
                                                }
                                            }

                                            var labelCategory = labels[parameters.conference.lang].category[bigEvents[eventType][i].eventType.split("#")[1]] || "";
                                            var newLi = $('<li data-inset="true" ></li>');
                                            var newEventlink = $('<a href="#event/' + Encoder.encode(bigEvents[eventType][i].eventLabel) + '/' + Encoder.encode(bigEvents[eventType][i].eventUri) + '">');
                                            var newLabel = $('<h3>' + bigEvents[eventType][i].eventLabel + '</h3>');
                                            var newCategory = $('<p>' + labelCategory + '</p>');
                                            var newLast = $('<p>' + labels[parameters.conference.lang].event.last + ' : <strong>' + lasts + '</strong></p>');

                                            newEventlink.append(newLabel);
                                            newEventlink.append(newCategory);
                                            newEventlink.append(newLast);
                                            newEventlink.append(LocationHtml);
                                            newLi.append(newEventlink);

                                            currentUl.append(newLi);
                                        }
                                    }
                                }
                            }
                        }
                        parameters.contentEl.append('<h2>' + labels[parameters.conference.lang].pageTitles.schedule + '</h2>');
                        parameters.contentEl.append(content);
                    }
                }
            }
        },

        /** Command used Schedule of the conf **/
        //TODO
        getWhatsNext: {

            dataType: "JSONP",
            method: "GET",
            serviceUri: "",
            getQuery: function (parameters) {

                var prefix = 'PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#>         ' +
                    'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>               ' +
                    'PREFIX dc: <http://purl.org/dc/elements/1.1/>                      ' +
                    'PREFIX ical: <http://www.w3.org/2002/12/cal/ical#> 				' +
                    'PREFIX swrc: <http://swrc.ontoware.org/ontology#>                  ' +
                    'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>			' +
                    'PREFIX foaf: <http://xmlns.com/foaf/0.1/>            		        ';

                var query = 'SELECT DISTINCT  ?eventUri ?eventSummary ?eventStart ?eventEnd ?eventType ?locationUri ?locationName WHERE  {  ' +
                    '  <' + parameters.conference.baseUri + '>  swc:isSuperEventOf ?eventUri. ' +
                    ' ?eventUri ical:summary ?eventSummary;' +
                    '	ical:dtstart ?eventStart;' +
                    '	ical:dtend ?eventEnd;' +
                    '	 rdf:type ?eventType.' +
                    '   OPTIONAL {?eventUri  swc:hasLocation ?locationUri. ' +
                    '   ?locationUri  rdfs:label ?locationName. }' +
                    '} ORDER BY ASC(?eventStart)';

                var ajaxData = {query: prefix + query, output: "json"};
                return ajaxData;
            },
            //Declaring the callback function to use when sending the command
            ModelCallBack: function (dataJSON, conferenceUri, datasourceUri, currentUri) {

                if (dataJSON.length != 0) {
                    var JSONfile = {};
                    var seenLocation = [];
                    $(dataJSON.results.bindings).each(function (i, event) {
                        //console.log(event);
                        if (event.eventStart) {
                            var now = new Date();
                            if (moment(now).isBefore(event.eventStart.value)) {
                                var currentEvent = {};
                                currentEvent.eventType = event.eventType ? event.eventType.value : "";
                                currentEvent.eventLocation = event.locationName ? event.locationName.value : "";

                                if (currentEvent.eventType != "Event" && currentEvent.eventType != "http://data.semanticweb.org/ns/swc/ontology#ConferenceEvent" && currentEvent.eventLocation != "") {

                                    //retrieve first event by location
                                    var currentLocation = event.locationName.value;
                                    if (_.indexOf(seenLocation, currentLocation) == -1) {
                                        seenLocation.push(currentLocation);
                                        JSONfile[i] = {};

                                        currentEvent.eventUri = event.eventUri ? event.eventUri.value : null;
                                        currentEvent.eventLabel = event.eventSummary ? event.eventSummary.value : null;
                                        currentEvent.eventStart = event.eventStart ? event.eventStart.value : null;
                                        currentEvent.eventEnd = event.eventEnd ? event.eventEnd.value : null;

                                        JSONfile[i].location = currentLocation;
                                        JSONfile[i].event = currentEvent;
                                    }
                                }
                            }
                        }
                    });
                    //StorageManager.pushCommandToStorage(currentUri,"getWhatsNext",JSONfile);
                    return JSONfile;
                }
                return null;
            },

            ViewCallBack: function (parameters) {
                if (parameters.JSONdata != null) {
                    if (_.size(parameters.JSONdata) > 0) {
                        $("[data-role = page]").find("#header-title").html(labels[parameters.conference.lang].pageTitles.whatsnext);

                        var content = $("<div data-role='collapsible-set' data-inset='false'></div>");
                        var currentDay, currentUl;
                        $.each(parameters.JSONdata, function (i, location) {
                            var lasts = moment(location.event.eventStart).from(moment(location.event.eventEnd), true);
                            var formatedStart = moment(location.event.eventStart).format('h:mm a')
                            currentCollabsible = $('<div data-role="collapsible" data-theme="d" ><h2>' + location.location + '</h2></div>');
                            currentUl = $('<ul data-role="listview" data-inset="true" ></ul>');
                            content.append(currentCollabsible);
                            currentCollabsible.append(currentUl);

                            currentUl.append('<li data-inset="true"  ><a href="#event/' + Encoder.encode(location.event.eventLabel) + '/' + Encoder.encode(location.event.eventUri) + '">\
							                <h3>' + location.event.eventLabel + '</h3>\
							                <p>' + location.event.eventType + '</p>\
							                <p>' + labels[parameters.conference.lang].event.startAt + ' : <strong>' + formatedStart + '</p>\
											<p>' + labels[parameters.conference.lang].event.last + ' : <strong>' + lasts + '</strong></p>\
							                </a></li>');
                        })

                        parameters.contentEl.append(content);
                    }
                }
            }
        },

        /************************** ICS   ********************************/

        /** Command used to get and display the name, the start and end time and location of a given event  **/
        //TODO
        getEventIcs: {
            dataType: "JSONP",
            method: "GET",
            serviceUri: "",
            getQuery: function (parameters) {

                var prefix = 'PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#>         ' +
                    'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>               ' +
                    'PREFIX dc: <http://purl.org/dc/elements/1.1/>                      ' +
                    'PREFIX ical: <http://www.w3.org/2002/12/cal/ical#> 				' +
                    'PREFIX swrc: <http://swrc.ontoware.org/ontology#>                  ' +
                    'PREFIX foaf: <http://xmlns.com/foaf/0.1/>            		        ';

                var query = 'SELECT DISTINCT  ?eventSummary ?eventStart ?eventEnd ?eventDesc ?eventComent  ?eventUrl ?eventContact ?locationUri ?locationName ?subEventSummary ?subEventUri ?roleUri ?roleName ?personUri ?personName WHERE  {  ' +
                    ' { <' + parameters.uri + '>  ical:summary ?eventSummary. ' +
                    '	OPTIONAL {<' + parameters.uri + '>  ical:dtstart ?eventStart.}' +
                    '	OPTIONAL {<' + parameters.uri + '>  ical:dtend ?eventEnd.}' +
                    '	OPTIONAL {<' + parameters.uri + '>  ical:description ?eventDesc.}' +
                    '	OPTIONAL {<' + parameters.uri + '>  ical:comment ?eventComent.}' +
                    '	OPTIONAL {<' + parameters.uri + '>  ical:url ?eventUrl.}' +
                    '	OPTIONAL {<' + parameters.uri + '>  ical:contact ?eventContact.}' +
                    ' } UNION {	<' + parameters.uri + '>  swc:hasLocation ?locationUri. ' +
                    '   ?locationUri  rdfs:label ?locationName. }' +
                    '}';
                var ajaxData = {query: prefix + query, output: "json"};
                return ajaxData;
            },

            ModelCallBack: function (dataJSON, conferenceUri, datasourceUri, currentUri) {
                var JSONfile = {};
                var results = dataJSON.results.bindings;
                if (_.size(results) > 0) {

                    JSONfile.eventLabel = results[0].eventSummary ? results[0].eventSummary.value : null;
                    JSONfile.eventDescription = results[0].eventDesc ? results[0].eventDesc.value : null;
                    JSONfile.eventAbstract = results[0].eventComent ? results[0].eventComent.value : null;
                    JSONfile.eventHomepage = results[0].eventUrl ? results[0].eventUrl.value : null;
                    JSONfile.eventStart = results[0].eventStart ? results[0].eventStart.value : null;
                    JSONfile.eventEnd = results[0].eventEnd ? results[0].eventEnd.value : null;
                    JSONfile.eventLocationName = "";
                    j = 0;

                    $.each(results, function (i, token) {
                        if (token.hasOwnProperty("locationUri")) {
                            JSONfile.locations += token.locationName.value;
                            i++;
                        }
                    });
                }

                //StorageManager.pushCommandToStorage(currentUri, "getEventIcs", JSONfile);
                return JSONfile;
            },

            ViewCallBack: function (parameters) {
                var JSONdata = parameters.JSONdata;
                var conferenceUri = parameters.conferenceUri;

                if (parameters.JSONdata != null) {

                    var eventInfo = parameters.JSONdata;

                    if (_.size(eventInfo) > 0) {
                        var eventLabel = eventInfo.eventLabel;
                        var eventHomepage = eventInfo.eventHomepage;
                        var eventDescription = eventInfo.eventDescription;
                        var eventAbstract = eventInfo.eventAbstract;
                        var locationName = eventInfo.eventLocationName;
                        var eventStart = eventInfo.eventStart;
                        var eventEnd = eventInfo.eventEnd;
                        var eventStartICS = moment(eventInfo.eventStart, "YYY-MM-DD HH:mm:ss").format("YYYYMMDDTHHmmss");
                        var eventEndICS = moment(eventInfo.eventEnd, "YYY-MM-DD HH:mm:ss").format("YYYYMMDDTHHmmss");
                        var icsEvent = "BEGIN:VCALENDAR\n" +
                            "VERSION:2.0\n" +
                            'PRODID: //' + parameters.conferenceUri + '//ES//EN\n' +
                            "BEGIN:VTIMEZONE\n" +
                            "TZID:Europe/Paris\n" +
                            "BEGIN:DAYLIGHT\n" +
                            "TZOFFSETFROM:+0100\n" +
                            "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU\n" +
                            "DTSTART:19810329T020000\n" +
                            "TZNAME:GMT+02:00\n" +
                            "TZOFFSETTO:+0200\n" +
                            "END:DAYLIGHT\n" +
                            "BEGIN:STANDARD\n" +
                            "TZOFFSETFROM:+0200\n" +
                            "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU\n" +
                            "DTSTART:19961027T030000\n" +
                            "TZNAME:GMT+01:00\n" +
                            "TZOFFSETTO:+0100\n" +
                            "END:STANDARD\n" +
                            "END:VTIMEZONE\n" +
                            "BEGIN:VEVENT\n" +
                            "CATEGORIES:" + eventLabel + "\n" +
                            "DTSTART;TZID=Europe/Paris:" + eventStartICS + "\n" +
                            "DTEND;TZID=Europe/Paris:" + eventEndICS + "\n" +
                            "SUMMARY:" + eventLabel + "\n" +
                            "DESCRIPTION:" + eventAbstract + "\n" +
                            "LOCATION:" + locationName + "\n" +
                            "END:VEVENT\n" +
                            "END:VCALENDAR";
                        var JSONdata = parameters.JSONdata;

                        var icsButton = $('<button data-role="button" data-inline="true" data-mini="true"><i class="fa fa-download"></i>  ' + labels[parameters.conference.lang].specialButtons.addToCal + '</button>');
                        icsButton.click(function () {
                            var blob = new Blob([icsEvent], {type: "text/calendar;charset=utf-8"});
                            saveAs(blob, "icsEvent.ics");
                        });
                        parameters.contentEl.prepend(icsButton);
                    }
                }
            }
        },

        /** Command used to get and display the name, the start and end time and location of a given event  **/
        //TODO
        getConferenceScheduleIcs: {
            dataType: "text",
            method: "GET",
            serviceUri: "schedule_event.ics?",
            getQuery: function (parameters) {
                var ajaxData = {id: parameters.conference.eventId};
                return ajaxData;
            },

            ModelCallBack: function (dataXML, conferenceUri, datasourceUri, currentUri) {
                var JSONfile = {"ics": dataXML};
                //StorageManager.pushCommandToStorage(currentUri,"getEvent",JSONfile);
                return JSONfile;
            },

            ViewCallBack: function (parameters) {
                var JSONdata = parameters.JSONdata;
                var conferenceUri = parameters.conferenceUri;

                var icsButton = $('<button data-role="button" data-inline="true"><i class="fa fa-download"></i>  Add to calendar</button>');
                icsButton.click(function () {
                    var blob = new Blob([JSONdata.ics], {type: "text/calendar;charset=utf-8"});
                    saveAs(blob, "icsEvent.ics");
                });
                $("#bonusPanel").append(icsButton);
            }
        },

        /**
         * Nested queries (no model or view callback)
         */
        getPersonLink: {
            getQuery: function (parameters) {
                return {
                    "command": "getPersonLink",
                    "data": {
                        "key": parameters.uri
                    }
                };
            }
        },

        getOrganizationLink: {
            getQuery: function (parameters) {
                return {
                    "command": "getOrganizationLink",
                    "data": {
                        "key": parameters.uri
                    }
                };
            }
        },

        getPublicationLink: {
            getQuery: function (parameters) {
                return {
                    "command": "getPublicationLink",
                    "data": {
                        "key": parameters.uri
                    }
                };
            }
        },

        getRoleLink: {
            getQuery: function (parameters) {
                return {
                    "command": "getRoleLink",
                    "data": {
                        "key": parameters.uri
                    }
                };
            }
        }
    };
    return localCommandStore;
});