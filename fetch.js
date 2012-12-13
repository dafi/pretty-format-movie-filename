var url = require('url');
var http = require('http');
var fs = require('fs');
var prettyMovieName = require('./prettyFormatMovieName');

var feeds = [
"http://torrentz.eu/feed?q=2+broke+girls",
"http://torrentz.eu/feed?q=30+rock",
"http://torrentz.eu/feed?q=arrow",
"http://torrentz.eu/feed?q=beauty+and+the+beast",
// "http://torrentz.eu/feed?q=community",
// "http://torrentz.eu/feed?q=drop+dead+diva",
// "http://torrentz.eu/feed?q=fairly+legal",
"http://torrentz.eu/feed?q=glee",
"http://torrentz.eu/feed?q=happy+endings",
// "http://torrentz.eu/feed?q=hunted",
"http://torrentz.eu/feed?q=last+resort",
"http://torrentz.eu/feed?q=mike+and+molly",
"http://torrentz.eu/feed?q=modern+family",
"http://torrentz.eu/feed?q=new+girl",
"http://torrentz.eu/feed?q=person+of+interest",
// "http://torrentz.eu/feed?q=rizzoli+%26+isles",
// "http://torrentz.eu/feed?q=suits",
//"http://torrentz.eu/feed?q=revolution",
// "http://torrentz.eu/feed?q=switched+at+birth",
//"http://torrentz.eu/feed?q=smash",
"http://torrentz.eu/feed?q=the+big+bang+theory",
//"http://torrentz.eu/feed?q=secret+state",
"http://torrentz.eu/feed?q=whitney"
];

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
            var singleLine = feedXml.replace(/(\n|\r|\t)/g, '');
            var m = singleLine.match(/<item> *<title>.*?<\/title>/g);
            if (m) {
                // get just first feed item
                var fileName = m[0].match(/<title>(.*?)<\/title>/)[1];
                callback(prettyMovieName.parse(fileName));
            }
        });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
}

var titles = [];

function addTitle(title) {
    titles.push(title);
    if (titles.length == feeds.length) {
        titles = titles.filter(function(el) {
            return el != null;
        });
        titles.sort(function(a, b) {
            return a.showName.localeCompare(b.showName);
        });
        showNewTitles(titles);
    }
}

function searchInFolder(path, title) {
    if (fs.existsSync(path)) {
        return fs.readdirSync(path).some(function(el) {
            var parsed = prettyMovieName.parse(el);
            return parsed
                && title.showName == parsed.showName
                && title.season == parsed.season 
                && title.episode == parsed.episode;
        });
    }
    // if path doesn't exist ignore it
    return true;
}

function showNewTitles(titles) {
    titles.forEach(function(title) {
        var isNew = !searchPaths.some(function(searchPath) {
            var path = searchPath.replace('%1', title.showName);
            return searchInFolder(path, title);
        });
        if (isNew) {
            console.log(prettyMovieName.format(title) + ' is new');
        }
    });
}

for (var i = 0; i < feeds.length; i++) {
    getUrl(feeds[i], addTitle);
}