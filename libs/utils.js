
'use strict';
const bitsharesjs = require('bitsharesjs');
const accountCache = require('./bts-account-cache');
var debug = require('debug')('utils');

function signObject(obj, account, privKeyString) {
    var d = new Date();
    if (obj.bts_account) delete obj.bts_account;
    if (obj.sign_hex) delete obj.sign_hex;
    obj.nonce_timestamp = d.getTime();
    var str = objToString(obj);
    // debug(str);
    obj.bts_account = account;
    var privateKey = bitsharesjs.PrivateKey.fromWif(privKeyString);
    obj.sign_hex = bitsharesjs.Signature.signBuffer(new Buffer(str, 'utf-8'), privateKey).toBuffer().toString('hex');
}


function generateKeyFromPassword(accountName, role, password) {
    let seed = accountName + role + password;
    let privKey = bitsharesjs.PrivateKey.fromSeed(seed);
    let pubKey = privKey.toPublicKey().toString();

    return { privKey, pubKey };
}

function getKeys(account, pwd, assetName) {
    if (!assetName) {
        assetName = 'BTS';
    }
    let privkeyOwner = generateKeyFromPassword(account, "owner", pwd);
    let privkeyActive = generateKeyFromPassword(account, "active", pwd);
    let privkeyMemo = generateKeyFromPassword(account, 'memo', pwd);
    let pubkeyOwner = privkeyOwner.privKey.toPublicKey().toPublicKeyString(assetName);
    let pubkeyActive = privkeyActive.privKey.toPublicKey().toPublicKeyString(assetName);
    let pubkeyMemo = privkeyMemo.privKey.toPublicKey().toPublicKeyString(assetName);
    return {
        privkeyOwner: privkeyOwner,
        privkeyActive: privkeyActive,
        privkeyMemo: privkeyMemo,
        pubkeyOwner: pubkeyOwner,
        pubkeyActive: pubkeyActive,
        pubkeyMemo: pubkeyMemo
    }
}


function _checkSignatureStr(str, signStr, pubKeyStr) {
    debug(str, signStr, pubKeyStr);
    var pKey = bitsharesjs.PublicKey.fromStringOrThrow(pubKeyStr, 'BTS');
    var sign = bitsharesjs.Signature.fromHex(signStr);
    var ret = sign.verifyBuffer(new Buffer(str, 'utf-8'), pKey);
    debug(ret);
    return ret;
}

function objToString(obj) {
    if (obj instanceof Array) {
        return obj.map(objToString).join(',');
    }
    else if (obj instanceof Object) {

        var keys = Object.keys(obj);
        keys.sort();

        return keys.map((k) => {
            return k + '=' + objToString(obj[k]);
        }).join(',');

    }
    else {
        return '' + obj;
    }
}

function verifySignedObj(obj) {
    var nObj = {};
    var bts_account;
    var sign_hex;
    for (var k in obj) {
        switch (k) {
            case 'bts_account':
                bts_account = obj[k];
                break;
            case 'sign_hex':
                sign_hex = obj[k];
                break;
            default:
                nObj[k] = obj[k];
                break;
        }
    }
    var d = new Date();
    var tsNow = d.getTime();
    if (!obj.nonce_timestamp || typeof obj.nonce_timestamp != 'number'
        || tsNow + 50 * 1000 < obj.nonce_timestamp
        || tsNow - obj.nonce_timestamp > 2 * 50 * 1000
    ) {
        return Promise.reject('timestamp error');
    }
    var str = objToString(nObj);
    // debug(str);

    return accountCache.get_full_account(bts_account)
        .then((account) => {
            var active_keys = account.account.active.key_auths;
            var signOK = false;
            for (var i in active_keys) {
                var key = active_keys[i][0];
                if (_checkSignatureStr(str, sign_hex, key)) {
                    signOK = true;
                    break;
                }
            }
            return signOK;
        })
}

module.exports = {
    signObject: signObject,
    getKeys: getKeys,
    verifySignedObj: verifySignedObj
}
