var iconv = require('iconv-lite');
var fs = require('fs-extra');

// var default_data = fs.readFileSync("./노래 데이터 (1).csv").toString('euckr');
var default_data = iconv.decode(fs.readFileSync("./노래 데이터 (1).csv"), 'euckr')
var lines = default_data.split('\r\n');

var header = lines[0].split(',');

var JSONValues = [];

for(var i=0; i<header.length; i++) {
    var data = {};
    data[header[i]] = [];
    JSONValues.push(data);
}

for(var i=1; i<lines.length; i++) {
    var values = lines[i].split(',');
    for(var j=0; j<values.length; j++) {
        if(values[j] !== '') {
            var data = {};
            var arr = JSONValues[j][header[j]];
            data["axis"] = i;
            data["value"] = values[j];
            arr.push(data);
        }
    }
}

console.log(JSONValues);

fs.outputJson('./toneData.json', JSONValues, function(err) {
    console.log(err);
})
