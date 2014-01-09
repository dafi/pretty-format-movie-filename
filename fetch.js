var url = require('url');
var fs = require('fs');
var prettyMovieName = require('./prettyFormatMovieName');
var tu = require('./torrentUtils');
var child_process = require('child_process');
var pathMod = require('path');
var argv = process.argv;

var scriptDir = argv[1].substring(0, argv[1].lastIndexOf(pathMod.sep) + 1);

var config = JSON.parse(fs.readFileSync(scriptDir + 'feeds.json', 'UTF-8'));
var feeds = config.feeds;
var searchPaths = config.searchPaths;
var outputPath = getOutputPath();

var torrentsOutputPath = pathMod.join(outputPath, 'torrents');
var reportOutputPath = pathMod.join(outputPath, 'listmovies.html');

// files ending with these extensions will be not considered movies
// and will not be used to check if movies must be downloaded
var excludeExts = ['.zip', '.srt'];

function getUrl(urlStr, callback) {
    child_process.execFile('curl', [urlStr], {}, function(error, stdout, stderr) {
        var feedXml = stdout;

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
    })
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

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function searchInFolder(path, title) {
    if (fs.existsSync(path)) {
        return fs.readdirSync(path).some(function(el) {
            var skipFile = excludeExts.some(function(ext) {
                return endsWith(el, ext);
            });
            if (skipFile) {
                return false;
            }

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
        var fullDestPath = pathMod.join(torrentsOutputPath, link.label + '.torrent');
        child_process.execFile('curl', ['-o', fullDestPath, torrentUrl], {}, null);
    });

    html = html.replace('%1', htmlBody);
    fs.writeFileSync(reportOutputPath, html, 'utf-8');
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

function mkdirp(fs, path, mode) {
    mode = typeof(mode) == 'undefined' ? 0777 : mode;
    var parent = '';
    path = pathMod.normalize(path);

    // remove the last separator
    path = path.replace(/[\/\\]$/, '');

    path.split(pathMod.sep).forEach(function(p) {
        parent += p + pathMod.sep;
        if (!fs.existsSync(parent)) {
            fs.mkdirSync(parent, mode);
        }
    })
}

function getOutputPath() {
    if (typeof(config.outputPath) == 'undefined') {
        return pathMod.join(scriptDir, 'tmptest');
    }

    // check if absolute path
    if (config.outputPath.charAt(0) == pathMod.sep) {
        return config.outputPath;
    }

    return pathMod.join(scriptDir, config.outputPath);
}

if (!fs.existsSync(outputPath)) {
    mkdirp(fs, outputPath);
}

if (!fs.existsSync(torrentsOutputPath)) {
    mkdirp(fs, torrentsOutputPath);
}

for (var i = 0; i < feeds.length; i++) {
    getUrl(feeds[i], addTitle);
}

