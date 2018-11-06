const req = require('../../libs/req');
const login = require('../login');
const cfg = require('../../config');
const utils = require('../../libs/utils');

async function del() {
  try {
    let loginCode = await login.userLogin('gdex-debug');

    let params = {
      id: 3684      // 支付方式的id
    }

    utils.signObject(params, cfg.debug_account_infos.account_name, cfg.debug_account_infos.active_priv_key);
    params.loginCode = loginCode;

    let info = await req.post_req('/MerchantInterfaces/delWalletUserPayMethod', params);
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

del();