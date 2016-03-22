AV.initialize('RI9y3H5x69wdwmC6Nw1J9erS-gzGzoHsz', 'nflt3xUGTePUKx6aBcvAwpf2');

new Vue({
	el: "#app",
	data: {
		message: "hello hanks!",
		articles: [{
			title: "Android TextView",
			subtitle: "learn android",
			article_url: "http://baidu.com"
		}]
	},
	methods: {
		get: function() {
			this.message = "hahahha";

			var that  = this;
			 
			var query = new AV.Query('Article');
			query.find().then(function(results) {
				// 处理返回的结果数据
				for (var i = 0; i < results.length; i++) {
					var object = results[i];
					that.articles.push({
						title: object.get('title'),
						subtitle: object.get('subtitle'),
						article_url : object.get('url'),
					})
				}
			}, function(error) {
				console.log('Error: ' + error.code + ' ' + error.message);
			});

		}
	}

})