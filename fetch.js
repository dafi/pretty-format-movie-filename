var url = require('url');
var http = require('http');
var fs = require('fs');
var prettyMovieName = require('./prettyFormatMovieName');

var feeds = [
"http://torrentz.eu/feed?q=2+broke+girls",
"http://torrentz.eu/feed?q=arrow",
"http://torrentz.eu/feed?q=beauty+and+the+beast",
"http://torrentz.eu/feed?q=community",
"http://torrentz.eu/feed?q=drop+dead+diva",
"http://torrentz.eu/feed?q=fairly+legal",
"http://torrentz.eu/feed?q=glee",
"http://torrentz.eu/feed?q=happy+endings",
"http://torrentz.eu/feed?q=hunted",
"http://torrentz.eu/feed?q=last+resort",
"http://torrentz.eu/feed?q=mike+and+molly",
"http://torrentz.eu/feed?q=modern+family",
"http://torrentz.eu/feed?q=new+girl",
"http://torrentz.eu/feed?q=person+of+interest",
"http://torrentz.eu/feed?q=rizzoli+%26+isles",
"http://torrentz.eu/feed?q=suits",
"http://torrentz.eu/feed?q=switched+at+birth",
"http://torrentz.eu/feed?q=the+big+bang+theory"];

var rootFolder = '/Volumes/PlugDisk/mm/movies';

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
                // get jusr first feed item
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
        titles.sort();
        showNewTitles(titles);
    }
}

function showNewTitles(titles) {
    for (var i = 0; i < titles.length; i++) {
        var title = titles[i];
        var path = rootFolder + '/' + title.showName;
        if (fs.existsSync(path)) {
            var containsName = fs.readdirSync(path).some(function(el) {
                var parsed = prettyMovieName.parse(el);
                return parsed
                    && title.season == parsed.season 
                    && title.episode == parsed.episode;
            });
            if (!containsName) {
                console.log(prettyMovieName.format(title) + ' is new');
            }
        } else {
            //console.log(path + ' doesn\'t exist');
        }
    }
}

for (var i = 0; i < feeds.length; i++) {
    getUrl(feeds[i], addTitle);
}