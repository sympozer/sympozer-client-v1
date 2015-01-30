/**   
* 	Copyright <c> Claude Bernard - University Lyon 1 -  2013
* 	License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing
*   Author: Lionel MEDINI(supervisor), Florian BACLE, Fiona LEPEUTREC, Beno�t DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan
*   Description: Object in charge of executing commands
*   Version: 1.2
*   Tags:  JSON, SPARQL, AJAX
**/

define(['jquery','jqueryMobile', 'ajaxLoader'], function($, jqueryMobile, ajaxLoader){
	var AsyncLoader = { 

		/************************************************      COMMANDS EXECUTION            **************************************/
		/** Asynchronous query launcher function 
		* Switches between local and distant calls. If distant, calls ajaxLoader
		* Implemented as a decorator for ajaxLoader
		* parameters : Contains the command to be launched, and the datasource to use
		* data : Contains the query built by the command's getQuery function
		**/
		initialize : function(viewAdapter){
			this.viewAdapter = viewAdapter;
			//propagation to the ajaxLoader. Quick and dirty (LM).
			ajaxLoader.initialize(viewAdapter);
		},
		executeCommand: function (parameters) {
			//Adding a filter for local datasource
			if(parameters.datasource.isLocal === true){
				console.log("Local datasource" + parameters.datasource.uri);
			}else{
				console.log("AJAX datasource: " + parameters.datasource.uri);
				ajaxLoader.executeCommand(parameters);	
			}
		}
	}
	return AsyncLoader;
});