Twit = require('twit');
fs = require('fs');
_ = require('underscore');

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

function retweet(T, params, callback) {

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

	T.post('favorites/create', { id: tweet.id_str }, function(error, response) {

		if ( error ) {
			console.log('ERROR: '+error);
		} else {
			console.log('favorited tweet: '+tweet.text);
		}

	});
}

function EvilBot(configFile) {
	console.log('Created EvilBot');

	var config = setupConfig(configFile);
	var twitter = setupTwitter();
	var thisguy = {};

	console.log('config='+JSON.stringify(config.keyword));

	thisguy.twitter = twitter;
	thisguy.test = function() { test(twitter) };
	thisguy.retweet = function(params,callback) {
		retweet(twitter, params, callback);
	};
	thisguy.searchFollow = function(params, callback) {
		searchFollow(twitter, params, callback);
	};
	thisguy.startStream = function() {
		console.log('starting stream ('+config.keyword+')...');
		var stream = twitter.stream('statuses/filter', { track: config.keyword, lang: 'en', });
		stream.on('tweet', function (tweet) {
			// if ( tweet.media ) {
  				console.log(JSON.stringify(tweet.text));
  			// }
  			// favoriteTweet(twitter, tweet);
		});
	};

	return thisguy;
}

module.exports = EvilBot;
