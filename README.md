---
title: 倒计时功能实现多设备同步 
time: 2018-5-17
tags: javascript, 倒计时, webworker，多设备同步
grammar_cjkRuby: true
---

# 倒计时功能实现多设备同步

> 前两天接到了一个任务从服务器获取时间实现一个倒计时的功能，心想倒计时还不简单吗，不就是一个 `setInterval` 就搞定的事情吗，可是当我在不同的浏览器上一看发现几分钟后，倒计时就不一样了，火狐比谷歌要快，同一台设备上不同的浏览器都会存在差异，那不同的设备岂不是差别更大，于是为了解决这个问题，我开始了漫长的探索之旅，下面就讲讲我的探索之旅吧。

## 存在的问题

1. 既然时间是从服务器获取的，那么势必会受到网络的影响，当服务器拿到时间的那一刻是最准的时间，但是服务器可能并不会立即返回时间给前端，另外，当经过网络传输之后，时间已经不是之前的那个服务器时间了
2. 服务器的时间和客户端的时间是不一致的，并且客户端的时间用户是可以修改的，因此客户端的时间不能作为倒计时用的时间
3. `setTimeout` 并不一定会在指定的时间之后立刻执行，而是计算机的最短执行时间之后执行，如果一个操作耗时太长，那么当执行`setTimeout` 所指定的回调函数时，时间已经超过了预期时间
4. `setInterval` 在不同处理能力的设备上，甚至是不同的浏览器上都会存在误差，因此也不可用
5. `javascript` 是单线程的，当程序阻塞的时候，倒计时就会停止，比如使用 `alert` 阻塞程序的执行，倒计时就会停止
6. 浏览器后台执行一定时间之后可能会自动停止 `javascript` 的执行，以释放内存
7. 移动端程序是可以后台运行的，当程序从后台切换到前台的时候，程序是否会继续运行

## 误差的存在

1. 网络传输
2. 计算机执行各种操作，如执行dom操作，代码执行所消耗的时间等
3. 将毫秒转换为秒所产生的误差


## 减小误差
1. 前面说到 `setInterval` 是存在误差的，那么我们可以采用递归的方式使用 `setTimeout` 模拟 `setInterval` 来实现定时器的功能
2. 假设网络传输发送请求和接收请求是相同的，那么可以在发起网络请求之前获取客户端时间设为 `clientTime1`， 当收到请求之后设置时间设为 `clientTime2`，那么从服务器发送数据开始到前台接收到请求成功这段时间设为：`netError` ，可以粗略的计算出  `netError = （clientTime2 - clientTime1） /  2`
3. 假设第一次执行的时间为 `prevTime`，之后每次执行的时间为 `nextTime`，执行的次数为 `loopTimes` 那么我们可以在每次执行的时候计算出与第一次执行时间相差 `errorTime = loopTimes * 1000` 毫秒之后存在的误差，那么下次执行的时间就设置为 `1000 - errorTime`
4. 至于秒转换为毫秒产生的误差，我们可以让第一次的执行放在 `setTimeout` 里，设置时间为误差时间之后执行

## 总结
**切换前后台导致的问题，暂时没有太好的解决办法，但是 `webwoker` 可以作为参考，因为在移动端还存在问题**
误差的存在是不可避免的，但是我们可以通过计算去不断地减小误差，只要能让多设备实现同步显示，基本上就问题不大了

最后献上我的代码
```javascript
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
        // getTime() // 每次从后台切换到前台的时候重新获取服务器时间
      } else {
        document.title = '藏好啦(つд⊂)';
      }
    }
    document.addEventListener(visibilityChangeEvent, onVisibilityChange);
  }

})()
```

