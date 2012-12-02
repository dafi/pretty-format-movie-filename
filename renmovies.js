var fs = require('fs');
var argv = process.argv;
var prettyMovieName = require('./prettyFormatMovieName');

if (argv.length == 2) {
    console.log('Please specify a folder name');
    process.exit(1);
}
var path = argv[2] + '/';
var files = fs.readdirSync(path);

for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var newName = prettyMovieName.format(file);

    if (newName) {
        fs.renameSync(path + file, path + newName);
    } else {
        console.error('Unable to rename file ' + file);
    }
}
