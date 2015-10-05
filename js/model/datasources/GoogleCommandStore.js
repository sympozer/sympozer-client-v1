/**   
*	Copyright <c> Claude Bernard - University Lyon 1 -  2013
* 	License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing 
*   Author: Lionel MEDINI(supervisor), Florian BACLE, Fiona LEPEUTREC, Benoît DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan
*   Description: This object contains a json definition of all the commands that will prepare all the queries we want to send on the Google endpoint.
*				 Each one of those commands declare the datatype, the method, the query string it is supposed to use on the endpoint and provide the Callback function used to parse the results.		
*				 To declare a request, each commands can use the parameters declared for the route they are called in (see Configuration.js). This parameter can be a name or an uri and represents
*				 the entity which we want informat.lirs.cnrs.fr
ions on. After calling a command, the results are parsed with it own callback function. It is the role of the router to call those commands according to the configuration file.
*   Version: 1.2
*   Tags:  JSON, AJAX
**/
define(['jquery', 'underscore', 'encoder', 'ViewAdapter', 'ViewAdapterText', 'labels'], function($, _, Encoder, ViewAdapter, ViewAdapterText, labels){
	 return {

		/** Command used to get and display the most probable homepage of a given person **/
		getAuthorPersonalPage : {
			dataType : "JSONP",
			method : "GET",
			serviceUri : "",

			getQuery : function(parameters){
				var searchValue = Encoder.encode(parameters.name);
				return { q : searchValue, v : "1.0" };
			},

			ModelCallBack : function (dataJSON){
				return (_.size(dataJSON.responseData.results)>0)?dataJSON.responseData.results[0].url:null;
			},

			ViewCallBack : function(parameters){
                //Check if the homepage was not specified in the local datasource (have no means to do it before sending the AJAX query).
				if(!$("#person_homepage").html() && parameters.JSONdata != null){
                    parameters.contentEl.append('<h2>'+labels[parameters.conference.lang].person.website+'</h2>');
                    parameters.contentEl.append('<a href="'+parameters.JSONdata+'">'+parameters.JSONdata+'</a>');
				}
			}
		}
	};
});