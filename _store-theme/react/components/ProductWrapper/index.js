import React, { useEffect } from "react";
import useProduct from "vtex.product-context/useProduct";

import "./styles";

const ProductWrapper = props => {
  const context = useProduct();

  const { children } = props;
  const { itemId } = context.selectedItem;

  return (
    <div className={"product-wrapper"}>
      {itemId == "39" ? (
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/5t2MXGFLy7M"
          frameborder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      ) : (
        children 
      )}
    </div>
  );
};

export default ProductWrapper;
