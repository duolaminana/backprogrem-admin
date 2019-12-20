<template>
  <div id="loginMessage">
    <Form ref="loginMessage" :model="form" :rules="rules" @keydown.enter.native="handleSubmit">
      <FormItem prop="phone" style="margin-top:20px">
        <Input :maxlength="11" v-model="form.phone" placeholder="请输入手机号码">
          <Icon :size="16" type="ios-call" slot="prefix" />
        </Input>
      </FormItem>
      <div class="sms">
        <div class="smsCode">
          <FormItem prop="smsCode">
            <Input v-model="form.smsCode" placeholder="请输入短信验证码">
              <Icon :size="14" type="md-lock" slot="prefix" />
            </Input>
          </FormItem>
        </div>
        <div class="messageCodeBotton">
          <FormItem>
            <Button
              class="button"
              type="primary"
              :disabled="!canClick"
              @click="countDown"
            >{{content}}</Button>
          </FormItem>
        </div>
      </div>
      <FormItem style="margin-top:40px">
        <Button @click="handleSubmit('loginMessage')" type="primary" long>登录</Button>
      </FormItem>
    </Form>
  </div>
</template>
<script>
import { getsmsCode } from "@/api/user";
export default {
  name: "LoginMessage",
  props: {
    phoneRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: "手机号码不能为空", trigger: "blur" }
        ];
      }
    },
    smsCodeRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: "短信验证码不能为空", trigger: "blur" }
        ];
      }
    }
  },
  data() {
    return {
      form: {
        phone: "",
        smsCode: ""
      },
      content: "发送验证码", // 按钮里显示的内容
      totalTime: 60, // 记录具体倒计时时间
      canClick: true // 添加canClick
    };
  },
  computed: {
    rules() {
      return {
        phone: this.phoneRules,
        smsCode: this.smsCodeRules
      };
    }
  },
  methods: {
    handleSubmit() {
      this.$refs.loginMessage.validate(valid => {
        if (valid) {
          this.$emit("on-message-valid", {
            phone: this.form.phone,
            smsCode: this.form.smsCode
          });
        }
      });
    },

    countDown() {
      getsmsCode(this.form.phone).then(res => {
        console.log(res);
      });
      if (!this.canClick) return;
      this.canClick = false;
      this.content = this.totalTime + "s后重新发送";
      let clock = window.setInterval(() => {
        this.totalTime--;
        this.content = this.totalTime + "s后重新发送";
        if (this.totalTime < 0) {
          window.clearInterval(clock);
          this.content = "重新发送验证码";
          this.totalTime = 60;
          this.canClick = true; // 这里重新开启
        }
      }, 1000);
    }
  }
};
</script>
<style lang="less" scoped>
// .disabled {
//   background-color: #57a3f3;
//   border-color: #ddd;
//   color: #57a3f3;
//   cursor: not-allowed; // 鼠标变化
// }
.sms {
  text-align: right;
  .smsCode {
    float: left;
    width: 195px;
    margin-top: 20px;
    .ivu-input-wrapper {
      width: 100% !important;
    }
  }
  .messageCodeBotton {
    display: inline-block;
    width: 116px;
    margin-top: 20px;
  }
}
</style>
