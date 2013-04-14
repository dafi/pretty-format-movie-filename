var fs = require('fs');
var argv = process.argv;
var prettyMovieName = require('./prettyFormatMovieName');

if (argv.length == 2) {
    console.log('Please specify a folder or file name');
    process.exit(1);
}

function renamePrettified(path, oldName) {
    var newName = prettyMovieName.format(oldName);

    if (newName) {
        fs.renameSync(path + oldName, path + newName);
    } else {
        console.error('Unable to rename file ' + oldName);
    }
}

var stat = fs.lstatSync(argv[2]);

if (stat.isFile()) {
	var m = argv[2].match(/(^.*\/)(.*$)/);
	if (m) {
		renamePrettified(m[1], m[2]);
	}

} else if (stat.isDirectory()) {
	var path = argv[2] + '/';
	var files = fs.readdirSync(path);

	for (var i = 0; i < files.length; i++) {
		renamePrettified(path, files[i]);
	}
}
