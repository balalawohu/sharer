// 封装返回格式
// 封装返回格式
export default (req, res, next) => {
  res.ok = function (data = null, msg = '操作成功') {
    return res.json({
      code: 200,
      msg,
      data
    })
  }
  res.fail = function (msg = '操作失败', code = 400, data = null) {
    return res.json({
      code,
      msg,
      data
    })
  }
  next()
}
