import React, { useEffect, useState } from 'react'
import { useProductSummary } from 'vtex.product-summary-context/ProductSummaryContext'
import { Spinner } from 'vtex.styleguide'


const ProductWishlist = ({ children }) => {

  const { product, isLoading } = useProductSummary()

  if (isLoading) return <Spinner />

  const [{ itemId: skuId }] = product.product ? product.product.items : product.items

  console.log("Sku", skuId);
  console.log("Product", product);

  return (
    <div style={{width: '100%'}}>
      {React.cloneElement(React.Children.toArray(children)[0], { skuId: skuId, type: "button" })}
    </div>
  );
}

export default ProductWishlist