// Coco key DOM elements
const cocoVideo = document.getElementById('cocoWebcam');
const cocoLiveView = document.getElementById('cocoLiveView');
const cocoDemoSection = document.getElementById('cocoDemo');
const cocoEnableWebcamButton = document.getElementById('cocoWebcamButton');

// BlazeFace key DOM elements
const blazeVideo = document.getElementById('blazeWebcam');
const blazeLiveView = document.getElementById('blazeLiveView');
const blazeDemoSection = document.getElementById('blazeDemo');
const blazeEnableWebcamButton = document.getElementById('blazeWebcamButton');

// Check if webcam access is supported.
function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }
  
  // If webcam supported, add event listener to button for when user
  // wants to activate it to call enableCocoCam function which we will 
  // define in the next step.
  if (getUserMediaSupported()) {
    cocoEnableWebcamButton.addEventListener('click', enableCocoCam);
    blazeEnableWebcamButton.addEventListener('click', enableBlazeCam)
  } else {
    console.warn('getUserMedia() is not supported by your browser');
}



// Before we can use COCO-SSD or BlazeFace class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment 
// to get everything needed to run.
// Note: cocoSsd is an external object loaded from our index.html
// script tag import
cocoSsd.load().then(function (loadedModel) {
  cocoModel = loadedModel;
  // Show demo section now model is ready to use.
  cocoDemoSection.classList.remove('invisible');
});

blazeface.load().then(function (loadedModel) {
  blazeModel = loadedModel;
  // Show demo section now model is ready to use.
  blazeDemoSection.classList.remove('invisible');
});



// Occurs once eventListener detects click on enableCocoCam
// Enable the live webcam view and start classification.
function enableCocoCam(event) {
    // Only continue if the COCO-SSD and BlazeFace have finished loading.
    if (!(cocoModel)) {
      return;
    }
    
    // Hide the button once clicked.
    event.target.classList.add('removed');  
    
    // getUsermedia parameters to force video but not audio.
    const constraints = {
      video: true
    };
  
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      cocoVideo.srcObject = stream;
      cocoVideo.addEventListener('loadeddata', cocoPredictWebcam);
    });
}

var cocoChildren = [];

function cocoPredictWebcam() {
  // Now let's start classifying a frame in the stream.
  cocoModel.detect(cocoVideo).then(function (predictions) {
      // Remove any highlighting we did previous frame.
      for (let i = 0; i < cocoChildren.length; i++) {
        cocoLiveView.removeChild(cocoChildren[i]);
      }
      cocoChildren.splice(0);
      
      // Now lets loop through predictions and draw them to the live view if
      // they have a high confidence score.
      for (let n = 0; n < predictions.length; n++) {
      // If we are over 66% sure we are sure we classified it right, draw it!
      if (predictions[n].score > 0.66) {
          const p = document.createElement('p');
          p.innerText = predictions[n].class  + ' - with ' 
              + Math.round(parseFloat(predictions[n].score) * 100) 
              + '% confidence.';
          p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
              + (predictions[n].bbox[1] - 10) + 'px; width: ' 
              + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

          const highlighter = document.createElement('div');
          highlighter.setAttribute('class', 'highlighter');
          highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
              + predictions[n].bbox[1] + 'px; width: ' 
              + predictions[n].bbox[2] + 'px; height: '
              + predictions[n].bbox[3] + 'px;';

              cocoLiveView.appendChild(highlighter);
              cocoLiveView.appendChild(p);
          cocoChildren.push(highlighter);
          cocoChildren.push(p);
      }
    }
    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(cocoPredictWebcam);
  });
}







// Enable the live webcam view and start classification.
function enableBlazeCam(event) {
  // Only continue if the COCO-SSD has finished loading.
  if (!blazeModel) {
    return;
  }
  
  // Hide the button once clicked.
  event.target.classList.add('removed');  
  
  // getUsermedia parameters to force video but not audio.
  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    blazeVideo.srcObject = stream;
    blazeVideo.addEventListener('loadeddata', blazePredictWebcam);
  });
}

