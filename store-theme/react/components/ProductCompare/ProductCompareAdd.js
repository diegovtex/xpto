import React from "react";
import { Checkbox } from "vtex.styleguide";
import { useProductSummary } from "vtex.product-summary-context/ProductSummaryContext";
import { path } from "ramda";

import { ProductCompareContext } from "./ProductCompareWrapper";
import styles from "./styles.css";

const ProductCompareAdd = (props) => {
  const context = React.useContext(ProductCompareContext);
  const productContext = useProductSummary();

  // const { selectedItem } = productContext;

  const selectedItem =
    path(["product", "items", 0], productContext) || productContext.product.sku;

  const { setItems, removeItem, items, maxItems } = context;

  const alreadyAdded = () => {
    if (items) {
      const check = items.filter((item) => item.itemId == selectedItem.itemId);
      return check.length ? true : false;
    }
    return false;
  };

  const isMax = () => {
    return items.length >= maxItems;
  };

  const preventDefault = (event) => {
    event.preventDefault();
    event.stopPropagation();

    console.log("Limit reachead");
  };

  return (
    <div className={styles["product-compare-add"]} onClick={(e) => preventDefault(e)}>
      {!alreadyAdded() ? (
        isMax() ? (
          <div
            className="pa3 br2 bg-disabled hover-bg-disabled c-on-disabled active-c-on-disabled primary dib mr3"
            onClick={(event) => preventDefault(event)}
          >
            Limit of {maxItems} comparison
          </div>
        ) : (
          <>
            <Checkbox
              checked={alreadyAdded()}
              id="option-0"
              label="Compare"
              name="default-checkbox-group"
              onChange={(event) => setItems(event, selectedItem)}
              value="option-0"
            />
          </>
        )
      ) : (
        <Checkbox
          checked={alreadyAdded()}
          id="option-0"
          label="Remove compare"
          name="default-checkbox-group"
          onChange={(event) => removeItem(event, selectedItem)}
          value="option-0"
        />
      )}
    </div>
  );
};

export default ProductCompareAdd;
