import React, { useState, useRef, useEffect, useContext } from "react";
import Webcam from "react-webcam";
import { checkCorrectPosition, getMeasures } from "../helpers";
import ghostFront from "../assets/ghostFront.png";
import ghostSide from "../assets/ghostSide.png";
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import { drawLandmarks, drawConnectors } from "@mediapipe/drawing_utils";
import * as cam from "@mediapipe/camera_utils";
import CameraContext from "../contexts/CameraContext";

function WebcamBox({ processing }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const silhouetteRef = useRef(null);
  let camera = null;
  const [correctPosition, setCorrectPosition] = useState(false);
  const { positionToCheck, setThePositionToCheck, landmarks, addLandmarks } =
    useContext(CameraContext);

  // Position range for every POI (indicates the full body is visible and in position)
  // [xMin , xMax , yMin , yMax]
  const handsRange = [0.35, 0.65];
  const noseMaxY = 0.22;
  const feetMinY = 0.8;

  // processing main function
  function onResults(results) {
    const width = webcamRef.current.video.videoWidth;
    const height = webcamRef.current.video.videoHeight;

    if (checkCorrectPosition(results, canvasRef, positionToCheck)) {
      addLandmarks(results, positionToCheck);
      if (positionToCheck === "FRONT" && landmarks.front.length > 4) {
        setThePositionToCheck("SIDE");
        console.log("Front side OK, now turn rigth 90°.");
        console.log(landmarks);
      } else if (positionToCheck === "SIDE" && landmarks.side.length > 4) {
        // get the real measurements by averaging and converting to cm
        console.log(landmarks);
      }
    }

    if (results.poseLandmarks) {
      const [anklesAverage, eyesAverage, heightInPx] = getMeasures(results);

      // draw some measures:
      const canvasElement = canvasRef.current;
      const w = canvasRef.current.width;
      const h = canvasRef.current.height;
      canvasElement.width = w;
      canvasElement.height = h;
      const canvasCtx = canvasElement.getContext("2d");

      canvasCtx.strokeStyle = "red";
      canvasCtx.lineWidth = 1;
      canvasCtx.globalAlpha = 1;
      canvasCtx.beginPath();

      // [DEBUG] vertical line
      // get an averaged x axis to check correct side position
      // const xAxis =
      //   (results.poseLandmarks[11].x +
      //     results.poseLandmarks[12].x +
      //     results.poseLandmarks[27].x +
      //     results.poseLandmarks[28].x) /
      //   4;

      // canvasCtx.moveTo(xAxis * w, 0);
      // canvasCtx.lineTo(xAxis * w, h);
      // canvasCtx.stroke();

      // // [DEBUG] Draw shoulders and its difference in x.
      // canvasCtx.beginPath();
      // canvasCtx.arc(
      //   results.poseLandmarks[11].x * w,
      //   results.poseLandmarks[11].y * h,
      //   5,
      //   0,
      //   2 * Math.PI
      // );
      // canvasCtx.fill();
      // canvasCtx.stroke();

      // canvasCtx.strokeStyle = "green";
      // canvasCtx.beginPath();
      // canvasCtx.arc(
      //   results.poseLandmarks[12].x * w,
      //   results.poseLandmarks[12].y * h,
      //   5,
      //   0,
      //   2 * Math.PI
      // );
      // canvasCtx.fill();
      // canvasCtx.stroke();

      // canvasCtx.font = "bold 12px Comic Sans MS";
      // canvasCtx.fillStyle = "red";
      // canvasCtx.fillText(
      //   "Ancho: " +
      //     Math.abs(
      //       results.poseLandmarks[11].x - results.poseLandmarks[12].x
      //     ).toFixed(2),
      //   10,
      //   25
      // );
    }

    // draw right or wrong position
    // const canvasElement = canvasRef.current;
    // const w = canvasRef.current.width;
    // const h = canvasRef.current.height;
    // canvasElement.width = w;
    // canvasElement.height = h;
    // const canvasCtx = canvasElement.getContext("2d");

    // canvasCtx.font = "50px serif";
    // canvasCtx.fillText(correctPosition ? "OK" : "WRONG POSITION", 50, 90);

    // draw the segmentation mask and/or silhouette
    // const canvasElement = canvasRef.current;
    // const w = canvasRef.current.width;
    // const h = canvasRef.current.height;
    // canvasElement.width = w;
    // canvasElement.height = h;
    // const canvasCtx = canvasElement.getContext("2d");
    // canvasCtx.save();
    // canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    // canvasCtx.drawImage(
    //   results.segmentationMask,
    //   0,
    //   0,
    //   canvasElement.width,
    //   canvasElement.height
    // );

    // //llenar el fondo con negro. Only overwrite existing pixels.
    // canvasCtx.globalCompositeOperation = "source-in";
    // canvasCtx.fillStyle = "#000000";
    // canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

    // // drawing mask, landmarks and connectors
    // if (results.poseLandmarks) {
    //   // Draw segmentation mask (Only overwrite missing pixels)
    //   canvasCtx.globalCompositeOperation = "destination-atop";
    //   canvasCtx.drawImage(
    //     results.segmentationMask,
    //     0,
    //     0,
    //     canvasElement.width,
    //     canvasElement.height
    //   );

    //   // Draw landmarks and connectors
    //   canvasCtx.globalCompositeOperation = "source-over";
    //   drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
    //     color: "#00FF00",
    //     lineWidth: 2,
    //   });
    //   drawLandmarks(canvasCtx, results.poseLandmarks, {
    //     color: "#FF0000",
    //     lineWidth: 2,
    //   });
    //   canvasCtx.restore();
    // }

    // // drawing contour over the mask
    // outputCanvasRef.current.width = width;
    // outputCanvasRef.current.height = height;
    // drawContourOnCanvas(canvasRef, outputCanvasRef);

    // // draw red or green border according to wrong or right position
    // checkCorrectPosition(results, outputCanvasRef);
    // }
  }

  useEffect(() => {
    console.log("renderizando WebcamBox");
    if (processing) {
      // Draw a ghostFront and a couple of lines as a reference for the person to position himself
      const canvasElement = canvasRef.current;
      const w = canvasRef.current.width;
      const h = canvasRef.current.height;
      canvasElement.width = w;
      canvasElement.height = h;
      const canvasCtx = canvasElement.getContext("2d");
      canvasCtx.globalAlpha = 0.7;
      const img = new Image();
      img.src =
        positionToCheck === "FRONT"
          ? ghostFront
          : positionToCheck === "SIDE"
          ? ghostSide
          : "";
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
      // canvasCtx.strokeStyle = "blue";
      // canvasCtx.lineWidth = 3;
      // canvasCtx.beginPath();
      // canvasCtx.moveTo(0, noseMaxY * h);
      // canvasCtx.lineTo(w, noseMaxY * h);
      // canvasCtx.stroke();

      // canvasCtx.beginPath();
      // canvasCtx.moveTo(0, feetMinY * h);
      // canvasCtx.lineTo(w, feetMinY * h);
      // canvasCtx.stroke();

      // canvasCtx.strokeStyle = "red";
      // canvasCtx.beginPath();
      // canvasCtx.moveTo(handsRange[0] * w, 0);
      // canvasCtx.lineTo(handsRange[0] * w, h);
      // canvasCtx.stroke();

      // canvasCtx.beginPath();
      // canvasCtx.moveTo(handsRange[1] * w, 0);
      // canvasCtx.lineTo(handsRange[1] * w, h);
      // canvasCtx.stroke();

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
  }, [processing]);

  return (
    <div className="container mx-auto">
      <h1 className="font-bold text-center mx-auto text-lg text-red-800">
        {correctPosition ? "correct" : "wrong"} {positionToCheck} position
      </h1>
      <div className="container mx-auto text-center" position="absolute">
        <Webcam
          ref={webcamRef}
          muted={true}
          className="mx-auto"
          style={{
            position: "absolute",
            // marginLeft: "auto",
            // marginRight: "auto",
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
            className="mx-auto"
            style={{
              position: "absolute",
              // marginLeft: "auto",
              // marginRight: "auto",
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
        className="mx-auto"
        style={{
          width: 640,
          height: 480,
        }}
      />
    </div>
  );
}

export default WebcamBox;
