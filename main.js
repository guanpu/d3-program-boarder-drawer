/**
 * main.js
 */

// Sample data
var data = {
    "BasicInfo": {
        "title": "SampleProgramBoard",
        "teamList":["team1","team2","team3"],
        "SprintNumber":["Sprint1","Sprint2","Sprint3"]
    },
    "Features":[
        {
            "id": "F1",
            "desc": "The login page",
            "team": 0,
            "sprint": 0
        },{
            "id": "F2",
            "desc": "Adding OAuth",
            "team": 1,
            "sprint": 1
        },{
            "id": "F3",
            "desc": "Integration with LDAP",
            "team": 2,
            "sprint": 2
        }

    ],
    "Dependency":[
        {
            "id": "D1",
            "desc": "Dependency1 description",
            "team": 0,
            "sprint": 0
        },{
            "id": "D2",
            "desc": "Description of Dependency2",
            "team": 2,
            "sprint": 2
        },{
            "id": "D3",
            "desc": "D3's dependency",
            "team": 0,
            "sprint": 0
        }
    ],
    "MileStone":[
        {
            "id": "M1",
            "desc": "This is mileStone1",
            "sprint": 1
        },{
            "id": "M2",
            "desc": "One more mileStone",
            "sprint": 1
        },{
            "id": "M3",
            "desc": "yet another milestone",
            "sprint": 0
        }
    ],
    "Relations":[
        {
            "from": "F3",
            "to": "D1",
            "type": "begin"
        },
        {
            "from": "F2",
            "to": "D2",
            "type": "finish"
        }
    ]
};
let sprintH = 160;
let sprintV = 40;
let boxH = 30;
let boxV = 20;
let padding = 10;

let axesColor = "rgba(220,220,220,0.4)"
let mileStoneColor = "rgba(251, 188, 5, 0.62)";
let dependencyColor = "rgba(234, 67, 53, 0.62)";
let featureColor = "rgba(66, 133, 244, 0.62)";

//a 2d arrry to record the number of blocks in each slot
let slotOccupation = [];
let blockMap = {};
/**
 * Initialize the data.
 */
function init() {
    slotOccupation = [];
    blockMap = {};
    let k = data.BasicInfo.SprintNumber.length;
    //Need teamNum+1 such arrayes, because there's a "milestone" row in the chart
    for(let i =0; i<= data.BasicInfo.teamList.length; i++) {
        let empty_arr = (new Array(k)).fill(0);
        slotOccupation.push(empty_arr);
    }
    document.getElementById("main").innerHTML = "";
}

function showTip(d,i) {
    document.getElementById(d.id).style.visibility = "visible";
}

function hideTip(d,i) {
    document.getElementById(d.id).style.visibility = "hidden";
}

/**
 * Calculate the relative position a new block should be placed at in a specific slot.
 * @param {*} x The team index
 * @param {*} y The sprint index
 */
function getInnerPosition(x,y) {
    let curr = slotOccupation[x][y];
    let k=new Array(2);
    k[0] = (curr % 4) * (boxH+padding);
    k[1] = Math.floor(curr / 4) * (boxV + padding);
    slotOccupation[x][y]++;
    return k;
}

/**
 * Calculate the milestone block position.
 * @param {*} d 
 */
function msPositionCalculator(d) {
    let k = getInnerPosition(0,d.sprint);
    let x = (sprintH+padding) * (d.sprint+1) + k[0];
    let y = (sprintV+padding) + k[1];
    blockMap[d.id] = [x,y];
    
    return "translate("+x+","+y+")";
}

/**
 * Calculate the dependency block's position
 * @param {*} d the data
 */
function dpPositionCalculator(d) {
    let k = getInnerPosition(d.team,d.sprint);    
    let x = (sprintH+padding) * (d.sprint+1) + k[0];
    let y = (sprintV+padding) * (d.team+2) + k[1];
    blockMap[d.id] = [x,y];
    
    return "translate("+x+","+y+")";
}

/**
 * Calculate the Feature block's position
 * @param {*} d the data
 */
function ftPositionCalculator(d) {
    let k = getInnerPosition(d.team,d.sprint);        
    let x = (sprintH+padding) * (d.sprint+1) + k[0];
    let y = (sprintV+padding) * (d.team+2) + k[1];
    blockMap[d.id] = [x,y];
    return "translate("+x+","+y+")"; 
}

function getPosition(d) {

}

let lf =  d3.svg.line()
.x(function(d){
    return d.x;
})
.y(function(d){
    return d.y;
})
.interpolate("linear");
function lineFunction(data) {
    let dataArray = [];
    let startArray = blockMap[data.from];
    dataArray.push({
        "x": startArray[0],
        "y": startArray[1]
    });
    let endArray = blockMap[data.to];
    dataArray.push({
        "x": endArray[0],
        "y": endArray[1]
    });
    return lf(dataArray);
}
/**
 * Draw it!
 */
