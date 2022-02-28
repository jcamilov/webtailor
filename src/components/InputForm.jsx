import React, { useEffect, useContext, useState } from "react";
import MeasurementsContext from "../contexts/MeasurementsContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function InputForm() {
  const { heightCm, setTheHeightCm, setTheLooseness, setTheProcessing } =
    useContext(MeasurementsContext);
  const [step, setStep] = useState("next");
  const [loose, setLoose] = useState(0);

  const onChange = (ev) => {
    /// AQUI!!!! actualizar este estado al valor del input
    setTheHeightCm(Number(ev.target.value));
  };

  const onClickNext = (ev) => {
    if (step === "next" && heightCm > 0 && heightCm < 210) {
      setStep("start");
    }
    if (step === "next" && heightCm < 0) {
      toast.error(`💥 Not acceptable height`, {
        position: "bottom-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    if (step === "start") {
      // set global state to processing
      setTheProcessing(true);
    }
  };

  const onChangeSlider = (e) => {
    setLoose(e.target.value);
    setTheLooseness(e.target.value);
  };

  useEffect(() => {
    console.log("renderizando InputForm");
  });

  return (
    <div className="card w-96 bg-base-100 shadow-xl mx-auto my-5">
      <ul className="steps">
        {<li className="step step-neutral"></li>}
        <li
          className={`step ${
            heightCm > 0 && step === "start" ? "step-neutral" : ""
          }`}
        ></li>
      </ul>
      <div className="card-body">
        <div className="form-control mx-auto text-center">
          <label className="label">
            <span className="label-text">
              {step === "start"
                ? "How tight are the clothes you are wearing?"
                : "What is your heigth in centimiters?"}
            </span>
          </label>
          {step === "next" && (
            <label className="input-group py-8">
              <span>cm</span>
              <input
                type="number"
                placeholder="174"
                className="input input-bordered"
                onChange={onChange}
              />
            </label>
          )}
          {step === "start" && (
            <div className="py-9">
              <input
                type="range"
                min="0"
                max="2"
                value={loose}
                className="range"
                step="1"
                onChange={onChangeSlider}
              />

              <div className="w-full flex justify-between text-xs px-2">
                <span>tight</span>
                <span>regular</span>
                <span>loose</span>
              </div>
            </div>
          )}
          <button
            className={`btn btn-neutral btn-sm w-full ${
              heightCm > 0 ? "" : "btn-disabled"
            }`}
            type="button"
            onClick={onClickNext}
          >
            {step}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InputForm;
