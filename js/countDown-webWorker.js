(function () {
  var worker;
  // 获取dom
  var minutes1 = document.getElementsByClassName('minutes_1')[0]
  var minutes2 = document.getElementsByClassName('minutes_2')[0]
  var seconds1 = document.getElementsByClassName('seconds_1')[0]
  var seconds2 = document.getElementsByClassName('seconds_2')[0]
  isLook()
  getTime()

  function getTime() {
    $.ajax({
      url: 'http://10.1.16.174:9000/countdown',
      success: function (date) {
        worker && worker.terminate();
        worker = new Worker('./js/worker.js')
        worker.addEventListener('message', function (event) {
          var date = event.data
          // console.log(date.minutes, date.seconds)
          setTime(date.minutes, date.seconds)
        }, false)
        worker.addEventListener('error', function (err) {
          console.error(err)
        })
        worker.postMessage(date);
      }
    })
  }

  function setTime(minutes, seconds) {
    minutes += ''
    seconds += ''
    minutes1.innerHTML = minutes[0]
    minutes2.innerHTML = minutes[1]
    seconds1.innerHTML = seconds[0]
    seconds2.innerHTML = seconds[1]
  }
  // 判断用户是或否在浏览当前页面
  function isLook() {
    var hiddenProperty = 'hidden' in document ? 'hidden' :
      'webkitHidden' in document ? 'webkitHidden' :
      'mozHidden' in document ? 'mozHidden' :
      null;
    var visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
    var onVisibilityChange = function () {
      if (!document[hiddenProperty]) {
        document.title = '被发现啦(*´∇｀*)';
        getTime()
      } else {
        document.title = '藏好啦(つд⊂)';
      }
    }
    document.addEventListener(visibilityChangeEvent, onVisibilityChange);
  }

})()
