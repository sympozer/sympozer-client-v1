/**   
*	Copyright <c> Claude Bernard - University Lyon 1 -  2013
* 	License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing 
*   Author: Lionel MEDINI(supervisor), Florian BACLE, Fiona LEPEUTREC, Beno�t DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan
*   Description: This object contains a json definition of all the commands that will prepare all the queries we want to send on the SemanticWebDogFood sparql endpoint.
*				 Each one of those commands declare the datatype, the method, the query string it is supposed to use on the endpoint and provide a model Callback to store results, a view CallBack to render data stored.		
*				 To declare a request, each commands can use the parameters declared for the route they are called in (see Configuration.js). Those parameters can be a name, an uri or both and represents
*				 the entity which we want informations on. After calling a command, the results are stored using the localStorageManager (see localStorage.js) and rendered when needed. It is the role of the router to call those commands according to the configuration file.
*   Version: 1.2
*   Tags:  JSON, SPARQL, AJAX
**/
define(['jquery', 'underscore', 'encoder', 'view/ViewAdapter', 'view/ViewAdapterText', 'localStorage/localStorageManager','moment'], function($, _, Encoder, ViewAdapter, ViewAdapterText, StorageManager, moment){
var SWDFCommandStore = { 
	/** Command used to get and display  all the authors that have a publication in the conference's proceedings using the conference uri **/
	getAllAuthors : {

		//Declaration of the datatype to use when sending the query
		dataType : "XML",
		//Declaration of the method to use when sending the query
		method : "GET", 
		//Declaring the function �that will build the query using the parameters (the conference informations or a specific part of the url declared in configuration.js), encapsulate it in a JSON and returns it
		getQuery : function(parameters) { 
			
			//Building sparql query with prefix
			var query =   'PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#> PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> ' +
								'SELECT DISTINCT ?authorName  ?authorUri ?uriPubli WHERE  { ' +
								'   ?uriPubli swc:isPartOf  <'+parameters.conferenceUri+"/proceedings"+'>.' + 
								'   ?authorUri foaf:made ?uriPubli.  ' +
								'   ?authorUri foaf:name ?authorName.' +
								'} ORDER BY ASC(?authorName) '; 
			//Encapsulating query in json object to return it
			var  ajaxData = { query : query };
			return ajaxData;
		},
		//Declaring the callback function to use when sending the command
		ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri,name){
			
			var result = $(dataXML).find("sparql > results > result").text();
			if( result != ""){
				var JSONfile = {};
				$(dataXML).find("sparql > results > result").each(function(i){  
					var JSONToken = {};
					JSONToken.authorUri =  $(this).find("[name = authorUri]").text();
					JSONToken.authorName =  $(this).find("[name = authorName]").text(); 	
					JSONfile[i] = JSONToken;
				});
				
				return JSONfile;
			}
		},
		
		ViewCallBack : function(parameters){
			if(parameters.JSONdata != null){
				if(_.size(parameters.JSONdata) > 0 ){
					if(parameters.mode == "text"){

						ViewAdapterText.appendList(parameters.JSONdata,
										 {baseHref: '#author/',
										 hrefCllbck:function(str){return Encoder.encode(str["authorName"])+'/'+Encoder.encode(str["authorUri"])}
										 },
										 "authorName",
										 parameters.contentEl,
										{autodividers:"force",count :true}
										 );
					}else{
						ViewAdapterGraph.appendList(parameters.JSONdata,
										 {baseHref: '#author/',
										 hrefCllbck:function(str){return Encoder.encode(str["authorName"])+'/'+Encoder.encode(str["authorUri"])}
										 },
										 "authorName",
										 parameters.contentEl,
										 {type:"Node",labelCllbck:function(str){return "Name : "+str["authorName"];}});
					
					}
				}
			}
		}
    },
    
    

	/** Command used Schedule of the conf **/
	getConferenceSchedule : {
 
		dataType : "XML", 
		method : "GET",  
		getQuery : function(parameters) {  
			//Building sparql query with prefix
			var query =   'PREFIX rdf:    <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
                    PREFIX swc:     <http://data.semanticweb.org/ns/swc/ontology#>\
                    PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>\
                    PREFIX event:   <http://purl.org/NET/c4dm/event.owl#> \
                    PREFIX icaltzd: <http://www.w3.org/2002/12/cal/icaltzd#>\
                    PREFIX dce:     <http://purl.org/dc/elements/1.1/>\
\
                    SELECT DISTINCT *  WHERE {\
                       ?eventUri     icaltzd:dtstart 	?dtStart.\
                       ?eventUri     icaltzd:dtend 	  ?dtEnd. \
                       ?eventUri     rdf:type 	      ?eventType.\
                       ?eventUri     rdfs:label       ?eventLabel.\
                       ?eventUri     dce:description  ?eventDesc.\
                       ?eventUri     event:place     	?locationUri.\
                       ?locationUri  rdfs:label 	    '+(parameters.uri!="null"?'"'+Encoder.decode(parameters.uri)+'"':'?locationLabel')+'.\
                    } ORDER BY ?dtStart ?dtEnd ?locationLabel';
                    
			//Encapsulating query in json object to return it
			var  ajaxData = { query : query };
			return ajaxData;
		},
		//Declaring the callback function to use when sending the command
		ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri){
			
			var result = $(dataXML).find("sparql > results > result").text();
			if( result != ""){
				var JSONfile = {};
				$(dataXML).find("sparql > results > result").each(function(i){
 
					
					//////////////////////////////
					/// look for special event ///
					//////////////////////////////
				  var currentEvent = {};
					currentEvent.eventType =  $(this).find("[name = eventType]").text().split('#')[1];
					 
					if(currentEvent.eventType!="Event" && currentEvent.eventType!="TalkEvent" ){ 
					   
				    //retrieve current Start Slot
					  var currentStartSlot =  $(this).find("[name = dtStart]").text(); 	
					  if(!JSONfile[currentStartSlot]) JSONfile[currentStartSlot] = {}; 
					  currentStartSlot = JSONfile[currentStartSlot];
					  
				    //retrieve current End Slot
					  var currentEndSlot =  $(this).find("[name = dtEnd]").text(); 	
					  if(!currentStartSlot[currentEndSlot]) currentStartSlot[currentEndSlot] = {bigEvents:{},events:[]}; 
					  currentEndSlot = currentStartSlot[currentEndSlot];
					  
					
					  //retrieve current eventType slot
					  if(!currentEndSlot.bigEvents[currentEvent.eventType]) currentEndSlot.bigEvents[currentEvent.eventType] = [];  
					  
					  
					//then push to the correct start/end slot 
					  currentEvent.eventUri =  $(this).find("[name = eventUri]").text(); 
					  currentEvent.eventLabel =  $(this).find("[name = eventLabel]").text();
					  currentEvent.eventDesc =  $(this).find("[name = eventDesc]").text();
					  currentEvent.locationLabel =  $(this).find("[name = locationLabel]").text();
			      currentEndSlot.bigEvents[currentEvent.eventType].push(currentEvent);
					  
					}else { 
					
					  //currentEndSlot.events.push(currentEvent);
					  
					}
					
				});
				StorageManager.pushCommandToStorage(currentUri,"getConferenceSchedule",JSONfile);
				return JSONfile;
			}
		},
		
		ViewCallBack : function(parameters){
			if(parameters.JSONdata != null){
				if(_.size(parameters.JSONdata) > 0 ){
				  if(parameters.name!="null" && parameters.name!="")$("[data-role = page]").find("#DataConf").html(parameters.name);
				  var content=$("<div data-role='collapsible-set' data-inset='false'></div>");
				  var currentDay,currentUl ;
				  for (var startAt in parameters.JSONdata) {
				      
				      //if the day has changed
				      if(currentDay != moment(startAt).format('MMMM Do YYYY')){
				          currentCollabsible = $('<div data-role="collapsible" data-theme="b" ><h2>'+moment(startAt).format('MMMM Do YYYY')+'</h2></div>');
				          currentUl = $('<ul data-role="listview" data-inset="true" ></ul>');
				          //content.append(currentUl);
				          content.append(currentCollabsible); 
				          currentCollabsible.append(currentUl);
				      }
				      currentDay = moment(startAt).format('MMMM Do YYYY');
				      
				      var startTime = moment(startAt).format('h:mm a');
				      
              currentUl.append("<li  data-theme='a' data-role='list-divider' >\
                                    start at "+startTime+"\
                                </li>");
                                
			        for (var endAt in parameters.JSONdata[startAt]) {
			         
			            var lasts  =  moment(startAt).from(moment(endAt),true); 
			            
			            var bigEvents = parameters.JSONdata[startAt][endAt].bigEvents;
		              if(_.size(bigEvents)>0){
		                for (var eventType in bigEvents) {
		                    
		                    for (var i=0 ;i<bigEvents[eventType].length;i++) {
	            
	                          var LocationHtml= ''; 
	                          
	                          if(parameters.name && parameters.name!="null" && parameters.name!=""){
	                              LocationHtml = '<p>'+parameters.name+'</p>';
                            }else{
	                              LocationHtml = '<p>'+bigEvents[eventType][i].locationLabel+'</p>';
	                              LocationHtml += '<p><a href="#schedule/'+Encoder.encode(bigEvents[eventType][i].locationLabel)+'" data-role="button" data-icon="search" data-inline="true">'+bigEvents[eventType][i].locationLabel+'</a></p>';
                            }
                            currentUl.append('<li data-inset="true"  ><a href="#event/'+Encoder.encode(bigEvents[eventType][i].eventUri)+'">\
					                                        <h3>'+bigEvents[eventType][i].eventLabel+'</h3>\
					                                        <p>'+bigEvents[eventType][i].eventType+'</p>\
															<p>last : <strong>'+lasts+'</strong></p>\
					                                        '+LocationHtml+'</a></li>'); 
		                    } 
		                }
		                 
		              }
			        } 
				  }
				  parameters.contentEl.append(content);
				}
			}
		}
    },
                                        
	/******** Command used to get and display the title of the conference's publications *********/
    getAllTitle : {
        dataType : "XML",
        method : "GET",
        getQuery : function(parameters){

            var query = 'PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#> '+
						'PREFIX foaf: <http://xmlns.com/foaf/0.1/> '+
						'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> '+
	                    'PREFIX dc: <http://purl.org/dc/elements/1.1/> '+
						'SELECT DISTINCT ?publiTitle ?publiUri WHERE {'+
						'	?publiUri swc:isPartOf  <'+parameters.conferenceUri+"/proceedings"+'> . '+
	                    '	{ 	 ?publiUri dc:title ?publiTitle. }' + 
						'	UNION' + 
						'	{  	 ?publiUri rdfs:label ?publiTitle. }' +
						'} ORDER BY ASC(?publiTitle)'; 
	             
			var  ajaxData = { query : query };
			return ajaxData;
		},
        ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri){
			var JSONfile = {};
			$(dataXML).find("sparql > results > result").each(function(i){  
				var JSONToken = {};
				JSONToken.publiUri =  $(this).find("[name = publiUri]").text();
				JSONToken.publiTitle =  $(this).find("[name = publiTitle]").text(); 	
				JSONfile[i] = JSONToken;
			});
			StorageManager.pushCommandToStorage(currentUri,"getAllTitle",JSONfile);
			return JSONfile;
		},
		
		ViewCallBack : function(parameters){
			if(parameters.JSONdata != null){
				if(_.size(parameters.JSONdata) > 0 ){
					if(parameters.mode == "text"){
						ViewAdapterText.appendList(parameters.JSONdata,
									 {baseHref: '#publication/',
									 hrefCllbck:function(str){return Encoder.encode(str["publiUri"])}
                   },
									 "publiTitle",
									 parameters.contentEl,
									 {autodividers:"force",count :false}
									 );
					
					}else{
						ViewAdapterGraph.appendList(parameters.JSONdata,
									 {baseHref: '#publication/',
									 hrefCllbck:function(str){return Encoder.encode(str["publiTitle"])+'/'+Encoder.encode(str["publiUri"])}
                   },
									 "publiTitle",
									 parameters.contentEl,
									 {type:"Node",labelCllbck:function(str){return "Publication : "+str["publiTitle"];}});
					
					}
				}
			}
		}
	},
        
    /** Command used to get and display all keywords of the conference's publications **/
    getAllKeyword : {
        dataType : "XML",
        method : "GET",
        getQuery : function(parameters){

            var query = 	'PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#> PREFIX foaf: <http://xmlns.com/foaf/0.1/> ' +
							'PREFIX dc: <http://purl.org/dc/elements/1.1/> ' +
							'SELECT DISTINCT  ?keyword ?publiUri WHERE { ' +
							'  	 ?publiUri       swc:isPartOf  <'+parameters.conferenceUri+"/proceedings"+'> .     '+                  
							'  	 ?publiUri       dc:subject    ?keyword. ' +
							'}ORDER BY ASC(?keyword) '; 
							
			var  ajaxData = { query : query };
			return ajaxData;
				     
		},
        ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri){ 
			var JSONfile = {};
			$(dataXML).find("sparql > results > result").each(function(i){  
				var JSONToken = {};
				JSONToken.keyword =  $(this).find("[name = keyword]").text();	
				JSONfile[i] = JSONToken;
			});
			StorageManager.pushCommandToStorage(currentUri,"getAllKeyword",JSONfile);
			return JSONfile;
		},
		
		ViewCallBack : function(parameters){
			if(parameters.JSONdata != null){
				if(_.size(parameters.JSONdata) > 0 ){
					if(parameters.mode == "text"){
						ViewAdapterText.appendList(parameters.JSONdata,
										 {baseHref:'#keyword/',
										  hrefCllbck:function(str){return Encoder.encode(str["keyword"])}
                     },
										 "keyword",
										 parameters.contentEl,
										 {autodividers:"force",count :true}
										 );

					}else{
						ViewAdapterGraph.appendList(parameters.JSONdata,
										 {baseHref:'#keyword/',
										  hrefCllbck:function(str){return Encoder.encode(str["keyword"])}
                     },
										 "keyword",
										 parameters.contentEl,
										 {
										    type:"Node",
										    labelCllbck:function(str){return "Publication : "+str["keyword"];},
										    option:{color:"#3366CC"}
										 });

					}
				}
			} 
		}
	},
	
	 /** Command used to get and display all keywords of the conference's publications **/
    getAllKeywordList : {
        dataType : "XML",
        method : "GET",
        getQuery : function(parameters){

            var query = 	'PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#> PREFIX foaf: <http://xmlns.com/foaf/0.1/> ' +
							'PREFIX key:<http://www.w3.org/2004/02/skos/core#> ' +
							'PREFIX dc: <http://purl.org/dc/elements/1.1/> ' +
							'SELECT DISTINCT  ?keyword  WHERE { ' +
							'  	 ?publiUri       swc:isPartOf  <'+parameters.conferenceUri+"/proceedings"+'> .     '+                  
							'  	 ?publiUri       dc:subject    ?keyword. ' +
							'}ORDER BY ASC(?keyword) '; 
							
			var  ajaxData = { query : query };
			return ajaxData;
				     
		},
        ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri){ 
			var JSONfile = {};
			$(dataXML).find("sparql > results > result").each(function(i){  
				var JSONToken = {};
				JSONToken.keyword =  $(this).find("[name = keyword]").text();	
				JSONfile[i] = JSONToken;
			});
			
			return JSONfile;
		},
		
		ViewCallBack : function(parameters){
			if(parameters.JSONdata != null){
				if(_.size(parameters.JSONdata) > 0 ){
					if(parameters.mode == "text"){
						ViewAdapterText.appendList(parameters.JSONdata,
										 {baseHref:'#keyword/',
										  hrefCllbck:function(str){return Encoder.encode(str["keyword"])}
                     },
										 "keyword",
										 parameters.contentEl,
										 {autodividers:"force",count :true}
										 );

					}else{
						ViewAdapterGraph.appendList(parameters.JSONdata,
										 {baseHref:'#keyword/',
										  hrefCllbck:function(str){return Encoder.encode(str["keyword"])}
                     },
										 "keyword",
										 parameters.contentEl,
										 {
										    type:"Node",
										    labelCllbck:function(str){return "Publication : "+str["keyword"];},
										    option:{color:"#3366CC"}
										 });

					}
				}
			} 
		}
	},
        
    /** Command used to get and display all proceedings of the conference's publications **/     
    getAuthorsProceedings : {
        dataType : "XML",
        method : "GET",
        getQuery : function(parameters){
            var conferenceUri = parameters.conferenceUri;  
            var authorUri = parameters.uri;
            var query = 	'PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#> PREFIX foaf: <http://xmlns.com/foaf/0.1/> ' +
							'PREFIX dc: <http://purl.org/dc/elements/1.1/>                                                        ' +
							'SELECT DISTINCT ?publiTitle ?publiUri WHERE  { 					                                  ' + 
							' {  ?publiUri swc:isPartOf  <'+conferenceUri+'/proceedings>.										  ' + 
							'    ?authorUri foaf:made ?publiUri.    														     ' +
							'    ?authorUri foaf:name  "'+parameters.name+'".    												  ' +
							'  	?publiUri dc:title     ?publiTitle.        													     } ' + 
							'UNION{ ?publiUri swc:isPartOf  <'+conferenceUri+'/proceedings>.				     				  ' + 
							'    <'+authorUri+'> foaf:made ?publiUri.    														  ' +
							'  	?publiUri dc:title     ?publiTitle.        													      }' + 
							
							'}'; 
			var  ajaxData = { query : query };
			return ajaxData;
		},
        ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri){ 
			var JSONfile = {};
			$(dataXML).find("sparql > results > result").each(function(i){  
				var JSONToken = {};
				JSONToken.publiTitle =  $(this).find("[name = publiTitle]").text();
				JSONToken.publiUri =  $(this).find("[name = publiUri]").text();				
				JSONfile[i] = JSONToken;
			});
			StorageManager.pushCommandToStorage(currentUri,"getAuthorsProceedings",JSONfile);
			return JSONfile;
		},
		ViewCallBack : function(parameters){
			if(parameters.JSONdata != null){
				if(_.size(parameters.JSONdata) > 0 ){
					if(parameters.mode == "text"){
						parameters.contentEl.append($('<h2>Conference publications</h2>'));
						$.each(parameters.JSONdata, function(i,publication){
							ViewAdapterText.appendButton(parameters.contentEl,'#publication/'+Encoder.encode(publication.publiUri),publication.publiTitle);
						});
					}else{
						$.each(parameters.JSONdata, function(i,publication){
							ViewAdapterGraph.addNode("Publication : "+publication.publiTitle,'#publication/'+Encoder.encode(publication.publiTitle)+'/'+Encoder.encode(publication.publiUri));
						});
					
					}
				}
			}
		}
		
		
	},  
	

                                      
	/** Command used to get and display the title and the abstract of a publication  **/
    getPublicationInfo : {
        dataType : "XML",
        method : "GET",
        getQuery : function(parameters){
			var conferenceUri = parameters.conferenceUri;
		    var prefix =	'PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#>         ' +
						    'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>               ' +
						    'PREFIX dc: <http://purl.org/dc/elements/1.1/>                      ' +
						    'PREFIX swrc: <http://swrc.ontoware.org/ontology#>                  ' +
						    'PREFIX foaf: <http://xmlns.com/foaf/0.1/>            		        ' ;
						
		    var query  =	'SELECT DISTINCT   ?publiTitle ?publiAbstract WHERE  {              ' +
						    '{   <'+parameters.uri+'>  dc:title ?publiTitle.                          ' +
						    '	OPTIONAL {<'+parameters.uri+'>  swrc:abstract ?publiAbstract.   } }    ' +
							 'UNION{   <'+parameters.uri+'>  rdfs:label ?publiTitle.                           ' +
						    '	OPTIONAL {<'+parameters.uri+'>  swrc:abstract ?publiAbstract.   }   }  ' +
						    '}';
							
			var  ajaxData = { query : prefix+query };
			return ajaxData;
		},
        ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri){
			var JSONfile = {};
			$(dataXML).find("sparql > results > result").each(function(i){  
				var JSONToken = {};
				JSONToken.publiTitle =  $(this).find("[name = publiTitle]").text();
				JSONToken.publiAbstract =  $(this).find("[name = publiAbstract]").text(); 	
				JSONfile[i] = JSONToken;
			});
			StorageManager.pushCommandToStorage(currentUri,"getPublicationInfo",JSONfile);
			return JSONfile;
		},
		
		ViewCallBack : function(parameters){
			if(parameters.JSONdata != null ){
				var publicationInfo = parameters.JSONdata;
				if(_.size(publicationInfo) > 0 ){
					if(parameters.mode == "text"){
						var publiAbstract  = publicationInfo[0].publiAbstract;				
						var publiTitle  = publicationInfo[0].publiTitle;	
						
						if(publiTitle!=""){
							parameters.contentEl.append('<h2>Title</h2>');
							parameters.contentEl.append('<p>'+publiTitle+'</p>');
							$("[data-role = page]").find("#DataConf").html(publiTitle);	
						}
						if(publiAbstract!=""){
							parameters.contentEl.append('<h2>Abstract</h2>');
							parameters.contentEl.append('<p>'+publiAbstract+'</p>'); 
							
						}
					}else{
						var publiAbstract  = publicationInfo[0].publiAbstract;				
						var publiTitle  = publicationInfo[0].publiTitle;	
						
						if(publiTitle!=""){
							ViewAdapterGraph.addLeaf("Title :"+publiTitle);
						}
						if(publiAbstract!=""){
							ViewAdapterGraph.addLeaf("Abstract :"+publiAbstract);
							
						}
					
					}
				}
			}
		}
	},
     
	/** Command used to get the auhors of a publication  **/
    getPublicationAuthor : {
        dataType : "XML",
        method : "GET",
        getQuery : function(parameters){
		    var conferenceUri = parameters.conferenceUri;
		    var prefix =	'PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#>                  ' +
						    'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>                        ' +
						    'PREFIX dc: <http://purl.org/dc/elements/1.1/>                               ' +
						    'PREFIX swrc: <http://swrc.ontoware.org/ontology#>                           ' +
						    'PREFIX foaf: <http://xmlns.com/foaf/0.1/>            		                 ' ;
						
		    var query =		'SELECT DISTINCT ?authorUri   ?authorName  WHERE { ' +
						    '<'+parameters.uri+'>  dc:creator ?authorUri.                      	      ' +
						    '{	?authorUri foaf:name ?authorName.} ' +
							' UNION' +
						    '{	?authorUri rdfs:label ?authorName . }                  ' +
						    '}';
		    var  ajaxData ={ query : prefix + query };
			return ajaxData;
		},

        ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri){
			var JSONfile = {};
			$(dataXML).find("sparql > results > result").each(function(i){  
				var JSONToken = {};
				JSONToken.authorUri =  $(this).find("[name = authorUri]").text();
				JSONToken.authorName =  $(this).find("[name = authorName]").text(); 	
				JSONfile[i] = JSONToken;
			});
			StorageManager.pushCommandToStorage(currentUri,"getPublicationAuthor",JSONfile);
			return JSONfile;
		},
		
		ViewCallBack : function(parameters){

			if(parameters.JSONdata != null){
				if(_.size(parameters.JSONdata) > 0 ){
					if(parameters.mode == "text"){
						parameters.contentEl.append($('<h2>Authors</h2>'));
						$.each(parameters.JSONdata, function(i,author){
							ViewAdapterText.appendButton(parameters.contentEl,'#author/'+Encoder.encode(author.authorName)+'/'+Encoder.encode(author.authorUri),author.authorName,{tiny:true});
						});
					}else{
						$.each(parameters.JSONdata, function(i,author){
							ViewAdapterGraph.addNode("Author : "+author.authorName,'#author/'+Encoder.encode(author.authorName)+'/'+Encoder.encode(author.authorUri),{color:"#7db9e8"});
						});
					
					}
				}
			}
		}
    }, 
    
	/** Command used to get all session's sub event of a given event  **/
    getSessionSubEvent : {
	    dataType : "XML",
	    method : "GET", 
	    getQuery : function(parameters){

		    var conferenceUri = parameters.conferenceUri;
		
		    var prefix =	' PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#>   ' +
							'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>    ' +
						    ' PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>         ' ;
						
						
		    var query = 	'SELECT DISTINCT ?eventUri ?eventLabel  WHERE {                ' +
						    '	<'+parameters.uri+'> swc:isSuperEventOf  ?eventUri. ' +
							'	?eventUri  rdf:type 	swc:SessionEvent.                  ' +
						    '	OPTIONAL { ?eventUri rdfs:label ?eventLabel.} 			   ' +
							'} ORDER BY DESC(?eventLabel)';
							
			var  ajaxData = { query : prefix + query };
			return ajaxData;
		
	    },
	    
	    ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri){
			var JSONfile = {};
			$(dataXML).find("sparql > results > result").each(function(i){  
				var JSONToken = {};
				JSONToken.eventUri =  $(this).find("[name = eventUri]").text();
				JSONToken.eventLabel =  $(this).find("[name = eventLabel]").text(); 	
				JSONfile[i] = JSONToken;
			});
			StorageManager.pushCommandToStorage(currentUri,"getSessionSubEvent",JSONfile);
			return JSONfile;
		},
		
		ViewCallBack : function(parameters){
			if(parameters.JSONdata != null){
				if(_.size(parameters.JSONdata) > 0 ){
					
					if(parameters.mode == "text"){
						parameters.contentEl.append($('<h2>Sub Sessions</h2>')); 
						$.each(parameters.JSONdata, function(i,session){
							ViewAdapterText.appendButton(parameters.contentEl,'#event/'+Encoder.encode(session.eventUri),session.eventLabel);
						});
					}else{
						$.each(parameters.JSONdata, function(i,session){
							ViewAdapterGraph.addNode("Sub session : "+session.eventLabel,'#event/'+Encoder.encode(session.eventUri),{color:"#003399"});
						});
					
					}
				}
			}
		}
                                         
    },
	
	/** Command used to get all session's sub event of a given event  **/
    getTrackSubEvent : {
	    dataType : "XML",
	    method : "GET", 
	    getQuery : function(parameters){

		    var prefix =	' PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#>   ' +
							'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>     ' +
						    ' PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>         ' ;
						
						
		    var query = 	'SELECT DISTINCT ?eventUri ?eventLabel  WHERE {                ' +
						    '	<'+parameters.uri+'> swc:isSuperEventOf  ?eventUri. ' +
							'	?eventUri  rdf:type 	swc:TrackEvent.                    ' +
						    '	OPTIONAL { ?eventUri rdfs:label ?eventLabel.} 			   ' +
							'} ORDER BY DESC(?eventLabel)';
							
			var  ajaxData = { query : prefix + query };
			return ajaxData;
		
	    },
	    
	    ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri){
			var JSONfile = {};
			$(dataXML).find("sparql > results > result").each(function(i){  
				var JSONToken = {};
				JSONToken.eventUri =  $(this).find("[name = eventUri]").text();
				JSONToken.eventLabel =  $(this).find("[name = eventLabel]").text(); 	
				JSONfile[i] = JSONToken;
			});
			StorageManager.pushCommandToStorage(currentUri,"getTrackSubEvent",JSONfile);
			return JSONfile;
		},
		
		ViewCallBack : function(parameters){
			if(parameters.JSONdata != null){
				if(_.size(parameters.JSONdata) > 0 ){
					
					if(parameters.mode == "text"){
						parameters.contentEl.append($('<h2>Sub tracks</h2>')); 
						$.each(parameters.JSONdata, function(i,track){
							ViewAdapterText.appendButton(parameters.contentEl,'#event/'+Encoder.encode(track.eventUri),track.eventLabel);
						});
					}else{
						$.each(parameters.JSONdata, function(i,track){
							ViewAdapterGraph.addNode("Sub track : "+track.eventLabel,'#event/'+Encoder.encode(track.eventUri),{color:"#003399"});
						});
					
					}
				}
			}
		}
                                         
    },
       
    /** Command used to get and display the name, the start and end time and location of a given event  **/ 
    getEvent : {
	    dataType : "XML",
	    method : "GET", 
	    getQuery : function(parameters){

		
		    var prefix =	'PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#>' +
						    'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>      ' +
							'PREFIX dc: <http://purl.org/dc/elements/1.1/>             ' +
							'PREFIX swrc: <http://swrc.ontoware.org/ontology#>         ' +
							'PREFIX foaf: <http://xmlns.com/foaf/0.1/>                   ' +
						    'PREFIX iCal: <http://www.w3.org/2002/12/cal/ical#>        ' ;
						
		    var query = 	'SELECT DISTINCT ?eventLabel ?eventDescription ?eventAbstract ?eventHomepage ?locationName ?eventStart ?eventEnd ?eventStartCal ?eventEndCal WHERE {                   ' +
						    '	OPTIONAL { <'+parameters.uri+'> rdfs:label ?eventLabel.} ' +
							'	OPTIONAL { <'+parameters.uri+'> dc:description  ?eventDescription.}' +
							'	OPTIONAL { <'+parameters.uri+'> swrc:abstract ?eventAbstract. } '+
							'	OPTIONAL { <'+parameters.uri+'> foaf:homepage ?eventHomepage. } '+
						    '	OPTIONAL { <'+parameters.uri+'> swc:hasLocation ?eventLocation. ' +
						    '	?eventLocation  rdfs:label ?locationName.}  ' +
						    '	OPTIONAL { <'+parameters.uri+'> <http://www.w3.org/2002/12/cal/icaltzd#dtstart> ?eventStart.}' +
						    '	OPTIONAL { <'+parameters.uri+'> <http://www.w3.org/2002/12/cal/icaltzd#dtend> ?eventEnd.}' +
							'	OPTIONAL { <'+parameters.uri+'> iCal:dtStart ?eventStartCal.} ' +
						    '	OPTIONAL { <'+parameters.uri+'> iCal:dtEnd   ?eventEndCal.}' +
						    '}';
		    var  ajaxData = { query : prefix+query };
			return ajaxData;
		
	    },
	    ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri){
			var JSONfile = {};
			$(dataXML).find("sparql > results > result").each(function(i){  
				
				JSONfile["eventLabel"] =  $(dataXML).find("[name = eventLabel]").text();
				JSONfile["eventLocation"] =  $(dataXML).find("[name = eventLocation]").text(); 
				JSONfile["eventDescription"] =  $(dataXML).find("[name = eventDescription]").text(); 
				JSONfile["eventAbstract"] =  $(dataXML).find("[name = eventAbstract]").text(); 
				JSONfile["eventHomepage"] =  $(dataXML).find("[name = eventHomepage]").text(); 
				JSONfile["eventLocationName"] =  $(dataXML).find("[name = locationName]").text();
				if($(dataXML).find("[name = eventStart]").text() != ""){
					JSONfile["eventStart"] =  $(dataXML).find("[name = eventStart]").text();
					JSONfile["eventEnd"] =  $(dataXML).find("[name = eventEnd]").text();
				}else{
					JSONfile["eventStart"] =  $(dataXML).find("[name = eventStartCal]").text();
					JSONfile["eventEnd"] =  $(dataXML).find("[name = eventEndCal]").text();
				}
			
			});
			StorageManager.pushCommandToStorage(currentUri,"getEvent",JSONfile);
			return JSONfile;
			
		}, 

		ViewCallBack : function(parameters){
			var JSONdata = parameters.JSONdata;
			var conferenceUri = parameters.conferenceUri;

			if(parameters.JSONdata != null){
				
				var eventInfo = parameters.JSONdata;
					
				if(_.size(eventInfo) > 0 ){
					if(parameters.mode == "text"){
								  
						var eventLabel  = eventInfo.eventLabel;				
						var eventLocation  = eventInfo.eventLocation;
						var eventHomepage  = eventInfo.eventHomepage;
						var eventDescription  = eventInfo.eventDescription;
						var eventAbstract  = eventInfo.eventAbstract;							
						var locationName  = eventInfo.eventLocationName;	
						var eventStart  = eventInfo.eventStart;	
						var eventEnd  = eventInfo.eventEnd;
						var eventStartICS  = moment(eventInfo.eventStart,"YYYY-MM-DD HH:mm").format("YYYYMMDDTHHmmss");	
						var eventEndICS  = moment(eventInfo.eventEnd,"YYYY-MM-DD HH:mm").format("YYYYMMDDTHHmmss");
						var icsEvent="BEGIN:VCALENDAR\n"+
								"VERSION:2.0\n"+
								'PRODID: //'+parameters.conferenceUri+'//ES//EN\n'+
								"BEGIN:VTIMEZONE\n"+
								"TZID:Europe/Paris\n"+
								"BEGIN:DAYLIGHT\n"+
								"TZOFFSETFROM:+0100\n"+
								"RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU\n"+
								"DTSTART:19810329T020000\n"+
								"TZNAME:GMT+02:00\n"+
								"TZOFFSETTO:+0200\n"+
								"END:DAYLIGHT\n"+
								"BEGIN:STANDARD\n"+
								"TZOFFSETFROM:+0200\n"+
								"RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU\n"+
								"DTSTART:19961027T030000\n"+
								"TZNAME:GMT+01:00\n"+
								"TZOFFSETTO:+0100\n"+
								"END:STANDARD\n"+
								"END:VTIMEZONE\n"+
								"BEGIN:VEVENT\n"+
								"CATEGORIES:"+eventLabel+"\n"+
								"DTSTART;TZID=Europe/Paris:"+eventStartICS+"\n"+
								"DTEND;TZID=Europe/Paris:"+eventEndICS+"\n"+
								"SUMMARY:"+eventLabel+"\n"+
								"DESCRIPTION:"+eventAbstract+"\n"+
								"LOCATION:"+locationName+"\n"+
								"END:VEVENT\n"+
								"END:VCALENDAR";
						var isDefined = false;
						if(eventDescription != ""){ 
							parameters.contentEl.append($('<h2>Description</h2>')); 
							parameters.contentEl.append($('<p>'+eventDescription+'</p>'));   
						}
						if(eventAbstract != ""){ 
							parameters.contentEl.append($('<h2>Abstract</h2>')); 
							parameters.contentEl.append($('<p>'+eventAbstract+'</p>'));   
						}
						if(eventStart != ""){ 
							parameters.contentEl.append($('<p>Starts at : '+moment(eventStart).format('MMMM Do YYYY, h:mm:ss a')+'</p>'));
							isDefined = true;
						}
						if(eventEnd != ""){
							parameters.contentEl.append($('<p>Ends at : '+moment(eventEnd).format('MMMM Do YYYY, h:mm:ss a')+'</p>'));  
						} 
						if(locationName != ""){ 
							parameters.contentEl.append($('<p>Location : <a href="#schedule/'+Encoder.encode(locationName)+'" data-role="button" data-icon="search" data-inline="true">'+locationName+'</a></p>'));   
						}
						if(eventHomepage != undefined){ 
							parameters.contentEl.append($('<h2>Homepage</h2>'));
							parameters.contentEl.append($('<p>Homepage : <a href="'+eventHomepage+'" data-role="button" data-icon="search" data-inline="true">'+eventHomepage+'</a></p>'));   
						}
						if(eventLabel !=""){
							$("[data-role = page]").find("#DataConf").html(eventLabel);
						}
						if(isDefined){
							var icsButton = $('<button data-role="button" data-inline="true" data-icon="gear" data-iconpos="left">Add to calendar</button>');
							icsButton.click(function(){
								var blob = new Blob([icsEvent], {type: "text/calendar;charset=utf-8"});
								saveAs(blob, "icsEvent.ics");
							});
							parameters.contentEl.append(icsButton);
						}
					}else{
								  
						var eventLabel  = eventInfo.eventLabel;				
						var eventLocation  = eventInfo.eventLocation;
						var eventDescription  = eventInfo.eventDescription;
						var eventAbstract  = eventInfo.eventAbstract;							
						var locationName  = eventInfo.eventLocationName;	
						var eventStart  = eventInfo.eventStart;	
						var eventEnd  = eventInfo.eventEnd;
					
						if(eventDescription != ""){ 
							ViewAdapterGraph.addLeaf("Description :"+eventDescription);
						}
						if(eventAbstract != ""){ 
							ViewAdapterGraph.addLeaf("Abstract :"+eventAbstract);
						}
						if(eventStart != ""){ 
							ViewAdapterGraph.addLeaf("Starts at :"+moment(eventStart).format('MMMM Do YYYY, h:mm:ss a'));
						}
						if(eventEnd != ""){
							ViewAdapterGraph.addLeaf("Ends at :"+moment(eventEnd).format('MMMM Do YYYY, h:mm:ss a'));
						} 
						if(locationName != ""){ 
							ViewAdapterGraph.addLeaf("Location :"+locationName);
						}
						if(eventLabel !=""){ 
							ViewAdapterGraph.addLeaf("Label :"+eventLabel);
							$("[data-role = page]").find("#DataConf").html(eventLabel);
						}
						
					}
				}
				
			}
		}
    },

	/** Command used to get and display the documents linked to an event **/ 
    getEventPublications : {
	    dataType : "XML",
	    method : "GET", 
	    getQuery : function(parameters){
		    var conferenceUri = parameters.conferenceUri;
		
		    var prefix =	'PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#>    ' +
						    'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>          ' +
						    'PREFIX dc: <http://purl.org/dc/elements/1.1/>                 ' ;
						
		    var query = 	'SELECT DISTINCT ?publiUri ?publiTitle WHERE {                 ' +
							'	<'+parameters.uri+'> swc:isSuperEventOf  ?eventUri. ' +
						    '	?eventUri swc:hasRelatedDocument ?publiUri.                ' +
						    '	?publiUri dc:title ?publiTitle.                            ' +
						    '}ORDER BY ASC(?publiTitle)';
		    var  ajaxData ={ query : prefix+query };
			return ajaxData;
		
	    },
	    ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri,callback){
			var JSONfile = {};
			$(dataXML).find("sparql > results > result").each(function(i){  
				var JSONToken = {};
				JSONToken.publiUri =  $(this).find("[name = publiUri]").text();
				JSONToken.publiTitle =  $(this).find("[name = publiTitle]").text(); 	
				JSONfile[i] = JSONToken;
			});
			StorageManager.pushCommandToStorage(currentUri,"getEventPublications",JSONfile);
			return JSONfile;
		},
		ViewCallBack : function(parameters){

			if(parameters.JSONdata != null){
				if(_.size(parameters.JSONdata) > 0 ){
					if(parameters.mode == "text"){
						parameters.contentEl.append($('<h2>Publications</h2>')); 
						ViewAdapterText.appendList(parameters.JSONdata,
											 {baseHref:'#publication/',
											  hrefCllbck:function(str){return Encoder.encode(str["publiUri"])}
                       },
											 "publiTitle",
											 parameters.contentEl
											 );
					}else{
						ViewAdapterGraph.appendList(parameters.JSONdata,
											 {baseHref:'#publication/',
											  hrefCllbck:function(str){return Encoder.encode(str["publiUri"])}
                       },
											 "publiTitle",
											 parameters.contentEl,
											 {type:"Node",labelCllbck:function(str){return "Publication : "+str["publiTitle"];}});
					
					}
				}
			} 
		}
    },
	
	
	
	
	/** Command used to get the track events of a given conference **/ 
    getConferenceMainTrackEvent : {
	    dataType : "XML",
	    method : "GET", 
	    getQuery : function(parameters){	
		    var conferenceUri = parameters.conferenceUri;
		    var prefix =	'PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#>   ' +
							'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>    ' +
						    'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>         ' ;
					     
		    var query = 	'SELECT DISTINCT ?eventUri ?eventLabel WHERE {                ' +
						    '	<'+conferenceUri+'> swc:isSuperEventOf  ?eventUri.        ' +
						    '	?eventUri rdf:type swc:TrackEvent.                        ' +
						    '	?eventUri rdfs:label ?eventLabel                          ' +
							'}ORDER BY ASC(?eventLabel)';
		    var  ajaxData = { query : prefix+query };
			return ajaxData;
	    },
	    ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri){
			var JSONfile = {};
			$(dataXML).find("sparql > results > result").each(function(i){  
				var JSONToken = {};
				JSONToken.eventLabel =  $(this).find("[name = eventLabel]").text();
				JSONToken.eventUri =  $(this).find("[name = eventUri]").text(); 	
				JSONfile[i] = JSONToken;
			});
			StorageManager.pushCommandToStorage(currentUri,"getConferenceMainTrackEvent",JSONfile);
			return JSONfile;
			
		},
			
		ViewCallBack : function(parameters){
			if(parameters.JSONdata != null){
				if(_.size(parameters.JSONdata) > 0 ){
					if(parameters.mode == "text"){
						
						parameters.contentEl.append('<h2>Browse conference tracks</h2>'); 
						ViewAdapterText.appendList(parameters.JSONdata,
												 {baseHref:'#event/',
												  hrefCllbck:function(str){return Encoder.encode(str["eventUri"])}
                         },
												 "eventLabel",
												 parameters.contentEl,
												 {type:"Node",labelCllbck:function(str){return "Track : "+str["eventLabel"];}});
					}else{ 
						ViewAdapterGraph.appendList(parameters.JSONdata,
												 {baseHref:'#event/',
												  hrefCllbck:function(str){return Encoder.encode(str["eventUri"])}
                         },
												 "eventLabel",
												 parameters.contentEl,
												 {type:"Node",
												  labelCllbck:function(str){return "Track : "+str["eventLabel"];},
												  option:{color:"#3366CC"}
                         });
					}
				}
			} 
		}
    },
	
	/** Command used to get the session events of a given publication **/ 
    getEventRelatedPublication : {
	    dataType : "XML",
	    method : "GET", 
	    getQuery : function(parameters){	
		  
		    var prefix =	'PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#>   ' +
							'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>    ' +
						    'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>         ' ;
					     
		    var query = 	'SELECT DISTINCT ?eventUri ?eventLabel WHERE {                ' +
							'	?event swc:hasRelatedDocument  <'+parameters.uri+'>  .        ' +
						    '	 ?event            swc:isSubEventOf  ?eventUri.        ' +
						    '	 ?eventUri rdfs:label ?eventLabel.                          ' +
							' FILTER (?eventUri != <'+parameters.conferenceUri+'>) '+
							'}';
		    var  ajaxData = { query : prefix + query };
			return ajaxData;
	    },
	    ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri){		
			var JSONfile = {};
			$(dataXML).find("sparql > results > result").each(function(i){  
				var JSONToken = {};
				JSONToken.eventLabel =  $(this).find("[name = eventLabel]").text();
				JSONToken.eventUri =  $(this).find("[name = eventUri]").text(); 	
				JSONfile[i] = JSONToken;
			});
			StorageManager.pushCommandToStorage(currentUri,"getEventRelatedPublication",JSONfile);
			return JSONfile;
		},
			
		ViewCallBack : function(parameters){
			if(parameters.JSONdata != null){
				if(_.size(parameters.JSONdata) > 0 ){
					if(parameters.mode == "text"){
					
						parameters.contentEl.append($('<h2>Sessions</h2>')); 
						ViewAdapterText.appendList(parameters.JSONdata,
											 {baseHref:'#event/',
											  hrefCllbck:function(str){return Encoder.encode(str["eventUri"])}
                       },
											 "eventLabel",
											 parameters.contentEl,
											 {type:"Node",labelCllbck:function(str){return "presentation : "+str["eventLabel"];}});

					}else{
						ViewAdapterGraph.appendList(parameters.JSONdata,
											 {baseHref:'#event/',
											  hrefCllbck:function(str){return Encoder.encode(str["eventUri"])}
                       },
											 "eventLabel",
											 parameters.contentEl,
											 {type:"Node",labelCllbck:function(str){return "presentation : "+str["eventLabel"];}});
					}
				}
			} 
		}
    },
	/** Command used to get the Session events of a given conference that are not subEvent of any trackEvent**/ 
    getConferenceMainSessionEvent : {
	    dataType : "XML",
	    method : "GET", 
	    getQuery : function(parameters){	
		     var prefix =	'PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#>   ' +
							'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>    ' +
						    'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>         ' ;
					     
		    var query = 	 'SELECT DISTINCT ?sessionEvent  ?sessionEventLabel WHERE {  ' +
							 '<'+parameters.uri+'/proceedings>  swc:hasPart ?publiUri .  ' +
							 '?talkEvent swc:hasRelatedDocument ?publiUri. ' +
							' ?talkEvent swc:isSubEventOf ?sessionEvent.' +
							 '?sessionEvent rdf:type swc:SessionEvent.' +
							' ?sessionEvent rdfs:label ?sessionEventLabel.' +
							'}ORDER BY ASC(?sessionEventLabel)';
		    var  ajaxData = { query : prefix+query };
			return ajaxData;
	    },
	    ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri){
			var JSONfile = {};
			$(dataXML).find("sparql > results > result").each(function(i){  
				var JSONToken = {};
				JSONToken.sessionEvent =  $(this).find("[name = sessionEvent]").text();
				JSONToken.sessionEventLabel =  $(this).find("[name = sessionEventLabel]").text(); 	
				JSONfile[i] = JSONToken;
			});
			StorageManager.pushCommandToStorage(currentUri,"getConferenceMainSessionEvent",JSONfile);
			return JSONfile;
		},
		
		ViewCallBack : function(parameters){
			if(parameters.JSONdata != null){
				if(_.size(parameters.JSONdata) > 0 ){
					if(parameters.mode == "text"){
						parameters.contentEl.append($('<h2>Sub sessions</h2>')); 
					  ViewAdapterText.appendList(parameters.JSONdata,
											 {baseHref:'#event/',
											  hrefCllbck:function(str){return Encoder.encode(str["sessionEvent"])}
                       },
											 "sessionEventLabel",
											 parameters.contentEl,
											 {type:"Node",labelCllbck:function(str){return "Track : "+str["sessionEvent"];}});

					
					}else{
					
					  ViewAdapterGraph.appendList(parameters.JSONdata,
											 {baseHref:'#event/',
											  hrefCllbck:function(str){return Encoder.encode(str["sessionEvent"])}
                       },
											 "sessionEventLabel",
											 parameters.contentEl,
											 {type:"Node",labelCllbck:function(str){return "Track : "+str["sessionEvent"];},
												  option:{color:"#3366CC"}
                       });
					}
				}
			} 
		}
    },
	
	/** Command used to get the Keynotes events of a given conference**/  
    getConferenceKeynoteEvent : {
	    dataType : "XML",
	    method : "GET", 
	    getQuery : function(parameters){	
		    var conferenceUri = parameters.conferenceUri;
		    var prefix =	'PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#>   ' +
							'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>    ' +
						    'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>         ' ;
					     
		    var query = 	'SELECT DISTINCT ?eventUri ?eventLabel WHERE {                ' +
						    '	?eventUri rdf:type swc:TalkEvent.                      ' +
						    '	OPTIONAL {?eventUri rdfs:label ?eventLabel .  }                       ' +
							' FILTER regex(str(?eventUri), "'+conferenceUri+'","i") .'+
							' FILTER regex(str(?eventLabel), "keynote","i") .'+
							'}ORDER BY ASC(?eventLabel)';
		    var  ajaxData = { query : prefix+query };
			return ajaxData;
	    },
	    ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri){
			var JSONfile = {};
			$(dataXML).find("sparql > results > result").each(function(i){  
				var JSONToken = {};
				JSONToken.eventLabel =  $(this).find("[name = eventLabel]").text();
				JSONToken.eventUri =  $(this).find("[name = eventUri]").text(); 	
				JSONfile[i] = JSONToken;
			});
			StorageManager.pushCommandToStorage(currentUri,"getConferenceKeynoteEvent",JSONfile);
			return JSONfile;
		},
			
		ViewCallBack : function(parameters){
			if(parameters.JSONdata != null){
				if(_.size(parameters.JSONdata) > 0 ){
					if(parameters.mode == "text"){
						parameters.contentEl.append($('<h2>Browse conference keynotes</h2>')); 
						ViewAdapterText.appendList(parameters.JSONdata,
										 {baseHref:'#event/',
										  hrefCllbck:function(str){return Encoder.encode(str["eventUri"])}
                     },
										 "eventLabel",
										 parameters.contentEl,
										 {type:"Node",labelCllbck:function(str){return "Keynote : "+str["eventLabel"];}});
					}else{
					
				    ViewAdapterGraph.appendList(parameters.JSONdata,
										 {baseHref:'#event/',
										  hrefCllbck:function(str){return Encoder.encode(str["eventUri"])}
                     },
										 "eventLabel",
										 parameters.contentEl,
										 {type:"Node",labelCllbck:function(str){return "Keynote : "+str["eventLabel"];}});
					
					
					}
				}
			} 
		}
    },
 
	/** Command used to get the keywords linked to a publication  **/ 
	getPublicationKeywords : {
		dataType : "XML",
		method : "GET",
		getQuery : function(parameters){

			var prefix = 	'PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#>  ' +
							'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>        ' +
							'PREFIX dc: <http://purl.org/dc/elements/1.1/>               ' +
							'PREFIX swrc: <http://swrc.ontoware.org/ontology#>           ' +
							'PREFIX foaf: <http://xmlns.com/foaf/0.1/>                   ' ;

			var query =  'SELECT DISTINCT ?keyword WHERE { ' +
						'	<'+parameters.uri+'>   dc:title  ?publiTitle. ' +
						' 	<'+parameters.uri+'>      dc:subject     ?keyword . ' +
						'}';

			var  ajaxData = { query : prefix + query };
			return ajaxData;
		},
		ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri){
			var JSONfile = {};
			$(dataXML).find("sparql > results > result").each(function(i){  
				var JSONToken = {};
				JSONToken.keyword =  $(this).find("[name = keyword]").text();
				JSONfile[i] = JSONToken;
			});
			StorageManager.pushCommandToStorage(currentUri,"getPublicationKeywords",JSONfile);
			return JSONfile;
		},
		
		ViewCallBack : function(parameters){
			if(parameters.JSONdata != null ){
				if(_.size(parameters.JSONdata) > 0 ){
					if(parameters.mode == "text"){
						parameters.contentEl.append($('<h2>Keywords</h2> '));
						$.each(parameters.JSONdata, function(i,keyword){
							StorageManager.pushKeywordToStorage(keyword.keyword);
							ViewAdapterText.appendButton(parameters.contentEl,'#keyword/'+Encoder.encode(keyword.keyword),keyword.keyword,{tiny:true});
						});
					}else{
						$.each(parameters.JSONdata, function(i,keyword){
							
							ViewAdapterGraph.addNode("Keyword : "+keyword.keyword,'#keyword/'+Encoder.encode(keyword.keyword),{color:"#3366CC"});
						});
					}
				}
			}
		}
	} ,
	
	/** Command used to get all publications linked to a keyword  **/ 
	getPublicationsByKeyword : {
		dataType : "XML",
		method : "GET",
		getQuery : function(parameters){
			 
			var keyword = Reasoner.labelToUri(parameters.uri);
			var queryText = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> select ?o { ?o  <rdf:type> <'+keyword+'> }';
									
			if(!!window.Worker){
				Reasoner.sendRequest(queryText,"null",parameters, function (results,parameters){
					
					var prefix =   	'PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#> ' + 'PREFIX dc: <http://purl.org/dc/elements/1.1/>  ' ;
					var conferenceUri = parameters.conferenceUri; 
					
					var first = true;
					KeywordsString = "";
					for(var i=0; i < results.length; i++){
						
						var keywordRes = Reasoner.UriToLabel(results[i].o);
						//if(Reasoner.filterResult(parameters.uri,keywordRes)){
							if(first != true){
								KeywordsString += "UNION";
							}
							KeywordsString += "{ ?publiUri  swc:isPartOf  <"+parameters.conferenceUri+"/proceedings>;  dc:subject '"+keywordRes+"';   dc:title     ?publiTitle. } ";

							first = false;
						//}
						
					};
					var query = 'SELECT DISTINCT ?publiUri ?publiTitle  WHERE { ' + KeywordsString + '}ORDER BY ASC(?publiTitle) ';
					AjaxLoader.executeCommand({datasource : parameters.datasource, command : SWDFCommandStore.getPublicationsByKeyword,data : {query : prefix + query}, currentUri : parameters.uri, contentEl :  contentEl = ViewAdapter.currentPage.find("#getPublicationsByKeyword"), name : parameters.name,conference : parameters.conference});
					
				});
			}else{
				ViewAdapter.currentPage.find("#getPublicationsByKeyword").append("<h2>Reasoning : Sorry your browser doesn't support web workers!</h2>");
			}
			return null;
		},
		ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri){ 
			var JSONfile = {};
			$(dataXML).find("sparql > results > result").each(function(i){  
				var JSONToken = {};
				JSONToken.publiUri =  $(this).find("[name = publiUri]").text();
				JSONToken.publiTitle =  $(this).find("[name = publiTitle]").text(); 	
				JSONfile[i] = JSONToken;
			});
			StorageManager.pushCommandToStorage(currentUri,"getPublicationsByKeyword",JSONfile);
			return JSONfile;
		},
		
		ViewCallBack : function(parameters){
			
			if(parameters.JSONdata != null){
				if(_.size(parameters.JSONdata) > 0 ){
					if(parameters.mode == "text"){
						
						parameters.contentEl.append($('<h2>Publications</h2>')); 
					  ViewAdapterText.appendList(parameters.JSONdata,
											 {baseHref:'#publication/',
											  hrefCllbck:function(str){return Encoder.encode(str["publiUri"])}
                       },
											 "publiTitle",
											 parameters.contentEl
											);

					}else{
						ViewAdapterGraph.appendList(parameters.JSONdata,
											 {baseHref:'#publication/',
											  hrefCllbck:function(str){return Encoder.encode(str["publiUri"])}
                       },
											 "publiTitle",
											 parameters.contentEl,
											 {type:"Node",labelCllbck:function(str){return "Publication : "+str["publiTitle"];}});

					}
				}
			}
		}
	 },
	
	/** Command used to get the organizations linked to an author  **/ 
	getAuthorOrganization : {
		dataType : "XML",
		method : "GET",
		getQuery : function(parameters){
			var conferenceUri = parameters.conferenceUri;
			var prefix =	'PREFIX foaf: <http://xmlns.com/foaf/0.1/>                   ' ;

			var query = 	'SELECT DISTINCT ?OrganizationName ?OrganizationUri  ?authorName WHERE {  ' +
							'  { ?authorUri   foaf:name  "'+parameters.name+'"  .           ' +
							'   ?authorUri   foaf:name  ?authorName.            '+
							'   ?OrganizationUri       foaf:member ?authorUri.            '+
							'   ?OrganizationUri       foaf:name   ?OrganizationName.    }' +
							'UNION { '+
							'   ?OrganizationUri       foaf:member  <'+parameters.uri+'> .'+
							'   ?OrganizationUri       foaf:name   ?OrganizationName.    ' +
							'    <'+parameters.uri+'>    foaf:name  ?authorName.         }' +
							'}';

			var  ajaxData = { query : prefix + query };
			return ajaxData;
		},

		ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri){
			var JSONfile = {};
			$(dataXML).find("sparql > results > result").each(function(i){  
				var JSONToken = {};
				JSONToken.OrganizationName =  $(this).find("[name = OrganizationName]").text();
				JSONToken.OrganizationUri =  $(this).find("[name = OrganizationUri]").text(); 	
				JSONToken.authorName =  $(this).find("[name = authorName]").text();
				JSONfile[i] = JSONToken;
			});
			StorageManager.pushCommandToStorage(currentUri,"getAuthorOrganization",JSONfile);
			return JSONfile;
		},
		
		ViewCallBack : function(parameters){
			if(parameters.JSONdata != null ){
				if(_.size(parameters.JSONdata) > 0 ){
					if(parameters.mode == "text"){

						parameters.contentEl.append($('<h2>Organizations</h2>'));
						$.each(parameters.JSONdata, function(i,organization){
							
							ViewAdapterText.appendButton(parameters.contentEl,'#organization/'+Encoder.encode(organization.OrganizationName)+'/'+Encoder.encode(organization.OrganizationUri),organization.OrganizationName,{tiny:true});

						});
					}else{
						
						$.each(parameters.JSONdata, function(i,organization){
						
							ViewAdapterGraph.addNode("Organization : "+organization.OrganizationName,'#organization/'+Encoder.encode(organization.OrganizationName)+'/'+Encoder.encode(organization.OrganizationUri),{color:"#FF9999"});
						
						});
					
					}
				}
			}
		}

	},
		
	
    /** Command used to get and display all members linked to an organization   **/                  
	getOrganization : {
		dataType : "XML",
		method : "GET",
		getQuery : function(parameters){
			
			var organizationUri = parameters.uri;
			var prefix =	' PREFIX foaf: <http://xmlns.com/foaf/0.1/> ' ;
			var query =  	' SELECT DISTINCT ?MemberName ?MemberUri ?organization  WHERE {' +												   
							'   <'+organizationUri+'>  foaf:member ?MemberUri.' +
							'   ?MemberUri             foaf:name   ?MemberName.' +
							'}';   															 
			var  ajaxData = { query : prefix + query };
			return ajaxData;
		},
		ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri){
			var JSONfile = {};
			$(dataXML).find("sparql > results > result").each(function(i){  
				var JSONToken = {};
				JSONToken.MemberName =  $(this).find("[name = MemberName]").text();
				JSONToken.MemberUri =  $(this).find("[name = MemberUri]").text(); 	
				JSONfile[i] = JSONToken;
			});
			StorageManager.pushCommandToStorage(currentUri,"getOrganization",JSONfile);
			return JSONfile;
		},
		
		ViewCallBack : function(parameters){
			var JSONdata = parameters.JSONdata;
			if(parameters.JSONdata != null ){
				if(_.size(parameters.JSONdata) > 0 ){
					if(parameters.mode == "text"){
						parameters.contentEl.append($('<h2>Members</h2>'));
						$.each(parameters.JSONdata, function(i,author){
							ViewAdapterText.appendButton(parameters.contentEl,'#author/'+Encoder.encode(author.MemberName)+'/'+Encoder.encode(author.MemberUri),author.MemberName,{tiny:true});
						});
					}else{
						$.each(parameters.JSONdata, function(i,author){
							ViewAdapterGraph.addNode("Member : "+author.MemberName,'#author/'+Encoder.encode(author.MemberName)+'/'+Encoder.encode(author.MemberUri),{color:"#000015"});
						});
					
					}
				}
			}
			
		}
	},
	
	/** Command used to get all publications linked to a keyword  **/ 
	getRecommendedPublications : {
		dataType : "XML",
		method : "GET",
		getQuery : function(parameters){
			var conferenceUri = parameters.conferenceUri;  
			var mostViewedKeyword = StorageAnalyser.getMostViewKeyword();
			
			if(mostViewedKeyword.length != 0){
				ViewAdapter.currentPage.find("#getRecommendedPublications").append("<h2>You seem interested by : </h2>");
				$.each(mostViewedKeyword, function(i,keyword){
					ViewAdapterText.appendButton(ViewAdapter.currentPage.find("#getRecommendedPublications"),'#keyword/'+Encoder.encode(keyword),keyword,{tiny : true});
				});
			}else{
				ViewAdapter.currentPage.find("#getRecommendedPublications").append("<h2>Please keep on visiting, we don't have enough information yet!</h2>");
			}
			

			$.each(mostViewedKeyword, function(i,keyword){
				if(keyword != undefined){
					var keyword = Reasoner.labelToUri(keyword);
					
					//var queryText = 'PREFIX owl: <http://www.w3.org/2002/07/owl#> select ?o { <'+keyword+'> <owl:SubClassOf>  ?o }';
					//parameters.uri = Reasoner.UriToLabel(keyword);
					
					Reasoner.sendRequest("getRecommendedKeywords",keyword,parameters, function (results,parameters){
						console.log(results);
						
						var first = true;
						var KeywordsRequest = "";
						var KeywordString = [];
						$.each(results, function(i,keyword){
							console.log(keyword);
							var keywordRes = Reasoner.UriToLabel(keyword);
							
							//if(Reasoner.filterResult(parameters.uri,keywordRes)){
								if(first != true){
									KeywordsRequest += "UNION";
									
								}
								KeywordsRequest += "{ ?publiUri  swc:isPartOf  <"+parameters.conferenceUri+"/proceedings>;  dc:subject '"+keywordRes+"';   dc:title     ?publiTitle. } ";
								KeywordString.push(keywordRes);
								first = false;
							//}
							
						});
						var prefix = 'PREFIX dc: <http://purl.org/dc/elements/1.1/> '+'PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#> ';
						var query = 'SELECT DISTINCT ?publiUri ?publiTitle  WHERE { ' + KeywordsRequest + '}ORDER BY ASC(?publiTitle) ';
						parameters.name = KeywordString;
						AjaxLoader.executeCommand({datasource : parameters.datasource, command : SWDFCommandStore.getRecommendedPublications,data : {query : prefix + query}, currentUri : parameters.uri, contentEl :  contentEl = ViewAdapter.currentPage.find("#getRecommendedPublications"), name : parameters.name,conference : parameters.conference});
							
						
					});
				}
			});
		
				
			
		},
		ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri,keywordList){ 
			var JSONfile = {};
			
			var remainder = "";
			$(dataXML).find("sparql > results > result").each(function(i){ 
				if( $(this).find("[name = publiTitle]").text() != remainder){			
					var JSONToken = {};
					
					JSONToken.publiUri =  $(this).find("[name = publiUri]").text();
					JSONToken.publiTitle =  $(this).find("[name = publiTitle]").text();
					
					JSONfile[i] = JSONToken;
					remainder = JSONToken.publiTitle;
				}
				
			});
			return JSONfile;
		},
		
		ViewCallBack : function(parameters){
			
			if(parameters.JSONdata != null){
				if(_.size(parameters.JSONdata) > 0 ){
					if(parameters.mode == "text"){
						
						
						var keywordBox = $("<div class='keywordsBox'><div>");
						var toSeePubliBox = $("<div><div>");
						var seenPubliBox = $("<div><div>");
						
						
						$.each(parameters.name, function(i,keyword){
							ViewAdapterText.appendButton(keywordBox,'#keyword/'+Encoder.encode(keyword),keyword,{tiny : true,prepend : true});
						});
						
						var doRender = true;
						$(".keywordsBox").each(function(i,box){
							console.log(box.textContent);
							console.log(keywordBox.text());
							if(box.textContent == keywordBox.text()){
								
								doRender = false;
							};
						});
						
						if(doRender){
							parameters.contentEl.append("<h2>You may like : </h2>"); 
							parameters.contentEl.append(keywordBox);
							parameters.contentEl.append(toSeePubliBox);
							parameters.contentEl.append(seenPubliBox);
							$.each(parameters.JSONdata, function(i,publication){
								if(StorageManager.pullCommandFromStorage(publication.publiUri) != null){
									
									var button = ViewAdapterText.appendButton(seenPubliBox,'#publication/'+Encoder.encode(publication.publiUri),publication.publiTitle,{theme :  "d"});
									button.attr("data-icon","check");
								}else{
									var button = ViewAdapterText.appendButton(toSeePubliBox,'#publication/'+Encoder.encode(publication.publiUri),publication.publiTitle,{theme : "b"});
									button.attr("data-icon","search");
								}
							});
						}
					}else{
						ViewAdapterGraph.appendList(parameters.JSONdata,
											 {baseHref:'#publication/',
											  hrefCllbck:function(str){return Encoder.encode(str["publiUri"])}
                       },
											 "publiTitle",
											 parameters.contentEl,
											 {type:"Node",labelCllbck:function(str){return "Publication : "+str["publiTitle"];}});

					}
				}
			}
		}
	 }



};

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
} 

	return SWDFCommandStore;
});