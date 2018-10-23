const request = require('superagent');
const cfg = require('../config');

function post_req(api, params) {
  return new Promise((resolve, reject) => {
    request.post(cfg.configs.API_PREFIX + cfg.configs.API_VERSION + api)
    .send(params)
    .end((err, res) => {
      if (res.status != 200) {

        let parsed_res = JSON.parse(res.text);

        if (parsed_res.error && parsed_res.error.message) {
          let server_msg = JSON.parse(parsed_res.error.message);

          if (server_msg.response && server_msg.response.text) {
            let server_res = JSON.parse(server_msg.response.text);
            return reject(server_res.error);
          }
        }
        else if (parsed_res.error){
          return reject(parsed_res.error);
        }

        return reject(res);
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