const req = require('../../libs/req');
const login = require('../login');
const cfg = require('../../config');
const utils = require('../../libs/utils');

async function confirm() {
  try {
    let loginCode = await login.userLogin('gdex-debug');

    let recharge_id = 7211;  // 充值ID，充值锁定时获得

    let params = {
      pay_type: '支付宝',    //    "enum": ["支付宝","微信","银行卡"]
      recharge_account: cfg.debug_account_infos.account_name,
      remarks: '测试'
    }

    utils.signObject(params, cfg.debug_account_infos.account_name, cfg.debug_account_infos.active_priv_key);
    params.loginCode = loginCode;

    let info = await req.post_req('/MerchantInterfaces/' + recharge_id + '/rechargeConfirm', params);

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

confirm();