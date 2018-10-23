const req = require('../../libs/req');
const login = require('../login');
const cfg = require('../../config');

async function get() {
  try {
    let loginCode = await login.userLogin('gdex-debug');

    let params = {
      loginCode: loginCode,
      bts_account: cfg.debug_account_infos.account_name
    }
    let info = await req.post_req('/MerchantInterfaces/getCustomerWithdrawHistory', params);
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

get();