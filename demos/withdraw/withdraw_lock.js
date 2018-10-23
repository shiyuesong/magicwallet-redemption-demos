const req = require('../../libs/req');
const login = require('../login');
const cfg = require('../../config');
const utils = require('../../libs/utils');

/*
提现的状态
      "enum": [
        "applied",  // 已创建 （客户lock后的状态，后台从区块链上确认用户是否转账成功）
        "online_transferred",  // 链上转账成功 （客户已转账）
        "merchant_transferred", // 承兑商已转账 (承兑商已线下转账，需客户确认收款)
        "finished", // 完成 （客户点击确认收款后的状态）
        "cancelled",  // 取消  （区块链上未收到客户转账后，会自动将此笔提现标记为取消）
        "refunding",  // 退款中（后台给用户退款的状态， 1.承兑商现金不足，自己点击退款后的状态，2.承兑商长时间不作为，系统强制退款）
        "refunded"   // 已退款
      ],
*/

async function lock() {
  try {
    let loginCode = await login.userLogin('gdex-debug');

    let code = await req.post_req('/MerchantInterfaces/getWithdrawRandomCode', {
      loginCode: loginCode
    });

    let params = {
      merchant_id: 1079, // 十月
      withdraw_amount: 1, // 1 CNY
      withdraw_code: code.code,
      bts_asset: 'CNY', // CNY
      transaction_type: '支付宝', // 支付宝，微信，银行卡
      withdraw_account: 'song422000@sina.com',
      withdraw_account_name: '宋时跃',
      withdraw_bank: '', // 银行卡时必填
      exchange_identifier: 'GDEX', // 交易所充值来源标识
      version: '1'
    }

    utils.signObject(params, cfg.debug_account_infos.account_name, cfg.debug_account_infos.active_priv_key);
    params.loginCode = loginCode;

    let locked_info = await req.post_req('/MerchantInterfaces/withdrawLock', params);
    console.log(locked_info);

    // 当lock成功后，转账给承兑商的保证金账号
    // MEMO格式要求：
    // GDEX:_提现码, 举例： GDEX: Zd13dg
    // GDEX 字段可随意填写，之后的英文冒号+空格+提现码格式不能更改

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