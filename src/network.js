var w = window.innerWidth || document.body.clientWidth,
    h = window.innerHeight || document.body.clientHeight;
var padding = 80;
var graphW = w-padding * 2;
var graphH = h-padding * 2;
var nodeSize = graphW/15;

var svg = d3.select("#container").attr("align","center")
    .append("svg")
    .attr("width", graphW)
    .attr("height", h);

var force = d3.layout.force()
    .gravity(0)
    .distance(100)
    .charge(0)
    .size([graphW, graphH]);

d3.json("graphFile.json", function (json) {
    force
        .nodes(json.nodes)
        .links(json.links)
        .start();

    var link = svg.selectAll(".link")
        .data(json.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function (d) {
            return Math.sqrt(d.weight);
        });

    var nodes = svg.append("g")
        .attr("class", "nodes")
        .attr("transform", "translate(-" + nodeSize/2 + ", -" + nodeSize/2 + ")");

    var node = nodes.selectAll(".node")
        .data(json.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("id", function(d) {
            return d.name
        })
        .call(force.drag)
        .each(function() {
            d3.select(this).call(drawRadarChart);
        });

    // node.append("text")
    //     .attr("dx", 12)
    //     .attr("dy", ".35em")
    //     .text(function (d) {
    //         return d.name
    //     });

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

var colorscale = d3.scale.category10();

//Legend titles
var LegendOptions = ['Smartphone','Tablet'];

//Data
var d = [
    [
        {axis:"Email",value:0.59},
        {axis:"Social Networks",value:0.56},
        {axis:"Internet Banking",value:0.42},
        {axis:"News Sportsites",value:0.34},
        {axis:"Search Engine",value:0.48},
        {axis:"View Shopping sites",value:0.14},
        {axis:"Paying Online",value:0.11},
        {axis:"Buy Online",value:0.05},
        {axis:"Stream Music",value:0.07},
        {axis:"Online Gaming",value:0.12},
        {axis:"Navigation",value:0.27},
        {axis:"App connected to TV program",value:0.03},
        {axis:"Offline Gaming",value:0.12},
        {axis:"Photo Video",value:0.4},
        {axis:"Reading",value:0.03},
        {axis:"Listen Music",value:0.22},
        {axis:"Watch TV",value:0.03},
        {axis:"TV Movies Streaming",value:0.03},
        {axis:"Listen Radio",value:0.07},
        {axis:"Sending Money",value:0.18},
        {axis:"Other",value:0.07},
        {axis:"Use less Once week",value:0.08}
    ],[
        {axis:"Email",value:0.48},
        {axis:"Social Networks",value:0.41},
        {axis:"Internet Banking",value:0.27},
        {axis:"News Sportsites",value:0.28},
        {axis:"Search Engine",value:0.46},
        {axis:"View Shopping sites",value:0.29},
        {axis:"Paying Online",value:0.11},
        {axis:"Buy Online",value:0.14},
        {axis:"Stream Music",value:0.05},
        {axis:"Online Gaming",value:0.19},
        {axis:"Navigation",value:0.14},
        {axis:"App connected to TV program",value:0.06},
        {axis:"Offline Gaming",value:0.24},
        {axis:"Photo Video",value:0.17},
        {axis:"Reading",value:0.15},
        {axis:"Listen Music",value:0.12},
        {axis:"Watch TV",value:0.1},
        {axis:"TV Movies Streaming",value:0.14},
        {axis:"Listen Radio",value:0.06},
        {axis:"Sending Money",value:0.16},
        {axis:"Other",value:0.07},
        {axis:"Use less Once week",value:0.17}
    ]
];


//Options for the Radar chart, other than default
var mycfg = {
    w: nodeSize,
    h: nodeSize,
    maxValue: 0.6,
    levels: 6,
    ExtraWidthX: 0,
    radius: 1,
    factorLegend: .85,
    maxValue: 0,
    radians: 2 * Math.PI,
    TranslateX: 0,
    TranslateY: 0,
    ExtraWidthX: 0,
    ExtraWidthY: 0
};
/*
//Call function to draw the Radar chart
//Will expect that data is in %'s
RadarChart.draw("#chart", d, mycfg);
*/

function drawRadarChart() {
    var id = this.attr("id");
    RadarChart.draw("#"+id, d, mycfg);
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