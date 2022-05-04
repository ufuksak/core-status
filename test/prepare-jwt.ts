import {getAccessToken} from "./getacctoken";

const arg = process.env.npm_config_scope;
const scope = arg ? arg.slice(1, arg.length) : 'keys.manage status.manage';
console.log(`scope: ${scope} \n`);
console.log(getAccessToken(scope));