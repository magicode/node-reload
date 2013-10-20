node-reload
===========


reload apps without loss connections or sessions, good for production or development


example 

```javascript
var reload = require("../reload")();
var express = require('express');
var app = express();  

    
if(!reload.sessionUse) reload.sessionUse = express.session({ store: new express.session.MemoryStore()});
    
     
app.use(express.cookieParser('<your secret here>'));
app.use(reload.sessionUse);
app.use(app.router);
    
app.get("/",function(req,res){
    req.session.count = req.session.count ? req.session.count + 1 : 1;
    res.end("your count: " + req.session.count);
});

reload.app = app;

if(reload.first){
    var http = require("http");
    
    http.createServer(function(){ 
        reload.app.apply(null, arguments); 
    }).listen( process.env.PORT || 80 , process.env.IP , function(){
        console.log('server listening on  %s:%s' ,process.env.IP, process.env.PORT);
    });
}
```