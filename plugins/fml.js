function FML(to, from, msg, send) {
	var http = require('http');
	var options = {
	  host: 'ajax.googleapis.com',
	  path: '/ajax/services/feed/load?v=1.0&num=10&q=http://feeds.feedburner.com/fmylife'
	};
	var chk = '';
	http.get(options, function(resp){
		resp.setEncoding('utf8');
	  resp.on('data', function(chunk){
	  	   chk+=chunk;
	  });

	  resp.on('end',function() {
	  		js = JSON.parse(chk);
	  		random = Math.round(Math.random() * js.responseData.feed.entries.length);
			if(js.responseData.feed.entries[random] === undefined) { return; }
	  	 	var thePost = js.responseData.feed.entries[random].content.replace(/<\/?[^>]+(>|$)/g, "");
	  	 	send(to, from, thePost);
	  });
	});
}

exports.name = 'FML';
exports.desc = 'Displays a random post from fmylife.com';
exports.commands = {
  fml: {msg: FML, desc: 'Fetches a whiny post from someone who takes themselves way too seriously'}
};