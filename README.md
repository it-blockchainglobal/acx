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
acx.getMyAccount((data)=>{
    console.log(data);
})
```

#### Get my trade history
```javascript
acx.getMyTrades((data)=>{
    console.log(data);
})
```

#### Get my open orders
Get my resent open orders. 
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

## Authors

* **Sean Fang** - *Initial work*

## License

This project is licensed under the MIT License