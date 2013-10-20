
var reload = require("../reload")();

var express = require('express');

var app = express();  

    
if(!reload.sessionStore) reload.sessionStore = new express.session.MemoryStore();
    
     
app.use(express.cookieParser('<your secret here>'));
app.use(express.session({ store: reload.sessionStore }));
app.use(app.router);
    
app.get("/",function(req,res){
    req.session.count = req.session.count ? req.session.count + 1 : 1;
    res.end("your count: " + req.session.count);
});

reload.app = app;


//console.log(process._reload)
//if(!reload.first) console.log("reload app");
if(reload.first){
    var http = require("http");
    
    http.createServer(function(){ 
        reload.app.apply(null, arguments); 
    }).listen( process.env.PORT || 80 , process.env.IP , function(){
        console.log('server listening on  %s:%s' ,process.env.IP, process.env.PORT);
    });

    if(true){
        var gc = require("gc");
        setInterval(function() {
           reload.reload();
        }, 20);
        
        setInterval(function(){
            gc();
            console.log("heapTotal %sMB ,count reload app %d", 
                String((process.memoryUsage().heapTotal / Math.pow(1024,2)).toFixed(1)) , 
                reload.count || 0);
            
        },10000);
    }
}

