'use strict';

const bitsharesjs = require('bitsharesjs');
const bsws = require('bitsharesjs-ws');
const Apis = bsws.Apis;
const promiseRetry = require('promise-retry');
var debug = require('debug')('bts-account-cache');

const btsApiNodes = [
    { url: "wss://bts.open.icowallet.net/ws", location: 'Hangzhou' },
    { url: "wss://ws.gdex.top", location: 'Shanghai' },
    { url: "wss://api.bts.ai", location: 'Beijing'}
];

function getApiNode() {
    const maxIndex = btsApiNodes.length;
    var i = Math.floor(Math.random() * maxIndex);
    return btsApiNodes[i].url;
}

var conStatus = 'closed';
Apis.setRpcConnectionStatusCallback(function (status) {
    conStatus = status;
    if (status == 'open') {
        connectChain().then(set_subscribe_callback);
    }
    else if (status == 'closed') {
        debug('reconnecting to api instance');
        connectChain();
    }
})


function connectChain() {
    function _rawConnectChain() {
        var connect = conStatus == 'closed';
        if (connect)
            conStatus = 'connecting';
        return Apis.instance(getApiNode(), connect).init_promise;
    }
    if (conStatus == 'open') {
        return Apis.instance().init_promise;
    }
    return _rawConnectChain();
}

// 关注的帐号缓存
var account_cache = {

}

// 帐号相关的统计 缓存
var statistic_cache = {

}

//
var all_caches = {
    global_dynamic: {}
}
function isDiff2statistic(s0, s1) {
    for (var key in s0) {
        if (s0[key] !== s1[key]) {
            return true;
        }
    }
    return false;
}

function copyStatistic(s0, s1) {
    for (var key in s1) {
        s0[key] = s1[key];
    }
}

function objectChange(obj) {
    if (statistic_cache[obj.id] && isDiff2statistic(statistic_cache[obj.id], obj)) {
        debug('cache hit', statistic_cache[obj.id], obj);
        _get_account_from_chain(statistic_cache[obj.id].owner)
            .then((accountObj) => {
                copyStatistic(statistic_cache[obj.id], obj);
                full_account_change_callbacks.forEach(cb => {
                    cb(accountObj.account.name);
                })
            })
            .catch(debug);
    }
    else if (obj.id == '2.1.0') {
        all_caches.global_dynamic = obj;
    }
}

function _get_account_from_chain(account) {

    function fetch_account() {
        return connectChain().then(() => {
            return Apis.instance().db_api().exec('get_full_accounts', [[account], false])
        }).then((accs) => {
            if (accs[0] && accs[0][1]) {
                return accs[0][1];
            }
            else {
                throw new Error('no such account');
            }
        });
    }

    return promiseRetry(function (retry, number) {
        debug('attempt number', number);

        return fetch_account()
            .catch(function (err) {
                debug(err);
                if (err.message != 'no such account') {
                    retry(err);
                }
                else {
                    throw err;
                }
            });
    }, { retries: 8 }).then(function (account_object) {
        account_cache[account_object.account.id] = account_object;
        account_cache[account_object.account.name] = account_object;
        if (!statistic_cache[account_object.statistics.id]) {
            statistic_cache[account_object.statistics.id] = account_object.statistics;
        }
        Apis.instance().db_api().exec('get_objects', [[account_object.statistics.id]]);
        return account_object;
    });
}

function _get_asset_from_chain(asset) {

    function fetch_asset() {
        return connectChain().then(() => {
            return Apis.instance().db_api().exec('lookup_asset_symbols', [[asset]])
        }).then((accs) => {
            return accs[0];
        });
    }

    return promiseRetry(function (retry, number) {
        debug('attempt number', number);

        return fetch_asset()
            .catch(function (err) {
                debug(err);
                retry(err);
            });
    }).then(function (asset) {
        return asset;
    });
}


function _get_object_from_chain(obj_id) {

    function fetch_obj() {
        return connectChain().then(() => {
            return Apis.instance().db_api().exec('get_objects', [[obj_id]])
        }).then((accs) => {
            return accs[0];
        });
    }

    return promiseRetry(function (retry, number) {
        debug('attempt number', number);

        return fetch_obj()
            .catch(function (err) {
                debug(err);
                retry(err);
            });
    }).then(function (obj) {
        return obj;
    });
}

function _get_account_history_from_chain(account_id) {

    function get_history() {
        return connectChain().then(() => {
            return Apis.instance().history_api().exec('get_account_history',
                [account_id, '1.11.0', 100, '1.11.0'])
        }).then((transes) => {
            debug(transes);
            return transes;
        });
    }

    return promiseRetry(function (retry, number) {
        debug('attempt number', number);

        return get_history()
            .catch(function (err) {
                debug(err);
                retry(err);
            });
    }).then(function (transes) {
        return transes;
    });
}


function chainUpdate(update_objects) {
    update_objects.forEach((cs) => {
        cs.forEach(objectChange);
    });
}


function set_subscribe_callback() {
    Apis.instance().db_api().exec("set_subscribe_callback", [chainUpdate, false])
        .then(() => {
            var s = new Set();
            for (var key in statistic_cache) {
                var statistic_object = statistic_cache[key];
                if (!s.has(statistic_object.id)) {
                    s.add(statistic_object.id);
                    Apis.instance().db_api().exec("get_objects", [[statistic_object.id]])
                        .then((s) => {
                            objectChange(s[0]);
                        })
                }

            }
            Apis.instance().db_api().exec("get_objects", [['2.1.0']])
                .then((s) => {
                    objectChange(s[0]);
                })
        })
        .catch(error => {
            debug(error);
        });
}

function get_full_account(account) {
    // debug(account);
    if (account_cache[account]) {
        return Promise.resolve(account_cache[account]);
    }
    return _get_account_from_chain(account);
}

function getFeedPrice(btype, cb) {
    connectChain().then(oo => {
        Apis.instance().db_api().exec("lookup_asset_symbols", [[btype]]).then(obj => {
            return Promise.all([Apis.instance().db_api().exec('get_objects', [[obj[0].bitasset_data_id]]), new Promise(function (resolve, reject) { resolve(obj[0].precision); })]);
        }).then(objs => {
            var p = objs[0][0].current_feed.settlement_price;
            cb(null, p.base.amount / p.quote.amount * Math.pow(10, 5 - objs[1]));
        });
    });
}

var full_account_change_callbacks = [];
function add_full_account_change_callback(cb) {
    if (full_account_change_callbacks.indexOf(cb) < 0)
        full_account_change_callbacks.push(cb);
}

module.exports = {
    get_full_account: get_full_account,
    add_full_account_change_callback: add_full_account_change_callback,
    getFeedPrice: getFeedPrice,
    /* for test */
    get_asset_from_chain: _get_asset_from_chain,
    get_object_from_chain: _get_object_from_chain,
    get_account_history_from_chain: _get_account_history_from_chain,
    connectChain: connectChain
}
