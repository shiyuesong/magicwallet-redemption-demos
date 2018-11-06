const req = require('../../libs/req');
const login = require('../login');
const cfg = require('../../config');
const utils = require('../../libs/utils');

async function update() {
  try {
    let loginCode = await login.userLogin('gdex-debug');

    let params = {
      id: 3685,                          // 支付方式id
      user_id: 3781,                     // Get from get_wallet_user_info()
      account_type: "银行卡",             // 支付宝，微信，银行卡
      user_account: '6222000022220001',  // 银行卡号，支付宝账号，微信账号
      bank_name: "中国银行 知春路支行",     // 只在account_type == '银行卡' 时有用 当需要填支行名称时，用空格间隔
      user_account_name: "十月",         // 银行卡账户名称，一般为真实姓名
      user_flag: true,                  // 此支付方式 是否为用户使用
      merchant_flag: false,             // 此支付方式 是否为承兑商使用
      otctrader_flag: false,            // 此支付方式 是否为场外卖家使用
    }

    utils.signObject(params, cfg.debug_account_infos.account_name, cfg.debug_account_infos.active_priv_key);
    params.loginCode = loginCode;

    let info = await req.post_req('/MerchantInterfaces/updateWalletUserPayMethod', params);
    console.log(info);
  }
  catch(err) {
    if (err && err.message) {
      console.log(err.message);
    } else {
      console.log(err);
    }
  }
}

update();