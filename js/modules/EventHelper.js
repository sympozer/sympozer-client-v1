/**
 *   Copyright <c> Claude Bernard - University Lyon 1 -  2013
 *   License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing
 *   Author: Lionel MEDINI
 *   Description: Utility functions to sort events and export them as ICS
 **/
//TODO: UNDERSTAND WHY HERE I CANNOT USE 'configuration' (MODULE NAME) AND MUST USE 'appConfig' (FILE NAME), AS DONE IN OTHER MODULES!!!!!
define(['jquery', 'moment', 'labels', 'encoder', 'appConfig'], function ($, moment, labels, Encoder, config) {
    return {
        /****** Utility functions to sort the event list *****/

        /*
         * Moment.js utility that indicates how to sort events
         */
        sortByDateAsc: function (lhs, rhs) {
            return lhs > rhs ? 1 : lhs < rhs ? -1 : 0;
        },

        /*
         * Constructs a map of (moment-formatted dates; objects) from an array of objects
         * parameters: propertyName the name of a property of the objects that represent a date, in a moment.js-understandable format
         */
        constructMap: function (eventArray, propertyName) {
            var eventMap = {};
            for (var i in eventArray) {
                var event = eventArray[i];
                var formattedDate = moment(event[propertyName]).format();
                if (!eventMap[formattedDate]) {
                    eventMap[formattedDate] = [];
                }
                eventMap[formattedDate].push(event);
            }
            return eventMap;
        },

        /*
         * sorts a map of (moment-formatted dates; objects)
         */
        sortMap: function (unsortedEventMap) {
            //get the unsorted array of formatted dates
            var dateKeys = Object.getOwnPropertyNames(unsortedEventMap);

            //Sort this array
            var momentArray = [];
            for (var i in dateKeys) {
                momentArray.push(moment(dateKeys[i]));
            }

            //Reconstruct the map using the sorted array
            var sortedEventMap = {};
            momentArray.sort(this.sortByDateAsc);
            for (var j in momentArray) {
                sortedEventMap[momentArray[j].format()] = unsortedEventMap[momentArray[j].format()];
            }

            return sortedEventMap;
        },

        /*
         * Does the full job: sorts a map of (moment-formatted dates; objects), by start and end times
         */
        doubleSortEventsInArray: function (eventArray) {
            var doubleSortedEventMap = this.sortMap(this.constructMap(eventArray, "startsAt"));
            var internalArray = [];
            for (var i in doubleSortedEventMap) {
                var internalMap = this.sortMap(this.constructMap(doubleSortedEventMap[i], "endsAt"));
                for (var j in internalMap) {
                    for (var k in internalMap[j]) {
                        internalArray.push(internalMap[j][k]);
                    }
                }
            }
            return internalArray;
        },

        /**
         * Constructs a hierarchy of objects:
         * - a map of objects classified by starting dates
         * - maps of arrays classified by ending dates
         * - arrays of events
         * @params
         * eventArray array of sorted events
         */
        constructEventHierarchy: function (eventArray) {
            var eventHierarchy = {};
            for(var i in eventArray) {
                var event = eventArray[i];
                if(!event.categories || !event.categories[0]) {
                    event.categories = ["none"];
                }

                //retrieve current Start Slot
                if (!eventHierarchy[event.startsAt]) {
                    eventHierarchy[event.startsAt] = {};
                }
                var currentStartSlot = eventHierarchy[event.startsAt];

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
            return eventHierarchy;
        },

        /****** ICS export function *****/

        /**
         * Constructs a realistic ICS description of the event, that can be imported in a calendar
         * @param eventInfo event to convert
         * @returns {string} ICS description
         */
        getEventIcsDescription: function(eventInfo) {
            var homepageText = eventInfo.homepage?(" - More info at: " + eventInfo.homepage):"";

            var categoryText = "";
            for(var i in eventInfo.categories) {
                categoryText += ((i>0)?", ":"") + labels[config.conference.lang].category[eventInfo.categories[i].name];
            }

            var locationText = "";
            for(var j in eventInfo.locations) {
                locationText += ((j>0)?", ":"") + eventInfo.locations[j].name;
            }

            var eventStartICS = moment(eventInfo.startsAt, "YYYY-MM-DD HH:mm:ss").format("YYYYMMDDTHHmmss");
            var eventEndICS = moment(eventInfo.endsAt, "YYYY-MM-DD HH:mm:ss").format("YYYYMMDDTHHmmss");

            return "BEGIN:VCALENDAR\n" +
                "VERSION:2.0\n" +
                'PRODID: //' + eventInfo.name + '//ES//EN\n' +
                "BEGIN:VTIMEZONE\n" +
                "TZID:" + config.conference.timeZone.name + "\n" +
                "BEGIN:DAYLIGHT\n" +
                "TZOFFSETFROM:" + config.conference.timeZone.standardOffset + "00\n" +
                "RRULE:FREQ=YEARLY;BYMONTH=" + config.conference.timeZone.changeToDaylightMonth + ";BYDAY=-1SU\n" +
                "DTSTART:19810329T020000\n" +
                "TZNAME:GMT" + config.conference.timeZone.daylightOffset + ":00\n" +
                "TZOFFSETTO:" + config.conference.timeZone.daylightOffset + "00\n" +
                "END:DAYLIGHT\n" +
                "BEGIN:STANDARD\n" +
                "TZOFFSETFROM:" + config.conference.timeZone.daylightOffset + "00\n" +
                "RRULE:FREQ=YEARLY;BYMONTH=" + config.conference.timeZone.changeToStandardMonth + ";BYDAY=-1SU\n" +
                "DTSTART:19961027T030000\n" +
                "TZNAME:GMT" + config.conference.timeZone.standardOffset + ":00\n" +
                "TZOFFSETTO:" + config.conference.timeZone.standardOffset + "00\n" +
                "END:STANDARD\n" +
                "END:VTIMEZONE\n" +
                "BEGIN:VEVENT\n" +
                "CATEGORIES:" + categoryText + "\n" +
                "DTSTART;TZID=" + config.conference.timeZone.name + ":" + eventStartICS + "\n" +
                "DTEND;TZID=" + config.conference.timeZone.name + ":" + eventEndICS + "\n" +
                "SUMMARY:" + eventInfo.name + "\n" +
                "DESCRIPTION:" + eventInfo.description + homepageText + "\n" +
                "LOCATION:" + locationText + "\n" +
                "END:VEVENT\n" +
                "END:VCALENDAR";
        },

        renderAsSchedule: function(eventArray, arrayName, language) {
            var content = $("<div data-role='collapsible-set' data-inset='false'></div>");
            var currentDay, currentUl;
            for (var startAt in eventArray) {

                //if the day has changed
                if (!currentDay || currentDay != moment(startAt).format('MMMM Do YYYY')) {
                    var currentCollabsible = $('<div data-role="collapsible" data-theme="d" ><h2>' + moment(startAt).format('LL') + '</h2></div>');
                    currentUl = $('<ul data-role="listview" data-inset="true" ></ul>');
                    //content.append(currentUl);
                    content.append(currentCollabsible);
                    currentCollabsible.append(currentUl);
                }
                currentDay = moment(startAt).format('MMMM Do YYYY');

                var startTime = moment(startAt).format('h:mm a');

                currentUl.append("<li data-role='list-divider' >" + labels[language].event.startAt + " " + startTime + "</li>");

                for (var endAt in eventArray[startAt]) {

                    var lasts = moment(startAt).from(moment(endAt), true);

                    var bigEvents = eventArray[startAt][endAt].bigEvents;
                    for (var eventType in bigEvents) {

                        for (var i = 0; i < bigEvents[eventType].length; i++) {
                            var newEventlink = $('<a href="#event/' + Encoder.encode(bigEvents[eventType][i].name) + '/' + Encoder.encode(bigEvents[eventType][i].id) + '">');

                            var newLabel = $('<h3>' + bigEvents[eventType][i].name + '</h3>');
                            newEventlink.append(newLabel);

                            /*
                             TODO: can only be fixed if nested queries can be sent on arrays (yet only map objects), since it requires categories to be expanded
                             for(var catIndex in bigEvents[eventType][i].categories) {
                             //TODO use category name instead of splitting the URI
                             var labelCategory = labels[language].category[bigEvents[eventType][i].categories[catIndex].split("#")[1]] || "";
                             var newCategory = $('<p>' + labelCategory + '</p>');
                             newEventlink.append(newCategory);
                             }
                             */

                            var newLast = $('<p>' + labels[language].event.last + ' : <strong>' + lasts + '</strong></p>');
                            newEventlink.append(newLast);

                            var LocationHtml = '';
                            if (arrayName && arrayName != "") {
                                LocationHtml = '<p>' + arrayName + '</p>';
                            } else {
                                if (bigEvents[eventType][i].location) {

                                    LocationHtml += '<p><a href="#schedule/' + Encoder.encode(bigEvents[eventType][i].location) + '" data-role="button" data-icon="search" data-inline="true">' + bigEvents[eventType][i].location + '</a></p>';
                                }
                            }
                            newEventlink.append(LocationHtml);

                            var newLi = $('<li data-inset="true" ></li>');
                            newLi.append(newEventlink);
                            currentUl.append(newLi);
                        }
                    }
                }
            }
            return content;
        }
    };
});