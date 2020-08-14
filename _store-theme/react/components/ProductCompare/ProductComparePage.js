import React from "react";
import { useQuery } from "react-apollo";
import { path } from "ramda";
import productsByIdentifier from "../../queries/productsByIdentifier.gql";
import { ExtensionPoint, useRuntime } from "vtex.render-runtime";
import { mapCatalogProductToProductSummary } from '../../utils/normalize';
import { ProductCompareContext } from "./ProductCompareWrapper";
import styles from "./styles";

const ProductComparePage = () => {
  const runtime = useRuntime();
  const context = React.useContext(ProductCompareContext);

  const skusId = path(["query", "skuId"], runtime);
  if (!skusId || !skusId.length) return null;
  console.log("Context na page: ", context);
  const excludableSpecs = ["allSpecifications"];

  const { data, loading, error } = useQuery(productsByIdentifier, {
    variables: {
      field: "sku",
      values: skusId,
    },
  });

  const getProductShape = (product) => {
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

  const formatProducts = (products) => {
    let specificationGroups = {};
    products.map((product) => {
      product.specificationGroups.map((specificationGroup) => {
        if (!excludableSpecs.includes(specificationGroup.name)) {
          if (!specificationGroups[specificationGroup.name])
            specificationGroups[specificationGroup.name] = {};
          specificationGroup.specifications.map((specification) => {
            if (
              !specificationGroups[specificationGroup.name][specification.name]
            )
              specificationGroups[specificationGroup.name][
                specification.name
              ] = [];
            specificationGroups[specificationGroup.name][
              specification.name
            ].push(path(["values", "0"], specification));
          });
        }
      });
      const productSpecificationGroups = product.specificationGroups.map(
        (spec) => spec.name
      );
      console.log('Object.keys(specificationGroups)', Object.keys(specificationGroups));
      Object.keys(specificationGroups).map(
        (spec) => {
          if (productSpecificationGroups.indexOf(spec) === -1) {
            console.log('specificationGroups[spec]', specificationGroups[spec])
            Object.keys(specificationGroups[spec]).map(specGroup => (
              specificationGroups[spec][specGroup].push("N/A")
            ))
          } else {
            // const specs = productSpecificationGroups[spec].specifications.map(
            //   (specGroup) => specGroup.name
            // );
            // Object.keys(specificationGroups[spec]).map(
            //   (specGroup) => {
            //     if (specs.indexOf(spec) === -1) {
            //       specificationGroups[spec][specGroup].push("N/A");
            //     }
            //   }
            // );
          }
        }
      );
    });
    return specificationGroups;
  };

  if (loading) return <p>Loading...</p>;
  if (error) return null;
  if (!data) return null;

  console.log("Data: ", data);
  const specificationGroups = formatProducts(data.productsByIdentifier);
  return (
    <div className={styles["compare-container"]}>
      <div className={styles["compare-products"]}>
        {data.productsByIdentifier.map((product) => {
          return (
            <div className={styles["compare-products-item"]}>
              <ExtensionPoint
                id="product-summary"
                key={product.productId}
                product={mapCatalogProductToProductSummary(product)}
              />
            </div>
          );
        })}
      </div>
      <div className={styles["compare-products-specifications"]}>
        {Object.keys(specificationGroups).map((specificationGroup) => (
          <table>
            <thead>
              <tr>
                <th className={styles["compare-products-specification-title"]}>
                  {specificationGroup}
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(specificationGroups[specificationGroup]).map(
                (specification) => (
                  <tr>
                    <td>
                      <strong>{specification}</strong>
                    </td>
                    {specificationGroups[specificationGroup][specification].map(
                      (specValue) => (
                        <td>{specValue}</td>
                      )
                    )}
                  </tr>
                )
              )}
            </tbody>
          </table>
        ))}
      </div>
    </div>
  );
};

export default ProductComparePage;
