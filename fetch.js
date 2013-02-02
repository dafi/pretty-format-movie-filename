var url = require('url');
var http = require('http');
var fs = require('fs');
var prettyMovieName = require('./prettyFormatMovieName');

var feeds = [
"http://torrentz.eu/feed?q=2+broke+girls",
"http://torrentz.eu/feed?q=30+rock",
"http://torrentz.eu/feed?q=arrow",
"http://torrentz.eu/feed?q=beauty+and+the+beast",
"http://torrentz.eu/feed?q=bunheads",
// "http://torrentz.eu/feed?q=community",
// "http://torrentz.eu/feed?q=drop+dead+diva",
// "http://torrentz.eu/feed?q=fairly+legal",
// "http://torrentz.eu/feed?q=glee",
"http://torrentz.eu/feed?q=happy+endings",
// "http://torrentz.eu/feed?q=hunted",
// "http://torrentz.eu/feed?q=last+resort",
"http://torrentz.eu/feed?q=mike+and+molly",
"http://torrentz.eu/feed?q=modern+family",
"http://torrentz.eu/feed?q=new+girl",
"http://torrentz.eu/feed?q=person+of+interest",
// "http://torrentz.eu/feed?q=rizzoli+%26+isles",
"http://torrentz.eu/feed?q=suits",
//"http://torrentz.eu/feed?q=revolution",
"http://torrentz.eu/feed?q=switched+at+birth",
"http://torrentz.eu/feed?q=smash",
"http://torrentz.eu/feed?q=the+big+bang+theory",
//"http://torrentz.eu/feed?q=secret+state",
"http://torrentz.eu/feed?q=whitney",
"http://torrentz.eu/feed?q=nashville"
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
        process.stdout.write('\n');
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

function writeHTML(htmlBody) {
    var html = '<!DOCTYPE html><html><head><title>Movies to download</title></head><body>%1</body></html>';

    html = html.replace('%1', htmlBody);
    fs.writeFileSync('./tmptest/listmovies.html', html, 'utf-8');
}

function showNewTitles(titles) {
    var itemsNews = [];
    var htmlLinks = '';

    titles.forEach(function(title) {
        var isNew = !searchPaths.some(function(searchPath) {
            var path = searchPath.replace('%1', title.movie.showName);
            return searchInFolder(path, title.movie);
        });
        if (isNew) {
            var prettyName = prettyMovieName.format(title.movie);
            console.log(prettyName + ' is new');
            htmlLinks += '<a href="' + title.link + '">' + prettyName + '</a><br/>';
        }
    });
    writeHTML(htmlLinks);
}

for (var i = 0; i < feeds.length; i++) {
    getUrl(feeds[i], addTitle);
}
