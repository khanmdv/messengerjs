messengerjs
===========

Messenger.js is a JavaScript library for publishing/subscribing to messages. This library helps in de-coupling
many parts of your JavaScript in your web application. An example is worth a thousand liness...


// Module 1
var myEvent = msngr.newEvent("rowDeleted").publish();

// Module 2
var rowDeletedListener = msngr.listenTo("rowDeleted")
					          .andDo(function(){
							 	  // do your thing 	
						   	  });


// More JavaScript Magic...

// And then
myEvent.fire(); // fires the anonymous andDo function.


var anotherRowDeletedListener = msngr.listenTo("rowDeleted")
							         .andDo(function(){
									 	  // do your thing 	
								   	 });
								   	 
// And blah blah blah.. you get it right...

