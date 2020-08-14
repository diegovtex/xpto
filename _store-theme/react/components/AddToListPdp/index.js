import React, { useEffect, useState } from 'react'
import { Spinner } from 'vtex.styleguide'
import { ProductContext } from 'vtex.product-context'

const AddToList = ({ children }) => {
    const productContext = React.useContext(ProductContext)
    const { product } = productContext

    const [{ itemId: skuId }] = product.product ? product.product.items : product.items

    console.log("Sku", skuId);
    console.log("Product", product);

    return (
        <div style={{ marginLeft: 'auto', display: 'flex' }}>
            <button className="vtex-add-to-list-pdp" onClick={() => document.querySelector(".vtex-list-add-icon-heart").click()}>Add to list</button>
            {React.cloneElement(React.Children.toArray(children)[0], { skuId: skuId, type: "button" })}
        </div>
    );
}

export default AddToList