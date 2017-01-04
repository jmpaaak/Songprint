module.exports = function (default_data) {
    var lines = default_data.split('\r\n');
    var songNames = lines[0].split(',');

    var JSONData = {};

    //initialize tone array at each song name property of JSONData
    for(var i=0; i<songNames.length; i++) { JSONData[songNames[i]] = []; }

    //set tone data
    for(var i=4; i<lines.length; i++) { // after 4 is tone data
        var values = lines[i].split(',');
        for(var j=0; j<values.length; j++) {
            if(values[j] !== '') {
                var arr = JSONData[songNames[j]];
                arr.push(parseFloat(values[j]));
            }
        }
    }


    /*** tone data refining for extracting similar rate ***/

    // //find max tone length in all song
    // var max_tone_length = 0;
    // for(var i=4; i<lines.length; i++) { // after 4 is tone data
    //     var values = lines[i].split(',');
    //     if(max_tone_length < values.length) max_tone_length = values.length;
    // }
    //
    // //subtract average tones data to each tone data
    // var max_tone_length = 0;
    // for(var i=4; i<lines.length; i++) { // after 4 is tone data
    //     var values = lines[i].split(',');
    //     if(max_tone_length < values.length) max_tone_length = values.length;
    // }


    return JSONData;
}
