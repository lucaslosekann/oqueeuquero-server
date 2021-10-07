exports.me = (req, res) => {
  res.send(req.user)
}