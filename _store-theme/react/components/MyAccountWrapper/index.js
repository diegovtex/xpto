import React, { useEffect, useState } from "react";
import axios from "axios";
import { path } from "ramda";
import ReactDOM from "react-dom";
import { Checkbox as VtexCheckbox } from "vtex.styleguide";
const Checkbox = props => {
  const [receiveSms, setReceiveSms] = useState(false);
  const [loaded, setLoaded] = useState();

  const getDocument = async () => {
    let user;
    try {
      user = await window.__RENDER_8_SESSION__.sessionPromise;
    } catch (error) {
      console.error("__RENDER_8_SESSION__", error);
    }
    const userProfileId = path(["response", "namespaces", "profile", "id", "value"], user);
    if (!userProfileId) return {};
    let response;
    try {
      response = (
        await axios({
          url: `/api/dataentities/CL/search?_where=userId=${userProfileId}&_fields=id,isSMSOptIn`,
          method: "GET"
        })
      ).data;
    } catch (error) {
      console.error("getDocument", error);
    }
    if (!response.length) return {};
    return response[0];
  };

  const saveOptInSMS = async event => {
    setReceiveSms(!receiveSms);
    const document = await getDocument();
    const documentId = document.id;
    let response;
    try {
      response = (
        await axios({
          url: `/api/dataentities/CL/documents/${documentId}`,
          method: "PATCH",
          data: {
            isSMSOptIn: !receiveSms
          }
        })
      ).data;
    } catch (error) {
      console.error("saveOptInSMS", error);
    }
  };

  const getOptInSMS = async () => {
    const document = await getDocument();
    setReceiveSms(document.isSMSOptIn || false);
    setLoaded(true);
  };

  useEffect(() => {
    if (loaded) return;
    getOptInSMS();
  }, []);

  return (
    <VtexCheckbox
      checked={receiveSms}
      id="option-0"
      label="I want to receive SMS"
      name="default-checkbox-group"
      onChange={event => saveOptInSMS(event)}
      value="option-0"
    />
  );
};
const MyAccountWrapper = props => {
  const { page, children } = props;
  const [preferredCard, setPreferedCard] = useState(null);
  const [cardList, setCardList] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const getDocument = async () => {
    let user;
    try {
      user = await window.__RENDER_8_SESSION__.sessionPromise;
      console.log("__RENDER_8_SESSION__", user);
    } catch (error) {
      console.error("__RENDER_8_SESSION__", error);
    }
    console.log('__RENDER_8_SESSION__ userProfileId', user);
    const userProfileId = path(["response", "namespaces", "profile", "id", "value"], user);
    console.log('userProfileId', userProfileId);
    if (!userProfileId) return {};
    let response;
    try {
      response = (
        await axios({
          url: `/api/dataentities/CL/search?_where=userId=${userProfileId}&_fields=id,defaultpaymentmethod`,
          method: "GET"
        })
      ).data;
      console.log("getDocument", response);
    } catch (error) {
      console.error("getDocument", error);
    }
    if (!response.length) return {};
    return response[0];
  };

  const setDefaultCreditCard = async key => {
    const document = await getDocument();
    const documentId = document.id;
    let response;
    response = (
      await axios({
        url: `/api/dataentities/CL/documents/${documentId}`,
        method: "PATCH",
        data: {
          defaultpaymentmethod: key
        }
      })
    ).data;
    console.log(response);
    setPreferedCard(key);
  };

  useEffect(() => {
    if (loaded) return;
    retrieveDocumentPreferredCard();
  }, []);

  const retrieveDocumentPreferredCard = async () => {
    if (!loaded) {
      setLoaded(true);
      const document = await getDocument();
      if (document.defaultpaymentmethod) {
        setPreferedCard(parseInt(document.defaultpaymentmethod));
      } else {
        setPreferedCard(0);
      }
    }
  };

  useEffect(() => {
    document.addEventListener("DOMNodeInserted", e => {
      addSeeMyInvoice(e);
      addDeleteAccountButton(e);
      addSmsDiv(e);
      injectSmsNode(e);
      addImOnMyWayButton(e);
      addCardList(e);
    });
    return () => {
      document.removeEventListener("DOMNodeInserted", e => {
        addSeeMyInvoice(e);
        addDeleteAccountButton(e);
        addSmsDiv(e);
        injectSmsNode(e);
        addImOnMyWayButton(e);
        addCardList(e);
      });
    };
  }, []);

  useEffect(() => {
    console.log("preferredCard", preferredCard);
    console.log("cardList", cardList);
    if (cardList) {
      updateCards(cardList);
    }
  }, [preferredCard, cardList]);

  const addCardList = e => {
    if (page !== "store.account") return;
    if (!e.target.querySelectorAll) return;
    const cards = e.target.querySelectorAll(
      ".vtex-account__cards-list > div > div > article"
    );
    if (!cards.length) return;
    setCardList(cards);
    updateCards(cards);
  };

  const addOrUpdateCard = (card, key) => {
    if (!card) return;
    let foundPreferedCard = card.querySelector(".preferred-card");
    let togglePreferredCard =
      foundPreferedCard || document.createElement("button");
    if (!foundPreferedCard) {
      console.log("!foundPreferedCard", togglePreferredCard);
      togglePreferredCard.addEventListener("click", function() {
        setPreferedCard(key);
        console.log("key", key);
        setDefaultCreditCard(key);
      });
    }

    togglePreferredCard.className =
      "preferred-card b absolute w-50 vtex-button bw1 ba fw5 v-mid relative pa0 lh-solid br2 min-h-small t-action--small  pointer";
    togglePreferredCard.style =
      "top: 5px; right: 5px; text-transform: none; font-weight: bold";
    if (preferredCard === key) {
      togglePreferredCard.className +=
        " bg-success b--success hover-bg-success hover-b--success ";
      togglePreferredCard.innerText = "Default credit card";
    } else {
      togglePreferredCard.className +=
        " bg-muted-3 b--muted-3 hover-muted-4 hover-b--muted-4";
      togglePreferredCard.innerText = "Set as default credit card";
    }

    if (!foundPreferedCard) {
      card.classList.add("relative");
      card.insertAdjacentElement("afterbegin", togglePreferredCard);
    }
  };

  const updateCards = cards => {
    for (var i = 0; i < cards.length; i++) {
      // <button class="vtex-button bw1 ba fw5 v-mid relative pa0 lh-solid br2 min-h-small t-action--small bg-action-primary b--action-primary c-on-action-primary hover-bg-action-primary hover-b--action-primary hover-c-on-action-primary pointer" style="position: absolute; top: 5px; right: 5px">Prefered card</button>
      const card = cards[i];
      addOrUpdateCard(card, i);
    }
  };

  const addImOnMyWayButton = e => {
    if (page !== "store.account") return;
    if (!e.target.querySelectorAll) return;
    const ordersCardsHeader = e.target.querySelectorAll(
      ".vtex-my-orders-app-3-x-orderHeader > div:nth-child(1)"
    );
    for (let i = 0; i <= ordersCardsHeader.length; i++) {
      const orderCardHeader = ordersCardsHeader[i];
      if (!orderCardHeader) continue;
      const orderId = orderCardHeader.innerText.replace("# ", "").split("-")[0];
      if (orderCardHeader.querySelector(".see-order-invoice")) continue;
      orderCardHeader.insertAdjacentHTML(
        "beforeend",
        `<button class="db tc pv3 ph5 br2 f6 fw4 link bg-base c-on-action-secondary hover-action-secondary mt5 see-order-invoice pointer">I'm on my way</button>`
      );
    }
  };

  const addSeeMyInvoice = e => {
    if (page !== "store.account") return;
    if (!e.target.querySelectorAll) return;
    const ordersCardsHeader = e.target.querySelectorAll(
      ".vtex-my-orders-app-3-x-orderHeader .vtex-my-orders-app-3-x-orderId"
    );
    for (let i = 0; i <= ordersCardsHeader.length; i++) {
      const orderCardHeader = ordersCardsHeader[i];
      if (!orderCardHeader) continue;
      const orderId = orderCardHeader.innerText.replace("# ", "").split("-")[0];
      if (orderCardHeader.querySelector(".see-order-invoice")) continue;
      orderCardHeader.insertAdjacentHTML(
        "beforeend",
        `<a class="db tc pv3 ph5 br2 f6 fw4 link bg-action-secondary c-on-action-secondary hover-action-secondary mt5 see-order-invoice" target="_blank" href="/checkout/orderPlaced/?og=${orderId}">See order invoice</a>`
      );
    }
  };

  const addDeleteAccountButton = e => {
    if (page !== "store.account") return;
    if (!e.target.querySelectorAll) return;
    const profile = e.target.querySelector(".vtex-my-account-1-x-profile");
    if (!profile) return;
    const profileBox = profile.querySelector(
      "main > div:nth-child(1) > div > article > footer"
    );
    if (!profileBox) return;
    if (profileBox.querySelector(".delete-my-account")) return;
    profileBox.insertAdjacentHTML(
      "afterbegin",
      '<a style="margin-right: auto;" class="db tc pv3 ph5 br2 f6 fw4 link bg-danger c-on-danger hover-danger delete-my-account self-start " target="_blank" href="#">Delete my account</a>'
    );
  };

  const addSmsDiv = e => {
    if (page !== "store.account") return;
    if (!e.target.querySelectorAll) return;
    const profile = e.target.querySelector(".vtex-my-account-1-x-profile");
    if (!profile) return;
    const newsLetter = profile.querySelectorAll(
      ".vtex-my-account-1-x-passwordBox"
    )[1];
    if (!newsLetter) return;
    if (newsLetter.querySelector("#receive-sms")) return;
    newsLetter.insertAdjacentHTML("beforeend", '<div id="receive-sms"></div>');
  };

  const injectSmsNode = e => {
    if (!e.target.querySelector) return;
    const smsNode = e.target.querySelector("#receive-sms");
    if (!smsNode) return;
    ReactDOM.render(<Checkbox />, smsNode);
  };

  return <div className="my-account-wrapper">{children}</div>;
};

export default MyAccountWrapper;
