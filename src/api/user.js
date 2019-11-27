import axios from '@/libs/api.request'
import qs from 'qs'
// 密码登陆
export const login = ({ userName, password }) => {
  const data = {
    username: userName,
    password: password
  }
  return axios.request({
    url: 'auth/loginUser/login',
    data: qs.stringify(data),
    method: 'post'
  })
}

// 手机验证码登陆
export const phoneLogin = ({ phone, smsCode }) => {
  const data = {
    phone: phone,
    smsCode: smsCode
  }
  return axios.request({
    url: 'auth/loginUser/phoneLogin',
    data: qs.stringify(data),
    method: 'post'
  })
}

// 根据手机号码获取验证码
export const getsmsCode = phone => {
  return axios.request({
    url: 'auth/loginUser/smsCode',
    params: {
      phone
    },
    method: 'post'
  })
}

// 获取用户信息
export const getUserInfo = token => {
  return axios.request({
    url: 'auth/loginUser/userInfo',
    params: {
      token
    },
    method: 'post'
  })
}

export const logout = token => {
  return axios.request({
    url: 'auth/loginUser/logout',
    params: {
      token
    },
    method: 'get'
  })
}

export const getUnreadCount = () => {
  // return axios.request({
  //   url: 'message/count',
  //   method: 'get'
  // })
}

export const getMessage = () => {
  return axios.request({
    url: 'message/init',
    method: 'get'
  })
}

export const getContentByMsgId = msg_id => {
  return axios.request({
    url: 'message/content',
    method: 'get',
    params: {
      msg_id
    }
  })
}

export const hasRead = msg_id => {
  return axios.request({
    url: 'message/has_read',
    method: 'post',
    data: {
      msg_id
    }
  })
}

export const removeReaded = msg_id => {
  return axios.request({
    url: 'message/remove_readed',
    method: 'post',
    data: {
      msg_id
    }
  })
}

export const restoreTrash = msg_id => {
  return axios.request({
    url: 'message/restore',
    method: 'post',
    data: {
      msg_id
    }
  })
}
