[Interlace-Interface](https://docs.google.com/presentation/d/1yvhLQJ7hRzljVvPQbLTe5dbzsLeWmw1e5GT7RAu74uY/edit?usp=sharing)



**TO RUN:** 
Download the latest version of npm, node, and all dependencies listed in package.json 

Open three tabs in terminal and run the following commands:
	
	TAB 1: ulimit -n 1024 && mongod

	TAB 2: mongo --shell

	TAB 3: node index.js


**Folders**


	/js				Holds controllers.js


	/lib and /node_modules		Holds Angular library and node modules


	/public				Holds /img folder of temporary images and .css page




**Most Important files**:

	- js/controllers.js
	- 	Main file holding all scope variables and functions for client-side Angular application

	- index.js
	- 	Main file holding all scope variables and functions for server Express/Node application
	- 	Handles GET/POST requests, connects with socket.io and mongoDB, and API commands
	
	- exampleDocument.json 	
	- 	Structure of an example document (session) in a database


**Flow of Data**

	**HTML** <-scope variables, JavaScript functions-> **CONTROLLERS.JS (ANGULAR)** <-RESTful API-> **INDEX.JS (NODE-EXPRESS APP AND SERVER)**

example:

	-User interacts with front-end HTML, which calls a JavaScript function stored in controllers.js (Angular)
	
	-controllers.js interacts with index.js (Node-Express app and server) through a RESTful API
	
	-index.js connects with mongoDB database to pull or edit data, and returns relevent information to the request in controllers.js
	
	-controllers.js uses this information to update scope variables that can be displayed in HTML


**Areas to Grow**

This program depends on the session/prompt/idea IDs corresponding with the index of where they're stored in the database.  For example, often when searching for an idea, instead of looping through ideas within the prompt and taking the correct idea, this program goes by index of all ideas within the "Ideas" array.  This is usually not a problem since users only have the ability to add to the database.  However, when someone with that privilege deletes content from the database, be aware of how that will affect the assigning of future IDs and users' abilities to interact with them (ex. You may not be able to add ideas to a prompt with a corrupted ID.)  See [EXAMPLE ERROR] in exampleDocument.json.





