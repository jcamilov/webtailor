import React, { useEffect, useRef } from "react";
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import { drawLandmarks, drawConnectors } from "@mediapipe/drawing_utils";
import * as cam from "@mediapipe/camera_utils";
import hombre from "../assets/hombre.jpg";

function SingleImageViewer() {
  const picRef = useRef(null);
  const canvasRef = useRef(null);
  let camera = null;

  // processing main function
  function onResults(results) {
    console.log(results);
    canvasRef.current.width = picRef.current.video.videoWidth;
    canvasRef.current.height = picRef.current.video.videoHeight;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
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
  }

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });

    pose.setOptions({
      modelComplexity: 2,
      static_image_mode: true,
      smoothLandmarks: true,
      enableSegmentation: true,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResults);
    console.log(picRef.current);
    const foto = createImageBitmap(picRef.current, 0, 0, 453, 680);
    pose.send({ image: picRef });

    console.log(`camera started`);
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      <img
        ref={picRef}
        src="https://c.pxhere.com/photos/36/91/brett_lark_cancer_cure_model_confident_inspiring_strong-691314.jpg!d"
        alt="hombre"
      />
      <canvas
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
