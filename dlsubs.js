#!/usr/local/bin/node
var argv = process.argv;
var pathMod = require('path');

var fs = require('fs');
var child_process = require('child_process');
var prettyMovieName = require('./prettyFormatMovieName');
var parseString = require('xml2js').parseString;

var scriptDir = argv[1].substring(0, argv[1].lastIndexOf(pathMod.sep) + 1);
var config = JSON.parse(fs.readFileSync(scriptDir + 'subs.json', 'UTF-8'));
var feeds = config.feeds;
var searchPaths = config.searchPaths;
var tvSeries = config.tvSeries;
var outputPath = getOutputPath();

var subsList = [
        {feedUrl:'http://subspedia.weebly.com/1/feed', titleParser:subspedia}
        ];

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
                    // console.log(fileName, '--> name = ', movieName);
                    tvSeries.forEach(function(tvSerie) {
                        if (tvSerie.toLowerCase() == showName) {
                            if (url.indexOf('http://www.weebly.com') == 0) {
                                console.log('Fixed invalid url ' + url);
                                url = url.substr('http://www.weebly.com'.length);
                            }
                            console.log('downloading ' + title);
                            var fullDestPath = pathMod.join(outputPath, fileName + 'xxx');
                            child_process.execFile('curl', ['-o', fullDestPath, url], {}, function(error, stdout, stderr) {
                                child_process.execFile('unzip', ['-o', fullDestPath, '-d', outputPath], {}, function(error, stdout, stderr) {
                                    var m = stdout.match(/inflating:\s+.*/im);
                                    if (m) {
                                        m = m[0].match(/inflating:\s+(.*)/i);
                                        if (m) {
                                            var extractedFileName = m[1].trim();
                                            var m = extractedFileName.match(/(^.*\/)(.*$)/);
                                            if (m) {
                                                renamePrettified(m[1], m[2]);
                                            }
                                        }
                                    }
                                    fs.unlinkSync(fullDestPath);
                                });
                            });
                        }
                    });
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

function renamePrettified(path, oldName) {
    var newName = prettyMovieName.format(oldName);

    if (newName) {
        fs.renameSync(path + oldName, path + newName);
    } else {
        console.error('Unable to rename file ' + oldName);
    }
}

subsList.forEach(function(subs) {
    getUrl(subs.feedUrl, subs.titleParser);
});
