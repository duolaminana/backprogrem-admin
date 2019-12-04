<template>
  <Modal
    v-model="modal"
    width="800"
    class="relationComponent"
    :mask-closable="false"
    :closable="false"
  >
    <div slot="header">
      <p>{{title}}</p>
      <Icon type="md-close" size="20" color="#515a6e" class="icon" @click="cancel" />
    </div>
    <div class="titleBox">
      <span>{{name}}</span>
      <template v-if="showTime">
        生效时间：
        <DatePicker
          v-model="runDate"
          type="datetime"
          format="yyyy-MM-dd HH:mm"
          placeholder="时间选择"
          style="width: 200px"
        ></DatePicker>
      </template>
    </div>
    <Divider />
    <Transfer
      filterable
      :titles="titles"
      :data="data"
      :target-keys="targetKeys"
      :list-style="{width:'350px',height:'450px'}"
      :render-format="render"
      @on-change="handleChange"
    ></Transfer>
    <div slot="footer">
      <Button v-if="activitystatus==2" size="large" @click="cancel">关闭</Button>
      <Button v-if="activitystatus!=2" size="large" @click="cancel">取消</Button>
      <Button v-if="activitystatus!=2" type="primary" size="large" @click="sure">确定</Button>
    </div>
  </Modal>
</template>

<script>
export default {
  name: "relationComponent",
  props: {
    showTime: {
      default: false
    },
    modal: {
      type: Boolean,
      default: false,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    name: {
      type: String
    },
    datas: {
      type: Array,
      default: () => {
        return [];
      }
    },
    keys: {
      type: Array,
      default: () => {
        return [];
      }
    },
    render: {
      type: Function
    },
    activitystatus: {
      type: Number
    }
  },
  data() {
    return {
      runDate: null,
      data: this.datas,
      targetKeys: this.keys,
      titles: ["未关联设备", "已关联设备"]
    };
  },
  watch: {
    keys(value) {
      this.targetKeys = value;
    },
    datas(value) {
      this.data = value;
    }
  },
  methods: {
    sure() {
      this.$emit("sure", this.targetKeys, this.runDate);
    },
    cancel() {
      this.$emit("cancel");
    },
    // render(item){
    //   console.log(item)
    //   return item.machineCode + ' - ' + item.label;
    // },
    handleChange(newTargetKeys) {
      this.targetKeys = newTargetKeys;
    }
  }
};
</script>

<style lang="less" scoped>
.relationComponent {
  // /deep/.ivu-modal-body{
  //   // min-height: 200px;
  // }
  .icon {
    position: absolute;
    right: 16px;
    top: 18px;
    cursor: pointer;
  }
  .titleBox {
    overflow: hidden;
    text-align: right;
    > span {
      float: left;
      margin-top: 6px;
    }
  }
  .ivu-transfer {
    margin: 20px auto;
    /deep/ .ivu-input-wrapper{
      width: 332px;
    }
  }
}
</style>