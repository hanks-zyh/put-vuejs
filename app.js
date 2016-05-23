var https = require('https')
var http = require('http')
var cheerio = require('cheerio')
var url = "http://weixin.sogou.com/weixin?query=android&type=2&page=2&ie=utf8"
// var url = 'https://rentway.firebaseapp.com/'
var request = require("request");
function saveToLeancloud(article) {
    
    var jsonBody = JSON.stringify(article)
    // console.log(jsonBody)
    
    var options = {
        method: 'POST',
        url: 'https://api.leancloud.cn/1.1/classes/Article',
        headers:
        { 
            'content-type': 'application/json',
            'X-LC-Key': 'nflt3xUGTePUKx6aBcvAwpf2',
            'X-LC-Id': 'RI9y3H5x69wdwmC6Nw1J9erS-gzGzoHsz'
        },
        // json: true,
        body: jsonBody
    };
    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(body);
    });
}
function filterArticle(html) {
    var $ = cheerio.load(html)
    var items = $('.wx-rb')
    var articleData = []
    items.each(function (item) {
        var article = $(this)
        // 文章标题
        var title = article.find('h4').text().replace(/\s+/g, '')
        // 副标题
        var subTitle = article.find('p').text().replace(/\s+/g, '')
        // 文章完整的url
        var url = article.find('h4 a').attr('href').replace(/\s+/g, '')
        // 文章 id
        var id = article.attr('d').replace(/\s+/g, '')
        // 作者名字
        var authorName = article.find('.s-p a').attr('title')
        // 作者主页
        var authorUrl = article.find('.s-p a').attr('href')
        var articleFrom = "weixin"
        var articleItem = {
            title: title,
            subtitle: subTitle,
            url: url,
            article_id: id,
            article_from: articleFrom,
            author_name: authorName,
            author_url: authorUrl
        }
        articleData.push(articleItem)
        console.log('title:'+title+'\nsubtitle:'+subTitle+'\nurl:'+url+'\nid:'+id+'\nname:'+authorName+'\naaurl:'+authorUrl+'\n.................................\n\n')
        saveToLeancloud(articleItem)
    })
    console.log('文章个数：'+articleData.length)
    //   # 保存到 Leancloud
    // def save(self):
    //     ArticleObject = Object.extend('Article')
    //     article_object = ArticleObject()
    //     article_object.set('title', self.title)
    //     article_object.set('subtitle', self.subtitle)
    //     article_object.set('url', self.url)
    //     article_object.set('article_id', self.article_id)
    //     article_object.set('author_name', self.author_name)
    //     article_object.set('author_url', self.author_url)
    //     article_object.set('article_from', self.article_from)
    //     try:
    //         article_object.save()
    //     except LeanCloudError, e:
    //         print e
}
http.get(url, function (res) {
    var html = ''
    res.on('data', function (data) {
        html += data
    })
    res.on('end', function () {
        console.log(html)
        filterArticle(html)
    })
}).on('error', function (e) {
    console.log('获取信息失败')
})
