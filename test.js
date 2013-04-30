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
'arrow.S01E01.mp4',
"1600.Penn.S01E02.HDTV.x264-2HD.mp4"
];

function generateTestSuite() {
	console.log('[');
	for (var i = 0; i < list.length; i++) {
		console.log('{"inputValue":"' + list[i] + '", "expectedResult":' + JSON.stringify(prettyMovieName.parse(list[i])) + '},');
	}
	console.log(']');
}

function runTestSuite() {
	var tests = JSON.parse(fs.readFileSync('testSuite.json', 'UTF-8'));

	for (var i = 0; i < tests.length; i++) {
		var test = tests[i];
		var expected = test.expectedResult;
		var result = prettyMovieName.parse(test.inputValue);
		if (!result
			|| result.showName != expected.showName
			|| result.season != expected.season
			|| result.episode != expected.episode
			|| result.extraText != expected.extraText
			|| result.ext != expected.ext
			|| result.year != expected.year) {
			console.log('Test failed for test.inputValue');
			console.log('expected ' + JSON.stringify(expected));
			console.log('found ' + (result ? JSON.stringify(result) : 'null'));
		}
	}
}

// generateTestSuite();
runTestSuite();

// for (var i = 0; i < list.length; i++) {
// 	console.log('Testing ' + list[i]);
// 	console.log(" original '" + list[i] + "' formatted '" + prettyMovieName.format(list[i]) + "'");
// }

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
