/**
 *	Copyright <c> Claude Bernard - University Lyon 1 -  2013
 * 	License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing
 *   Author: Lionel MEDINI(supervisor), Florian BACLE, Fiona LEPEUTREC, Benoît DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan
 *   Description: This object contains a json definition of all the commands that will prepare all the queries we want to send on the Google Knowledge Graph endpoint.
 *				 Each one of those commands declare the datatype, the method, the query string it is supposed to use on the endpoint and provide the Callback function used to parse the results.
 *				 To declare a request, each command can use the parameters declared for the route they are called in (see Configuration.js). This parameter can be a name or an uri and represents
 *				 the entity we want information on. After calling a command, the results are parsed with it own callback function. It is the role of the router to call those commands according to the configuration file.
 *   Version: 1.2
 *   Tags:  JSON, AJAX
 **/
define(['jquery', 'underscore', 'encoder', 'ViewAdapter', 'ViewAdapterText', 'labels'], function($, _, Encoder, ViewAdapter, ViewAdapterText, labels){
    return {

        /** Command used to get and display the most probable homepage of a given organization **/
        getResultOrganization : {
            dataType : "JSON",
            method : "GET",
            serviceUri : "",

            getQuery : function(parameters){
                var searchValue = Encoder.encode(parameters.name);
                return {
                    'query': parameters.name,
                    'limit': 1,
                    'indent': true,
                    'key' : 'AIzaSyDs_IOS965GatJDpOObRU9c00z4kAwlOJY',
                    'types': 'Organization'
                };
            },

            ModelCallBack : function (dataJSON){
                return (_.size(dataJSON.itemListElement)>0)?dataJSON.itemListElement[0].result:null;
            },

            ViewCallBack : function(parameters){

                if(_.size(parameters.JSONdata) > 0 ){
                    var oName  = parameters.JSONdata.name;
                    var oImage  = parameters.JSONdata.image?parameters.JSONdata.image.contentUrl:null;
                    var oDescription  = parameters.JSONdata.detailedDescription?parameters.JSONdata.detailedDescription.articleBody:null;
                    var oUrl  = parameters.JSONdata.url;

                    //Create fields with ids, so that they are not filled twice but filled anyway by DuckDuckGo if GKG does not find the organization
                    //ATTENTION: this callback removes results from the DDGo callback -> invasive approach...
                    if(oName){
                        if($("#organization_name").html()) {
                            $("#organization_name").remove();
                        }
                        parameters.contentEl.append('<p id="organization_name">'+oName+'</p>');
                    }
                    if(oImage){
                        if($("#organization_image").attr("src")) {
                            $("#organization_image").remove();
                        }
                        parameters.contentEl.append('<img id="organization_image" src="'+oImage+'"/>');
                    }
                    if(oDescription){
                        if($("#organization_description").html()) {
                            $("#organization_description").remove();
                        }
                        parameters.contentEl.append(
                            '<div id="organization_description">'+
                            '<h2>'+labels[parameters.conference.lang].organization.abstract+'</h2>'+
                            '<p>'+oDescription+'</p>'+
                            '</div>'
                        );
                    }
                    if(oUrl){
                        if($("#organization_url").html()) {
                            $("#organization_url").remove();
                        }
                        parameters.contentEl.append(
                            '<div id="organization_url">'+
                            '<h2>'+labels[parameters.conference.lang].organization.homepage+'</h2>'+
                            '<a href="'+oUrl+'">'+oUrl+'</a>'+
                            '</div>'
                        );
                    }
                }
            }
        }
    };
});