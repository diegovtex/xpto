import React from "react";
import { useProduct } from "vtex.product-context";
import { path } from "ramda";
import { Button } from "vtex.styleguide";
const CustomBuyButton = ({ children, ...props }) => {
  const { product, selectedQuantity } = useProduct();
  const { specificationGroups } = product;

  const childrenWithProps = children.map((child) =>
    React.cloneElement(child, props)
  );
  if (specificationGroups) {
    const allSpecifications = specificationGroups.find(
      (specification) => specification.name === "allSpecifications"
    );
    if (allSpecifications) {
      const specifications = path(["specifications"], allSpecifications);
      if (specifications) {
        const minQuantitySpec = specifications.find(
          (spec) => spec.name === "Min quantity"
        );
        const maxQuantitySpec = specifications.find(
          (spec) => spec.name === "Max quantity"
        );
        const minQuantity = path(["values", "0"], minQuantitySpec);
        const maxQuantity = path(["values", "0"], maxQuantitySpec);
        if (minQuantity) {
          if (minQuantity > selectedQuantity) {
            return (
              <Button disabled>
                Add {minQuantity - selectedQuantity} more item(s)
              </Button>
            );
          }
        }
        if (maxQuantity) {
          if (maxQuantity < selectedQuantity) {
            return (
              <Button disabled>
                Remove {selectedQuantity - maxQuantity} item(s)
              </Button>
            );
          }
        }
      }
    }
  }
  return childrenWithProps;
};
export default CustomBuyButton;
