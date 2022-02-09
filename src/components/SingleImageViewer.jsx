import React, { useEffect, useRef } from "react";
import hombre from "../assets/hombre.jpg";
import juan from "../assets/juan.png";

function SingleImageViewer() {
  let picRef = useRef(null);
  let canvasRef = useRef(null);
  let width = 0;
  let height = 0;

  const onLoad = () => {
    // 1. Get image data
    // an invisible canvas to convert the image to manipulable data
    width = picRef.current.width;
    height = picRef.current.height;
    console.log(picRef.current);
    console.log(`w: ${width} h: ${height}`);
    let invisibleCanvas = document.createElement("canvas");
    let invisibleCtx = invisibleCanvas.getContext("2d");
    invisibleCanvas.width = width;
    invisibleCanvas.height = height;
    console.log(invisibleCanvas);
    // picRef.current.crossOrigin = "Anonymous";
    invisibleCtx.drawImage(picRef.current, 0, 0, width, height);
    console.log(invisibleCtx);
    let imageData = invisibleCtx.getImageData(0, 0, width, height);
    // // 2. Get contour coordinates
    let binaryImageData = [];
    // making the image binary (1 represents person, 0 background)
    for (let i = 0; i < imageData.data.length / 4; i++) {
      binaryImageData.push(
        imageData.data[i * 3] +
          imageData.data[i * 3 + 1] +
          imageData.data[i * 3 + 2] >
          100
          ? 0
          : 1
      );
    }
    // converting it from 1D to 2D array
    const binaryImage2D = [];
    while (binaryImageData.length) {
      binaryImage2D.push(binaryImageData.splice(0, width));
    }

    // Find points of the silhouette. I search first and last '1' in every row
    const silhouette = {
      x: [],
      y: [],
      distanceInPixels: [],
    };
    let x = [];
    let y = [];
    // aquí voy ---> guardar indices de silueta

    for (var row = 0; row < binaryImage2D.length - 1; row++) {
      for (var col = 0; col < binaryImage2D[0].length - 1; col++) {
        let index = binaryImage2D[row].findIndex((element) => element > 0);
        if (index !== -1) {
          // found person
          x.push(binaryImage2D[index]);
        }
      }
    }
    // smooth contour
    // 3. Draw contour in a different canvas
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
        // ref={canvasRef}
        id="outputCanvas"
        ref={canvasRef}
        style={{
          width: 640,
          height: 480,
        }}
      />
    </div>
  );
}

export default SingleImageViewer;
