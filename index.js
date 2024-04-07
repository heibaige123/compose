'use strict'

/**
 * Expose compositor.
 */

module.exports = compose

/**
 * Compose `middleware` returning
 * a fully valid middleware comprised
 * of all those which are passed.
 *
 * @param {Array} middleware middleware(中间件)数组
 * @return {Function}
 * @api public
 */

function compose (middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */

  return function (context, next) {
    // last called middleware #
    let index = -1
    // 调用dispatch，传入0
    return dispatch(0)
    function dispatch (i) {
      // i小于index，证明在中间件内调用了不止一次的next()，抛出错误
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      // 更新index的值
      index = i
      // middleware中的函数，从第1个开始
      let fn = middleware[i]
      // 如果i走到最后一个的后面，就让fn为next,此时fn为undefined
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        // 将其包装成一个Promise resolve态，主要作用是区分reject
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)))
      } catch (err) {
        // catch错误，并reject
        return Promise.reject(err)
      }
    }
  }
}
