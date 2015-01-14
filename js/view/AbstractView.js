 /**   
*	Copyright <c> Claude Bernard - University Lyon 1 -  2013
* 	License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing 
*   Author: Lionel MEDINI(supervisor), Florian BACLE, Fiona LEPEUTREC, Benoît DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan
*   Description: The abstract view is a generic view used for any instance of the views in the application. At every change of page, a new abstract view is created.
*				 This view is setted up to render header, footer and navbar no matters what. For the content part, two options are possible. If the parameter contentEl
*				 matches with a templates name, it is rendered, otherwise an empty content section is rendered.
*	 Version: 1.2		   
*   Tags:  TEMPLATE
**/
define(['jquery', 'underscore', 'tpl','labels'], function($, _, tpl, labels){
	var AbstractView = Backbone.View.extend({


		/** Compilation of the templates **/
		initialize: function (options){
		
			this.title = options.title;

			this.model = options.model;

			this.headerTpl = _.template(tpl.get("header"));
			this.navBarTpl = _.template(tpl.get("navBar"));
			this.settingsPanelTpl = _.template(tpl.get("settingsPanel"));
			this.bonusPanelTpl = _.template(tpl.get("bonusPanel"));

			this.templateName = options.templateName;
		
			if(tpl.get(this.templateName)!== undefined){
				this.contentTpl = _.template(tpl.get(this.templateName));
			}else{
				this.contentTpl =  _.template('<article><section class="content"></section></article>');
			}
			this.footerTpl = _.template(tpl.get("footer"));
		},

		/** Rendering of the templates **/
		render: function(){
			var titleTrans = labels[this.model.lang].pageTitles[this.title] || this.title;
			$(this.el).append(this.headerTpl({conference : this.model, title : titleTrans, labels : labels[this.model.lang]} ));
			$(this.el).append(this.navBarTpl({modules : tpl.modules,  labels : labels[this.model.lang]}));
			$(this.el).append(this.contentTpl({conference : this.model,modules : tpl.modules,  labels : labels[this.model.lang]}));
			$(this.el).append(this.footerTpl({conference : this.model,  labels : labels[this.model.lang]}));
			$(this.el).append(this.settingsPanelTpl({conference : this.model, labels : labels[this.model.lang]}));
			$(this.el).append(this.bonusPanelTpl({conference : this.model,  labels : labels[this.model.lang]}));
		}
	});
	return AbstractView;
});
