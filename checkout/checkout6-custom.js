"use strict";

const elObserve = (element, callback) => {
  const observer = new MutationObserver((mutations) => {
    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i];
      for (let z = 0; z < mutation.addedNodes.length; z++) {
        const addedNode = mutation.addedNodes[z];
        if (addedNode) {
          if (addedNode.querySelector) {
            const foundElement = addedNode.querySelector(element);
            if (foundElement) {
              callback(foundElement);
              observer.disconnect();
            }
          }
        }
      }
    }
  });
  const observeOptions = {
    childList: true,
    subtree: true,
  };
  observer.observe(document, observeOptions);
};

var cartClass = '__cart';
var emailClass = '__email';
var profileClass = '__profile';
var shippingClass = '__shipping';
var paymentClass = '__payment';

var Core = {
  categories: {},
  activeCategoryFilter: "",
  requiredProductId: "43", //orderForm.items.productId
  primeProductId: "46", //orderForm.items.productId
  excludeProducts: ["67", "68"],
  aux: 0,
  product: null,
  userDocumentId: null,
  selectedCardIndex: null,
  firstTimeLoaded: true,
  cartButtonEventAdded: false,
  addBag: null,
  insertSubstituteOptions: function () {
    Core.insertTh();
  },
  
  getCorrectValue: function (value) {
    switch (value) {
      case "storecriteria":
        return 6;
      case "callme":
        return 7;
      case "similarbrand":
        return 5;
      case "donotsubstitute":
        return 2;
      default:
        return 6;
    }
  },
  insertTh: function () {
    var table = document.querySelector(".table.cart-items");
    var tr = table.querySelector("thead tr");
    if (tr.querySelector("th.substitute")) return;
    var th = tr.querySelectorAll("th");
    var newTh = document.createElement("th");
    newTh.classList.add("substitute");
    newTh.innerHTML =
      '<select class="substitute-select"><option value="" selected disabled>Substitution</option><option value="storecriteria">Store criteria</option><option value="callme">Call me</option><option value="similarbrand">Same Brand</option><option value="donotsubstitute">Do not substitute</option></select>';
    th[2].insertAdjacentElement("afterend", newTh);
    Core.changeSelect();
  },
  insertComboBox: function (event) {
    if (!event) return;
    if (!event.target.matches) return;
    if (event.target.matches("tr.product-item")) {
      var product = event.target;
      var newCell = product.insertCell(4);
      newCell.classList.add("replace-product");
      newCell.width = "150";
      newCell.innerHTML =
        '<form><div style="flex-direction: column; display: flex; justify-content: space-between;"> <div style="display: flex;"> <input style="margin-right: 5px" type="radio" id="storecriteria' +
        Core.aux +
        '" name="substitute" value="storecriteria"/> <label for="storecriteria' +
        Core.aux +
        '">Store criteria</label> </div><div style="display: flex;"> <input style="margin-right: 5px" type="radio" id="callme' +
        Core.aux +
        '" name="substitute" value="callme"/> <label for="callme' +
        Core.aux +
        '">Call me</label> </div><div style="display: flex;"> <input style="margin-right: 5px" type="radio" id="similarbrand' +
        Core.aux +
        '" name="substitute" value="similarbrand"/> <label for="similarbrand' +
        Core.aux +
        '">Similar brand</label> </div><div style="display: flex;"> <input style="margin-right: 5px" type="radio" id="donotsubstitute' +
        Core.aux +
        '" name="substitute" value="donotsubstitute"/> <label for="donotsubstitute' +
        Core.aux +
        '">Do not substitute</label> </div></div></form>';
      Core.aux++;
    }
  },
  removeItems: function (orderForm) {
    if (!orderForm) return;
    var productItems = document.querySelectorAll("tr.product-item");
    if (!productItems) return;

    var excludeProducts = orderForm.items.filter(function (item) {
      return Core.excludeProducts.includes(item.id);
    });
    for (var i = 0; i < excludeProducts.length; i++) {
      var excludeProduct = excludeProducts[i];
      if (!excludeProduct) return;
      var excludeProductIndex = orderForm.items.indexOf(excludeProduct);
      var excludeProductId = productItems[excludeProductIndex];
      if (!excludeProductId) return;
      var excludeProductIdReplaceComboBox = excludeProductId.querySelector("td.replace-product");
      if (excludeProductIdReplaceComboBox) {
        excludeProductIdReplaceComboBox.innerHTML = " ";
      }
    }
  },
  removeBagComboBox: function (orderForm) {
      if (!orderForm) return;
      var productItems = document.querySelectorAll("tr.product-item");
      if (!productItems) return;
      var bag = orderForm.items.find(function (item) {
          return item.productId == Core.requiredProductId;
      });
      if (!bag) return;
      var bagIndex = orderForm.items.indexOf(bag);
      var bagTd = productItems[bagIndex];
      if (!bagTd) return;
      var bagReplaceProductComboBox = bagTd.querySelector("td.replace-product");
      if (bagReplaceProductComboBox) {
          bagReplaceProductComboBox.innerHTML = " ";
      }
    },
    removePrimeComboBox: function (orderForm) {
        if (!orderForm) return;
       var prime = orderForm.items.find(function (item) {
            return item.productId == Core.primeProductId;
        });
        
        if (!prime) return;

        //var primeIndex = orderForm.items.indexOf(prime);
        var idSku = prime.id
        var productItems = document.querySelectorAll('tr.product-item[data-sku="' + idSku + '"]');
        if (!productItems) return;
        //var primeTd = productItems[primeIndex];

        productItems.forEach(function(i,v){
          var primeReplaceProductComboBox = i.querySelector("td.replace-product");
          primeReplaceProductComboBox.innerHTML = " ";
        });
    },
  changeSelect: function () {
    var select = document.querySelector("th.substitute select");

    select.addEventListener("change", function () {
      var thisVal = select.value;
      document
        .querySelectorAll("input[value=" + thisVal + "]")
        .forEach(function (el, i) {
          el.checked = true;
        });
    });
  },
  cardSetup: function (cardId) {
    return `
      <div class='custom-prefered-option-container'>
        <label class='custom-prefered-option-label input'>
          <input type="radio" name="selected-prefered-card" id="${cardId}" />
          <span>My prefered Credit Card</span>
        </label>
      </div>
    `;
  },
  saveData: function () {
    var saveData = document.querySelector("#opt-in-save-data");
    saveData.checked = false;
    saveData.addEventListener("change", function () {
      document.querySelector(".newsletter").style = "display: block";
    });
  },
  tableCardEventListener: function () {
    var table = document.querySelector(".table.cart-items");
    table.addEventListener("DOMNodeInserted", function (event) {
      Core.insertComboBox(event);
    });
  },
  addDefaultCreditCardCheckbox: function () {
    var defaultCreditCard = document.querySelector(".payment-submit-wrap");
    defaultCreditCard.insertAdjacentHTML(
      "afterend",
      '<button id="set-default-credit-card" class="submit btn btn-success btn-large btn-block" tabindex="200"> <i class="icon-lock"></i> <i class="icon-spinner icon-spin" style="display: none;"></i> <span>Buy now</span> </button><label style="display: none" class="checkbox credit-card-label"> <input type="checkbox" id="opt-default-credit-card"/> <span class="credit-card-text" >Set as default credit card</span ></label>'
    );
    Core.setFakeBuyButton();
  },
  sendNewsLetter: function () {
    vtexjs.checkout.getOrderForm().then(function (orderForm) {
      if (orderForm.clientPreferencesData.optinNewsLetter == null) {
        vtexjs.checkout
          .sendAttachment("clientPreferencesData", {
            locale: "en-US",
            optinNewsLetter: true,
          })
          .then(function (newOD) {
            vtexjs.checkout.sendAttachment("clientPreferencesData", {
              locale: "en-US",
              optinNewsLetter: false,
            });
          });
      }
    });
  },
  getProduct: function () {
    if (Core.product) return;
    $.ajax({
      url:
        "/api/catalog_system/pub/products/search?fq=productId:" +
        Core.requiredProductId,
      type: "get",
      async: true,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }).done(function (response) {
      console.log(response);
      Core.product = response[0];
    });
  },
  injectBagProduct: function () {
    if (!vtexjs.checkout.orderForm) return;
    var items = vtexjs.checkout.orderForm.items;
    var prime = items.find(function (item) {
      return item.id === "47";
    });
    if (prime) return;
    Core.bag = items.find(function (item) {
      return item.productId === Core.requiredProductId;
    });
    var shippingContainer = document.querySelector(
      "#shipping-preview-container"
    );
    if (!shippingContainer) return;
    var bagContainer = document.querySelector(".cby-bag-container");
    if (bagContainer) return;
    shippingContainer.insertAdjacentHTML(
      "beforeend",
      '<div class="cby-bag-container loaded"></div>'
    );
    var imageUrl =
      "/arquivos/ids/155544_2/Screenshot-2020-04-07-at-12.59.36.png";
    var productName = "Bag";
    var quantity = 0;
    if (Core.bag) {
      quantity = Core.bag.quantity;
    }
    var price = 1.0;
    bagContainer = document.querySelector(".cby-bag-container");
    bagContainer.innerHTML =
      '<div class="cby-bag-product-image"><img src="' +
      imageUrl +
      '" title="' +
      productName +
      '" alt="' +
      productName +
      '" /></div>' +
      '<div class="cby-bag-product-details">' +
      '<div class="cby-bag-product-name">' +
      productName +
      "</div>" +
      '<div class="cby-bag-product-price">' +
      price.toLocaleString("en-UK", { style: "currency", currency: "GBP" }) +
      "</div>" +
      '<div class="cby-bag-product-quantity">' +
      '<div class="cby-bag-minus-btn"><i class="icon icon-minus-sign"></i></div><input value="' +
      quantity +
      '" type="tel" min="0" class="cby-quantity-field" /><div class="cby-bag-plus-btn"><i class="icon icon-plus-sign"></i></div>' +
      "</div>" +
      "</div>";
      document.querySelector(".cart-template-holder").appendChild(bagContainer)
      if(window.innerWidth > 960) document.querySelector(".cart-template-holder").appendChild(document.querySelector(".cart-links-bottom .link-choose-more-products-wrapper:first-child"))
      Core.addQuantityListeners();
  },
  updateQuantity: function (quantityTimeout, quantityText, type) {
    var bagContainer = document.querySelector(".cby-bag-container");
    clearTimeout(quantityTimeout);
    var currentQuantity = parseInt(quantityText.value);

    if (type === "add") {
      if (currentQuantity < 99) {
        quantityText.value = currentQuantity + 1;
      }
    } else {
      if (currentQuantity > 0) {
        quantityText.value = currentQuantity - 1;
      }
    }

    quantityTimeout = setTimeout(function () {
      bagContainer.classList.remove("loaded");
      var orderForm = vtexjs.checkout.orderForm;
      var items = orderForm.items;
      if (Core.bag) {
        var itemIndex = items.indexOf(Core.bag);
        vtexjs.checkout
          .updateItems([
            {
              index: itemIndex,
              quantity: parseInt(quantityText.value),
            },
          ])
          .done(function (orderForm) {
            if (quantityText.value == 0) {
              Core.bag = null;
            }
            bagContainer.classList.add("loaded");
          });
      } else {
        vtexjs.checkout
          .addToCart(
            [
              {
                quantity: parseInt(quantityText.value),
                id: 44,
                seller: 1,
              },
            ],
            null,
            orderForm.salesChannel
          )
          .done(function (orderForm) {
            bagContainer.classList.add("loaded");
          });
      }
    }, 600);
  },
  addQuantityListeners: function () {
    var quantityText = document.querySelector(".cby-quantity-field");
    var bagMinusBtn = document.querySelector(".cby-bag-minus-btn");
    var bagPlusBtn = document.querySelector(".cby-bag-plus-btn");
    var quantityTimeout;
    bagMinusBtn.addEventListener("click", function () {
      Core.updateQuantity(quantityTimeout, quantityText, "minus");
    });
    bagPlusBtn.addEventListener("click", function () {
      Core.updateQuantity(quantityTimeout, quantityText, "add");
    });
  },

  addCartLimiter: function (orderForm) {
    var prime = orderForm.items.find(function (item) {
      return item.id === "47";
    });
    if (prime) return;
    var cartLimiter = document.querySelector(".cby-cart-limiter-container");

    var cartTitle = document.querySelector("#cart-title");
    if (!cartTitle) return;

    if (!cartLimiter)
      cartTitle.insertAdjacentHTML(
        "beforeend",
        '<div class="cby-cart-limiter-container"><div class="cby-cart-limiter-missing-value"><h5>You still need to add <span class="cby-missing-value" /></h5></div><div class="cby-cart-limiter-wrapper"><h5>minimum 150.00</h5><div class="cby-cart-limiter"><div class="cby-cart-limiter-status-bar"><div class="cby-cart-limiter-status-text"></div></div></div></div></div>'
      );

    if (!orderForm.items.length) {
      cartLimiter = document.querySelector(".cby-cart-limiter-container");
      cartTitle.removeChild(cartLimiter);
    }
  },
  updateCartLimiter: function () {
    var orderForm = vtexjs.checkout.orderForm;
    var prime = orderForm.items.find(function (item) {
      return item.id === "47";
    });
    if (prime) return;
    var cartLimiterContainer = document.querySelector(
      ".cby-cart-limiter-container"
    );
    if (!cartLimiterContainer) return;
    var cartLimiter = document.querySelector(".cby-cart-limiter-status-bar");
    var cartLimiterText = document.querySelector(
      ".cby-cart-limiter-status-text"
    );
    var checkoutButton = document.getElementById("cart-to-orderform");
    var cartLimiterMinimum = document.querySelector(
      ".cby-cart-limiter-missing-value"
    );
    var cartLimiterMinimumBuyButton = document.querySelector(
      ".cby-cart-missing-value-checkout-button"
    );
    var min = 150;
    cartLimiterText.innerText =
      orderForm.storePreferencesData.currencySymbol +
      " " +
      parseFloat(orderForm.value) / 100;
    var percent = Math.ceil((orderForm.value / 100 / min) * 100);
    console.log("percent", percent);
    cartLimiter.style.width = percent >= 100 ? "100%" : percent + "%";

    console.log(
      "cartLimiterMinimum",
      cartLimiterMinimum,
      cartLimiterMinimumBuyButton
    );
    if (percent < 100) {
      if (cartLimiterMinimum) cartLimiterMinimum.style.display = "block";
      if (cartLimiterMinimumBuyButton)
        cartLimiterMinimumBuyButton.style.display = "block";
      checkoutButton.style.pointerEvents = "none";
      checkoutButton.style.backgroundColor = "#ccc";
      checkoutButton.innerHTML = 'Add more <span class="cby-missing-value" />';
    } else {
      if (cartLimiterMinimum) cartLimiterMinimum.style.display = "none";
      if (cartLimiterMinimumBuyButton)
        cartLimiterMinimumBuyButton.style.display = "none";
      checkoutButton.style.pointerEvents = "all";
      checkoutButton.style.backgroundColor = "#0060bc";
      checkoutButton.innerHTML = "Checkout";
    }
    var missingValues = document.querySelectorAll(".cby-missing-value");
    if (missingValues.length) {
      for (var i = 0; i < missingValues.length; i++) {
        var missingValueContainer = missingValues[i];
        var missingValue = parseFloat(15000 - orderForm.value) / 100;
        missingValueContainer.innerText =
          orderForm.storePreferencesData.currencySymbol + " " + missingValue;
        console.log("missingValue", missingValue);
      }
    }
  },
  selectDefaultPayment: function (orderForm) {
    if (!Core.firstTimeLoaded) return;
    if (!orderForm) return;
    console.log("selectDefaultPayment firstTimeLoaded", orderForm);
    console.log("orderForm", orderForm);
    var userProfileId = orderForm.userProfileId;
    if (!userProfileId) return;
    $.ajax({
      url: `/api/dataentities/CL/search?userId=${userProfileId}&_fields=id,defaultpaymentmethod`,
      type: "get",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      async: true,
    }).done(function (response) {
      console.log("defaultpaymentmethod", response);
      if (!response[0]) return;
      Core.userDocumentId = response[0].id;
      Core.selectedCardIndex = response[0].defaultpaymentmethod
        ? parseInt(response[0].defaultpaymentmethod)
        : 0;
      Core.setPaymentIndex(orderForm);
    });
  },
  setPaymentIndex: function (orderForm) {
    // setTimeout(function() {
    console.log("Core.selectedCardIndex", Core.selectedCardIndex);
    if (Core.selectedCardIndex === null) return;
    Core.firstTimeLoaded = false;
    console.log("setPaymentIndex rodou");
    var defaultCreditCardIndex = Core.selectedCardIndex;
    console.log("defaultCreditCardIndex", defaultCreditCardIndex);
    var paymentData = orderForm.paymentData;
    var selectedPayment = paymentData.availableAccounts[defaultCreditCardIndex];
    if (!paymentData.payments.length) return;
    if (!selectedPayment) return;
    if (paymentData.payments[0].accountId === selectedPayment.accountId) return;
    var payment = {
      hasDefaultBillingAddress: selectedPayment.availableAddresses.length > 0,
      installmentsInterestRate: 0,
      referenceValue: orderForm.value,
      bin: selectedPayment.bin,
      accountId: selectedPayment.accountId,
      value: orderForm.value,
      tokenId: null,
      paymentSystem: selectedPayment.paymentSystem,
      installments: 1,
    };
    return vtexjs.checkout.sendAttachment("paymentData", {
      payments: [payment],
    });
    // }, 1000)
  },
  updatePaymentInMasterData: function () {
    window.addEventListener("message", function (e) {
      if (e.data.event === "updatePayments.vtex") {
        e.preventDefault();
        console.log("updatePayments.vtex", e.data);
        vtexjs.checkout.getOrderForm().then(function (orderForm) {
          var selectedPayment = e.data.arguments[0][0];
          var availableAccounts = orderForm.paymentData.availableAccounts;
          var newSelectedPayment = availableAccounts.find(function (payment) {
            return selectedPayment.accountId === payment.accountId;
          });
          var selectedIndex = availableAccounts.indexOf(newSelectedPayment);
          console.log("selectedIndex", selectedIndex);
          console.log("selectedIndex", Core.selectedCardIndex);
          if (
            selectedIndex !== Core.selectedCardIndex &&
            !Core.firstTimeLoaded
          ) {
            Core.selectedCardIndex = selectedIndex;
            console.log("vai atualizar");
          }
        });
      }
    });
  },
  setFakeBuyButton: function () {
    var fakeBuybutton = document.querySelector("#set-default-credit-card");
    $(document).ajaxStart(function () {
      fakeBuybutton.querySelector(".icon-spinner").style.display =
        "inline-block";
      fakeBuybutton.querySelector(".icon-lock").style.display = "none";
      fakeBuybutton.setAttribute("disabled", "disabled");
    });

    $(document).ajaxStop(function () {
      fakeBuybutton.querySelector(".icon-spinner").style.display = "none";
      fakeBuybutton.querySelector(".icon-lock").style.display = "inline-block";
      fakeBuybutton.removeAttribute("disabled");
    });
  },
  updateCreditCardInMasterData: function () {
    var fakeBuybutton = document.querySelector("#set-default-credit-card");
    fakeBuybutton.addEventListener("click", function (e) {
      e.preventDefault();
      var defaultCreditCardOptIn = document.querySelector(
        "#opt-default-credit-card"
      );
      var event = new Event("click");
      var buyButtons = document.querySelectorAll("#payment-data-submit");
      if (defaultCreditCardOptIn) {
        if (defaultCreditCardOptIn.checked && Core.userDocumentId) {
          $.ajax({
            url: "/api/dataentities/CL/documents/" + Core.userDocumentId,
            type: "patch",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            data: JSON.stringify({
              defaultpaymentmethod: Core.selectedCardIndex,
            }),
            async: true,
          }).then(
            function (response) {
              console.log("default payment method atualizado", response);
              buyButtons[1].dispatchEvent(event);
            },
            function (e) {
              console.error("payment error", e);
              buyButtons[1].dispatchEvent(event);
            }
          );
          return;
        }
      }
      buyButtons[1].dispatchEvent(event);
    });
  },
  getSubstitutionPreferences: function (orderForm) {
    $.ajax({
      url:
        "/api/dataentities/CL/search?userId=" +
        orderForm.userProfileId +
        "&_fields=productsubstitution",
      type: "GET",
      dataType: "json",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      success: function (option) {
        if (!option[0]) return;
        $("[value=" + option[0].productsubstitution + "]").trigger("click");
        $("th.substitute select").val(option[0].productsubstitution);
        $("th.substitute select").trigger("change");
      },
    }).done(function (option) {
      // console.log(option)
    });
  },
  hideDefaultCreditCardCheckBox: function (orderForm) {
    var creditCardLabel = document.querySelector(".credit-card-label");
    if (!orderForm.paymentData.payments.length) return;
    if (!orderForm.paymentData.availableAccounts.length) return;
    if (orderForm.paymentData.payments[0].paymentSystem === "2") {
      if (creditCardLabel) creditCardLabel.style.display = "inline-block";
    } else {
      if (creditCardLabel) creditCardLabel.style.display = "none";
    }
  },
  getCategoryIcon: function (categoryId) {
    switch (categoryId) {
      case "" || null || undefined:
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 333332 300207" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd"><path d="M247189 42440c35067 0 63494 28427 63494 63493 0 35067-28427 63494-63494 63494-35066 0-63493-28427-63493-63494 0-35066 28427-63493 63493-63493zM7476 0h318254c4200 0 7602 3401 7602 7601 0 2300-1000 4401-2701 5802l-28937 36773c-3815-3729-8005-7071-12517-9961l17978-25013H25579l103011 125247c1600 1400 2600 3401 2600 5702v133323l57117-26105v-96315c4480 5156 9624 9718 15302 13552v87165c0 3000-1700 5600-4301 6801l-71819 34606c-3601 2101-8202 900-10302-2801-700-1199-1000-2500-1000-3800V149252L2175 12903c-2901-3000-2901-7701 0-10702C3675 701 5576 1 7476 1zm255460 76720c3604-3660 9464-3677 13089-35 3622 3639 3638 9559 35 13217l-15814 16041 15831 16056c3574 3630 3525 9512-107 13137-3633 3624-9476 3615-13047-16l-15725-15944-15753 15975c-3604 3661-9464 3677-13089 35-3622-3639-3639-9558-35-13217l15815-16040-15831-16056c-3574-3630-3525-9512 107-13137 3633-3624 9476-3615 13047 17l15725 15945 15752-15976z"/></svg>';
      case "1":
        return '<svg enable-background="new 0 0 512 512" version="1.1" viewBox="0 0 512 512" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path d="m187.07 308.7c-0.13-0.64-0.32-1.27-0.57-1.87-0.25-0.61-0.56-1.19-0.92-1.73-0.37-0.55-0.79-1.06-1.25-1.52-2.32-2.32-5.77-3.39-9.02-2.73-0.64 0.13-1.27 0.32-1.87 0.57-0.61 0.25-1.19 0.56-1.73 0.92-0.55 0.36-1.06 0.78-1.52 1.24s-0.88 0.97-1.24 1.52c-0.36 0.54-0.67 1.12-0.92 1.73-0.25 0.6-0.44 1.23-0.57 1.87s-0.2 1.3-0.2 1.95 0.07 1.31 0.2 1.96c0.13 0.63 0.32 1.26 0.57 1.87 0.25 0.6 0.56 1.18 0.92 1.72 0.36 0.55 0.78 1.06 1.24 1.52s0.97 0.88 1.52 1.25c0.54 0.36 1.12 0.67 1.73 0.92 0.6 0.25 1.23 0.44 1.87 0.57s1.3 0.19 1.95 0.19c2.63 0 5.21-1.07 7.07-2.93 0.46-0.46 0.88-0.97 1.25-1.52 0.36-0.54 0.67-1.12 0.92-1.72 0.25-0.61 0.44-1.24 0.57-1.87 0.13-0.65 0.19-1.31 0.19-1.96s-0.06-1.31-0.19-1.95z"/><path d="m502 481.38h-20.714v-150.8c0-16.506-13.428-29.934-29.934-29.934h-17.077v-98.64c0-16.505-13.428-29.934-29.934-29.934h-30.698v-29.034c6.86-1.732 13.354-5.269 18.71-10.625 12.311-12.31 15.405-31.069 7.699-46.682l-27.442-55.595c-1.685-3.413-5.161-5.574-8.967-5.574s-7.282 2.161-8.967 5.574l-27.442 55.596c-7.706 15.611-4.612 34.371 7.699 46.682 5.356 5.356 11.85 8.893 18.71 10.625v29.034h-87.643v-42.988c6.86-1.732 13.354-5.269 18.71-10.625 12.311-12.31 15.404-31.069 7.699-46.682l-27.442-55.596c-1.685-3.413-5.161-5.574-8.967-5.574s-7.282 2.161-8.967 5.574l-27.442 55.597c-7.705 15.612-4.611 34.371 7.699 46.681 5.356 5.356 11.85 8.893 18.71 10.625v42.988h-87.643v-29.003c7.02-1.77 13.458-5.404 18.71-10.656 12.311-12.31 15.405-31.07 7.699-46.682l-27.442-55.596c-1.685-3.413-5.161-5.574-8.967-5.574s-7.282 2.161-8.967 5.574l-27.442 55.597c-7.705 15.611-4.611 34.371 7.699 46.682 5.252 5.252 11.69 8.886 18.71 10.656v29.003h-30.698c-16.506 0-29.934 13.428-29.934 29.934v98.64h-17.077c-16.506 0-29.934 13.428-29.934 29.934v150.8h-20.714c-5.523 0-10 4.477-10 10s4.477 10 10 10h492c5.523 0 10-4.477 10-10s-4.477-10.002-10-10.002zm-152.92-363.11c-6.247-6.246-7.816-15.765-3.906-23.687l18.475-37.429 18.475 37.429c3.91 7.922 2.34 17.441-3.906 23.687-1.387 1.387-2.932 2.518-4.568 3.426-6.201 3.442-13.799 3.442-20 0-1.638-0.907-3.183-2.038-4.57-3.426zm-107.64-13.953c-6.246-6.246-7.816-15.765-3.906-23.687l18.474-37.428 18.475 37.429c3.91 7.922 2.34 17.441-3.906 23.687-1.387 1.387-2.932 2.518-4.568 3.426-6.2 3.442-13.799 3.442-20 0-1.637-0.909-3.182-2.039-4.569-3.427zm-107.64 13.953c-6.247-6.246-7.816-15.765-3.906-23.687l18.475-37.429 18.475 37.429c3.91 7.921 2.34 17.44-3.906 23.687-1.387 1.387-2.932 2.518-4.568 3.426-6.2 3.442-13.799 3.442-20 0-1.638-0.907-3.183-2.038-4.57-3.426zm-26.13 73.802h296.68c5.478 0 9.934 4.456 9.934 9.934v31.396c-4.406 1.384-9.153 2.021-14.755 2.021-14.914 0-21.72-4.537-30.336-10.281-9.591-6.394-20.461-13.64-41.43-13.64-20.968 0-31.838 7.246-41.428 13.64-8.616 5.744-15.421 10.281-30.334 10.281s-21.718-4.537-30.333-10.281c-9.59-6.393-20.459-13.64-41.427-13.64-20.967 0-31.836 7.247-41.426 13.64-8.615 5.744-15.42 10.281-30.331 10.281-5.6 0-10.345-0.638-14.75-2.02v-31.397h-1e-3c0-5.478 4.457-9.934 9.934-9.934zm353.63 289.31h-410.57v-96.109c8.502 1.564 13.918 5.168 20.333 9.445 9.59 6.394 20.459 13.64 41.428 13.64 20.967 0 31.836-7.247 41.426-13.64 8.615-5.744 15.42-10.281 30.331-10.281 14.912 0 21.718 4.537 30.333 10.281 9.59 6.394 20.459 13.64 41.427 13.64 20.969 0 31.838-7.247 41.428-13.64 8.616-5.744 15.421-10.281 30.334-10.281 14.914 0 21.72 4.537 30.336 10.281 9.591 6.393 20.46 13.64 41.43 13.64 20.969 0 31.839-7.247 41.43-13.64 6.416-4.277 11.833-7.882 20.336-9.446v96.11zm0-116.34c-14.683 1.87-23.495 7.744-31.43 13.034-8.616 5.744-15.422 10.281-30.336 10.281s-21.719-4.537-30.336-10.281c-9.591-6.393-20.461-13.64-41.43-13.64-20.968 0-31.838 7.247-41.428 13.64-8.616 5.744-15.421 10.281-30.334 10.281s-21.718-4.537-30.333-10.281c-9.59-6.394-20.459-13.64-41.428-13.64-20.967 0-31.836 7.247-41.426 13.64-8.615 5.744-15.42 10.281-30.331 10.281-14.913 0-21.718-4.537-30.333-10.281-7.935-5.29-16.745-11.164-31.427-13.034v-34.46c0-5.478 4.457-9.934 9.934-9.934h76.745c5.523 0 10-4.477 10-10s-4.477-10-10-10h-39.668v-46.631c4.602 0.941 9.464 1.41 14.75 1.41 20.967 0 31.836-7.247 41.426-13.64 8.615-5.744 15.42-10.281 30.331-10.281 14.913 0 21.718 4.537 30.333 10.281 9.59 6.393 20.459 13.64 41.427 13.64s31.838-7.247 41.428-13.64c8.616-5.744 15.421-10.281 30.334-10.281 14.914 0 21.72 4.537 30.336 10.281 9.591 6.394 20.461 13.64 41.43 13.64 5.288 0 10.152-0.47 14.755-1.411v46.633h-197.15c-5.523 0-10 4.477-10 10s4.477 10 10 10h234.22c5.478 0 9.934 4.457 9.934 9.934v34.459z"/><path d="m97.53 456.54c-0.13-0.64-0.32-1.27-0.57-1.87s-0.56-1.18-0.92-1.73c-0.37-0.54-0.78-1.05-1.25-1.52-0.46-0.46-0.97-0.87-1.52-1.24-0.54-0.36-1.12-0.67-1.72-0.92s-1.23-0.44-1.87-0.57c-3.25-0.65-6.7 0.41-9.03 2.73-0.46 0.47-0.88 0.98-1.24 1.52-0.36 0.55-0.67 1.13-0.92 1.73s-0.44 1.23-0.57 1.87c-0.13 0.65-0.19 1.3-0.19 1.96 0 0.65 0.06 1.3 0.19 1.95 0.13 0.64 0.32 1.27 0.57 1.87s0.56 1.18 0.92 1.73c0.36 0.54 0.78 1.05 1.24 1.52 1.86 1.86 4.44 2.93 7.08 2.93 0.65 0 1.3-0.07 1.95-0.2 0.64-0.13 1.27-0.32 1.87-0.57s1.18-0.56 1.72-0.92c0.55-0.37 1.06-0.78 1.52-1.24 0.47-0.47 0.88-0.98 1.25-1.52 0.36-0.55 0.67-1.13 0.92-1.73s0.44-1.23 0.57-1.87c0.13-0.65 0.2-1.3 0.2-1.95 0-0.66-0.07-1.309-0.2-1.96z"/><path d="m205.01 426.64c-0.13-0.64-0.32-1.27-0.57-1.87s-0.56-1.18-0.92-1.73c-0.37-0.54-0.79-1.06-1.25-1.52s-0.97-0.88-1.52-1.24c-0.54-0.36-1.12-0.67-1.72-0.92-0.61-0.25-1.24-0.44-1.87-0.57-1.29-0.26-2.62-0.26-3.91 0-0.64 0.13-1.27 0.32-1.87 0.57-0.61 0.25-1.19 0.56-1.73 0.92-0.55 0.36-1.06 0.78-1.52 1.24s-0.88 0.98-1.24 1.52c-0.36 0.55-0.67 1.13-0.92 1.73s-0.44 1.23-0.57 1.87c-0.13 0.65-0.2 1.3-0.2 1.95 0 0.66 0.07 1.31 0.2 1.96 0.13 0.64 0.32 1.27 0.57 1.87s0.56 1.18 0.92 1.73c0.36 0.54 0.78 1.06 1.24 1.52s0.97 0.87 1.52 1.24c0.54 0.36 1.12 0.67 1.73 0.92 0.6 0.25 1.23 0.44 1.87 0.57s1.3 0.2 1.95 0.2 1.31-0.07 1.96-0.2c0.63-0.13 1.26-0.32 1.87-0.57 0.6-0.25 1.18-0.56 1.72-0.92 0.55-0.37 1.06-0.78 1.52-1.24s0.88-0.98 1.25-1.52c0.36-0.55 0.67-1.13 0.92-1.73s0.44-1.23 0.57-1.87c0.13-0.65 0.19-1.3 0.19-1.96 0-0.65-0.06-1.3-0.19-1.95z"/><path d="m320.62 456.54c-0.13-0.64-0.32-1.27-0.57-1.87s-0.56-1.18-0.92-1.73c-0.36-0.54-0.78-1.05-1.24-1.52-0.46-0.46-0.97-0.87-1.52-1.24-0.54-0.36-1.12-0.67-1.73-0.92-0.6-0.25-1.23-0.44-1.87-0.57-1.29-0.26-2.62-0.26-3.91 0-0.63 0.13-1.26 0.32-1.87 0.57-0.6 0.25-1.18 0.56-1.72 0.92-0.55 0.37-1.06 0.78-1.52 1.24-0.46 0.47-0.88 0.98-1.25 1.52-0.36 0.55-0.67 1.13-0.92 1.73s-0.44 1.23-0.57 1.87c-0.13 0.65-0.19 1.3-0.19 1.96 0 0.65 0.06 1.3 0.19 1.95 0.13 0.64 0.32 1.27 0.57 1.87s0.56 1.18 0.92 1.73c0.37 0.54 0.79 1.06 1.25 1.52s0.97 0.88 1.52 1.24c0.54 0.36 1.12 0.67 1.72 0.92 0.61 0.25 1.24 0.44 1.87 0.57 0.65 0.13 1.31 0.2 1.96 0.2 2.63 0 5.21-1.07 7.07-2.93 0.46-0.46 0.88-0.98 1.24-1.52 0.36-0.55 0.67-1.13 0.92-1.73s0.44-1.23 0.57-1.87c0.13-0.65 0.2-1.3 0.2-1.95 0-0.66-0.07-1.31-0.2-1.96z"/><path d="m434.08 432.62c-0.13-0.64-0.32-1.27-0.57-1.87s-0.56-1.19-0.92-1.73-0.78-1.06-1.24-1.52c-1.87-1.86-4.44-2.93-7.07-2.93-2.64 0-5.21 1.07-7.08 2.93-0.46 0.46-0.87 0.98-1.24 1.52-0.36 0.54-0.67 1.13-0.92 1.73s-0.44 1.23-0.57 1.87-0.19 1.3-0.19 1.95c0 0.66 0.06 1.31 0.19 1.96 0.13 0.64 0.32 1.27 0.57 1.87s0.56 1.18 0.92 1.72c0.37 0.55 0.78 1.06 1.24 1.53 0.47 0.46 0.98 0.87 1.52 1.24 0.55 0.36 1.13 0.67 1.73 0.92s1.23 0.44 1.87 0.57c0.65 0.13 1.3 0.19 1.96 0.19 2.63 0 5.21-1.06 7.07-2.92 0.46-0.47 0.88-0.98 1.24-1.53 0.36-0.54 0.67-1.12 0.92-1.72 0.25-0.61 0.44-1.23 0.57-1.87 0.13-0.65 0.2-1.3 0.2-1.96 0-0.651-0.07-1.31-0.2-1.95z"/><path d="m334.58 269.16c-0.13-0.63-0.32-1.26-0.57-1.87-0.25-0.6-0.56-1.18-0.92-1.72-0.37-0.55-0.79-1.06-1.25-1.52-0.46-0.47-0.97-0.88-1.52-1.25-0.54-0.36-1.12-0.67-1.72-0.92-0.61-0.25-1.24-0.44-1.87-0.57-1.29-0.26-2.62-0.26-3.91 0-0.64 0.13-1.27 0.32-1.87 0.57-0.61 0.25-1.19 0.56-1.73 0.92-0.55 0.37-1.06 0.78-1.52 1.25-0.46 0.46-0.88 0.97-1.24 1.52-0.36 0.54-0.67 1.12-0.92 1.72-0.25 0.61-0.44 1.24-0.57 1.87-0.13 0.65-0.2 1.31-0.2 1.96s0.07 1.31 0.2 1.95 0.32 1.27 0.57 1.87 0.56 1.19 0.92 1.73c0.36 0.55 0.78 1.06 1.24 1.52s0.97 0.88 1.52 1.24c0.54 0.36 1.12 0.67 1.73 0.92 0.6 0.25 1.23 0.44 1.87 0.57s1.3 0.2 1.95 0.2 1.31-0.07 1.96-0.2c0.63-0.13 1.26-0.32 1.87-0.57 0.6-0.25 1.18-0.56 1.72-0.92 0.55-0.36 1.06-0.78 1.52-1.24s0.88-0.97 1.25-1.52c0.36-0.54 0.67-1.13 0.92-1.73s0.44-1.23 0.57-1.87 0.19-1.3 0.19-1.95-0.06-1.31-0.19-1.96z"/><path d="m204.01 255.54c-0.13-0.64-0.32-1.27-0.57-1.87s-0.56-1.18-0.92-1.73c-0.36-0.54-0.78-1.06-1.24-1.52s-0.98-0.88-1.52-1.24c-0.55-0.36-1.13-0.67-1.73-0.92s-1.23-0.44-1.87-0.57c-1.29-0.26-2.62-0.26-3.91 0-0.64 0.13-1.27 0.32-1.87 0.57s-1.18 0.56-1.73 0.92c-0.54 0.36-1.05 0.78-1.52 1.24-0.46 0.46-0.87 0.98-1.24 1.52-0.36 0.55-0.67 1.13-0.92 1.73s-0.44 1.23-0.57 1.87c-0.13 0.65-0.19 1.3-0.19 1.96 0 0.65 0.06 1.3 0.19 1.95 0.13 0.64 0.32 1.27 0.57 1.87s0.56 1.18 0.92 1.73c0.37 0.54 0.78 1.05 1.24 1.52 0.47 0.46 0.98 0.87 1.52 1.24 0.55 0.36 1.13 0.67 1.73 0.92s1.23 0.44 1.87 0.57c0.65 0.13 1.3 0.2 1.96 0.2 0.65 0 1.31-0.07 1.95-0.2s1.27-0.32 1.87-0.57 1.18-0.56 1.73-0.92c0.54-0.37 1.06-0.78 1.52-1.24 0.46-0.47 0.87-0.98 1.24-1.52 0.36-0.55 0.67-1.13 0.92-1.73s0.44-1.23 0.57-1.87c0.13-0.65 0.19-1.3 0.19-1.95 0-0.661-0.06-1.311-0.19-1.96z"/> </svg>';
      case "9":
        return '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 128 128"><g><path d="M85.851,37.766h-43.7a1.75,1.75,0,0,0-1.359,2.852L62.641,67.564a1.749,1.749,0,0,0,2.718,0L87.21,40.618a1.75,1.75,0,0,0-1.359-2.852ZM64,63.684,45.822,41.266H82.178Z"/><path d="M121.693,4.557H95.224a1.748,1.748,0,0,0-1.359.647L79.256,23.215H37.06A16.321,16.321,0,1,0,29.7,38.647l27.985,34.51v39.92l-18.459,6.98a1.75,1.75,0,0,0,.619,3.386H88.157a1.75,1.75,0,0,0,.619-3.386l-18.459-6.98V73.157L108.5,26.067a1.749,1.749,0,0,0-1.359-2.852H92.457l6.818-8.406h22.418a1.75,1.75,0,0,0,1.75-1.75V6.307A1.749,1.749,0,0,0,121.693,4.557ZM20.857,37.766A12.8,12.8,0,1,1,33.524,23.215H20.857A1.749,1.749,0,0,0,19.5,26.067l7.98,9.841A12.825,12.825,0,0,1,20.857,37.766ZM67.208,71.434a1.755,1.755,0,0,0-.391,1.1v41.75a1.75,1.75,0,0,0,1.131,1.636l10.633,4.021H49.418l10.634-4.021a1.75,1.75,0,0,0,1.131-1.636V72.536a1.755,1.755,0,0,0-.391-1.1L24.529,26.715h78.942Zm52.735-60.125h-21.5a1.75,1.75,0,0,0-1.359.647L87.95,23.215H83.762l12.3-15.158h23.885Z"/></g></svg>';
      case "15":
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="512" height="512"><path d="M48 50H34a3 3 0 000 6h14a3 3 0 000-6zm0 4H34a1 1 0 010-2h14a1 1 0 010 2z"/><path d="M57.954 46.89a1 1 0 00-.994-.89H55v-3a1 1 0 00-1-1h-1v-1a3.006 3.006 0 00-2-2.829V34.75A2.752 2.752 0 0048.25 32h-.5a.751.751 0 01-.75-.75v-.625A3.629 3.629 0 0043.375 27H42a1 1 0 00-1 1v3.5a2.5 2.5 0 01-2.5 2.5H34a3 3 0 00-3 3v1.171A3.006 3.006 0 0029 41v1h-1a1 1 0 00-1 1v3h-1.04a1 1 0 00-.994.89L24 55.59V25a1 1 0 00-1-1h-1v-6a.925.925 0 00-.02-.2l-1-5A1 1 0 0020 12h-1V8h3a1 1 0 001-1V3a1 1 0 00-1-1h-7a1.012 1.012 0 00-.372.071l-5 2A1 1 0 009 5v7H8a1 1 0 00-.98.8l-1 5A.925.925 0 006 18v6H5a1 1 0 00-1 1v34a3 3 0 003 3h14a3 3 0 003-3v-1.556a5.744 5.744 0 001.32 2.806A4.868 4.868 0 0028.96 62h25a4.868 4.868 0 003.64-1.75 5.6 5.6 0 001.354-4.36zM11 5.677L15.192 4H21v2h-3a1 1 0 00-1 1v5h-6zM8 18.1l.82-4.1h10.36l.82 4.1V24H8zM22 59a1 1 0 01-1 1H7a1 1 0 01-1-1V30h16zm0-31H6v-2h16zm9 13a1 1 0 011-1h5v-2h-4v-1a1 1 0 011-1h4.5a4.505 4.505 0 004.5-4.5V29h.375A1.627 1.627 0 0145 30.625v.625A2.752 2.752 0 0047.75 34h.5a.751.751 0 01.75.75V38h-7v2h8a1 1 0 011 1v1H31zm-2 3h24v2H29zm27.089 14.939A2.837 2.837 0 0153.96 60h-25a2.835 2.835 0 01-2.129-1.06 3.6 3.6 0 01-.877-2.83l.9-8.11h29.21l.905 8.142a3.578 3.578 0 01-.88 2.797z"/><path d="M54.94 51.8l-1.961.392L53.74 56H51v2h2.74a2 2 0 001.96-2.393zM9 56h4a1 1 0 001-1V33a1 1 0 00-1-1H9a1 1 0 00-1 1v22a1 1 0 001 1zm1-22h2v20h-2zM18 32h2v2h-2zM18 36h2v2h-2zM10 17v4h2v-3h2v-2h-3a1 1 0 00-1 1z"/></svg>';
      case "24":
        return '<svg id="Capa_1" enable-background="new 0 0 512 512" height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg"><g><path d="m477.854 273.851c-5.839-2.919-9.747-8.412-10.652-14.733h.223c9.649 0 17.5-7.851 17.5-17.5v-24c0-9.649-7.851-17.5-17.5-17.5h-152c-9.649 0-17.5 7.851-17.5 17.5v24c0 8.626 6.28 15.797 14.504 17.225-.83 6.437-4.762 12.047-10.685 15.009-11.81 5.904-19.146 17.775-19.146 30.979v169.669c0 20.678 16.822 37.5 37.5 37.5h139.4c20.678 0 37.5-16.822 37.5-37.5v-169.671c.002-13.203-7.334-25.074-19.144-30.978zm-164.928-56.234c0-1.379 1.121-2.5 2.5-2.5h152c1.379 0 2.5 1.121 2.5 2.5v24c0 1.379-1.121 2.5-2.5 2.5h-152c-1.379 0-2.5-1.121-2.5-2.5zm169.074 256.883c0 12.406-10.094 22.5-22.5 22.5h-139.4c-12.406 0-22.5-10.094-22.5-22.5v-26.766h184.4zm0-149.393h-42.649c-4.143 0-7.5 3.357-7.5 7.5s3.357 7.5 7.5 7.5h42.649v92.627h-184.4v-92.627h106.751c4.143 0 7.5-3.357 7.5-7.5s-3.357-7.5-7.5-7.5h-106.751v-20.278c0-7.485 4.159-14.215 10.854-17.562 10.958-5.479 18.054-16.098 19.021-28.149h124.648c.967 12.051 8.063 22.67 19.021 28.149 6.695 3.348 10.854 10.077 10.854 17.562v20.278zm-334.021-61.699h-18c-7.444 0-13.5 6.056-13.5 13.5v30h-30c-7.444 0-13.5 6.056-13.5 13.5v18c0 7.444 6.056 13.5 13.5 13.5h30v30c0 7.444 6.056 13.5 13.5 13.5h18c7.444 0 13.5-6.056 13.5-13.5v-30h30c7.444 0 13.5-6.056 13.5-13.5v-18c0-7.444-6.056-13.5-13.5-13.5h-30v-30c0-7.444-6.056-13.5-13.5-13.5zm42 58.5v15h-33c-5.79 0-10.5 4.71-10.5 10.5v33h-15v-33c0-5.79-4.71-10.5-10.5-10.5h-33v-15h33c5.79 0 10.5-4.71 10.5-10.5v-33h15v33c0 5.79 4.71 10.5 10.5 10.5zm7.356-219.649v-22.125c9.212-1.013 16.405-8.811 16.405-18.258v-32.625c0-16.129-13.177-29.251-29.374-29.251h-90.776c-16.197 0-29.374 13.122-29.374 29.251v32.625c0 9.448 7.193 17.246 16.405 18.258v22.125l-53.799 53.496c-7.624 7.58-11.822 17.662-11.822 28.389v115.265c0 4.143 3.357 7.5 7.5 7.5s7.5-3.357 7.5-7.5v-64.629h217.956v189.256h-217.956v-89.628c0-4.143-3.357-7.5-7.5-7.5s-7.5 3.357-7.5 7.5v137.466c0 22.126 18.083 40.126 40.311 40.126h167.335c22.228 0 40.311-18 40.311-40.126v-287.73c0-10.726-4.198-20.808-11.821-28.389zm50.621 369.615c0 13.854-11.354 25.126-25.311 25.126h-167.334c-13.957 0-25.311-11.271-25.311-25.126v-32.838h217.956zm-168.74-409.998v-32.625c0-7.858 6.448-14.251 14.374-14.251h90.776c7.926 0 14.374 6.393 14.374 14.251v32.625c0 1.861-1.542 3.376-3.438 3.376h-112.649c-1.895 0-3.437-1.515-3.437-3.376zm103.119 18.376v17.626h-86.714v-17.626zm65.621 139.528h-217.956v-35.637c0-6.704 2.628-13.008 7.398-17.752l53.817-53.514h95.526l53.818 53.514c4.771 4.744 7.397 11.048 7.397 17.752z"/></g></svg>'
      case "29":
        return '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><path d="M305.283 259.463a51.393 51.393 0 00-98.566 0A51.395 51.395 0 10256 346.665a50.918 50.918 0 0034.712 13.472 51.392 51.392 0 0014.571-100.674zm-14.571 84.674a35.13 35.13 0 01-28.316-14.16 8 8 0 00-12.792 0 35.39 35.39 0 11-34.8-56.017 8 8 0 006.41-6.41 35.385 35.385 0 0169.574 0 8 8 0 006.41 6.41 35.388 35.388 0 01-6.485 70.177zM196.137 203.355a34.629 34.629 0 0011.518 2.023 30.862 30.862 0 0015.529-4.141c8.078-4.663 13.532-12.606 15.358-22.365a42.046 42.046 0 00-26.683-46.217c-9.364-3.3-18.971-2.546-27.047 2.117s-13.532 12.607-15.358 22.366a42.046 42.046 0 0026.683 46.217zm-10.957-43.274a16.284 16.284 0 017.632-11.452 15.014 15.014 0 017.567-1.979 18.592 18.592 0 016.166 1.1 26.076 26.076 0 0116.271 28.182 15.518 15.518 0 01-21.365 12.335 26.078 26.078 0 01-16.271-28.183zM177.7 261.068c12.241-14.224 9.152-37.026-6.886-50.828s-39.045-13.456-51.287.767c-6.083 7.07-8.608 16.368-7.109 26.183a41.972 41.972 0 0040.51 34.775c9.485 0 18.526-3.645 24.772-10.897zm-12.128-10.437c-6.485 7.539-19.37 7.122-28.722-.924a24.9 24.9 0 01-8.615-14.934 15.544 15.544 0 0116.04-18.722 25.084 25.084 0 0116.1 6.316c9.349 8.048 11.68 20.727 5.193 28.264zM288.815 200.487a30.777 30.777 0 0015.486 4.1c12.72 0 25.733-7.423 33.176-20.315 10.579-18.324 5.964-40.866-10.289-50.249-8.077-4.665-17.683-5.418-27.047-2.118a40.9 40.9 0 00-21.614 18.333c-10.579 18.324-5.964 40.862 10.288 50.249zm3.569-42.25A24.9 24.9 0 01305.455 147a18.57 18.57 0 016.166-1.1 15.011 15.011 0 017.567 1.979c8.612 4.973 10.6 17.71 4.432 28.393s-18.193 15.33-26.805 10.36-10.599-17.711-4.431-28.395zM399.586 234.4c1.5-9.815-1.026-19.113-7.109-26.183-6.069-7.052-14.858-10.932-24.756-10.932h-.075A42.049 42.049 0 00327.2 232.1c-1.5 9.815 1.026 19.113 7.109 26.183 6.069 7.052 14.858 10.933 24.756 10.932h.075a42.051 42.051 0 0040.451-34.81zm-15.817-2.417a26.074 26.074 0 01-24.669 21.23h-.042a15.514 15.514 0 01-16.05-18.7 26.074 26.074 0 0124.665-21.227h.042a15.514 15.514 0 0116.05 18.7z"/><path d="M471.306 373.185a42.639 42.639 0 00-16.239-14.4 224 224 0 10-95.835 96.033l35.761 23.84a8 8 0 008.875 0l53.984-35.99a49.961 49.961 0 0019.6-25.654 49.418 49.418 0 00-5.8-43.32zM256 464c-114.691 0-208-93.309-208-208S141.309 48 256 48s208 93.309 208 208a208.093 208.093 0 01-24.684 98.332 41.692 41.692 0 00-3.544-.164 42.6 42.6 0 00-16.865 3.457A191.908 191.908 0 00448 256c0-105.869-86.131-192-192-192S64 150.131 64 256s86.131 192 192 192a190.392 190.392 0 0074.35-14.943 49.673 49.673 0 0010.658 9.609l2.86 1.907A208.591 208.591 0 01256 464zm71.557-90.818l-.344.513a49.421 49.421 0 00-5.8 43.318c.237.712.494 1.416.764 2.115A174.579 174.579 0 01256 432c-97.047 0-176-78.953-176-176S158.953 80 256 80s176 78.953 176 176a175.858 175.858 0 01-38.964 110.438 42.7 42.7 0 00-65.479 6.744zm134.712 38.771a33.9 33.9 0 01-13.291 17.4l-49.548 33.032-49.548-33.031a33.809 33.809 0 01-9.014-8.918 7.905 7.905 0 00-1.884-3.029 33.554 33.554 0 011.54-34.834l.344-.513a26.705 26.705 0 0141.1-4.07l11.8 11.8a8 8 0 0011.314 0l11.8-11.8a26.658 26.658 0 0125.018-7.1 26.64 26.64 0 0116.1 11.172l.338.508a33.523 33.523 0 013.931 29.383z"/></svg>'
      case "30":
        return '<svg height="512" viewBox="0 0 64 64" width="512" xmlns="http://www.w3.org/2000/svg"><g id="outline"><path d="m58 4a1 1 0 0 0 -.757-.97l-4-1a1.817 1.817 0 0 0 -.243-.03h-10c-4.257 0-9 2.875-9 7a1 1 0 0 0 1 1h3v5.891l-1.8 8.109h-23.2a1 1 0 0 0 -1 1v6a1 1 0 0 0 1 1h1.074l1.926 25.066a5.222 5.222 0 0 0 5 4.934h24a5.219 5.219 0 0 0 5-4.923l1.926-25.077h1.074a1 1 0 0 0 1-1v-6a1 1 0 0 0 -1-1h-3.2l-1.8-8.109v-3.477l2.414-2.414h1.586v2a2 2 0 0 1 -2 2v2a4 4 0 0 0 4-4v-2.22l3.243-.81a1 1 0 0 0 .757-.97zm-24 22h10v14h-2v-9h-2v9h-2v-5h-2v5h-2zm12.2-9 1.555 7h-9.508l1.553-7zm-6.2-2v-2h6v2zm-26 15v-4h2v2h2v-2h2v2h2v-2h2v2h2v-2h2v2h2v-2h2v4zm31 30h-24a3.11 3.11 0 0 1 -2.739-2h29.479a3.112 3.112 0 0 1 -2.74 2zm3.074-4h-30.148l-1.846-24h15.92v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9h3.92zm1.926-28v-2h2v4h-6v-4h2v2zm2-20h-2a1 1 0 0 0 -.707.293l-2.707 2.707h-6.586v-2a1 1 0 0 0 -1-1h-2.831c.731-2.166 3.705-4 6.831-4h9zm4-.781-2 .5v-3.438l2 .5z"/><path d="m20 14.977a4.987 4.987 0 0 0 9.253 2.6 3.951 3.951 0 0 0 1.747.4 4 4 0 0 0 1-7.877c0-.042 0-.084 0-.126a4 4 0 0 0 -8 0v.1a5.009 5.009 0 0 0 -4 4.903zm4.968-3 .187.016a2.991 2.991 0 0 1 2.095 1l1.5-1.322a5.006 5.006 0 0 0 -2.74-1.588c0-.035-.01-.071-.01-.105a2 2 0 0 1 4 0 1.971 1.971 0 0 1 -.129.677 1 1 0 0 0 .94 1.345c.043 0 .144-.014.189-.018a2 2 0 0 1 0 4 1.98 1.98 0 0 1 -1.441-.622 1 1 0 0 0 -1.686.423 2.992 2.992 0 1 1 -2.905-3.8z"/><path d="m13 19a3 3 0 1 0 3-3 3 3 0 0 0 -3 3zm3-1a1 1 0 1 1 -1 1 1 1 0 0 1 1-1z"/><path d="m10 7a4 4 0 1 0 4 4 4 4 0 0 0 -4-4zm0 6a2 2 0 1 1 2-2 2 2 0 0 1 -2 2z"/><path d="m18 2a3 3 0 1 0 3 3 3 3 0 0 0 -3-3zm0 4a1 1 0 1 1 1-1 1 1 0 0 1 -1 1z"/><path d="m20.992 44.876-1.984.248 1 8a1 1 0 0 0 .992.876h3v-2h-2.117z"/><path d="m26 52h2v2h-2z"/><path d="m30 52h2v2h-2z"/></g></svg>';
      case "33":
        return '<svg id="Capa_1" enable-background="new 0 0 511.994 511.994" height="512" viewBox="0 0 511.994 511.994" width="512" xmlns="http://www.w3.org/2000/svg"><g><path d="m508.711 435.996-49.92-99.32c-1.054-2.097-3.029-3.58-5.336-4.007-2.308-.427-4.683.251-6.417 1.832-3.525 3.213-8.113 4.983-12.917 4.983-10.615 0-19.25-8.64-19.25-19.26 0-9.176 6.526-17.12 15.519-18.891 2.3-.453 4.256-1.955 5.287-4.06s1.018-4.571-.034-6.666l-12.571-25.023c-6.032-11.994-18.12-19.445-31.545-19.446-.001 0-.002 0-.003 0-1.298 0-2.577.09-3.846.227-.329-18.527-.806-37.078-1.439-55.279-.635-18.389-6.042-36.35-15.638-51.942-2.171-3.528-6.791-4.628-10.318-2.456-3.527 2.171-4.627 6.791-2.456 10.318 8.235 13.381 12.876 28.803 13.421 44.6.687 19.713 1.191 39.839 1.518 59.898-5.355 3.355-9.808 8.157-12.784 14.072l-36.693 73.009c-14.205-22.076-34.094-39.201-57.297-39.201-40.472 0-70.865 52.09-78.583 91.697h-.485c-3.958-20.31-13.879-43.897-28.064-62.066-.102-14.291-.104-28.647-.017-43.033 7.749.154 15.516.255 23.304.255 19.46 0 38.999-.479 58.383-1.433 13.141-.647 23.806-10.599 25.36-23.664 2.098-17.642 2.098-35.533 0-53.175-1.554-13.065-12.218-23.017-25.356-23.663-26.229-1.29-52.791-1.701-79.085-1.243 3.91-30.791 22.989-57.27 51.366-70.67h106.366c7.459 3.522 14.42 8.046 20.699 13.491 1.419 1.231 3.168 1.834 4.91 1.834 2.099 0 4.187-.876 5.67-2.586 2.713-3.129 2.376-7.866-.753-10.58-3.379-2.93-6.937-5.621-10.635-8.089 6.486-5.093 10.665-12.998 10.665-21.865 0-12.728-8.602-23.477-20.295-26.759v-26.522c-.003-17.266-14.049-31.313-31.316-31.313h-64.261c-17.266 0-31.313 14.047-31.313 31.313v26.524c-11.694 3.282-20.296 14.031-20.296 26.759 0 8.866 4.177 16.769 10.661 21.862-11.323 7.552-21.146 17.243-28.883 28.612-11.265 16.553-17.586 35.924-18.279 56.016-1.407 40.604-2.068 81.649-1.976 122.273-10.498-8.599-22.448-13.974-35.439-13.974-18.236 0-36.689 11.165-51.96 31.438-2.493 3.308-1.831 8.011 1.478 10.503 3.309 2.493 8.011 1.831 10.503-1.478 7.164-9.51 21.884-25.463 39.98-25.463 14.095 0 28.902 9.871 41.695 27.793 10.13 14.192 17.9 31.947 21.582 48.904h-126.562c1.916-8.8 4.963-17.919 8.979-26.796 1.707-3.774.032-8.217-3.742-9.925-3.773-1.707-8.217-.032-9.925 3.742-4.925 10.887-8.527 22.159-10.601 32.978h-10.298c-10.729 0-19.457 8.728-19.457 19.457 0 10.728 8.729 19.457 19.457 19.457h3.686c1.245 11.49 3.344 22.941 5.397 34.075 1.463 7.934 2.976 16.139 4.126 24.135 1.558 10.797 10.19 19.198 20.996 20.431 19.664 2.235 37.156 3.353 54.655 3.353 17.473 0 34.953-1.114 54.602-3.343 3.586-.408 6.923-1.612 9.854-3.413 7.654 4.435 16.278 6.759 25.257 6.759h67.96l-.019-.005c17.504.001 35.005-1.116 54.679-3.352 5.21-.594 9.905-2.867 13.556-6.26 18.556 6.406 37.858 9.555 57.074 9.555 39.084 0 77.797-12.983 109.075-37.856 11.374-9.037 14.884-25.051 8.344-38.078zm-291.159-404.683c0-8.995 7.318-16.313 16.313-16.313h64.261c8.995 0 16.313 7.318 16.313 16.313v25.487h-96.887zm-7.5 40.487h111.887c7.056 0 12.795 5.74 12.795 12.795 0 7.056-5.74 12.796-12.795 12.796h-111.887c-7.056 0-12.796-5.74-12.796-12.796 0-7.055 5.741-12.795 12.796-12.795zm29.743 127.486c5.802.285 10.512 4.681 11.198 10.452 1.958 16.467 1.958 33.166 0 49.632-.686 5.771-5.397 10.168-11.202 10.453-26.855 1.322-54.004 1.708-80.825 1.173.257-24.325.782-48.687 1.574-72.915 26.344-.484 52.967-.087 79.255 1.205zm133.585 73.03c3.522-6.999 10.303-11.177 18.142-11.177h.002c7.84.001 14.624 4.182 18.145 11.183l8.768 17.452c-11.148 5.761-18.566 17.407-18.566 30.451 0 18.891 15.364 34.26 34.25 34.26 5.289 0 10.435-1.208 15.08-3.489l41.962 83.486c-.045.036-.086.076-.131.112-21.096 16.779-46.322 28.002-72.95 32.456-24.004 4.015-48.769 2.483-72.038-4.381 1.97-10.695 3.943-21.665 5.134-32.674h3.69c10.729 0 19.457-8.728 19.457-19.457s-8.728-19.457-19.457-19.457h-10.296c-2.279-11.695-6.534-24.476-12.444-36.686zm-149.087 69.864c12.794-17.924 27.603-27.795 41.697-27.795 14.098 0 28.907 9.871 41.7 27.795 10.129 14.191 17.898 31.946 21.579 48.903h-126.558c3.681-16.955 11.451-34.71 21.582-48.903zm-209.281 68.36c0-2.458 2-4.457 4.457-4.457h335.399c2.458 0 4.457 1.999 4.457 4.457 0 2.457-1.999 4.457-4.457 4.457h-335.399c-2.458-.001-4.457-2-4.457-4.457zm167.595 82.934c.651-1.674 1.135-3.433 1.399-5.27.701-4.917 1.533-10.776 2.403-17.028.06-.424.092-.658.757-.658.666 0 .698.234.757.652.871 6.259 1.703 12.118 2.405 17.043.439 3.049 1.461 5.897 2.924 8.457-3.712-.497-7.291-1.572-10.645-3.196zm136.357.26c-38.085 4.328-67.768 4.331-105.865.01-4.083-.465-7.342-3.617-7.923-7.657-.699-4.903-1.528-10.744-2.398-16.992-1.12-7.994-7.541-13.577-15.613-13.576-8.072 0-14.492 5.583-15.612 13.583-.869 6.241-1.698 12.083-2.396 16.977-.582 4.048-3.841 7.2-7.921 7.665-38.104 4.321-67.787 4.318-105.865-.01-4.035-.46-7.262-3.614-7.847-7.667-1.192-8.286-2.732-16.639-4.222-24.716-1.903-10.318-3.844-20.913-5.054-31.355h297.836c-1.212 10.47-3.158 21.094-5.065 31.44-1.484 8.052-3.019 16.377-4.211 24.637-.584 4.051-3.811 7.201-7.844 7.661zm172.068-31.4c-41.996 33.395-98.652 43.323-149.523 26.659.046-.26.108-.514.146-.776.511-3.539 1.098-7.119 1.714-10.698 15.67 4.462 31.935 6.725 48.229 6.725 9.684 0 19.378-.797 28.959-2.399 27.71-4.635 54.023-15.983 76.403-32.888.288 5.049-1.81 10.105-5.928 13.377z"/><path d="m398.513 433.389c5.054 7.351 12.668 12.293 21.439 13.917 2.052.38 4.109.568 6.151.568 6.69 0 13.219-2.014 18.851-5.886 7.351-5.054 12.293-12.668 13.917-21.439 1.625-8.771-.265-17.65-5.318-25.001-5.054-7.351-12.668-12.293-21.439-13.917-8.774-1.624-17.65.265-25.001 5.318-7.351 5.054-12.293 12.668-13.917 21.439-1.626 8.772.263 17.651 5.317 25.001zm9.431-22.27c.895-4.832 3.618-9.026 7.667-11.81 3.102-2.133 6.698-3.242 10.383-3.242 1.125 0 2.259.104 3.388.313 4.832.895 9.026 3.617 11.811 7.667 2.784 4.049 3.824 8.94 2.93 13.772-.895 4.832-3.618 9.026-7.667 11.81-4.05 2.784-8.942 3.824-13.771 2.93-4.832-.895-9.026-3.617-11.811-7.667-2.784-4.05-3.825-8.941-2.93-13.773z"/><path d="m367.015 388.403c1.496.277 2.996.414 4.485.414 4.877 0 9.637-1.469 13.743-4.291 5.359-3.685 8.962-9.236 10.146-15.63 1.185-6.395-.193-12.868-3.877-18.228s-9.236-8.963-15.63-10.147c-13.201-2.443-25.93 6.307-28.374 19.508-2.446 13.201 6.306 25.93 19.507 28.374zm-4.759-25.643c.938-5.068 5.826-8.43 10.894-7.489 2.455.455 4.586 1.838 6.001 3.896s1.943 4.543 1.489 6.998c-.455 2.455-1.838 4.587-3.896 6.001-2.057 1.415-4.54 1.944-6.998 1.489-5.068-.94-8.428-5.827-7.49-10.895z"/></g></svg>';
      default:
        return '<svg height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg"><g id="More"><path d="m256 192a64 64 0 1 0 64 64 64.072 64.072 0 0 0 -64-64zm0 112a48 48 0 1 1 48-48 48.055 48.055 0 0 1 -48 48z"/><path d="m72 192a64 64 0 1 0 64 64 64.072 64.072 0 0 0 -64-64zm0 112a48 48 0 1 1 48-48 48.055 48.055 0 0 1 -48 48z"/><path d="m440 192a64 64 0 1 0 64 64 64.072 64.072 0 0 0 -64-64zm0 112a48 48 0 1 1 48-48 48.055 48.055 0 0 1 -48 48z"/></g></svg>';
    }
  },
  updateSubstitutionPreferences: function () {
    var cartButton = document.querySelector("#cart-to-orderform");
    console.log("cartButton", cartButton);
    if (!cartButton) return;
    var items = document.querySelectorAll("tr.product-item");
    if (!items.length) return;
    if (!Core.cartButtonEventAdded) {
      console.log("cartButtonEventAdded", Core.cartButtonEventAdded);
      // Core.cartButtonEventAdded = true;
      cartButton.addEventListener("click", function (e) {
        console.log("event cartButton");
        e.preventDefault();
        var items = document.querySelectorAll("tr.product-item");
        if (!items.length) return;
        var data = {};
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var skuId = item.getAttribute("data-sku");
          console.log("item", item);
          var replaceField = item.querySelector("[name^=substitute]:checked");
          console.log("replaceField: ", replaceField);
          if (!replaceField) continue;
          var selectedValue = Core.getCorrectValue(replaceField.value);
          data[skuId] = {
            substituteType: selectedValue,
            note: "",
          };
        }
        console.log("custom data", data);
        // var orderFormId = vtexjs.checkout.orderForm.orderFormId
        // $.ajax({
        //   url: `/api/checkout/pub/orderForm/${orderFormId}/customData/vtexpicking/skuData`,
        //   type:'PUT',
        //   data: {
        //     value: JSON.stringify(data)
        //   },
        //   async: true,
        //   headers: {
        //     'Accept': 'application/json',
        //     'Content-Type': 'application/json'
        //   },
        // }).done(function(response) {
        //   console.log(response);
        // })
        vtexjs.checkout
          .setCustomData({
            app: "vtexpicking",
            field: "skuData",
            value: JSON.stringify(data),
          })
          .then(function (orderForm) {
            console.log("orderForm Custom data", orderForm);
          });
        console.log("substitution data", data);
      });
    }
  },
  addCategoryToggles: function (orderForm) {
    if (window.location.hash !== "#/cart") {
      var cbyCategoryToggles = document.querySelector(".cby-category-toggles");
      if (cbyCategoryToggles) {
        cbyCategoryToggles.parentNode.removeChild(cbyCategoryToggles);
      }
      return;
    }
    var container = document.querySelector(".container-cart");
    if (!container) return;
    var cbyCategoryToggles = document.querySelector(".cby-category-toggles");
    if (!cbyCategoryToggles) {
      container.insertAdjacentHTML(
        "afterbegin",
        '<div class="cby-category-toggles"></div>'
      );
    }

    cbyCategoryToggles = document.querySelector(".cby-category-toggles");

    var products = {};
    orderForm.items.map(function (item) {
      var categoryId = Object.keys(item.productCategories)[0];
      if (!products[categoryId]) products[categoryId] = {};
      if (!products[categoryId].items) products[categoryId].items = [];
      products[categoryId].items.push(item.id);
      products[categoryId].id = categoryId;
      products[categoryId].name = item.productCategories[categoryId];
      return products;
    });
    Core.categories = products;
    for (var i = 0; i < Object.keys(products).length; i++) {
      var category = products[Object.keys(products)[i]];
      if (document.querySelector(".cby-category-" + category.id)) continue;
      cbyCategoryToggles.insertAdjacentHTML(
        "beforeend",
        '<div data-category="' +
          category.id +
          '" class="cby-category-single-toggle cby-category-' +
          category.id +
          '" title="' +
          category.name +
          '">' +
          Core.getCategoryIcon(category.id) +
          '<div class="cby-category-toggle-product-quantity">' +
          category.items.length +
          "</div></div>"
      );
      document.querySelector(
        ".cby-category-" + category.id
      ).onclick = function (e) {
        Core.selectCategory(e.target.getAttribute("data-category"));
      };
    }
    if (document.querySelector(".cby-category-all")) return;
    cbyCategoryToggles.insertAdjacentHTML(
      "afterbegin",
      '<div class="cby-category-single-toggle cby-category-all active">' +
        Core.getCategoryIcon() +
        '<div class="cby-category-toggle-product-quantity">' +
        orderForm.items.length +
        "</div></div>"
    );
    document.querySelector(".cby-category-all").onclick = function (e) {
      Core.selectCategory(e.target.getAttribute("data-category"));
    };
  },
  selectCategory: function (categoryId) {
    Core.activeCategoryFilter = categoryId;
    var cbyCategoryToggles = document.querySelectorAll(
      ".cby-category-single-toggle"
    );
    var category = Core.categories[categoryId];
    for (var i = 0; i < cbyCategoryToggles.length; i++) {
      var cbyCategoryToggle = cbyCategoryToggles[i];
      var isSelectedCategory =
        cbyCategoryToggle.getAttribute("data-category") == categoryId;
      if (isSelectedCategory) {
        cbyCategoryToggle.classList.add("active");
      }
      if (
        cbyCategoryToggle.classList.contains("active") &&
        !isSelectedCategory
      ) {
        cbyCategoryToggle.classList.remove("active");
      }
    }
    var productItems = document.querySelectorAll(".product-item");
    for (var i = 0; i < productItems.length; i++) {
      var productItem = productItems[i];
      var skuId = productItem.getAttribute("data-sku");
      productItem.classList.remove("hide");
      if (!category) continue;
      if (!category.items.includes(skuId)) {
        productItem.classList.add("hide");
      }
    }
  },
  fixGiftCardTitles: function() {
    var giftCards = $('.gift-card-friendly-name');
    for (var i = 0; i< giftCards.length; i++) {
      var giftCard = giftCards[i];
      giftCard.innerText = "Your balance is "
    }
    var giftCardGroup = document.querySelector('#show-gift-card-group');
    if (giftCardGroup) {
      giftCardGroup.innerText = "Loyalty"
    }
  },
  addBodyClasses: function() {
    if (window.location.hash === '#/cart') {
      $('body').addClass(cartClass);
    }
  
    if (window.location.hash === '#/email') {
      $('body').addClass(emailClass);
    }
  
    if (window.location.hash === '#/profile') {
      $('body').addClass(profileClass);
    }
  
    if (window.location.hash === '#/shipping') {
      $('body').addClass(shippingClass);
    }
  
    if (window.location.hash === '#/payment') {
      $('body').addClass(paymentClass);
    }
  
    var goBtn = $('.cart-links.cart-links-bottom').detach();
    $('.summary-template-holder .summary').append(goBtn);

    var bagContainer = $(".cby-bag-container").detach()
    $(".cart-template-holder").append(bagContainer)
  },
  changeBodyClasses: function() {
    var hash = window.location.hash;
    $('.__cby_h_menu li').removeClass('active');

    if (hash === '#/cart') {
      $('body').removeClass(emailClass);
      $('body').removeClass(profileClass);
      $('body').removeClass(shippingClass);
      $('body').removeClass(paymentClass);
      $('body').addClass(cartClass);
      $('.__cby_h_menu li:nth-child(1)').addClass('active');
    }

    if (hash === '#/email') {
      $('body').removeClass(cartClass);
      $('body').removeClass(profileClass);
      $('body').removeClass(shippingClass);
      $('body').removeClass(paymentClass);
      $('body').addClass(emailClass);
      $('.__cby_h_menu li:nth-child(2)').addClass('active');
    }

    if (hash === '#/profile') {
      $('body').removeClass(cartClass);
      $('body').removeClass(emailClass);
      $('body').removeClass(shippingClass);
      $('body').removeClass(paymentClass);
      $('body').addClass(profileClass);
      $('.__cby_h_menu li:nth-child(3)').addClass('active');
    }

    if (hash === '#/shipping') {
      $('body').removeClass(cartClass);
      $('body').removeClass(emailClass);
      $('body').removeClass(profileClass);
      $('body').removeClass(paymentClass);
      $('body').addClass(shippingClass);
    }

    if (hash === '#/payment') {
      $('body').removeClass(cartClass);
      $('body').removeClass(emailClass);
      $('body').removeClass(profileClass);
      $('body').removeClass(shippingClass);
      $('body').addClass(paymentClass);
      $('.__cby_h_menu li:nth-child(3)').addClass('active');
    }
  },
  logoutLink: async function () {
    let orderForm = await vtexjs.checkout.getOrderForm();
    let orderFormId = orderForm.orderFormId;
      
    if (!orderFormId) return 
    
    let linkHref = $("#is-not-me").attr("href");
    if(linkHref.indexOf(orderFormId) == -1) $("#is-not-me").attr("href", linkHref+orderFormId)    
  },
  triggerCouponBtn: function () {
    if (window.location.hash == "#/cart") {
      setTimeout(function(){
        $(".coupon-fieldset .coupon-data .link-coupon-add").trigger("click")
      }, 1000)
    }
  },
  init: function () {
    Core.addBodyClasses();
    Core.tableCardEventListener();
    Core.saveData();
    Core.updatePaymentInMasterData();
    Core.injectBagProduct();
    Core.addDefaultCreditCardCheckbox();
    Core.updateCreditCardInMasterData();
    Core.sendNewsLetter();
    Core.fixGiftCardTitles();
    Core.logoutLink();
  }
};

