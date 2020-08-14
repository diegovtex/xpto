import React from "react";
import axios from "axios";
import { RadioGroup, Box } from "vtex.styleguide";
import { orderFormConsumer } from "vtex.store-resources/OrderFormContext";
import { ContentWrapper } from "vtex.my-account-commons";

class MyPreferences extends React.Component {
  state = {
    replaceItems: "",
    loaded: false
  };

  async componentDidMount() {
    if(this.loaded) return
    await this.getSubstituteOption();
  }

  getSubstituteOption = async () => {
    const document = await this.getDocument();
    this.setState({
      loaded: true,
      replaceItems: document.productsubstitution || ""
    })
  }

  getDocument = async () => {
    const {
      orderFormContext: {
        orderForm: { userProfileId }
      }
    } = this.props;
    let response;
    response = (
      await axios({
        url: `/api/dataentities/CL/search?userId=${userProfileId}&_fields=id,productsubstitution`,
        method: "GET"
      })
    ).data;
    if (!response.length) return;
    return response[0];
  };

  changeSubstituteOption = async event => {
    const { value } = event.currentTarget;
    this.setState({
      replaceItems: value
    });
    const document = await this.getDocument();
    const documentId = document.id;
    let response;
    response = (
      await axios({
        url: `/api/dataentities/CL/documents/${documentId}`,
        method: "PATCH",
        data: {
          productsubstitution: value
        }
      })
    ).data;
  };

  render() {
    return (
      <ContentWrapper
        namespace="my-custom-page"
        title="My Preferences"
        backButton={{
          title: "Return",
          path: "/profile"
        }}
      >
        {({ handleError }) => (
          <Box>
            <h2>Choose your preferred criterium</h2>
            <RadioGroup
              hideBorder
              name="colors"
              options={[
                { value: "storecriteria", label: "Store's criteria" },
                { value: "callme", label: "Call me" },
                { value: "similarbrand", label: "Similar brand" },
                { value: "donotsubstitute", label: "Do not substitute" }
              ]}
              value={this.state.replaceItems}
              onChange={event => this.changeSubstituteOption(event)}
            />
          </Box>
        )}
      </ContentWrapper>
    );
  }
}

export default orderFormConsumer(MyPreferences);
