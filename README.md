# sympozer-client-v1
The sympozer client v1 is the client used in the first version of the conference management system "Sympozer". This client is built around Backbone.js, jQuery mobile and Requirejs and aims to be fully functionnal using semantic technologies such as SPARQL or embedded reasonning.  

Architecture overview
-------

Backbone router: It is the central component and it communicates with all others during a requests processing in a way that respects the MVC logic and least knowledge principle. Also, one of its main role resides in the configuration JSON file interpretation which permits the identification of the requested resource type and related commands.

Configuration: The configuration component is represented by a plain old JSON file with a specific format. It includes conference informations such as the conference name, its URI and its logo path. It contains the datasources declaration including the URI of the endpoint and the cross domain method supported. To allow the router interpretation, it also provides the routes and their associated commands.

Commands: a command is a particular component that explicit how to send, treat and render a request to a datasource. For instance, there will be a particular command to retrieve the publication corresponding to an URI on a specific datasource. Commands contain the following fields: name, HTTP request method and returned datatype, as well as three methods:

- getQuery: returns the query object to send to the datasource containing a Sparql query or any parameters needed.
- modelCallback: handles the response from the datasource, performs calculations over the response data and transforms it to an internal JSON representation format.
- viewCallback: is triggered by the router to integrate these formatted data into the views.

AjaxLoader : the AjaxLoader is an Ajax centered component that is in charge of sending the requests in their related context. This context includes, the datasource URI and cross domain mode, the command HTTP request method and returned type, the query including the parameters and the model callback function.

LocalStorageManager : A wrapper to jStorage.js, a local storage api. In order to cope with datasources heterogeneity problems, DataConf relies on an internal data representation that can differ from the data format contained in the response. For this, the model callback function that handles a response is limited to transforming the data into the appropriate common representation format (depending on its nature: title, author name, homepage…) and storing them using the LocalStorageManager component functionnalities. Moreover, this architecture allows caching data in the LocalStorage object and more complex data composition into the views, since the view callback functions can wait for several types of data to be ready before starting the rendering process.

ViewAdapter: This component act as a wrapper to jQueryMobile. It exposes view rendering functionalities such as the page change management, widget generation and layout preparation. During application loading, it is setted up with the few templates needed to build a DataConf Backbone view, a footer, a navbar, a header and a draft view. The draft view represents an empty content block waiting to receive data that has to be fetched.

Request workflow
-------

The figure (doc/request-workflow.png)  enlightens the interactions between the application components. After receiving a hash change event, the application reacts as a succession of processes all triggered from the main controller (i.e. the Backbone router). The datasource querying and integration process in DataConf is structured as follows.

1)The user change pages and to view a specific resource he is interested in.

2) The router catches the event and reads the requested url. By comparing the resource type with the routes declared in the configuration file, it can retrieve the list of commands to execute and the associated datasources.

3) The router triggers the rendering of the new page by calling the ViewAdapter. The ViewAdapter triggers the page change event and prepares the new layout. This must be done before sending any requests to the datasources, so that the interface does not seem to freeze while awaiting network communications.

4) The prepared layout is pushed to the DOM.

5) Before deciding to send a request, the router first look at the available data in the storage for each commands using the command name as a key. If results are found, the Ajax process is bypassed and the router goes directly to step 10.

6) To prepare the Ajax requests associated with the commands, the getQuery() method is callback to precise the return format, and the needed parameters including the uri of the resource to view.

7) The query provided is reused to send a request with the datasoure related to the command configurations such as the cross domain mode to use and its uri.

8) When receiving Ajax results, the model callback is executed and will perform a translation of the results into an internal format before returning them to the router.

9)The treated results are pushed in the storage.

10) The view callback is called to render the results directly in the previously prepared layout.



License
-------

This project is under the Creative Common license CC-BY-NC-SA.
[![Build Status](http://i.creativecommons.org/l/by-nc-sa/3.0/88x31.png)](https://creativecommons.org/licenses/by-nc-sa/3.0/)A. 
