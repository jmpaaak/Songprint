var w = window.innerWidth || document.body.clientWidth,
    h = window.innerHeight || document.body.clientHeight;
var paddingX = 80, paddingY = 10;
var graphW = w * 0.76;
var graphH = h * 0.96;
var nodeSize = graphW/50;
var LinkData = [];
var ToneData = [];
var countIndexForLinkData = 0; //엣지 배열에 접근하는데, 중복되어 생성되지 않은 엣지의 인덱스가 LinkData에서 중간에 채워지므로 간극 메꾸기 위해
var nodeColor = [
    d3.rgb('#33fff9'),  //0 R&B
    d3.rgb('#c4ff0b'),  //1 발라드
    d3.rgb('#a0a0a0'),  //2 포크
    d3.rgb('#0b63ff'),  //3 댄스
    d3.rgb('#f77908'),  //4 락
    d3.rgb('#fc00fc')   //5 힙합
];
var rimColor = [
    d3.rgb('#93fffc'),  //0 R&B
    d3.rgb('#e6ff96'),  //1 발라드
    d3.rgb('#e3e1e1'),  //2 포크
    d3.rgb('#8cb5ff'),  //3 댄스
    d3.rgb('#ffac62'),  //4 락
    d3.rgb('#ff61ff')   //5 힙합
];

var zoom = d3.behavior.zoom() // 줌 기능 추가
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

var drag = d3.behavior.drag() // 드래그 기능 추가
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);

function zoomed() { // zoom 이벤트 콜백
    gElemBelowSVG.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("dragging", true);
}

function dragged(d) {
    d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}

function dragended(d) {
    d3.select(this).classed("dragging", false);
}

var svg = d3.select("#container")
    .attr("align","center")
    .style("padding-top", paddingY+"px")
    .style("padding-bottom", paddingY+"px")
    .style("padding-right", paddingX+"px")
    .style("padding-left", paddingX+"px")

    .append("svg")
    .call(d3.behavior.zoom().scaleExtent([1, 30]) // scaleExtent[최소줌, 최대줌]
    .on("zoom", zoomed)); // 줌 이벤트 리스너 활성화

var gElemBelowSVG = svg.append("g");

// console.log(parseFloat(svg.style("width")));


var force = d3.layout.force()
    // .linkStrength(0.1)
    .linkStrength(function(link) { // 유사도에 따른 값 변경 //TODO
      // if(link.index == 0) {
      //   return 1; // 유사도가 높을 때
      // };
      // // return Math.random();
      // return 0.1;  // 유사도가 낮을 때
      return 5000/link.weight;
    })
    // .friction(0)
    .charge(-100)
    // .charge(function(node) {
    //   return -1000 * graphH / 1080; // 해상도 대응
    // })
    // .charge(function(node) {
    //   if(node.index == 0 ||node.index == 2||node.index ==4||node.index ==5||node.index ==9) return -700;
    //   else return -100;
    // })
    // .gravity(0)
    .size([graphW, graphH])
    // .theta(0);

/********************** Edge Color Decide Area ***********************/
function CompareAndResult(genre) {
    if (genre == "R&B") return nodeColor[0];
    if (genre == "발라드") return nodeColor[1];
    if (genre == "포크") return nodeColor[2];
    if (genre == "댄스") return nodeColor[3];
    if (genre == "락") return nodeColor[4];
    if (genre == "힙합") return nodeColor[5];
}
function EdgeColorDecideFunc(srcNode, dstNode) {
    var yearSrc = parseInt(srcNode.year.substring(0, 4));
    var monthSrc = parseInt(srcNode.year.substring(4, 6));
    var daySrc = parseInt(srcNode.year.substring(6, 8));

    var yearDst = parseInt(dstNode.year.substring(0, 4));
    var monthDst = parseInt(dstNode.year.substring(4, 6));
    var dayDst = parseInt(dstNode.year.substring(6, 8));

    if (yearSrc > yearDst){
        return CompareAndResult(dstNode.genre);
    }
    else if (yearSrc == yearDst){
        if (monthSrc > monthDst){
            return CompareAndResult(dstNode.genre);
        }
        else if ( monthSrc == monthDst){
            if (daySrc > dayDst){
                return CompareAndResult(dstNode.genre);
            }
            else if (daySrc == dayDst){
                return CompareAndResult(srcNode.genre);
            }
            else if (daySrc < dayDst){
                return CompareAndResult(srcNode.genre);
            }
        }
        else if (monthSrc < monthDst){
            return CompareAndResult(srcNode.genre);
        }
    }
    else if (yearSrc < yearDst){
        return CompareAndResult(srcNode.genre);
    }
}
/******************* End of 'Edge Color Decide Area' ********************/

