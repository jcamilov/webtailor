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
  inputCanvasCtx.save();
  let imageData = inputCanvasCtx.getImageData(0, 0, width, height);
  // // 2. Get contour coordinates
  // make the image binary (1 represents person, 0 background)
  let binaryImageData = [];
  for (let i = 0; i < imageData.data.length - 1 / 4; i++) {
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
    let index = binaryImage2D[row].indexOf(1);
    if (index !== -1) {
      // found person, get the position and distance of borders of the silhouette
      xLeft.push(index);
      xRigth.push(binaryImage2D[row].lastIndexOf(1));
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
  drawContour(canvasCtx, xLeft, y);
  drawContour(canvasCtx, xRigth, y);
};
