
global.relive = require("../relive");
var express = require('express');
var app = express();  


 
    
if(!relive.sessionUse) relive.sessionUse = express.session({ store: new express.session.MemoryStore()});
     
      
app.use(express.cookieParser('<your secret here>'));
app.use(relive.sessionUse);
app.use(app.router);
    
app.get("/",function(req,res){
    req.session.count = req.session.count ? req.session.count + 1 : 1;
    res.end("your count: " + req.session.count);
});


if(!relive.server){
    var http = require("http");
    
    relive.server = http.createServer();
    relive.server.listen( process.env.PORT || 80 , process.env.IP , function(){
        console.log('server listening on  %s:%s' ,process.env.IP, process.env.PORT);
    });
}else{
    console.log("reload app");
}

relive.server.on("request", app);

relive.setDispose(function(){
    relive.server.removeListener("request",app);
   
});