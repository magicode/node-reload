
var fs = require("fs");
var util = require("util");
var path = require("path");
var EventEmitter = require("events").EventEmitter;


function WatchDir(options){
    EventEmitter.call(this);
    this._dirs = {};
    this.options = options || {};
    
    var _this = this;
    this.onWatch = function (event, filename) {
        _this.emit("change",event, filename);
        if("rename") _this.add(filename);
    };

}  

util.inherits(WatchDir, EventEmitter);


WatchDir.prototype.removeAll = function(){
    for(var file in this._dirs){
        this._dirs[file].close();
        delete this._dirs[file];
    }
};

WatchDir.prototype.remove = function(dirname){
    dirname = path.resolve(dirname);
    
    for(var file in this._dirs){
        if( file.indexOf(dirname) === 0){
            //console.log("remove %s",dirname);
            this._dirs[file].close();
            delete this._dirs[file];
        }
    }
};

WatchDir.prototype.add = function(dirname){
    dirname = path.resolve(dirname);
    var _this = this;
    (function add(dirname){
        fs.exists(dirname, function(exists){ 
            if(exists){
                fs.lstat(dirname,function(err, stats) {
                    if(err || !stats.isDirectory() ) return;
                    
                    if(!(dirname in  _this._dirs)){
                        _this._dirs[dirname] = fs.watch(dirname, _this.options.watch || {} , 
                        function (event, filename) {
                            _this.onWatch(event, path.resolve(dirname,filename )); 
                        });
                    }
                    fs.readdir(dirname, function(err, files) {
                        //console.log("add %s", dirname);
                        files.forEach(function(file){
                            add(path.resolve(dirname,file));
                        });
                    });
                });
            }else{
                _this.remove(dirname);
                
            }
        });
    })(dirname);
};




module.exports  = function(options){
    return new WatchDir(options);      
};




