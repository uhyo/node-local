exports.hi=function(){
};
(function(){
	var socket=io.connect(location.protocol+"//"+location.host);
	_apollo_require=require;
	
	var response={};
	["requireResult","functionReturn","getReturn"].forEach(function(x){
		socket.on(x,function(data){
			response[x] && response[x](data);
		});
	});
	
	noderequire=function(module){
		var d;
		waitfor(){
			socket.emit("require",module);
			response.requireResult=function(data){
				d=data;
				resume();
			};
		}
		return new ServerRequest(module,d);
	};
	
	function ServerRequest(path,obj){
		Object.getOwnPropertyNames(obj).forEach(function(x){
			switch(obj[x]){
			case "function":
				//関数
				Object.defineProperty(this,x,{
					writable: false,
					value:function(){
						var returnvalue=void 0;
						waitfor(){
							socket.emit("function",{name:path+"."+x,arguments:[].slice.apply(arguments)});
							response.functionReturn=function(data){
								console.log(data);
								returnvalue=data;
								resume();
							};
						}
						return returnvalue;
					}
				});
				break;
			case "primitive":
				Object.defineProperty(this,x,{
					get: function(){
						var value=void 0;
						waitfor(){
							socket.emit("get",path+"."+x);
							response.getReturn=function(data){
								value=data;
								resume();
							};
						}
						return value;
					},
					set: function(v){
						socket.emit("set",{name:path+"."+x,value:v});
					},
						
				});
			}
		},this);
	}
})();
