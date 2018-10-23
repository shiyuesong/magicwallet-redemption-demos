const req = require('../../libs/req');
const login = require('../login');
const cfg = require('../../config');
const utils = require('../../libs/utils');

async function cancel() {
  try {
    let loginCode = await login.userLogin('gdex-debug');

    let recharge_id = 7211;  // 充值ID，充值锁定时获得

    let params = {
      remarks: '测试取消'
    }

    utils.signObject(params, cfg.debug_account_infos.account_name, cfg.debug_account_infos.active_priv_key);
    params.loginCode = loginCode;

    let info = await req.post_req('/MerchantInterfaces/' + recharge_id + '/rechargeCancel', params);

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

cancel();