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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function WebcamBox() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  let camera = null;

  const frontGhost = new Image();
  frontGhost.src = ghostFront;
  const sideGhost = new Image();
  sideGhost.src = ghostSide;

  const [positionToCheck, setPositionToCheck] = useState("FRONT");
  // arrays where measurements in px are stored for correct position frames. They are averaged to reduce error after the capturing phase
  const [frontChest, setFrontChest] = useState([]);
  const [sideChest, setSideChest] = useState([]);
  const [frontWaist, setFrontWaist] = useState([]);
  const [sideWaist, setSideWaist] = useState([]);
  const [frontHip, setFrontHip] = useState([]);
  const [sideHip, setSideHip] = useState([]);

  const [heightInPx, setHeightInPx] = useState([]);

  // Global states. Height in cm is an input, the rest are outputs of this component
  const {
    heightCm,
    setTheChestPerimeterCm,
    setTheWaistPerimeterCm,
    setTheHipPerimeterCm,
    looseness,
    setTheProcessing,
  } = useContext(MeasurementsContext);

  // processing main function
  function onResults(results) {
    const width = webcamRef.current.video.videoWidth;
    const height = webcamRef.current.video.videoHeight;
    canvasRef.current.width = width;
    canvasRef.current.height = height;

    // Settings to draw ghost, segmentation mask and POIs:
    const canvasElement = canvasRef.current;
    canvasElement.width = width;
    canvasElement.height = height;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.globalAlpha = 0.3;
    canvasCtx.fillStyle = "#00FF00"; // color for POIs
    canvasCtx.globalAlpha = 0.7;

    if (results.poseLandmarks) {
      // get chest, waist and hip measurements in pixels to store them if they belong to a correct position
      // if (frontChest.length < 40) {
      //   canvasCtx.drawImage(
      //     frontGhost,
      //     0,
      //     0,
      //     canvasElement.width,
      //     canvasElement.height
      //   );
      // } else if (sideChest.length < 40) {
      //   canvasCtx.drawImage(
      //     sideGhost,
      //     0,
      //     0,
      //     canvasElement.width,
      //     canvasElement.height
      //   );
      // }
      const [chest, waist, hip] = getTorsoMeasurementsInPx(canvasRef, results);
      if (chest === null) return;
      const position = checkCorrectPosition(results, canvasRef);
      if (position === "FRONT" && frontChest.length < 40) {
        setFrontChest((oldState) => [...oldState, chest]);
        setFrontWaist((oldState) => [...oldState, waist]);
        setFrontHip((oldState) => [...oldState, hip]);
        const newHeight = getHeightInPx(results);
        setHeightInPx((oldHeight) => [...oldHeight, newHeight]);
      } else if (position === "SIDE" && sideChest.length < 40) {
        if (sideChest.length === 1) {
          toast.info(`🧑‍🦱 lower your arms and rotate 90° to your right`, {
            position: "bottom-center",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
        setSideChest((oldState) => [...oldState, chest]);
        setSideWaist((oldState) => [...oldState, waist]);
        setSideHip((oldState) => [...oldState, hip]);
      }

      // Drawing segmentation mask
      // canvasCtx.scale(-1, 1);
      // canvasCtx.drawImage(
      //   results.segmentationMask,
      //   0,
      //   0,
      //   -canvasElement.width,
      //   canvasElement.height
      // );
      // canvasCtx.scale(-1, 1);

      // Drawing ghost
      // if (positionToCheck === "FRONT") {
      //   canvasCtx.drawImage(
      //     frontGhost,
      //     0,
      //     0,
      //     canvasElement.width,
      //     canvasElement.height
      //   );
      // }
      // if (positionToCheck === "SIDE") {
      //   canvasCtx.drawImage(
      //     sideGhost,
      //     0,
      //     0,
      //     canvasElement.width,
      //     canvasElement.height
      //   );
      // }
      // if (positionToCheck === "DONE!") {
      //   canvasCtx.drawImage(
      //     ok,
      //     0,
      //     0,
      //     canvasElement.width,
      //     canvasElement.height
      //   );
      // }

      // drawing POIs
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
      canvasCtx.arc(
        // pie
        width * 0.5,
        (anklesAverage + 0.04 * getHeightInPx(results)) * height,
        5,
        0,
        2 * Math.PI
      );
      canvasCtx.fill();
      canvasCtx.stroke();
      canvasCtx.beginPath();
      canvasCtx.arc(
        // cabeza
        width * 0.5,
        (anklesAverage + (-1 + 0.04) * getHeightInPx(results)) * height,
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
    // Settings to draw ghost, segmentation mask and POIs:
    const canvasElement = canvasRef.current;
    canvasElement.width = 640;
    canvasElement.height = 480;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.globalAlpha = 0.3;
    canvasCtx.fillStyle = "#00FF00"; // color for POIs
    canvasCtx.globalAlpha = 0.7;
    if (frontChest.length < 40) {
      setPositionToCheck("FRONT");
    } else if (sideChest.length < 40) {
      setPositionToCheck("SIDE");
      console.log("Front side OK, Trying to capture SIDE position");
    } else {
      // done collecting both right FRONT and SIDE position points of interest in px (chest, waist and hip)
      // Get average of measurements to reduce error
      toast.success(`✅ Done! here are your measurements`, {
        position: "bottom-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
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

      const avgHeight =
        heightInPx.reduce((p, a) => p + a, 0) / heightInPx.length;

      const width = canvasRef.current.width;
      const height = canvasRef.current.height;
      const w_h_ratio = width / height;
      const looseFactor = looseness === 0 ? 0.87 : looseness === 1 ? 0.8 : 0.7;

      const chestPerimeterPx = ellipsePerimeter(
        frontalChestDistance,
        sideChestDistance * looseFactor
      );
      setTheChestPerimeterCm(
        ((w_h_ratio * chestPerimeterPx * heightCm) / avgHeight).toFixed(0)
      );

      const waistPerimeterPx = ellipsePerimeter(
        frontalWaistDistance,
        sideWaistDistance * looseFactor
      );
      setTheWaistPerimeterCm(
        ((w_h_ratio * waistPerimeterPx * heightCm) / avgHeight).toFixed(0)
      );

      const hipPerimeterPx = ellipsePerimeter(
        frontalHipDistance,
        sideHipDistance * looseFactor
      );
      setTheHipPerimeterCm(
        ((w_h_ratio * hipPerimeterPx * heightCm) / avgHeight).toFixed(0)
      );

      setPositionToCheck("DONE!");
      setTheProcessing(false);
    }
  }, [frontChest, sideChest, positionToCheck]);

  // Runs only when mounted (shows camera and ghost and starts processing right away)
  useEffect(() => {
    // Draw a ghostFront and a couple of lines as a reference for the person to position himself
    const canvasElement = canvasRef.current;
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    canvasElement.width = w;
    canvasElement.height = h;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.globalAlpha = 0.7;
    const img = new Image();
    img.src = ghostFront;
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
  }, []);

  return (
    <div className="container mx-auto">
      <h1 className="font-bold text-center mx-auto text-xl text-slate-800">
        {positionToCheck === "FRONT"
          ? "Stand in front of the camera (full body in view, then raise your arms"
          : positionToCheck === "SIDE"
          ? "now, lower your arms and turn rigth 90°"
          : ""}
      </h1>
      {positionToCheck === "FRONT" ? (
        <progress
          className="progress progress-success w-60 h-8"
          value={frontChest.length / 40}
          max="1"
        ></progress>
      ) : (
        <progress
          className="progress progress-success w-60 h-8"
          value={sideChest.length / 40}
          max="1"
        ></progress>
      )}
      <div className="container mx-auto text-center" position="absolute">
        {positionToCheck !== "DONE!" && (
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
    </div>
  );
}

export default WebcamBox;
