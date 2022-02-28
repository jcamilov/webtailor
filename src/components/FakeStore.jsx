import React, { useContext } from "react";
import tshirts from "../assets/tshirts.png";
import MeasurementsContext from "../contexts/MeasurementsContext";
import { Link } from "react-router-dom";

function FakeStore() {
  const { suggestedSize, setTheSuggestedSize, setTheShowFakeStore } =
    useContext(MeasurementsContext);

  const onClick = () => {
    // open the webtailor page
    setTheShowFakeStore(false);
  };

  return (
    <>
      <p className="text-left">Home > Clothing > Men Clothing > Tshirts</p>
      <div className="columns-2 text-left">
        <img src={tshirts} alt="tshirts" />
        <div className="container">
          <h1 className="text-left font-bold">Louis Phillips</h1>
          <div className="text-left py-3">
            Men Navy Blue Polo Collar Slim Fit T-shirt
          </div>
          <div className="text-left py-5">
            <div className="badge badge-outline">men</div>
            <div className="badge badge-primary badge-outline">shirts</div>
            <div className="badge badge-primary badge-outline">sport</div>
          </div>
          <div className="container py-10">
            <h2 className="font-bold text-left">USD 34.00</h2>
            <p className="text-xs text-left line-through text-yellow-500">
              USD 34.00
            </p>
          </div>

          <div display="inline">
            <p>Select your size or</p>
            <button
              className="btn btn-xs btn-outline btn-error gap-2"
              onClick={onClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              get recommended size
            </button>
          </div>
          <div className="btn-group py-5 ">
            <input
              type="radio"
              name="options"
              data-title="s"
              checked={suggestedSize === "s" ? "checked" : ""}
              className="btn"
            />
            <input
              type="radio"
              name="options"
              data-title="m"
              checked={suggestedSize === "m" ? "checked" : ""}
              className="btn"
            />
            <input
              type="radio"
              name="options"
              data-title="l"
              checked={suggestedSize === "l" ? "checked" : ""}
              className="btn"
            />
            <input
              type="radio"
              name="options"
              data-title="xl"
              checked={suggestedSize === "xl" ? "checked" : ""}
              className="btn"
            />
          </div>
          <button className="btn btn-error text-left">Add to cart</button>
        </div>
      </div>
    </>
  );
}

export default FakeStore;
