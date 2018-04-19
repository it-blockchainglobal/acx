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
const Promise = require("bluebird");

class ACX {
    constructor(market, access_key, secret_key, restApiEndPoint = "https://acx.io:443", socketEndPoint = 'wss://acx.io:8080', tradeFee = 0.002) {
        this.market = market;
        this.tradeFee = tradeFee;
        this.restApiEndPoint = restApiEndPoint;
        this.ws = new WebSocket(socketEndPoint);;
        this.access_key = access_key;
        this.secret_key = secret_key;
    }
    setTradeFee(tradeFee = 0.002) {
        this.tradeFee = tradeFee;
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

    getQueryParams(verb, uri, params) {
        if (!verb) throw Error('Request Query Parameter: verb');
        if (!uri) throw Error('Request Query Parameter: uri');
        if (!params) throw Error('Request Query Parameter: params');
        params.tonce = (new Date).getTime();
        if (params.side) { params.side = params.side.toLowerCase() }
        if (params.market) { params.market = params.market.toLowerCase() }
        if (params.currency) { params.currency = params.currency.toLowerCase(); }
        if (params.state) { params.state = params.state.toLowerCase(); }
        if (params.order_by) {
            params.order_by = params.order_by.toLowerCase();
            if (params.order_by != 'desc' && params.order_by != 'asc') { params.order_by = 'desc'; }
        }
        Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
        params.signature = this.getSignature(verb, uri, params);
        return params;
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
    getMyAccount() {
        let uri = '/api/v2/members/me.json';
        let params = {};
        return new Promise((resolve, reject) => {
            this.get(uri, this.getQueryParams('GET', uri, params), resolve, 'getMyAccount');
        });
    }
    getMarketTrades({ market = this.market, order_by = 'desc', limit = 50, from = undefined, to = undefined, timestamp = undefined } = {}) {
        let params = { market: market };
        Object.assign(params, arguments[0]);
        return new Promise((resolve, reject) => {
            this.get('/api/v2/trades.json', params, resolve, 'getMarketTrades');
        });
    }
    getMyTrades({ market = this.market, order_by = 'desc', limit = 50, from = undefined, to = undefined, timestamp = undefined } = {}) {
        let uri = '/api/v2/trades/my.json';
        let params = { market: market };
        Object.assign(params, arguments[0]);
        return new Promise((resolve, reject) => {
            this.get(uri, this.getQueryParams('GET', uri, params), resolve, 'getMyTrades');
        });

    }
    getOrders({ market = this.market, order_by = 'desc', state = undefined, limit = 100, page = 1 } = {}) {
        let uri = '/api/v2/orders.json';
        let params = { market: market, order_by: order_by, state: state, limit: limit, page: page };
        Object.assign(params, arguments[0]);
        return new Promise((resolve, reject) => {
            this.get(uri, this.getQueryParams('GET', uri, params), resolve, 'getOrders');
        });
    }
    getOrderById(id) {
        if (!id || isNaN(id)) throw Error('getOrderById: Invalid order id');
        let uri = '/api/v2/order.json';
        let params = { id: id };
        return new Promise((resolve, reject) => {
            this.get(uri, this.getQueryParams('GET', uri, params), resolve, 'getOrderById');
        });
    }
    getDeposits({ currency = undefined, limit = undefined, state = undefined } = {}) {
        let uri = '/api/v2/deposits.json';
        let params = { currency: currency, limit: limit, state: state };
        Object.assign(params, arguments[0]);
        return new Promise((resolve, reject) => {
            this.get(uri, this.getQueryParams('GET', uri, params), resolve, 'getDeposits');
        });
    }
    getDeposit(txid) {
        if (!txid) throw Error('getDeposit: Invalid deposit txid');
        let uri = '/api/v2/deposit.json';
        let params = { txid: txid };
        return new Promise((resolve, reject) => {
            this.get(uri, this.getQueryParams('GET', uri, params), resolve, 'getDeposit');
        });
    }
    getDepositAddress(currency = 'aud') {
        if (!currency) throw Error('getDepositAddress: Invalid currency');
        let uri = '/api/v2/deposit_address.json';
        let params = { currency: currency };
        return new Promise((resolve, reject) => {
            this.get(uri, this.getQueryParams('GET', uri, params), resolve, 'getDepositAddress');
        });
    }
    clearOrders({ side = undefined } = {}) {
        let uri = '/api/v2/orders/clear.json';
        let params = { side: side };
        return new Promise((resolve, reject) => {
            this.post(uri, this.getQueryParams('POST', uri, params), data => {
                if (side) { console.log(side.toUpperCase() + " Orders cancelled"); }
                else { console.log("All orders cancelled"); }
                resolve(data);
            }, 'clearOrders');
        });
    }
    placeOrders(orders = []) {
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
        return new Promise((resolve, reject) => {
            form.submit(this.restApiEndPoint + uri, (err, res) => {
                if (err) { console.log(err); reject(err); }
                else {
                    console.log(res.statusMessage)
                    resolve(res.statusMessage);
                    res.resume();
                }
            });
        });
    }
    placeOrder({ market = this.market, side = undefined, price = undefined, volume = undefined } = {}) {
        //placeOrder(order, callback) {
        if (!side) throw Error('updateOrderById: Invalid Order Side(buy/sell)');
        if (!volume) throw Error('updateOrderById: Invalid Order volume');
        let uri = '/api/v2/orders.json';
        let params = { market: market, side: side, price: price, volume: volume };
        return new Promise((resolve, reject) => {
            this.post(uri, this.getQueryParams('POST', uri, params), data => {
                console.log(params.side + " order " + data.id + " created on " + params.tonce);
                resolve(data);
            }, 'placeOrder');
        });
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
    updateOrderById({ market = this.market, id = undefined, side = undefined, price = undefined, volume = undefined } = {}) {
        if (!id) throw Error('updateOrderById: Invalid Order ID');
        let params = { market: market, id: id };
        return new Promise((resolve, reject) => {
            this.deleteOrder(id).then(data => {
                if (!side) { side = data.side; }
                if (!volume) { volume = data.volume; }
                if (!price) { price = data.price; }
                this.placeOrder({ market: market, side: side, price: price, volume: volume }).then(order => {
                    resolve(order);
                }).catch(e => { console.error(e); })
            });
        });
    }
    deleteOrder(id) {
        if (!id || isNaN(id)) throw Error('deleteOrder: Invalid order id');
        let uri = '/api/v2/order/delete.json';
        let params = { id: id };
        return new Promise((resolve, reject) => {
            this.post(uri, this.getQueryParams('POST', uri, params), data => {
                console.log("Order " + data.id + " cancelled ");
                resolve(data);
            }, 'deleteOrder');
        });
    }
    getMarkets() {
        return new Promise((resolve, reject) => {
            this.get('/api/v2/markets.json', null, resolve, 'getMarkets');
        });
    }
    getTickers() {
        return new Promise((resolve, reject) => {
            this.get('/api/v2/tickers.json', null, resolve, 'getTickers');
        });
    }
    getOrderBook({ market = this.market, ask_limit = 20, bids_limit = 20 } = {}) {
        let params = { market: market, ask_limit: ask_limit, bids_limit: bids_limit };
        return new Promise((resolve, reject) => {
            this.get('/api/v2/order_book.json', params, resolve, 'getOrderBook');
        });
    }
    getDepth({ market = this.market, limit = 300 } = {}) {
        let params = { market: market, limit: limit };
        return new Promise((resolve, reject) => {
            this.get('/api/v2/depth.json', params, resolve, 'getDepth');
        });
    }
    getKLine({ market = this.market, limit = 30, period = 1, timestamp = undefined } = {}) {
        let params = { market: market, limit: limit };
        if(period && [1, 5, 15, 30, 60, 120, 240, 360, 720, 1440, 4320, 10080].filter(p=>{ return p == period }).length==0){ throw Error('getKLine: period. [1, 5, 15, 30, 60, 120, 240, 360, 720, 1440, 4320, 10080]') }
        Object.assign(params, arguments[0]);
        return new Promise((resolve, reject) => {
            this.get('/api/v2/k.json', params, resolve, 'getKLine');
        });
    }
    getKLineWithPendingTrades({ market = this.market, trade_id = undefined, limit = 30, period = 1, timestamp = undefined } = {}) {
        if (!trade_id || isNaN(trade_id)) throw Error('getKLineWithPendingTrades: Invalid trade id');
        let params = { market: market, limit: limit };
        if(period && [1, 5, 15, 30, 60, 120, 240, 360, 720, 1440, 4320, 10080].filter(p=>{ return p == period }).length==0){ throw Error('getKLine: period. [1, 5, 15, 30, 60, 120, 240, 360, 720, 1440, 4320, 10080]') }
        Object.assign(params, arguments[0]);
        return new Promise((resolve, reject) => {
            this.get('/api/v2/k_with_pending_trades.json', params, resolve, 'getKLineWithPendingTrades');
        });
    }
    getServerTimestamp() {
        return new Promise((resolve, reject) => {
            this.get('/api/v2/timestamp.json', null, resolve, 'getServerTimestamp');
        });
    }
    getWithdraws({ currency = undefined, limit = undefined, state = undefined } = {}){
        let uri = '/api/v2/withdraws.json';
        let params = { currency: currency, limit: limit, state: state };
        Object.assign(params, arguments[0]);
        return new Promise((resolve, reject) => {
            this.get(uri, this.getQueryParams('GET', uri, params), resolve, 'getWithdraws');
        });
    }
    getWithdrawById(id){
        if (!id || isNaN(id)) throw Error('getWithdrawById: Invalid withdraw id');
        let uri = '/api/v2/withdraw.json';
        let params = { id: id };
        return new Promise((resolve, reject) => {
            this.get(uri, this.getQueryParams('GET', uri, params), resolve, 'getWithdrawById');
        });
    }
    createWithdraw({currency='btc', sum=undefined, address=undefined, fee=undefined} = {}){
        if(!sum || isNaN(sum)) throw Error('createWithdraw: Invalid sum amount for withdrawal.');
        if(!address) throw Error('createWithdraw: Invalid Crypto-currency address.');
        let uri = '/api/v2/withdraw.json';
        let params = {currency: currency, sum: sum, address: address, fee: fee};

        return new Promise((resolve, reject)=>{
            this.post(uri, this.getQueryParams('POST', uri, params), data =>{
                console.log('Withdraw '+ data.id + ' created on ' + params.tonce);
                resolve(data);
            }, 'createWithdraw');
        })
    }
    get(uri, query, callback, source) {
        let options = { uri: this.restApiEndPoint + uri, json: true };
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
