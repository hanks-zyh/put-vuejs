var https = require('https')
var http = require('http')
var cheerio = require('cheerio')
var request = require("request");

// 微信文章 : Android
var url = "http://weixin.sogou.com/weixin?query=android&type=2&page=2&ie=utf8"
// var url = 'https://rentway.firebaseapp.com/'

// csdn： 移动开发
var csdn = 'http://blog.csdn.net/mobile/newest.html?page=1'

// 简书 ： Android开发，Android知识
var jisnhu = ['http://www.jianshu.com/collections/32732/notes?order_by=added_at&page=1',
    'http://www.jianshu.com/collections/284/notes?order_by=added_at&page=1'
]

// Medium ： android tag
var medium = 'https://medium.com/tag/android'

var urlArray = [
    {
        urls: [
            'http://weixin.sogou.com/weixin?query=android&type=2&page=2&ie=utf8',
        ],
        from: 'weixin'
    },
    {
        urls: [
            'http://www.jianshu.com/collections/32732/notes?order_by=added_at&page=1',
            'http://www.jianshu.com/collections/284/notes?order_by=added_at&page=1'
        ],
        from: 'jianshu'
    },
    {
        urls: [
            'http://blog.csdn.net/mobile/newest.html?page=1',
        ],
        from: 'csdn'
    },
]


function contains(arr, obj) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === obj) {
            return true;
        }
    }
    return false;
}

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

function printArticle(article) {
    console.log('title:' + article.title
        + '\nsubtitle:' + article.subtitle
        + '\nurl:' + article.url
        + '\nid:' + article.article_id
        + '\nname:' + article.author_name
        + '\naaurl:' + article.author_url
        + '\n.................................\n\n');
    saveToLeancloud(article)
}

function filterJianshuArticle(html) {
    var $ = cheerio.load(html)
    var items = $('.article-list li')
    items.each(function (item) {
        var article = $(this)

        // 文章标题
        title = article.find('h4 a').text()
        // 副标题
        subtitle = ""
        // 文章完整的url
        url = 'http://www.jianshu.com' + article.find('h4 a').attr('href')
        // 文章 id
        id = url.substr(url.lastIndexOf('/') + 1, 1000)

        // 作者名字
        authorName = article.find('.author-name').text()
        // 作者主页
        authorUrl = 'http://www.jianshu.com' + article.find('.list-top a').attr('href')

        articleFrom = "jianshu"

        var articleItem = {
            title: title,
            subtitle: subtitle,
            url: url,
            article_id: id,
            article_from: articleFrom,
            author_name: authorName,
            author_url: authorUrl
        }

        printArticle(articleItem)

    })

}

function filterCsdnArticle(html) {
    var $ = cheerio.load(html)
    var items = $('.blog_list')
    var tags = ['android', 'Android', '安卓', 'android开发', 'android studio', 'meterial']

    items.each(function (item) {
        var article = $(this)

        // 文章的 tag 数组
        var articleTag = article.find('p').text().replace(/\s+/g, '`').split('`')
        var isAndoridTag = false
        for (var i = 0; i < articleTag.length; i++) {
            if (contains(tags, articleTag[i])) {
                isAndoridTag = true;
                break
            }
        }
        // 没有共同 tag 直接跳过
        if (!isAndoridTag) {
            return true
        }
        // 文章标题
        var title = article.find('h1 a').text()
        // 副标题
        var subtitle = article.find('dl dd').text()
        // 文章完整的url
        var url = article.find('h1 a').attr('href')
        // 文章 id
        var id = url.substr(url.lastIndexOf('/') + 1, 1000)
        // 作者名字
        var authorName = article.find('.user_name').text()
        // 作者主页
        var authorUrl = article.find('.user_name').attr('href')
        articleFrom = "csdn"

        var articleItem = {
            title: title,
            subtitle: subtitle,
            url: url,
            article_id: id,
            article_from: articleFrom,
            author_name: authorName,
            author_url: authorUrl
        }

        printArticle(articleItem)
    })

}

function filterWeixinArticle(html) {
    var $ = cheerio.load(html)
    var items = $('.wx-rb')
    items.each(function (item) {
        var article = $(this)
        // 文章标题
        var title = article.find('h4').text().replace(/\s+/g, '')
        // 副标题
        var subtitle = article.find('p').text().replace(/\s+/g, '')
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
            subtitle: subtitle,
            url: url,
            article_id: id,
            article_from: articleFrom,
            author_name: authorName,
            author_url: authorUrl
        }
        printArticle(articleItem)
        //saveToLeancloud(articleItem)
    })
}

function fetchUrl(start_url, articleFrom) {
    if (start_url.startsWith("https")) {
        https.get(start_url, function (res) {
            var html = ''
            res.on('data', function (data) {
                html += data
            })
            res.on('end', function () {
                switch (articleFrom) {
                    case 'weixin': filterWeixinArticle(html); break;
                    case 'csdn': filterCsdnArticle(html); break;
                    case 'jianshu': filterJianshuArticle(html); break;
                }
            })
        }).on('error', function (e) {
            console.log('获取信息失败')
        })
    } else {
        http.get(start_url, function (res) {
            var html = ''
            res.on('data', function (data) {
                html += data
            })
            res.on('end', function () {
                switch (articleFrom) {
                    case 'weixin': filterWeixinArticle(html); break;
                    case 'csdn': filterCsdnArticle(html); break;
                    case 'jianshu': filterJianshuArticle(html); break;
                }
            })
        }).on('error', function (e) {
            console.log('获取信息失败')
        })
    }
}


for (var i = 0; i < urlArray.length; i++) {
    var item = urlArray[i];
    for (var j = 0; j < item.urls.length; j++) {
        var url = item.urls[j];
        fetchUrl(url, item.from);
    }
}

