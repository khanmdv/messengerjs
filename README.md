messengerjs
===========

Messenger.js is a JavaScript library for publishing/subscribing to messages. This library helps in de-coupling
many parts of your JavaScript in your web application. An example is worth a thousand lines.

```
// Module 1
var myEvent = msngr.newEvent("rowDeleted").publish();

// Module 2
var rowDeletedListener = msngr.listenTo("rowDeleted")
					          .andDo(function(){
							 	  // do your thing 	
						   	  });


// More JavaScript Magic...

// And then
myEvent.fire(); // fires the anonymous andDo function of rowDeletedListener.


var anotherRowDeletedListener = msngr.listenTo("rowDeleted")
							         .andDo(function(){
									 	  // do your thing 	
								   	 });
								   	 
// And blah blah blah.. you get it right...
```

Using messenger.js
------------------

Just like other libraries, you have to include the messenger.min.js file in your project and poof you'll be 
blessed with the ```msngr``` object.


Running Tests
-------------
The test folder contains the ```test.html```. All you have to do is open it with your favorite browser
and you'll see a suite of tests running.

Contact Me
----------
Please email me at [khanm.developer@gmail.com](mailto:khanm.developer@gmail.com) if you have any questions.


