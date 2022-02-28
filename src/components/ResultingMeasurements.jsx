import React, { useContext } from "react";
import MeasurementsContext from "../contexts/MeasurementsContext";

function ResultingMeasurements() {
  const {
    chestPerimeterCm,
    waistPerimeterCm,
    hipPerimeterCm,
    setTheShowFakeStore,
    setTheSuggestedSize,
  } = useContext(MeasurementsContext);

  const onClick = () => {
    setTheSuggestedSize("m");
    setTheShowFakeStore(true);
  };

  return (
    <div>
      <h6 className="text-3xl my-8">Here are your meausrements 🙂</h6>
      <div className="shadow stats">
        <div className="stat">
          <div className="stat-figure text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <div className="stat-title">Chest</div>
          <div className="stat-value">{chestPerimeterCm} cm</div>
          <div className="stat-desc">+/-2% error</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              ></path>
            </svg>
          </div>
          <div className="stat-title">Waist</div>
          <div className="stat-value">{waistPerimeterCm} cm</div>
          <div className="stat-desc">+/-2% error</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              ></path>
            </svg>
          </div>
          <div className="stat-title">Hip</div>
          <div className="stat-value">{hipPerimeterCm} cm</div>
          <div className="stat-desc">+/-2% error</div>
        </div>
      </div>
      <h6 className="text-3xl my-8">
        For this item, your best fit is the size
      </h6>
      <h6 className="text-7xl font-bold my-8">M</h6>
      <button className="btn btn-xs" onClick={onClick}>
        {" "}
        Back to item
      </button>
    </div>
  );
}

export default ResultingMeasurements;
