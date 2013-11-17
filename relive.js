
var path = require("path");
var watchdir = require("./watchdir");
var domain = require("domain");

//console.log("load %s",__filename);


if(process._relive){
    module.exports =process._relive;
    return;
}

function relive( options ){

    if(!process._relive) process._relive = relive;
    var _this = process._relive;

    options = _this.options = 'object' == typeof options ? options : {};
    
    var defaultOptions = { watch: true ,  watchDelay: 1000 , watchMatch: /\.(js|json)$/ };
    
    for(var key in defaultOptions)
        if(!(key in options)) _this.options[key] = defaultOptions[key];
    
    
    
    if(_this.watch){
        _this.watch.removeAll();
        _this.watch.removeAllListeners();
    }

    
    if(options.watch){
        
        _this.watch = watchdir({ watch: { persistent: false }});
         
        if(Array.isArray(options.watch)){
            options.watch.forEach(function(path){
                var watchDirName = path.resolve(path ,"");
                _this.watch.add(watchDirName);
            });
            
        }else{
            var watchDirName = path.resolve( 'string' == typeof options.watch ? options.watch : path.dirname(_this.mainFilename || __dirname));
            _this.watch.add(watchDirName);
        }
        
        var waitEnd = false;
        _this.watch.on("change",function(event,filename){
            if('function' == typeof options.watchMatch.test && !options.watchMatch.test(filename))
                return;
                
            if(waitEnd)return;
            waitEnd = true;
            setTimeout(function() {
                _this.reload();
                waitEnd = false;
            },options.watchDelay);
            
        });
    }
    
    return _this;
}


relive.mainFilename = process.mainModule  ? process.mainModule.filename : '';
 
function clearCache(){
        module.children = process.mainModule.children = [];
        
        for(var i in require.cache )
            if(__filename != i) delete require.cache[i];
}

var count = 0;

relive.__defineGetter__('count', function(){ 
    return count; 
});

relive.__defineGetter__('first', function(){ 
    return  0 === count; 
});

relive._dispose = [];

relive.__proto__.reload = function(){
    clearCache();
    var _this = this;
    
    var toDispose = relive._dispose;
    relive._dispose = [];
    var loadDomain = domain.create();	
    loadDomain.on('error', function(err) { 
        relive._dispose.unshift.apply(relive._dispose, toDispose);
        console.error(err.stack); 
    });
    loadDomain.run(function(){
        count++;
        require(_this.mainFilename);
        var fn; while ("function" == typeof(fn = toDispose.shift())) { fn(_this); }
        
    });
    
    this._loadDomain = loadDomain;
    return this;
};


relive.__proto__.setDispose = function(fn){
    if("function" == typeof fn)
        relive._dispose.push(fn);
        
    return this;
};


module.exports = relive();

