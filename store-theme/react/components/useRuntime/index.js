import React from "react";
import { useRuntime } from "vtex.render-runtime";

export default Component => {
  return props => {
    const runtime = useRuntime();

    return <Component runtime={runtime} {...props}></Component>;
  };
};
