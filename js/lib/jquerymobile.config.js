define(['jquery'], function ($) {
    $(document).on("mobileinit", function () {
        $.mobile.ajaxEnabled = false;
        $.mobile.hashListeningEnabled = false;
        $.mobile.pushStateEnabled = false;
        $.mobile.linkBindingEnabled = false; //-- works properly with jqm 1.1.1 rc1

        // use ? $.mobile.autoInitializePage = false;
       /*  $(document).on("mobileinit", function () {
        jqueryMobile.ajaxEnabled = false;
        jqueryMobile.linkBindingEnabled = false;
        jqueryMobile.hashListeningEnabled = false;
        jqueryMobile.pushStateEnabled = false;
        jqueryMobile.defaultPageTransition = "slidefade";
        jqueryMobile.useFastClick = true;
         });*/
        $.mobile.defaultDialogTransition = "none";
        $.mobile.defaultPageTransition = "slidefade";
        $.mobile.page.prototype.options.degradeInputs.date = true;
        $.mobile.page.prototype.options.domCache = false;

        //enable flag to disable rendering
        // $.mobile.ignoreContentEnabled=true;
        $.mobile.pushStateEnabled = true;
        $.mobile.phonegapNavigationEnabled = true;
        // enable loading page+icon
        $.mobile.loader.prototype.options.text = "loading";
        $.mobile.loader.prototype.options.textVisible = false;
        $.mobile.loader.prototype.options.theme = "a";
        $.mobile.loader.prototype.options.html = "";
    });
});