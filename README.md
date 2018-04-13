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
* Paginated results is still under development.
* Sorting function is still under development.
```javascript
acx.getOrders((data)=>{
    console.log(data);
})
```

#### Get my orders by price
Get my resent open orders by side(buy/sell) and price
```javascript
acx.getOrdersByPrice('buy', '0.046446', (data)=>{
    console.log(data);
})
```
### Get my orders by order id
Get information of specified order by order id
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