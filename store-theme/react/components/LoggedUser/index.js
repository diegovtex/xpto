import React from "react";
import axios from "axios";
import "./style.global.css";

class LoggedUser extends React.Component {
  state = {
    isPrime: false,
    email: null,
  };

  async componentDidMount() {
    if (!window) return;
    if (!window.__RENDER_8_SESSION__) return;
    if (!window.__RENDER_8_SESSION__.sessionPromise) return;
    const self = this;
    window.__RENDER_8_SESSION__.sessionPromise.then(async function (session) {
      console.log("Session", session);

      if (
        !session.response.namespaces.profile ||
        !session.response.namespaces.profile.email
      )
        return;

      const email = session.response.namespaces.profile.email.value;
      const user = await self.getDocument(email);
      self.setState({
        email: email,
        isPrime: user.isPrime,
      });
    });
  }

  getDocument = async (email) => {
    let response;
    try {
      response = (
        await axios({
          url: `/api/dataentities/CL/search?_where=email=${email}&_fields=id,isPrime`,
        })
      ).data[0];
    } catch (error) {
      console.error(error);
    }
    return response;
  };

  render() {
    const { isPrime, email } = this.state;
    const { loggedUserText } = this.props;
    if (isPrime != true) return null;
    return (
      <div className="flex justify-center items-center cby-notify">
        {loggedUserText
          ? loggedUserText.replace("{email}", email)
          : "Hi " + email + ", you are a prime client. Enjoy free shipping"}
      </div>
    );
  }
}

LoggedUser.schema = {
  title: "Logged User",
  description: "Logged User",
  type: "object",
  properties: {
    loggedUserText: {
      default: "Hi {email}, you are a prime client. Enjoy free shipping",
      title: "Logged user text",
      type: "string",
    },
  },
};

export default LoggedUser;