//init data
d3.json("lib/cvs-to-json/toneData-test20170214.json", function (json) {
    ToneData = json;
    force.nodes(ToneData);

    // 'parsing' data Sting to Float
    ToneData = ToneData.map(function(elem) {
        var attr_arr = Object.getOwnPropertyNames(elem);
        var song_name = attr_arr[0];
        for(var i=0; i<elem[song_name].length; i++) { // elem[song_name] : 음들의 배열 - 각 음은 하나의 객체로 이루어짐
            var tone_obj = elem[song_name][i]; // 각 음 객체를 변수에 할당
            tone_obj["value"] = parseFloat(tone_obj["value"])*1.5+15; // 노드 크기를 임의로 조절하기 위함
            elem[song_name][i] = tone_obj;
        }
        return elem;
    });

    d3.json("lib/cvs-to-json/graph-test20170214.json", function (json) { //d3.json의 파라미터로 들어가고 있던것 (GraphFile.json과 ToneData.jason)
        LinkData = json.links;
        LinkData = LinkData.map(function(link) {
          link.index = link.source;
          return link;
        })
        force.links(LinkData);
        force.start();

        var links = gElemBelowSVG.append("g")
            .attr("class", "links") // html element에 class라는 이름의 속성 추가. 속성에 대한 값은 "links"
            //.attr("transform", "translate(-" + nodeSize/2 + ", -" + nodeSize/2 + ")");

        var link = links.selectAll(".link")
            .data(LinkData)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke-width", function (d) {
                return 2500/d.weight;
            })
            .style("stroke-opacity", function (d) {
                return 0.5;
            })
            .style("stroke", function(d) {
                var srcNode = LinkData[countIndexForLinkData].source;
                var dstNode = LinkData[countIndexForLinkData].target;
                countIndexForLinkData++;

                return EdgeColorDecideFunc(srcNode, dstNode);
            });

        var nodes = gElemBelowSVG.append("g")
            .attr("class", "nodes")
            .attr("transform", "translate(-" + nodeSize/2 + ", -" + nodeSize/2 + ")")
            .call(drag);

        var node = nodes.selectAll(".node")
            .data(ToneData)
            .enter().append("g")
            .attr("class", "node")
            .attr("id", function(d) {
                return "d"+d.index
            })
            .attr("artistKOR", function(d){     //artistKOR attr 추가
                return d.artistKOR;
            })
            .attr("artistENG", function(d){     //artistENG attr 추가
                return d.artistENG;
            })
            .attr("songNameENG", function(d){   //sonNameENG attr 추가
                return d.songNameENG;
            })
            .attr("genre", function(d){         //genre attr 추가
                return d.genre;
            })
            .attr("year", function(d){          //year attr 추가
                return d.year;
            })
            .call(force.drag)
            .each(function() {
                d3.select(this).call(drawRadarChart);
            })
            .on('mouseover', function (d){
                /*
                for(var i=0; i<LinkData.length; i++) {
                    for (var prop in LinkData[i]) {
                        var obj = LinkData[i];
                        if(prop == "source" && obj[prop].index == d.index) {
                            d3.select("#d"+obj["target"].index)
                                .style("fill-opacity", 1)
                                .style("fill", 'white')
                                .append("text")
                                .attr("dx", 0)
                                .attr("dy", 4)
                                .text(function (d) {
                                    var propArr = Object.getOwnPropertyNames(d);
                                    return propArr[0];
                                });
                        }
                    }
                }
                */
                d3.select(this).append("text")
                    .attr("dx", 0)
                    .attr("dy", 4)
                    .text(function (d) {
                        var propArr = Object.getOwnPropertyNames(d);
                        return propArr[0];
                    })
                    .style("fill", 'white');
            })
            .on('mouseout', function(){
                d3.selectAll("text").remove();
            })
            .on('mousedown', function(d, links){
                var clickedNode = d;

                //기존의 화살표 제거 코드 (최초 아무 화살표 없는 상황 고려)

                //기존의 불투명해진 엣지 투명도 0.5로 복구 코드 (최초 모두 투명한 상황 고려)

                //새로운 화살표(자신보다 최신의 노래와 연결된 노드 방향) 그리기 코드


                //해당 엣지들의 불투명화 코드
            });

        force.on("tick", function () {
            link.attr("x1", function (d) {
                return d.source.x;
            })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });

            node.attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        });
    });

});

