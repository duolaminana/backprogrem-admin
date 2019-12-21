import Vue from 'vue'
import Router from 'vue-router'
import routes from './routers'
import store from '@/store'
import iView from 'iview'
// import { setToken, getToken, canTurnTo, setTitle } from '@/libs/util'
import { setToken, getToken, getMenuByRouter, setTitle } from '@/libs/util'
import { matchingRoute } from '@/router/matching'
import config from '@/config'
import { netWorkHttp } from '@/api/data'
const { homeName } = config
import { Message } from 'iview'
import { home } from '@/router/routers.js'
Vue.use(Router)
const router = new Router({
  routes,
  mode: 'history'
})
const LOGIN_PAGE_NAME = 'login'
const REGISTER_PAGE_NAME = 'register'
const REGISTEROVER_PAGE_NAME = 'registerover'
const AUDITSTEPS_PAGE_NAME = 'auditSteps'

// const turnTo = (to, access, next) => {
//   if (canTurnTo(to.name, access, routes)) next()
//   // 有权限，可访问
//   else next({ replace: true, name: 'error_401' }) // 无权限，重定向到401页面
// }

// 动态添加路由
function filterAsyncRouter(asyncRouterMap) {
  const accessedRouters = asyncRouterMap.filter(route => {
    if (route.component) {
      route.component = matchingRoute(route.component) // 匹配路由
    }
    if (route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children)
    }
    return true
  })
  return accessedRouters
}
// 刷新路由
function refreshRoute() {
  // let data = {
  //   channelId: 1,
  //   permissionType: 1,
  //   userType: 2,
  //   userId: 145
  // }
  let data = {
    channelId: store.state.user.userVo.channelId,
    permissionType: 1,
    userType: store.state.user.userVo.type,
    userId: store.state.user.userVo.id
  }
  netWorkHttp('/permission/queryUserMenuOrPermission', data).then(res => {
    if(res.result.length){
      let data = res.result
      const routers = getMenuByRouter(data)
      const originRouteNames = router.options.routes.map(r => r.name)
      // // 需要解决重复加入问题
      if (
        routers &&
        routers.length &&
        originRouteNames.indexOf(routers[0].name) < 0
      ) {
        data = [home, ...data]
        const AsyncRouter = filterAsyncRouter(data)
        router.addRoutes(AsyncRouter)
        store.commit('setRoutersList', AsyncRouter)
        router.addRoutes([{ path: '*', redirect: '/404' }])
      }
    }else{
      router.push({
        name: 'error_500'
      })
    }
  })
}

// 前置导航守卫
router.beforeEach((to, from, next) => {
  iView.LoadingBar.start() // 页面进度显示条
  const token = getToken()
  if (to.name === REGISTER_PAGE_NAME) {
    next()
  } else if (to.name === REGISTEROVER_PAGE_NAME) {
    next()
  } else if (to.name === AUDITSTEPS_PAGE_NAME) {
    next()
  } else if (!token && to.name !== LOGIN_PAGE_NAME) {
    // 未登录且要跳转的页面不是登录页
    next({
      name: LOGIN_PAGE_NAME // 跳转到登录页
    })
  } else if (!token && to.name === LOGIN_PAGE_NAME) {
    // 未登陆且要跳转的页面是登录页
    next() // 跳转
  } else if (token && to.name === LOGIN_PAGE_NAME) {
    // 已登录且要跳转的页面是登录页
    next({
      name: homeName // 跳转到homeName页
    })
  } else {
    if (store.state.user.hasGetInfo) {
      // turnTo(to, store.state.user.access, next)
      next()
    } else {
      store
        .dispatch('getUserInfo')
        .then(user => {
          store.dispatch('getlogo')
          // 拉取用户信息，通过用户权限和跳转的页面的name来判断是否有权限访问;access必须是一个数组，如：['super_admin'] ['super_admin', 'admin']
          // turnTo(to, user.access, next)
          next()
          if (!from.name) {
            // 页面刷新
            refreshRoute()
          }
        })
        .catch(() => {
          setToken('')
          next({
            name: 'login'
          })
          if (!from.name) {
            // 页面刷新
            refreshRoute()
          }
        })
    }
  }
})
router.onError((error) => {
  const pattern = /Loading chunk (\d)+ failed/g;
  const isChunkLoadFailed = error.message.match(pattern);
  // const targetPath = router.history.pending.fullPath;
  // alert('加载模块报错1')
  // alert(isChunkLoadFailed)
  console.log(isChunkLoadFailed)
  if(isChunkLoadFailed){
      location.reload();
      // alert('加载模块报错2')
      // router.replace(targetPath);
  }
  // alert('加载模块报错3');
  location.reload();
})
router.afterEach(to => {
  setTitle(to, router.app)
  iView.LoadingBar.finish()
  window.scrollTo(0, 0)
})

export default router
