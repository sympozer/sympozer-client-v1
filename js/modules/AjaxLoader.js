/**   
* 	Copyright <c> Claude Bernard - University Lyon 1 -  2013
* 	License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing
*   Author: Lionel MEDINI(supervisor), Florian BACLE, Fiona LEPEUTREC, Beno�t DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan
*   Description: Object in charge of executing commands
*   Version: 1.2
*   Tags:  JSON, SPARQL, AJAX
**/

define(['jquery'], function($){
	var AjaxLoader = { 

		/************************************************      COMMANDS EXECUTION            **************************************/
		/** Ajax query launcher function 
		* It organises all AJAX calls according to a command and a datasource specifications
		* parameters : Contains the command to be launched, and the datasource to use
		* data       : Contains the query built previously by the command's getQuery function
		**/
		executeCommand: function (parameters, successCallback, errorCallback) {
			var datasource = parameters.datasource;
			var command    = parameters.command;

			//Preparing the cross domain technic according to datasource definition
			if(datasource.crossDomainMode == "CORS"){
				jQuery.support.cors = true;
			}else{
				jQuery.support.cors = false;	
			} 
			//Sending AJAX request on the datasource
			$.ajax({
				url: datasource.uri + datasource.commands[command].serviceUri,
				type: datasource.commands[command].method,
				cache: false,
				dataType: datasource.commands[command].dataType,
				data: parameters.data,
				success: successCallback,
                error: errorCallback
			},this);
		}
	}
	return AjaxLoader;
});