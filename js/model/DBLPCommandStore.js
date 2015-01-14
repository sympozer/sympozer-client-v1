/**   
*	Copyright <c> Claude Bernard - University Lyon 1 -  2013
* 	License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing 
*   Author: Lionel MEDINI(supervisor), Florian BACLE, Fiona LEPEUTREC, Beno�t DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan
*   Description: This object contains a json definition of all the commands that will prepare all the queries we want to send on the DBLP sparql endpoint.
*				 Each one of those commands declare the datatype, the method, the query string it is supposed to use on the endpoint and provide the Callback function used to parse the results.		
*				 To declare a request, each commands can use the parameters declared for the route they are called in (see Configuration.js). This parameter can be a name or an uri and represents
*				 the entity which we want informations on. After calling a command, the results are parsed with it own callback function. It is the role of the router to call those commands according to the configuration file.
*   Version: 1.2
*   Tags:  JSON, SPARQL, AJAX
**/
define(['jquery', 'underscore', 'encoder','view/ViewAdapter', 'view/ViewAdapterText', 'localStorage/localStorageManager','labels' ], function($, _, Encoder, ViewAdapter, ViewAdapterText, StorageManager, labels){
	var DBLPCommandStore = {
	 
		getAuthorPublications : {
			dataType : "XML",
			method : "GET",
			serviceUri : "",
			getQuery : function(parameters){ 
					
				var prefix =  '  PREFIX akt:  <http://www.aktors.org/ontology/portal#>   ';  
				
				var nameToUpper = '';
				$.each(parameters.name.toLowerCase().split(' '), function(i,currentWord){
					nameToUpper+= this.charAt(0).toUpperCase() + this.slice(1) + ' ';
				})
				var validName = nameToUpper.substring(0, nameToUpper.length-1) || null;

				var query =   ' SELECT DISTINCT ?publiUri ?publiTitle WHERE { '+
								'OPTIONAL{	?publiUri akt:has-author <'+parameters.uri+'>   '+
								'	?publiUri  akt:has-title ?publiTitle. } '+
								' {	?publiUri akt:has-author ?o       '+
								'	?o akt:full-name "'+validName+'". '+
								'	?publiUri  akt:has-title ?publiTitle.  }'+
								'} ';
				var  ajaxData = { query : prefix + query };
				return ajaxData;
			},
		
			ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri){ 
				var JSONfile = {};
				$(dataXML).find("sparql > results > result").each(function(i){ 
					var JSONToken = {};
					JSONToken.publiTitle =  $(this).find("[name = publiTitle]").text();
					JSONToken.publiUri =   $(this).find("[name = publiUri]").text();			
					JSONfile[i] = JSONToken;
				});
				//StorageManager.pushCommandToStorage(currentUri,"getAuthorPublications",JSONfile);
				return JSONfile;
			},
			
			ViewCallBack : function(parameters){
				if(parameters.JSONdata != null){
					if(_.size(parameters.JSONdata) > 0 ){
						if(parameters.mode == "text"){
							parameters.contentEl.append('<h2>'+labels[parameters.conference.lang].person.otherPublications+'</h2>');
							ViewAdapterText.appendList(parameters.JSONdata,
														 {baseHref:'#externPublication/',
														  hrefCllbck:function(str){return Encoder.encode(str["publiUri"])}},
														 "publiTitle",
														 parameters.contentEl,
														 {type:"Node",labelCllbck:function(str){return "External paper : "+str["publiTitle"];}}
														 );
				
						}
					}
				} 
			}
		},
		
		getExternPublicationAuthors : {
			dataType : "XML",
			method : "GET",
			serviceUri : "",
			getQuery : function(parameters){ 
				
				var prefix =  '  PREFIX akt:  <http://www.aktors.org/ontology/portal#>   ';  
									
				var query =   ' SELECT DISTINCT ?authorUri  ?authorName WHERE { '+
								'	<'+parameters.uri+'> akt:has-author ?authorUri       '+
								'	?authorUri  akt:full-name ?authorName. '+
								'}  ';
				var  ajaxData = { query : prefix + query };
				return ajaxData;
			},
		
			ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri){ 
				var JSONfile = {};
				$(dataXML).find("sparql > results > result").each(function(i){ 
					var JSONToken = {};
					JSONToken.authorName =  $(this).find("[name = authorName]").text();
					JSONToken.authorUri =   $(this).find("[name = authorUri]").text();			
					JSONfile[i] = JSONToken;
				});
				//StorageManager.pushCommandToStorage(currentUri,"getExternPublicationAuthors",JSONfile);
				return JSONfile;	
			},
			
			ViewCallBack : function(parameters){ 
				if(parameters.JSONdata != null){
					if(_.size(parameters.JSONdata) > 0 ){
						if(parameters.mode == "text"){
							parameters.contentEl.append('<h2>'+labels[parameters.conference.lang].otherPublication.authors+'</h2>');
							$.each(parameters.JSONdata, function(i,auhtor){
								ViewAdapterText.appendButton(parameters.contentEl,'#person/'+Encoder.encode(auhtor.authorName)+'/'+Encoder.encode(auhtor.authorUri),auhtor.authorName,{tiny : true});
							});
						}
					}
				}
			}
		},
	                                
	                                
		getExternPublicationInfo : {
			dataType : "XML",
			method : "GET",
			serviceUri : "",
			getQuery : function(parameters){ 
				var prefix =    ' PREFIX akt:  <http://www.aktors.org/ontology/portal#>               '+ 
								' PREFIX akts: <http://www.aktors.org/ontology/support#>       '; 
									
				var query =     ' SELECT DISTINCT ?publiTitle ?publiDate ?publiJournal ?publiLink ?publiResume WHERE {  '+
								'	OPTIONAL { <'+parameters.uri+'>   akt:article-of-journal ?publiJournalUri. '+	
								'	?publiJournalUri akt:has-title ?publiJournal   . }'+
								'	OPTIONAL {<'+parameters.uri+'>   akt:has-date  ?year. '+
								'   ?year				   akts:year-of ?publiDate. }'+
								'	OPTIONAL {<'+parameters.uri+'>   akt:has-title ?publiTitle. } '+
								
								'	OPTIONAL {<'+parameters.uri+'>  akt:cites-publication-reference ?publiResumeUri. '+
								'	?publiResumeUri akt:has-title  ?publiResume . } '+
								'	OPTIONAL {<'+parameters.uri+'>   akt:has-web-address ?publiLink. }'+
								' } ';
				var  ajaxData = { query : prefix+query , output : "json"};
				return ajaxData;
			},
			ModelCallBack : function(dataXML,conferenceUri,datasourceUri, currentUri){
				var JSONfile = {};
				$(dataXML).find("sparql > results > result").each(function(i){  
					var JSONToken = {};
					JSONToken.title       = $(this).find("[name = publiTitle]").text();
					JSONToken.resume       = $(this).find("[name = publiResume]").text();
					JSONToken.year        = $(this).find("[name = publiDate]").text();
					JSONToken.publisher   = $(this).find("[name = publiJournal]").text();
					JSONToken.publiLink   = $(this).find("[name = publiLink]").text();
					JSONfile[i] = JSONToken;
				});
				StorageManager.pushCommandToStorage(currentUri,"getExternPublicationInfo",JSONfile);
				return JSONfile;
			},
			
			ViewCallBack : function(parameters){
				if(parameters.JSONdata != null){
					var publiInfo = parameters.JSONdata;
					if(_.size(publiInfo) > 0 ){
						if(parameters.mode == "text"){
									  
							var title  = publiInfo[0].title;				
							var link  = publiInfo[0].publiLink;	
							var resume  = publiInfo[0].resume;	
							var year  = publiInfo[0].year;	
							var publisher  = publiInfo[0].publisher;	
							
						
							if(title != ""){  
								parameters.contentEl.append('<h2>'+labels[parameters.conference.lang].otherPublication.title+'</h2>');
								parameters.contentEl.append('<p>'+title+'</p>'); 
							} 
							if(resume != ""){  
								parameters.contentEl.append('<h2>'+labels[parameters.conference.lang].otherPublication.reference+'</h2>');
								parameters.contentEl.append('<p>'+resume+'</p>'); 
							} 
							if(link != ""){ 
								parameters.contentEl.append('<h2>'+labels[parameters.conference.lang].otherPublication.link+'</h2>');
								parameters.contentEl.append('<a href="'+link+'">'+link+'</p>');
							}
							if(year != ""){ 
								parameters.contentEl.append('<h2>'+labels[parameters.conference.lang].otherPublication.year+'</h2>');
								parameters.contentEl.append('<p>'+year+'</p>'); 
							}
							if(publisher !=""){ 
								parameters.contentEl.append('<h2>'+labels[parameters.conference.lang].otherPublication.publisher+'</h2>');
								parameters.contentEl.append('<p>'+publisher+'</p>'); 
							}
						}
					}
				}
			}
		}
	};   
	return DBLPCommandStore;                                                           
});


    
 