$(document).ready(Core.init);

$(window).on("orderFormUpdated.vtex", function (event, orderForm) {
  console.log("Core", Core);
  Core.addCartLimiter(orderForm);
  Core.updateCartLimiter();
  Core.getSubstitutionPreferences(orderForm);
  Core.injectBagProduct();
  Core.insertSubstituteOptions();
  Core.hideDefaultCreditCardCheckBox(orderForm);
  Core.updateSubstitutionPreferences();
  Core.fixGiftCardTitles();
  Core.selectDefaultPayment(vtexjs.checkout.orderForm);
  Core.triggerCouponBtn();
  setTimeout(function () {
    Core.removeItems(orderForm);
    Core.removeBagComboBox(orderForm);
    Core.removePrimeComboBox(orderForm);
  });
  Core.addCategoryToggles(orderForm);
});

$(window).load(function () {
  Core.removeBagComboBox(vtexjs.checkout.orderForm);
  Core.fixGiftCardTitles();
  Core.removePrimeComboBox(vtexjs.checkout.orderForm);
  Core.selectDefaultPayment(vtexjs.checkout.orderForm);
});

$(window).on("hashchange", function () {
  Core.changeBodyClasses();
  Core.fixGiftCardTitles();
  Core.addCategoryToggles(vtexjs.checkout.orderForm);
  Core.selectDefaultPayment(vtexjs.checkout.orderForm);
  Core.saveData();
});
