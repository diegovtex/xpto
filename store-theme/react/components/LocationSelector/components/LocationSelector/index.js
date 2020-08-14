import React from "react";
import { Modal } from "vtex.styleguide";

import LocationPOC from "../LocationPOC";

const LocationSelector = (props) => {
  const { showSelector, handleClose } = props;

  return (
    <Modal centered isOpen={showSelector} onClose={handleClose}>
      <LocationPOC locations={props.locations} />
    </Modal>
  );
};

export default LocationSelector;
