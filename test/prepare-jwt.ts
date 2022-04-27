import {getAccessToken} from "./getacctoken";

const arg = process.env.npm_config_scope;
const scope = arg ? arg.slice(1, arg.length) : 'public';
console.log(`scope: ${scope}`);
console.log(getAccessToken(scope));