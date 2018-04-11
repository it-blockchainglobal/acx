# ACX API & WebSocket Utilities 
This project is designed to help you make your own projects that interact with the [ACX Exchange](https://help.acx.io/api).

#### Installation
```
npm install acx --save
```

#### Getting started
To get started, you need to request for access/secret key at first. (Please visit [ACX Exchange](https://help.acx.io/api) for more information.)

Create an ACX API object by passing [market id](https://acx.io:443//api/v2/markets.json), access_key and secret_key to the constructor. 

```javascript
const ACX = require('acx');
var acx = new ACX("dashbtc", <access_key>, <secret_key>);
```

### Usage
```javascript
// Get your profile and accounts info.
acx.getMyAccount((data)=>{
    console.log(data);
})

// Get your executed trades. Trades are sorted in reverse creation order
acx.getMyTrades((data)=>{
    console.log(data);
})

// Get your orders, results is paginated.
acx.getOrders((data)=>{
    console.log(data);
})
// Filter your orders by side(buy/sell) and price
acx.getOrdersByPrice('buy', '0.046446', (data)=>{
    console.log(data);
})

```
