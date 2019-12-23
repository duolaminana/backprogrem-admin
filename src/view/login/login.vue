<style lang="less">
@import "./login.less";
</style>

<template>
  <div class="login">
    <div class="login_bg">
      <!-- logo -->
      <div class="logo">
        <img src="../../assets/images/huanqiuzhineng.png" alt />
      </div>
      <!-- phone -->
      <div class="phone">
        <img src="../../assets/images/phone.png" alt />
        <div class="text">
          <span>服务热线</span>
          <p>0755-23596613</p>
        </div>
      </div>
    </div>

    <!-- 登陆框 -->
    <div class="login-con">
      <Card icon="log-in">
        <Tabs @on-click="tabsChange">
          <TabPane label="密码登录" name="name1">
            <div class="form-con">
              <login-form
                ref="loginForm"
                @on-success-valid="handleSubmit"
                :autoLogin.sync="autoLogin"
              ></login-form>
              <div class="login-tip">
                <span>
                  若无账号，请先
                  <a href="javascript:;" @click="register">注册</a>
                </span>
              </div>
            </div>
          </TabPane>
          <TabPane label="短信登录" name="name2">
            <div class="form-con">
              <login-message ref="loginMessage" @on-message-valid="handleMessageSubmit"></login-message>
              <div class="login-tip">
                <span>
                  若无账号，请先
                  <a href="javascript:;" @click="register">注册</a>
                </span>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
    <!-- 系统说明 -->
    <div class="systemExplanation">
      <ul>
        <li>
          <p class="img"></p>
          <p>基于云服务器分布式架构</p>
          <span>可靠性高达99.99%</span>
        </li>
        <li>
          <p class="img"></p>
          <p>运营各种自动售卖平台</p>
          <span>激活即可使用</span>
        </li>
        <li>
          <p class="img"></p>
          <p>快速卓越的研发能力</p>
          <span>让你时刻拥有竞争优势</span>
        </li>
        <li>
          <p class="img"></p>
          <p>优质的售后体系</p>
          <span>专属售后监督人员</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import LoginForm from "_c/login-form";
import LoginMessage from "_c/login-message";
import { mapActions, mapMutations } from "vuex";
import { getMenuByRouter, localSave, localRead } from "@/libs/util";
import { netWorkHttp } from "@/api/data";
import { matchingRoute } from "@/router/matching";
import Cookies from "js-cookie";
import { home } from "@/router/routers.js";
import CryptoJS from "crypto-js";
export default {
  name: "login",
  components: {
    LoginForm,
    LoginMessage
  },
  data() {
    return {
      autoLogin: true, //是否记住密码
      channelId: null, //渠道id
      userId: null, //用户id
      userType: null, //用户类型
      auditStatus: "", //审核状态
    };
  },
  methods: {
    ...mapActions([
      "handleLogin",
      "handlePhoneLogin",
      "setAsyncRouter",
      "getlogo"
    ]),
    // 子组件传参的事件
    handleSubmit({ userName, password }) {
      // 调用审核账号的接口
      netWorkHttp(
        `/channelApply/queryChannelApplyByUserNameOrPhone?userName=${userName}&password=${password}`,
        null,
        "get"
      ).then(res => {
        // 渠道商信息保存到本地
        if (
          res.result !== undefined &&
          res.result.auditStatus != 4 &&
          res.result.channelId == null
        ) {
          window.sessionStorage.setItem("info", JSON.stringify(res.result));
          this.auditStatus = res.result.auditStatus;
          //展示审核通知,跳转页面
          this.$router.push({
            path: "auditSteps",
            query: { auditStatus: this.auditStatus }
          });
        } else {
          //账号登录
          this.handleLogin({ userName, password }).then(res => {
            this.setCookie("uesrName", userName, this.autoLogin);
            this.setCookie("password", password, this.autoLogin);
            this.channelId = res.data.result.userVo.channelId;
            this.userId = res.data.result.userVo.id;
            this.userType = res.data.result.userVo.type;
            this.getTreeData();
            this.getlogo(this.channelId);
            this.$router.push({
              name: this.$config.homeName
            });
          });
        }
      });
    },
    // 短信验证登录
    handleMessageSubmit({ phone, smsCode }) {
      this.handlePhoneLogin({ phone, smsCode }).then(res => {
        this.channelId = res.data.result.userVo.channelId;
        this.userId = res.data.result.userVo.id;
        this.userType = res.data.result.userVo.type;
        this.getTreeData();
        this.getlogo(this.channelId);
        this.$router.push({
          name: this.$config.homeName
        });
      });
    },
    setCookie(key, value, is) {
      if (is) {
        var cipherText = CryptoJS.AES.encrypt(
          value + "",
          "secretkey123"
        ).toString();
        Cookies.set(key, cipherText, { expires: 7 });
      } else {
        Cookies.set(key, "", { expires: 7 });
      }
    },
    // 跳转注册
    register() {
      this.$router.push("register");
    },
    // 获取权限树
    getTreeData() {
      let data = {
        channelId: this.channelId,
        permissionType: 1,
        userType: this.userType,
        userId: this.userId
      };
      netWorkHttp("/permission/queryUserMenuOrPermission", data).then(res => {
        let data = res.result;
        const routers = getMenuByRouter(data);
        const originRouteNames = this.$router.options.routes.map(r => r.name);
        // // 需要解决重复加入问题
        if (
          routers &&
          routers.length &&
          originRouteNames.indexOf(routers[0].name) < 0
        ) {
          data = [home, ...data];
          const AsyncRouter = this.filterAsyncRouter(data);
          this.$router.addRoutes(AsyncRouter);
          this.setAsyncRouter(AsyncRouter);
        }
      });
    },
    // 将后台传来的字符串替换为组件
    filterAsyncRouter(asyncRouterMap) {
      const accessedRouters = asyncRouterMap.filter(route => {
        if (route.component) {
          route.component = matchingRoute(route.component); // 匹配路由
        }
        if (route.children && route.children.length) {
          route.children = this.filterAsyncRouter(route.children);
        }
        return true;
      });
      return accessedRouters;
    },
    tabsChange() {
      this.$refs.loginForm.$refs.loginForm.resetFields();
      this.$refs.loginMessage.$refs.loginMessage.resetFields();
      this.$refs.loginMessage.clearTimeID();
    }
  }
};
</script>
