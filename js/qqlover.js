var cheerio = require('cheerio');
var fs = require('fs');

function saveNote(note) {
  console.log(note);
  // ...
}


function parseDate(time) {
  // 2014年04月01日 23:08
  time = time.replace(' ','');
  var date = new Date();
  date.setFullYear(time.substring(0,4));
  date.setMonth(time.substring(5,7)-1);
  date.setDate(time.substring(8,10));
  date.setHours(time.substring(11,13));
  date.setMinutes(time.substring(14,16));
  return date.getTime();
}


function parseHtml(html) {

  var notes = [];
  var $ = cheerio.load(html);
  $('.itemlist').each(function (i, elem) {
    var items = $(this).find('li.private');
    items.each(function (ele){
      var gender = $(this).attr('feeds_sex') == 0 ? '男': '女';
      var title = $(this).find('.item_hd>h4.title').text();
      var time = $(this).find('.item_hd>p.t_time').text();
      var content = $(this).find('.item_bd .con_txt').text().trim();
      var imgs = [];
      $(this).find('.con_img img').each(function (i, elem){
          var url = $(this).attr('src');
          url = url.substring(0,url.length-3)+'670@jpeg';
          imgs.push(url);
      });

      var author;
      var tmp = title.split(' ');
      for (var i = 0; i < tmp.length; i++) {
        if(tmp[i]){
          author = tmp[i];
          break;
        }
      }

      content = content.substring(0,content.length-15).trim();

      // 评论
      var commentStr = $(this).find('ul.g_comlist>li').text().trim();
      while(commentStr.indexOf('  ')>0) {
         commentStr = commentStr.replace('  ',' ');
      }
      var arr = commentStr.split(' ');

      var comments = [];
      for (var j = 0; j < arr.length; j++) {
        var element = arr[j];
        if(element == 'xxx' || element == 'XXX'){ 
          var commentCreated = new Date().getTime();
          var commentContent = '';
          if(arr[j+1] && arr[j+1].indexOf('年')<0 && arr[j+1].indexOf('月')<0 ){
            commentContent = arr[j+1];
            commentCreated = parseDate(arr[j+2]+arr[j+3])
            j += 3;
          }else{
            commentCreated = parseDate(arr[j+1]+arr[j+2])
            j+=2;
          }
          var comment = {
            authorId: commentAuthorId,
            content: commentContent,
            created: commentCreated,
            updated: commentCreated,
          }
          comments.push(comment);
        }else if(element == '我也说一句..'){
          break;
        }
      }

      var timestamp = parseDate(time);

      var note = {
        authorId:author,
        timestamp: timestamp,
        title: title,
        content : content,
        images:imgs.join(','),
        comments: comments,
      }
      // author
      // content
      // images
      // timestamp
      //console.log(note);
      //console.log('--------');
      notes.push(note);
    });
  });

}

fs.readFile('qqlove.html', 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  //console.log(data);
  parseHtml(data);
});
