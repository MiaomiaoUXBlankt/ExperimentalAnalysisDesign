var touchstone = 1;

var state = {
  NONE:0,
  INSTRUCTIONS: 1,
  SHAPES: 2,
  PLACEHOLDERS: 3,
};

var ctx = {
  w: 800,
  h: 600,

  trials: [],
  participant: "",
  startBlock: 0,
  startTrial: 0,
  cpt: 0,

  participantIndex:touchstone == 1 ? "Participant" : "ParticipantID",
  practiceIndex:"Practice",
  blockIndex: (touchstone == 1 ? "Block" : "Block1"),
  trialIndex: (touchstone == 1 ? "Trial" : "TrialID"),
  vvIndex:"VV",
  objectsCountIndex:"OC",

  state:state.NONE,
  targetIndex:0,

  // TODO log measures
  // loggedTrials is a 2-dimensional array where we store our log file
  // where one line is one trial
  loggedTrials:
    touchstone == 1 ?
    [["Participant","Practice","Block","Trial","VV","OC","visualSearchTime","ErrorCount"]] :
    [["DesignName", "ParticipantID", "TrialID", "Block1", "Trial", "VV", "OC", "visualSearchTime", "ErrorCount"]]
  
};

/****************************************/
/********** LOAD CSV DESIGN FILE ********/
/****************************************/

var loadData = function(svgEl){
  // d3.csv parses a csv file...
  d3.csv("experiment"+touchstone+".csv").then(function(data){
    // ... and turns it into a 2-dimensional array where each line is an array indexed by the column headers
    // for example, data[2]["OC"] returns the value of OC in the 3rd line
    console.log("Here is the d3",d3);
    ctx.trials = data;
    console.log("Here is the ctx",ctx);
    // all trials for the whole experiment are stored in global variable ctx.trials

    var participant = "";
    var options = [];

    for(var i = 0; i < ctx.trials.length; i++) {
      if(!(ctx.trials[i][ctx.participantIndex] === participant)) {
        participant = ctx.trials[i][ctx.participantIndex];
        options.push(participant);
        console.log("Here is the options",options);
      }
    }
    console.log("Here is the participant",participant);

    var select = d3.select("#participantSel")
    select.selectAll("option")
      .data(options)
      .enter()
      .append("option")
      .text(function (d) { return d; });

    setParticipant(options[0]);

  }).catch(function(error){console.log("Here is the error",error)});
};

/****************************************/
/************* RUN EXPERIMENT ***********/
/****************************************/


var startExperiment = function(event) {
  event.preventDefault();

  // set the trial counter to the first trial to run
  // ctx.participant, ctx.startBlock and ctx.startTrial contain values selected in combo boxes

  for(var i = 0; i < ctx.trials.length; i++) {
    if(ctx.trials[i][ctx.participantIndex] === ctx.participant) {
      if(parseInt(ctx.trials[i][ctx.blockIndex]) == ctx.startBlock
               && (touchstone == 2 || ctx.trials[i][ctx.practiceIndex] === "false")) {
        if(parseInt(ctx.trials[i][ctx.trialIndex]) == ctx.startTrial) {
          ctx.cpt = i - 1;

          if(touchstone == 1) { // include practice trials before this trial for TouchStone 1
            while(ctx.cpt >= 0 && ctx.trials[ctx.cpt][ctx.practiceIndex] === "true") {
              ctx.cpt = ctx.cpt-1;
            }
          }

          // start first trial
          console.log("start experiment at "+ctx.cpt);
          nextTrial();
          return;
        }
      }
    }
  }

}

var nextTrial = function() {
  ctx.cpt++;
  console.log("Here is the New ctx", ctx);
  console.log("The Current participant", ctx.trials[ctx.cpt]["Participant"]);
  console.log("The Current Trial", ctx.trials[ctx.cpt]["Trial"]);
  displayInstructions();
}

var displayInstructions = function() {
  ctx.state = state.INSTRUCTIONS;

  d3.select("#instr")
    .append("div")
    .attr("id", "instructions")
    .classed("instr", true);

  d3.select("#instructions")
    .append("p")
    .html("There will be two different shapes to be recognized.<br> Only <b>one shape</b> Your mission is to find the polygon shape from the spot.");

  d3.select("#instructions")
    .append("p")
    .html("1. Spot it as fast as possible and press <code>Space</code> bar to proceed.;");

  d3.select("#instructions")
    .append("p")
    .html("2. Click on the placeholder over that shape to move on next trial.");

  d3.select("#instructions")
    .append("p")
    .html("Press <code>Enter</code> key when ready to start.");

}

