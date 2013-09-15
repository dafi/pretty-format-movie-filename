var url = require('url');
var http = require('http');
var fs = require('fs');
var prettyMovieName = require('./prettyFormatMovieName');
var tu = require('./torrentUtils');
var argv = process.argv;

var scriptDir = argv[1].substring(0, argv[1].lastIndexOf('/') + 1);

var feeds = JSON.parse(fs.readFileSync(scriptDir + 'feeds.json', 'UTF-8'));

var searchPaths = [
'/Volumes/PlugDisk/mm/movies/%1',
'/Volumes/PlugDisk/mm/movies/temp'
];

function getUrl(urlStr, callback) {
    var options = url.parse(urlStr);
    // http.get needs 'path' to work
    options.path = options.pathname + options.search;
    
    var feedXml = '';
    http.get(options, function(res) {
        res.on("data", function(chunk) {
          feedXml += chunk.toString();
        });
        res.on('end', function() {
            // get just first feed item
            var singleLine = feedXml.replace(/(\n|\r|\t)/g, '');
            var tagItemBegin = singleLine.indexOf('<item>');
            var tagItemEnd = singleLine.indexOf('</item>', tagItemBegin);

            singleLine = singleLine.substring(tagItemBegin, tagItemEnd);
            var title = singleLine.match(/<title>(.*?)<\/title>/);

            if (title) {
                var obj = {movie:prettyMovieName.parse(title[1])};

                var link = singleLine.match(/<link>(.*?)<\/link>/);
                if (link) {
                    obj.link = link[1];
                }
                callback(obj);
            }
        });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
}

var titles = [];

// create a blank string enough long to overwrite previous output
var blankLine = '';
for (var i = 0; i < 60; i++) {
    blankLine += ' ';
}

function addTitle(title) {
    titles.push(title);
    if (title.movie) {
        process.stdout.write(blankLine + '\r');
        process.stdout.write(titles.length + '/' + feeds.length + ' ' + title.movie.showName + '\r');

    }
    if (titles.length == feeds.length) {
        titles = titles.filter(function(el) {
            return el.movie != null;
        });
        titles.sort(function(a, b) {
            return a.movie.showName.localeCompare(b.movie.showName);
        });
        process.stdout.write(blankLine + '\r');
        showNewTitles(titles);
    }
}

function searchInFolder(path, title) {
    if (fs.existsSync(path)) {
        return fs.readdirSync(path).some(function(el) {
            var parsed = prettyMovieName.parse(el);
            if (parsed && title.showName == parsed.showName) {
                if (title.season < parsed.season) {
                    return false;
                }
                return title.episode <= parsed.episode;
            }
            return false;
        });
    }
    // if path doesn't exist ignore it
    return true;
}

function writeHTML(links) {
    var html = '<!DOCTYPE html><html><head><title>Movies to download</title></head><body>%1</body></html>';
    var htmlBody = '';

    links.forEach(function(link) {
        var torrentUrl = tu.getTorrentUrlFromFeedUrl(link.url);
        htmlBody += '<a href="' + torrentUrl + '">' + link.label + '</a><br/>';

        // download torrent file
        var file = fs.createWriteStream(scriptDir + '/tmptest/torrents/' + link.label + '.torrent');
        var request = http.get(torrentUrl, function(response) {
          response.pipe(file);
        });
    });

    html = html.replace('%1', htmlBody);
    fs.writeFileSync(scriptDir + '/tmptest/listmovies.html', html, 'utf-8');
}

function showNewTitles(titles) {
    var itemsNews = [];
    var links = [];

    titles.forEach(function(title) {
        var isNew = !searchPaths.some(function(searchPath) {
            var path = searchPath.replace('%1', title.movie.showName);
            return searchInFolder(path, title.movie);
        });
        if (isNew) {
            var prettyName = prettyMovieName.format(title.movie);
            console.log(prettyName + ' is new');
            links.push({url:title.link, label:prettyName});
        }
    });
    writeHTML(links);
}

for (var i = 0; i < feeds.length; i++) {
    getUrl(feeds[i], addTitle);
}
