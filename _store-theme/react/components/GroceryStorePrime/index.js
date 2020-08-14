import React from 'react'
import { Container } from "vtex.store-components"
import { useCssHandles } from 'vtex.css-handles'
import styles from "./styles.css"

const GroceryStorePrime = ({ imageUrl, sku }) => {
    const CSS_HANDLES = [
        'linkGroceryStorePrime',
        'imageGroceryStorePrime',
        'containerGroceryStorePrime'
    ]
    const handles = useCssHandles(CSS_HANDLES)

    return (
        <Container className={handles.containerGroceryStorePrime}>
            <a className={handles.linkGroceryStorePrime} href={`/checkout/cart/add?sku=${sku}&qty=1&seller=1&redirect=true`}>
                <img src={imageUrl} className={handles.imageGroceryStorePrime} />
            </a>
        </Container>
    )
}

GroceryStorePrime.defaultProps = {
    sku: 47,
    imageUrl: "/arquivos/ids/155543-1000-1000/Prime-services.png?v=637218570723900000"
}

GroceryStorePrime.schema = {
    title: "GroceryStorePrime",
    description: "Grocery Store Prime",
    type: "object",
    properties: {
        sku: {
            default: GroceryStorePrime.defaultProps.sku,
            title: "Sku Item",
            type: "string"
        },
        imageUrl: {
            default: GroceryStorePrime.defaultProps.imageUrl,
            title: "Image",
            type: "string",
            widget: {
                "ui:widget": "image-uploader"
            }
        }
    }
};

export default GroceryStorePrime