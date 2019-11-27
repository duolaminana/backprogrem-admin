import {
  login,
  phoneLogin,
  logout,
  getUserInfo,
  getMessage,
  getContentByMsgId,
  hasRead,
  removeReaded,
  restoreTrash,
  getUnreadCount,
} from '@/api/user'
import { setToken, getToken } from '@/libs/util'
import { netWorkHttp } from "@/api/data";
export default {
  state: {
    merchant:{}, //商户信息
    userVo: {}, // 登陆用户信息
    channelId: '', // 渠道id
    channelName: '', // 渠道名
    deptId: '', // 部门id
    deptName: '', // 部门名
    userName: '', // 用户名
    userId: '', // 用户id
    avatorImgPath: '',
    token: getToken(),
    access: [], // 按钮权限列表
    hasGetInfo: false,
    unreadCount: 0,
    messageUnreadList: [],
    messageReadedList: [],
    messageTrashList: [],
    messageContentStore: {}
  },
  mutations: {
    setMerchant(state, merchant) {
      // 用户名
      state.merchant = merchant;
    },
    setAvator(state, avatorPath) {
      state.avatorImgPath = avatorPath
    },
    setUesrVo(state, userVo) {
      // 用户名
      state.userVo = userVo
    },
    setChannelId(state, channelId) {
      // 渠道id
      state.channelId = channelId
    },
    setChannelName(state, channelName) {
      // 渠道名
      state.channelName = channelName
    },
    setDeptId(state, deptId) {
      // 部门id
      state.deptId = deptId
    },
    setDeptName(state, deptName) {
      // 部门名称
      state.deptName = deptName
    },
    setUserId(state, id) {
      // 用户id
      state.userId = id
    },
    setUserName(state, name) {
      // 用户名
      state.userName = name
    },
    setAccess(state, access) {
      // 按钮权限
      state.access = access
    },
    setToken(state, token) {
      // token
      state.token = token
      setToken(token)
    },
    setHasGetInfo(state, status) {
      state.hasGetInfo = status
    },
    setMessageCount(state, count) {
      state.unreadCount = count
    },
    setMessageUnreadList(state, list) {
      state.messageUnreadList = list
    },
    setMessageReadedList(state, list) {
      state.messageReadedList = list
    },
    setMessageTrashList(state, list) {
      state.messageTrashList = list
    },
    updateMessageContentStore(state, { msg_id, content }) {
      state.messageContentStore[msg_id] = content
    },
    moveMsg(state, { from, to, msg_id }) {
      const index = state[from].findIndex(_ => _.msg_id === msg_id)
      const msgItem = state[from].splice(index, 1)[0]
      msgItem.loading = false
      state[to].unshift(msgItem)
    }
  },
  getters: {
    messageUnreadCount: state => state.messageUnreadList.length,
    messageReadedCount: state => state.messageReadedList.length,
    messageTrashCount: state => state.messageTrashList.length
  },
  actions: {
    putMerchant({commit},merchant){
        commit('setMerchant',merchant)
    },
    // 密码登录
    handleLogin({state, commit }, { userName, password }) {
      userName = userName.trim()
      password = password.trim()
      return new Promise((resolve, reject) => {
        login({
          userName,
          password
        })
          .then(res => {
            console.log(res)
            // 保存token
            commit('setToken', res.data.result.token)
            // 保存按钮权限
            commit('setAccess', res.data.result.permissionList)
            // 获取用户信息
            const userVo = res.data.result.userVo
            commit('setAvator', userVo.imageAddress)
            commit('setUserName', userVo.userName)
            commit('setUserId', userVo.id)
            commit('setChannelId', userVo.channelId)
            commit('setChannelName', userVo.channelName)
            commit('setDeptId', userVo.deptId)
            commit('setDeptName', userVo.deptName)
            commit('setUesrVo', userVo)
            commit('setHasGetInfo', true)
            resolve(res)
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    // 手机验证码登录
    handlePhoneLogin({ commit }, { phone, smsCode }) {
      phone = phone.trim()
      smsCode = smsCode.trim()
      return new Promise((resolve, reject) => {
        phoneLogin({
          phone,
          smsCode
        })
          .then(res => {
            // 保存token
            commit('setToken', res.data.result.token)
            // 保存按钮权限
            commit('setAccess', res.data.result.permissionList)
            // 获取用户信息
            const userVo = res.data.result.userVo
            commit('setAvator', userVo.imageAddress)
            commit('setUserName', userVo.userName)
            commit('setUserId', userVo.id)
            commit('setChannelId', userVo.channelId)
            commit('setChannelName', userVo.channelName)
            commit('setDeptId', userVo.deptId)
            commit('setDeptName', userVo.deptName)
            commit('setUesrVo', userVo)
            commit('setHasGetInfo', true)
            resolve(res)
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    // 退出登录
    handleLogOut({ state, commit }) {
      return new Promise((resolve, reject) => {
        logout(state.token)
          .then(() => {
            commit('setToken', '')
            commit('setAccess', [])
            resolve()
          })
          .catch(err => {
            reject(err)
          })
        // 如果你的退出登录无需请求接口，则可以直接使用下面三行代码而无需使用logout调用接口
        // commit('setToken', '')
        // commit('setAccess', [])
        // resolve()
      })
    },
    // 获取用户相关信息
    getUserInfo({ state, commit }) {
      return new Promise((resolve, reject) => {
        try {
          getUserInfo(state.token)
            .then(res => {
              // 保存token
              commit('setToken', res.data.result.token)
              // 保存按钮权限
              commit('setAccess', res.data.result.permissionList)
              // 获取用户信息
              const userVo = res.data.result.userVo
              commit('setAvator', userVo.imageAddress)
              commit('setUserName', userVo.userName)
              commit('setUserId', userVo.id)
              commit('setChannelId', userVo.channelId)
              commit('setChannelName', userVo.channelName)
              commit('setDeptId', userVo.deptId)
              commit('setDeptName', userVo.deptName)
              commit('setUesrVo', userVo)
              commit('setHasGetInfo', true)
              resolve(res.data.result)
            })
            .catch(err => {
              reject(err)
            })
        } catch (error) {
          reject(error)
        }
      })
    },
    // 此方法用来获取未读消息条数，接口只返回数值，不返回消息列表
    getUnreadMessageCount({ state, commit }) {
      getUnreadCount().then(res => {
        const { data } = res
        commit('setMessageCount', data)
      })
    },
    // 获取消息列表，其中包含未读、已读、回收站三个列表
    getMessageList({ state, commit }) {
      return new Promise((resolve, reject) => {
        getMessage()
          .then(res => {
            const { unread, readed, trash } = res.data
            commit(
              'setMessageUnreadList',
              unread.sort(
                (a, b) => new Date(b.create_time) - new Date(a.create_time)
              )
            )
            commit(
              'setMessageReadedList',
              readed
                .map(_ => {
                  _.loading = false
                  return _
                })
                .sort(
                  (a, b) => new Date(b.create_time) - new Date(a.create_time)
                )
            )
            commit(
              'setMessageTrashList',
              trash
                .map(_ => {
                  _.loading = false
                  return _
                })
                .sort(
                  (a, b) => new Date(b.create_time) - new Date(a.create_time)
                )
            )
            resolve()
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    // 根据当前点击的消息的id获取内容
    getContentByMsgId({ state, commit }, { msg_id }) {
      return new Promise((resolve, reject) => {
        let contentItem = state.messageContentStore[msg_id]
        if (contentItem) {
          resolve(contentItem)
        } else {
          getContentByMsgId(msg_id).then(res => {
            const content = res.data
            commit('updateMessageContentStore', { msg_id, content })
            resolve(content)
          })
        }
      })
    },
    // 把一个未读消息标记为已读
    hasRead({ state, commit }, { msg_id }) {
      return new Promise((resolve, reject) => {
        hasRead(msg_id)
          .then(() => {
            commit('moveMsg', {
              from: 'messageUnreadList',
              to: 'messageReadedList',
              msg_id
            })
            commit('setMessageCount', state.unreadCount - 1)
            resolve()
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    // 删除一个已读消息到回收站
    removeReaded({ commit }, { msg_id }) {
      return new Promise((resolve, reject) => {
        removeReaded(msg_id)
          .then(() => {
            commit('moveMsg', {
              from: 'messageReadedList',
              to: 'messageTrashList',
              msg_id
            })
            resolve()
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    // 还原一个已删除消息到已读消息
    restoreTrash({ commit }, { msg_id }) {
      return new Promise((resolve, reject) => {
        restoreTrash(msg_id)
          .then(() => {
            commit('moveMsg', {
              from: 'messageTrashList',
              to: 'messageReadedList',
              msg_id
            })
            resolve()
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getlogo({ state, commit },id){
      console.log(id,state.channelId)
      let url = `/channelApply/queryChannelApplyById?channelId=${id?id:state.channelId}`;
      netWorkHttp(url,null,'get').then(res=>{
        let {
          logoAddress,
          badgeAddress,
          id,
          receiveTerminal,
          parentIds
        } = res.result
        commit('setMerchant', {
          logoAddress,
          badgeAddress,
          id,
          receiveTerminal,
          parentIds
        })
      })
    }
  }
}
