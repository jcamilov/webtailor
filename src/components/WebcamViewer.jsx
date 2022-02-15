import React, { useEffect, useRef, useContext } from "react";
import Webcam from "react-webcam";
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import { drawLandmarks, drawConnectors } from "@mediapipe/drawing_utils";
import * as cam from "@mediapipe/camera_utils";
import CameraContext from "../contexts/CameraContext";
import { drawContourOnCanvas, checkCorrectPosition } from "../helpers";

function WebcamViewer() {
  // states and references
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const outputCanvasRef = useRef(null);
  let camera = null;
  const { processing } = useContext(CameraContext);

  // processing main function
  function onResults(results) {
    const width = webcamRef.current.video.videoWidth;
    const height = webcamRef.current.video.videoHeight;
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    const canvasElement = canvasRef.current;
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

      // drawing contour over the mask
      outputCanvasRef.current.width = width;
      outputCanvasRef.current.height = height;
      drawContourOnCanvas(canvasRef, outputCanvasRef);

      // draw red or green border according to wrong or right position
      checkCorrectPosition(results, outputCanvasRef);
    }
  }

  // on mounting and unmounting the component
  useEffect(() => {
    if (processing) {
      let stream = webcamRef.current.stream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      console.log("stopping camera.");
      return;
    }
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

    // initialize camera
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      console.log(`opening camera`);
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await pose.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
      console.log(`camera started`);
    } else {
      console.log("camera not ready");
    }
  }, [processing]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Webcam
        ref={webcamRef}
        muted={true}
        style={{
          width: 640,
          height: 480,
        }}
      />
      <canvas
        id="inputCanvas"
        ref={canvasRef}
        style={{
          width: 640,
          height: 480,
        }}
      />
      <canvas
        id="resultCanvas"
        ref={outputCanvasRef}
        style={{
          width: 640,
          height: 480,
        }}
      />
    </div>
  );
}

export default WebcamViewer;
