import { drawLandmarks, drawConnectors } from "@mediapipe/drawing_utils";
import { POSE_CONNECTIONS } from "@mediapipe/pose";

// check Landmark results to see if person is in place according to front or side measurement state.
export const checkCorrectPosition = (results, outputCanvasRef) => {
  if (!results.poseLandmarks) return false;
  // bare in mind that the image is mirrored
  const nose = results.poseLandmarks[0];
  const leftHand = results.poseLandmarks[15];
  const rightHand = results.poseLandmarks[16];
  const leftShoulder = results.poseLandmarks[11];
  const rightShoulder = results.poseLandmarks[12];
  const leftHip = results.poseLandmarks[23];
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
    leftFoot.visibility > 0.7 &&
    nose.visibility > 0.6;

  // arms behind head
  const frontPosition =
    Math.abs(leftShoulder.x - rightShoulder.x) > 0.1 && // body facing camera
    Math.abs(rightHand.x - nose.x) < 0.1 &&
    Math.abs(leftHand.x - nose.x) < 0.1 && // hands close to head (hopefully behind the head)
    rightHand.y > 0.03 &&
    rightHand.y < noseMaxY &&
    leftHand.y > 0.03 &&
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
    // Math.abs(leftShoulder.x - rightShoulder.x) < 0.1 && // body not facing camera (approx. 90° rotated)
    leftHand.x < xAxis + 0.2 &&
    leftHand.x > xAxis - 0.2 && // not raising left hand
    leftShoulder.x < xAxis + 0.15 &&
    leftShoulder.x > xAxis - 0.15 && // not raising left hand
    leftHip.x < xAxis + 0.15 &&
    leftHip.x > xAxis - 0.15 && // not raising left hand
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

export const getHeightInPx = (results) => {
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

  const heightInPx = (anklesAverage - eyesAverage) * 1.097;
  // El 1.09 sale de adicionar la distancia que hay entre los ojos y la cima de la cabeza.
  // Y además de compensar que de los tobillos al suelo realmente hay 7-9cm
  return heightInPx;
};

export const getTorsoMeasurementsInPx = (canvasRef, results) => {
  const leftShoulderLandmark = results.poseLandmarks[11];
  const rightShoulderLandmark = results.poseLandmarks[12];
  const leftHipLandmark = results.poseLandmarks[23];
  const rightHipLandmark = results.poseLandmarks[24];

  let chest = { left: {}, right: {} }; // 20% below of hip - shoulder
  let waist = { left: {}, right: {} }; // 65% below of hip - shoulder
  let hip = { left: {}, right: {} }; // same as hip landmark

  // 1. Get heights ("y" values) from landmarks
  chest.left.y =
    leftShoulderLandmark.y + (leftHipLandmark.y - leftShoulderLandmark.y) * 0.2;
  chest.right.y =
    rightShoulderLandmark.y +
    (rightHipLandmark.y - rightShoulderLandmark.y) * 0.22;
  waist.left.y =
    leftShoulderLandmark.y +
    (leftHipLandmark.y - leftShoulderLandmark.y) * 0.65;
  waist.right.y =
    rightShoulderLandmark.y +
    (rightHipLandmark.y - rightShoulderLandmark.y) * 0.65;
  hip.left.y = leftHipLandmark.y;
  hip.right.y = rightHipLandmark.y;

  // 2. Get the "x" values. First we need to process the mask first to get a binary image.

  // Draw segmentation mask in an invisible canvas to be able to manipulate pixels
  const width = canvasRef.current.width;
  const height = canvasRef.current.height;
  let invisibleCanvas = document.createElement("canvas");
  invisibleCanvas.width = width;
  invisibleCanvas.height = height;
  let invisibleCtx = invisibleCanvas.getContext("2d");
  invisibleCtx.drawImage(results.segmentationMask, 0, 0, width, height);
  let imageData = invisibleCtx.getImageData(0, 0, width, height);
  // make the image binary (1 represents person, 0 background)
  let binaryImageData = [];
  for (let i = 0; i < imageData.data.length / 4; i++) {
    binaryImageData.push(
      imageData.data[i * 4] +
        imageData.data[i * 4 + 1] +
        imageData.data[i * 4 + 2] >
        60
        ? 0
        : 1
    );
  }
  // converting binary mask image from 1D to a 2D array (x-y coordinates)
  const binaryMask2D = [];
  while (binaryImageData.length) {
    binaryMask2D.push(binaryImageData.splice(0, width));
  }

  const canvasElement = canvasRef.current;
  const w = canvasRef.current.width;
  const h = canvasRef.current.height;
  canvasElement.width = w;
  canvasElement.height = h;
  const canvasCtx = canvasElement.getContext("2d");

  // canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);
  // canvasCtx.drawImage(
  //   results.segmentationMask,
  //   0,
  //   0,
  //   canvasCtx.canvas.width,
  //   canvasCtx.canvas.height
  // );

  // finally search the "x" of the silhouette for every POI in the binary mask
  // TO IMPROVE LATER: we can get three "ys" and average them to better results
  try {
    // I average 5 "ys" on every POI to reduce jitter even more
    // const avgChestX = 0;
    // for (let i = 0; i < 5; i++) {
    //   avgChestX =
    //     avgChestX +
    //     binaryMask2D[Number((chest.left.y * height + i).toFixed(0))].indexOf(0);
    // }
    // avgChestX = Number(avgChestX / 5 / width).toFixed(0);

    chest.left.x =
      binaryMask2D[Number((chest.left.y * height).toFixed(0))].indexOf(0) /
      width;
    chest.right.x =
      binaryMask2D[Number((chest.right.y * height).toFixed(0))].lastIndexOf(0) /
      width;
    waist.left.x =
      binaryMask2D[Number((waist.left.y * height).toFixed(0))].indexOf(0) /
      width;
    waist.right.x =
      binaryMask2D[Number((waist.right.y * height).toFixed(0))].lastIndexOf(0) /
      width;
    hip.left.x =
      binaryMask2D[Number((hip.left.y * height).toFixed(0))].indexOf(0) / width;
    hip.right.x =
      binaryMask2D[Number((hip.right.y * height).toFixed(0))].lastIndexOf(0) /
      width;
  } catch (e) {
    console.log(`No se detectó silueta. ${e.message}`);
    chest = null;
    waist = null;
    hip = null;
  }

  return [chest, waist, hip];
};
