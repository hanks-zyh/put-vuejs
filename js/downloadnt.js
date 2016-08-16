var download = require('./download');


function downloadFile(id){ 
	console.log('start download : '+ id);
	download('https://sukebei.nyaa.se/?page=download&tid='+id, './downloads', id+'.torrent')
	    .then(function(filePath){
	        console.log('file download success : %s', filePath);
	    })
	    .catch(function(err){
	        console.log('download error');
	        console.log(err.stack);
	    });
}

for (var i = 2104347; i < 2104512; i++) {
	downloadFile(i);
}


     
