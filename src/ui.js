var linkDescSVG = d3.select("#link-desc")
    .attr("align","center")
    .append("svg")
    .attr("width", "85%")
    .attr("height", "100%")
    .style("flex", 1);

var typeDescSVG = d3.select("#type-desc")
    .attr("align","center")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .style("flex", 2.5);

// ui 드로잉 함수
function draw() {

  /** correlation 드로잉 **/

  // correlation triangle의 desc. div
  var triangleDesc = d3.select("#link-desc")
    .append("div")
    .style("flex", 1)
    .style("margin", "1vh 0")

  triangleDesc.append("span")
     .style("float", "left")
     .style("font-size", "1vh")
     .html("low" +  "<br/>" + "relation");
  triangleDesc.append("span")
     .style("float", "right")
     .style("font-size", "1vh")
     .html("high" +  "<br/>" + "relation")

  // 반드시 desc div를 append 한 후에 값을 받아와야함
  var lh = linkDescSVG.style("height").replace("px", "");
  var lw = linkDescSVG.style("width").replace("px", "");

  var triangleLineData = [ { "x": 0,   "y": lh}, { "x": 0,   "y": lh/1.2},
                           { "x": lw,  "y": 0}, { "x": lw,  "y": lh},
                           { "x": 0,  "y": lh}];

  // line 드로잉 객체
  var lineFunction = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate("linear");

  // correlation triangle 드로잉
  var triangle = linkDescSVG.append("path")
     .attr("d", lineFunction(triangleLineData))
     .attr("fill", d3.rgb(239, 93, 128))
     .attr("opacity", ".13")

  /** correlation 드로잉 완료 **/


  /** song type 드로잉 **/

  // 원들의 좌표값 설정
  var th = typeDescSVG.style("height").replace("px", "");
  var tw = typeDescSVG.style("width").replace("px", "");
  var circleData = [
    {cx: tw*0.1, cy: th*0.2, color: "gray"},
    {cx: tw*0.4, cy: th*0.2, color: "gray"},
    {cx: tw*0.7, cy: th*0.2, color: "gray"},
    {cx: tw*0.1, cy: th*0.65, color: "gray"},
    {cx: tw*0.4, cy: th*0.65, color: "gray"},
    {cx: tw*0.7, cy: th*0.65, color: "gray"}
  ];

  // song type 별 원형 그리기
  var radius = 1.5; // vh 단위
  var textSize = 2; // vh 단위
  var circles = typeDescSVG.selectAll("circle")
      .data(circleData)
      .enter()
      .append("circle")
      .style("stroke", "gray")
      .style("fill", function(d) {
         return d.color;
      })
      .attr("cx", function(d) {
        return d.cx;
      })
      .attr("cy", function(d) {
        return d.cy;
      })
      .attr("r", radius+"vh");

   // song type 별 텍스트 추가
   var texts = typeDescSVG.selectAll("text")
       .data(circleData)
       .enter()
       .append("text")
       .text(function(d, i) {
         switch(i) {
           case 0: return "R&B";
           case 1: return "Rock";
           case 2: return "Ballad";
           case 3: return "Hiphop";
           case 4: return "Dance";
           case 5: return "Folk";
         }
       })
       .attr("font-family", "Roboto-Medium")
       .attr("font-size", textSize+"vh")
       .attr("fill", "white")
       .attr("x", function(d) {
         return d.cx + h * (radius+0.7) / 100; // 0.7는 x 좌표 세부조정 임의의 값. h 는 해상도 크기 전역 변수
       })
       .attr("y", function(d) {
         // vh를 px로 환산하여 radius 만큼 y값 감소시키고, 다시 폰트 사이즈 절반만큼 y값 증가시킴. 0.35는 세부 조정 임의의 값
         return d.cy + h * radius / 100 - (h * (textSize-0.35) / 100) / 2;
       });

   /** song type 드로잉 완료 **/

} // 드로잉 함수 종료


// 드로잉. 0.5초 동안의 스타일 로드 및 적용 딜레이 적용
setTimeout(function(){
  draw();
}, 500)


// gradient 객체 설정 // 사용법  .attr("fill", "url(#gradient)");
// var gradient = svg.append("defs")
//   .append("linearGradient")
//     .attr("id", "gradient")
//     .attr("x1", "0%")
//     .attr("x2", "100%")
//     .attr("spreadMethod", "pad");
//
// gradient.append("stop")
//     .attr("offset", "0%")
//     .attr("stop-color", "#ff00ff")
//     .attr("stop-opacity", 1);
//
// gradient.append("stop")
//     .attr("offset", "100%")
//     .attr("stop-opacity", 0);
