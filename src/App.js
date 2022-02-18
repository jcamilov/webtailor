import "./App.css";
import CameraContext, { CameraProvider } from "./contexts/CameraContext";
import { useContext } from "react";
import WebcamBox from "./components/WebcamBox";
import InputForm from "./components/InputForm";
import { useEffect } from "react";

function App() {
  const { processing, setTheProcessing } = useContext(CameraContext);

  const onClickEmpezar = (e) => {
    setTheProcessing();
  };

  useEffect(() => {
    console.log("iniciando app");
  }, [processing]);

  return (
    <CameraProvider>
      <div className="App">
        <div className="navbar mb-2 shadow-lg bg-neutral text-neutral-content rounded-box text-justify">
          <span className="text-2xl font-bold text-center mx-auto">
            Mediapipe web tailor
          </span>
        </div>
        <InputForm evento={onClickEmpezar} />
        <button
          className="btn btn-neutral btn-sm "
          type="button"
          onClick={onClickEmpezar}
        >
          {processing ? "Stop" : "Start"} processing
        </button>
        <div className="grid grid-cols-1 gap-4">
          <WebcamBox processing={processing} />
        </div>
      </div>
    </CameraProvider>
  );
}

export default App;
