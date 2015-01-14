({
    appDir: "../",
    baseUrl: "js",
    dir: "../../BlendMin",
    modules: [
        {
           
           name : "main",
            excludeShallow: [
            	
                "jqueryMobile"
            ]
		 
        }
    ],
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
    },
    optimize: "uglify",
     uglify: {
        toplevel: true,
        ascii_only: true,
        beautify: false,
        max_line_length: 1000,

        //How to pass uglifyjs defined symbols for AST symbol replacement,
        //see "defines" options for ast_mangle in the uglifys docs.
        defines: {
            DEBUG: ['name', 'false']
        },

        //Custom value supported by r.js but done differently
        //in uglifyjs directly:
        //Skip the processor.ast_mangle() part of the uglify call (r.js 2.0.5+)
        no_mangle: true
    },
    optimizeCss: "standard",
    inlineText: true
})