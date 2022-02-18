import React, { useEffect, useContext } from "react";
import CameraContext, { CameraProvider } from "../contexts/CameraContext";

function InputForm() {
  const { processing, setTheProcessing } = useContext(CameraContext);

  useEffect(() => {
    console.log("renderizando InputForm");
  });

  return (
    <div className="card w-96 bg-base-100 shadow-xl mx-auto my-5">
      <div className="card-body">
        <p className="text-xl py-2">Ingresa tu estatura en centimetros</p>
        <input
          type="text"
          placeholder="175"
          className="input input-bordered input-info input-sm w-1/4 mx-auto text-center"
        ></input>
      </div>
    </div>
  );
}

export default InputForm;
