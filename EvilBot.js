Twit = require('twit');
fs = require('fs');
_ = require('underscore');
var RateLimiter = require('limiter').RateLimiter;
var limiter = new RateLimiter(1, 780000);	// 780000 = 13 minutes


function setupTwitter() {

	if ( 0 ) {
	// if ( config && config.consumer_secret ) {

		console.log('using config file for Twitter');
		var twitter = new Twit({
		    consumer_secret: config.consumer_secret,
		    consumer_key: config.consumer_key,
		    access_token: config.access_token,
		    access_token_secret: config.access_token_secret
		});
		return twitter;

	} else {

		console.log('using ENV for Twitter.  Consumer Key = '+process.env.twitter_consumer_key);
		console.log('access_token='+process.env.twitter_access_token);
		var twitter = new Twit({
		    consumer_secret: process.env.twitter_consumer_secret,
		    consumer_key: process.env.twitter_consumer_key,
		    access_token: process.env.twitter_access_token,
		    access_token_secret: process.env.twitter_access_token_secret
		});
		return twitter;
	}
}

function randomObject(tweets) {
	var randy = _.random(tweets.length);
	return tweets[randy]; 
}

function setupConfig(configFile) {
	var config;
	try {
		config = JSON.parse(fs.readFileSync(configFile));
	} catch (error) {
		throw error;
	}
	return config;
}

function test(T) {
	T.get('search/tweets', { q: 'hodor since:2014-11-01', count: 5 }, function(err, data, response) {
  		console.log(data)
	});
}

function retweetBySearch(T, params, callback) {

  	T.get('search/tweets', params, function (err, reply) {
		if(err) return callback(err);
 
		var tweets = reply.statuses;

		if ( tweets.length == 0 ) {
			return;
		}
		var randomTweet = randomObject(tweets);

		console.log('Retweeting: '+randomTweet.text);
		T.post('statuses/retweet/:id', { id: randomTweet.id_str }, callback);
  	});
}

function searchFollow(T, params, callback) {
 
  	T.get('search/tweets', params, function (err, reply) {

		if(err) return callback(err);
	 
	 	var tweets = reply.statuses;
	 	console.log('found '+tweets.length);
		if ( tweets.length == 0 ) {
			return;
		}
		var randomTweet = randomObject(tweets);

		if ( !randomTweet.user || !randomTweet.user.screen_name ) {
			console.log('no username for tweet: '+JSON.stringify(randomTweet));
			return callback(new Error('wtf no user'));
		}
		var user = randomTweet.user.screen_name;
		console.log('Following: @'+user+', who wrote: ' +randomTweet.text);	 	
	 
		T.post('friendships/create', { screen_name: user }, callback);
 	});
}

// function unfollowSomeone(T, params, callback) {

// 	T.get('followers/ids', function(err, reply) {

// 	  	if(err) return callback(err);
	  
// 	  	var followers = reply.ids;
	  
// 	  	T.get('friends/ids', function(err, reply) {

// 		  	if(err) return callback(err);
		  
// 		  	var friends = reply.ids,
// 				pruned = false;

// 			// todo; find intersection...
		  
// 		  	while(!pruned) {
// 				var target = self.randIndex(friends);
			
// 				if(!~followers.indexOf(target)) {
// 					pruned = true;
// 				  	self.twit.post('friendships/destroy', { id: target }, callback);   
// 				}
// 		  	}
// 	  	});
//   	});
// }

function favoriteTweet(T, tweet) {
	
	var username = getSafeUsername(tweet);
	if ( username ) {
		console.log('[FAV] '+tweet.id+'\t@'+username+' \t '+tweet.text);
		T.post('favorites/create', { id: tweet.id_str }, function(error, response) {
			if ( error ) {
				console.log('[FAV] Error='+error);
			} 
		});
	} else {
		callback(new Error('[FAV] MyError=no username'));
	}
}

function retweet(T, tweet, callback) {

	var username = getSafeUsername(tweet);
	if ( username ) {
		console.log('[RT] '+tweet.id+'\t@'+username+' \t '+tweet.text);
		T.post('statuses/retweet/:id', { id: tweet.id_str }, callback);
	} else {
		callback(new Error('[RT] MyError=no username'));
	}
}

function followUser(T, tweet, callback) {
	
	var username = getSafeUsername(tweet);
	if ( username ) {
		console.log('[FOLLOW] @'+username+' \t Tweet=' +tweet.text); 		 		
		T.post('friendships/create', { screen_name: username }, callback);
	} else {
		callback(new Error('[FOLLOW] MyError=no username'));
	}
}

