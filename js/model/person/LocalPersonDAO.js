/**
 * Created by Lionel on 29/01/2015.
 */
define(['localData', 'person'], function( localData, person) {
    //Creating DAO instance
    var personMap = {};
    var personKeys = [];

    //Populating it with information from the dataset
    var personData = localData.persons.contacts;
    console.log("Retrieveing all persons in personDAO...");
    for(var i in personData) {
        personMap[personData[i].uri] = new person(
                personData[i].uri,
                personData[i].name,
                personData[i].homepageUri,
                personData[i].depiction,
                personData[i].mbox,
                personData[i].accounts,
                personData[i].affiliation,
                personData[i].made,
                personData[i].holdsRole);
        personKeys[i] = personData[i].uri;
    }

    //Returning an object with the appropriate methods
    return {
        getPerson: function(key) {
            return personMap[key];
        },
        getAllPersons: function() {
            return personKeys;
        }
    }
});