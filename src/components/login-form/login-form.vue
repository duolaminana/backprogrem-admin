<template>
  <Form ref="loginForm" :model="form" :rules="rules" @keydown.enter.native="handleSubmit">
    <FormItem prop="userName" style="margin-top:20px">
      <Input v-model="form.userName" placeholder="请输入用户名">
        <Icon :size="16" type="ios-person" slot="prefix" />
      </Input>
    </FormItem>
    <FormItem prop="password" style="margin-top:20px">
      <Input :type="formpswd?'text':'password'" v-model="form.password" placeholder="请输入密码">
        <Icon :size="14" type="md-lock" slot="prefix" />
        <Icon
          @click.native="formpswd=!formpswd"
          :type="formpswd?'md-eye-off':'md-eye'"
          slot="suffix"
        />
      </Input>
    </FormItem>
    <FormItem prop style="margin-top:15px">
      <Checkbox :value="autoLogin" size="large" @on-change="loginChange">记住密码</Checkbox>
    </FormItem>
    <FormItem style="margin-top:10px">
      <Button @click="handleSubmit('loginForm')" type="primary" long>登录</Button>
    </FormItem>
  </Form>
</template>
<script>
import CryptoJS from "crypto-js";
export default {
  name: "LoginForm",
  props: {
    userNameRules: {
      type: Array,
      default: () => {
        return [{ required: true, message: "账号不能为空", trigger: "blur" }];
      }
    },
    passwordRules: {
      type: Array,
      default: () => {
        return [{ required: true, message: "密码不能为空", trigger: "blur" }];
      }
    },
    autoLogin: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      formpswd: false,
      form: {
        userName: "",
        password: ""
      }
    };
  },
  computed: {
    rules() {
      return {
        userName: this.userNameRules,
        password: this.passwordRules
      };
    }
  },
  methods: {
    //预读取cookie中用户信息
    getCookie() {
      //cookie有账号信息
      if (document.cookie.length>0) {
        var arr = document.cookie.split("; "); 
        arr.forEach(item=>{
          let arr2=item.split("=")
          if (arr2[0] == "uesrName") {
            // Decrypt，将解密后的内容赋值给账号
            var bytes = CryptoJS.AES.decrypt(arr2[1], "secretkey123");
            this.form.userName = bytes.toString(CryptoJS.enc.Utf8);
          } else if (arr2[0] == "password") {
            // Decrypt，将解密后的内容赋值给密码
            var bytes = CryptoJS.AES.decrypt(arr2[1], "secretkey123");
            this.form.password = bytes.toString(CryptoJS.enc.Utf8);
          }
        })
      }
    },
    loginChange(value) {
      this.$emit("update:autoLogin", value);
    },
    handleSubmit() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.$emit("on-success-valid", {
            userName: this.form.userName,
            password: this.form.password
          });
        }
      });
    }
  },
  mounted() {
    this.getCookie();
  }
};
</script>
<style lang="less" scoped>
</style>
