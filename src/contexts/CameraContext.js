import { createContext, useState } from "react";

const CameraContext = createContext();

export const CameraProvider = ({ children }) => {
  const [processing, setProcessing] = useState(false);
  const [positionToCheck, setPositionToCheck] = useState("FRONT");
  const [landmarks, setLandmarks] = useState({
    front: [],
    side: [],
  });

  const addLandmarks = (results, position) => {
    if (position === "FRONT") {
      setLandmarks(() => landmarks.front.push(results));
    } else if (position === "SIDE") {
      setLandmarks(() => landmarks.front.push(results));
    }
  };

  const setTheProcessing = () => {
    setProcessing((prevState) => !prevState);
  };

  const setThePositionToCheck = (newState) => {
    setPositionToCheck(newState);
  };

  return (
    <CameraContext.Provider
      value={{
        processing,
        setTheProcessing,
        positionToCheck,
        landmarks,
        setThePositionToCheck,
        addLandmarks,
      }}
    >
      {children}
    </CameraContext.Provider>
  );
};

export default CameraContext;
