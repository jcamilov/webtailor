import "./App.css";
import CameraContext, { CameraProvider } from "./contexts/CameraContext";
import { useContext } from "react";
import WebcamViewer from "./components/WebcamViewer";
import SingleImageViewer from "./components/SingleImageViewer";

function App() {
  const { processing, setTheProcessing } = useContext(CameraContext);

  const onClick = (e) => {
    setTheProcessing();
  };

  return (
    <CameraProvider>
      <div className="App">
        <div className="navbar mb-2 shadow-lg bg-neutral text-neutral-content rounded-box text-justify">
          <span className="text-2xl font-bold text-center mx-auto">
            Mediapipe web tailor
          </span>
        </div>
        <button className="btn btn-neutral" type="button" onClick={onClick}>
          {processing ? "Stop" : "Start"} camera
        </button>
        {processing ? <WebcamViewer /> : <p>It takes 5 seconds to load</p>}
      </div>
    </CameraProvider>
  );
}

export default App;
