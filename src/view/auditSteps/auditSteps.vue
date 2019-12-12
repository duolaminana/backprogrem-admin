<template>
  <div class="auditSteps">
    <Steps :current="steps" class="steps">
      <Step title="已提交" content="已提交请耐心等待审核"></Step>
      <Step title="待审核" content="待审核请耐心等待结果"></Step>
      <Step title="审核中" content="审核中请耐心等待结果"></Step>
      <Step title="审核未通过" content="详情请联系环阳通总部"></Step>
      <Step title="审核通过" content="您可以直接登录"></Step>
    </Steps>
    <div class="circle">
      <i-circle
        :percent="percent"
        :size="240"
        :trail-width="8"
        :stroke-width="10"
        stroke-linecap="square"
        stroke-color="#43a3fb"
      >
        <span v-if="steps!=3" class="demo-Circle-inner" style="font-size:16px">
          请耐心等待或返回
          <a href="javascript:;" @click="login">登录页</a>
        </span>
        <span v-if="steps==3" class="demo-Circle-inner" style="font-size:16px">
          请联系环阳通总部
          <div style="margin-top:5px">
            或返回
            <a href="javascript:;" @click="login">登录页</a>
          </div>
        </span>
      </i-circle>
    </div>
  </div>
</template>

<script>
export default {
  name: "auditSteps",
  data() {
    return {
      steps: 1,
      percent: null
    };
  },
  methods: {
    login() {
      this.$router.push("login");
    }
  },
  mounted() {
    this.steps = parseInt(this.$route.query.auditStatus);
    this.steps == 1
      ? (this.percent = 25)
      : this.steps == 2
      ? (this.percent = 50)
      : this.steps == 3
      ? (this.percent = 75)
      : (this.percent = 100);
  }
};
</script>

<style lang='less' scoped>
.auditSteps {
  width: 100%;
  height: 100%;
  position: relative;
  .steps {
    position: absolute;
    top: 30%;
    left: 4%;
  }
  .circle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-60%, -30%);
  }
}
</style>