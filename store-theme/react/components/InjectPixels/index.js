import React from "react";

class InjectPixels extends React.Component {
  componentDidMount() {
    this.injectScript1();
    this.injectScript2();
  }


  injectScript1() {
    const script = document.createElement("script");

    script.src = "https://consent.cookiebot.com/uc.js";
    script.id = "Cookiebot"
    script.setAttribute('data-cbid', '0fd15b87-41df-4c39-b2c4-f5444e3e2b8')
    script.setAttribute('data-blockingmode', 'auto')

    document.body.appendChild(script);
  }

  injectScript2() {
    const script = document.createElement("script");

    script.src = "https://consent.cookiebot.com/0fd15b87-41df-4c39-b2c4-f5444e3e2b8e/cd.js";
    script.id = "CookieDeclaration"
    script.async = true;
    script.type = "text/javascript"
    script.setAttribute('data-cbid', '0fd15b87-41df-4c39-b2c4-f5444e3e2b8')
    script.setAttribute('data-blockingmode', 'auto')

    document.body.appendChild(script);
  }

  render() {
    return <React.Fragment>{this.props.children}</React.Fragment>;
  }
}

export default InjectPixels;