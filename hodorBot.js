var Bots = require('./EvilBot.js');

function logResponseIfError(error, reply) {
	if ( error ) {
		console.log('ERROR: ='+JSON.stringify(error));
	}
}

function getCountHodors() {

	var rand = _.random(1,32);
	var f = Math.log(rand) / Math.LN2;
	var g = 6 - Math.ceil(f);
	return g;
}

function buildHodor(times) {

	var str = '';
	for ( i = 0; i < times; i++ ) {
		var rand = _.random(17);
		str += 'Hodor';
		if ( rand < 2 ) {
			str += '?';
		} else if ( rand < 4 ) {
			str += '!';
		} else if ( rand < 6 ) {
			str += '!!';
		} else if ( rand < 10 ) {
			str += '.';
		} else if ( rand < 12 ) {
			str += ',';
		}

		if ( i < times - 1 ) {
			str += ' ';
		}
	}
	return str;
}

function replyHodor(bot, tweet) {

	var username = bot.getSafeUsername(tweet);
	if ( !username ) {
		return;
	}
	var countHodors = getCountHodors();
	var status = '@'+username+' '+buildHodor(countHodors);
	var params = {
		status: status,
		in_reply_to_status_id : tweet.id_str
	}
	if ( ! params.in_reply_to_status_id ) {
		console.log('[ERROR] Missing Reply_to '+JSON.stringify(tweet));
	}
	console.log('[HODOR] Replying to @'+username+' with: "'+status+'"');
	bot.twitter.post('statuses/update', params, function(error, reply, res) {
		if ( error ) {
			console.log('[HODOR] error='+error);
		}
	});
}

function HodorBot(configFile) {

	var bot = Bots(configFile);

	bot.respondToTweet = function(tweet) {

		var r = _.random(200);
		var rt = tweet.retweeted_status;
		
		if ( rt && false) {

			if (( rt.retweet_count > 4 && rt.retweet_count < 20 ) || ( rt.favorite_count > 4 && rt.favorite_count < 20)) {
				console.log('Replying to a popular RT');
				return replyHodor(bot, tweet);
			}
		}
		if ( r < 20 ) {
			bot.retweet(tweet); 
		} else if ( r < 40 ) {
			bot.favoriteTweet(tweet);
		} else if ( r < 100 ) {
			bot.followUser(tweet);
		} else {
			replyHodor(bot, tweet);
		}
	};

	return bot;
}

module.exports = HodorBot;