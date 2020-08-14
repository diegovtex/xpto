import React from "react";
import axios from "axios";
import { useOrderForm } from "vtex.order-manager/OrderForm";
import { orderFormConsumer } from "vtex.store-resources/OrderFormContext";

export const LocationContext = React.createContext();

export const withLocation = (Component) => (props) => (
  <LocationContext.Consumer>
    {(locationProps) => <Component {...props} {...locationProps} />}
  </LocationContext.Consumer>
);

const LocationProvider = ({ children, ...props }) => {
  const [availableLocations, setAvailableLocations] = React.useState([]);
  const [currentLocation, setCurrentLocation] = React.useState(1);
  const { orderForm, loading } = useOrderForm();

  const setNewCurrentLocation = (location) => {
    setCurrentLocation(location);
    updateSalesChannel(location);
  }

  const updateSalesChannel = async (location) => {
    const data = {
      public: {
        sc: {
          value: location.currency.salesChannel,
        },
      },
    };
    const response = (
      await axios({
        url: "/api/sessions",
        method: "POST",
        data,
      })
    ).data;
    await clearOrderFormItems();
    return window.location.reload();
  };

  const clearOrderFormItems = async () => {
    let {
      orderFormContext: { updateOrderForm },
    } = props;
    const orderFormId = !loading && orderForm ? orderForm.id : undefined;
    let items = !loading && orderForm ? orderForm.items : undefined;

    if (!items.length) return;

    items = items.map((item, index) => {
      return {
        id: parseInt(item.id),
        quantity: 0,
        seller: "1",
        index: parseInt(index),
      };
    });
    const response = await updateOrderForm({
      variables: {
        orderFormId,
        items,
      },
    });
    window.localStorage.removeItem("orderform");
  };

  const value = {
    setAvailableLocations,
    setCurrentLocation,
    updateSalesChannel,
    setNewCurrentLocation,
    availableLocations,
    loading,
    currentLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export default orderFormConsumer(LocationProvider);
