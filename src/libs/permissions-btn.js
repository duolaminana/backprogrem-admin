// import Vue from 'vue'

import store from '@/store'
export function hasPermission (permission) {
  let myBtns = store.state.user.access
  return myBtns.indexOf(permission) > -1
}

// /**权限指令**/
// const has = Vue.directive('has', {
//   bind: function(el, inserted, vnode) {
//     // 获取页面按钮权限
//     let btnPermissionsArr = store.state.user.access
//     if (!Vue.prototype.$_has(btnPermissionsArr)) {
//       el.parentNode.removeChild(el)
//     }
//   }
// })
// // 权限检查方法
// Vue.prototype.$_has = function(value) {
//   let isExist = false
//   // 获取用户按钮权限
//   let btnPermissionsStr = sessionStorage.getItem('btnPermissions')
//   if (btnPermissionsStr == undefined || btnPermissionsStr == null) {
//     return false
//   }
//   if (value.indexOf(btnPermissionsStr) > -1) {
//     isExist = true
//   }
//   return isExist
// }
// export { has }
