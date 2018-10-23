
const req = require('../libs/req');
const cfg = require('../config')

async function userLogin(id_code) {
  try {

    // Debug专用
    if (cfg.debug_account_infos.login_code && cfg.debug_account_infos.login_code[id_code]) {
      return cfg.debug_account_infos.login_code[id_code];
    }

    let ret = await req.post_req(
      '/MerchantInterfaces/getLoginCode',
      {
        "userIdCode": id_code
      }
    );
    return ret;
  }
  catch(err) {
    throw(err);
  }
}

// userLogin('gdex-debug').then(ret => {
//   console.log(ret);
// }).catch(err => {
//   console.log(err);
// });

module.exports = {
  userLogin
}