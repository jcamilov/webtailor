import { createContext, useState } from "react";

const CameraContext = createContext();

export const CameraProvider = ({ children }) => {
  const [processing, setProcessing] = useState(false);

  const setTheProcessing = () => {
    setProcessing((prevState) => !prevState);
  };

  return (
    <CameraContext.Provider value={{ processing, setTheProcessing }}>
      {children}
    </CameraContext.Provider>
  );
};

export default CameraContext;
