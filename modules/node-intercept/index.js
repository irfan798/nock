const http = require('http')
const https = require('https')
const { inherits } = require('util')

const normalizeNodeRequestArguments = require('./lib/normalize-request-arguments')
const overrideRequests = require('./lib/override-requests')
const NockInterceptedClientRequest = require('./lib/client-request')

module.exports = setupNodeIntercept

/**
 * Here's some background discussion about overriding ClientRequest:
 * - https://github.com/nodejitsu/mock-request/issues/4
 * - https://github.com/nock/nock/issues/26
 * It would be good to add a comment that explains this more clearly.
 *
 * @param {Function} onIntercept
 * @returns {Function}
 */
function setupNodeIntercept(onIntercept) {
  // keep track of overrides so they can be restored
  const originalClientRequest = http.ClientRequest
  const originalHttpRequest = http.request
  const originalHttpGet = http.get
  const originalHttpsRequest = https.request
  const originalHttpsGet = https.get

  // do the overrides
  http.ClientRequest = NockInterceptedClientRequest
  overrideRequests(function (proto, overriddenRequest, args) {
    return new NockInterceptedClientRequest(...args)
  })

  // return function to remove the intercept
  return function removeIntercept() {
    http.ClientRequest = originalClientRequest
    http.request = originalHttpRequest
    http.get = originalHttpGet
    https.request = originalHttpsRequest
    https.get = originalHttpsGet
  }
}
