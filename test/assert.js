(function(){
	var results;
	var getLi = function(txt, clazz){
		var li = document.createElement("li");
		li.className = clazz;
		li.appendChild(document.createTextNode(txt));
		return li;
	};
	
	this.testGroup = function(grpName, testSuite){
		results = document.getElementById("results");
		var li = getLi(grpName, "grp");
		results.appendChild(li);
		
		var ul = document.createElement("ul");
		results.appendChild(ul)
		results = ul;
		testSuite();
	}
	
	this.assert = function(value, msg){
		var li = getLi(msg, value ? "pass" : "fail");
		if (!results){
			results = document.getElementById("results");
		}
		
		results.appendChild( li );
	}
	
	var queue = [], paused = false;
	this.pause = function(){
		paused = true;
	}
	
	this.resume = function(){
		paused = false;
		setTimeout(runTest, 1);
	}
	
	function runTest(){
		if (!paused && queue.length){
			queue.shift()();
			if (!paused)
				resume();
		}
	}
	
	this.testAsync = function(name, testSuite){
		queue.push(function(){
			results = document.getElementById("results");
			var li = getLi(name, "grp");
			results.appendChild(li);
			
			var ul = document.createElement("ul");
			results.appendChild(ul)
			results = ul;
			testSuite();
		});
		runTest();
	}
})();