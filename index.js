var b = require('./EvilBot.js')('./config.json');


// b.test();

var params = {
	q: 'hodor',
	result_type: 'mixed',
	lang: 'en'
};
// b.retweet(params, function() {
// 	console.log('done');
// });
// b.searchFollow(params, function(error, reply) {
// 	console.log('done. Err='+error+'.  Reply='+reply);
// });

b.startStream();