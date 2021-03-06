//Practically all this code comes from https://github.com/alangrafu/radar-chart-d3
//I only made some additions and aesthetic adjustments to make the chart look better
//(of course, that is only my point of view)
//Such as a better placement of the titles at each line end,
//adding numbers that reflect what each circular level stands for
//Not placing the last level and slight differences in color
//
//For a bit of extra information check the blog about it:
//http://nbremer.blogspot.nl/2013/09/making-d3-radar-chart-look-bit-better.html

var RadarChart = {
    draw: function(id, d, options, paramArray) {
        var cfg = {
            radius: 5,
            w: 600,
            h: 600,
            factor: 1,
            factorLegend: .85,
            levels: 3,
            maxValue: 36.5,
            radians: 2 * Math.PI,
            opacityArea: 1,
            ToRight: 5,
            TranslateX: 80,
            TranslateY: 30,
            ExtraWidthX: 100,
            ExtraWidthY: 100,
            //color: d3.scale.category10()          //d3.rgb 오브젝트로 대체
           /*color: function (param) {
                if (param == "R&B") return d3.rgb('#33fff9');
                if (param == "발라드") return d3.rgb('#c4ff0b');
                if (param == "포크") return d3.rgb('#a0a0a0');
                if (param == "댄스") return d3.rgb('#0b63ff');
                if (param == "락") return d3.rgb('#f77908');
                if (param == "힙합") return d3.rgb('#fc00fc');
            }*/
        };

        if('undefined' !== typeof options){
            for(var i in options){
                if('undefined' !== typeof options[i]){
                    cfg[i] = options[i];
                }
            }
        }
        cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function(i){return d3.max(i.map(function(o){return o.value;}))}));
        var allAxis = (d[0].map(function(i, j){return i.axis}));
        var total = allAxis.length;
        var radius = cfg.factor*Math.min(cfg.w/2, cfg.h/2);
        var Format = d3.format('%');
        d3.select(id).select("svg").remove();
        var g = d3.select(id)
            .append("svg")
            .attr("width", cfg.w+cfg.ExtraWidthX)
            .attr("height", cfg.h+cfg.ExtraWidthY)
            .append("g")
            .attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");
        ;
        var tooltip;

        //Circular segments
        for(var j=0; j<cfg.levels; j++) {
            var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
            g.selectAll(".levels")
                .data(allAxis)
                .enter()
                .append("svg:line")
                .attr("x1", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
                .attr("y1", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
                .attr("x2", function(d, i){return levelFactor*(1-cfg.factor*Math.sin((i+1)*cfg.radians/total));})
                .attr("y2", function(d, i){return levelFactor*(1-cfg.factor*Math.cos((i+1)*cfg.radians/total));})
                .attr("class", "line")
                .style("stroke", "grey")
                .style("stroke-opacity", "1")
                .style("stroke-width", "0.15px")
                .attr("transform", "translate(" + (cfg.w/2-levelFactor) + ", " + (cfg.h/2-levelFactor) + ")");
        }

        //Text indicating at what % each level is
        //
        // for(var j=0; j<cfg.levels; j++){
        //     var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
        //     g.selectAll(".levels")
        //         .data([1]) //dummy data
        //         .enter()
        //         .append("svg:text")
        //         .attr("x", function(d){return levelFactor*(1-cfg.factor*Math.sin(0));})
        //         .attr("y", function(d){return levelFactor*(1-cfg.factor*Math.cos(0));})
        //         .attr("class", "legend")
        //         .style("font-family", "sans-serif")
        //         .style("font-size", "10px")
        //         .attr("transform", "translate(" + (cfg.w/2-levelFactor + cfg.ToRight) + ", " + (cfg.h/2-levelFactor) + ")")
        //         .attr("fill", "#737373")
        //         .text(Format((j+1)*cfg.maxValue/cfg.levels));
        // }
        series = 0;

        //반지름축
        // var axis = g.selectAll(".axis")
        //     .data(allAxis)
        //     .enter()
        //     .append("g")
        //     .attr("class", "axis");

        //y값 별 반지름축 라인
        // axis.append("line")
        //     .attr("x1", cfg.w/2)
        //     .attr("y1", cfg.h/2)
        //     .attr("x2", function(d, i){return cfg.w/2*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
        //     .attr("y2", function(d, i){return cfg.h/2*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
        //     .attr("class", "line")
        //     .style("stroke", "grey")
        //     .style("stroke-width", "1px");

        //최외곽 반지름축 텍스트
        // axis.append("text")
        //     .attr("class", "legend")
        //     .text(function(d){return d})
        //     .style("font-family", "sans-serif")
        //     .style("font-size", "11px")
        //     .attr("text-anchor", "middle")
        //     .attr("dy", "1.5em")
        //     .attr("transform", function(d, i){return "translate(0, -10)"})
        //     .attr("x", function(d, i){return cfg.w/2*(1-cfg.factorLegend*Math.sin(i*cfg.radians/total))-60*Math.sin(i*cfg.radians/total);})
        //     .attr("y", function(d, i){return cfg.h/2*(1-Math.cos(i*cfg.radians/total))-20*Math.cos(i*cfg.radians/total);});
        d.forEach(function(y, x){
            dataValues = [];
            g.selectAll(".nodes")
                .data(y, function(j, i){
                    dataValues.push([
                        cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)),
                        cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
                    ]);
                });
            dataValues.push(dataValues[0]);
            g.selectAll(".area")
                .data([dataValues])
                .enter()
                .append("polygon")
                .attr("class", "radar-chart-serie"+series)
                .style("stroke-width", ".015vh")
                //.style("stroke", cfg.color(_genreParam))      //테두리 색지정
                .style("stroke", function () {
                    if (paramArray[0] == "R&B") return rimColor[0];
                    if (paramArray[0] == "발라드") return rimColor[1];
                    if (paramArray[0] == "포크") return rimColor[2];
                    if (paramArray[0] == "댄스") return rimColor[3];
                    if (paramArray[0] == "락") return rimColor[4];
                    if (paramArray[0] == "힙합") return rimColor[5];

            })
                .attr("points",function(d) {
                    var str="";
                    for(var pti=0;pti<d.length;pti++){
                        str=str+d[pti][0]+","+d[pti][1]+" ";
                    }
                    return str;
                })
                //.style("fill", cfg.color(_genreParam))        //내부 색지정
                .style("fill", function () {
                    var rRGBCode = "";
                    var genre = paramArray[0];
                    if (genre == "R&B") rRGBCode = nodeColor["R&B"];
                    if (genre == "발라드") rRGBCode = nodeColor["Ballad"];
                    if (genre == "포크") rRGBCode = nodeColor["Folk"];
                    if (genre == "댄스") rRGBCode = nodeColor["Dance"];
                    if (genre == "락") rRGBCode = nodeColor["Rock"];
                    if (genre == "힙합") rRGBCode = nodeColor["Hiphop"];

                    return d3.rgb(rRGBCode);
                })
                .style("fill-opacity", cfg.opacityArea)
                .on('mouseover', function (d){
                    z = "polygon."+d3.select(this).attr("class");
                    g.selectAll("polygon")
                        .transition(200)
                        .style("fill-opacity", 0.1);
                    g.selectAll(z)
                        .transition(200)
                        .style("fill-opacity", 1);
                })
                .on('mouseout', function(){
                    g.selectAll("polygon")
                        .transition(200)
                        .style("fill-opacity", cfg.opacityArea);
                });
            series++;
        });

        series=0;
        d.forEach(function(y, x){
            g.selectAll(".nodes")
            // .data(y).enter()
            // .append("svg:circle")
            // .attr("class", "radar-chart-serie"+series)
            // .attr('r', cfg.radius)
            // .attr("alt", function(j){return Math.max(j.value, 0)})
            // .attr("cx", function(j, i){
            //     dataValues.push([
            //         cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)),
            //         cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
            //     ]);
            //     return cfg.w/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total));
            // })
            // .attr("cy", function(j, i){
            //     return cfg.h/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total));
            // })
            // .attr("data-id", function(j){return j.axis})
            // .style("fill", cfg.color(series)).style("fill-opacity", .9)
            // .on('mouseover', function (d){
            //     newX =  parseFloat(d3.select(this).attr('cx')) - 10;
            //     newY =  parseFloat(d3.select(this).attr('cy')) - 5;
            //
            //     tooltip
            //         .attr('x', newX)
            //         .attr('y', newY)
            //         .text(Format(d.value))
            //         .transition(200)
            //         .style('opacity', 1);
            //
            //     z = "polygon."+d3.select(this).attr("class");
            //     g.selectAll("polygon")
            //         .transition(200)
            //         .style("fill-opacity", 0.1);
            //     g.selectAll(z)
            //         .transition(200)
            //         .style("fill-opacity", .7);
            // })
            // .on('mouseout', function(){
            //     tooltip
            //         .transition(200)
            //         .style('opacity', 0);
            //     g.selectAll("polygon")
            //         .transition(200)
            //         .style("fill-opacity", cfg.opacityArea);
            // })
                .append("svg:title")
                .text(function(j){return Math.max(j.value, 0)});
            series++;
        });

        //Tooltip
        tooltip = g.append('text')
            .style('opacity', 0)
            .style('font-family', 'sans-serif')
            .style('font-size', '13px');
    },
};
