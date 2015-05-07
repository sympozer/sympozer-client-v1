/**   
*	Copyright <c> Claude Bernard - University Lyon 1 -  2013
* 	License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing 
*   Author: Lionel MEDINI(supervisor), Florian BACLE, Fiona LE PEUTREC, Benoît DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan
*   Description: This object contains method for save and pick JSON file in local storage/in a local javascript object if not supported.
*				 The method pushCommandToStorage(uri, commandName,JSONdata) checks if data doesn't exist in local storage, in that case save data JSONData in paramaters with the key,id.
*				 The method pullCommandFromStorage(uri, commandName,id) looks for the data with the Key ,id .If something exist, return the JSONFile corresponding to the key, else return undefined.
*   Version: 1.2
*   Tags:  JSON, Local Storage
**/
define(['jquery', 'underscore', 'jStorage', 'localData'], function($, _, jStorage, localData){

	var StorageManager = {
		initialize : function(parameters){
            //If no storage available, use in-memory storage for session
			if(!$.jStorage.storageAvailable()){
				this.commandStore = [];
		    }

            //Load all dataset into storage
            if(!StorageManager.get("dataset")){
                StorageManager.set("dataset", localData);
            }

            //Init configuration
			var config = StorageManager.get("configuration");
			if(!config){
				StorageManager.set("configuration", parameters);
			} else {
				if(StorageManager.get("configuration").conference != parameters.conference){
					$.jStorage.flush();
					this.initialize(parameters);
				}
			}
			this.maxSize = 500;

            //Init keywords
            if(!StorageManager.get("keywords")){
                StorageManager.set("keywords",{});
            }

            // Utility functions for serializing and parsing XML documents
            // Cross-browser XML serializer
            // Used in pushCommandToStorage when its input is an XML document
            this.serializeXml = function(xmlDoc) {
                //IE
                if (window.ActiveXObject){
                    return xmlDoc.xml;
                }
                // code for Mozilla, Firefox, Opera, etc.
                else{
                    return (new XMLSerializer()).serializeToString(xmlDoc);
                }
            };

            // XML parser from string that does not reply with a jQuery object
            // used in pullCommandFromStorage to reverse the raw innerHTML pushed when data is an XML document
            // Found this code at: http://stackoverflow.com/questions/649614/xml-parsing-of-a-variable-string-in-javascript
            this.parseXml = function(xmlStr) {
                if (typeof window.DOMParser != "undefined") {
                    return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
                } else if (typeof window.ActiveXObject != "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
                    var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
                    xmlDoc.async = "false";
                    xmlDoc.loadXML(xmlStr);
                    return xmlDoc;
                } else {
                    throw new Error("No XML parser found");
                }
            };
        },

		pushCommandToStorage : function (uri, commandName, JSONdata){
            var config = StorageManager.get("configuration");
            if(config.preferences.storage === "off")
                return;

			var dataContainer = StorageManager.get(uri);

            //Transform the data into a JSON object that is "stringify-able" and can be "de-stringify-ed"
            var storedData;
            //If the data is a document, we only push its documentElement's innerHTML, otherwise, push ends up with circular reference
            if(JSONdata.nodeName && JSONdata.nodeName ==="#document") {
                storedData = {type: "document", content: this.serializeXml(JSONdata)}
            } else {
                storedData = {type: "data", content: JSONdata};
            }

            //Store this object
            if(dataContainer != null){
				if(!dataContainer.hasOwnProperty(commandName)){
					dataContainer[commandName] = storedData;
					StorageManager.controlSize();
					StorageManager.set(uri, dataContainer);
				}
			} else {
				var newElement = {};
				newElement[commandName] = storedData;
				newElement.cpt = 0;
				StorageManager.set(uri,newElement);
			}
		},

        pullCommandFromStorage : function (uri, commandName){
            var dataContainer = StorageManager.get(uri);
            var config = StorageManager.get("configuration");
            if(config.preferences.storage == "on" && dataContainer != null && dataContainer[commandName] != null){
                dataContainer.cpt +=1;
                //De-stringify stored objects
                var retrievedObject = dataContainer[commandName];
                if(retrievedObject.type === "document") {
                    return this.parseXml(retrievedObject.content);
                } else {
                    return retrievedObject.content;
                }
            } else {
                return null;
            }
        },

        pullCommandsFromStorage : function (uri){
            var dataContainer = StorageManager.get(uri);
            var config = StorageManager.get("configuration");
            if(dataContainer != null && config.preferences.storage == "on"){
                dataContainer.cpt +=1;
                var restoredContainer = {};
                for (var key in dataContainer) {
                    if (dataContainer.hasOwnProperty(key)) {
                        restoredContainer[key] = this.pullCommandFromStorage(uri, key);
                    }
                }
                return restoredContainer;
            } else {
                return null;
            }
        },

		pushKeywordToStorage : function (keyword){
			var dataContainer = StorageManager.get("keywords");
			
			if(dataContainer != null){
				if(!dataContainer.hasOwnProperty(keyword)){
					dataContainer[keyword] = {};
					dataContainer[keyword].cpt = 0;
					dataContainer[keyword].label = keyword;
					
				}else{
					dataContainer[keyword].cpt += 1;
				}
				StorageManager.set("keywords",dataContainer);
			}
		},

		pullKeywordFromStorage : function (){
			var dataContainer = StorageManager.get("keywords");
			if(dataContainer != null){
				return keyword;
			}else{
			    return null;
			}

		},

		set : function(key,dataContainer){
			if(this.commandStore !== undefined){
				this.commandStore[key] = dataContainer;
			}else{
				$.jStorage.set(key,JSON.stringify(dataContainer));
			}
		},

		get : function(key){
			if(this.commandStore !== undefined){
				return this.commandStore[key];
			}else{
				return JSON.parse($.jStorage.get(key));
			}
		},

		controlSize : function (){
			if(this.commandStore !== undefined){
				if(_.size(this.commandStore) > this.maxSize ){
					StorageManager.initialize();
				}
			}else{
				if($.jStorage.index().length > this.maxSize ){
					$.jStorage.flush();
					StorageManager.initialize();
				}
			}
		},

        /**
         * Callback of the toggle storage button in settings panel
         * @param mode value to set
         */
		switchMode : function(mode){
			var config = StorageManager.get("configuration");
            if(mode === "off") {
                //Save the dataset
                var dataset = StorageManager.get("dataset");
                //Flush all LocalStorage
                $.jStorage.flush();
                //Restore the data
                StorageManager.set("dataset", dataset);
            }
            config.preferences.storage = mode;
            StorageManager.set("configuration", config);
            console.log( $.jStorage.get("configuration"));
		},

        getMode : function(){
			return StorageManager.get("configuration").preferences.storage;
		}
    };
	return StorageManager;
});