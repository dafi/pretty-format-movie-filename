var url = require('url');
var http = require('http');
var fs = require('fs');
var tu = require('./torrentUtils');

const TORRENT_LIST_PATH = './tmptest/torrentlist.txt';

function saveLinks(links) {
    links.forEach(function(link, index) {
        var torrentUrl = tu.getTorrentUrlFromFeedUrl(link);
        var oneIndex = index + 1;
        console.log(/*'Download feed ' + oneIndex + '/' + links.length + ' ' + */ 'wget ' + torrentUrl + ' -O '  + oneIndex + '.torrent');

        // download torrent file
        var file = fs.createWriteStream('./tmptest/torrents/' + oneIndex + '.torrent');
        var request = http.get(torrentUrl, function(response) {
          response.pipe(file);
        });
    });
}

if (fs.existsSync(TORRENT_LIST_PATH)) {
    var links = fs.readFileSync(TORRENT_LIST_PATH, 'utf-8').split(/\n/);
    saveLinks(links);    
} else {
    console.error('Unable to find', TORRENT_LIST_PATH);
}
