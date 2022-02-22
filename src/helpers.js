import { drawLandmarks, drawConnectors } from "@mediapipe/drawing_utils";
import { POSE_CONNECTIONS } from "@mediapipe/pose";

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
export const drawContour = (canvasCtx, x, y, color) => {
  // canvasCtx.globalCompositeOperation = "source-over";
  canvasCtx.beginPath();
  canvasCtx.strokeStyle = color;
  canvasCtx.moveTo(x[0], y[0]);
  for (let i = 1; i < x.length; i++) {
    canvasCtx.lineTo(x[i], y[i]);
  }
  canvasCtx.stroke();
};

// Draws a contour on canvas from the mask that results after body segmentation
// Returns normalized silhouette points
export const drawContourOnCanvas = (inputCanvasRef, results) => {
  const width = inputCanvasRef.current.width;
  const height = inputCanvasRef.current.height;
  const canvasElement = inputCanvasRef.current;
  const inputCanvasCtx = canvasElement.getContext("2d");

  // Draw segmentation mask in an invisible canvas to then process and get the silhouette
  let invisibleCanvas = document.createElement("canvas");
  let invisibleCtx = invisibleCanvas.getContext("2d");
  // invisibleCtx.globalCompositeOperation = "destination-atop";
  // invisibleCtx.globalCompositeOperation = "source-over";

  invisibleCtx.drawImage(results.segmentationMask, 0, 0, width, height);

  let imageData = invisibleCtx.getImageData(0, 0, width, height);
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
  let xRight = [];
  let distanceInPixels = [];
  let y = [];

  for (var row = 0; row < binaryImage2D.length - 1; row++) {
    let index = binaryImage2D[row].indexOf(0);
    if (index !== -1) {
      // found person, get the position and distance of borders of the silhouette
      xLeft.push(index);
      xRight.push(binaryImage2D[row].lastIndexOf(0));
      distanceInPixels[row] =
        xRight[xRight.length - 1] - xLeft[xLeft.length - 1];
      y.push(row);
    }
  }
  // smooth contour
  // const xLeftSmoothed = smooth(xLeft, 0.85);
  // const xRightSmoothed = smooth(xRight,0.85)

  // 3. Draw contour in a different canvas to check
  const invertedXLeft = xLeft.map((x) => width - x);
  const invertedXRight = xRight.map((x) => width - x);

  inputCanvasCtx.globalCompositeOperation = "destination-atop";
  drawContour(inputCanvasCtx, invertedXLeft, y, "blue");
  inputCanvasCtx.globalCompositeOperation = "source-over";
  drawContour(inputCanvasCtx, invertedXRight, y, "red");
  inputCanvasCtx.globalCompositeOperation = "source-over";
  drawConnectors(inputCanvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
    color: "#00FF00",
    lineWidth: 1,
  });
  drawLandmarks(inputCanvasCtx, results.poseLandmarks, {
    color: "#FF0000",
    lineWidth: 1,
  });
  inputCanvasCtx.restore();

  const silhouetteXLeft = xLeft.map((x) => x / width);
  const silhouetteXRight = xRight.map((x) => x / width);
  const silhouetteY = y.map((y) => y / height);

  return [silhouetteXLeft, silhouetteXRight, silhouetteY];
};

