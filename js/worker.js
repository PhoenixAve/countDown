(function () {
  if (typeof (Worker) !== "undefined") {
    // Yes! Web worker support! Some code.....
  } else {
    // Sorry! No Web Worker support..
  }

  var prevTime;
  var nextTime;

  // 发起请求是的客户端时间
  var clientTime1 = Date.now()
  var clientTime2 = Date.now()
  var virtualIntervalId;
  var timeoutId;
  var date = 0
  // 剩余秒数
  var remainingSeconds = 0
  // 毫秒转化为秒产生的误差
  var errorTime = 0
  // 剩余分钟数
  var minutes = addZero(0)
  // 剩余秒数
  var seconds = addZero(0)
  // recursion循环执行次数
  var loopTimes = 0
  // 用来接收时间的
  self.addEventListener('message', function (event) {
    // 每次重新开始都要把循环次数初始化为0
    date = event.data
    clientTime2 = Date.now()
    // 去除网络请求的误差，假设发起和收到耗时相同
    remainingSeconds -= (clientTime2 - clientTime1) / 2
    remainingSeconds = parseInt(date / 1000)
    errorTime = parseInt(date % 1000)
    // console.log(remainingSeconds, errorTime)

    minutes = addZero(parseInt(remainingSeconds / 60))
    seconds = addZero(parseInt(remainingSeconds % 60))
    // console.log(minutes, seconds)

    clearTimeout(timeoutId)
    // 减小毫秒转化为秒产生的误差
    timeoutId = setTimeout(function () {
      prevTime = Date.now()
      postMessage({
        type: 'setTime',
        minutes: minutes,
        seconds: seconds
      })
      recursion()
    }, errorTime)
  }, false);

  // 模拟ajax请求
  // setTimeout(function () {
  //   // 服务器返回的结束时间和当前时间
  //   var date1 = 1526328000000
  //   var date2 = 1526333352564
  //   // 计算剩余时间
  //   date = date2 - date1
  //   // 收到请求后的客户端时间
  //   clientTime2 = Date.now()
  //   // 去除网络请求的误差，假设发起和收到耗时相同
  //   remainingSeconds -= (clientTime2 - clientTime1) / 2
  //   remainingSeconds = parseInt(date / 1000)
  //   errorTime = parseInt(date % 1000)
  //   // console.log(remainingSeconds, errorTime)

  //   minutes = addZero(parseInt(remainingSeconds / 60))
  //   seconds = addZero(parseInt(remainingSeconds % 60))
  //   // console.log(minutes, seconds)

  //   // 减小毫秒转化为秒产生的误差
  //   setTimeout(function () {
  //     postMessage({
  //       type: 'time',
  //       minutes: minutes,
  //       seconds: seconds
  //     })
  //     recursion()
  //   }, errorTime)
  // }, 100)

  // 通过递归模拟 setInterval
  function recursion() {
    remainingSeconds -= 1 // 剩余秒数每秒减1
    minutes = addZero(parseInt(remainingSeconds / 60)) // 剩余分钟数
    seconds = addZero(parseInt(remainingSeconds % 60)) // 剩余秒数
    // console.log(minutes, seconds)
    if (remainingSeconds === 0) {
      return // 倒计时结束
    }
    nextTime = Date.now()
    // 每次执行的时间减去执行了多少秒再减去第一次执行的时间，比较出每次实际执行时间和预定的一秒相差多少毫秒
    var errorTime = nextTime - loopTimes * 1000 - prevTime
    loopTimes += 1
    clearTimeout(virtualIntervalId)
    virtualIntervalId = setTimeout(function () {
      postMessage({
        type: 'setTime',
        minutes: minutes,
        seconds: seconds
      })
      recursion()
    }, 1000 - errorTime)
  }
  // 数字补 0 操作
  function addZero(number) {
    return number > 9 ? '' + number : '0' + number
  }
})()
