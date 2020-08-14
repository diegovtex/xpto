import React from "react";
import { Dropdown, Spinner } from "vtex.styleguide";
import { withLocation } from "../../../LocationProvider";
import { path } from "ramda";
const LocationPOC = ({
  availableLocations,
  currentLocation,
  updateSalesChannel,
  loading,
  setNewCurrentLocation,
  ...props
}) => {
  const [location, setLocation] = React.useState("");
  const [changing, setChanging] = React.useState(false);
  React.useEffect(() => {
    const sector = window.localStorage.getItem("sector");
    if (sector) {
      const parsedLocation = JSON.parse(sector);
      setLocation({
        location: parsedLocation.location,
        currencies: parsedLocation.currencies,
      });
    }
  }, [loading]);

  const changeSector = (e, location) => {
    console.log("Ue:", changing);
    setLocation(location);
    const parsedLocation = JSON.parse(location);
    const locationObj = {
      ...parsedLocation,
      currency: parsedLocation.currencies[0],
    };
    setNewCurrentLocation(locationObj);
    window.localStorage.setItem("sector", JSON.stringify(locationObj));
  }

  const handleChange = (e, location) => {
    setChanging(true);
    changeSector(e, location)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const options = () => {
    const opts = availableLocations.map(loc => {
      return {
        value: JSON.stringify(loc),
        label: loc.location,
      }
    })
    return opts;
  };

  console.log("Location: ", location);
  console.log("Location: ", changing);
  return (
    <div className="w-100">
      {changing ? (
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <Dropdown
          label="Choose a store"
          default="teste"
          size="small"
          options={options()}
          value={Object.keys(location).length ? JSON.stringify(location) : location}
          onChange={handleChange}
        />
      )}
    </div>
  );
};

export default withLocation(LocationPOC);
