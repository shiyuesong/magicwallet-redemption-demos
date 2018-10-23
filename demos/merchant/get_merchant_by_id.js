const req = require('../../libs/req');
const login = require('../login');

async function get() {
  try {
    let loginCode = await login.userLogin('gdex-debug');

    let params = {
      loginCode: loginCode,
      id: 1079  // Merchant ID
    }
    let merchant = await req.post_req('/MerchantInterfaces/getMerchantById', params);
    console.log(merchant);
  }
  catch (err) {
    if (err && err.message) {
      console.log(err.message);
    } else {
      console.log(err);
    }
  }
}

get();