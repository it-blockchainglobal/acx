![alt text](https://acx.io/static/c/logo.png)
# ACX API & WebSocket Utilities

[![GitHub last commit](https://img.shields.io/github/last-commit/it-blockchainglobal/acx-api.svg?maxAge=2400)](https://it-blockchainglobal.github.io/acx)
[![npm](https://img.shields.io/npm/dt/acx.svg)](https://www.npmjs.com/package/acx)
[![npm](https://img.shields.io/npm/v/acx.svg)](https://www.npmjs.com/package/acx)
[![npm](https://img.shields.io/npm/l/acx.svg)](https://www.npmjs.com/package/acx)

This projectis designed to help you make your own projects that interact with the [ACX Exchange](https://help.acx.io/api).

ACX is ambitious, awesome, advanced and Australian. Since 2013, we've taken the complexity out of trading and owning digital currencies for everyone in Australian and beyond. Our goal at ACX is to provide the highest quality, instant and simplified purchasing experience for customers looking to acquire Blockchain Backed assets, starting with Bitcoin.

[Read Full Usage Guide On GitHub](https://it-blockchainglobal.github.io/acx/)

## Getting started

### Installation

```js
npm install acx --save
```

### Prerequisites

To get started, you need to request for access/secret key at first.
Please visit [ACX API Reference](https://help.acx.io/api) for more information.

## REST API Usage

### Initialise

| parameter | type   |required?|  description  |
| --------- | ------- | ------|------------------------------------------------ |
| `market`     | String | required  | markets available in ACX,  All available markets can be found at [ACX API Reference](https://acx.io//api/v2/markets).  |
| `access_key`  | String | required| access key gain from ACX.io         |
| `secret_key` | String  | required| secret key gain from ACX.io      |
| `tradeFee` | Float  | optional| ACX trading fee, default value is 0.002 which is 0.2%      |
| `restApiEndPoint` | String  | optional| ACX default rest API uri, default is https://acx.io:443      |
| `socketEndPoint` | String  | optional| ACX default WebSocket end point, default is wss://acx.io:8080      |

```javascript
const ACX = require('acx');
var acx = new ACX({maret:"dashbtc", access_key:<access_key>, secret_key:<secret_key>);
```

```javascript
const ACX = require('acx');
var acx = new ACX({maret:"dashbtc", access_key:<access_key>, secret_key:<secret_key>, tradeFee:0.001);
```

### Functions

#### Get my account information

```javascript
acx.getMyAccount().then(data => {
    console.log(data);
}).catch(e => { console.error(e); });
```

#### Get recent trades on the market

| parameter | type   |required?|  description                                      |
| --------- | ------- | ------|------------------------------------------------ |
| `market`    | String | optional  | Market you want to get trades from, default to the one specified on initialization. |
| `order_by`| String | optional | If set, returned trades will be sorted in specific order, default to 'desc'(reverse creation order). |
| `limit` | Integer | optional | Limit the number of returned trades. Default to 50. |
| `from` | Integer | optional | Trade id. If set, only trades created after the trade will be returned. |
| `to` | Integer | optional | Trade id. If set, only trades created before the trade will be returned. |
| `timestamp` | Integer | optional | An integer represents the seconds elapsed since Unix epoch. If set, only trades executed before the time will be returned. |

```javascript

acx.getMarketTrades().then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

```javascript
acx.getMarketTrades({from:7476198, order_by:'asc'}).then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

```javascript
acx.getMarketTrades({timestamp:1522904400}).then(data => {
    console.log(data);
}).catch(e => { console.error(e); });
```

#### Get my trade history

Get recent 50 trades in descending order.

| parameter | type   |required?|  description  |
| ---------| -------| ------|-----------------------------------------------|
| `market`    | String | optional  | Market you want to get trades from, default to the one specified on initialization. |
| `order_by`| String | optional | If set, returned trades will be sorted in specific order, default to 'desc'(reverse creation order).|
| `limit` | Integer | optional | Limit the number of returned trades. Default to 50. |
| `from` | Integer | optional | Trade id. If set, only trades created after the trade will be returned. |
| `to` | Integer | optional | Trade id. If set, only trades created before the trade will be returned. |
| `timestamp` | Integer | optional |An integer represents the seconds elapsed since Unix epoch. If set, only trades executed before the time will be returned.|

```javascript
acx.getMyTrades().then(data => {
    console.log(data);
}).catch(e => { console.error(e); });
```

You can also specify other parameters to narrow down results.

```javascript
acx.getMyTrades({from:7476198, order_by:'asc'}).then(data => {
    console.log(data);
}).catch(e => { console.error(e); });
```

```javascript
acx.getMyTrades({timestamp:1522904400}).then(data => {
    console.log(data);
}).catch(e => { console.error(e); });
```

#### Get my open orders

Get my recent open orders.

| parameter | type   |required?|  description                                      |
| --------- | ------- | ------|------------------------------------------------ |
| `market`    | String | optional  | Market you want to get trades from, default to the one specified on initialization. |
| `order_by`| String | optional | If set, returned trades will be sorted in specific order, default to 'desc'(reverse creation order). |
| `limit` | Integer | optional | Limit the number of returned trades. Default to 50. |
| `state` | String | optional | Filter order by state, default to 'wait' (active orders).|
| `page` | Integer | optional | Specify the page of paginated results.|

```javascript
acx.getOrders().then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

```javascript
acx.getOrders().then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

```javascript
acx.getOrders({ state: 'wait' }).then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

```javascript
acx.getOrders({ limit: 2, page: 2 }).then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

#### Update my order by order id

This function has been abandoned.

#### Get my orders by order id

Get information of specified order by order id

| parameter | type   |required?|  description |
| ---------| -------| ------|----------------------------------------------- |
| `order_id`| Integer | required | Unique order id. |

```javascript
acx.getOrderById(536786).then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

#### Get my deposits history

Get my deposits history by currency value(contains btc, aud, bch, eth, hsr, fuel, ubtc, eet, dash).

| parameter | type   |required?|  description |
| ---------| -------| ------|----------------------------------------------- |
| `currency` | String | Optional | currency value(contains btc, aud, bch, eth, hsr, fuel, ubtc, eet, dash).  |
| `limit` | Integer | optional | Set result limit. |
| `state` | String | optional | Filter deposits by state.|

```javascript
acx.getDeposits().then(data=>{
    console.log(data)
}).catch(e => { console.error(e); });
```

```javascript
acx.getDeposits({ currency: 'aud' }).then(data=>{
    console.log(data)
}).catch(e => { console.error(e); });
```

```javascript
acx.getDeposits({ state: 'submitting', limit: 10 }).then(data=>{
    console.log(data)
}).catch(e => { console.error(e); });
```

#### Get my deposit by txid

| parameter | type   |required?|  description                                      |
| --------- | ------- | ------|------------------------------------------------ |
| `txid` | String | Required | transaction ID  |

```javascript
acx.getDeposit('mock29c5de23a0dfc10648fb5f128ff5bd140e153a5a99d0208b9f3d755e29721137').then(data => {
    console.log(data)
});
```

#### Get my deposit address by currency

| parameter | type   |required?|  description                                      |
| --------- | ------- | ------|------------------------------------------------ |
| `currency` | String | Optional | currency value(contains btc, aud, bch, eth, hsr, fuel, ubtc, eet, dash). Default to 'aud'.  |

```javascript
acx.getDepositAddress('btc').then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

#### Create multiple sell/buy orders

Create multiple sell/buy orders by list of order objects. Response status message will be displayed.

| parameter | type   |required?|  description |
| ---------| -------| ------|----------------------------------------------- |
| `side` | String | optional | Either 'sell' or 'buy'. |
| `price` | Float | optional | Price for each unit. Leave empty to place market order|
| `volume` | Float | optional | The amount user want to sell/buy. An order could be partially executed, e.g. an order sell 5 btc can be matched with a buy 3 btc order, left 2 btc to be sold; in this case the order's volume would be '5.0', its remaining_volume would be '2.0', its executed volume is '3.0'.|

```javascript
acx.placeOrders([
        {side: 'sell', price: 0.04452900, volume: 0.1},
        {side: 'sell', price:0.04452800, volume: 0.2}
    ]).then(data => { console.log(data)
}).catch(e => { console.error(e); });
```

#### Cancel an order

Cancel a specific order by order id

| parameter | type   |required?|  description |
| ---------| -------| ------|----------------------------------------------- |
| `order_id`| Integer | required | Unique order id. |

```javascript
acx.deleteOrder(536791).then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

#### Bulk cancel orders

Cancel all your orders

| parameter | type   |required?|  description |
| ---------| -------| ------|----------------------------------------------- |
| `market`| String | optional | Market you want to get data from, default to the one specified on initialization. If present, only specified market orders will be canncelled.|
| `side`| String | optional | Either 'sell' or 'buy'. |

```javascript
acx.clearOrders();
```

```javascript
acx.clearOrders().then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

Alternatively, you can also cancel all your orders by market and side(buy/sell)

```javascript
acx.clearOrders({market: 'btcaud', side:'buy'}).then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

Delete orders by ids

| parameter | type   |required?|  description |
| ---------| -------| ------|----------------------------------------------- |
| `ids`| String | required | A String of order Ids joined by ',' , for instance: 23,24,26 |

```javascript
acx.deleteOrders('23,24,26').then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```


#### Get order book by market

| parameter | type   |required?|  description                                      |
| --------- | ------- | ------|------------------------------------------------ |
| `market`    | String | optional  | Market you want to get data from, default to the one specified on initialization. |
| `asks_limit`    | Integer | optional  | Limit the number of returned sell orders. Default to 20. |
| `bids_limit`    | Integer | optional  | Limit the number of returned buy orders. Default to 20. |

```javascript
acx.getOrderBook({market:'btcaud'}).then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

```javascript
acx.getOrderBook({market:'btcaud', asks_limit:10, bids_limit: 20}).then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

Function will return the order book for the market which you have defined when you create the acx object if you haven't specified the market parameter.

```javascript
acx.getOrderBook().then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

#### Get market depth

| parameter | type   |required?|  description                                      |
| --------- | ------- | ------|------------------------------------------------ |
| `market`    | String | optional  | Market you want to get data from, default to the one specified on initialization. |
| `limit`    | Integer | optional  | Limit the number of returned price levels. Default to 300. |

```javascript
acx.getDepth({market:'btcaud'}).then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

```javascript
acx.getDepth({market:'btcaud', limit:1000}).then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

Function will return the depth of the market which you have defined when you create the acx object if you haven't specified the market parameter.

```javascript
acx.getDepth().then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

```javascript
acx.getDepth({limit:1000}).then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

#### Get OHLC(K Line) of specific market

| parameter | type   |required?|  description|
| --------- | ------- | ------|------------------------------------------------ |
| `market`    | String | optional  | Market you want to get data from, default to the one specified on initialization. |
| `limit`    | Integer | optional  | Limit the number of returned data points. Default to 30. |
| `period`    | Integer | optional  | Time period of K line, default to 1. You can choose between 1, 5, 15, 30, 60, 120, 240, 360, 720, 1440, 4320, 10080 |
| `timestamp`    | Integer | optional  |    An integer represents the seconds elapsed since Unix epoch. If set, only k-line data after that time will be returned. |

```javascript
//Time period of K line, default to 1. You can choose between 1, 5, 15, 30, 60, 120, 240, 360, 720, 1440, 4320, 10080
acx.getKLine({period:5}).then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

Function will return the OHLC of the market which you have defined when you create the acx object if you haven't specified the market parameter.

```javascript
acx.getKLine().then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

#### Get K data with pending trades

Get K data with pending trades, which are the trades not included in K data yet, because there's delay between trade generated and processed by K data generator.

| parameter | type   |required?|  description                                      |
| --------- | ------- | ------|------------------------------------------------ |
| `trade_id`  | Integer | required  | The trade id of the first trade you received. |
| `market`    | String | optional  | Market you want to get data from, default to the one specified on initialization. |
| `limit`    | Integer | optional  | Limit the number of returned data points. Default to 30. |
| `period`    | Integer | optional  | Time period of K line, default to 1. You can choose between 1, 5, 15, 30, 60, 120, 240, 360, 720, 1440, 4320, 10080 |
| `timestamp` | Integer | optional  | An integer represents the seconds elapsed since Unix epoch. If set, only k-line data after that time will be returned. |

```javascript
//Time period of K line, default to 1. You can choose between 1, 5, 15, 30, 60, 120, 240, 360, 720, 1440, 4320, 10080
acx.getKLineWithPendingTrades({period:5}).then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

Function will return the OHLC of the market which you have defined when you create the acx object if you haven't specified the market parameter.

```javascript
acx.getKLineWithPendingTrades().then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

#### Get server current time

Get server current time, in seconds since Unix epoch.

```javascript
acx.getServerTimestamp().then(data => {
    console.log(data)
});
```

#### Get your cryptocurrency withdraws

| parameter | type   |required?|  description |
| ---------| -------| ------|----------------------------------------------- |
| `currency` | String | Optional | currency value(contains btc, aud, bch, eth, hsr, fuel, ubtc, eet, dash).  |
| `limit` | Integer | optional | Set result limit. |
| `state` | String | optional | Filter deposits by state.|

Function will return your recent cryptocurrency withdraws if limit not set.
```javascript
acx.getWithdraws().then(data=>{
    console.log(data)
}).catch(e => { console.error(e); });
```
Set more parameters to get cryptocurrency withdraws
```javascript
acx.getWithdraws({currency: 'aud'}).then(data=>{
    console.log(data)
}).catch(e => { console.error(e); });

acx.getWithdraws({currency: 'aud', state: 'accepted', limit: 10}).then(data=>{
    console.log(data)
}).catch(e => { console.error(e); });
```

#### Get your cryptocurrency withdraw by id

| parameter | type   |required?|  description |
| ---------| -------| ------|----------------------------------------------- |
| `id` | String | Required | Withdrawal id |

```javascript
acx.getWithdrawById('25').then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

#### Create a withdraw

| parameter | type   |required?|  description                                      |
| --------- | ------- | ------|------------------------------------------------ |
| `currency`  | String | Optional  | The currency of withdrawal. Only btc is accepted. Default to 'btc' |
| `sum`    | BigDecimal | Required  | Sum amount for withdrawal. |
| `address`    | String | Required  | Crypto-currency address. Now only bitcoin address. |
| `fee` | BigDecimal | optional  | Miner fee. Fee rate from 0.0001 to 0.001 /Kb. |

```javascript
acx.createWithdraw({sum:0.001, address: <'Crypto-currency address'>}).then(data => { 
    console.log(data)
}).catch(e => { console.error(e); });

```
## WebSocket Usage

### Initialise WebSocket

```javascript
acx.initWebSorket();

```
### Trades WebSocket

```javascript
acx.onTradeChanged((data) => {
    console.log(data);
});
```

### Orderbook WebSocket

```javascript
acx.onOrderbookChanged(['btcaud','ethaud'], (data) => {
    console.log(data);
}, 10);
```

## Authors

* **Sean Fang** - *Initial work*
* **Shi Yan** - *Improvement*

## License

This project is licensed under the MIT License
