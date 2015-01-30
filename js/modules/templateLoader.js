/**
 *	Copyright <c> Claude Bernard - University Lyon 1 -  2013
 * 	License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing
 *   Author: Lionel MEDINI(supervisor), Florian BACLE, Fiona LEPEUTREC, Benoît DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan
 *   Description: This file contains the functions used to get and store all the templates found on /templates. The storing system uses an array of the template's name to load (see entryPoint/main.js)
 *				 When loaded, every template are accessible by their name using the "get" method
 *	Version: 1.2
 *   Tags:  TEMPLATE
 **/
define(['backbone', 'jquery'], function(Backbone, $){
  var tpl = {
    // Hash of preloaded templates for the app
    templates:{},
    modules:{},
    /** Template loader function
     * It takes an array of name and retrieves the according template found in the <body> by id (workaround to load templates fully client-side)
     * names : Array of the template's name to load
     * callback : function called when the loading is done, in our case, stating the router
     **/
    loadTemplates:function (names, callback) {
      var that = this;

      //Get all template from <body> by id
      for(var i=0; i<names.length; i++) {
        var name = names[i];
        that.templates[name] = $("#" + name).html();
      }
      callback();
    },

    /** Template getter function
     * name : name of the template to retrieve
     **/
    get:function (name) {
      return this.templates[name];
    }
  };

  return tpl;
});