/**
 * Copyright <c> Claude Bernard - University Lyon 1 -  2013
 *  License : This file is part of the DataConf application, which is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License. See details at : http://liris.cnrs.fr/lionel.medini/wiki/doku.php?id=dataconf&#licensing
 *   Author: Lionel MEDINI(supervisor), Florian BACLE, Fiona LEPEUTREC, Benoît DURANT-DE-LA-PASTELLIERE, NGUYEN Hoang Duy Tan
 *   Description: This object is a sort of view controller, it is in charge of changing the page.
 *                It is directly connected to the ViewAdapterText on which it will trigger events in right order.
 *   Version: 1.2
 **/
define(['jquery', 'jqueryMobile', 'encoder', 'ViewAdapterText', 'AbstractView', 'localStorageManager', 'appConfig', 'localDao'], function($, jqueryMobile, encoder, ViewAdapterText, AbstractView, StorageManager, appConfig, localDao){

    //Specific class management, depending on the element type (poster, demo...)
    var oldClassName = null,
        currentClassName = null;

    return {
        update : function(routeItem, hashtag, conference, datasources, uri, name) {
            this.template = routeItem.view;
            this.conference = conference;
            this.datasources = datasources;
            this.hashtag = hashtag;
            this.commands = routeItem.commands;
            this.uri = uri;
            this.name = name;
            this.currentPage = this.changePage(
                new AbstractView(
                    {
                        templateName : this.template,
                        title : this.name,
                        model : this.conference
                    }
                )
            );
            this.initPage();
            return this.currentPage ;
        },

        /**
         * Changing page handling, call the rendering of the page and execute transition
         * **/
        changePage : function (page, transitionEffect) {

            $(page.el).attr('data-role', 'page');
            $(page.el).attr('class', 'page');

            page.render();
            $('body').append($(page.el));
            var transition = $.mobile.defaultPageTransition;
            if(transitionEffect !== undefined){
                transition = transitionEffect;
            }
            jqueryMobile.changePage($(page.el), {changeHash:false, transition: transition});

            $(page.el).bind('pagehide', function(event, data) {
                $(event.currentTarget).remove();
            });


            return $(page.el);
        },

        initPage : function (){
            _.each(this.commands,function(commandItem){
                ViewAdapterText.generateContainer(this.currentPage,commandItem.name);
            },this);

            this.addControlButton();
        },

        /**
         * Changes current page CSS class to render according to business rules
         */
        setSpecificStyle: function() {
            if(oldClassName) {
                this.currentPage.removeClass(oldClassName);
                $("header div").removeClass(oldClassName);
                $("#navBar *").removeClass(oldClassName + "Inverse");
                $("#footer *").removeClass(oldClassName + "Inverse");
            }
            if(currentClassName) {
                this.currentPage.addClass(currentClassName);
                $("header div").addClass(currentClassName);
                $("#navBar *").addClass(currentClassName + "Inverse");
                $("#footer *").addClass(currentClassName + "Inverse");
            }
        },

        addControlButton : function (){
            var currentUrl = encoder.encode(document.URL);
            var currentHashTag = encoder.encode(this.hashtag);

            var facebookLink = this.currentPage.find("#facebookLink");
            facebookLink.attr("href","http://www.facebook.com/sharer/sharer.php?u="+currentUrl);


            var twitterLink = this.currentPage.find("#twitterLink");
            twitterLink.attr("href","https://twitter.com/intent/tweet?text="+currentHashTag+"&url="+currentUrl);


            var googleLink = this.currentPage.find("#googleLink");
            googleLink.attr("href","https://plus.google.com/share?url="+currentUrl);

            var linkedinLink = this.currentPage.find("#linkedinLink");
            linkedinLink.attr("href","http://www.linkedin.com/shareArticle?mini=true&url="+currentUrl);


            //Handle switch of storage mode on/off
            var switchStorageModeBtn = this.currentPage.find("#flip-storage");
            switchStorageModeBtn.val(StorageManager.getMode()).slider('refresh');
            switchStorageModeBtn.on( "slidestop", function() {
                StorageManager.switchMode(this.value);
            });

            //Handle update dataset button
            var updateDatasetBtn = this.currentPage.find("#updateAll");
            updateDatasetBtn.on( "click", function() {
                $.getJSON(appConfig.conference.updateUri, function(newDataset) {
                    StorageManager.set("dataset", newDataset);
                    $("#updateResults").html((newDataset.categories.length + newDataset.events.length + newDataset.locations.length + newDataset.organizations.length + newDataset.persons.length + newDataset.publications.length) + " elements fetched.");
                    localDao.initialize();
                });
            });
        },

        generateJQMobileElement : function(className){
            //Managing specific style from ViewCallbacks
            oldClassName = currentClassName;
            currentClassName = className;
            this.setSpecificStyle();

            this.currentPage.trigger("create");
        }
    };
});

