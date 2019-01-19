const ERROR_STATUS = {
  UNAUTHORIZED: 400
}

const ERROR_MESSAGE = {
  [ERROR_STATUS.UNAUTHORIZED]: "not authorized"
}

const errorResponse = (res, code) => {
  let text
  switch (code) {
    case ERROR_STATUS.UNAUTHORIZED:
      text = ERROR_MESSAGE[code]
      break
    default:
      text = "server error"
  }

  return res.status(400).send({error: text})
}

let exportable = {
  errorResponse,
  ERROR_STATUS
}

module.exports = exportable
