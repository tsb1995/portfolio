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