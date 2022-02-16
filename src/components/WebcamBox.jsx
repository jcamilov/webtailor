import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { checkCorrectPosition, getMeasures } from "../helpers";
import ghost from "../assets/ghost.png";
import hombre from "../assets/hombre.jpg";
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import { drawLandmarks, drawConnectors } from "@mediapipe/drawing_utils";
import * as cam from "@mediapipe/camera_utils";

function WebcamBox({ processing }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const silhouetteRef = useRef(null);
  let camera = null;
  const [correctPosition, setCorrectPosition] = useState(false);

  // Position range for every POI (indicates the full body is visible and in position)
  // [xMin , xMax , yMin , yMax]
  const handsRange = [0.35, 0.65];
  const noseMaxY = 0.22;
  const feetMinY = 0.8;

  // processing main function
  function onResults(results) {
    const width = webcamRef.current.video.videoWidth;
    const height = webcamRef.current.video.videoHeight;

    // setCorrectPosition(checkCorrectPosition(results, canvasRef));

    getMeasures(results);

    // draw right or wrong position
    // const canvasElement = canvasRef.current;
    // const w = canvasRef.current.width;
    // const h = canvasRef.current.height;
    // canvasElement.width = w;
    // canvasElement.height = h;
    // const canvasCtx = canvasElement.getContext("2d");

    // canvasCtx.font = "50px serif";
    // canvasCtx.fillText(correctPosition ? "OK" : "WRONG POSITION", 50, 90);

    // draw the mask and/or silhouette
    const canvasElement = canvasRef.current;
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    canvasElement.width = w;
    canvasElement.height = h;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
      results.segmentationMask,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    //llenar el fondo con negro. Only overwrite existing pixels.
    canvasCtx.globalCompositeOperation = "source-in";
    canvasCtx.fillStyle = "#000000";
    canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

    // drawing mask, landmarks and connectors
    if (results.poseLandmarks) {
      // Draw segmentation mask (Only overwrite missing pixels)
      canvasCtx.globalCompositeOperation = "destination-atop";
      canvasCtx.drawImage(
        results.segmentationMask,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      // Draw landmarks and connectors
      canvasCtx.globalCompositeOperation = "source-over";
      drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 2,
      });
      drawLandmarks(canvasCtx, results.poseLandmarks, {
        color: "#FF0000",
        lineWidth: 1,
      });
      canvasCtx.restore();
    }

    // // drawing contour over the mask
    // outputCanvasRef.current.width = width;
    // outputCanvasRef.current.height = height;
    // drawContourOnCanvas(canvasRef, outputCanvasRef);

    // // draw red or green border according to wrong or right position
    // checkCorrectPosition(results, outputCanvasRef);
    // }
  }

  useEffect(() => {
    console.log(processing);
    if (processing) {
      // Draw a ghost and a couple of lines as a reference for the person to position himself
      const canvasElement = canvasRef.current;
      const w = canvasRef.current.width;
      const h = canvasRef.current.height;
      canvasElement.width = w;
      canvasElement.height = h;
      const canvasCtx = canvasElement.getContext("2d");
      canvasCtx.globalAlpha = 0.7;
      const img = new Image();
      img.src = ghost;
      img.onload = () => {
        canvasCtx.drawImage(
          img,
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );
      };

      // draw the lines to guide correct position
      canvasCtx.strokeStyle = "blue";
      canvasCtx.lineWidth = 3;
      canvasCtx.beginPath();
      canvasCtx.moveTo(0, noseMaxY * h);
      canvasCtx.lineTo(w, noseMaxY * h);
      canvasCtx.stroke();

      canvasCtx.beginPath();
      canvasCtx.moveTo(0, feetMinY * h);
      canvasCtx.lineTo(w, feetMinY * h);
      canvasCtx.stroke();

      canvasCtx.strokeStyle = "red";
      canvasCtx.beginPath();
      canvasCtx.moveTo(handsRange[0] * w, 0);
      canvasCtx.lineTo(handsRange[0] * w, h);
      canvasCtx.stroke();

      canvasCtx.beginPath();
      canvasCtx.moveTo(handsRange[1] * w, 0);
      canvasCtx.lineTo(handsRange[1] * w, h);
      canvasCtx.stroke();

      // Set the mediapipe segmentation/pose model
      const pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        },
      });

      pose.setOptions({
        modelComplexity: 2,
        smoothLandmarks: true,
        enableSegmentation: true,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults(onResults);

      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await pose.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  });

  return (
    <div className="container">
      <h1 className="font-bold text-center mx-auto text-lg text-red-800">
        {correctPosition ? "correct" : "wrong"} position
      </h1>
      <div className="container-fluid" position="absolute">
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
        {processing && (
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
        )}
      </div>
      <canvas
        ref={silhouetteRef}
        style={{
          position: "relative",
          width: 640,
          height: 480,
        }}
      />
    </div>
  );
}

export default WebcamBox;
