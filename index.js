var b = require('./EvilBot.js')('./config.json');


// b.test();

// var params = {
// 	q: 'hodor',
// 	result_type: 'mixed',
// 	lang: 'en'
// };
// b.retweet(params, function() {
// 	console.log('done');
// });
// b.searchFollow(params, function(error, reply) {
// 	console.log('done. Err='+error+'.  Reply='+reply);
// });

b.startStream();

// for ( var i = 0 ; i < 32; i++ ) {
// 	getCountHodors();
// }

// function buildHodor(times) {

// 	var str = '';
// 	for ( i = 0; i < times; i++ ) {
// 		str += 'hodor';
// 		if ( i < times - 1 ) {
// 			str += ' ';
// 		}
// 	}
// 	return str;
// }


// console.log(buildHodor(8)+'/');

// function getCountHodors() {

// 	var rand = _.random(1,32);
// 	var f = Math.log(rand) / Math.LN2;
// 	var g = 6 - Math.ceil(f);
// 	console.log('r='+rand+'  \t g='+g);
// 	return g;
// }