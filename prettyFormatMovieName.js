exports.parse = function(fileName) {
    var file = fileName.toLowerCase().replace(/\s+/g, '.');

    // remove year if present
    var year = '';
    var m = file.match(/.([0-9]{4})./);
    if (m && m.length == 2) {
        year = m[1];
        file = file.replace(/.[0-9]{4}./, '.');
    }

    // handle file name of type sDDeDD or DxXX where D = digit
    var m = file.match(/(^.*?)s?([0-9]{1,2})[e|x]?([0-9]{2})(.*?)\.?.*(\..{3})/i);

    if (m && m.length == 6) {
        return {
            showName: m[1].replace(/\.+$/, ''),
            season: parseInt(m[2], 10),
            episode: parseInt(m[3], 10),
            extraText: m[4],
            ext: m[5].replace(/^\.+/, ''),
            year: year
        };
    }
    return null;
}

exports.format = function(formatObjOrString) {
    if (formatObjOrString == null || typeof(formatObjOrString) == 'undefined') {
        return '';
    }
    if (typeof(formatObjOrString) == "string") {
        formatObjOrString = this.parse(formatObjOrString);
        if (formatObjOrString == null) {
            return '';
        }
    }
    var season = formatObjOrString.season;
    var episode = formatObjOrString.episode;
    var str = formatObjOrString.showName + '.'
        + 's' + (season < 10 ? '0' + season : season)
        + 'e' + (episode < 10 ? '0' + episode : episode);
    if (formatObjOrString.extraText) {
        str += '.' + formatObjOrString.extraText
    }
    if (formatObjOrString.ext) {
        str += '.' + formatObjOrString.ext;
    }
    return str;
}