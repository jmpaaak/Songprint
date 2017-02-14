var iconv = require('iconv-lite');
var fs = require('fs-extra');

var refine_silmilar_rate = require('./tone-similar-rate-js');

// var default_data = fs.readFileSync("./노래 데이터 (1).csv").toString('euckr');
var default_data = iconv.decode(fs.readFileSync("./노래데이터 최종.csv"), 'euckr');

var rates = refine_silmilar_rate(default_data); // TODO 유사도 구하기
// console.log(rates);

/*** 노드를 그리기 위한 json parsing ***/
var lines = default_data.split('\r\n');
var header = lines[0].split(',');

var artistKORList = lines[1].split(',');        //아티스트 국문 배열
var artistENGList = lines[3].split(',');        //아티스트 영문 배열
var songNameENGList = lines[2].split(',');      //곡명 영문 배열
var releaseYearList = lines[4].split(',');      //연도 데이터 배열
var genreList = lines[5].split(',');            //장르 데이터 배열

var JSONValues = [];
for(var i=0; i<header.length; i++) {
    var data = {};
    data[header[i]] = [];

    data["artistKOR"] = artistKORList[i];
    data["artistENG"] = artistENGList[i];
    data["songNameENG"] = songNameENGList[i];
    data["year"] = releaseYearList[i];          // 연도 property 추가
    data["genre"] = genreList[i];               // 장르 property 추가
    JSONValues.push(data);
}

for(var i=6; i<lines.length; i++) {
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

// console.log(JSONValues);
/*** end of 노드를 그리기 위한 json parsing ***/


fs.outputJson('./toneData-test20170214.json', JSONValues, function(err) {
    console.log(err);
});

/** graph json **/
fs.outputJson('./graph-test20170214.json', rates, function(err) {
    console.log(err);
});
