import { useState, createContext } from "react";

const MeasurementsContext = createContext();

export const MeasurementsProvider = ({ children }) => {
  // These are the input (height) and the resulting measurements (all in cm) to be displayed
  const [heightCm, setHeightCm] = useState(175); //must be 0, 175 is for debugging
  const [chestPerimeterCm, setChestPerimeterCm] = useState(0);
  const [waistPerimeterCm, setWaistPerimeterCm] = useState(0);
  const [hipPerimeterCm, setHipPerimeterCm] = useState(0);
  const [looseness, setLooseness] = useState(0); // 0:tight, 1:regular, 2:loose
  const [processing, setProcessing] = useState(false); // true to start camera and processing

  const setTheChestPerimeterCm = (value) => setChestPerimeterCm(value);
  const setTheWaistPerimeterCm = (value) => setWaistPerimeterCm(value);
  const setTheHipPerimeterCm = (value) => setHipPerimeterCm(value);
  const setTheHeightCm = (value) => setHeightCm(value);
  const setTheLooseness = (value) => setLooseness(value);
  const setTheProcessing = (value) => setProcessing(value);

  return (
    <MeasurementsContext.Provider
      value={{
        heightCm,
        chestPerimeterCm,
        waistPerimeterCm,
        hipPerimeterCm,
        looseness,
        processing,
        setTheHeightCm,
        setTheChestPerimeterCm,
        setTheWaistPerimeterCm,
        setTheHipPerimeterCm,
        setTheLooseness,
        setTheProcessing,
      }}
    >
      {children}
    </MeasurementsContext.Provider>
  );
};

export default MeasurementsContext;
