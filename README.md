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




**Most important files**:


	- js/controllers.js
	- 	Main file holding all scope variables and functions for client-side Angular application


	- index.js
	- 	Main file holding all scope variables and functions for server Express/Node application
	- 	Handles GET/POST requests, connects with socket.io and mongoDB, and API commands
	
	- exampleDocument.json 	
	- 	Structure of an example document (session) in a database



Note: This program depends on the session/prompt/idea IDs corresponding with the index of where they're stored in the database.  For example, often when searching for an idea, instead of looping through ideas within the prompt and taking the correct idea, this program goes by index of all ideas within the "Ideas" array.  This is usually not a problem since users only have the ability to add to the database.  However, when someone with that privilege deletes content from the database, be aware of how that will affect the assigning of future IDs and users' abilities to interact with them (ex. You may not be able to add ideas to a prompt with a corrupted ID.)  See [EXAMPLE ERROR] in exampleDocument.json.