function logResponseIfError(error, reply) {
	if ( error ) {
		console.log('ERROR: ='+JSON.stringify(error));
	}
}

function getSafeUsername(tweet) {
	if ( tweet && tweet.user && tweet.user.screen_name ) {
		return tweet.user.screen_name
	}
	return undefined;
}

function getCountHodors() {

	var rand = _.random(1,32);
	var f = Math.log(rand) / Math.LN2;
	var g = 6 - Math.ceil(f);
	// console.log('r='+rand+'  \t g='+g);
	return g;
}

function buildHodor(times) {

	var str = '';
	for ( i = 0; i < times; i++ ) {
		var rand = _.random(8);
		str += 'Hodor';
		if ( rand < 1 ) {
			str += '?';
		} else if ( rand < 2 ) {
			str += '!';
		} else if ( rand < 3 ) {
			str += '!!';
		} else if ( rand < 5 ) {
			str += '.';
		}

		if ( i < times - 1 ) {
			str += ' ';
		}
	}
	return str;
}

function replyHodor(T, tweet, callback) {

	var username = getSafeUsername(tweet);
	if ( !username ) {
		return callback(new Error('[REPLY] MyError=no username'));
	}

	var countHodors = getCountHodors();
	var status = '@'+username+' '+buildHodor(countHodors);

	var params = {
		status: status,
		in_reply_to_status_id : tweet.id
	}

	if ( ! params.in_reply_to_status_id ) {
		console.log('[ERROR] Missing Reply_to '+JSON.stringify(tweet));
	}

	console.log('[HODOR] Replying to @'+username+' with: "'+status+'"');

	T.post('statuses/update', params, function(error, reply) {
		if ( error ) {
			console.log('[HODOR] error='+error);
		}
	});
}

function respondToTweet(T, tweet) {

	// console.log('');
	// console.log('Saw tweet:'+JSON.stringify(tweet.text)+' user_id='+tweet.user.id_str);
	var r = _.random(200);
	var isGameInvite = (tweet.text.indexOf('evilapples.com/join') >= 0 );
	var hashtagEvilApples = (tweet.text.indexOf('#evilapples') >= 0 );
	var rt = tweet.retweeted_status;

	// if ( isGameInvite ) {
	// 	return favoriteTweet(T, tweet);
	// }


	if ( rt ) {
		if (( rt.retweet_count > 4 && rt.retweet_count < 20 ) || ( rt.favorite_count > 4 && rt.favorite_count < 20)) {
			console.log('Replying to a popular RT');
			return replyHodor(T, tweet, logResponseIfError);
		}
	}


	// if ( hashtagEvilApples ) {
	// 	console.log('[HASHTAG] \t Tweet='+tweet.text);
	// }

	if ( r < 20 ) {
		return retweet(T, rt, logResponseIfError); 
	} else if ( r < 40 ) {
		return favoriteTweet(T, tweet, logResponseIfError);
	} else if ( r < 100 ) {
		return followUser(T, tweet, logResponseIfError);
	} else {
		return replyHodor(T, tweet, logResponseIfError);
	}
}

function EvilBot(configFile) {
	console.log('Created EvilBot');

	var config = setupConfig(configFile);
	var twitter = setupTwitter();
	var thisguy = {};
	var tweetCount = 0;
	var countPending = 0;

	console.log('config='+JSON.stringify(config.keyword));

	thisguy.twitter = twitter;
	thisguy.test = function() { test(twitter) };
	thisguy.searchFollow = function(params, callback) {
		searchFollow(twitter, params, callback);
	};
	thisguy.startStream = function() {
		console.log('starting stream ('+config.keyword+')...');
		var stream = twitter.stream('statuses/filter', { track: config.keyword, lang: 'en', });
		stream.on('tweet', function (tweet) {

			if ( countPending >= 2 ) {
				// console.log('['+limiter.getTokensRemaining()+'] Skipping tweet. Pending='+countPending);
				return;
			}
			if ( tweet.user && tweet.user.id_str === config.user_id ) {
				// console.log('Skipping you own tweet');
				return;
			}
			var myTweetCount = ++tweetCount;
			countPending++;
			limiter.removeTokens(1, function(err, remainingRequests) {
				countPending--;
				respondToTweet(twitter, tweet);
			});
		});
	};

	return thisguy;
}

module.exports = EvilBot;
