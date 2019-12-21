import axios from 'axios'
import store from '@/store'
import { Message } from 'iview'
const addErrorLog = errorInfo => {
  const {
    statusText,
    status,
    request: { responseURL }
  } = errorInfo
  let info = {
    type: 'ajax',
    code: status,
    mes: statusText,
    url: responseURL
  }
  if (!responseURL.includes('save_error_logger')) {
    store.dispatch('addErrorLog', info)
  }
}

class HttpRequest {
  // ES6默认参数
  constructor (baseUrl) {
    this.baseUrl = baseUrl
    this.queue = {} // 将请求都放到队列中
  }
  
  // 添加token到请求头
  getInsideConfig () {
    const config = {
      baseURL: this.baseUrl,
      headers: {
        //
        Authorization: store.state.user.token
      }
    }
    return config
  }
  destroy (url) {
    delete this.queue[url]
    if (!Object.keys(this.queue).length) {
      // Spin.hide()
    }
  }
  interceptors (instance, url) {
    // 请求拦截
    instance.interceptors.request.use(
      config => {
        // 添加全局的loading...
        // if (!Object.keys(this.queue).length) {
        //   // Spin.show() // 不建议开启，因为界面不友好
        // }
        // this.queue[url] = true
        return config
      },

      error => {
        return Promise.reject(error)
      }
    )
    // 响应拦截
    instance.interceptors.response.use(
      res => {
        if(res.status==200){
          const data = res.data
          // 根据返回的code值来做不同的处理(和后端约定)
          switch (data.code) {
            case 400:
              // 无效请求
              if (data.message) {
                Message.error(data.message)
              } else {
                Message.error('无效请求')
              }
              break
            case 401:
              // 未登录
              if (data.message) {
                Message.error(data.message)
              } else {
                Message.error('未登录')
              }
              break
            case 403:
              // 没有权限
              if (data.message) {
                Message.error(data.message)
              } else {
                Message.error('未知错误')
              }
              break
            case 500:
              // 内部异常
              if (data.message) {
                Message.error(data.message)
              } else {
                Message.error('内部异常')
              }
              break
          }
        }
        return res
      },
      error => {
        // this.destroy(url)
        // let errorInfo = error.response
        // if (!errorInfo) {
        //   const {
        //     request: { statusText, status },
        //     config
        //   } = JSON.parse(JSON.stringify(error))
        //   errorInfo = {
        //     statusText,
        //     status,
        //     request: { responseURL: config.url }
        //   }
        // }
        // addErrorLog(errorInfo)
        if (error.response) {
            const {status} = error.response;
            switch(status){
              case 400:
                Message.error('（错误请求）服务器不理解请求的语法');
                break;
              case 401:
                Message.error('未登录系统');
                break;
              case 403:
                Message.error('服务器拒绝请求');
                break;
              case 404:
                Message.error('服务器找不到请求');
                break;
              case 500:
                Message.error('服务器遇到错误，无法完成请求');
                break;
            }
        } else if (error.request) {
            if(error.request.readyState == 4 && error.request.status == 0){
                //我在这里重新请求
                axios(error.config)
            }
        }else{
          console.log('失败')
          console.log(error)
        }
        return Promise.reject(error)
      }
    )
  }

  request (options) {
    const instance = axios.create()
    options = Object.assign(this.getInsideConfig(), options)
    this.interceptors(instance, options.url)
    axios.defaults.timeout = 12000
    return instance(options)
  }
}
export default HttpRequest
