<template>
  <div class="date-range">
    <DatePicker
      class="startvalue"
      type="datetime"
      :options="startOptions"
      placeholder="开始时间"
      v-model="startvalue"
      :disabled="isdisabled"
    ></DatePicker>
    <span>&nbsp&nbsp至&nbsp&nbsp</span>
    <DatePicker
      class="endvalue"
      type="datetime"
      :options="endOptions"
      placeholder="结束时间"
      v-model="endvalue"
      :disabled="isdisabled"
    ></DatePicker>
  </div>
</template>

<script>
import format from "@/plugin/format.js"; //格式化时间YYYY-MM-DD hh:mm:ss文件
export default {
  name: "timeRange", //组件的名称
  props: {
    isdisabled: {
      default: false
    }
  },
  data() {
    return {
      startLimit: "", //初始化，开始时间的限制，不能选择结束时间之后的时间
      endLimit: "", //初始化，结束时间的限制，不能选择开始时间之前的时间
      startvalue: "", //初始化，v-model='startvalue '
      endvalue: "" //初始化，v-model='endvalue'
    };
  },
  computed: {
    //注意，在下面的比较中，必须将时间格式转换为YYYY-MM-DD hh:mm:ss
    startOptions: function() {
      //开始时间的限制，不能选择结束时间之后的时间
      let limitTime = this.endLimit; //获取结束时间
      return {
        disabledDate(time) {
          if (limitTime) {
            return time > new Date(limitTime)||time< Date.now();
          } else {
            return time < Date.now();
          }
        }
      };
    },
    endOptions: function() {
      //结束时间的限制，不能选择开始时间之前的时间
      let limitTime = this.startLimit; //获取开始时间
      return {
        disabledDate(time) {
          if (limitTime) {
            return time < new Date(limitTime);
          } else {
            return time < Date.now();
          }
        }
      };
    }
  },
  watch: {
    startvalue(v) {
      this.startLimit = format(v, "YYYY-MM-DD hh:mm:ss"); //将v赋值给 this.startLimit，并且格式化，因为原始的组件的格式为Mon Dec 24 2018 00:00:00 GMT+0800 (中国标准时间)，无法对其进行比较。格式化后为2018-12-24 00:00:00
      this.$emit("on-from-date-range", {
        //父子间引入子组件时，子组件触发的函数
        key: "startDate",
        value: v
      });
    },
    endvalue(v) {
      this.endLimit = format(v, "YYYY-MM-DD hh:mm:ss");
      this.$emit("on-from-date-range", {
        key: "endDate",
        value: v
      });
    }
  },
  methods: {
    resetData(startvalue = "", endvalue = "") {
      //重置按钮，清空选择的时间
      this.startvalue = startvalue;
      this.endvalue = endvalue;
    }
  }
};
</script>

<style lang="less" scoped>
.startvalue {
  width: 160px;
  /deep/.ivu-input-wrapper {
    width: 100%;
  }
}
.endvalue {
  width: 160px;
  /deep/.ivu-input-wrapper {
    width: 100%;
  }
}
</style>