import { useState, createContext } from "react";

const MeasurementsContext = createContext();

export const MeasurementsProvider = ({ children }) => {
  const [chestPerimeter, setChestPerimeter] = useState(null);
  const [waistPerimeter, setWaistPerimeter] = useState(null);
  const [hipPerimeter, setHipPerimeter] = useState(null);

  const [height, setHeight] = useState(175);

  const setTheChestPerimeter = (value) => setChestPerimeter(value);
  const setTheWaistPerimeter = (value) => setWaistPerimeter(value);
  const setTheHipPerimeter = (value) => setHipPerimeter(value);
  const setTheHeight = (value) => setHeight(value);

  return (
    <MeasurementsContext.Provider
      value={{
        chestPerimeter,
        waistPerimeter,
        hipPerimeter,
        height,
        setTheChestPerimeter,
        setTheWaistPerimeter,
        setTheHipPerimeter,
        setTheHeight,
      }}
    >
      {children}
    </MeasurementsContext.Provider>
  );
};

export default MeasurementsContext;
