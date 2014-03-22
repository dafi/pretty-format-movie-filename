var fs = require('fs');
var prettyMovieName = require('./prettyFormatMovieName');
var pathMod = require('path');
var child_process = require('child_process');

exports.endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

exports.searchInFolder = function(path, title, excludeExts) {
    if (fs.existsSync(path)) {
        return fs.readdirSync(path).some(function(el) {
            var skipFile = excludeExts.some(function(ext) {
                return exports.endsWith(el, ext);
            });
            if (skipFile) {
                return false;
            }

            var parsed = prettyMovieName.parse(el);
            // compare showName removing all not alphanumeric characters
            if (parsed && title.showName.replace(/[^a-zA-Z0-9]/gi, '') == parsed.showName.replace(/[^a-zA-Z0-9]/gi, '')) {
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

exports.renamePrettified = function(path, oldName) {
    var newName = prettyMovieName.format(oldName);

    if (newName) {
        fs.renameSync(path + oldName, path + newName);
    } else {
        console.error('Unable to rename file ' + oldName);
    }
}

exports.getOutputPath = function(scriptDir, config) {
    if (typeof(config.outputPath) == 'undefined') {
        return pathMod.join(scriptDir, 'tmptest');
    }

    // check if absolute path
    if (config.outputPath.charAt(0) == pathMod.sep) {
        return config.outputPath;
    }

    return pathMod.join(scriptDir, config.outputPath);
}

exports.unzipAndPrettify = function(zipPath, destPath, deleteZip) {
    child_process.execFile('unzip', ['-o', zipPath, '-d', destPath], {}, function(error, stdout, stderr) {
        var m = stdout.match(/inflating:\s+.*/im);
        if (m) {
            m = m[0].match(/inflating:\s+(.*)/i);
            if (m) {
                var extractedFileName = m[1].trim();
                var m = extractedFileName.match(/(^.*\/)(.*$)/);
                if (m) {
                    exports.renamePrettified(m[1], m[2]);
                }
            }
        }
        if (deleteZip) {
            fs.unlinkSync(zipPath);
        }
    });
}

