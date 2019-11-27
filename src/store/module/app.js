import {
  getBreadCrumbList,
  setTagNavListInLocalstorage,
  getMenuByRouter,
  getTagNavListFromLocalstorage,
  getHomeRoute,
  getNextRoute,
  routeHasExist,
  routeEqual,
  getRouteTitleHandled,
  localSave,
  localRead,
} from '@/libs/util'
import { saveErrorLogger } from '@/api/data'
import router from '@/router'
import routers from '@/router/routers'
import config from '@/config'
const { homeName } = config

const closePage = (state, route) => {
  const nextRoute = getNextRoute(state.tagNavList, route)
  state.tagNavList = state.tagNavList.filter(item => {
    return !routeEqual(item, route)
  })
  console.log(nextRoute)
  router.push(nextRoute)
}

export default {
  state: {
    breadCrumbList: [], // 当前页面路由的信息
    tagNavList: [], // 页面导航条
    homeRoute: {},
    local: localRead('local'),
    errorList: [], // 错误日志 在config/index.js中设置 可以删除掉
    hasReadErrorPage: false,
    routersList: [] // list 列表
  },
  getters: {
    // 菜单列表的计算属性？
    // menuList: (state, getters, rootState) =>
    //   getMenuByRouter(routers, rootState.user.access),
    menuList: (state, getters, rootState) => [
      ...getMenuByRouter(state.routersList),
      ...getMenuByRouter(routers)
    ],
    // 错误日志 在config/index.js中设置 可以删除掉
    errorCount: state => state.errorList.length
  },
  mutations: {
    // 动态添加路由
    setRoutersList (state, routersList) {
      state.routersList = routersList
    },
    // 设置面包屑
    setBreadCrumb (state, route) {
      state.breadCrumbList = getBreadCrumbList(route, state.homeRoute)
    },
    // 设置首页路由
    setHomeRoute (state, routes) {
      state.homeRoute = getHomeRoute(routes, homeName)
    },
    // 设置导航栏列表
    setTagNavList (state, list) {
      let tagList = []
      if (list) {
        tagList = [...list]
      } else tagList = getTagNavListFromLocalstorage() || []
      if (tagList[0] && tagList[0].name !== homeName) tagList.shift()
      let homeTagIndex = tagList.findIndex(item => item.name === homeName)
      if (homeTagIndex > 0) {
        let homeTag = tagList.splice(homeTagIndex, 1)[0]
        tagList.unshift(homeTag)
      }
      state.tagNavList = tagList
      setTagNavListInLocalstorage([...tagList])
    },
    // 导航标签事件 关闭当前页
    closeTag (state, route) {
      let tag = state.tagNavList.filter(item => routeEqual(item, route))
      route = tag[0] ? tag[0] : null
      if (!route) return
      closePage(state, route)
    },
    // 导航栏里添加标签
    addTag (state, { route, type = 'unshift' }) {
      let router = getRouteTitleHandled(route)
      if (!routeHasExist(state.tagNavList, router)) {
        if (type === 'push') state.tagNavList.push(router)
        else {
          if (router.name === homeName) state.tagNavList.unshift(router)
          else state.tagNavList.splice(1, 0, router)
        }
        setTagNavListInLocalstorage([...state.tagNavList])
      }
    },
    // 设置本地localStorage
    setLocal (state, lang) {
      localSave('local', lang)
      state.local = lang
    },

    addError (state, error) {
      state.errorList.push(error)
    },
    // 设置错误日志
    setHasReadErrorLoggerStatus (state, status = true) {
      state.hasReadErrorPage = status
    }
  },
  actions: {
    addErrorLog ({ commit, rootState }, info) {
      if (!window.location.href.includes('error_logger_page')) {
        commit('setHasReadErrorLoggerStatus', false)
      }
      const {
        user: { token, userId, userName }
      } = rootState
      let data = {
        ...info,
        time: Date.parse(new Date()),
        token,
        userId,
        userName
      }

      // saveErrorLogger(info).then(() => {
      //   commit('addError', data)
      // })
    },

    // 动态生成路由
    setAsyncRouter ({ commit }, router) {
      commit('setRoutersList', router)
    }
  }
}
