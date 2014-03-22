#!/usr/local/bin/node
var argv = process.argv;
var pathMod = require('path');
var common = require('./common');

var fs = require('fs');
var child_process = require('child_process');
var prettyMovieName = require('./prettyFormatMovieName');
var parseString = require('xml2js').parseString;

var scriptDir = argv[1].substring(0, argv[1].lastIndexOf(pathMod.sep) + 1);
var config = JSON.parse(fs.readFileSync(scriptDir + 'subs.json', 'UTF-8'));
var searchPaths = config.searchPaths;
var tvSeries = config.tvSeries;
var outputPath = common.getOutputPath(scriptDir, config);

var subsList = [
        {feedUrl:'http://subspedia.weebly.com/1/feed', titleParser:subspedia}
        ];

var excludeExts = ['.mp4', '.avi'];

// http://www.subsfactory.it/subtitle/index.php\?action=downloadfile.*?"

function subspedia(xml) {
    parseString(xml, function (err, result) {
        result.rss.channel[0].item.forEach(function(item) {
            var title = item.title;
            var content = item['content:encoded'][0];
            var m = content.match(/<a href='(.*zip)'/);
            if (m) {
                var url = m[1];
                var index = url.lastIndexOf('/');
                if (index > 0) {
                    var fileName = url.substr(index + 1);
                    var movieName = prettyMovieName.parse(fileName);
                    var showName = movieName.showName.toLowerCase();

                    var isNew = !searchPaths.some(function(searchPath) {
                        var path = searchPath.replace('%1', movieName.showName);
                        return common.searchInFolder(path, movieName, excludeExts);
                    });

                    if (isNew) {
                        // console.log(fileName, '--> name = ', movieName);
                        tvSeries.forEach(function(tvSerie) {
                            if (tvSerie.toLowerCase() == showName) {
                                if (url.indexOf('http://www.weebly.com') == 0) {
                                    console.log('Fixed invalid url ' + url);
                                    url = url.substr('http://www.weebly.com'.length);
                                }
                                console.log('downloading ' + title);
                                var fullDestPath = pathMod.join(outputPath, fileName);
                                child_process.execFile('curl', ['-o', fullDestPath, url], {}, function(error, stdout, stderr) {
                                    common.unzipAndPrettify(fullDestPath, outputPath, true);
                                });
                            }
                        });
                    }
                }
            }
        });
    });
}

function getUrl(urlStr, callback) {
    child_process.execFile('curl', [urlStr], {}, function(error, stdout, stderr) {
        callback(stdout);
    })
}

subsList.forEach(function(subs) {
    getUrl(subs.feedUrl, subs.titleParser);
});
