(function () {
  // 获取dom
  var minutes1 = document.getElementsByClassName('minutes_1')[0]
  var minutes2 = document.getElementsByClassName('minutes_2')[0]
  var seconds1 = document.getElementsByClassName('seconds_1')[0]
  var seconds2 = document.getElementsByClassName('seconds_2')[0]
  isLook()

  // 发起请求是的客户端时间
  var clientTime1 = Date.now()
  var clientTime2 = Date.now()
  var date = 0
  // 剩余秒数
  var remainingSeconds = 0
  // 毫秒转化为秒产生的误差
  var errorTime = 0
  // 剩余分钟数
  var minutes = addZero(0)
  // 剩余秒数
  var seconds = addZero(0)
  // 循环开始的时间
  var prevTime;
  // 每次循环执行的时间
  var nextTime;
  // recursion循环执行次数
  var loopTimes = 0

  getTime()

  function getTime() {
    $.ajax({
      url: 'http://10.1.16.174:9000/countdown',
      success: function (date) {
        // 每次重新获取都要把循环次数变为0
        loopTimes = 0
        // 收到请求后的客户端时间
        clientTime2 = Date.now()
        // 去除网络请求的误差，假设发起和收到耗时相同
        remainingSeconds -= (clientTime2 - clientTime1) / 2
        remainingSeconds = parseInt(date / 1000)
        errorTime = parseInt(date % 1000)
        // console.log(remainingSeconds, errorTime)
        minutes = addZero(parseInt(remainingSeconds / 60))
        seconds = addZero(parseInt(remainingSeconds % 60))
        // console.log(minutes, seconds) 减小毫秒转化为秒产生的误差
        clearTimeout(timeoutId)
        timeoutId = setTimeout(function () {
          prevTime = Date.now()
          setTime()
          recursion()
        }, errorTime)
      }
    })
  }
  var intervalId;
  var timeoutId;
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
    clearTimeout(intervalId)
    intervalId = setTimeout(function () {
      setTime()
      recursion()
    }, 1000 - errorTime)
  }
  // 数字补 0 操作
  function addZero(number) {
    return number > 9 ?
      '' + number :
      '0' + number
  }
  // 设置页面显示的倒计时
  function setTime() {
    minutes1.innerHTML = minutes[0]
    minutes2.innerHTML = minutes[1]
    seconds1.innerHTML = seconds[0]
    seconds2.innerHTML = seconds[1]
  }
  // 判断用户是或否在浏览当前页面
  function isLook() {
    var hiddenProperty = 'hidden' in document ?
      'hidden' :
      'webkitHidden' in document ?
      'webkitHidden' :
      'mozHidden' in document ?
      'mozHidden' :
      null;
    var visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
    var onVisibilityChange = function () {
      if (!document[hiddenProperty]) {
        document.title = '被发现啦(*´∇｀*)';
        // getTime()
      } else {
        document.title = '藏好啦(つд⊂)';
      }
    }
    document.addEventListener(visibilityChangeEvent, onVisibilityChange);
  }

})()
