import React, { useState, useRef, useEffect, useContext } from "react";
import Webcam from "react-webcam";
import {
  checkCorrectPosition,
  getHeightInPx,
  getTorsoMeasurementsInPx,
} from "../helpers";
import ghostFront from "../assets/ghostFront.png";
import ghostSide from "../assets/ghostSide.png";
import ok from "../assets/ok.png";
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
// import { drawLandmarks, drawConnectors } from "@mediapipe/drawing_utils";
import * as cam from "@mediapipe/camera_utils";
import MeasurementsContext from "../contexts/MeasurementsContext";

function WebcamBox() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const silhouetteRef = useRef(null);
  let camera = null;
  const [correctPosition, setCorrectPosition] = useState(false);
  const [positionToCheck, setPositionToCheck] = useState("FRONT");
  const [frontLandmarks, setFrontLandmarks] = useState([]);
  const [frontChest, setFrontChest] = useState([]);
  const [sideChest, setSideChest] = useState([]);
  const [frontWaist, setFrontWaist] = useState([]);
  const [sideWaist, setSideWaist] = useState([]);
  const [frontHip, setFrontHip] = useState([]);
  const [sideHip, setSideHip] = useState([]);
  const [heightInPx, setHeightInPx] = useState([]);
  const [avgHeightInPx, setAvgHeightInPx] = useState(0);

  const {
    chestPerimeter,
    setTheChestPerimeter,
    waistPerimeter,
    setTheWaistPerimeter,
    hipPerimeter,
    setTheHipPerimeter,
    height,
  } = useContext(MeasurementsContext);

  // Position range for every POI (indicates the full body is visible and in position)
  // [xMin , xMax , yMin , yMax]
  const handsRange = [0.35, 0.65];
  const noseMaxY = 0.22;
  const feetMinY = 0.8;

  // processing main function
  function onResults(results) {
    const width = webcamRef.current.video.videoWidth;
    const height = webcamRef.current.video.videoHeight;
    canvasRef.current.width = width;
    canvasRef.current.height = height;

    if (results.poseLandmarks) {
      // get chest, waist and hip measurements
      const [chest, waist, hip] = getTorsoMeasurementsInPx(canvasRef, results);
      // check for correct position and add results to the appropiate position
      const position = checkCorrectPosition(results, canvasRef);
      // null means wrong position
      // if (position === "FRONT" && frontLandmarks.length < 10) {
      if (position === "FRONT" && frontChest.length < 10) {
        setFrontChest((oldState) => [...oldState, chest]);
        setFrontWaist((oldState) => [...oldState, waist]);
        setFrontHip((oldState) => [...oldState, hip]);
        const newHeight = getHeightInPx(results);
        setHeightInPx((oldHeight) => [...oldHeight, newHeight]);
        setCorrectPosition(true);
      } else if (position === "SIDE" && sideChest.length < 10) {
        setSideChest((oldState) => [...oldState, chest]);
        setSideWaist((oldState) => [...oldState, waist]);
        setSideHip((oldState) => [...oldState, hip]);
        setCorrectPosition(true);
      }

      // All of these just to draw:
      const canvasElement = canvasRef.current;
      canvasElement.width = width;
      canvasElement.height = height;
      const canvasCtx = canvasElement.getContext("2d");
      canvasCtx.beginPath();
      canvasCtx.arc(
        width - chest.left.x * width,
        chest.left.y * height,
        3,
        0,
        2 * Math.PI
      );
      canvasCtx.fill();
      canvasCtx.stroke();
      canvasCtx.beginPath();
      canvasCtx.arc(
        width - chest.right.x * width,
        chest.right.y * height,
        3,
        0,
        2 * Math.PI
      );
      canvasCtx.fill();
      canvasCtx.stroke();
      canvasCtx.beginPath();
      canvasCtx.arc(
        width - waist.left.x * width,
        waist.left.y * height,
        3,
        0,
        2 * Math.PI
      );
      canvasCtx.fill();
      canvasCtx.stroke();
      canvasCtx.beginPath();
      canvasCtx.arc(
        width - waist.right.x * width,
        waist.right.y * height,
        3,
        0,
        2 * Math.PI
      );
      canvasCtx.fill();
      canvasCtx.stroke();
      canvasCtx.beginPath();
      canvasCtx.arc(
        width - hip.left.x * width,
        hip.left.y * height,
        3,
        0,
        2 * Math.PI
      );
      canvasCtx.fill();
      canvasCtx.stroke();
      canvasCtx.beginPath();
      canvasCtx.arc(
        width - hip.right.x * width,
        hip.right.y * height,
        3,
        0,
        2 * Math.PI
      );
      canvasCtx.fill();
      canvasCtx.stroke();

      // drawign height:
      const anklesAverage =
        (results.poseLandmarks[29].y + results.poseLandmarks[30].y) / 2;
      canvasCtx.beginPath();
      canvasCtx.arc(width * 0.5, anklesAverage * height, 5, 0, 2 * Math.PI);
      canvasCtx.fill();
      canvasCtx.stroke();
      canvasCtx.beginPath();
      canvasCtx.arc(
        width * 0.5,
        (anklesAverage - getHeightInPx(results)) * height,
        5,
        0,
        2 * Math.PI
      );
      canvasCtx.fill();
      canvasCtx.stroke();
    }
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

    if (frontChest.length < 10) {
      setPositionToCheck("FRONT");
    } else if (sideChest.length < 10) {
      setPositionToCheck("SIDE");
      console.log("Front side OK, Trying to capture SIDE position");
    } else {
      // done collecting both right FRONT and SIDE position silhouette points
      // Get average of measurements and update State for other components to use them
      const frontalChestDistance =
        frontChest
          .map((c) => c.right.x - c.left.x)
          .reduce((prev, acc) => prev + acc, 0) / frontChest.length;
      const sideChestDistance =
        sideChest
          .map((c) => c.right.x - c.left.x)
          .reduce((prev, acc) => prev + acc, 0) / sideChest.length;

      const frontalWaistDistance =
        frontWaist
          .map((c) => c.right.x - c.left.x)
          .reduce((prev, acc) => prev + acc, 0) / frontWaist.length;
      const sideWaistDistance =
        sideWaist
          .map((c) => c.right.x - c.left.x)
          .reduce((prev, acc) => prev + acc, 0) / sideWaist.length;

      const frontalHipDistance =
        frontHip
          .map((c) => c.right.x - c.left.x)
          .reduce((prev, acc) => prev + acc, 0) / frontHip.length;
      const sideHipDistance =
        sideHip
          .map((c) => c.right.x - c.left.x)
          .reduce((prev, acc) => prev + acc, 0) / sideHip.length;

      const ellipsePerimeter = (largestRadious, smallestRadious) => {
        // Applying Rumanujan's approximate perimiter of an ellipse
        // P ≈ π (a + b) [ 1 + (3h) / (10 + √(4 - 3h) ) ], where h = (a - b)^2/(a + b)^2
        // a being the largest radious
        const a = largestRadious / 2;
        const b = smallestRadious / 2;
        const h = (a - b) ** 2 / (a + b) ** 2;
        return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
      };

      // [TO IMPOROVE]: I'm multiplying by a (try and error) factor 'cause i'm getting smaller measuremntes than the real ones
      const chest = ellipsePerimeter(frontalChestDistance, sideChestDistance);
      setTheChestPerimeter(chest * 1.25);
      const waist = ellipsePerimeter(frontalWaistDistance, sideWaistDistance);
      setTheWaistPerimeter(waist * 1.25);
      const hip = ellipsePerimeter(frontalHipDistance, sideHipDistance);
      setTheHipPerimeter(hip * 1.2);

      setAvgHeightInPx(
        heightInPx.reduce((p, a) => p + a, 0) / heightInPx.length
      );

      setPositionToCheck("DONE!");
    }
  }, [frontChest, sideChest, positionToCheck]);

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
        smoothSegmentation: true,
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
      <h1 className="font-bold text-center mx-auto text-3xl text-slate-800">
        {positionToCheck === "DONE!"
          ? positionToCheck
          : `checking ${positionToCheck} position...`}
      </h1>
      {chestPerimeter !== null ? (
        <h1 className="font-bold text-center mx-auto text-3xl text-red-800">
          {`Chest perimeter: ${(
            (chestPerimeter * height) /
            avgHeightInPx
          ).toFixed(0)} (in cm)`}
        </h1>
      ) : (
        ""
      )}
      {chestPerimeter !== null ? (
        <h1 className="font-bold text-center mx-auto text-3xl text-red-800">
          {`Waist perimeter: ${(
            (waistPerimeter * height) /
            avgHeightInPx
          ).toFixed(0)} (in cm)`}
        </h1>
      ) : (
        ""
      )}
      {chestPerimeter !== null ? (
        <h1 className="font-bold text-center mx-auto text-3xl text-red-800">
          {`Hip perimeter: ${((hipPerimeter * height) / avgHeightInPx).toFixed(
            0
          )} (in cm)`}
        </h1>
      ) : (
        ""
      )}
      <div className="container mx-auto text-center" position="absolute">
        {chestPerimeter === null ? (
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
        ) : (
          ""
        )}
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
