import React from "react";
import { graphql } from 'react-apollo'
import orderFormQuery from '../../queries/orderForm.gql'
import './index.global.css'
const GroceryStoreWrapper = (props) => {
  if(props.data.orderForm && !props.data.orderForm.loading) console.log("OrderForm: ", props.data.orderForm)
  return <div className="grocery-store-wrapper">{props.children}</div>;
};

const withOrderForm = graphql(orderFormQuery, {
  options: () => ({
    ssr: false
  })
})

export default withOrderForm(GroceryStoreWrapper)
