/**
 * Created by Lionel on 29/01/2015.
 */
define(['localData', 'jquery', 'underscore', 'encoder', 'eventHelper', 'configuration'], function(localData, $, _, encoder, eventHelper, config) {
    /**
     * Creating internal DAO objects
     */
    //Persons
    var personMap = {}; //Global map, containing all person data
    var personLinkMap = {}; //Map containing only data necessary for displaying person list
    var authorLinkMap = {}; //Same thing only for persons who made a publication
    var personLinkMapByRole = {}; //several maps, according to the holdsRole property

    //Organizations
    var organizationMap = {}; //Global and complete map
    var organizationLinkMap = {}; // Restricted map (cf. personLinkMap)

    //Roles
    var roleMap = {};

    //Publications
    var publicationMap = {};
    var publicationLinkMap = {};

    //Categories
    var categoryMap = {};
    var categoryLinkMap = {};

    //Events
    var eventMap = {};
    var eventLinkMap = {};
    var presentationEventLinkMap = {};

    //Conference schedule (ordered)
    var confScheduleList = [];

    //Locations
    var locationLinkMap = {};

    return {
        /**
         * Populating it with information from the dataset
         **/
        initialize: function() {
            //Persons
            var personData = localData.persons.sort(function (a, b) {
                if (a.name > b.name)
                    return 1;
                if (a.name < b.name)
                    return -1;
                return 0;
            });
            console.log("Retrieving all persons in DAO...");
            for(var i in personData) {
                var tempPerson = personData[i];
                //Quick & dirty!
                //Assume the image, if present is stored in the www/data/images folder
                tempPerson.depiction = tempPerson.depiction ? "data/images/" + tempPerson.depiction : null;

                var tempPersonLink = {
                    id: tempPerson.id,
                    name: tempPerson.name,
                    depiction: tempPerson.depiction
                };

                //personMap
                personMap[tempPerson.id] = tempPerson;
                //personLinkMap
                personLinkMap[tempPerson.id] = tempPersonLink;
                //authorLinkMap
                if(tempPerson.made) {
                    authorLinkMap[tempPerson.id] = personLinkMap[tempPerson.id];
                }

                //Extract both role map and personLinkMapByRole from person descriptions
                $.each(tempPerson.holdsRole, function(j) {
                    var role = tempPerson.holdsRole[j];
                    if(!personLinkMapByRole[role]) {
                        //Very simple role description
                        roleMap[role] = {
                            "id": encoder.encode(role),
                            "label": role
                        };
                        personLinkMapByRole[role] = [];
                    }
                    personLinkMapByRole[role].push(tempPersonLink);
                });
            }

            //Organizations
            var organizationData = localData.organizations.sort(function (a, b) {
                if (a.label > b.label)
                    return 1;
                if (a.label < b.label)
                    return -1;
                return 0;
            });
            console.log("Retrieving all organizations in DAO...");
            for(var j in organizationData) {
                var tempOrga = organizationData[j];
                //Little hack: in some datasets, organizations have a label and in others, they have a name.
                if(tempOrga.label && ! tempOrga.name) {
                    tempOrga.name = tempOrga.label;
                }
                organizationMap[tempOrga.id] = tempOrga;
                organizationLinkMap[tempOrga.id] = {
                    id: tempOrga.id,
                    name: tempOrga.name,
                    depiction: tempOrga.depiction
                }
            }

            //Publications
            var publicationData = localData.publications.sort(function (a, b) {
                if (a.title > b.title)
                    return 1;
                if (a.title < b.title)
                    return -1;
                return 0;
            });
            console.log("Retrieving all publications in DAO...");
            for(var k in publicationData) {
                var tempPubli = publicationData[k];
                //THIS IS A HACK!
                //Assume the image, if present is stored in the www/data/images folder
                tempPubli.thumbnail = tempPubli.thumbnail ? "data/images/" + tempPubli.thumbnail : null;
                publicationMap[tempPubli.id] = tempPubli;
                publicationLinkMap[tempPubli.id] = {
                    id: tempPubli.id,
                    title: tempPubli.title,
                    //In the ESWC2015 dataset, publication images are identified as "thumbnail"
                    thumbnail: tempPubli.thumbnail ? tempPubli.thumbnail : null
                }
            }

            //Locations
            var locationData = localData.locations.sort(function (a, b) {
                if (a.name > b.name)
                    return 1;
                if (a.name < b.name)
                    return -1;
                return 0;
            });
            console.log("Retrieving all locations in DAO...");
            for(var o in locationData) {
                var tempLocation = locationData[o];
                locationLinkMap[tempLocation.id] = tempLocation;
            }

            //Categories (1/2)
            //Must be initialized before events
            //Construct and sort a map of all categories
            var categoryData = localData.categories.sort(function (a, b) {
                if (a.name > b.name)
                    return 1;
                if (a.name < b.name)
                    return -1;
                return 0;
            });
            console.log("Retrieving all categories in DAO...");
            for(var m in categoryData) {
                var tempCategory = categoryData[m];
                categoryMap[tempCategory.id] = tempCategory;
                categoryMap[tempCategory.id].events = [];
            }

            //Events
            var eventData = localData.events.sort(function (a, b) {
                if (a.name > b.name)
                    return 1;
                if (a.name < b.name)
                    return -1;
                return 0;
            });
            var tempEventList = []; // unordered event list from the DAO
            console.log("Retrieving all events in DAO...");
            for(var l in eventData) {
                var tempEvent = eventData[l];
                var tempEventLink = {
                    id: tempEvent.id,
                    name: tempEvent.name,
                    //Yet, no property named "thumbnail" exists, but why not...
                    thumbnail: tempEvent.thumbnail ? tempEvent.thumbnail : null,
                    startsAt: tempEvent.startsAt,
                    endsAt: tempEvent.endsAt,
                    location: _.size(tempEvent.locations)>0?locationLinkMap[tempEvent.locations[0]].name:null,
                    //To construct the presentationEventLinkMap and further use...
                    isPresentationEvent: function() {
                        for(var i in tempEvent.categories) {
                            return (tempEvent.categories[i] == config.app.presentationEventCategory);
                        }
                        return false;
                    },
                    //Search for the main category of the event (i.e. other than presentation)
                    //Must not be called before eventMap is completely initialized
                    getCategoryHierarchy: function() {
                        var hierarchy = [];
                        var relatedEvent = eventMap[this.id];
                        $.each(relatedEvent.categories, function(i) {
                            hierarchy.push(relatedEvent.categories[i]);
                        });
                        if(relatedEvent.parent) {
                            var relatedEventParent = eventLinkMap[relatedEvent.parent.id?relatedEvent.parent.id:relatedEvent.parent];
                            var parentCategories = relatedEventParent.getCategoryHierarchy();
                            $.each(parentCategories, function(i) {
                                hierarchy.push(parentCategories[i]);
                            });
                        }
                        return hierarchy;
                    }
                };

                //Push into the corresponding maps
                eventMap[tempEvent.id] = tempEvent;
                eventLinkMap[tempEvent.id] = tempEventLink;
                if(tempEventLink.isPresentationEvent()) {
                    presentationEventLinkMap[tempEvent.id] = tempEventLink;
                }

                //Add the event to the categories it refers to.
                for(var n in tempEvent.categories) {
                     var tempCategoryMap = categoryMap[tempEvent.categories[n]];
                    tempCategoryMap.events.push(tempEvent.id);
                }

                //Get main events (direct children of the conference)
                if(tempEvent.parent === config.conference.baseUri) {
                    tempEventList.push(tempEventLink);
                }
            }
            //Sort events according to start and end dates
            confScheduleList = eventHelper.doubleSortEventsInArray(tempEventList);

            //Categories (2/2)
            //Remove unused categories
            for(var p in categoryMap) {
                var tempCategory = categoryMap[p];
                if(tempCategory.events.length == 0) {
                    categoryMap[p] = undefined;
                } else {
                    categoryLinkMap[p] = {
                        id: p,
                        name: tempCategory.name,
                        //Yet, no property named "thumbnail" exists, but why not...
                        thumbnail: tempCategory.thumbnail ? tempCategory.thumbnail : null
                    }
                }
            }

            //TODO: remove this.
            console.log("DAO INITIALIZATION FINISHED");
        },
        /**
         * Responding to queries
         */
        query: function(command, query) {
            //Returning an object with the appropriate methods
            switch(command) {
                case "getPerson":
                    return personMap[query.key];
                case "getPersonLink":
                    return personLinkMap[query.key];
                case "getAllPersons":
                    return personLinkMap;
                case "getAllAuthors":
                    return authorLinkMap;
                case "getPersonsByRole":
                    return personLinkMapByRole[query.key];
                case "getOrganization":
                    return organizationMap[query.key];
                case "getOrganizationLink":
                    return organizationLinkMap[query.key];
                case "getAllOrganizations":
                    return organizationLinkMap;
                case "getAllRoles":
                    return roleMap;
                case "getRole":
                    return roleMap[query.key];
                //For the moment, it's the same thing, since we haven't role complete descriptions.
                case "getRoleLink":
                    return roleMap[query.key];
                case "getPublication":
                    return publicationMap[query.key];
                case "getPublicationLink":
                    return publicationLinkMap[query.key];
                case "getAllPublications":
                    return publicationLinkMap;
                case "getEvent":
                    return eventMap[query.key];
                case "getConferenceEvent":
                    return eventMap[query.key];
                case "getEventIcs":
                    return eventMap[query.key];
                case "getEventLink":
/*
                    var eventLink = eventLinkMap[query.key];
                    if(eventLink && !eventLink.mainCategory) {
                        eventLink.mainCategory = eventLink.getCategoryHierarchy();
                        //remove complicated processing
                        eventLink.getCategoryHierarchy = undefined;
                    }
*/
                    return eventLinkMap[query.key];
                case "getAllEvents":
                    return eventLinkMap;
                case "getCategory":
                    return categoryMap[query.key];
                case "getCategoryLink":
                    return categoryLinkMap[query.key];
                case "getAllCategories":
                    return categoryLinkMap;
                case "getConferenceSchedule":
                    return confScheduleList;
                //Only need the event URIs, as the ICS will be calculated in the model callback
                case "getConferenceScheduleIcs":
                    return Object.keys(eventLinkMap);
                case "getWhatsNext":
                    return confScheduleList;
                case "getAllLocations":
                    return locationLinkMap;
                case "getLocationLink":
                    return locationLinkMap[query.key];
                default:
                    return null;
            }
        }
    };
});