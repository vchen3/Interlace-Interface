# Interlace-Interface
Download the latest version of npm, node, and all dependencies listed in package.json 


TO RUN: Open three tabs in terminal and run the following commands:


	* TAB 1: ulimit -n 1024 && mongod

	* TAB 2: mongo --shell

	* TAB 3: node index.js




Most important files:


	* js/controllers.js


		- Main file holding all scope variables and functions for client-side Angular application


	* index.js


		- Main file holding all scope variables and functions for server Express/Node application


		- Handles GET/POST requests, connects with socket.io and mongoDB, and API commands



Note: This program strongly depends on the session/prompt/idea IDs corresponding with the index of where they're stored in the database.  For example, often when searching for an idea, instead of looping through ideas within the prompt and taking the correct idea, this program goes by index of all ideas within the "Ideas" array.  Specifically: searching for idea 1.1.4 (the 4th idea responding to Prompt 1.1 in Session 1) will return the idea in index 3 in the ideas array, instead of looping through each idea and pulling back idea 1.1.4.  This is usually not a problem since users only have the ability to add to the database.  However, when someone with that privilege deletes content from the database, be aware of how that will affect the assigning of future IDs and users' abilities to interact with them (ex. You may not be able to add ideas to a prompt with a corrupted ID.)  See [EXAMPLE ERROR] below.

Structure of an example document (session) in a database:


{
	"_id" : ObjectId("57a8a1ca7909460733f208b2"),
	"sessionID" : 1,
	"title" : "World Geography",
	"teacherName" : "Rachel Kelly",
	"date" : "June 22 2016",
	"visible" : true,
	"prompts" : [
		{
			"promptID" : 1.1,
			"text" : "Share a fact or an image about the world.",
			"ideas" : [
				{
					"ID" : "1.1.1",
					"name" : "Chris",
					"time" : 1469199370000,
					"contentType" : "text",
					"content" : "Greenland is the largest island in the world.",
					"likes" : 24
				},
				{
					"ID" : "1.1.2",
					"name" : "Albus PercivalWulfricBrianDumbledore",
					"time" : 1469199370000,
					"contentType" : "text",
					"content" : "Vatican City is the smallest country in the world.",
					"likes" : 17
				}


				//[EXAMPLE ERROR]: 

				Say you add two ideas 1.1.3 and 1.1.4, but then decide to delete idea 1.1.3.  Now, the idea "1.1.4" is the third idea in the array and exists at index 2.  When the client interacts with idea 1.1.4 on the interface, the program will try to call idea 1.1.4 as the fourth idea in the array that exists at index 3, and will state that the idea is "undefined".


			]
		},
		{
			"promptID" : 1.2,
			"text" : "How do forces act on us?",
			"ideas" : [
				{
					"ID" : "1.2.1",
					"name" : "Allen",
					"time" : 1469124849197,
					"contentType" : "text",
					"content" : "Friction is the force exerted by a surface as an object moves across it.",
					"likes" : 4
				},
				{
					"ID" : "1.2.2",
					"name" : "Anna",
					"time" : 1469124894977,
					"contentType" : "image",
					"content" : "http://cdn.funkidslive.com/wp-content/uploads/carforces-physics-245x170-custom.jpg",
					"likes" : 10
				}
			]
		}
	]
}
