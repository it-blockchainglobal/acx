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
## Authors

* **Sean Fang** - *Initial work*

## License

This project is licensed under the MIT License