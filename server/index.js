const express = require('express')
const app = express()

const {formatDate} = require('./util.js')

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const overTime = (new Date()).getTime() + 36000000
app.get('/countdown', function (req, res) {
  console.log('请求倒计时时间')
  var date = new Date().getTime()
  res.send(overTime - date + '')
})

const server = app.listen(9000, '10.1.16.174', function () {
  const host = server.address().address
  const port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port)
})