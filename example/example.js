const ACX = require('../acx-api');

var acx = new ACX("dashbtc", <access_key>, <secret_key>);

/* Get My Account Information */
acx.getMyAccount((data) => { console.log(data); });

/* Get My Trades Information */
acx.getMyTrades((data) => { console.log(data) });

