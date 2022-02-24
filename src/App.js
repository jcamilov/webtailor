import "./App.css";
import WebcamBox from "./components/WebcamBox";
import InputForm from "./components/InputForm";
import { useEffect, useState } from "react";
import { MeasurementsProvider } from "./contexts/MeasurementsContext";

function App() {
  const [processing, setProcessing] = useState(false);

  const onClickEmpezar = (e) => {
    setProcessing((prevState) => !prevState);
  };

  useEffect(() => {
    console.log("iniciando app");
  }, [processing]);

  return (
    <MeasurementsProvider>
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
          {processing && <WebcamBox />}
        </div>
      </div>
    </MeasurementsProvider>
  );
}

export default App;
