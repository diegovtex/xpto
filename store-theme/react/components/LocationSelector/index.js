import React, { useState, useEffect } from "react";
import { Tag, Spinner, IconEdit } from "vtex.styleguide";
import { useOrderForm } from "vtex.store-resources/OrderFormContext";
import LocationSelector from "./components/LocationSelector";
import { withLocation } from "../LocationProvider";
import { path } from "ramda";
const LocationLabel = ({
  locations,
  currentLocation,
  setAvailableLocations,
  ...props
}) => {
  const { orderForm, loading } = useOrderForm();
  const [showSelector, setShowSelector] = useState(false);

  const getPOCLabel = () => {
    const sector = window.localStorage.getItem("sector");
    const parsedLocation = JSON.parse(sector);
    console.log("props locations", parsedLocation);
    return `${path(["location"], parsedLocation) || "Unlocalized"}`;
  };

  useEffect(() => {
    const sector = window.localStorage.getItem("sector");
    if (!sector) {
      setShowSelector(true);
    } 
  }, [orderForm, loading]);

  useEffect(() => {
    setAvailableLocations(locations);
  }, [orderForm, loading]);

  return (
    <div className="mr5 flex items-center">
      <Tag type="success">
        {!loading && (
          <span className="pointer" onClick={() => setShowSelector(true)}>
            Store: {getPOCLabel()} <IconEdit size="10" />
          </span>
        )}
        {loading && <Spinner size="10" />}
      </Tag>
      <LocationSelector
        locations={props.locations}
        showSelector={showSelector}
        handleClose={() => setShowSelector(false)}
      />
    </div>
  );
};
LocationLabel.schema = {
  title: "Location Switcher",
  description: "Location Switcher",
  type: "object",
  properties: {
    locations: {
      items: {
        title: "Locations",
        type: "object",
        properties: {
          locations: {
            currencies: {
              title: "Currencies",
              type: "object",
              properties: {
                currencyCode: {
                  default: "USD",
                  title: "Currency Code",
                  type: "string",
                },
                salesChannel: {
                  default: "1",
                  title: "SC",
                  type: "string",
                },
              },
            },
            minItems: 1,
            title: "Currencie codes",
            type: "array",
            default: [],
          },
          location: {
            default: "Sector 1",
            title: "Location",
            type: "string",
          },
        },
      },
      minItems: 1,
      title: "List items",
      type: "array",
      default: [],
    },
  },
};

export default withLocation(LocationLabel);
