import { template } from "lodash";

export default template(`
// Code generated by @open-rpc/generator DO NOT EDIT or ur gonna have a bad tiem
import { IMethodMapping } from "@open-rpc/server-js";

import {
  <%= openrpcDocument.methods.map(({ name }) => name).join(",\n  ") %>
} from "./methods";

export methodMapping: IMethodMapping = {
<% openrpcDocument.methods.forEach(({ name }) => { %>
  <%= name %>,
<% }); %>
};

export default methodMapping;
`);
