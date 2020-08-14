import React from "react";
import { ExtensionPoint } from "vtex.render-runtime";
import { useProduct } from "vtex.product-context";
import { path } from "ramda";
const Adulthood = () => {
  const { product } = useProduct();
  const { specificationGroups } = product;
  console.log('Adulthood', specificationGroups)
  if (specificationGroups) {
    const allSpecifications = specificationGroups.find(
      (specification) => specification.name === "allSpecifications"
    );
    if (allSpecifications) {
      const specifications = path(["specifications"], allSpecifications);
      console.log('specifications', specifications);
      if (specifications) {
        const ageRestrictionSpec = specifications.find(
          (spec) => spec.name === "Age restriction"
        );
        const ageRestriction = path(["values", "0"], ageRestrictionSpec);
        if (ageRestriction) {
          console.log('ageRestriction', ageRestriction);
          if (
            ageRestriction === "Yes" ||
            ageRestriction === "yes" ||
            ageRestriction === true
          ) {
            return <ExtensionPoint id="adulthood-modal" />;
          }
        }
      }
    }
  }
  return null;
};

export default Adulthood;
