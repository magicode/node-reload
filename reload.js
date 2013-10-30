
var path = require("path");
var watchdir = require("./watchdir");
var domain = require("domain");

//console.log("load %s",__filename);


process._reload = process._reload || {};

module.exports =  function reload( options ){

    var fn = Array.prototype.slice.call(arguments).pop();
    if("function" !== typeof fn) fn = false;
    
    var type = fn ? "function" : "main" ;
    var obj = process._reload.obj = process._reload.obj || {};
    obj.global = obj.global || {};
    
    if("main" == type){
        if(!process.mainModule) return obj;
        
        if(obj.reload) {
            obj.first = false;
            return obj;
        }
        
    }
    
    obj.reload = run;
     
    options = 'object' == typeof options ? options : {};
    
    var defaultOptions = { watch: true ,  watchWait: 1000 , match: /\.(js|json)$/ };
    
    for(var key in defaultOptions)
        if(!(key in options)) options[key] = defaultOptions[key];
    
    var mainFilename = process.mainModule  ? process.mainModule.filename : '';
    
    if(options.watch){

        var watchDirName = path.resolve(path.dirname( mainFilename || __dirname),  options.watchDir || "");
        var wd = watchdir({ watch: { persistent: false }});
        
        wd.add(watchDirName);
        
        var waitEnd = false;
        
        wd.on("change",function(event,filename){
            if('function' == typeof options.match.test && !options.match.test(filename))
                return;
                
            if(waitEnd)return;
            waitEnd = true;
            setTimeout(function() {
                run();
                waitEnd = false;
            },options.watchWait);
            
        });
    }
    
    
    function clearCache(){
        module.children = process.mainModule.children = [];
        
        for(var i in require.cache ){
            if(__filename != i) delete require.cache[i];
            //else console.log(i);
        }
    }
    
    function run(){
        clearCache();
        var loadDomain = domain.create();	
        loadDomain.on('error', function(err) { console.error(err.stack); });
        loadDomain.run(function(){
            obj.count++;
            if("function" == type){
                fn(obj.global);
            }else if("main" == type){
                require(mainFilename);
            }
        });
        return loadDomain;
    }
    obj.count = 0;
    obj.first = true;
    
    return obj;
};







