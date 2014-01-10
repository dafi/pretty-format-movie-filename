var fs = require('fs');
var prettyMovieName = require('./prettyFormatMovieName');
var argv = process.argv;
var pathMod = require('path');
var child_process = require('child_process');
var zlib = require('zlib');

var scriptDir = argv[1].substring(0, argv[1].lastIndexOf(pathMod.sep) + 1);

var config = JSON.parse(fs.readFileSync(scriptDir + 'subs.json', 'UTF-8'));
var feeds = config.feeds;
var searchPaths = config.searchPaths;
var outputPath = getOutputPath();

// files ending with these extensions will be not considered movies
// and will not be used to check if movies must be downloaded
var excludeExts = ['.mp4'];

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

function getSubs(urlStr) {
    child_process.execFile('curl', [urlStr], {}, function(error, stdout, stderr) {
	    var itemsNews = [];
	    var titles = [];
	    var links = [];

		stdout.match(/href=.http.*?zip/g).forEach(function(href) {
			var link = href.match(/(http.*zip?)/);
			if (link) {
				var url = link[1];
				var idx = url.lastIndexOf('/');
				if (idx > 0) {
	            	var movie = prettyMovieName.parse(url.substring(idx + 1));
					titles.push({link:url, movie:movie});
				}
			}
		});
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

	    links.forEach(function(link) {
	    	downloadSubs(link);
	    });
    });
}

function downloadSubs(linkData) {
    var fullDestPath = pathMod.join(outputPath, linkData.label);
    child_process.execFile('curl', ['-o', fullDestPath, linkData.url], {}, null);
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

feeds.forEach(function(feed) {
	getSubs(feed);
});
