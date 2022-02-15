// Receives an array of contour points and returns an array
// of the same lenght with smoothed contour
// starting variance might be 0.85
export const smooth = (array, variance) => {
  function average(data) {
    var sum = data.reduce(function (sum, value) {
      return sum + value;
    }, 0);
    var avg = sum / data.length;
    return avg;
  }

  var weighted = average(array) * variance;
  var smoothed = [];
  for (var i in array) {
    var curr = array[i];
    var prev = smoothed[i - 1] || array[array.length - 1];
    var next = curr || array[0];
    var improved = Number(average([weighted, prev, curr, next]).toFixed(2));
    smoothed.push(improved);
  }
  return smoothed;
};

// Draw contour
export const drawContour = (canvasCtx, x, y) => {
  canvasCtx.globalCompositeOperation = "source-over";
  canvasCtx.beginPath();
  canvasCtx.strokeStyle = "blue";
  canvasCtx.moveTo(x[0], y[0]);
  for (let i = 1; i < x.length; i++) {
    canvasCtx.lineTo(x[i], y[i]);
  }
  canvasCtx.stroke();
};

// Draws a contour on canvas from the mask that results after body segmentation
export const drawContourOnCanvas = (inputCanvasRef, outputCanvasRef) => {
  const width = inputCanvasRef.current.width;
  const height = inputCanvasRef.current.height;
  // Get image data, for now, from a file and through an invisible canvas
  // to convert the image to manipulable data
  // let invisibleCanvas = document.createElement("canvas");
  // let invisibleCtx = invisibleCanvas.getContext("2d");

  const canvasElement = inputCanvasRef.current;
  const inputCanvasCtx = canvasElement.getContext("2d");
  // inputCanvasCtx.save();
  let imageData = inputCanvasCtx.getImageData(0, 0, width, height);
  // // 2. Get contour coordinates
  // make the image binary (1 represents person, 0 background)
  let binaryImageData = [];
  for (let i = 0; i < imageData.data.length / 4 - 1; i++) {
    binaryImageData.push(
      imageData.data[i * 4] +
        imageData.data[i * 4 + 1] +
        imageData.data[i * 4 + 2] >
        20
        ? 0
        : 1
    );
  }
  // converting it from 1D to 2D array (x-y coordinates)
  const binaryImage2D = [];
  while (binaryImageData.length) {
    binaryImage2D.push(binaryImageData.splice(0, width));
  }

  // Scan every row to find points of the silhouette (and distance between them). I search first and last '1' in every row
  let xLeft = [];
  let xRigth = [];
  let distanceInPixels = [];
  let y = [];

  for (var row = 0; row < binaryImage2D.length - 1; row++) {
    let index = binaryImage2D[row].indexOf(0);
    if (index !== -1) {
      // found person, get the position and distance of borders of the silhouette
      xLeft.push(index);
      xRigth.push(binaryImage2D[row].lastIndexOf(0));
      distanceInPixels[row] =
        xRigth[xRigth.length - 1] - xLeft[xLeft.length - 1];
      y.push(row);
    }
  }
  // smooth contour
  // const xLeftSmoothed = smooth(xLeft,0.85)
  // const xRightSmoothed = smooth(xRigth,0.85)

  // 3. Draw contour in a different canvas to check
  const outputCanvasElement = outputCanvasRef.current;
  outputCanvasElement.width = width;
  outputCanvasElement.height = height;
  const canvasCtx = outputCanvasElement.getContext("2d");
  canvasCtx.globalCompositeOperation = "source-over";
  drawContour(canvasCtx, xLeft, y);
  drawContour(canvasCtx, xRigth, y);
};

// check Landmark results to see if person is in place. Draw a red or green rectangle accordingly
export const checkCorrectPosition = (results, outputCanvasRef) => {
  const leftHand = results.poseLandmarks[15];
  const rightHand = results.poseLandmarks[16];
  const nose = results.poseLandmarks[0];
  const leftShoulder = results.poseLandmarks[11];
  const rightShoulder = results.poseLandmarks[12];
  const leftFoot = results.poseLandmarks[27];
  const rightFoot = results.poseLandmarks[28];
  const w = outputCanvasRef.current.width;
  const h = outputCanvasRef.current.height;

  // Position range for every POI (indicates the full body is visible and in position)
  // [xMin , xMax , yMin , yMax]
  const lHandRange = [0.34, 0.43, 0.03, 0.14];
  const rHandRange = [0.54, 0.64, 0.03, 0.14];
  const noseRange = [0.45, 0.51, 0.14, 0.21];
  const lFootRange = [0.41, 0.49, 0.89, 0.98];
  const rFootRange = [0.49, 0.56, 0.89, 0.98];

  const drawBorder = (color) => {
    const outputCanvasElement = outputCanvasRef.current;
    outputCanvasElement.width = w;
    outputCanvasElement.height = h;
    const ctx = outputCanvasElement.getContext("2d");
    ctx.globalCompositeOperation = "source-over";

    ctx.strokeStyle = color;
    ctx.lineWidth = 15;
    ctx.strokeRect(0, 0, w, h);

    // draw som correct points
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 4;
    ctx.strokeRect(
      lHandRange[0] * w,
      lHandRange[2] * h,
      (lHandRange[1] - lHandRange[0]) * w,
      (lHandRange[3] - lHandRange[2]) * h
    );
    ctx.strokeRect(
      rHandRange[0] * w,
      rHandRange[2] * h,
      (rHandRange[1] - rHandRange[0]) * w,
      (rHandRange[3] - rHandRange[2]) * h
    );
    ctx.strokeRect(
      noseRange[0] * w,
      noseRange[2] * h,
      (noseRange[1] - noseRange[0]) * w,
      (noseRange[3] - noseRange[2]) * h
    );
  };

  if (
    leftHand.visibility < 0.8 ||
    rightHand.visibility < 0.8 ||
    leftFoot.visibility < 0.8 ||
    rightFoot.visibility < 0.8 ||
    nose.visibility < 0.8
  ) {
  } else if (
    //check for positions
    lHandRange[0] < leftHand.x < lHandRange[1] &&
    lHandRange[2] < leftHand.y < lHandRange[3] &&
    rHandRange[0] < rightHand.x < rHandRange[1] &&
    rHandRange[2] < rightHand.y < rHandRange[3] &&
    noseRange[0] < nose.x < noseRange[1] &&
    noseRange[2] < nose.y < noseRange[3] &&
    lFootRange[0] < leftFoot.x < lFootRange[1] &&
    lFootRange[2] < leftFoot.y < lFootRange[3] &&
    rFootRange[0] < rightFoot.x < rFootRange[1] &&
    rFootRange[2] < rightFoot.y < rFootRange[3]
  ) {
    // draw green, correct position
    drawBorder("green");
    return;
  }

  drawBorder("red");
  return;
};
