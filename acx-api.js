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

class OrderBook {
    constructor(market, data = null) {
        if (market) { this.market = market.toLowerCase(); }
        this.data = data;
    }
    minNumberOfOrders() {
        return 5;
    }
    maxNumberOfOrders() {
        return 60;
    }
    setData(data = null, limit) {
        this.data = data;
        this.data.asks = this.mergeVolume(data.asks, limit);
        this.data.bids = this.mergeVolume(data.bids, limit);
    }
    ordersOfSide(type) {
        if (type === 'ask') {
            return this.data.asks;
        } else if (type === 'bid') {
            return this.data.bids;
        } else {
            return [];
        }
    }
    sortOrders(side = null) {
        if(!side || side.toLowerCase() == "both" || side.toLowerCase() == "ask"){
            this.data.bids = this.data.bids.sort((order1, order2) => {
                return Number(order2.price) - Number(order1.price);
            });
        }
        if(!side || side.toLowerCase() == "both" || side.toLowerCase() == "bid"){
            this.data.asks = this.data.asks.sort((order1, order2) => {
                return Number(order1.price) - Number(order2.price);
            });
        }
    }
    bidsLength() {
        if (this.data) {
            return this.data.bids.length;
        }
        return 0;
    }
    asksLength() {
        if (this.data) {
            return this.data.asks.length;
        }
        return 0;
    }
    // orderLengthValidation(limit) {
    //     return this.bidsLength() < 60 
    //         && this.bidsLength() > limit?limit:this.minNumberOfOrders()
    //         && this.asksLength() < this.maxNumberOfOrders() 
    //         && this.asksLength() > limit?limit:this.minNumberOfOrders();
    // }
    reformatOrder(order) {
        let side = order.type == "ask" ? "sell" : "buy";
        return {
            id: order.id, side: side, ord_type: order.ord_type, price: Number(order.price),
            market: order.market, remaining_volume: Number(order.volume)
        };
    }
    removeOrder(order) {
        var orderList = this.ordersOfSide(order.type || "");
        let idx = orderList.findIndex(o => {return o.id == order.id});
        if(idx >= 0){ orderList.splice(idx, 1); }
    }
    addOrder(order) {
        var orderList = this.ordersOfSide(order.type || "");
        orderList.push(this.reformatOrder(order));
    }
    updateOrder(order) {
        var orderList = this.ordersOfSide(order.type || "");
        let foundOrder = false;
        for (let i = 0; i < orderList.length; i++) {
            if (orderList[i].id === order.id) {
                orderList[i] = this.reformatOrder(order);
                foundOrder = true;
                break;
            }
        }
        if (!foundOrder) { this.addOrder(order); }
    }

    mergeVolume(orders = [], limit = 50) {
        let result = [];
        let tmp_idx = 0;
        this.sortOrders();
        for (let idx = 0; idx < orders.length; idx++) {
            let ord = orders[idx];
            if (result[tmp_idx] && Number(result[tmp_idx].price) == Number(ord.price)) {
                result[tmp_idx].volume = Number(result[tmp_idx].volume) + Number(ord.remaining_volume ? ord.remaining_volume : ord.volume);
            } else {
                result.push({ price: Number(ord.price), volume: Number(ord.remaining_volume ? ord.remaining_volume : ord.volume) });
                tmp_idx = result.length - 1;
            }
        }
        return result.splice(0, limit);
    }

    orderbookResult(limit = 50) {
        this.data.asks = this.mergeVolume(this.data.asks, limit);
        this.data.bids = this.mergeVolume(this.data.bids, limit);
        return this.data;
    }
    actionHandler(data, limit = 50) {
        if (!data.action || !data.order || !data.order.type) {
            console.error(`'Incorrect orderbook data: ${data}`);
            return this.data
        }
        switch (data.action) {
            case "add":
                this.addOrder(data.order);
                break;
            case "update":
                this.updateOrder(data.order);
                break;
            case "remove":
                this.removeOrder(data.order);
                break;
            default:
                break;
        }
        
        return this.orderbookResult(limit);
    }
}