var displayShapes = function() {
  ctx.state = state.SHAPES; 
  var visualVariable = ctx.trials[ctx.cpt]["VV"];
  var oc = ctx.trials[ctx.cpt]["OC"];
  //set the Object Counts in three levels
  if(oc === "Small") {
    objectCount = 9;
  } else if(oc === "Medium") {
    objectCount = 25;
  } else {
    objectCount = 49;
  }
  console.log("display shapes for condition "+oc+","+visualVariable);



  var svgElement = d3.select("svg");
  var group = svgElement.append("g")
  .attr("id", "shapes")
  .attr("transform", "translate(100,100)");
  console.log("Here is group", group);
  var randomNum = Math.random();
  var randomNum2 = Math.random();
  console.log("The randomNum", randomNum);
  var objectAppearance = [];

  var targetOutline, targetShape, targetStroke;
  if (randomNum2 > 0.5) {
    targetOutline = "black";
  } else {
    targetOutline ="#fff"
  }

  if (randomNum > 0.5) {
    targetShape = "rect";
  } else {
    targetShape = "polygon";
  }
  if (Math.random() > 0.5) {
    targetStroke = "black";
  } else {
    targetStroke ="#fff"
  }

  console.log("The targetStroke", targetOutline);
  console.log("The targetShape", targetShape);
 

  for (var i = 0; i < objectCount - 1; i++){
    if (targetShape == "polygon") {
      objectAppearance.push({
        color: "#5cceee",
        stroke: targetStroke,
        shape: "rect"
      });
    }else{
      objectAppearance.push({
        color: "#5cceee",
        stroke: targetStroke,
        shape: "polygon"
      });
    }
    
    
  }

  console.log("This is objectappearance", objectAppearance);
  shuffle(objectAppearance);
  console.log("This is objectappearance after shuffle", objectAppearance);
  
  ctx.targetIndex = Math.floor(Math.random() * objectCount);
  objectAppearance.splice(ctx.targetIndex, 0, { color: "#5cceee", stroke: targetOutline, shape:targetShape});
  
  console.log("Here is ctx.targetIndex", ctx.targetIndex);
  var gridCoords = gridCoordinates(objectCount, 60);
  for (var i = 0; i < objectCount; i++){
    if(objectAppearance[i].shape == "rect") {
        group.append("rect")
          .attr("x", gridCoords[i].x)
          .attr("y", gridCoords[i].y)
          .attr("width", 56)
          .attr("height", 56)
          .attr("fill", objectAppearance[i].color)
          .attr("stroke", objectAppearance[i].stroke);
    } else {
      var points = [gridCoords[i].x, gridCoords[i].y, gridCoords[i].x + 56, gridCoords[i].y + 56, gridCoords[i].x + 56, gridCoords[i].y];
      group.append("polygon")
        .attr("points", points)
        .attr("fill", objectAppearance[i].color)
        .attr("stroke", objectAppearance[i].stroke);
    }
    
  }

}



var displayPlaceholders = function() {
  ctx.state = state.PLACEHOLDERS;

  var oc = ctx.trials[ctx.cpt]["OC"];
  var objectCount = 0;

  if(oc === "Small") {
    objectCount = 9;
  } else if(oc === "Medium") {
    objectCount = 25;
  } else {
    objectCount = 49;
  }

  var svgElement = d3.select("svg");
  var group = svgElement.append("g")
  .attr("id", "placeholders")
  .attr("transform", "translate(100,100)");

  var gridCoords = gridCoordinates(objectCount, 60);
  for (var i = 0; i < objectCount; i++) {
    var placeholder = group.append("rect")
        .attr("x", gridCoords[i].x)
        .attr("y", gridCoords[i].y)
        .attr("width", 56)
        .attr("height", 56)
        .attr("fill", "Gray");


    placeholder.on("click",
        function() {
          // TODO remove playholder and progress to next trail
          // I realised that we also need to remove the #shapes
          d3.select("#placeholders").remove();
          d3.select("#shapes").remove();
          nextTrial();

        }
      );

  }
}

