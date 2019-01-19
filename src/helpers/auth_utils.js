let {errorResponse, ERROR_STATUS} = require("./errors")

const authRoute = (req, res, next) => {
  const token = req.headers['authorization']

  if (!token || !isValidToken(token)) {
    return errorResponse(res, ERROR_STATUS.UNAUTHORIZED)
  }

  next()
}

const isValidToken = token => {
    if (RegExp(/Bearer/).test(token)) {
      return true
    }

    return false
}

let exportable = {
  authRoute
}

module.exports = exportable
