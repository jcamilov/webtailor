import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import {
  checkCorrectPosition,
  getMeasurements,
  drawContourOnCanvas,
} from "../helpers";
import ghostFront from "../assets/ghostFront.png";
import ghostSide from "../assets/ghostSide.png";
import ok from "../assets/ok.png";
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import { drawLandmarks, drawConnectors } from "@mediapipe/drawing_utils";
import * as cam from "@mediapipe/camera_utils";

function WebcamBox() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const silhouetteRef = useRef(null);
  let camera = null;
  const [correctPosition, setCorrectPosition] = useState(false);
  const [positionToCheck, setPositionToCheck] = useState("FRONT");
  const [frontLandmarks, setFrontLandmarks] = useState([]);
  const [sideLandmarks, setSideLandmarks] = useState([]);
  let silhouetteXLeft = null;
  let silhouetteXRight = null;
  let silhouetteY = null;

  // Position range for every POI (indicates the full body is visible and in position)
  // [xMin , xMax , yMin , yMax]
  const handsRange = [0.35, 0.65];
  const noseMaxY = 0.22;
  const feetMinY = 0.8;

  // processing main function
  function onResults(results) {
    const width = webcamRef.current.video.videoWidth;
    const height = webcamRef.current.video.videoHeight;

    if (results.poseLandmarks) {
      // check for correct position and add results to the appropiate position
      const position = checkCorrectPosition(results, canvasRef);
      // null means wrong position
      if (position === "FRONT" && frontLandmarks.length < 10) {
        setFrontLandmarks((oldLandmarks) => [...oldLandmarks, results]);
        setCorrectPosition(true);
      } else if (position === "SIDE" && sideLandmarks.length < 10) {
        setSideLandmarks((oldLandmarks) => [...oldLandmarks, results]);
        setCorrectPosition(true);
      }

      // Get normalized silhouette points and draw it in canvas
      [silhouetteXLeft, silhouetteXRight, silhouetteY] = drawContourOnCanvas(
        canvasRef,
        results
      );

      // const [anklesAverage, eyesAverage, heightInPx] = getMeasures(results);
      // // draw some measures:
      // const canvasElement = canvasRef.current;
      // const w = canvasRef.current.width;
      // const h = canvasRef.current.height;
      // canvasElement.width = w;
      // canvasElement.height = h;
      // const canvasCtx = canvasElement.getContext("2d");
      // canvasCtx.strokeStyle = "red";
      // canvasCtx.lineWidth = 1;
      // canvasCtx.globalAlpha = 1;
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
      // // [DEBUG] Draw some landmarks
      // canvasCtx.beginPath();
      // canvasCtx.arc(
      //   w - results.poseLandmarks[16].x * w,
      //   results.poseLandmarks[16].y * h,
      //   5,
      //   0,
      //   2 * Math.PI
      // );
      // canvasCtx.fill();
      // canvasCtx.stroke();
      // canvasCtx.strokeStyle = "green";
      // canvasCtx.beginPath();
      // canvasCtx.arc(
      //   w - results.poseLandmarks[15].x * w,
      //   results.poseLandmarks[15].y * h,
      //   5,
      //   0,
      //   2 * Math.PI
      // );
      // canvasCtx.fill();
      // canvasCtx.stroke();
      // canvasCtx.font = "bold 12px Comic Sans MS";
      // canvasCtx.fillStyle = "red";
      // canvasCtx.fillText(
      //   "Left: " + results.poseLandmarks[16].visibility.toFixed(2),
      //   5,
      //   15
      // );
      // canvasCtx.fillStyle = "green";
      // canvasCtx.fillText(
      //   "Right: " + results.poseLandmarks[15].visibility.toFixed(2),
      //   5,
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

  // Executes on every correct position stored to be analized
  useEffect(() => {
    const img = new Image();
    if (positionToCheck === "SIDE") {
      img.src = ghostSide;
    }
    if (positionToCheck === "DONE!") {
      img.src = ok;
    }
    img.onload = () => {
      const canvasElement = canvasRef.current;
      const w = canvasRef.current.width;
      const h = canvasRef.current.height;
      canvasElement.width = w;
      canvasElement.height = h;
      const canvasCtx = canvasElement.getContext("2d");
      canvasCtx.globalAlpha = 0.7;
      canvasCtx.drawImage(img, 0, 0, canvasElement.width, canvasElement.height);
    };

    if (frontLandmarks.length < 6) {
      setPositionToCheck("FRONT");
    } else if (sideLandmarks.length < 6) {
      setPositionToCheck("SIDE");
      console.log("Front side OK, Trying to capture SIDE position");
    } else {
      // done collecting both right FRONT and SIDE position landmarks
      setPositionToCheck("DONE!");
      // [DEBUG] We store results in localstorage to avoid repeating standing in front of the camera
      localStorage.setItem("frontResults", JSON.stringify(frontLandmarks));
      localStorage.setItem("sideResults", JSON.stringify(sideLandmarks));

      // map silhouette points to landmarks and return measurements of interest
      getMeasurements(
        frontLandmarks,
        sideLandmarks,
        silhouetteXLeft,
        silhouetteXRight,
        silhouetteY
      );
    }
  }, [frontLandmarks, sideLandmarks, positionToCheck]);

  // Runs only when mounted (shows camera and ghost and starts processing right away)
  useEffect(() => {
    console.log("renderizando WebcamBox");
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
      canvasCtx.drawImage(img, 0, 0, canvasElement.width, canvasElement.height);

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
          try {
            await pose.send({ image: webcamRef.current.video });
          } catch (e) {
            console.log(e);
          }
        },
        width: 640,
        height: 480,
      });
      camera.start();
    };

    // return () => {
    //   // Stop the camera
    //   (() => {
    //     let stream = webcamRef.current.stream;
    //     const tracks = stream.getTracks();
    //     tracks.forEach((track) => track.stop());
    //     console.log("Stopping camera...");
    //   })();
    // };
  }, []);

  return (
    <div className="container mx-auto">
      <h1 className="font-bold text-center mx-auto text-3xl text-red-800">
        {positionToCheck === "DONE!"
          ? positionToCheck
          : `checking ${positionToCheck} position...`}
      </h1>
      <div className="container mx-auto text-center" position="absolute">
        <Webcam
          ref={webcamRef}
          muted={true}
          mirrored={true}
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