//Options for the Radar chart, other than default
var mycfg = {
    w: nodeSize,
    h: nodeSize,
    // maxValue: 1,
    levels: 0,
    radius: 1,
    factor: 1,
    factorLegend: 1,
    radians: 2 * Math.PI,
    TranslateX: 0,
    TranslateY: 0,
    ExtraWidthX: 0,
    ExtraWidthY: 0
};

function drawRadarChart() {
    var id_str = this.attr("id");
    var id_str_split = id_str.split('');
    id_str_split.shift();
    var id = id_str_split.join('');
    var attr_arr = Object.getOwnPropertyNames(ToneData[id]);
    var song_name = attr_arr[0];

    var paramArray = [];
    var genreParam = ToneData[id].genre;
    var yearParam = ToneData[id].year;
    var artistKORParam = ToneData[id].artistKOR;
    var artistENGParam = ToneData[id].artistENG;
    var songNameENGParam = ToneData[id].songNameENG;

    paramArray.push(genreParam); paramArray.push(yearParam); paramArray.push(artistKORParam); paramArray.push(artistENGParam); paramArray.push(songNameENGParam);
    //ParamArray
    // index 0: 장르
    // index 1: 연도
    // index 2: 아티스트 국문
    // index 3: 아티스트 영문
    // index 4: 노래제목 영문

    RadarChart.draw("#d"+id, new Array(ToneData[id][song_name]), mycfg, paramArray);
}

////////////////////////////////////////////
/////////// Initiate legend ////////////////
////////////////////////////////////////////

// var svg = d3.select('#body')
//     .selectAll('svg')
//     .append('svg')
//     .attr("width", w+300)
//     .attr("height", h)
//
// //Create the title for the legend
// var text = svg.append("text")
//     .attr("class", "title")
//     .attr('transform', 'translate(90,0)')
//     .attr("x", w - 70)
//     .attr("y", 10)
//     .attr("font-size", "12px")
//     .attr("fill", "#404040")
//     .text("What % of owners use a specific service in a week");
//
// //Initiate Legend
// var legend = svg.append("g")
//         .attr("class", "legend")
//         .attr("height", 100)
//         .attr("width", 200)
//         .attr('transform', 'translate(90,20)')
//     ;
// //Create colour squares
// legend.selectAll('rect')
//     .data(LegendOptions)
//     .enter()
//     .append("rect")
//     .attr("x", w - 65)
//     .attr("y", function(d, i){ return i * 20;})
//     .attr("width", 10)
//     .attr("height", 10)
//     .style("fill", function(d, i){ return colorscale(i);})
// ;
// //Create text next to squares
// legend.selectAll('text')
//     .data(LegendOptions)
//     .enter()
//     .append("text")
//     .attr("x", w - 52)
//     .attr("y", function(d, i){ return i * 20 + 9;})
//     .attr("font-size", "11px")
//     .attr("fill", "#737373")
//     .text(function(d) { return d; })
