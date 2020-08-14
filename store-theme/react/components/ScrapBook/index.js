import React from "react";
import styles from "./scrap-book.css";
import classnames from "classnames";
class ScrapBook extends React.Component {
  static schema = {
    title: "ScrapBook",
    description: "ScrapBook",
    type: "object",
    properties: {
      imageUrl: {
        default: "assets/recipe3.jpg",
        title: "Image",
        type: "string",
        widget: {
          'ui:widget': 'image-uploader',
        },
      },
      itemsQuantity: {
        default: "94",
        title: "Items Quantity",
        type: "string",
      },
      itemsQuantityText: {
        default: "items",
        title: "Items Quantity Text",
        type: "string",
      },
      title: {
        default: "Healthier recipes",
        title: "Title",
        type: "string",
      },
      subTitle: {
        default: "Scrapbook",
        title: "Sub title",
        type: "string",
      },
      likesQuantity: {
        default: "345 people have saved this scrapbook",
        title: "Likes quantity",
        type: "string",
      },
      shareBarText: {
        default: "Save scrapbook",
        title: "Share Bar text",
        type: "string",
      },
    },
  };

  render() {
    const {
      blockClass,
      imageUrl,
      itemsQuantity,
      itemsQuantityText,
      title,
      subTitle,
      likesQuantity,
      shareBarText,
    } = this.props;
    return (
      <div className={classnames(styles["scrap-book-wrapper"])}>
        <div className={classnames(styles["scrap-book-container"], blockClass)}>
          <div className={styles["scrap-book-thumb"]}>
            <img src={imageUrl} />
            <div className={styles["scrap-book-items-quantity-container"]}>
              <span className={styles["scrap-book-items-quantity"]}>
                {itemsQuantity}
              </span>
              <span className={styles["scrap-book-items-quantity-text"]}>
                {itemsQuantityText}
              </span>
            </div>
          </div>
          <div className={styles["scrap-book-details"]}>
            <div className={styles["scrap-book-title-container"]}>
              <span className={styles["scrap-book-title"]}>{title}</span>
              <span className={styles["scrap-book-sub-title"]}>{subTitle}</span>
            </div>
            <div className={styles["scrap-book-likes-quantity"]}>
              {likesQuantity}
            </div>
            <div className={styles["scrap-book-share-bar"]}>
              <button
                className={classnames(styles["scrap-book-share-bar-button"])}
              >
                {shareBarText}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ScrapBook;
