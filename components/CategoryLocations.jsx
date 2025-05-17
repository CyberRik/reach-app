import React from "react";
import Marker from "./marker";

function CategoryLocations({ results }) {
  return (
    <>
      {results.map(([category, places]) =>
        places.map((place, index) => (
          <Marker place={place} category={category} key={index} />
        ))
      )}
    </>
  );
}

export default CategoryLocations;