// check Landmark results to see if person is in place according to front or side measurement state.
export const checkCorrectPosition = (results, outputCanvasRef) => {
  if (!results.poseLandmarks) return false;
  // bare in mind that the image is mirrored
  const nose = results.poseLandmarks[0];
  const leftHand = results.poseLandmarks[15];
  const rightHand = results.poseLandmarks[16];
  const leftShoulder = results.poseLandmarks[11];
  const rightShoulder = results.poseLandmarks[12];
  const leftFoot = results.poseLandmarks[27];
  const rightFoot = results.poseLandmarks[28];
  const w = outputCanvasRef.current.width;
  const h = outputCanvasRef.current.height;

  // reference position for hands (nose) and feet inside the screen
  const handsRange = [0.35, 0.65]; //for FRONT check
  const noseMaxY = 0.25;
  const feetMinY = 0.8;

  // get an averaged x axis to check correct side position
  const xAxis =
    (results.poseLandmarks[11].x +
      results.poseLandmarks[12].x +
      results.poseLandmarks[27].x +
      results.poseLandmarks[28].x) /
    4;

  // conditionals for position in screen
  const fullBodyInScreen =
    leftShoulder.visibility > 0.7 &&
    rightShoulder.visibility > 0.7 &&
    leftFoot.visibility > 0.7 &&
    rightFoot.visibility > 0.7 &&
    nose.visibility > 0.7;

  // for standing in front with arms down
  // Math.abs(leftShoulder.x - rightShoulder.x) > 0.1 && // body facing camera
  // rightHand.visibility > 0.7 && // right and left hands visible and in 2nd and 3rd vertical quarters
  // leftHand.visibility > 0.7 &&
  // handsRange[0] < rightHand.x &&
  // rightHand.x < 0.5 &&
  // 0.5 < leftHand.x &&
  // leftHand.x < handsRange[1] &&
  // nose.y > 0.1 &&
  // nose.y < noseMaxY &&
  // leftFoot.y > feetMinY &&
  // leftFoot.y < 0.95 &&
  // rightFoot.y > feetMinY &&
  // rightFoot.y < 0.95;

  // arms behind head
  const frontPosition =
    Math.abs(leftShoulder.x - rightShoulder.x) > 0.1 && // body facing camera
    Math.abs(rightHand.x - nose.x) < 0.1 &&
    Math.abs(leftHand.x - nose.x) < 0.1 && // hands close to head (hopefully behind the head)
    rightHand.y > 0.1 &&
    rightHand.y < noseMaxY &&
    leftHand.y > 0.1 &&
    leftHand.y < noseMaxY && // both hands at the height of the nose
    nose.y > 0.1 &&
    nose.y < noseMaxY &&
    leftFoot.y > feetMinY &&
    leftFoot.y < 0.95 &&
    rightFoot.y > feetMinY &&
    rightFoot.y < 0.95;

  const sidePosition =
    xAxis > 0.4 &&
    xAxis < 0.6 && // standing in the center of the screen
    leftHand.visibility > 0.6 &&
    rightHand.visibility < 0.5 && // rigth hand must be occluded
    Math.abs(leftShoulder.x - rightShoulder.x) < 0.1 && // body not facing camera (approx. 90° rotated)
    leftHand.x < xAxis + 0.2 &&
    leftHand.x > xAxis - 0.2 && // not raising left hand
    nose.y > 0.1 &&
    nose.y < noseMaxY &&
    leftFoot.y > feetMinY &&
    leftFoot.y < 0.95 &&
    rightFoot.y > feetMinY &&
    rightFoot.y < 0.95;

  if (!fullBodyInScreen) return null;

  if (frontPosition) {
    return "FRONT";
  } else if (sidePosition) {
    return "SIDE";
  }
  return null;
};

export const getMeasurements = (
  frontLandmarks,
  sideLandmarks,
  silhouetteXLeft,
  silhouetteXRight,
  silhouetteY,
  results
) => {
  // AQUI VOY!!!! -> Tengo que mapear los puntos de silueta con los puntos promedio de chest, waist and hip
  // 1. get an average of the landmarks
  const frontAvgSilhouette = [];

  // get 1 point avg frontLandmarks.map((medicion)=>medicion.poseLandmarks[0].x).reduce((prev,acc)=>prev+acc,0)/frontLandmarks.length

  // 2a. Get chest, waist and hip measurement in px in both sides.

  // 2b. Get the perimeter in every part in px

  // 3. Get the heigth in pixels

  // 4. Convert everything to cm

  // TO FIX: No me funcionar con reduce... NaN
  // const eyesAverage =
  //   results.poseLandmarks.slice(1, 7).reduce((prev, acc) => prev.y + acc.y, 0) /
  //   6;

  // Ratio height/eyes: Distance from eyes to top of head = height/14
  // So, heigth goes from toes to eyes +
  const eyesAverage =
    (results.poseLandmarks[1].y +
      results.poseLandmarks[2].y +
      results.poseLandmarks[3].y +
      results.poseLandmarks[4].y +
      results.poseLandmarks[5].y +
      results.poseLandmarks[6].y) /
    6;
  const anklesAverage =
    (results.poseLandmarks[29].y + results.poseLandmarks[30].y) / 2;

  const heightInPx = (anklesAverage - eyesAverage) * 1.07;
  // El 1.07 sale de adicionar la distancia que hay entre los ojos y la cima de la cabeza.

  const str = `Altura: ${heightInPx.toFixed(2)}, De mano a mano ${(
    (results.poseLandmarks[19].x - results.poseLandmarks[20].x) *
    1.04
  ).toFixed(2)}`;

  // console.log(str);

  return [anklesAverage, eyesAverage, heightInPx];
};
