const req = require('../../libs/req');
const login = require('../login');
const cfg = require('../../config');

/*
排序方式：
    "sort_by_escrow",             // 保证金金额
    "sort_by_high_limit",         // 最高上限
    "sort_by_fee",                // 手续费
    "sort_by_cash_amount",        // 现金额度  （提现专用）
    "sort_by_transaction_num",    // 成交笔数
    "sort_by_transaction_amount", // 成交总额
    "sort_by_response_time"       // 相应时间
*/

async function get() {
  try {
    let loginCode = await login.userLogin('gdex-debug');

    let params = {
      loginCode: loginCode,
      bts_account: cfg.debug_account_infos.account_name,
      action: 'recharge', // recharge / withdraw
      sortChoosed: 'sort_by_escrow',
      merchant_amount_type: 'CNY'
    }
    let merchant_list = await req.post_req('/MerchantInterfaces/getMerchantList', params);

    console.log(merchant_list);
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