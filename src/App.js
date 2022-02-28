import "./App.css";
import WebcamBox from "./components/WebcamBox";
import InputForm from "./components/InputForm";
import ResultingMeasurements from "./components/ResultingMeasurements";
import { useEffect, useState, useContext } from "react";
import MeasurementsContext from "./contexts/MeasurementsContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { chestPerimeterCm, heightCm, setHeightCm, processing } =
    useContext(MeasurementsContext);

  return (
    <div className="App">
      <div className="navbar mb-2 shadow-lg bg-neutral text-neutral-content rounded-box text-justify">
        <span className="text-2xl font-bold text-center mx-auto">
          Mediapipe web tailor
        </span>
      </div>
      {!processing && chestPerimeterCm === 0 && <InputForm />}
      <div className="grid grid-cols-1 gap-4">
        {processing && <WebcamBox />}
      </div>
      <div className="grid grid-cols-1 gap-4">
        {chestPerimeterCm !== 0 ? <ResultingMeasurements /> : ""}
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
