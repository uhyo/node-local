var socketio=require('socket.io'),http=require('http'),url=require('url'),fs=require('fs');

var app=http.createServer(function(req,res){
	var u=url.parse(req.url);
	var t,file;
	switch(u.pathname){
	case "/node-local/oni-apollo.js":
		t="text/javascript";
		file="tools/oni-apollo.js";
		break;
	case "/node-local/local.sjs":
		t="text/sjs";
		file="local.sjs";
		break;
	default:
		t="text/html";
		file="public/index.html";
		break;
	}
	res.setHeader("Content-type",t);
	res.end(fs.readFileSync(file),"utf8");
});
app.listen(8080);
var io=socketio.listen(app);

io.sockets.on("connection",function(socket){
	//require
	var requirements={};
	socket.on('require',function(module){
		
		requirements[module]=require(module);
		socket.emit('requireResult',objectTree(requirements[module]));
	});
	//function
	socket.on('function',function(obj){
		ms=obj.name.split(".");
		var r=requirements[ms.shift()];
		var funcname=ms.pop();
		//めぐる
		ms.forEach(function(x){
			r=r[x];
		});
		console.log(obj.arguments);
		var result=r[funcname].apply(r,obj.arguments);
		socket.emit('functionReturn',result);
	});
});
console.log(fs.readFileSync("sample.txt","utf8"));

//オブジェクト情報を通知する感じのやつ
function objectTree(obj){
	var ret={};
	Object.getOwnPropertyNames(obj).forEach(function(x){
		switch(typeof obj[x]){
		case "object":
			ret[x]=objectTree(obj[x]);
			break;
		case "function":
			ret[x]="function";
			break;
		default:
			ret[x]="primitive";
			break;
		}
	});
	return ret;
}
