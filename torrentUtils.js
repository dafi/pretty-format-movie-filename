var httpsync = require('httpsync');

/*
	Find .torrent urls from sites having the following scheme:
		Torrent page form http://domain/<<NUMERIC-ID>>/other-text
		Torrent download url http://domain.download/<<NUMERIC-ID>>/other-text
	re - contains the regexp from which exact the numeric id contained into torrent url.
	Torrent url is searched inside the feedUrl's HTML source code
	urlPattern - contains the expression used to create the download url containing the numeric id
*/
var torrentInfo = [
	{
	re:/href="http:\/\/www.torlock.com\/torrent\/([0-9]+)\/.*?"/,
	urlPattern:'http://www.torlock.com/tor/$1.torrent'
	},

	{
	re:/http:\/\/www.newtorrents.info\/torrent\/([0-9]+)\/*/,
	urlPattern:'http://www.newtorrents.info/down.php?id=$1'
	},

	{
	re:/href="http:\/\/h33t.com\/torrent\/([0-9]+)\/.*?"/,
	urlPattern:'http://h33t.com/get/$1'
	},

	{
	re:/href="http:\/\/www.torrentfunk.com\/torrent\/([0-9]+)\/.*?"/,
	urlPattern:'http://www.torrentfunk.com/tor/$1.torrent'
	},

	{
	re:/href="http:\/\/www\.bt-chat\.com\/details\.php\?id=([0-9]+).*?"/,
	urlPattern:'http://www.bt-chat.com/download.php?id=$1'
	},
];

exports.getTorrentUrlFromFeedUrl = function(feedUrl) {
	var req = httpsync.get(feedUrl);
	var res = req.end();

    var html = res.data.toString().replace(/(\n|\r|\t)/g, '');
	var torrentUrl = feedUrl;
	torrentInfo.some(function(torrent) {
		var m = html.match(torrent.re);
		if (m && m.length == 2) {
			torrentUrl = torrent.urlPattern.replace('$1', m[1]);
			return true;
		}
		return false;
	});

	return torrentUrl;
}
