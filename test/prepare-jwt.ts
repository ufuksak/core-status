import {getAccessToken} from "./getacctoken";
import {Scopes} from "../src/products/util/util";

const arg = process.env.npm_config_scope;
const scope = arg ? arg.slice(1, arg.length)
  : Object.values(Scopes).join(' ');
console.log(`scope: ${scope} \n`);
console.log(getAccessToken(scope));