const req = require('../../libs/req');
const login = require('../login');
const cfg = require('../../config');

async function get() {
  try {
    let loginCode = await login.userLogin('gdex-debug');

    let params = {
      loginCode: loginCode,
      user_id: 3781   // Get from get_wallet_user_info()
    }
    let info = await req.post_req('/MerchantInterfaces/getWalletUserPayMethods', params);
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