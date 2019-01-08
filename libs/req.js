const request = require('superagent');
const cfg = require('../config');

function post_req(api, params) {
  return new Promise((resolve, reject) => {
    request.post(cfg.configs.API_PREFIX + cfg.configs.API_VERSION + api)
    .send(params)
    .end((err, res) => {
      if (res.status != 200) {
        return reject(res.body.error.message);
      }
      else {
        resolve(res.body);
      }
    });
  });
}

module.exports = {
  post_req
}
