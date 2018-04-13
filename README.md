[![GitHub last commit](https://img.shields.io/github/last-commit/it-blockchainglobal/acx-api.svg?maxAge=2400)](#)
[![npm](https://img.shields.io/npm/dt/acx.svg)](https://www.npmjs.com/package/acx)
[![npm](https://img.shields.io/npm/v/acx.svg)](https://www.npmjs.com/package/acx)
[![npm](https://img.shields.io/npm/l/acx.svg)](https://www.npmjs.com/package/acx)

# ACX API & WebSocket Utilities 
This project is designed to help you make your own projects that interact with the [ACX Exchange](https://help.acx.io/api).

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

<<<<<<< HEAD
#### Get my trade history
Get recent 50 trades in descending order.
=======
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

>>>>>>> parent of 45fecc3... readme fix parameter table format issue
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
* Paginated results is still under development.
* Sorting function is still under development.
```javascript
acx.getOrders((data)=>{
    console.log(data);
})
```
<<<<<<< HEAD
=======
#### Update my order by order id

| parameter | type   |required?|  description |
| ---------| -------| ------|----------------------------------------------- |
| `order_id`| Integer | required | Unique order id. |
| `market`    | String | optional  | Market you want to get trades from, default to the one specified on initialization. |
| `side` | String | optional | Either 'sell' or 'buy'. |
| `price` | Float | optional | Price for each unit.|
| `volumn` | Float | optional | The amount user want to sell/buy. An order could be partially executed, e.g. an order sell 5 btc can be matched with a buy 3 btc order, left 2 btc to be sold; in this case the order's volume would be '5.0', its remaining_volume would be '2.0', its executed volume is '3.0'.|
>>>>>>> parent of 45fecc3... readme fix parameter table format issue

#### Get my orders by price
Get my resent open orders by side(buy/sell) and price
```javascript
acx.getOrdersByPrice('buy', '0.046446', (data)=>{
    console.log(data);
})
```
### Get my orders by order id
Get information of specified order by order id
<<<<<<< HEAD
=======
| parameter | type   |required?|  description |
| ---------| -------| ------|----------------------------------------------- |
| `order_id`| Integer | required | Unique order id. |

>>>>>>> parent of 45fecc3... readme fix parameter table format issue
```javascript
acx.getOrderById('536747', (data)=>{
    console.log(data);
});
```
### Get my deposits history
Get my deposits history by currency value(contains btc,aud,bch,eth,hsr,fuel,ubtc,eet,dash). 
```javascript
acx.getDeposits('dash', (data)=>{
    console.log(data);
});
```

### Create multiple sell/buy orders
Create multiple sell/buy orders by list of order objects. Response status message will be display.
```javascript
acx.placeOrders([{
    side: 'sell',
    price: '0.026449',
    volume: '0.01',
},{
    side: 'sell',
    price: '0.026449',
    volume: '0.01',
}]);
```
If you want to handle the response. Pass a callback function as the last argument.
```javascript
acx.placeOrders([{
    side: 'sell',
    price: '0.026449',
    volume: '0.01',
},{
    side: 'buy',
    price: '0.026449',
    volume: '0.01',
}], (data)=>{
    console.log(data);
});
```
### Cancel an order
Cancel a specific order by order id
```javascript
acx.deleteOrder('536779', (data)=>{
    console.log(data);
});
```
### Bulk cancel orders
Cancel all your orders
```javascript
acx.clearOrders();
```
Alternatively, you can also cancel all your orders by side(buy/sell)
```javascript
acx.clearOrders('buy', (data)=>{
    console.log(data);
});
```


 
## Authors

* **Sean Fang** - *Initial work*

## License

This project is licensed under the MIT License