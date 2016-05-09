/**
 *	Copyright <c> Claude Bernard - University Lyon 1 -  2013
 * 	License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing
 *   Author: Lionel MEDINI(supervisor), Florian BACLE, Fiona LEPEUTREC, Beno�t DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan
 *   Description: This object contains a json definition of all the commands that will prepare all the queries we want to send on the DuckDuckGo endpoint.
 *				 Each one of those commands declare the datatype, the method, the query string it is supposed to use on the endpoint and provide the Callback function used to parse the results.
 *				 To declare a request, each commands can use the parameters declared for the route they are called in (see Configuration.js). This parameter can be a name or an uri and represents
 *				 the entity which we want informations on. After calling a command, the results are parsed with it own callback function. It is the role of the router to call those commands according to the configuration file.
 *   Version: 1.2
 *   Tags:  JSON, SPARQL, AJAX
 **/
define(['jquery', 'underscore', 'encoder','ViewAdapter', 'ViewAdapterText', 'labels'], function($, _, Encoder, ViewAdapter, ViewAdapterText, labels){
    return {
        getResultOrganization : {
            dataType : "JSONP",
            method : "GET",
            serviceUri : "",
            getQuery : function(parameters){
                var authorName = parameters.name.split("_").join(" ");
                return { q : authorName, format : "json",pretty : 1, no_redirect : 1  , output : "json"};
            },

            ModelCallBack : function (dataJSON){
                var JSONfile = {};
                var JSONToken = {};
                JSONToken.Heading        = dataJSON.Heading;
                JSONToken.Image          = dataJSON.Image;
                JSONToken.AbstractText   = dataJSON.AbstractText;

                if( dataJSON.Results.length > 0 ){
                    JSONToken.FirstURL   = dataJSON.Results[0].FirstURL;
                }
                JSONfile[0] = JSONToken;
                return JSONfile;
            },

            ViewCallBack : function(parameters){

                if(parameters.JSONdata != null){
                    var organizationInfo = parameters.JSONdata;
                    if(_.size(organizationInfo) > 0 ){
                        var Heading  = organizationInfo[0].Heading;
                        var Image  = organizationInfo[0].Image;
                        var AbstractText  = organizationInfo[0].AbstractText;
                        var FirstURL  = organizationInfo[0].FirstURL;

                        //For each field, check if it was not found by Google KG
                        if(!$("#organization_name").html() && Heading){
                            parameters.contentEl.append('<p id="organization_name">'+Heading+'</p>');
                        }
                        if(!$("#organization_image").attr("src") && Image){
                            parameters.contentEl.append('<img id="organization_image" src="'+Image+'"/>');
                        }
                        if(!$("#organization_description").html() && AbstractText){
                            parameters.contentEl.append(
                                '<div id="organization_description">'+
                                '<h2>'+labels[parameters.conference.lang].organization.abstract+'</h2>'+
                                '<p>'+AbstractText+'</p>'+
                                '</div>'
                            );
                        }
                        if(!$("#organization_url").html() && FirstURL){
                            parameters.contentEl.append(
                                '<div id="organization_url">'+
                                '<h2>'+labels[parameters.conference.lang].organization.homepage+'</h2>'+
                                '<a href="'+FirstURL+'">'+FirstURL+'</a>'+
                                '</div>'
                            );
                        }
                    }
                }
            }
        }
    };
});