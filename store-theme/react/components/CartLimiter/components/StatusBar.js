import React, { useLayoutEffect } from "react";
import { useOrderForm } from "vtex.order-manager/OrderForm";
import { Spinner, Progress, Tag } from "vtex.styleguide";

import { injectIntl } from "react-intl";
import { formatIOMessage } from "vtex.native-types";

const StatusBar = (props) => {
  const { loading, orderForm } = useOrderForm();

  console.log(orderForm)

  const formatMessage = (id) => {
    return formatIOMessage({ id: id, intl: props.intl });
  };

  const toSelectedCurrency = (value) => {
    const { currency, locale } = __RUNTIME__.culture
    return value.toLocaleString(locale, { style: "currency", currency })
  }

  if (loading) return <Spinner />;

  const min = 150;
  const percent = Math.ceil((parseFloat(orderForm.value) / 100 / min) * 100);

  useLayoutEffect(() => {
    const minicartButtonContainer = document.querySelector(
      ".vtex-minicart-2-x-minicartCheckoutButton"
    );
    const minicartButton = document.querySelector("#proceed-to-checkout");
    if (minicartButtonContainer && minicartButton) {
      const buttonLabel = minicartButton.querySelector(".vtex-button__label");
      if (!loading) {
        const hasMinimum = parseFloat(orderForm.value) / 100 >= 150;
        const isMissing = toSelectedCurrency(150 - parseFloat(orderForm.value) / 100)
        if (hasMinimum) {
          buttonLabel.innerHTML = formatMessage(props.goToCheckout);
          minicartButtonContainer.style.pointerEvents = "all";
          minicartButton.setAttribute("disabled", false);
        } else {
          buttonLabel.innerHTML = `${formatMessage(
            props.addMore
          )} ${isMissing}`;
          minicartButtonContainer.style.pointerEvents = "none";
          minicartButton.setAttribute("disabled", true);
        }
      }
    }
  }, [orderForm]);

  return (
    <>
      <Tag bgColor="#134CD8" color="#ffffff">
        {toSelectedCurrency(min)} {formatMessage(props.minimum)}
      </Tag>
      <span className="mt1 flex">&nbsp;</span>
      <Progress type="line" percent={percent} />
    </>
  );
};

StatusBar.getSchema = () => {
  return {
    title: "Minicart Status bar",
    description: "Minicart Status bar",
    type: "object",
    properties: {
      goToCheckout: {
        default: "GO TO CHECKOUT",
        title: "admin/editor.modal-status-bar.go-to-checkout.title",
        type: "string",
      },
      addMore: {
        default: "ADD MORE",
        title: "admin/editor.modal-status-bar.add-more.title",
        type: "string",
      },
      minimum: {
        default: "minimum",
        title: "admin/editor.modal-status-bar.minimum.title",
        type: "string",
      },
    },
  };
};
export default injectIntl(StatusBar);
