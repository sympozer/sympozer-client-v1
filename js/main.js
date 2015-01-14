require.config({
    baseUrl: 'js',
	shim: {
		backbone: {
			deps: [
				'underscore', 
				'jquery'
			],
			exports: 'Backbone'
		},
		jqueryMobile: {
            deps: [
                'jquery',
                'jqueryMobile.config'
            ]
    },
        'jqueryMobile.config': {
        	deps: [
                'jquery'
            ]
        },
		'underscore': {
			exports: '_'
		},
		'jStorage': {
			deps: [
                'jquery'
            ]
		},
		'arbor':{
			deps : [
				'jquery',
				'arbor-graphics'
			],
			exports: 'arbor'
		}
  },
    paths: {
        // the left side is the module ID,
        // the right side is the path to
        // the jQuery file, relative to baseUrl.
        // Also, the path should NOT include
        // the '.js' file extension. This example
        // is using jQuery 1.9.0 located at
        // js/lib/jquery-1.9.0.js, relative to
        // the HTML page.
        jquery: 'lib/jquery',
		backbone: 'lib/backbone',
		underscore : 'lib/underscore-min',
		'jqueryMobile.config' : 'lib/jquerymobile.config',
		'renderer' : 'view/arborGraph',
		'arbor-graphics' : 'lib/arbor-graphics',
		'arbor': 'lib/arbor',
		'encoder': 'lib/encoder',
		'blob': 'lib/blob',
		'fileSaver' : 'lib/FileSaver',
		'jqueryMobile' : 'lib/jquery.mobile',
		'jStorage' : 'lib/jstorage.min',
		'moment' : 'lib/moment.min',
		'tpl' : 'lib/templateLoader',
		'ajaxLoader' : 'ajaxLoader/AjaxLoader'
    }

});
// Load the main app module to start the app
require(['app']);