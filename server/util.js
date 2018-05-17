const formatDate = function (date) {
  var date = new Date()
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()

  let hour = date.getHours()
  let minutes = date.getMinutes()
  let seconds = date.getSeconds()

  return year + '-' + addZero(month) + '-' + addZero(day) + ' ' + addZero(hour) + ':' + addZero(minutes) + ':' + addZero(seconds)
}

const addZero = function (number) {
  return number > 9 ? '' + number : '0' + number
}

module.exports = {
  formatDate,
  addZero
}