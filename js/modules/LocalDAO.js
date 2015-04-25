/**
 * Created by Lionel on 29/01/2015.
 */
define(['localData', 'jquery', 'encoder'], function(localData, $, encoder) {
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

    var dao ={
        /**
         * Populating it with information from the dataset
         **/
        initialize: function() {
            //Persons
            var personData = localData.persons;
            console.log("Retrieving all persons in DAO...");
            for(var i in personData) {
                //personMap
                var tempPerson = personData[i];
                //THIS IS A HACK!
                //Assume the image, if present is stored in the www/data/images folder
                tempPerson.depiction = tempPerson.depiction ? "data/images/" + tempPerson.depiction : null;

                personMap[tempPerson.id] = tempPerson;
                personLinkMap[tempPerson.id] = {
                    id: tempPerson.id,
                    name: tempPerson.name,
                    depiction: tempPerson.depiction
                };
                //personLinkMap
                if(personMap[tempPerson.id].made) {
                    authorLinkMap[tempPerson.id] = personLinkMap[tempPerson.id];
                }
                //Extracting both role map and personLinkMapByRole from person descriptions
                $.each(personMap[tempPerson.id].holdsRole, function(j) {
                    var role = personMap[tempPerson.id].holdsRole[j];
                    if(!personLinkMapByRole[role]) {
                        //Very simple role description
                        roleMap[role] = {
                            "id": encoder.encode(role),
                            "label": role
                        };
                        personLinkMapByRole[role] = [];
                    }
                    personLinkMapByRole[role].push(personLinkMap[tempPerson.id]);
                });
            }

            //Organizations
            var organizationData = localData.organizations;
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
            var publicationData = localData.publications;
            console.log("Retrieving all publications in DAO...");
            for(var k in publicationData) {
                var tempPubli = publicationData[k];
                publicationMap[tempPubli.id] = tempPubli;
                publicationLinkMap[tempPubli.id] = {
                    id: tempPubli.id,
                    title: tempPubli.title,
                    //In the ESWC2015 dataset, publication images are identified as "thumbnail"
                    thumbnail: tempPubli.thumbnail ? tempPubli.thumbnail : null
                }
            }

            //Categories
            //Must be initialized before events
            var categoryData = localData.categories;
            console.log("Retrieving all categories in DAO...");
            for(var m in categoryData) {
                var tempCategory = categoryData[m];
                categoryMap[tempCategory.id] = tempCategory;
                categoryMap[tempCategory.id].events = [];
                categoryLinkMap[tempCategory.id] = {
                    id: tempCategory.id,
                    name: tempCategory.name,
                    //Yet, no property named "thumbnail" exists, but why not...
                    thumbnail: tempCategory.thumbnail ? tempCategory.thumbnail : null
                }
            }

            //Events
            var eventData = localData.events;
            console.log("Retrieving all events in DAO...");
            for(var l in eventData) {
                var tempEvent = eventData[l];
                eventMap[tempEvent.id] = tempEvent;
                eventLinkMap[tempEvent.id] = {
                    id: tempEvent.id,
                    name: tempEvent.name,
                    //Yet, no property named "thumbnail" exists, but why not...
                    thumbnail: tempEvent.thumbnail ? tempEvent.thumbnail : null
                }
                //Add the event to the categories it refers to.
                for(var n in tempEvent.categories) {
                    var tempCategory = categoryMap[tempEvent.categories[n]];
                    tempCategory.events.push(tempEvent.id);
                }
            }

            //TODO: remove this.
            //Test if the previous functions is called once or each time...
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
                case "getEventIcs":
                    return eventMap[query.key];
                case "getEventLink":
                    return eventLinkMap[query.key];
                case "getAllEvents":
                    return eventLinkMap;
                case "getCategory":
                    return categoryMap[query.key];
                case "getCategoryLink":
                    return categoryLinkMap[query.key];
                case "getAllCategories":
                    return categoryLinkMap;
            }
        }
    }
    return dao;
});