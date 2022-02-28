import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WebcamBox from "./components/WebcamBox";
import InputForm from "./components/InputForm";
import ResultingMeasurements from "./components/ResultingMeasurements";
import FakeStore from "./components/FakeStore";
import { useEffect, useState, useContext } from "react";
import MeasurementsContext from "./contexts/MeasurementsContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const {
    chestPerimeterCm,
    heightCm,
    setHeightCm,
    processing,
    suggestedSize,
    showFakeStore,
  } = useContext(MeasurementsContext);
  const [openWebTailor, setOpenWebTailor] = useState(false);

  return (
    <Router>
      <div className="App">
        <div className="navbar mb-2 shadow-lg bg-neutral text-neutral-content rounded-box text-justify">
          <span className="text-2xl font-bold text-center mx-auto">
            AI based size recommender
          </span>
        </div>
        {showFakeStore && <FakeStore></FakeStore>}
        {showFakeStore === false && !processing && chestPerimeterCm === 0 && (
          <InputForm />
        )}
        {showFakeStore === false &&
        processing === true &&
        chestPerimeterCm === 0 ? (
          <WebcamBox />
        ) : (
          ""
        )}
        {showFakeStore === false && chestPerimeterCm !== 0 ? (
          <ResultingMeasurements />
        ) : (
          ""
        )}
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
