import React from "react";
import { Slider as SlickSlider } from "vtex.store-components";
import "./slider.global.css";
class Slider extends React.Component {
  render() {
    const { children } = this.props;
    const settings = {
      sliderSettings: {
        centerMode: true,
        infinite: true,
        slidesToShow: 1,
        centerPadding: "15%",
        dots: true,
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              centerPadding: "0",
            },
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              centerPadding: "0",
            },
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              centerPadding: "0",
            },
          },
        ],
      },
    };
    return <SlickSlider {...settings}>{children}</SlickSlider>;
  }
}

export default Slider;
