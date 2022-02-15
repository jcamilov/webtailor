import React, { useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { checkCorrectPosition } from "../helpers";
import silueta from "../assets/silueta.png";
import hombre from "../assets/hombre.jpg";

function WebcamBox() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // Position range for every POI (indicates the full body is visible and in position)
  // [xMin , xMax , yMin , yMax]
  const lHandRange = [0.34, 0.43, 0.04, 0.18];
  const rHandRange = [0.54, 0.64, 0.04, 0.18];
  const noseRange = [0.46, 0.52, 0.13, 0.24];
  const feetRange = [0.0, 0.99, 0.8, 0.99];

  useEffect(() => {
    const canvasElement = canvasRef.current;
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    canvasElement.width = w;
    canvasElement.height = h;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.globalAlpha = 0.4;
    const img = new Image();
    img.src = silueta;
    img.onload = () => {
      canvasCtx.drawImage(img, 0, 0, canvasElement.width, canvasElement.height);
    };

    // draw som correct points
    canvasCtx.strokeStyle = "blue";
    canvasCtx.lineWidth = 4;
    canvasCtx.strokeRect(
      lHandRange[0] * w,
      lHandRange[2] * h,
      (lHandRange[1] - lHandRange[0]) * w,
      (lHandRange[3] - lHandRange[2]) * h
    );
    canvasCtx.strokeRect(
      rHandRange[0] * w,
      rHandRange[2] * h,
      (rHandRange[1] - rHandRange[0]) * w,
      (rHandRange[3] - rHandRange[2]) * h
    );
    canvasCtx.strokeRect(
      noseRange[0] * w,
      noseRange[2] * h,
      (noseRange[1] - noseRange[0]) * w,
      (noseRange[3] - noseRange[2]) * h
    );
    canvasCtx.strokeRect(
      feetRange[0] * w,
      feetRange[2] * h,
      (feetRange[1] - feetRange[0]) * w,
      (feetRange[3] - feetRange[2]) * h
    );
  });

  return (
    <div className="">
      <Webcam
        ref={webcamRef}
        muted={true}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zindex: 9,
          width: 640,
          height: 480,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zindex: 8,
          width: 640,
          height: 480,
        }}
      />
    </div>
  );
}

export default WebcamBox;
