<template>
  <div class="register">
    <div class="register_bg"></div>
    <!-- logo -->
    <div class="logo">
      <img src="@/assets/images/huanqiuzhineng.png" alt />
    </div>
    <!-- phone -->
    <div class="phone">
      <img src="@/assets/images/phone.png" alt />
      <div class="text">
        <span>服务热线</span>
        <p>0755-23596613</p>
      </div>
    </div>
    <!-- 注册框 -->
    <div class="register-con">
      <Card icon="reg-in" dis-hover>
        <Tabs value="name1" class="reg-tab" @on-click="tabsChange">
          <TabPane label="企业注册" name="name1">
            <div class="form-con">
              <register-enterprise
                ref="registerEnt"
                :uploadResult.sync="uploadResult"
                :openAccountResult.sync="openAccountResult"
                :uploadFrontResult.sync="uploadFrontResult"
                :uploadBackResult.sync="uploadBackResult"
                :otherResult.sync="otherResult"
              ></register-enterprise>
              <div class="login-tip">
                <span>
                  已有账号，请
                  <a href="javascript:;" @click="login">登录</a>
                </span>
              </div>
            </div>
          </TabPane>
          <TabPane label="个人注册" name="name2">
            <div class="form-con">
              <register-person
                ref="registerPer"
                :uploadFrontResult.sync="uploadFrontResult"
                :uploadBackResult.sync="uploadBackResult"
                :otherResult.sync="otherResult"
              ></register-person>
              <div class="login-tip">
                <span>
                  已有账号，请
                  <a href="javascript:;" @click="login">登录</a>
                </span>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  </div>
</template>

<script>
import "./register.less";
import registerPerson from "_c/register-person";
import registerEnterprise from "_c/register-enterprise";
export default {
  name: "register",
  components: {
    registerPerson,
    registerEnterprise
  },
  data() {
    return {
      uploadResult: false, //营业执照显示方式
      openAccountResult: false, //开户许可证显示方式
      uploadFrontResult: false, //身份证正面显示方式
      uploadBackResult: false, //身份证反面显示方式
      otherResult: false //其他显示方式
    };
  },
  methods: {
    login() {
      this.$router.push("login");
    },
    tabsChange() {
      this.$refs.registerEnt.$refs.registerEnt.resetFields();
      this.$refs.registerPer.$refs.registerPer.resetFields();
      (this.uploadResult = false), //营业执照显示方式
        (this.openAccountResult = false), //开户许可证显示方式
        (this.uploadFrontResult = false), //身份证正面显示方式
        (this.uploadBackResult = false), //身份证反面显示方式
        (this.otherResult = false); //其他显示方式
    }
  }
};
</script>
