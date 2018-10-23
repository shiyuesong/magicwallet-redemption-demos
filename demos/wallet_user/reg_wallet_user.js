const req = require('../../libs/req');
const login = require('../login');
const cfg = require('../../config');
const utils = require('../../libs/utils');

async function send_code() {

  try {
    let loginCode = await login.userLogin('gdex-debug');

    let params = {
      customer_phone: "18811371264",
    }
  
    utils.signObject(params, cfg.debug_account_infos.account_name, cfg.debug_account_infos.active_priv_key);
    params.loginCode = loginCode;

    // Send phone code
    let ret = await req.post_req('/MerchantInterfaces/sendPhoneCode', params);

    // Send email code
    //let ret = await req.post_req('/MerchantInterfaces/sendEmailCode', params);

    console.log(ret);
  }
  catch(err) {
    console.log(err);
  }

}

async function reg_wallet_user() {

  try {
    let loginCode = await login.userLogin('gdex-debug');

    let params = {
      fullname: '十月',
      sfid: '11010819860422XXXX', // Optional
      mphone: '18811371264',
      check_code: '170557' 
    }

    utils.signObject(params, cfg.debug_account_infos.account_name, cfg.debug_account_infos.active_priv_key);
    params.loginCode = loginCode;

    let ret = await req.post_req('/MerchantInterfaces/addWalletUser', params);
    console.log(ret);
  }
  catch(err) {
    if (err && err.message) {
      console.log(err.message);
    } else {
      console.log(err);
    }
  }

}

// Fisrt step: send phone / email check code
// send_code();

// Second step: reg wallet user
reg_wallet_user();