var blazeChildren = [];

function blazePredictWebcam() {
  // Now let's start classifying a frame in the stream.
  const returnTensors = false;
  blazeModel.estimateFaces(blazeVideo, returnTensors).then(function (predictions) {
    // Remove any highlighting we did previous frame.
    for (let i = 0; i < blazeChildren.length; i++) {
      blazeLiveView.removeChild(blazeChildren[i]);
    }
    blazeChildren.splice(0);

    console.log("test");
    if (!!predictions[0]) {
      console.log(predictions[0]);
      console.log(predictions[0].probability);
    }

    
    // Now lets loop through predictions and draw them to the live view if
    // they have a high confidence score.
    for (let n = 0; n < predictions.length; n++) {
      // If we are over 66% sure we are sure we classified it right, draw it!
      if (predictions[n].probability > 0.66) {
        let start = predictions[n].topLeft;
        let end = predictions[n].bottomRight;
        let size = [end[0] - start[0], end[1] - start[1]];

        console.log(size);

        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 'left: ' + start[0] + 'px; top: '
            + start[1] + 'px; width: ' 
            + size[0] + 'px; height: '
            + size[1] + 'px;';

        blazeLiveView.appendChild(highlighter);
        blazeChildren.push(highlighter);
      }
    }
    
    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(blazePredictWebcam);
  });
}

// Store the resulting model in the global scope of our app.
var cocoModel = undefined;
var blazeModel = undefined;





// 
// MNIST Digit Recognizer

let model;
var canvasWidth             = 300;
var canvasHeight            = 300;
var canvasStrokeStyle       = "white";
var canvasLineJoin          = "round";
var canvasLineWidth         = 10;
var canvasBackgroundColor   = "black";
var canvasId                = "canvas";
var clickX = new Array();
var clickY = new Array();
var clickD = new Array();
var drawing;

var canvasBox = document.getElementById('canvas_box');
var canvas    = document.createElement("canvas");
 
canvas.setAttribute("width", canvasWidth);
canvas.setAttribute("height", canvasHeight);
canvas.setAttribute("id", canvasId);
canvas.style.backgroundColor = canvasBackgroundColor;
canvasBox.appendChild(canvas);
if(typeof G_vmlCanvasManager != 'undefined') {
  canvas = G_vmlCanvasManager.initElement(canvas);
}
 
ctx = canvas.getContext("2d");


// MOUSE DOWN function

$("#canvas").mousedown(function(e) {
  var rect = canvas.getBoundingClientRect();
  var mouseX = e.clientX- rect.left;;
  var mouseY = e.clientY- rect.top;
  drawing = true;
  addUserGesture(mouseX, mouseY);
  drawOnCanvas();
});


// TOUCH START function

canvas.addEventListener("touchstart", function (e) {
  if (e.target == canvas) {
      e.preventDefault();
  }

  var rect = canvas.getBoundingClientRect();
  var touch = e.touches[0];

  var mouseX = touch.clientX - rect.left;
  var mouseY = touch.clientY - rect.top;

  drawing = true;
  addUserGesture(mouseX, mouseY);
  drawOnCanvas();

}, false);


// MOUSE MOVE function

$("#canvas").mousemove(function(e) {
  if(drawing) {
      var rect = canvas.getBoundingClientRect();
      var mouseX = e.clientX- rect.left;;
      var mouseY = e.clientY- rect.top;
      addUserGesture(mouseX, mouseY, true);
      drawOnCanvas();
  }
});


// TOUCH MOVE function

canvas.addEventListener("touchmove", function (e) {
  if (e.target == canvas) {
      e.preventDefault();
  }
  if(drawing) {
      var rect = canvas.getBoundingClientRect();
      var touch = e.touches[0];

      var mouseX = touch.clientX - rect.left;
      var mouseY = touch.clientY - rect.top;

      addUserGesture(mouseX, mouseY, true);
      drawOnCanvas();
  }
}, false);


// MOUSE UP function

