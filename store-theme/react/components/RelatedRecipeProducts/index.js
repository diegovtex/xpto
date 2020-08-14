import React from "react";
import { ExtensionPoint } from "vtex.render-runtime";
import { Divider, Button } from "vtex.styleguide";
import { mapCatalogProductToProductSummary } from '../../utils/normalize';
import axios from "axios";
import classnames from "classnames";
import styles from "./styles.css";
class RelatedRecipeProducts extends React.Component {
  state = {
    products: [],
  };

  static schema = {
    title: "ScrapBook",
    description: "ScrapBook",
    type: "object",
    properties: {
      relatedRecipeProducts: {
        items: {
          title: "Related recipe products",
          type: "object",
          properties: {
            id: {
              default: "",
              title: "Sku ID",
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

  async componentDidMount() {
    const { relatedRecipeProducts } = this.props;
    let urlParams = relatedRecipeProducts.map((sku) => `fq=skuId:${sku.id}`);
    try {
      const response = (
        await axios({
          method: "get",
          url: `/api/catalog_system/pub/products/search?${urlParams.join(
            "&"
          )}&sc=4`,
        })
      ).data;
      console.log(
        '`/api/catalog_system/pub/products/search?${urlParams.join("&")}`',
        `/api/catalog_system/pub/products/search?${urlParams.join("&")}`
      );
      console.log("response", response);
      this.setState({ products: response });
    } catch (error) {
      console.error(error);
    }
  }

  getProductShape = (product) => {
    const sku = product.items[0];
    return {
      productId: product.productId,
      linkText: product.linkText,
      productName: product.productName,
      brand: product.brand,
      brandId: product.brandId,
      sku: {
        name: sku.name,
        itemId: sku.itemId,
        image: {
          imageUrl: sku.images[0].imageUrl,
          imageTag: sku.images[0].imageTag,
        },
        seller: {
          sellerId: sku.sellers[0].sellerId,
          commertialOffer: sku.sellers[0].commertialOffer,
        },
      },
    };
  };

  render() {
    const { products } = this.state;
    const { summary } = this.props;
    return (
      <div className={classnames(styles["related-recipe-products"])}>
        <div className="mt-5 mb-5">
          <Divider />
        </div>
        <h2>Recipe products</h2>
        <div className="mt-5 mb-5">
          <Button>Add all products to cart</Button>
        </div>
        <div className={styles["related-recipe-products-list"]}>
          {products.length > 0 &&
            products.map((product) => {
              return (
                <div className={styles["related-recipe-product"]}>
                  <ExtensionPoint
                    id="product-summary"
                    {...summary}
                    product={mapCatalogProductToProductSummary(product)}
                  />
                </div>
              );
            })}
        </div>
      </div>
    );
  }
}

export default RelatedRecipeProducts;
