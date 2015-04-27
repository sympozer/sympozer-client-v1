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

        getAllEvents: {
            getQuery: function (parameters) {
                return {
                    "command": "getAllEvents",
                    "data": null
                }
            },

            ModelCallBack: function (dataJSON) {
                return dataJSON ? dataJSON : null;
            },

            ViewCallBack: function (parameters) {
                if (parameters.JSONdata != null) {
                    if (_.size(parameters.JSONdata) > 0) {
                        ViewAdapterText.appendList(parameters.JSONdata,
                            {
                                baseHref: '#event/',
                                hrefCllbck: function (str) {
                                    return Encoder.encode(str["name"]) + "/" + Encoder.encode(str.id)
                                }
                            },
                            "name",
                            parameters.contentEl,
                            {
                                type: "Node",
                                labelCllbck: function (str) {
                                    return "event : " + str.id;
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

            ModelCallBack: function (dataJSON) {
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

            ModelCallBack: function (dataJSON) {
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
            getQuery: function (parameters) {
                return {
                    "command": "getAllPublications",
                    "data": null
                }
            },

            ModelCallBack: function (dataJSON) {
                return dataJSON ? dataJSON : null;
            },

            ViewCallBack: function (parameters) {
                if (parameters.JSONdata != null) {
                    if (_.size(parameters.JSONdata) > 0) {
                        ViewAdapterText.appendList(
                            parameters.JSONdata,
                            {
                                baseHref: '#publication/',
                                hrefCllbck: function (str) {
                                    return Encoder.encode(str["title"]) + "/" + Encoder.encode(str.id)
                                }
                            },
                            "title",
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

            ModelCallBack: function (dataJSON) {
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
                };
            },

            ModelCallBack: function (dataJSON) {
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

            ModelCallBack: function (dataJSON) {
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

        getAllCategories: {
            getQuery: function (parameters) {
                return {
                    "command": "getAllCategories",
                    "data": null
                };
            },

            ModelCallBack: function (dataJSON) {
                return dataJSON ? dataJSON : null;
            },

            ViewCallBack: function (parameters) {
                if (parameters.JSONdata != null) {
                    if (_.size(parameters.JSONdata) > 0) {
                        for (var i in parameters.JSONdata) {
                            var category = parameters.JSONdata[i];
                            if (category.id != "http://data.semanticweb.org/ns/swc/ontology#ConferenceEvent") {
                                ViewAdapterText.appendButton(parameters.contentEl, '#event-by-category/' + Encoder.encode(category.name) + '/' + Encoder.encode(category.id), labels[parameters.conference.lang].category[category.name], {tiny: false});
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

            ModelCallBack: function (dataJSON) {
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

            ModelCallBack: function (dataJSON) {
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
                        if (parameters.JSONdata.depiction) {
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
                            parameters.contentEl.append($('<h2 id="person_homepage">' + labels[parameters.conference.lang].person.homepage + '</h2>'));

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

            ModelCallBack: function (dataJSON) {
                return dataJSON?dataJSON:null;
            },

            ViewCallBack: function (parameters) {
                //Reasoner.getMoreSpecificKeywords();
                if (parameters.JSONdata != null) {
                    if (_.size(parameters.JSONdata) > 0) {
                        if (parameters.JSONdata.name) {
                            $("[data-role = page]").find("#header-title").html(parameters.JSONdata.name);
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

            ModelCallBack: function (dataJSON) {
                return dataJSON?dataJSON:null;
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
                        if (parameters.JSONdata.thumbnail) {
                            parameters.contentEl.append($('<div style="min-height:50px; width:20%"><img style="width:100%;height:auto;" src="' + parameters.JSONdata.thumbnail + '"/></div>'));
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
                        	parameters.contentEl.append($('<br><span><h2 style="display:inline;">Vote for best demo track</h2><img src="img/vote.gif" style="width:30px;height:30px"/></span>'));
                        	parameters.contentEl.append($('<p>Attention! You can only vote once for one demo/poster! Enter your personal code and press "Vote!" button.</p>'));
                        	parameters.contentEl.append($('<input id="personalCode" type="text" size="10" value="code"/>'));
                        	parameters.contentEl.append($('<p id="msg" style="color:red"></p>'));
                        	parameters.contentEl.append($('<button id="voteButton" data-inline="true" class="button" onclick="vote('+"'"+track+"','"+id+"'"+'); return false;">Vote!</button>'));
                        }
                    }
                }
            }
        },

        getCategory: {
            getQuery: function (parameters) {
                return {
                    "command": "getCategory",
                    "data": {
                        "key": parameters.uri,
                        "nestedQueries": [{
                            datasource: "localDatasource",
                            command: "getEventLink",
                            targetProperty: "events"
                        }]
                    }
                };
            },

            ModelCallBack: function (dataJSON) {
                return dataJSON?dataJSON:null;
            },

            ViewCallBack: function (parameters) {
                if (_.size(parameters.JSONdata) > 0) {
                    $("[data-role = page]").find("#header-title").html(labels[parameters.conference.lang].category[parameters.JSONdata.name] + " events");
                    for (var i in parameters.JSONdata.events) {
                        var event = parameters.JSONdata.events[i];
                        ViewAdapterText.appendButton(parameters.contentEl, '#event/' + Encoder.encode(event.name) + '/' + Encoder.encode(event.id), event.name, {tiny: false});
                    }
                }
            }
        },

        /** Command used to get the panel events of a given conference **/
        getConferenceEvent: {
            getQuery: function (parameters) {
                return {
                    "command": "getConferenceEvent",
                    "data": {
                        "key": parameters.uri,
                        "nestedQueries": null /*[
                        {
                            datasource: "localDatasource",
                            command: "getEventLink",
                            targetProperty: "children"
                        }]*/
                    }
                };
            },

            ModelCallBack: function (dataJSON) {
                return dataJSON?dataJSON:null;
            },

            ViewCallBack: function (parameters) {
                var eventInfo = parameters.JSONdata;
                if (_.size(eventInfo) > 0) {
                    if (eventInfo.name) {
                        $("[data-role = page]").find("#header-title").html(labels[parameters.conference.lang].pageTitles.welcomeStart + ' ' + eventInfo.name + ' ' + labels[parameters.conference.lang].pageTitles.welcomeEnd);
//                        $("[data-role = page]").find("#header-title").html(eventInfo.name);
                    }

                    if (eventInfo.description) {
                        parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].event.description + '</h2>'));
                        parameters.contentEl.append($('<p>' + eventInfo.description + '</p>'));
                    }

                    if (eventInfo.homepage) {
                        parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].event.homepage + '</h2>'));
                        parameters.contentEl.append($('<a href="' + eventInfo.eventHomepage + '">' + eventInfo.homepage + '</a>'));
                    }

                    if (eventInfo.twitterWidgetToken) {
                        ViewAdapterText.appendTwitterTimeline(parameters.contentEl, eventInfo.twitterWidgetToken, {});
                    }

                    if (eventInfo.startsAt) {
                        parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].event.startAtLe + ' : <span class="inline">' + moment(eventInfo.startsAt).format('LLLL') + '</span></h2>'));
                    }

                    if (eventInfo.endsAt) {
                        parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].event.endAt + ' : <span class="inline">' + moment(eventInfo.endsAt).format('LLLL') + '</span></h2>'));
                    }

//                    TODO: Twitter widget
//                    parameters.contentEl.append('<div id="block-twitter-block-1" class="block block-twitter-block clearfix"><div class="content"><a href="https://twitter.com/" class="twitter-timeline" data-widget-id="373072714841333760" data-chrome="nofooter" data-aria-polite="polite">Tweets by </a></div></div>');

                    //TODO: see if we keep this one
/*
                    if (_.size(eventInfo.children) > 0) {
                        parameters.contentEl.append('<h2>' + labels[parameters.conference.lang].event.subEvent + '</h2>');
                        for (var i = 0; i < eventInfo.children.length; i++) {
                            var subEvent = eventInfo.children[i];
                            ViewAdapterText.appendButton(parameters.contentEl, '#event/' + Encoder.encode(subEvent.name) + "/" + Encoder.encode(subEvent.id), subEvent.name, {tiny: 'true'});
                        }
                    }
*/
                }
            }
        },

        /** Command used to get and display the name, the start and end time and location of a given event  **/
        getEvent: {
            getQuery: function (parameters) {
                return {
                    "command": "getEvent",
                    "data": {
                        "key": parameters.uri,
                        "nestedQueries": [{
                            datasource: "localDatasource",
                            command: "getRoleLink",
                            targetProperty: "roles"
                        }, {
                            datasource: "localDatasource",
                            command: "getEventLink",
                            targetProperty: "children"
                        }, {
                            datasource: "localDatasource",
                            command: "getEventLink",
                            targetProperty: "parent"
                        }, {
                            datasource: "localDatasource",
                            command: "getPublicationLink",
                            targetProperty: "papers"
                        }, {
                            datasource: "localDatasource",
                            command: "getCategoryLink",
                            targetProperty: "categories"
                        }, {
                            datasource: "localDatasource",
                            command: "getLocationLink",
                            targetProperty: "location"
                        }]
                    }
                };
            },

            ModelCallBack: function (dataJSON) {
                dataJSON.locations = dataJSON.locations?dataJSON.locations:null;
                return dataJSON;
            },

            ViewCallBack: function (parameters) {
                var eventInfo = parameters.JSONdata;
                if (_.size(eventInfo) > 0) {
                    if (_.size(eventInfo.categories) > 0) {
                        $("[data-role = page]").find("#header-title").html(labels[parameters.conference.lang].category[eventInfo.categories[0].name] + ': ');
                    }

                    if (eventInfo.name) {
                        $("[data-role = page]").find("#header-title").append(eventInfo.name);
                    }

                    if (eventInfo.description) {
                        parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].event.description + '</h2>'));
                        parameters.contentEl.append($('<p>' + eventInfo.description + '</p>'));
                    }

                    if (eventInfo.homepage) {
                        parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].event.homepage + '</h2>'));
                        parameters.contentEl.append($('<a href="' + eventInfo.eventHomepage + '">' + eventInfo.homepage + '</a>'));
                    }

                    if (eventInfo.twitterWidgetToken) {
                        ViewAdapterText.appendTwitterTimeline(parameters.contentEl, eventInfo.twitterWidgetToken, {});
                    }

                    if (eventInfo.startsAt) {
                        parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].event.startAtLe + ' : <span class="inline">' + moment(eventInfo.startsAt).format('LLLL') + '</span></h2>'));
                    }
                    if (eventInfo.endsAt) {
                        parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].event.endAt + ' : <span class="inline">' + moment(eventInfo.endsAt).format('LLLL') + '</span></h2>'));
                    }

                    if (eventInfo.startsAt && eventInfo.endsAt) {
                        parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].event.duration + ' : <span class="inline">' + moment(eventInfo.startsAt).from(moment(eventInfo.endsAt), true) + '</span></h2>'));
                    }

                    if (_.size(eventInfo.locations) > 0) {
                        parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].event.location + '</h2>'));
                        for (var i = 0; i < eventInfo.locations.length; i++) {
                            var location = eventInfo.locations[i];
                            ViewAdapterText.appendButton(parameters.contentEl, '#schedule/' + Encoder.encode(location.name), location.name, {tiny: true});
                        }
                    }

                    //TODO change that and classify by role names
                    if (eventInfo.roles) {
                        for (var roleName in eventInfo.roles) {
                            var role = eventInfo.roles[roleName];
                            parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].role[roleName] + '</h2>'));
                            $.each(eventInfo.roles[roleName], function (i, currentPerson) {
                                ViewAdapterText.appendButton(parameters.contentEl, '#person/' + Encoder.encode(currentPerson.person.name) + '/' + Encoder.encode(currentPerson.person.id), currentPerson.person.name, {tiny: true});
                            });
                        }
                    }

                    if (_.size(eventInfo.topics) > 0) {
                        parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].event.topic + '</h2>'));
                        for (var i = 0; i < eventInfo.topics.length; i++) {
                            var topic = eventInfo.topics[i];
                            ViewAdapterText.appendButton(parameters.contentEl, '#topic/' + Encoder.encode(topic) + '/' + Encoder.encode(topic), topic, {tiny: true});
                        }
                    }

                    if (_.size(eventInfo.papers) > 0) {
                        parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].publication.allPublication + '</h2>'));
                        for (var i = 0; i < eventInfo.papers.length; i++) {
                            var publication = eventInfo.papers[i];
                            ViewAdapterText.appendButton(parameters.contentEl, '#publication/' + Encoder.encode(publication.title) + '/' + Encoder.encode(publication.id), publication.title, {tiny: true});
                        }
                    }

                    if (eventInfo.parent) {
                        parameters.contentEl.append('<h2>' + labels[parameters.conference.lang].event.parentEvent + '</h2>');
                            ViewAdapterText.appendButton(parameters.contentEl, '#event/' + Encoder.encode(eventInfo.parent.name) + "/" + Encoder.encode(eventInfo.parent.id), eventInfo.parent.name, {tiny: 'true'});
                    }

                    if (_.size(eventInfo.children) > 0) {
                        parameters.contentEl.append('<h2>' + labels[parameters.conference.lang].event.subEvent + '</h2>');
                        for (var i = 0; i < eventInfo.children.length; i++) {
                            var subEvent = eventInfo.children[i];
                            ViewAdapterText.appendButton(parameters.contentEl, '#event/' + Encoder.encode(subEvent.name) + "/" + Encoder.encode(subEvent.id), subEvent.name, {tiny: 'true'});
                        }
                    }

                    if (_.size(eventInfo.resources) > 0) {
                        parameters.contentEl.append($('<h2>' + labels[parameters.conference.lang].event.relatedDocument + '</h2>'));
                        for (var i = 0; i < eventInfo.resources.length; i++) {
                            var resource = eventInfo.resources[i];
                            parameters.contentEl.append($('<a href="' + resource + '">' + resource + '</a>'));                        }
                    }
                }
            }
        },

        /** Command used Schedule of the conf **/
        //TODO
        getConferenceSchedule: {
            //Retrieves the first level events (direct children of the conference event)
            //TODO see if it is not better to retrieve session events (since they are "sub-track events", scheduled on one particular day od half-day)
            getQuery: function (parameters) {
                return {
                    "command": "getConferenceSchedule",
                    "data": null
                }
            },
            //Here we need to sort the events
            ModelCallBack: function (dataJSON) {

                var JSONfile = {};
                for(var i in dataJSON) {
                    var event = dataJSON[i];
                    if(!event.categories || !event.categories[0]) {
                        event.categories = ["none"];
                    }

                    //retrieve current Start Slot
                    if (!JSONfile[event.startsAt]) {
                        JSONfile[event.startsAt] = {};
                    }
                    var currentStartSlot = JSONfile[event.startsAt];

                    //retrieve current End Slot
                    if (!currentStartSlot[event.endsAt]) {
                        currentStartSlot[event.endsAt] = {
                            bigEvents: {},
                            events: []
                        };
                    }
                    var currentEndSlot = currentStartSlot[event.endsAt];

                    //retrieve current eventType slot
                    if (!currentEndSlot.bigEvents[event.categories[0]]) {
                        currentEndSlot.bigEvents[event.categories[0]] = [];
                    }

                    //then push to the correct start/end slot
                    currentEndSlot.bigEvents[event.categories[0]].push(event);
                }
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
                                var currentCollabsible = $('<div data-role="collapsible" data-theme="d" ><h2>' + moment(startAt).format('LL') + '</h2></div>');
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
                                                if (bigEvents[eventType][i].location) {

                                                    LocationHtml += '<p><a href="#schedule/' + Encoder.encode(bigEvents[eventType][i].location) + '" data-role="button" data-icon="search" data-inline="true">' + bigEvents[eventType][i].location + '</a></p>';
                                                }
                                            }

                                            //TODO use category name instead of splitting the URI
                                            var labelCategory = labels[parameters.conference.lang].category[bigEvents[eventType][i].categories[0].split("#")[1]] || "";
                                            var newLi = $('<li data-inset="true" ></li>');
                                            var newEventlink = $('<a href="#event/' + Encoder.encode(bigEvents[eventType][i].name) + '/' + Encoder.encode(bigEvents[eventType][i].id) + '">');
                                            var newLabel = $('<h3>' + bigEvents[eventType][i].name + '</h3>');
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
        getEventIcs: {
            getQuery: function (parameters) {
                return {
                    "command": "getEvent",
                    "data": {
                        "key": parameters.uri,
                        "nestedQueries": [{
                            datasource: "localDatasource",
                            command: "getCategoryLink",
                            targetProperty: "categories"
                        }, {
                            datasource: "localDatasource",
                            command: "getLocationLink",
                            targetProperty: "location"
                        }]
                    }
                };
            },

            ModelCallBack: function (dataJSON) {
                return dataJSON?dataJSON:null;
            },

            ViewCallBack: function (parameters) {
                if (parameters.JSONdata != null) {
                    var eventInfo = parameters.JSONdata;

                    if (_.size(eventInfo) > 0) {
                        var categoryText = "";
                        for(var i in eventInfo.categories) {
                            categoryText += ((i>0)?", ":"") + labels[parameters.conference.lang].category[eventInfo.categories[i].name];
                        }
                        var homepageText = eventInfo.homepage?(" - More info at: " + eventInfo.homepage):"";

                        var locationText = "";
                        for(var j in eventInfo.locations) {
                            locationText += (i>0)?", ":"" + eventInfo.locations[j].name;
                        }

                        var eventStartICS = moment(eventInfo.startsAt, "YYYY-MM-DD HH:mm:ss").format("YYYYMMDDTHHmmss");
                        var eventEndICS = moment(eventInfo.endsAt, "YYYY-MM-DD HH:mm:ss").format("YYYYMMDDTHHmmss");
                        var icsEvent = "BEGIN:VCALENDAR\n" +
                            "VERSION:2.0\n" +
                            'PRODID: //' + eventInfo.name + '//ES//EN\n' +
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
                            "CATEGORIES:" + categoryText + "\n" +
                            "DTSTART;TZID=Europe/Paris:" + eventStartICS + "\n" +
                            "DTEND;TZID=Europe/Paris:" + eventEndICS + "\n" +
                            "SUMMARY:" + eventInfo.name + "\n" +
                            "DESCRIPTION:" + eventInfo.description + homepageText + "\n" +
                            "LOCATION:" + locationText + "\n" +
                            "END:VEVENT\n" +
                            "END:VCALENDAR";

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
        //TODO: modify to have a request that contains the list of event ICS and allow their importation in 1 button
        // getQuery and modelCallback should be OK, viewCallback and DAO must be modified.
        getConferenceScheduleIcs: {
            getQuery: function () {
                return {
                    "command": "getConferenceScheduleIcs",
                    "data": null
                };
            },

            ModelCallBack: function (dataXML) {
                return dataXML?dataXML:null;
            },

            ViewCallBack: function (parameters) {
                var JSONdata = parameters.JSONdata;

                var icsButton = $('<button data-role="button" data-inline="true"><i class="fa fa-download"></i> Add all conference events to your calendar!</button>');
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
        },

        getCategoryLink: {
            getQuery: function (parameters) {
                return {
                    "command": "getCategoryLink",
                    "data": {
                        "key": parameters.uri
                    }
                };
            }
        },

        getEventLink: {
            getQuery: function (parameters) {
                return {
                    "command": "getEventLink",
                    "data": {
                        "key": parameters.uri
                    }
                };
            }
        },

        //TODO
        getLocationLink: {
            getQuery: function () {
                return null;
            }
        }
    };
    return localCommandStore;
});