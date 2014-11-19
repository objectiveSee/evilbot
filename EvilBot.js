Twit = require('twit');
fs = require('fs');
_ = require('underscore');
var RateLimiter = require('limiter').RateLimiter;
var limiter = new RateLimiter(1, 1000*5);

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

// function searchFollow(T, params, callback) {
 
//   	T.get('search/tweets', params, function (err, reply) {

// 		if(err) return callback(err);
	 
// 	 	var tweets = reply.statuses;
// 	 	console.log('found '+tweets.length);
// 		if ( tweets.length == 0 ) {
// 			return;
// 		}
// 		var randomTweet = randomObject(tweets);

// 		if ( !randomTweet.user || !randomTweet.user.screen_name ) {
// 			console.log('no username for tweet: '+JSON.stringify(randomTweet));
// 			return callback(new Error('wtf no user'));
// 		}
// 		var user = randomTweet.user.screen_name;
// 		console.log('Following: @'+user+', who wrote: ' +randomTweet.text);	 	
	 
// 		T.post('friendships/create', { screen_name: user }, callback);
//  	});
// }

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

function favoriteTweet(T, tweet, callback) {

	var username = getSafeUsername(tweet);
	if ( username ) {
		console.log('[FAVORITING] '+tweet.id+'\t@'+username+' \t '+tweet.text);
		T.post('favorites/create', { id: tweet.id_str }, callback);
	}
}

function retweet(T, tweet, callback) {

	var username = getSafeUsername(tweet);
	if ( username ) {
		console.log('[RETWEETING] '+tweet.id+'\t@'+username+' \t '+tweet.text);
		T.post('statuses/retweet/:id', { id: tweet.id_str }, callback);
	} else {
		console.log('MISSING:'+JSON.stringify(tweet));
	}
}

function followUser(T, tweet, callback) {
	
	var username = getSafeUsername(tweet);
	if ( username ) {
		console.log('[FOLLOWING] @'+username+' \t Tweet=' +tweet.text); 		 		
		T.post('friendships/create', { screen_name: username }, callback);
	}
}

function getSafeUsername(tweet) {
	if ( tweet && tweet.user && tweet.user.screen_name ) {
		return tweet.user.screen_name
	}
	return undefined;
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

	var handleStreamEvent = function(tweet) {
		if ( countPending >= 2 ) {
			return;
		}
		var username = getSafeUsername(tweet);
		if ( username === config.user_id ) {
			return;
		}
		if ( config.users_to_ignore && _.contains(config.users_to_ignore, username) ) {
			console.log('ignoring tweet from @'+username);
			return;
		}

		var myTweetCount = ++tweetCount;
		countPending++;

		limiter.removeTokens(1, function(err, remainingRequests) {
			countPending--;
			if ( thisguy.respondToTweet ) {
				thisguy.respondToTweet(tweet);
			} else {
				console.log('WARNING: Missing respondToTweet handler in bot.');
			}
		});
	};


	thisguy.startStream = function() {

		console.log('starting stream ('+config.keyword+')...');
		var stream = twitter.stream('statuses/filter', { track: config.keyword, lang: 'en', });
		stream.on('tweet', handleStreamEvent);
	};

	var emptyCallback = function (err, reply) {
		if ( err ) {
			console.log('[TWITTER ERROR] ' +JSON.stringify(err));
		} else {
			console.log('success');
		}
	};
	thisguy.favoriteTweet = function(tweet) {
		favoriteTweet(twitter, tweet, emptyCallback);
	};
	thisguy.retweet = function(tweet) {
		retweet(twitter, tweet, emptyCallback);
	};
	thisguy.followUser = function(tweet) {
		followUser(twitter, tweet, emptyCallback);
	};
	thisguy.getSafeUsername = getSafeUsername;

	return thisguy;
}

module.exports = EvilBot;
