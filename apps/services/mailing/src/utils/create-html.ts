import React from "react";
import { render } from "@react-email/components";

export  const CreateHtmlFromComponent = async (Component , props) => {
  return await render(React.createElement(Component, props));
 };