function render() {
    data = JSON.parse(document.getElementById("markdown").value);
    init();
    var canvas = d3.select("#main").append("svg").attr("width", 800).attr("height",600);
    
    var sprint = canvas.selectAll("g.class1")
    .data(data.BasicInfo.SprintNumber)
    .enter().append("g")
    .attr("transform", function(d,i) { return "translate(" + (sprintH+padding) * (i+1) + ",0)"; });
    sprint.append("rect").attr("width", sprintH).attr("height", sprintV).attr("fill", axesColor);
    sprint.append("text")
    .attr("x", 15)
    .attr("y", 15)
    .attr("dy", ".5em")
    .text(function(d) { return d; });

    data.BasicInfo.teamList.unshift("mileStones");
    var team = canvas.selectAll("g.class2")
    .data(data.BasicInfo.teamList)
    .enter().append("g").attr("id",function(d,i){return 'tm'+i;})
    .attr("transform", function(d,i) { return "translate(0, " + (sprintV+padding) * (i+1) + ")"; });
    team.append("rect").attr("width", sprintH).attr("height", sprintV).attr("fill", axesColor);
    team.append("text")
    .attr("x", 15)
    .attr("y", 15)
    .attr("dy", ".5em")
    .text(function(d) { return d; });

    var milestone = canvas.selectAll("g.class3")
    .data(data.MileStone)
    .enter().append("g").attr("id",function(d,i){return 'ms'+i;})
    .attr("transform", msPositionCalculator)
    .on('mouseover', showTip)
    .on('mouseout', hideTip);

    milestone.append("rect")
        .attr("width", boxH)
        .attr("height", boxV)
        .attr("fill", mileStoneColor);

    milestone.append("text")
        .attr("x", 5)
        .attr("y", 10)
        .attr("dy", ".3em")
        .text(function(d) { return d.id; });
    milestone.append("text")
    .attr("x", boxH)
    .attr("y", boxV)
    .style("visibility", "hidden")
    .attr("id", (d)=>{return d.id;} )        
    .text((d)=>{return d.desc;});        

    var dependency = canvas.selectAll("g.class4")
    .data(data.Dependency)
    .enter().append("g").attr("id",function(d,i){return 'dp'+i;})
    .attr("transform", dpPositionCalculator)
    .on('mouseover', showTip)
    .on('mouseout', hideTip);

    dependency.append("rect")
        .attr("width", boxH)
        .attr("height", boxV)
        .attr("fill", dependencyColor);

    dependency.append("text")
        .attr("x", 5)
        .attr("y", 10)
        .attr("dy", ".3em")
        .text(function(d) { return d.id; });
    dependency.append("text")
        .attr("x", boxH)
        .attr("y", boxV)
        .style("visibility", "hidden")
        .attr("id", (d)=>{return d.id;} )        
        .text((d)=>{return d.desc;});  

    var features = canvas.selectAll("g.class5")
    .data(data.Features)
    .enter().append("g")
    .attr("transform", ftPositionCalculator)
    .on('mouseover', showTip)
    .on('mouseout', hideTip);

    features.append("rect")
        .attr("width", boxH)
        .attr("height", boxV)
        .attr("fill", featureColor);

    features.append("text")
        .attr("x", 5)
        .attr("y", 10)
        .attr("dy", ".3em")
        .text(function(d) { return d.id; });
    features.append("text")
        .attr("x", boxH)
        .attr("y", boxV)
        .attr("id", (d)=>{return d.id;} )
        .style("visibility", "hidden")
        .text((d)=>{return d.desc;});  

    var relations = canvas.selectAll("path")
    .data(data.Relations)
    .enter().append("path").attr("d", lineFunction)
    .attr("stroke","red")
    .attr("class", (d)=>{return d.type;})
    .attr("stroke-width",2)
    .attr("fill","none");

    document.getElementById("download").removeAttribute("disabled");
}

function download(){
    var serializer = new XMLSerializer(); 
    var svg = document.getElementsByTagName("svg")[0];
    var source = serializer.serializeToString(svg);  
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;  
    var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);  
    var img = document.createElement("img");
    img.src = url;
    img.style.visibility="hidden";
    document.body.appendChild(img);

    var canvas = document.createElement("canvas");  
    canvas.width = svg.getAttribute("width");  
    canvas.height = svg.getAttribute("height");  

    var context = canvas.getContext("2d");  
    var image = new Image;  
    image.src = document.getElementsByTagName('img')[0].src;  
    image.onload = function() {  
        context.drawImage(image, 0, 0);
        var a = document.createElement("a");  
        a.download = data.BasicInfo.title + ".png";
        a.href = canvas.toDataURL("image/png");  
        a.click();  
    }; 
}

window.onload = function() {
    document.getElementById("markdown").innerText = JSON.stringify(data,null,4);
    init();    
}