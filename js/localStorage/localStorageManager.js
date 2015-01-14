/**   
*	Copyright <c> Claude Bernard - University Lyon 1 -  2013
* 	License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing 
*   Author: Lionel MEDINI(supervisor), Florian BACLE, Fiona LE PEUTREC, Benoît DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan
*   Description: This object contains method for save and pick JSON file in local storage/in a local javascript object if not supported.
*				 The method pushCommandToStorage(uri, commandName,JSONdata) check if data doesn't exist in local storage, in that case save data JSONData in paramaters with the key,id.
*				 The methode pullCommandFromStorage(uri, commandName,id) look for the data with the Key ,id .If something exist, return the JSONFile corresponding to the key, else return undefined.
*   Version: 1.2
*   Tags:  JSON, Local Storage
**/
define(['jquery', 'underscore', 'jStorage'], function($, _, jStorage){
	var StorageManager = {

		initialize : function(parameters){
			if(!$.jStorage.storageAvailable()){
				this.commandStore = [];
		    }
			if(!StorageManager.get("keyword")){
				StorageManager.set("keyword",{});
			}

			var config = StorageManager.get("configurations");
			if(!config){
				StorageManager.set("configurations",parameters.conference);
			}else{
				if(StorageManager.get("configurations").id != parameters.conference.id){
					$.jStorage.flush();
					this.initialize({conference : parameters.conference});
				}
			}
			this.maxSize = 500;
		},
		
		pushCommandToStorage : function (uri,commandName, JSONdata){
			var dataContainer = StorageManager.get(uri);
			
			if(dataContainer != null){
				if(!dataContainer.hasOwnProperty(commandName)){
					dataContainer[commandName] = JSONdata;
					StorageManager.controlSize();
					StorageManager.set(uri,dataContainer);
				}
			}else{
				var newElement = {};
				newElement[commandName] = JSONdata;
				newElement.cpt = 0;
				StorageManager.set(uri,newElement);
			}
		},
		pullCommandFromStorage : function (uri){
			var dataContainer = StorageManager.get(uri);
			var config = StorageManager.get("configurations");
			if(dataContainer != null && config.storage == "on"){
				dataContainer.cpt +=1;
				return dataContainer;
			}else{
			    return null;
			}
		},
		pushKeywordToStorage : function (keyword){
			var dataContainer = StorageManager.get("keyword");
			
			if(dataContainer != null){
				if(!dataContainer.hasOwnProperty(keyword)){
					dataContainer[keyword] = {};
					dataContainer[keyword].cpt = 0;
					dataContainer[keyword].label = keyword;
					
				}else{
					dataContainer[keyword].cpt += 1;
				}
				StorageManager.set("keyword",dataContainer);
			}
		},
		pullKeywordFromStorage : function (){
			var dataContainer = StorageManager.get("keyword");
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
		switchMode : function(mode){
			var config = StorageManager.get("configurations");
			config.storage = mode;
			this.set("configurations", config);
		},
		getMode : function(){
			return StorageManager.get("configurations").storage;
		}


  };
	return StorageManager;
});










