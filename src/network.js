var w = window.innerWidth || document.body.clientWidth,
    h = window.innerHeight || document.body.clientHeight;
var paddingX = 80, paddingY = 10;
var graphW = w-paddingX * 2;
var graphH = h-paddingY * 2;
var nodeSize = graphW/40;
var LinkData = [];
var ToneData = [];

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

var drag = d3.behavior.drag()
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
    .call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoomed))
    .attr("width", graphW)
    .attr("height", graphH)
    .append("g")

var force = d3.layout.force()
    .gravity(.07)
    .distance(30)
    .charge(-70)
    .size([graphW, graphH]);

//init data
d3.json("ToneData.json", function (json) {
    ToneData = json;
    force.nodes(ToneData);

    //parsing data Sting to Float
    ToneData = ToneData.map(function(elem) {
        var attr_arr = Object.getOwnPropertyNames(elem);
        var song_name = attr_arr[0];
        for(var i=0; i<elem[song_name].length; i++) {
            var d_obj = elem[song_name][i];
            d_obj["value"] = parseFloat(d_obj["value"]-7.5);
            elem[song_name][i] = d_obj;
        }
        return elem;
    });

    d3.json("graphFile.json", function (json) {
        LinkData = json.links;
        force.links(LinkData);
        force.start();

        var links = svg.append("g")
            .attr("class", "links")
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
            });


        node.append("text")
            .attr("dx", 0)
            .attr("dy", 4)
            .text(function (d) {
                var propArr = Object.getOwnPropertyNames(d);
                return propArr[0];
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