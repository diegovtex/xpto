import React from "react";
import { Link, withRuntimeContext } from "vtex.render-runtime";
import { Button } from "vtex.styleguide";

export const ProductCompareContext = React.createContext({});
ProductCompareContext.displayName = "ProductCompareContext";

import styles from "./styles.css";

class ProductCompareWrapper extends React.Component {
  state = {
    items: [],
    maxItems: 4
  };

  setItems = (event, item) => {
    event.preventDefault();
    event.stopPropagation();

    const { items, maxItems } = this.state;
    if(items.length >= maxItems) return

    items.push(item);

    this.setState({
      items: items,
    });

    console.log("state", this.state.items);
  };

  removeItem = (event, item) => {
    event.preventDefault();
    event.stopPropagation();

    let { items } = this.state
    items = items.filter(i => i.itemId != item.itemId)
    this.setState({
      items: items
    })
  }

  navigateToCompare = () => {
    const { items } = this.state
    const { runtime: { navigate } } = this.props
    navigate({
      page: "store.custom.grocery-store#compare",
      query: items.map(item => `skuId=${item.itemId}`).join("&")
    })
  }

  render() {
    const { children } = this.props;
    const { items } = this.state;

    const value = {
      ...this.state,
      setItems: this.setItems,
      removeItem: this.removeItem,
    };

    return (
      <ProductCompareContext.Provider value={value}>
        <div className={styles["product-compare-wrapper"]}>
          {children}
          {items.length ? (
            <div className={styles["product-compare-box-container"]}>
              <div className={styles["product-compare-box"]}>
                {items.map((item) => (
                  <div className={styles["product-compare-box-item"]}>
                    <img
                      src={item.images[0].imageUrl}
                      className={styles["product-compare-box-item-img"]}
                    />
                  </div>
                ))}
              </div>
              <div className={styles["product-compare-box-button"]}>
                <Button variation="primary" disabled={items.length < 2} size="small" onClick={this.navigateToCompare}>
                  {items.length < 2 ? "Minimum 2 products" : "Compare"}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </ProductCompareContext.Provider>
    );
  }
}

export default withRuntimeContext(ProductCompareWrapper);
