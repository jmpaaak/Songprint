module.exports = function (default_data) {
    var lines = default_data.split('\r\n');
    var songNames = lines[0].split(','); // name array

    var JSONData = {}; // temp json data
    var JSONGraphData = {}; // output graph json data
    JSONGraphData["links"] = [];

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

    for (var i=0; i<songNames.length; i++) {
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

    // weight 영역을 결정하기 위해 음 별 차이합의 최솟값 구한다
    for(var i=0; i < songNames.length; i++) {
        var diffSumMin = 987654321;
        var targetRating = JSONData[songNames[i]];
        var targetIndex = -1;
        for(var j=0; j < songNames.length; j++) {
            var otherOne = JSONData[songNames[j]];
            var diffSum = 0;

            for(var k=0; k < max_tone_length; k++) { // length is already normalized
                diffPart = parseFloat(targetRating[k]) - parseFloat(otherOne[k]);
                diffSum += Math.abs(diffPart); // 음 별 차이의 절대값을 모두 더한다
            }

            if(diffSumMin > diffSum && diffSum != 0) {
              diffSumMin = diffSum;
              targetIndex = j;
            }
        }

        var edgeNew = {
          source: i,
          target: targetIndex,
          weight: diffSumMin
        };

        // 소스와 데스티네이션이 반대로된 중복 edge가 있는지 찾는 반복문
        var alreadyAdded = false;
        JSONGraphData["links"].forEach(function (edge) {
          if(edgeNew.source == edge.target &&
            edge.source == edgeNew.target)
            alreadyAdded = true;
        });

        // 중복 edge는 추가하지 않음
        if(!alreadyAdded) {
          JSONGraphData["links"].push(edgeNew);
          console.log(songNames[i]+"와 "+songNames[targetIndex]+" 간 선율 변이값: "+diffSumMin);
        }
    }

    // // console.log("diffSumMin: "+diffSumMin);
    //
    // // edge 길이를 단계 별로 linear하게 결정하기 위한 과정
    // var diffSumUpperBound = 1500; // 에지를 이을 상한값
    // var stage = 300; // 단계
    // var unitEdgeLength = 0.5 / stage; // 최대길이 / stage
    // var edgeLengthArr = [];
    // var diffSumUpperRangeArr = [];
    // for(var i=0; i < stage; i++) {
    //   edgeLengthArr[i] = (i+1) * unitEdgeLength; // 단계 별로 에지 길이 배분
    //   // console.log(edgeLengthArr[i].toFixed(1));
    //   edgeLengthArr[i] = parseFloat(edgeLengthArr[i].toFixed(5)); // 소수점 여섯째 자리에서 버림
    //   diffSumUpperRangeArr[i] = diffSumMin + (i+1) * (diffSumUpperBound - diffSumMin) / stage; // 단계 별 diffSum의 최대허용치 할당
    // }
    //
    // // console.log("diffSumUpperRangeArr below");
    // // console.log(diffSumUpperRangeArr);
    //
    // // 유사도 판단
    // for(var i=0; i < songNames.length; i++) {
    //     var targetRating = JSONData[songNames[i]];
    //     for(var j=0; j < songNames.length; j++) {
    //         var otherOne = JSONData[songNames[j]];
    //         var diffSum = 0;
    //         var targetSum = 0;
    //
    //         for(var k=0; k < max_tone_length; k++) { // length is already normalized
    //             diffPart = parseFloat(targetRating[k]) - parseFloat(otherOne[k]);
    //             diffSum += Math.abs(diffPart); // 음 별 차이의 절대값을 모두 더한다
    //         }
    //
    //         targetRating[k] = diffSum; // 마지막 음 데이터 다음 index에 임시 저장 // TODO 유사도 구하기 전 임의적인 할당임에 주의!
    //
    //
    //         // graph json 객체 구축
    //         if(diffSum <  diffSumUpperBound && diffSum != 0) {
    //
    //           // edge 길이(weight)를 결정하기위한 range 배열 내 index를 찾는 과정
    //           diffSumUpperRangeArr.push(diffSum); // 배열 마지막에 추가
    //           diffSumUpperRangeArr.sort();
    //           var indexInRange = diffSumUpperRangeArr.indexOf(diffSum); // diffSum의 현재 index 할당
    //           diffSumUpperRangeArr.splice(indexInRange, 1); // 배열을 복구
    //
    //           var edgeNew = {
    //             source: i,
    //             target: j,
    //             weight: edgeLengthArr[indexInRange]
    //           };
    //
    //           // 소스와 데스티네이션이 반대로된 중복 edge가 있는지 찾는 반복문
    //           var alreadyAdded = false;
    //           JSONGraphData["links"].forEach(function (edge) {
    //             if(edgeNew.source == edge.target &&
    //               edge.source == edgeNew.target)
    //               alreadyAdded = true;
    //           });
    //           // 중복 edge는 추가하지 않음
    //           if(!alreadyAdded) JSONGraphData["links"].push(edgeNew);
    //
    //           // console.log(songNames[i]+"와 "+songNames[j]+" 간 선율 변이값: "+targetRating[k]);
    //         }
    //     } // end of j loop
    // } // end of i loop

    return JSONGraphData;

}
