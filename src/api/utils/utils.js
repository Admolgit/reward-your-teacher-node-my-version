const axios = require('axios');

exports.apiGet = (path) => {
  const config = {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  };
  // if (!auth) {
  //   config.headers = {};
  // }
  axios.get(`${path}`, config).then((response) => response);
};

exports.apiPost = (path, data, { headers, conf }, auth = true)  => {
  const Authorization = auth && `Bearer ${process.env.PAYSTACK_SECRET_KEY}`;
  const config = {
    conf,
    headers: {
      Authorization,
      ...(headers ? headers : {} ),
    },
  };
  return axios.post(`${path}`, data, config);
};

exports.apiPut = (path, data, conf = {}) => {
  const config = {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
    conf,
  };
  return axios.put(`${path}`, data, config);
};

exports.apiPatch = (path, data, conf = {}) => {
  const config = {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
    conf,
  };
  return axios.patch(`${path}`, data, config);
};

exports.apiDelete = (path, conf = {}) => {
  const config = {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
    conf,
  };
  return axios.delete(`${path}`, config);
};
