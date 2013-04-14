var httpsync = require('httpsync');

var torrentInfo = [
	{
	re:/href="http:\/\/www.torlock.com\/torrent\/([0-9]+)\/.*?"/,
	urlPattern:'http://www.torlock.com/tor/$1.torrent'
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
