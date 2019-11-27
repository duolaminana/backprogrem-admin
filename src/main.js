// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import iView from 'iview'
import i18n from '@/locale'
import config from '@/config'
import importDirective from '@/directive'
import { directive as clickOutside } from 'v-click-outside-x'
import installPlugin from '@/plugin'
import './index.less'
import '@/assets/icons/iconfont.css'
// import TreeTable from 'tree-table-vue'
// import VOrgTree from 'v-org-tree'
// import 'v-org-tree/dist/v-org-tree.css'
import '@babel/polyfill'
// import has from '@/libs/permissions-btn'//按钮权限引入
import { hasPermission } from '@/libs/permissions-btn' // 按钮权限引入
// 实际打包时应该不引入mock
/* eslint-disable */
if (process.env.NODE_ENV === 'dev') require('@/mock')

Vue.prototype.hasPerm = hasPermission//注册为全局常量
Vue.prototype.initialization = function(ary){
  return new Promise((resolve,reject)=>{
    console.log(typeof ary)
    if(typeof ary === 'string'){
      this.$refs[ary].resetFields();
    }else if(typeof ary === 'object'){
      ary.map(v=>{
        this.$refs[v].resetFields();
      })
    }
    setTimeout(()=>{
      resolve();
    },200)
  })
},//注册为全局常量
Vue.use(iView, {
  i18n: (key, value) => i18n.t(key, value)
})
// Vue.use(TreeTable)
// Vue.use(VOrgTree)
import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'
Vue.use(Viewer);
Viewer.setDefaults({
  Options: { "inline": true, "button": true, "navbar": true, "title": true, "toolbar": true, "tooltip": true, "movable": true, "zoomable": true, "rotatable": true, "scalable": true, "transition": true, "fullscreen": true, "keyboard": true, "url": "data-source" }
});
/**
 * @description 注册admin内置插件
 */
installPlugin(Vue)
/**
 * @description 生产环境关掉提示
 */
Vue.config.productionTip = false
/**
 * @description 全局注册应用配置
 */
Vue.prototype.$config = config
/**
 * 注册指令
 */
importDirective(Vue)
Vue.directive('clickOutside', clickOutside)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  i18n,
  store,
  render: h => h(App)
})
