var w = window.innerWidth || document.body.clientWidth,
    h = window.innerHeight || document.body.clientHeight;
var paddingX = 80, paddingY = 10;
var graphW = w-paddingX * 2;
var graphH = h-paddingY * 2;
var nodeSize = graphW/50;
var LinkData = [];
var ToneData = [];

var zoom = d3.behavior.zoom() // 줌 기능 추가
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

var drag = d3.behavior.drag() // 드래그 기능 추가
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);

function zoomed() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
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
    .call(d3.behavior.zoom().scaleExtent([1, 30]).on("zoom", zoomed))
    .attr("width", graphW)
    .attr("height", graphH)
    .append("g")

var force = d3.layout.force()
    // .gravity(.07)
    // .distance(300)
    .linkStrength(0.05)
    .friction(0.9)
    .linkDistance(50)
    .charge(-40)
    .gravity(0.1)
    .theta(0.8)
    .alpha(0.1)
    .size([graphW, graphH]);

//init data - 스터디 시작 포인트
d3.json("ToneData.json", function (json) {
    ToneData = json;
    force.nodes(ToneData);

    // 'parsing' data Sting to Float
    ToneData = ToneData.map(function(elem) {
        var attr_arr = Object.getOwnPropertyNames(elem);
        var song_name = attr_arr[0];
        for(var i=0; i<elem[song_name].length; i++) { // elem[song_name] : 음들의 배열 - 각 음은 하나의 객체로 이루어짐
            var tone_obj = elem[song_name][i]; // 각 음 객체를 변수에 할당
            tone_obj["value"] = parseFloat(tone_obj["value"]-7.5); // 7.5는 노드 크기를 임의로 조절하기 위함
            elem[song_name][i] = tone_obj;
        }
        return elem;
    });

    d3.json("graphFile.json", function (json) { //d3.json의 파라미터로 들어가고 있던것 (GraphFile.json과 ToneData.jason)
        LinkData = json.links;
        force.links(LinkData);
        force.start();

        var links = svg.append("g")
            .attr("class", "links") // html element에 class라는 이름의 속성 추가. 속성에 대한 값은 "links"
            //.attr("transform", "translate(-" + nodeSize/2 + ", -" + nodeSize/2 + ")");

        var link = links.selectAll(".link")
            .data(LinkData)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke-width", function (d) {
                return Math.sqrt(d.weight);
            });

        var nodes = svg.append("g")
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
            .call(force.drag)
            .each(function() {
                d3.select(this).call(drawRadarChart);
            })
            .on('mouseover', function (d){
                for(var i=0; i<LinkData.length; i++) {
                    for (var prop in LinkData[i]) {
                        var obj = LinkData[i];
                        if(prop == "source" && obj[prop].index == d.index) {
                            d3.select("#d"+obj["target"].index)
                                .style("fill-opacity", 1)
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
                d3.select(this).append("text")
                    .attr("dx", 0)
                    .attr("dy", 4)
                    .text(function (d) {
                        var propArr = Object.getOwnPropertyNames(d);
                        return propArr[0];
                    });
            })
            .on('mouseout', function(){
                d3.selectAll("text").remove();
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
    maxValue: 36.5-7.5,
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
    RadarChart.draw("#d"+id, new Array(ToneData[id][song_name]), mycfg);
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
