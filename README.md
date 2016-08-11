# Interlace-Interface

Open three tabs in terminal and run the following commands:


	* TAB 1: ulimit -n 1024 && mongod

	* TAB 2: mongo --shell

	* TAB 3: node index.js



Download the latest version of npm, node, and all dependencies listed in package.json 



Most important files:


	* js/controllers.js


		- Main file holding all scope variables and functions for client-side Angular application


	* index.js


		- Main file holding all scope variables and functions for server Express/Node application


		- Handles GET/POST requests, connects with socket.io and mongoDB, and API commands



Note: This program strongly depends on the integrity of the IDs (in terms of being relative to the index in the database) of each session, prompt, and idea.  When deleting content from the database, be aware of how that will affect the assigning of future IDs and users' abilities to interact with them (ex. Liking an idea may no longer work even if one idea's ID is incorrect)

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
