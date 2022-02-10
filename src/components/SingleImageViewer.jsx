import React, { useEffect, useRef } from "react";
import hombre from "../assets/hombre.jpg";
import juan from "../assets/juan.png";
import { drawContour } from "../helpers";

function SingleImageViewer() {
  let picRef = useRef(null);
  let outputCanvasRef = useRef(null);
  let width = 0;
  let height = 0;

  // Draws a contour on canvas from the mask that results after body segmentation
  const getContourCoordinates = () => {
    // 1. Get image data, for now, from a file and through an invisible canvas
    // to convert the image to manipulable data
    width = picRef.current.width;
    height = picRef.current.height;
    console.log(picRef.current);
    console.log(`w:${width} h:${height}`);
    let invisibleCanvas = document.createElement("canvas");
    let invisibleCtx = invisibleCanvas.getContext("2d");
    invisibleCanvas.width = width;
    invisibleCanvas.height = height;
    invisibleCtx.drawImage(picRef.current, 0, 0, width, height);
    let imageData = invisibleCtx.getImageData(0, 0, width, height);
    // // 2. Get contour coordinates
    // make the image binary (1 represents person, 0 background)
    let binaryImageData = [];
    for (let i = 0; i < imageData.data.length - 1 / 4; i++) {
      binaryImageData.push(
        imageData.data[i * 4] +
          imageData.data[i * 4 + 1] +
          imageData.data[i * 4 + 2] >
          500
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

  const onLoad = () => {
    getContourCoordinates();
  };

  useEffect(() => {});

  return (
    <div className="grid grid-cols-2 gap-4">
      <img
        ref={picRef}
        id="imageSrc"
        // src="https://c.pxhere.com/photos/36/91/brett_lark_cancer_cure_model_confident_inspiring_strong-691314.jpg!d"
        src={juan}
        onLoad={onLoad}
        alt="single picture"
      />
      <canvas
        ref={outputCanvasRef}
        id="outputCanvas"
        ref={outputCanvasRef}
        style={{
          width: 640,
          height: 480,
        }}
      />
    </div>
  );
}

export default SingleImageViewer;
