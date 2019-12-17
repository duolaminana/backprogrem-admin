<template>
  <div class="registerover">
    <div class="content">
      <div class="imagecomtent">
        <img src="@/assets/images/registerover.png" alt />
        <div>注册完成</div>
      </div>
      <div class="text">待审核，我们会在3个工作日内给您返回审核结果，请留意您的来电信息，感谢您的加入！</div>
      <Button type="primary" style="width:360px;margin-top:120px;margin-left:120px" @click="login">返回登录页</Button>
    </div>
  </div>
</template>

<script>
export default {
  name: "registerover",
  methods: {
    login() {
      this.$router.push("login");
    }
  }
};
</script>

<style lang="less" scoped>
.registerover {
  width: 100%;
  height: 100%;
  position: absolute;
  .content {
    width: 600px;
    height: 380px;
    position: relative;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .imagecomtent{
      width: 100px;
      margin: 10px auto;
      font-size: 20px;
      text-align: center;
    }
    .text{
      width: 400px;
      margin: 0 auto;
      font-size: 14px;
    }
  }
}
</style>