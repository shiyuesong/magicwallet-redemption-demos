const req = require('../../libs/req');
const login = require('../login');
const cfg = require('../../config');
const utils = require('../../libs/utils');


/*
充值的状态
      "enum": [
        "applied",  // 已创建  （客户锁定承兑商保证金后的状态）
        "need_confirm",  // 需承兑商确认线下收款  （客户线下转账后，点击已转账后的状态)
        "merchant_confirmed", // 承兑商已确认收款  （承兑商点已收款后的状态，后台转账bitCNY给客户中）
        "finished", // 完成
        "cancelled" // 取消
      ],
*/

async function lock() {
  try {
    let loginCode = await login.userLogin('gdex-debug');

    let code = await req.post_req('/MerchantInterfaces/getRechargeRandomCode', {
      loginCode: loginCode
    });

    let params = {
      merchant_id: 1079, // 十月
      recharge_amount: 1, // 1 CNY
      recharge_code: code.code,
      bts_asset: 'CNY', // CNY
      exchange_identifier: 'GDEX', // 交易所充值来源标识
      version: '1'
    }

    utils.signObject(params, cfg.debug_account_infos.account_name, cfg.debug_account_infos.active_priv_key);
    params.loginCode = loginCode;

    let locked_info = await req.post_req('/MerchantInterfaces/rechargeLock', params);
    console.log(locked_info);
  }
  catch (err) {
    if (err && err.message) {
      console.log(err.message);
    } else {
      console.log(err);
    }
  }
}

lock();