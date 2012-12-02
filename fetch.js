var url = require('url');
var http = require('http');
var prettyMovieName = require('./prettyFormatMovieName');

var options = url.parse('http://torrentz.eu/feed?q=arrow');
// http.get needs 'path' to work
options.path = options.pathname + options.search;

var feedXml = '';
http.get(options, function(res) {
    res.on("data", function(chunk) {
      feedXml += chunk.toString();
    });
    res.on('end', function() {
      var singleLine = feedXml.replace(/(\n|\r|\t)/g, '');
      var m = singleLine.match(/<item> *<title>.*?<\/title>/g);
      if (m) {
      console.log('found ' + m.length);
        for (var i = 0; i < m.length; i++) {
          var fileName = m[i].match(/<title>(.*?)<\/title>/)[1];
          var norm = prettyMovieName.parse(fileName);
          console.log(i + " original '" + fileName + "' formatted '" + prettyMovieName.format(fileName) + "'");
          // console.log('elements ', norm);
        }
      }
      console.log(singleLine);
    });
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});