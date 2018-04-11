/* ============================================================
 * ACX-API
 * https://github.com/it-blockchainglobal/acx-api
 * ============================================================
 * Copyright 2018-, Sean Fang
 * Released under the MIT License
 * ============================================================ */

const CryptoJS = require("crypto-js");
const request = require('request-promise');
const WebSocket = require('ws');
const FormData = require('form-data');

class ACX {
    constructor(market, access_key, secret_key, restApiEndPoint = "https://acx.io:443", socketEndPoint = 'wss://acx.io:8080') {
        this.market = market;
        this.restApiEndPoint = restApiEndPoint;
        this.ws = new WebSocket(socketEndPoint);;
        this.access_key = access_key;
        this.secret_key = secret_key;
    }
    getSignature(verb, uri, query) {
        var queryStr = ""
        if (verb && uri && query) {
            query.access_key = this.access_key;
            queryStr = verb.toUpperCase() + '|' + uri + '|' + Object.keys(query).sort().reduce((a, k) => { a.push(k + '=' + encodeURIComponent(query[k])); return a }, []).join('&');
        }
        else {
            queryStr = verb;
        }
        return CryptoJS.HmacSHA256(queryStr, this.secret_key).toString(CryptoJS.enc.Hex);
    }
    initWebSorket(onTradeChanged, onOrderbookChanged) {
        var self = this;
        self.ws.on('open', function open() {
            console.log('acx socket connected');
        });
        self.ws.on('message', function incoming(data) {
            if (JSON.parse(data).challenge) {
                self.ws.send('{"auth":{"access_key":"' + self.access_key + '","answer":"' + self.getSignature(self.access_key + JSON.parse(data).challenge) + '"}}');
            }
            else if (JSON.parse(data).orderbook) {
                if (onOrderbookChanged) { onOrderbookChanged(JSON.parse(data).orderbook) }
            }
            else if (JSON.parse(data).trade) {
                if (onTradeChanged) { onTradeChanged(JSON.parse(data).trade); }
            }
            else {
                console.log(data);
            }
        });
    }
    getMyAccount(callback) {
        var tonce = (new Date).getTime();
        var uri = '/api/v2/members/me.json';
        this.get(uri, { 'tonce': tonce, 'signature': this.getSignature('GET', uri, { 'tonce': tonce }) }, (data) => {
            if (callback) { callback(data.accounts); }
        }, 'getMyAccount');
    }
    getMyTrades(callback) {
        var tonce = (new Date).getTime();
        var uri = '/api/v2/trades/my.json';
        this.get(uri, { 'market': this.market, 'tonce': tonce, 'order_by': 'desc', 'signature': this.getSignature('GET', uri, { 'market': this.market, 'order_by': 'desc', 'tonce': tonce }) }, (data) => {
            if (callback) { callback(data); }
        }, 'getMyTrades');
    }
    getOrders(callback) {
        var tonce = (new Date).getTime();
        var uri = '/api/v2/orders.json';
        this.get(uri, { 'market': this.market, 'tonce': tonce, 'order_by': 'desc', 'signature': this.getSignature('GET', uri, { 'market': this.market, 'order_by': 'desc', 'tonce': tonce }) }, (data) => {
            if (callback) { callback(data); }
        }, 'getOrders');
    }
    getOrdersByPrice(side, price, callback) {
        if (!side) throw Error('updateOrderById: Invalid Order Side(buy/sell)');
        if (!price) throw Error('updateOrderById: Invalid Order Price');
        var tonce = (new Date).getTime();
        var uri = '/api/v2/orders.json';
        this.get(uri, { 'market': this.market, 'tonce': tonce, 'state': 'wait', 'signature': this.getSignature('GET', uri, { 'market': this.market, 'tonce': tonce, 'state': 'wait' }) }, (data) => {
            var orders = data.filter((order) => { return Number(order.price) == Number(price) && order.side.toLowerCase() == side.toLowerCase(); });
            if (callback) { callback(orders); }
        }, 'getOrdersByPrice');
    }
    getOrderById(id, callback) {
        if (id) {
            var tonce = (new Date).getTime();
            var uri = '/api/v2/order.json';
            this.get(uri, { 'id': id, 'tonce': tonce, 'signature': this.getSignature('GET', uri, { 'id': id, 'tonce': tonce }) }, (data) => {
                //console.log(data);
                if (callback) { callback(data); }
            }, 'getOrderById');
        }
    }
    getDeposits(currency, callback) {
        var tonce = (new Date).getTime();
        var uri = '/api/v2/deposits.json';
        var query = { 'tonce': tonce };
        if (currency) {
            query.currency = currency.toLowerCase();
            query.signature = this.getSignature('GET', uri, { 'tonce': tonce, currency: currency.toLowerCase() });
        }
        else {
            query.signature = this.getSignature('GET', uri, { 'tonce': tonce });
        }
        this.get(uri, query, (data) => {
            //console.log(data);
            if (callback) { callback(data); }
        }, 'getDeposits');
    }
    clearOrders(side, callback) {
        var tonce = (new Date).getTime();
        var uri = '/api/v2/orders/clear.json';
        var query = { 'tonce': tonce };
        if (side && (side.toLowerCase() == 'buy' || side.toLowerCase() == 'sell')) {
            query.side = side.toLowerCase();
            query.signature = this.getSignature('POST', uri, { 'tonce': tonce, side: side.toLowerCase() });
        }
        else {
            query.signature = this.getSignature('POST', uri, { 'tonce': tonce });
        }
        this.post(uri,
            query,
            data => {
                if (side) {
                    console.log("Orders " + side.toLowerCase() + " cleared");
                }
                else {
                    console.log("All orders cleared");
                }
                if (callback) { callback(data); }
            },
            'clearOrders'
        );
    }
    placeOrders(orders, callback) {
        var form = new FormData();
        var tonce = (new Date).getTime();
        var uri = '/api/v2/orders/multi';
        form.append('access_key', this.access_key);
        form.append('market', this.market);
        form.append('tonce', tonce);
        var ordersStr = "";

        orders.forEach((order, idx) => {
            ordersStr += "&orders[][price]=" + order.price;
            ordersStr += "&orders[][side]=" + order.side;
            ordersStr += "&orders[][volume]=" + order.volume;
            form.append('orders[][price]', order.price);
            form.append('orders[][side]', order.side);
            form.append('orders[][volume]', order.volume);
        });
        form.append('signature', this.getSignature('POST|' + uri + '|access_key=' + this.access_key + '&market=' + this.market + ordersStr + '&tonce=' + tonce));

        form.submit(this.restApiEndPoint + uri, (err, res) => {
            if (err) { console.log(err); }
            else {
                if (callback) { callback(res); }
                console.log(res.headers.status)
                //console.log("New orders placed");
                res.resume();
            }
        })

    }
    placeOrder(order, callback) {
        if (!side) throw Error('updateOrderById: Invalid Order Side(buy/sell)');
        if (!price) throw Error('updateOrderById: Invalid Order Price');
        var tonce = (new Date).getTime();
        var uri = '/api/v2/orders.json';
        this.post(uri,
            {
                'market': this.market, 'tonce': tonce, 'price': order.price, 'side': order.side.toLowerCase(), 'volume': order.volume,
                'signature': this.getSignature('POST', uri, { 'market': this.market, 'tonce': tonce, 'price': order.price, 'side': order.side.toLowerCase(), 'volume': order.volume })
            },
            (data) => {
                console.log(order.side.toLowerCase() + " order " + data.id + " created on " + tonce);
                if (callback) { callback(data); }
            }, 'placeOrder');
    }
    updateOrdersByPrice(side, price, volume, callback) {
        if (!side) throw Error('updateOrderById: Invalid Order Side(buy/sell)');
        if (!price) throw Error('updateOrderById: Invalid Order Price');
        if (!volume) throw Error('updateOrderById: Invalid Order volume');

        var self = this;
        self.getOrdersByPrice(side, price, (orders) => {
            var executed = 0;
            var orderFound = false;
            if (orders.filter((o) => { return Number(o.price) == Number(price) }).length == 0) {
                self.placeOrder({ side: side, volume: volume, price: price }, (data) => {
                    if (callback) { callback(data) }
                });
            }
            else {
                /* Go through all orders */
                orders.forEach((order, idx) => {
                    if (order.side.toLowerCase() == side.toLowerCase() && Number(order.price) == Number(price) && Number(order.volume) == Number(volume) && !orderFound) {
                        /* keep the first order which match the update */
                        executed++;
                        orderFound = true;
                    }
                    else {
                        /* delete all other others which donot match */
                        self.deleteOrder(order.id, (data) => {
                            executed++;
                            if (!orderFound && !executed >= orders.length) {
                                self.placeOrder({ side: side, volume: volume, price: price }, (data) => {
                                    if (callback) { callback(data) }
                                });
                            }
                        });
                    }
                });
            }
        });

    }
    updateOrderById(id, side, price, volume, callback) {
        if (!id) throw Error('updateOrderById: Invalid Order ID');
        if (!side) throw Error('updateOrderById: Invalid Order Side(buy/sell)');
        if (!price) throw Error('updateOrderById: Invalid Order Price');
        if (!volume) throw Error('updateOrderById: Invalid Order volume');
        this.deleteOrder(id, (data) => {
            this.placeOrder({ side: side.toLowerCase(), volume: volume, price: price });
            if (callback) { callback(data); }
        });
    }
    deleteOrder(id, callback) {
        if (!id) throw Error('deleteOrder: Invalid Order ID');
        var tonce = (new Date).getTime();
        var uri = '/api/v2/order/delete.json';
        this.post(uri,
            {
                'id': id, 'tonce': tonce,
                'signature': this.getSignature('POST', uri, { 'id': id, 'tonce': tonce }, callback)
            },
            (data) => {
                console.log('Order ' + data.id + " deleted on " + (new Date).getTime());
                if (callback) { callback(data); }
            }, 'deleteOrder');
    }
    get(uri, query, callback, source) {
        var options = { uri: this.restApiEndPoint + uri, json: true };
        if (query) {
            options.qs = query;
            options.qs.access_key = this.access_key;
        }
        request(options).then((resp) => {
            if (callback) { callback(resp); }
        }).catch((err) => {
            console.log(source + " Error: " + err.message);
        });
    }
    post(uri, query, callback, source) {
        query.access_key = this.access_key
        request({
            method: 'POST',
            uri: this.restApiEndPoint + uri,
            formData: query,
            json: true
        }).then((resp) => {
            if (callback) { callback(resp); }
        }).catch((err) => {
            console.log(source + " Error: " + err.message);
        });
    }
}

module.exports = ACX;