$("#canvas").mouseup(function(e) {
  drawing = false;
});


// TOUCH END function

canvas.addEventListener("touchend", function (e) {
  if (e.target == canvas) {
      e.preventDefault();
  }
  drawing = false;
}, false);


// MOUSE LEAVE function

$("#canvas").mouseleave(function(e) {
  drawing = false;
});


// TOUCH LEAVE function

canvas.addEventListener("touchleave", function (e) {
  if (e.target == canvas) {
      e.preventDefault();
  }
  drawing = false;
}, false);


// ADD CLICK function

function addUserGesture(x, y, dragging) {
  clickX.push(x);
  clickY.push(y);
  clickD.push(dragging);
}


// RE DRAW function

function drawOnCanvas() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.strokeStyle = canvasStrokeStyle;
  ctx.lineJoin    = canvasLineJoin;
  ctx.lineWidth   = canvasLineWidth;

  for (var i = 0; i < clickX.length; i++) {
      ctx.beginPath();
      if(clickD[i] && i) {
          ctx.moveTo(clickX[i-1], clickY[i-1]);
      } else {
          ctx.moveTo(clickX[i]-1, clickY[i]);
      }
      ctx.lineTo(clickX[i], clickY[i]);
      ctx.closePath();
      ctx.stroke();
  }
}


// CLEAR CANVAS function

$("#clear-button").click(async function () {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  clickX = new Array();
  clickY = new Array();
  clickD = new Array();
  $(".prediction-text").empty();
  $("#result_box").addClass('d-none');
});



// Load custom model

async function loadMnistModel() {
  // clear the model variable
  model = undefined; 
  // load the model using a HTTPS request (where you have stored your model files)
  model = await tf.loadLayersModel("js/models/model.json");
}
 
loadMnistModel();


// preprocess the canvas

function preprocessCanvas(image) {
  // resize the input image to target size of (1, 28, 28)
  let tensor = tf.browser.fromPixels(image)
      .resizeNearestNeighbor([28, 28])
      .mean(2)
      .expandDims(2)
      .expandDims()
      .toFloat();
  return tensor.div(255.0);
}


// predict function 

$("#predict-button").click(async function () {
  // get image data from canvas
  var imageData = canvas.toDataURL();

  // preprocess canvas
  let tensor = preprocessCanvas(canvas);

  // make predictions on the preprocessed image tensor
  let predictions = await model.predict(tensor).data();

  // get the model's prediction results
  let results = Array.from(predictions);

  // display the predictions in chart
  $("#result_box").removeClass('d-none');
  displayChart(results);
  displayLabel(results);
});


// Chart to display predictions

var chart = "";
var firstTime = 0;
function loadChart(label, data, modelSelected) {
    var ctx = document.getElementById('chart_box').getContext('2d');
    chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'bar',
 
        // The data for our dataset
        data: {
            labels: label,
            datasets: [{
                backgroundColor: '#f50057',
                borderColor: 'rgb(255, 99, 132)',
                data: data,
            }]
        },
 
        // Configuration options go here
        options: {
          plugins: {
            legend: {
              display: false
            }
          },

          scales: {
            x: {
              ticks: {
                color: '#000000'
              }
            },

            y: {
              ticks: {
                color: '#000000'
              }
            }
          }
        }
    });
}
 

// display chart with updated
// drawing from canvas

function displayChart(data) {
    var select_option = "CNN";
 
    label = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    if (firstTime == 0) {
        loadChart(label, data, select_option);
        firstTime = 1;
    } else {
        chart.destroy();
        loadChart(label, data, select_option);
    }
    document.getElementById('chart_box').style.display = "block";
}
 
function displayLabel(data) {
    var max = data[0];
    var maxIndex = 0;
 
    for (var i = 1; i < data.length; i++) {
        if (data[i] > max) {
            maxIndex = i;
            max = data[i];
        }
    }
    $(".prediction-text").html("Predicting you draw <b>"+maxIndex+"</b> with <b>"+Math.trunc( max*100 )+"%</b> confidence")
}