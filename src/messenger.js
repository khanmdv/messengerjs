/**
 * messenger.js - A message publishing framework for web applications.
 * 
 * Copyright (c) 2013-2014, Mohtashim Khan.
 */

(function(window){
	var
		/* Save the reference */
		_msngr = window.msngr,
		 
		/* All Events*/
		_events = {},
		
		/* All listners*/
		_listnrs = {},
		
		/* All destroyers */
		_destroyers = {},
		
		/* Notification on death of an event */
		_notifiers = {},
		
		/* Local copy of push */
		_arrayPush = function( $obj ){
			Array.prototype.push.call( this, $obj );
			if ( typeof this.size != "undefined" ){
				this.size++;
			}
		},
		
		/* remove element at index and decrease the object size */
		_arrayRemove = function( $index ){
			delete this[ $index ];
			if ( typeof this.size != "undefined" ){
				this.size--;	
			}
		},
		
		/* Calculate hashCode of a string */
		_hashCode = function(){
			if( this.cachedCode && this.cachedCode != 0 )
				return this.cachedCode;
		
			var hashcode = 0;
			for( var i = 0; i < this.length; i++ )
				hashcode = hashcode * 31 + this.charCodeAt(i);
		
			return this.cachedCode = hashcode;
		},
		
		/* A Simple extend method to copy properties*/
		_extend = function( $obj ){
			if ( !$obj ) return;
			
			for ( var prop in $obj ){
				if ( $obj.hasOwnProperty( prop ) ){
					this[ prop ] = $obj[ prop ];
				}
			}
		},
		
		/* Check name for a valid string literal. Name can be alphanumeric with _ . or - */
		_validateName = function( $name ){
			if ( typeof $name != "string" ){
				throw "Event name has to be a string.";
			}
			
			if ( !$name.match(/[a-zA-Z0-9_\.\-]+/) ){
				throw "Name is not a valid string.";
			}
		},
		
		/* Check if the obj passed is  afunction reference */
		_isFunction = function( $fn ){
			return $fn && typeof $fn == "function";
		},
		
		/* dummy empty object constructor */
		_empty = function(){
			this.size = this.length = 0;
		};
	
	/* Declare the msngr */
	var msngr = new Function();
	
	_extend.call( msngr, {
		
		/* msngr version */
		_version : "1.0",
		
		/* Creates a new event. Returns the same event if already created */
		newEvent : function( $name ){
			_validateName($name);
			if ( typeof _events[ $name ] != "undefined" ){
				return _events[ $name ].me;
			}
			
			_events[ $name ] = { me : new evnt($name), alive : false, paused : true };
			return _events[ $name ].me;
		},
		
		/* Creates a new listener */
		listenTo : function( $name ){
			_validateName($name);
			return new listnr( $name );
		},
		
		/* Restores msngr variable to global scope if already avaiable */
		noConflict : function(){
			window.msngr = _msngr;
			return msngr;
		},
		
		/* reset everything */
		reset : function(){
			_events = {};
			_listnrs = {};
			_destroyers = {};
			_notifiers = {};
			listnr._$justUsed && delete listnr._$justUsed;
		}
	});
	
	var evnt = function( $name ){
		var _name = $name,
			_hash = _hashCode.call(_name);
			
		this.isPaused = function(){ 
			if ( !_events[ this.getName() ] ) {
				return true;
			} else {
				return _events[ this.getName() ].paused;
			}
		};
		
		this.isAlive = function(){ 
			return _events[ this.getName() ] && 
				   _events[ this.getName() ].alive; 
		};
		
		this.getName = function(){ 
			return _name; 
		};
	};
	
	_extend.call(evnt, {
		type : "_evnt_"
	});
	
	var listnr = function( $name ){
		var _name = $name,
			_hash = _hashCode.call($name),
			_index = !!_listnrs[ _name ] ? _listnrs[ _name ].length : 0;
		
		var _$me = this;
		_listnrs[ _name ] = _listnrs[ _name ] ? _listnrs[ _name ] : new _empty();
		_arrayPush.call( _listnrs[ _name ], { me : _$me, dos : [], paused : false } );
		
		this.isPaused = function(){ 
			return _listnrs[ this.getName() ] && 
			       _listnrs[ this.getName() ][ _index ] && 
			       _listnrs[ this.getName() ][ _index ].paused; 
		};
		
		this.isAlive = function(){ 
			return _listnrs[ this.getName() ] && 
			       _listnrs[ this.getName() ][ _index ]; 
		}
		
		this.getName = function(){ 
			return _name; 
		};
		
		this.getIndex = function(){ 
			return _index; 
		};
	};
	
	evnt.prototype = {
		constructor : evnt,
		destroyWhen : function($destroyer){
			if ( !_isFunction($destroyer) ){
				throw "Invalid Argument: Expected Function";
			}
			
			_destroyers[this.getName()] = $destroyer;
			
			return this;
		},
		publish : function(){
			var _$me = this;
			if ( typeof _events[ this.getName() ] != "undefined" ){
				_events[ this.getName() ].alive = true;
				_events[ this.getName() ].paused = false;
			}
			return this;
		},
		pause : function(){
			_events[this.getName()].paused = true;
			return this;
		},
		resume: function(){
			_events[this.getName()].paused = false;
			return this;
		},
		destroy : function(){
			var _$destroyer = _destroyers[ this.getName() ];
			if ( typeof _$destroyer == "function" && _$destroyer.call( this ) ){
				delete _events[ this.getName() ];
				delete _listnrs[ this.getName() ];
				delete _destroyers[ this.getName() ];
				var _$notifiers = _notifiers[ this.getName() ] || new _empty();
				var len = _$notifiers.size;
				for ( var i = 0; i < len; ++i ){
					_$notifiers[ i ].fun.call( _$notifiers[ i ].me, arguments );
				}
				delete _notifiers[ this.getName() ];
			}
		},
		fire : function(){
			var _$listnrs = _listnrs[ this.getName() ];
			if ( _$listnrs && _$listnrs.size > 0 ){
				var _$len = _$listnrs.size;
				for ( var i = 0; i < _$len; ++i ){
					/* Fire them asynchronusly */
					var _$listner = _$listnrs[ i ];
					var _$except = _$listner.me.exceptWhen || function(){ return true; };
					
					if ( !_$listner.me.isPaused() && _$except.call( _$listner.me ) ){
						var _$dos = _$listner.dos;
						var _$doslen = _$dos.length;
						for ( var j=0; j < _$doslen; ++j ){
							var _$fun = _$dos[j];
							var args = arguments;
							_$fun.call( _$listner.me, arguments );
						}
					}	
				}
			}
		}
	}
	
	_extend.call(listnr, {
		type : "_listnr_"
	});
	
	listnr.prototype = {
		constructor : listnr,
		andDo : function( $fun ){
			if ( _isFunction( $fun ) ){
				var _$me = this;
				if ( listnr._$justUsed && listnr._$justUsed.me == this ){
					listnr._$justUsed.dos.push( $fun );
					return this;
				} else {
					var _$listnrs = _listnrs[ this.getName() ] || new _empty();
				}
				
				_$listnrs[ this.getIndex() ].dos.push( $fun );
				listnr._$justUsed = _$listnrs[ this.getIndex() ];	
			}
			return this;
		},
		exceptWhen : function( $fun ){
			if ( !this.isAlive() ) return this;
			this.exceptWhen = $fun;
			return this;
		},
		notifyOnDeath : function ( $fun ){
			if ( !this.isAlive() ) return this;
			
			if ( _isFunction($fun) ){
				if ( !_notifiers[ this.getName() ] ){
					_notifiers[ this.getName() ] = new _empty();
				}
				var _$me = this;
				_arrayPush.call( _notifiers[ this.getName() ], { me : _$me, fun :  $fun } );
				return this;
			}
		},
		pause : function(){
			if ( this.isAlive() ){
				_listnrs[ this.getName() ][ this.getIndex() ].paused = true;
			}
			return this;
		},
		resume: function(){
			if ( this.isAlive() ){
				_listnrs[ this.getName() ][ this.getIndex() ].paused = false;
			}
			return this;
		},
		stopListening : function(){
			if ( this.isAlive() ){
				_arrayRemove.call( _listnrs[ this.getName() ], this.getIndex() );
			}
		}
	};
	
	/**
	 * Create your own bind method if not available in browser
	 */
	if( typeof Function.prototype.bind  != "function" ){
		Function.prototype.bind = function(){
			var fn = this,
				args = Array.prototype.slice.call( arguments ), 
				obj = args.shift();
			
			return function(){
				fn.apply( obj, args.concat( Array.prototype.slice.call( arguments ) ) );
			}
		}
	}
	
	/* Expose msngr to the outside world */
	window.msngr = msngr;
})(window);
