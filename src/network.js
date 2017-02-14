// 브라우져 해상도 w, h
var w = window.innerWidth || document.body.clientWidth,
    h = window.innerHeight || document.body.clientHeight;

// 브라우져 해상도 기준 패딩
var paddingX = 0, paddingY = 0;

// 그래프 w, h
var graphW = w * 0.727;
var graphH = h * 0.95;

// 노드 사이즈
var nodeSize = graphW/50;

if(h >= 1080) // 해상도 대응. 노드 크기
  nodeSize *= 1.3;

// 네트워크 에지, 노드 데이터
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

var drag = d3.behavior.drag() // 드래그 객체 선언
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);

// svg 객체 : 최상위 객체. 모든 d3 객체를 포함.
var svg = d3.select("#container")
    .attr("align","center")
    .style("padding-top", paddingY+"px")
    .style("padding-bottom", paddingY+"px")
    .style("padding-right", paddingX+"px")
    .style("padding-left", paddingX+"px")
    .append("svg")
    // scaleExtent[최소줌, 최대줌]
    .call( d3.behavior.zoom().scaleExtent([1, 30]).on("zoom", zoomed) ); // 줌 이벤트 리스너 활성화



var arrow = svg.append("svg:defs").selectAll("marker")
    .data(["end"])      // Different link/path types can be defined here
    .enter().append("svg:marker")    // This section adds in the arrows
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 2)
    .attr("refY", 0)
    .attr("markerWidth", 1.7)
    .attr("markerHeight", 1.7)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr('fill-opacity', 0.1)
    .attr('fill', 'blue');






// svg 바로 아래 g객체. 캔버스 역할
var gElemBelowSVG = svg.append("g");

// force 객체 선언. 네트워크 구성 시 필요한 설정 값 세팅
var force = d3.layout.force()
    // .linkDistance(function(link) { // 유사도에 따른 값 변경 TODO
    //   // if(link.index == 0) {
    //   //   return 1; // 유사도가 높을 때
    //   // };
    //   // // return Math.random();
    //   // return 0.1;  // 유사도가 낮을 때
    //   return 200000/link.weight;
    // })
    // .linkStrength(function(link) { // 유사도에 따른 값 변경 TODO
    //   // if(link.index == 0) {
    //   //   return 1; // 유사도가 높을 때
    //   // };
    //   // // return Math.random();
    //   // return 0.1;  // 유사도가 낮을 때
    //   return 2000/link.weight;
    // })
    .charge(function(node, index) { // 해상도 대응
      if(h >= 1080)
        return -1240 * graphH / 1080;
      else
        return -620 * graphH / 1080;
    })
    // .charge(function(node) {
    //   if(node.index == 0 ||node.index == 2||node.index ==4||node.index ==5||node.index ==9) return -700;
    //   else return -100;
    // })
    .gravity(0.4)
    .size([graphW, graphH]);
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

// Options for the Radar chart, other than default
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

// JSON 데이터 및 네트워크 초기화
d3.json("lib/cvs-to-json/toneData-test20170214.json", function (json) { // node JSON 데이터 로드 콜백
    ToneData = json;
    force.nodes(ToneData); // node 데이터 세팅

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

    d3.json("lib/cvs-to-json/graph-test20170214.json", function (json) { // link JSON 데이터 로드 콜백
        LinkData = json.links;
        force.links(LinkData); // link 데이터 세팅

        LinkData = LinkData.map(function(link) {
          link.index = link.source; // index 속성 추가
          return link;
        });

        force.start(); // 네트워크 실행

        // 모든 에지를 포함하는 객체
        var links = gElemBelowSVG.append("g")
            .attr("class", "links"); // links class 추가

        // 에지 객체
        var link = links.selectAll("path")
            .data(force.links())
            .enter().append("path")
            .attr("class", "link")
            .style("stroke-width", function (d) {
                // console.log(d);
                return 7000/d.weight-1;
            })
            .style("stroke-opacity", function (d) {
                return 0.2;
            })
            .style("stroke", function(d) {
                var srcNode = LinkData[countIndexForLinkData].source;
                var dstNode = LinkData[countIndexForLinkData].target;
                countIndexForLinkData++;

                return EdgeColorDecideFunc(srcNode, dstNode);
            })
            .attr("marker-end", "url(#end)");

        // 모든 노드를 포함하는 객체
        var nodes = gElemBelowSVG.append("g")
            .attr("class", "nodes")
            .attr("transform", "translate(-" + nodeSize/2 + ", -" + nodeSize/2 + ")")
            .call(drag);

        // 노드 객체
        var node = nodes.selectAll(".node")
            .data(ToneData)
            .enter().append("g")
            .attr("class", "node")
            .attr("id", function(d) { // id attr 추가
                return "d"+d.index;
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
            .attr("year", function(d){  // year attr 추가
                return d.year;
            })
            .call(force.drag)
            .each(function() {
                d3.select(this).call(drawRadarChart);
            })
            .on('mouseover', function (d){
                /*for(var i=0; i<LinkData.length; i++) {
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
                }*/
                d3.select(this).append("text")
                    .attr("dx", 0)
                    .attr("dy", 4)
                    .attr("id", 'nodeName')
                    .text(function (d) {
                        var propArr = Object.getOwnPropertyNames(d);
                        return propArr[0];
                    })
                    .style("fill", 'white');
            })
            .on('mouseout', function(){
                d3.select("#nodeName").remove();
            })
            .on('mousedown', function(d){
                //기존의 화살표 제거 코드 (최초 아무 화살표 없는 상황 고려)

                //기존의 불투명해진 엣지 투명도 0.5로 복구 코드 (최초 모두 투명한 상황 고려)

                //새로운 화살표(자신보다 최신의 노래와 연결된 노드 방향) 그리기 코드


                //해당 엣지들의 불투명화 코드
            });

        function calculateIngnition(edge) {
            var dx = edge.target.x - edge.source.x,
                dy = edge.target.y - edge.source.y;

            var transToOriginX = edge.target.x - dx;
            var transToOriginY = edge.target.y - dy;
            var inclination = dy/dx;

            var selectedDomain = transToOriginX-50;
            var selectedY = selectedDomain*inclination;
            selectedDomain += dx;
            selectedY += dy;

            var newPosition = [selectedDomain, selectedY];
            return newPosition;
        }

        // 프레임 당 콜백 설정
        force.on("tick", function () {
            link.attr("d", function (d) {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y;
                // dr = Math.sqrt(dx * dx + dy * dy);
                // newTarget = calculateIngnition(d);
                var newTargetX = d.target.x - dx*0.15;
                var newTargetY = d.target.y - dy*0.15;

                return "M" + d.source.x + "," + d.source.y + "L" + newTargetX + "," + newTargetY;
                }
            );
            // link.attr("x1", function (d) {
            //         return d.source.x;
            //     })
            //     .attr("y1", function (d) {
            //         return d.source.y;
            //     })
            //     .attr("x2", function (d) {
            //         return d.target.x;
            //     })
            //     .attr("y2", function (d) {
            //         return d.target.y;
            //     });

            node.attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        });

    }); // 에지 데이터 로드 콜백 선언문 종료
}); // 노드 데이터 로드 콜백 선언문 종료


// 드래그 시작 콜백
function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("dragging", true);
}

// 드래그 진행 중 콜백
function dragged(d) {
    d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}

// 드래그 완료 콜백
function dragended(d) {
    d3.select(this).classed("dragging", false);
}

// 줌 이벤트 콜백
function zoomed() {
    gElemBelowSVG.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

// 노드를 RadarChart 모양으로 그리는 함수
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
