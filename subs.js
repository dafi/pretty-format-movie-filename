var fs = require('fs');
var prettyMovieName = require('./prettyFormatMovieName');
var argv = process.argv;
var pathMod = require('path');
var child_process = require('child_process');
var zlib = require('zlib');

var scriptDir = argv[1].substring(0, argv[1].lastIndexOf(pathMod.sep) + 1);

var config = JSON.parse(fs.readFileSync(scriptDir + 'subs.json', 'UTF-8'));
var feedData  = config.feedData;
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

//  {"url":"http://subspedia.weebly.com/1/feed", "urlWrapperRE":"href=.http:.*?zip", "downloadUrlRE":"(http.*zip?)", "nameRE":"\/(?!.*\/)(.*)"}

function getSubs(feed) {
    var urlWrapperRE = new RegExp(feed.urlWrapperRE, 'g');
    var downloadUrlRE = new RegExp(feed.downloadUrlRE);
    var nameRE = new RegExp(feed.nameRE);

    child_process.execFile('curl', [feed.url], {}, function(error, stdout, stderr) {
	    var itemsNews = [];
	    var titles = [];
	    var links = [];

		stdout.match(urlWrapperRE).forEach(function(urlWrapper) {
//            var link = href.match(/(http.*zip?)/);
            var url = urlWrapper.match(downloadUrlRE);
			if (url) {
				url = url[1];
                console.log('url ---> ', url);
                var name = url.match(nameRE);
                if (name) {
                    name = name[1];
                console.log('name ---> ', name);
	            	var movie = prettyMovieName.parse(name);
                    if (movie) {
					   titles.push({link:url, movie:movie});
                    } else {
                        console.error('** Unable to parse ' + name);
                    }
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

feedData.forEach(function(feed) {
	getSubs(feed);
});
