/**
 * Created by Lionel on 29/01/2015.
 */
define(['localData', 'jquery'], function(localData, $) {
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
    var roleList = [];

    //Publications
    var publicationMap = {};
    var publicationLinkMap = {};
    /**
     * Populating it with information from the dataset
     * **/
    //Persons
    var personData = localData.persons;
    console.log("Retrieving all persons in DAO...");
    for(var i in personData) {
        //personMap
        var tempPerson = personData[i];
        personMap[tempPerson.id] = tempPerson;
        personLinkMap[tempPerson.id] = {
            id: tempPerson.id,
            name: tempPerson.name,
            //Assume the image, if present is stored in the www/data/images folder
            depiction: tempPerson.depiction ? "data/images/" + tempPerson.depiction : null
        };
        //personLinkMap
        if(personMap[tempPerson.id].made) {
            authorLinkMap[tempPerson.id] = personLinkMap[tempPerson.id];
        }
        //roles
        $.each(personMap[tempPerson.id].holdsRole, function(j) {
            var role = personMap[tempPerson.id].holdsRole[j];
            if(!personLinkMapByRole[role]) {
                roleList.push(role);
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

    //Returning an object with the appropriate methods
    return function(command, query) {
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
                return roleList;
            case "getPublication":
                return publicationMap[query.key];
            case "getPublicationLink":
                return publicationLinkMap[query.key];
            case "getAllPublications":
                return publicationLinkMap;
        }
    }
});