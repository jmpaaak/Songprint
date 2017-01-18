module.exports = function (default_data) {
    var lines = default_data.split('\r\n');
    var songNames = lines[0].split(','); // name array

    var JSONData = {}; // output json data

    // initialize tone array at each song name property of JSONData
    for(var i=0; i<songNames.length; i++) {
      JSONData[songNames[i]] = []; // { "내사람": [], ... }  Obj["property"] => value
    }

    // set tone data
    for(var i=3; i<lines.length; i++) { // after 4 is tone data
        var values = lines[i].split(','); // array of each cell data of excel sheet
        for(var j=0; j<values.length; j++) {
            if(values[j] !== '') {
                var arr = JSONData[songNames[j]]; // 출력 json의 프로퍼티인 노래제목으로 접근하여 배열 ref 가져옴
                arr.push(parseFloat(values[j]));
            }
        }
    }



    /*** tone data refining for extracting similar rate ***/

    // find max tone length in all song
    var max_tone_length = 0;
    for(var i=0; i < songNames.length; i++) {
      var curLength = JSONData[songNames[i]].length; // all tone length
      // console.log(songNames[i]+": "+curLength);
      if(max_tone_length < curLength)
        max_tone_length = curLength;
    }

    for (var i=0; i<songNames.length; i++){
        var need_Extra_Index = max_tone_length - JSONData[songNames[i]].length;
        var unit_Index = max_tone_length / need_Extra_Index;            // 삽입해야 하는 index 위치를 찾기 위해, 최종 늘려진 길이 기준으로 덩어리를 구함
                                                                        // ex) 1, 2, 3, (삽입위치), 4, 5, 6, (삽입위치), ...-> unit=4

        var curToneArr = JSONData[songNames[i]];
        for (var j=0; j<need_Extra_Index; j++){
            var indexToInsert = j * unit_Index + (unit_Index - 1);      // 삽입 위치 (등차수열 점화식)

            if (curToneArr[parseInt(indexToInsert)] == null){           // 마지막 노트 == null
                curToneArr.splice(parseInt(indexToInsert), 0, curToneArr[parseInt(indexToInsert) - 1]);
            }
            else{
                var avg = 0.5 * (curToneArr[parseInt(indexToInsert - 1)] + curToneArr[parseInt(indexToInsert)]);
                curToneArr.splice(parseInt(indexToInsert), 0, avg);
            }
        }
    }

    // 유사도 판단
    for(var i=0; i < songNames.length; i++) {
        var targetRating = JSONData[songNames[i]];
        for(var j=0; j < songNames.length; j++) {
            var otherOne = JSONData[songNames[j]];
            var diffSum = 0;
            for(var k=0; k < max_tone_length; k++) { // length is already normalized
                temp = parseFloat(targetRating[k]) - parseFloat(otherOne[k]);
                diffSum += temp;
            }
            targetRating[k] = Math.abs(diffSum); // 마지막 음 데이터 다음 index에 저장
            console.log(songNames[i]+"와 "+songNames[j]+" 간 선율 변이값: "+targetRating[k]);
        }
    }

    return JSONData;

}
