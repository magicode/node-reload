
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
    
    if(true){
        var gc = require("gc");
        setInterval(function() {
           relive.reload();
        }, 55);
        
        setInterval(function(){
            gc();
            console.log("heapTotal %sMB ,count reload app %d", 
                String((process.memoryUsage().heapTotal / Math.pow(1024,2)).toFixed(1)) , 
                relive.count || 0);
            
        },1000);
    }
}else{
    //console.log("reload app 1");
}

relive.server.on("request", app);

relive.setDispose(function(){
    relive.server.removeListener("request",app);
   
});