const req = require('../../libs/req');
const login = require('../login');
const cfg = require('../../config');
const utils = require('../../libs/utils');

async function del() {
  try {
    let loginCode = await login.userLogin('gdex-debug');

    let params = {
      merchant_id: 1077,
      merchant_btsaccount: 'magicw-1',
      merchant_symbol: 'CNY'
    }

    utils.signObject(params, cfg.debug_account_infos.account_name, cfg.debug_account_infos.active_priv_key);
    params.loginCode = loginCode;

    let info = await req.post_req('/MerchantInterfaces/cancelCollectMerchants', params);
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