var keyListener = function(event) {
  event.preventDefault();
  

  if(ctx.state == state.INSTRUCTIONS && event.code == "Enter") {
    d3.select("#instructions").remove();
    displayShapes();
  }

  //Press Space bar display the playHolder
  if (ctx.state == state.SHAPES && event.code == "Space") {
    ctx.loggedTrials.push(
      ["Preattention-experiment",
      ctx.participant,
      ctx.startBlock,
      ctx.startTrial,
      ctx.trials[ctx.cpt]["VV"],
      ctx.trials[ctx.cpt]["OC"],
      Date.now(),
      1]
    );
    displayPlaceholders();
  }


}


var downloadLogs = function(event) {
  event.preventDefault();
  var csvContent = "data:text/csv;charset=utf-8,";
  console.log("logged lines count: " + ctx.loggedTrials.length);
  
  ctx.loggedTrials.forEach(function(rowArray){
   var row = rowArray.join(",");
   csvContent += row + "\r\n";
   console.log(rowArray);
  });
  var encodedUri = encodeURI(csvContent);
  var downloadLink = d3.select("form")
  .append("a")
  .attr("href",encodedUri)
  .attr("download","logs_"+ctx.trials[ctx.cpt][ctx.participantIndex]+"_"+Date.now()+".csv")
  .text("logs_"+ctx.trials[ctx.cpt][ctx.participantIndex]+"_"+Date.now()+".csv");
}


// returns an array of coordinates for laying out objectCount objects as a grid with an equal number of lines and columns
function gridCoordinates(objectCount, cellSize) {
  var gridSide = Math.sqrt(objectCount);
  var coords = [];
  for (var i = 0; i < objectCount; i++) {
    coords.push({
      x:i%gridSide * cellSize,
      y:Math.floor(i/gridSide) * cellSize
    });
  }
  return coords;
}

// shuffle the elements in the array
// copied from https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(array) {
  var j, x, i;
  for (i = array.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = array[i];
    array[i] = array[j];
    array[j] = x;
  }
  return array;
}

/*********************************************/

var createScene = function(){
  var svgEl = d3.select("#scene").append("svg");
  svgEl.attr("width", ctx.w);
  svgEl.attr("height", ctx.h)
  .classed("centered", true);

  loadData(svgEl);
};


/****************************************/
/******** STARTING PARAMETERS ***********/
/****************************************/

var setTrial = function(trialID) {
  ctx.startTrial = parseInt(trialID);
}

var setBlock = function(blockID) {
  ctx.startBlock = parseInt(blockID);

  var trial = "";
  var options = [];

  for(var i = 0; i < ctx.trials.length; i++) {
    if(ctx.trials[i][ctx.participantIndex] === ctx.participant) {
      if(parseInt(ctx.trials[i][ctx.blockIndex]) == ctx.startBlock) {
        if(!(ctx.trials[i][ctx.trialIndex] === trial)) {
          trial = ctx.trials[i][ctx.trialIndex];
          options.push(trial);
        }
      }
    }
  }

  var select = d3.select("#trialSel");

  select.selectAll("option")
    .data(options)
    .enter()
    .append("option")
    .text(function (d) { return d; });

  setTrial(options[0]);

}

var setParticipant = function(participantID) {
  ctx.participant = participantID;

  var block = "";
  var options = [];

  for(var i = 0; i < ctx.trials.length; i++) {
    if(ctx.trials[i][ctx.participantIndex] === ctx.participant) {
      if(!(ctx.trials[i][ctx.blockIndex] === block)
          && (touchstone == 2 || ctx.trials[i][ctx.practiceIndex] === "false")) {
        block = ctx.trials[i][ctx.blockIndex];
        options.push(block);
      }
    }
  }

  var select = d3.select("#blockSel")
  select.selectAll("option")
    .data(options)
    .enter()
    .append("option")
    .text(function (d) { return d; });

  setBlock(options[0]);

};

function onchangeParticipant() {
  selectValue = d3.select("#participantSel").property("value");
  setParticipant(selectValue);
  
};

function onchangeBlock() {
  selectValue = d3.select("#blockSel").property("value");
  setBlock(selectValue);
};

function onchangeTrial() {
  selectValue = d3.select("#trialSel").property("value");
  setTrial(selectValue);
};
