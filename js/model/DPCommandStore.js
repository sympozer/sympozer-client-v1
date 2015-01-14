  /**   
 *   Copyright <c> Claude Bernard - University Lyon 1 -  2013
 *   Author: Lionnel MEDINI(supervisor), Florian BACLE, Fiona LEPEUTREC, Benoît DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan, Nicolas ARMANDO
 *   Description: Command store for the DataPaper datasource. Those information can be a lot of different thing, an email, a pdf link, a telephone number depending on the entity browsed.
 *   Version: 1.2
 *   Tags:  REST, AJAX
 **/
 define(['jquery', 'underscore', 'encoder', 'view/ViewAdapterText', 'localStorage/localStorageManager'], function($, _, Encoder, ViewAdapterText, StorageManager){
	 var DPCommandStore = {
	  
		/** This command is used to retrieve complementary informations of a publication **/
		getDataPaperRessource : {
			dataType : "JSONP",
			method : "GET",
			serviceUri : "",
			getQuery : function(parameters){
						var  ajaxData = 'key=["'+parameters.uri+'","document"]';
						return ajaxData;
			},
											
			ModelCallBack : function (dataJSON,conferenceUri,datasourceUri, currentUri){

				var JSONToken = {};
				if(dataJSON.rows.length>0){
					JSONToken.ressource  = dataJSON.rows[0].value;
				}

				StorageManager.pushCommandToStorage(currentUri,"getDataPaperRessource",JSONToken);
				return JSONToken;
			},
				
				
			ViewCallBack : function(parameters){
				if( parameters.JSONdata!= null){
					var dataPaper = parameters.JSONdata;

					if(dataPaper.hasOwnProperty("ressource")){
						var resourcesList = parameters.JSONdata.ressource || null;
							for(var resource in resourcesList ){
								if(resourcesList[resource]){

									switch(resource){
										case "dce_coverage" : parameters.contentEl.append('<h2>Coverage</h2>'+resourcesList[resource]); break;
										case "dce_source" : parameters.contentEl.append('<h2>Source</h2>'+resourcesList[resource]);break;
										case "dce_contributor" : parameters.contentEl.append('<h2>Contributor</h2>'+resourcesList[resource]);break;
										case "dce_date" : parameters.contentEl.append('<h2>Date</h2>'+resourcesList[resource]);break;
										case "dce_identifier" : parameters.contentEl.append('<h2>Identifier</h2>'+resourcesList[resource]);break;
										case "dce_publisher" : parameters.contentEl.append('<h2>Publisher</h2>'+resourcesList[resource]);break;
										case "dce_language" : parameters.contentEl.append('<h2>Language</h2>'+resourcesList[resource]);break;
										case "dce_relation" : parameters.contentEl.append('<h2>Relation</h2>'+resourcesList[resource]);break;
										case "dce_type" : parameters.contentEl.append('<h2>Type</h2>'+resourcesList[resource]);break;
										case "dce_description" : parameters.contentEl.append('<h2>Description</h2>'+resourcesList[resource]);break;
										case "dce_subject" : parameters.contentEl.append('<h2>Subject</h2>'+resourcesList[resource]);break;
										default : "";
									}
								}
							}

					}
				}
			}   
		},

		/** This command is used to retrieve contact informations **/
		getDataPaperAuthor : {
			dataType : "JSONP",
			method : "GET",
			serviceUri : "",
			getQuery : function(parameters){ 
						var  ajaxData = 'key=["'+parameters.uri+'","document"]';
					
						return ajaxData;
			},							
			ModelCallBack : function (dataJSON,conferenceUri,datasourceUri, currentUri){

				var JSONToken = {};
				if(dataJSON.rows.length>0){
					JSONToken.ressource  = dataJSON.rows[0].value;
				}

				StorageManager.pushCommandToStorage(currentUri,"getDataPaperAuthor",JSONToken);
				return JSONToken;
			},	
			ViewCallBack : function(parameters){
	
				if( parameters.JSONdata!= null){
					var dataPaper = parameters.JSONdata;
					if(dataPaper.hasOwnProperty("ressource")){
						// if(dataPaper[0].ressource.length>0){
						// 	if(parameters.mode == "text"){
						// 		// var out="<table>";
						// 		// for(i=0;i<dataPaper[0].ressource.length;i++){
						// 		// 	if(dataPaper[0].ressource[i].value.type==="user-photo"){
						// 		// 		parameters.contentEl.append('<figure style="height:120px; width:120px; "><img style="height:100%; width:100%; clear:left;" src="'+dataPaper[0].ressource[i].value.url+'" alt="'+dataPaper[0].ressource[i].value.description+'">  </figure>');
						// 		// 	}else if(dataPaper[0].ressource[i].value.type==="user-mail"){
						// 		// 		out+="<tr><td>"+dataPaper[0].ressource[i].value.description+"</td><td>"+'<address><a href="maito:'+dataPaper[0].ressource[i].value.url+'">'+dataPaper[0].ressource[i].value.url+'</a></address></td></tr>';
						// 		// 	}else{
						// 		// 		out+="<tr><td>"+dataPaper[0].ressource[i].value.description+"</td><td>"+'<a href="'+dataPaper[0].ressource[i].value.url+'" data-role="button" >'+dataPaper[0].ressource[i].value.type.replace('user-','')+'</a></td></tr>';
						// 		// 	}
						// 		// }
						// 		// out+="</table>";
						// 		// parameters.contentEl.append('<h2>Contact</h2>');
						// 		// parameters.contentEl.append(out);	
						// 	}
							var resourcesList = parameters.JSONdata.ressource || null;
							for(var resource in resourcesList ){
			
								if(resourcesList[resource]){
									switch(resource){
										case "foaf_img" : parameters.contentEl.append('<figure style="height:120px; width:120px; "><img style="height:100%; width:100%; clear:left;" src="'+resourcesList[resource]+'" alt="person image">  </figure>'); break;
										case "foaf_Image" : parameters.contentEl.append('<figure style="height:120px; width:120px; "><img style="height:100%; width:100%; clear:left;" src="'+resourcesList[resource]+'" alt="person image">  </figure>'); break;
										case "description" : parameters.contentEl.append('<h2>Description</h2>'+resourcesList[resource]); break;
										case "foaf_OnlineGamingAccount" : parameters.contentEl.append('<h2>Online Gaming Account</h2>'+resourcesList[resource]); break;
										case "foaf_depiction" : parameters.contentEl.append('<h2>Depiction</h2>'+resourcesList[resource]); break;
										case "foaf_fundedBy" : parameters.contentEl.append('<h2>Founded by</h2>'+resourcesList[resource]); break;
										case "foaf_geekcode" : parameters.contentEl.append('<h2>Geek code</h2>'+resourcesList[resource]); break;
										case "foaf_jabberID" : parameters.contentEl.append('<h2>Jabber id</h2>'+resourcesList[resource]); break;
										case "foaf_msnChatID" : parameters.contentEl.append('<h2>Msn id</h2>'+resourcesList[resource]); break;
										case "foaf_nick" : parameters.contentEl.append('<h2>Nickname</h2>'+resourcesList[resource]); break;
										case "foaf_Agent" : parameters.contentEl.append('<h2>Agent at</h2>'+resourcesList[resource]); break;
										case "foaf_Group" : parameters.contentEl.append('<h2>Part of</h2>'+resourcesList[resource]); break;
										case "foaf_OnlineChatAccount" : parameters.contentEl.append('<h2>Chat account</h2>'+resourcesList[resource]); break;


										case "foaf_based_near" : parameters.contentEl.append('<h2>Based near</h2>'+resourcesList[resource]); break;
										case "foaf_birthday" : parameters.contentEl.append('<h2>Birthday</h2>'+resourcesList[resource]); break;
										case "foaf_currentProject" : parameters.contentEl.append('<h2>Current project</h2>'+resourcesList[resource]); break;
										case "foaf_focus" : parameters.contentEl.append('<h2>Focused on</h2>'+resourcesList[resource]); break;
										
										case "foaf_homepage" : parameters.contentEl.append('<h2>Homepage</h2>'+resourcesList[resource]); break;
										case "foaf_logo" : parameters.contentEl.append('<h2>Logo</h2>'+resourcesList[resource]); break;
										case "foaf_primaryTopic" : parameters.contentEl.append('<h2>Primary topic</h2>'+resourcesList[resource]); break;
										case "foaf_theme" : parameters.contentEl.append('<h2>Theme</h2>'+resourcesList[resource]); break;
										case "foaf_Document" : parameters.contentEl.append('<h2>Related document</h2>'+resourcesList[resource]); break;

										case "foaf_OnlineEcommerceAccount" : parameters.contentEl.append('<h2>E-commerce account</h2>'+resourcesList[resource]); break;
										case "foaf_age" : parameters.contentEl.append('<h2>Age</h2>'+resourcesList[resource]); break;
										case "foaf_pastProject" : parameters.contentEl.append('<h2>Past project</h2>'+resourcesList[resource]); break;
										case "foaf_phone" : parameters.contentEl.append('<h2>Phone number</h2>'+resourcesList[resource]); break;
										case "foaf_interest" : parameters.contentEl.append('<h2>Interest</h2>'+resourcesList[resource]); break;
										case "foaf_knows" : parameters.contentEl.append('<h2>Knows</h2>'+resourcesList[resource]); break;
										case "foaf_interest" : parameters.contentEl.append('<h2>Interest</h2>'+resourcesList[resource]); break;

										case "foaf_thumbnail" : parameters.contentEl.append('<h2>Thumbnail</h2>'+resourcesList[resource]); break;
										case "foaf_topic_interest" : parameters.contentEl.append('<h2>Interested in</h2>'+resourcesList[resource]); break;
										case "foaf_workInfoHomepage" : parameters.contentEl.append('<h2>Work homepage</h2>'+resourcesList[resource]); break;
										case "foaf_topic_interest" : parameters.contentEl.append('<h2>Interested in</h2>'+resourcesList[resource]); break;
										case "foaf_PersonalProfileDocument" : parameters.contentEl.append('<h2>Personal profile document</h2>'+resourcesList[resource]); break;
										default : "";

									}
								}	
							}

					}
				}
			}   
		}
	};

	return DPCommandStore;
});