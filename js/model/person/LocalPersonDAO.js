/**
 * Created by Lionel on 29/01/2015.
 */
define(['localData', 'person'], function( localData, person) {
    var personMap = new Map();
    var personData = localData.persons.contacts;
    for(var i in personData) {
        personMap.set(personData[i].uri, new person(
                personData[i].uri,
                personData[i].name,
                personData[i].homepageUri,
                personData[i].depiction,
                personData[i].mbox,
                personData[i].accounts,
                personData[i].affiliation,
                personData[i].made,
                personData[i].holdsRole)
        );
    }
    return personMap;
});