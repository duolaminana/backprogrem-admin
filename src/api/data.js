import axios from '@/libs/api.request'
import config from '@/config'
import store from '@/store'
// 上传文件地址
// 图片上传
export const Upload =
  'https://vendor-platform-test.sun-hyt.com/system/file/uploadFile'
  // 表格上传
  export const UploadExcel =
  'https://vendor-platform-test.sun-hyt.com/position/machineInfo/uploadExcel'
  // export const UploadExcel =
  // 'http://192.168.10.108:10003/position/machineInfo/uploadExcel'

// 创建基地址
const baseUrl =
  process.env.NODE_ENV === 'dev'
    ? config.baseUrl.dev
    : process.env.NODE_ENV === 'test'
    ? config.baseUrl.test
    : config.baseUrl.master
// 订单模块
export const netWorkOrder = (URL, info, method = 'post') => {
  return new Promise((resolve, reject) => {
    axios.request({
        url: '/order' + URL,
        data: info,
        method
      }).then(res => {
        if (res.data.code === 200) {
          resolve(res.data)
        }else{
          reject()
        }
      }).catch(err=>{
        reject(err)
      })
  })
}
// 系统模块
export const netWorkHttp = (URL, info, method = 'post') => {
  return new Promise((resolve, reject) => {
    axios.request({
        url: '/system' + URL,
        data: info,
        method
      }).then(res => {
        if (res.data.code === 200) {
          resolve(res.data)
        }else{
          reject()
        }
      }).catch(err=>{
        reject(err)
      })
  })
}
// 商品模块
export const netWorkGoods = (URL, info, method = 'post') => {
  return new Promise((resolve, reject) => {
    axios
      .request({
        // url: baseUrl + '/product' + URL,
        url:'/product' + URL,
        data: info,
        method
      }).then(res => {
        if (res.data.code === 200) {
          resolve(res.data)
        }else{
          reject()
        }
      }).catch(err=>{
        reject(err)
      })
  })
}
// 设备模块
export const netWorkDevice = (URL, info, method = 'post') => {
  return new Promise((resolve, reject) => {
    axios.request({
        // url: 'http://192.168.1.49:10003/position' + URL,
        url:'/position' + URL,
        data: info,
        method
      }).then(res => {
        if (res.data.code === 200) {
          resolve(res.data)
        } else{
          reject(res.data.message)
        }
      }).catch(err=>{
        reject(err)
      })
  })
}

export const getTableData = () => {
  return axios.request({
    url: 'get_table_data',
    method: 'get'
  })
}

export const getDragList = () => {
  return axios.request({
    url: 'get_drag_list',
    method: 'get'
  })
}

export const errorReq = () => {
  return axios.request({
    url: 'error_url',
    method: 'post'
  })
}

export const saveErrorLogger = info => {
  return axios.request({
    url: 'save_error_logger',
    data: info,
    method: 'post'
  })
}

export const uploadImg = formData => {
  return axios.request({
    url: 'image/upload',
    data: formData
  })
}

export const getOrgData = () => {
  return axios.request({
    url: 'get_org_data',
    method: 'get'
  })
}

export const getTreeSelectData = () => {
  return axios.request({
    url: 'get_tree_select_data',
    method: 'get'
  })
}
