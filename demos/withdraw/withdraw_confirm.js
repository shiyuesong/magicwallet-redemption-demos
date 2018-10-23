const req = require('../../libs/req');
const login = require('../login');
const cfg = require('../../config');
const utils = require('../../libs/utils');

async function confirm() {
  try {
    let loginCode = await login.userLogin('gdex-debug');

    let withdraw_id = 2845;  // 提现ID

    let params = {
      remarks: '测试提现完成'
    }

    utils.signObject(params, cfg.debug_account_infos.account_name, cfg.debug_account_infos.active_priv_key);
    params.loginCode = loginCode;

    let info = await req.post_req('/MerchantInterfaces/' + withdraw_id + '/withdrawConfirm', params);

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