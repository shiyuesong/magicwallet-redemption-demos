const req = require('../../libs/req');
const login = require('../login');
const cfg = require('../../config');

async function get() {
  try {
    let loginCode = await login.userLogin('gdex-debug');

    let params = {
      loginCode: loginCode,
      bts_account: cfg.debug_account_infos.account_name,
      merchant_symbol: 'CNY',
      merchant_name: '' // 模糊查找， part of merchant name: for instance: "峰峰"
    }

    let merchant_list = await req.post_req('/MerchantInterfaces/getCollectMerchantsList', params);
    console.log(merchant_list);

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