import React from "react";
import { Spinner, Dropdown } from "vtex.styleguide";
import { withLocation } from '../LocationProvider';
import styles from "./currency-switcher.css";
const CurrencySwitcher = ({ loading, setNewCurrentLocation, ...props}) => {
  const [currency, setCurrency] = React.useState({});
  const [currencies, setCurrencies] = React.useState([]);
  const [changing, setChanging] = React.useState(false);
  
  React.useEffect(() => {
    if (window.localStorage.getItem("sector")) {
      const sector = window.localStorage.getItem("sector");
      const parsedLocation = JSON.parse(sector);
      console.log("ParsedLocation: ", parsedLocation)
      if(parsedLocation.currencies) {
        setCurrencies(parsedLocation.currencies);
      }
      setCurrency(parsedLocation.currency);
    }
  }, [loading])

  const handleChange = (e, currency) => {
    setChanging(true)
    setCurrency(currency);
    const selectedSector = JSON.parse(window.localStorage.getItem("sector"));
    const parsedCurrency = JSON.parse(currency);

    const locationObj = {
      ...selectedSector,
      currency: parsedCurrency,
    }
    setNewCurrentLocation(locationObj);
    window.localStorage.setItem(
      "sector",
      JSON.stringify(locationObj)
    );
  };

  if (loading || changing) {
    return (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className={styles["currency-switcher"]}>
      <Dropdown
        size="small"
        label="Currency"
        name="currency-switcher"
        options={currencies.map((currency) => ({
          value: JSON.stringify(currency),
          label: currency.currencyCode,
        }))}
        value={JSON.stringify(currency)}
        onChange={handleChange}
        variation="inline"
      />
    </div>
  );
};

export default withLocation(CurrencySwitcher);
