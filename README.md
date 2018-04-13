[![GitHub last commit](https://img.shields.io/github/last-commit/it-blockchainglobal/acx-api.svg?maxAge=2400)](#)
[![npm](https://img.shields.io/npm/dt/acx.svg)](https://www.npmjs.com/package/acx)
[![npm](https://img.shields.io/npm/v/acx.svg)](https://www.npmjs.com/package/acx)
[![npm](https://img.shields.io/npm/l/acx.svg)](https://www.npmjs.com/package/acx)

# ACX API & WebSocket Utilities 
This projectis designed to help you make your own projects that interact with the [ACX Exchange](https://help.acx.io/api).

ACX is ambitious, awesome, advanced and Australian. Since 2013, we've taken the complexity out of trading and owning digital currencies for everyone in Australian and beyond. Our goal at ACX is to provide the highest quality, instant and simplified purchasing experience for customers looking to acquire Blockchain Backed assets, starting with Bitcoin.

###[Read Full Usage Guide On GitHub](https://it-blockchainglobal.github.io/acx/) 

## Getting started

### Installation
```
npm install acx --save
```

### Prerequisites
To get started, you need to request for access/secret key at first.
Please visit [ACX API Reference](https://help.acx.io/api) for more information.

## Usage

### Initialise
```javascript
const ACX = require('acx');
var acx = new ACX("dashbtc", <access_key>, <secret_key>);
```
### Functions

#### Get my account information
```javascript
acx.getMyAccount().then(data => {
    console.log(data);
}).catch(e => { console.error(e); });
```

### Get recent trades on the market

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
acx.getOrders({ state: 'waite' }).then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```
```javascript
acx.getOrders({ limit: 2, page: 2 }).then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```
#### Update my order by order id
```javascript
acx.updateOrderById({id: 536786, volume: 0.012}).then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```
```javascript
acx.updateOrderById({id: 536786, price: 0.044532, volume: 0.012}).then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

#### Get my orders by order id
Get information of specified order by order id
```javascript
acx.getOrderById(536786).then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

### Get my deposits history
Get my deposits history by currency value(contains btc,aud,bch,eth,hsr,fuel,ubtc,eet,dash). 
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
```javascript
acx.getDeposit('mock29c5de23a0dfc10648fb5f128ff5bd140e153a5a99d0208b9f3d755e29721137').then(data => {
    console.log(data)
});
```
#### Get my deposit address by currency
```javascript
acx.getDepositAddress('btc').then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```
#### Create multiple sell/buy orders
Create multiple sell/buy orders by list of order objects. Response status message will be display.
```javascript
acx.placeOrders([
        {side: 'sell', price: 0.04452900, volume: 0.1},
        {side: 'sell', price:0.04452800, volume: 0.2}
    ]).then(data => { console.log(data)
}).catch(e => { console.error(e); });
```

#### Cancel an order
Cancel a specific order by order id
```javascript
acx.deleteOrder(536791).then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```
#### Bulk cancel orders
Cancel all your orders
```javascript
acx.clearOrders();
```
```javascript
acx.clearOrders().then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```
Alternatively, you can also cancel all your orders by side(buy/sell)
```javascript
acx.clearOrders({side:'buy'}).then(data => {
    console.log(data)
}).catch(e => { console.error(e); });
```

#### Get order book by market

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

### Get market depth
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
Get K data with pending trades are the trades not included in K data yet, because there's delay between trade generated and processed by K data generator.
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


#### Get server current time, in seconds since Unix epoch.
```javascript
acx.getServerTimestamp().then(data => {
    console.log(data)
});
```

## Authors

* **Sean Fang** - *Initial work*

## License

This project is licensed under the MIT License