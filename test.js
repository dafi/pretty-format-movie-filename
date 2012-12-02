var fs = require('fs');
var argv = process.argv;
var prettyMovieName = require('./prettyFormatMovieName');

var list = [
"30.Rock.S07E07.HDTV.x264-LOL.mp4",
"Arrow.S01E07.HDTV.x264-LOL.[VTV].mp4",
"Beauty.and.the.Beast.2012.S01E07.HDTV.x264-ASAP.mp4",
"Fairly.Legal.S02E13.HDTV.x264-ASAP.mp4",
"Glee.S04E08.HDTV.x264-LOL.[VTV].mp4",
"Happy.Endings.S03E03.HDTV.x264-LOL.mp4",
"Hunted.S01E08.HDTV.x264-TLA.mp4",
"Mike.and.Molly.S03E08.HDTV.x264-LOL.mp4",
"New.Girl.S02E09.HDTV.x264-LOL.[VTV].mp4",
"Person.of.Interest.S02E08.HDTV.x264-LOL.mp4",
"Revolution.2012.S01E10.HDTV.x264-LOL.mp4",
"Rizzoli.and.Isles.S03E11.HDTV.x264-LOL.[VTV].mp4",
"Suits.S02E10.HDTV.x264-ASAP.[VTV].mp4",
"Switched.at.Birth.S01E30.HDTV.x264-ASAP.mp4",
"The.Big.Bang.Theory.S06E09.HDTV.x264-LOL.mp4",
]

for (var i = 0; i < list.length; i++) {
	console.log(" original '" + list[i] + "' formatted '" + prettyMovieName.format(list[i]) + "'");
}

var prettyMovieName = require('./prettyFormatMovieName');

if (argv.length >= 3) {
	if (argv[2] == 'ren') {
		var dirName = './tmptest';
		fs.mkdirSync(dirName, 0755);
		for (var i = 0; i < list.length; i++) {
			fs.closeSync(fs.openSync(dirName + '/' + list[i], 'w'));
		}

	}
} else {
    console.log('*** Specify "ren" to create a dummy folder to test rename movies');
}
