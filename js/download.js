var request = require('request');
var fs = require('fs');  
var Puid = require('puid');
var puid = new Puid();  
var path = require('path');
var Promise = require('bluebird');

var download = function(fileUrl, outputDir, fileName,callback){
    var p = new Promise(function(resolve, reject){ 
        var dest = path.join(outputDir, fileName);
        var writeStream = fs.createWriteStream(dest);
        //  promise
        writeStream.on('finish', function(){
            resolve(dest);
        });

        // erros da write stream
        writeStream.on('error', function(err){
            fs.unlink(dest, reject.bind(null, err));
        });

        var readStream = request.get(fileUrl);
 
        readStream.on('error', function(err){
            fs.unlink(dest, reject.bind(null, err));
        });
 
        readStream.pipe(writeStream);
    }); 
    
    if(!callback)
        return p;

    p.then(function(id){
        callback(null, id);
    }).catch(function(err){
        callback(err);
    });
};

module.exports = download;