class ACX {
    constructor({ market, access_key, secret_key, restApiEndPoint = "https://acx.io:443", socketEndPoint = 'wss://acx.io:8080', tradeFee = 0.002 }) {
        if (market) { this.market = market.toLowerCase(); }
        this.tradeFee = Number(tradeFee);
        this.restApiEndPoint = restApiEndPoint;
        this.socketEndPoint = socketEndPoint;
        this.ws = null;
        if(socketEndPoint){
            this.ws = new WebSocket(this.socketEndPoint);
        }
        this.access_key = access_key;
        this.secret_key = secret_key;
        this._onTradeChanged = null;
        this._onOrderbookChanged = null;
    }
    setTradeFee(tradeFee = 0.002) {
        this.tradeFee = Number(tradeFee);
    }
    getSignature(verb, uri, query) {
        var queryStr = ""
        if (verb && uri && query) {
            query.access_key = this.access_key;
            /**
             * blocked by Sean on 20180725 remove url encode, please let me know if there is any issue without encode.
             */
            // queryStr = verb.toUpperCase() + '|' + uri + '|' + Object.keys(query).sort().reduce((a, k) => { a.push(k + '=' + encodeURIComponent(query[k])); return a }, []).join('&');
            queryStr = verb.toUpperCase() + '|' + uri + '|' + Object.keys(query).sort().reduce((a, k) => { a.push(k + '=' + query[k]); return a }, []).join('&');
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
        // self.ws = new WebSocket(self.socketEndPoint);
        self.connectWebSocket(onTradeChanged, onOrderbookChanged);
    }
    connectWebSocket(onTradeChanged = this._onOrderbookChanged, onOrderbookChanged = this._onOrderbookChanged){
        let self = this;
        console.log('ACX WebSocket connecting...');
        self.ws = new WebSocket(self.socketEndPoint);
        self.ws.on('open', () => {
            console.log('ACX WebSocket connected.');
        });
        self.ws.on('message', data => {
            let rcvData = JSON.parse(data);
            if (rcvData) {
                if (rcvData.challenge) {
                    self.ws.send('{"auth":{"access_key":"' + self.access_key + '","answer":"' + self.getSignature(self.access_key + rcvData.challenge) + '"}}');
                }
            }
        });
        self.ws.on('error', err => {
            console.error(err);
        });
        self.ws.on('close', () => {
            console.log('ACX WebSocket disconnected.');
            self.connectWebSocket();
        });
        if(onTradeChanged || self._onTradeChanged){
            this.onTradeChanged(onTradeChanged);
        }
        if(onOrderbookChanged || self._onOrderbookChanged){
            this.onOrderbookChanged(onOrderbookChanged);
        }
    }
    onOrderbookChanged(markets = [], callback = null, limit = 50) {
        var self = this;
        if(callback){
            self._onOrderbookChanged = callback;
        }
        let orderbooks = Array.from(markets, m => (new OrderBook(m.toLowerCase())));
        orderbooks.forEach(_orderbook => {
            self.initOrderBook(_orderbook.market).then(data => { _orderbook.setData(data, limit); }).catch(err => { console.log(err); });
        })
        self.ws.on('message', data => {
            let rcvData = JSON.parse(data);
            if (rcvData && rcvData.orderbook) {
                orderbooks.forEach(_orderbook => {
                    if (_orderbook.market.toLowerCase() == rcvData.orderbook.order.market.toLowerCase() && _orderbook.data) {
                        _orderbook.data = _orderbook.actionHandler(rcvData.orderbook, limit);
                        if (rcvData.orderbook.action && (rcvData.orderbook.action == 'remove')) {
                            self.initOrderBook(_orderbook.market).then(data => {
                                _orderbook.setData(data, limit);
                            }).catch(err => { console.log(err); });
                        }
                    }
                });
                let result = orderbooks.filter( ob => {return ob.data} );
                if (self._onOrderbookChanged && result.length >0 ) { 
                    self._onOrderbookChanged (result); 
                }
            }
        });
    }
    onTradeChanged(callback = null) {
        var self = this;
        if(callback){
            self._onTradeChanged = callback;
        }
        self.ws.on('message', data => {
            let rcvData = JSON.parse(data);
            if (rcvData && rcvData.trade) {
                if (self._onTradeChanged) { self._onTradeChanged(rcvData.trade); }
            }
        });
    }
    getMyAccount() {
        let uri = '/api/v2/members/me.json';
        let params = {};
        return this.get(uri, this.getQueryParams('GET', uri, params), 'getMyAccount');
    }
    getMarketTrades({ market = this.market, order_by = 'desc', limit = 50, from = undefined, to = undefined, timestamp = undefined } = {}) {
        let params = { market };
        Object.assign(params, arguments[0]);
        return this.get('/api/v2/trades.json', params, 'getMarketTrades');
    }
    getMyTrades({ market = this.market, order_by = 'desc', limit = 50, from = undefined, to = undefined, timestamp = undefined } = {}) {
        let uri = '/api/v2/trades/my.json';
        let params = { market };
        Object.assign(params, arguments[0]);
        return this.get(uri, this.getQueryParams('GET', uri, params), 'getMyTrades');
    }
    getOrders({ market = this.market, order_by = 'desc', state = undefined, limit = 100, page = 1 } = {}) {
        let uri = '/api/v2/orders.json';
        let params = { market, order_by, state, limit, page };
        Object.assign(params, arguments[0]);
        return this.get(uri, this.getQueryParams('GET', uri, params), 'getOrders');
    }
    getOrderById(id) {
        let uri = '/api/v2/order.json';
        let params = { id };
        if(id.hasOwnProperty('id')){
            params = id;
        }
        return this.get(uri, this.getQueryParams('GET', uri, params), 'getOrderById');
    }
    getDeposits({ currency = undefined, limit = undefined, state = undefined } = {}) {
        let uri = '/api/v2/deposits.json';
        let params = { currency, limit, state };
        Object.assign(params, arguments[0]);
        return this.get(uri, this.getQueryParams('GET', uri, params), 'getDeposits');
    }
    getDeposit(txid) {
        let uri = '/api/v2/deposit.json';
        let params = { txid };
        return this.get(uri, this.getQueryParams('GET', uri, params), 'getDeposit');
    }
    getDepositAddress(currency = 'aud') {
        let uri = '/api/v2/deposit_address.json';
        let params = { currency };
        return this.get(uri, this.getQueryParams('GET', uri, params), 'getDepositAddress');
    }
    clearOrders({ market = this.market, side = undefined } = {}) {
        let uri = '/api/v2/orders/clear.json';
        let params = { market, side };
        return new Promise((resolve, reject) => {
            this.post(uri, this.getQueryParams('POST', uri, params), 'clearOrders').then(data => {
                if (side) { resolve(side.toUpperCase() + " Orders cancelled"); }
                else { resolve("All orders cancelled"); }
            }).catch(reject);
        });
    }
    placeOrders(orders = []) {
        return new Promise((resolve, reject) => {
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
                if (err) { 
                    reject(err); 
                }
                else if(res.statusCode == 400){ 
                    reject( this.market + 'PLACEORDERS FAILED ' + res.statusCode + ' ' + res.statusMessage); 
                }
                else {
                    resolve(res.statusMessage);
                    res.resume();
                }
            });
        });
    }
    placeOrder({ market = this.market, side = undefined, price = undefined, volume = undefined } = {}) {
        let uri = '/api/v2/orders.json';
        let params = { market, side, volume };
        if( !price ){ params.ord_type = 'market'; }
        else{ params.price = price; }
        return this.post(uri, this.getQueryParams('POST', uri, params), 'placeOrder');
    }
    /**
     * Abandoned by Sean 20180725
     */
    // updateOrdersByPrice(side, price, volume, callback) {
    //     var self = this;
    //     self.getOrdersByPrice(side, price, (orders) => {
    //         var executed = 0;
    //         var orderFound = false;
    //         if (orders.filter((o) => { return Number(o.price) == Number(price) }).length == 0) {
    //             self.placeOrder({ side: side, volume: volume, price: price }, (data) => {
    //                 if (callback) { callback(data) }
    //             });
    //         }
    //         else {
    //             /* Go through all orders */
    //             orders.forEach((order, idx) => {
    //                 if (order.side.toLowerCase() == side.toLowerCase() && Number(order.price) == Number(price) && Number(order.volume) == Number(volume) && !orderFound) {
    //                     /* keep the first order which match the update */
    //                     executed++;
    //                     orderFound = true;
    //                 }
    //                 else {
    //                     /* delete all other others which donot match */
    //                     self.deleteOrder(order.id, (data) => {
    //                         executed++;
    //                         if (!orderFound && !executed >= orders.length) {
    //                             self.placeOrder({ side: side, volume: volume, price: price }, (data) => {
    //                                 if (callback) { callback(data) }
    //                             });
    //                         }
    //                     });
    //                 }
    //             });
    //         }
    //     });
    // }
    // updateOrderById({ market = this.market, id = undefined, side = undefined, price = undefined, volume = undefined } = {}) {
    //     if (!id) throw Error('updateOrderById: Invalid Order ID');
    //     let params = { market: market, id: id };
    //     return new Promise((resolve, reject) => {
    //         this.deleteOrder(id).then(data => {
    //             if (!side) { side = data.side; }
    //             if (!volume) { volume = data.volume; }
    //             if (!price) { price = data.price; }
    //             this.placeOrder({ market: market, side: side, price: price, volume: volume }).then(order => {
    //                 resolve(order);
    //             }).catch(e => { console.error(e); })
    //         });
    //     });
    // }
    deleteOrder(id = '') {
        let uri = '/api/v2/order/delete.json';
        let params = { id };
        if(id.hasOwnProperty('id')){
            params = id;
        }
        return this.post(uri, this.getQueryParams('POST', uri, params), 'deleteOrder');
    }
    deleteOrders(ids = '') {
        let uri = '/api/v2/orders/delete.json';
        let params = { ids };
        return this.post(uri, this.getQueryParams('POST', uri, params), 'deleteOrders');
    }
    getMarkets() {
        return this.get('/api/v2/markets.json', null, 'getMarkets');
    }
    getTickers() {
        return this.get('/api/v2/tickers.json', null, 'getTickers');
    }
    getOrderBook({ market = this.market, asks_limit = 20, bids_limit = 20 } = {}) {
        let params = { market, asks_limit, bids_limit };
        return this.get('/api/v2/order_book.json', params, 'getOrderBook');
    }
    getDepth({ market = this.market, limit = 300 } = {}) {
        if (limit <= 0) { limit = 1; }
        let params = { market: market.toLowerCase(), limit };
        return new Promise( (resolve,reject)=>{
            this.get('/api/v2/depth.json', params, 'getDepth').then(data => {
                function calcSide(side) {
                    if (limit > 1) {
                        let tempSide = [];
                        for(let d of side){
                            tempSide.push({ price: Number(d[0]), volume: Number(d[1]) });
                        }
                        return tempSide;
                    }
                    return { price: Number(side[0][0]), volume: Number(side[0][1]) }
                }
                resolve({
                    asks: calcSide(data.asks),
                    bids: calcSide(data.bids)
                });
            }).catch(reject);
        } );

    }
    getKLine({ market = this.market, limit = 30, period = 1, timestamp = undefined } = {}) {
        let params = { market, limit };
        if (period && [1, 5, 15, 30, 60, 120, 240, 360, 720, 1440, 4320, 10080].filter(p => { return p == period }).length == 0) { throw Error('getKLine: period. [1, 5, 15, 30, 60, 120, 240, 360, 720, 1440, 4320, 10080]') }
        Object.assign(params, arguments[0]);
        return this.get('/api/v2/k.json', params, 'getKLine');
    }
    getKLineWithPendingTrades({ market = this.market, trade_id = undefined, limit = 30, period = 1, timestamp = undefined } = {}) {
        let params = { market, limit };
        if (period && [1, 5, 15, 30, 60, 120, 240, 360, 720, 1440, 4320, 10080].filter(p => { return p == period }).length == 0) { throw Error('getKLine: period. [1, 5, 15, 30, 60, 120, 240, 360, 720, 1440, 4320, 10080]') }
        Object.assign(params, arguments[0]);
        return this.get('/api/v2/k_with_pending_trades.json', params, 'getKLineWithPendingTrades');
    }
    getServerTimestamp() {
        return this.get('/api/v2/timestamp.json', null, 'getServerTimestamp');
    }
    getWithdraws({ currency = undefined, limit = undefined, state = undefined } = {}) {
        let uri = '/api/v2/withdraws.json';
        let params = { currency, limit, state };
        Object.assign(params, arguments[0]);
        return this.get(uri, this.getQueryParams('GET', uri, params), 'getWithdraws');
    }
    getWithdrawById(id) {
        let uri = '/api/v2/withdraw.json';
        let params = { id };
        return this.get(uri, this.getQueryParams('GET', uri, params), 'getWithdrawById');
    }
    createWithdraw({ currency = 'btc', sum = undefined, address = undefined, fee = undefined } = {}) {
        let uri = '/api/v2/withdraw.json';
        let params = { currency, sum, address, fee };
        return this.post(uri, this.getQueryParams('POST', uri, params), 'createWithdraw');
    }
    get(uri, query, source) {
        let options = { uri: this.restApiEndPoint + uri, json: true };
        if (query) {
            options.qs = query;
            options.qs.access_key = this.access_key;
        }
        return new Promise((resolve, reject) => {
            request(options).then(resolve).catch((err) => {
                let error = err.error;
                if(err.error.error){
                    error = err.error.error;
                }
                if(error && typeof error != 'string'){
                    if(err.statusCode){ error.statusCode = err.statusCode; }
                    if(err.name){ error.name = err.name; }
                    if(source){ error.source = source; }
                }
                reject(error);
            });
        });
        
    }
    post(uri, query, source) {
        query.access_key = this.access_key;
        return new Promise((resolve, reject) => {
            request({
                method: 'POST',
                uri: this.restApiEndPoint + uri,
                formData: query,
                json: true
            }).then(resolve).catch((err) => {
                let error = err.error;
                if(err.error.error){
                    error = err.error.error;
                }
                if(error && typeof error != 'string'){
                    if(err.statusCode){ error.statusCode = err.statusCode; }
                    if(err.name){ error.name = err.name; }
                    if(source){ error.source = source; }
                }
                reject(error);
            });
        });
    }
    initOrderBook(market = this.market) {
        return this.getOrderBook({ market: market, ask_limit: 50, bids_limit: 50 });
    }
}

module.exports = ACX;