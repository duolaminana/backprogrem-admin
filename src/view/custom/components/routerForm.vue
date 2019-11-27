<template>
  <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
    <FormItem label="名称" prop="name">
      <Input v-model.trim="formValidate.name"></Input>
    </FormItem>
    <FormItem label="路径" prop="path">
      <Input v-model.trim="formValidate.path"></Input>
    </FormItem>
    <FormItem label="路由名称" prop="title">
      <Input v-model.trim="formValidate.title"></Input>
    </FormItem>
    <FormItem label="图标" prop="icon">
      <Input v-model.trim="formValidate.icon"></Input>
    </FormItem>
    <FormItem label="前端组件" prop="component">
      <Input v-model.trim="formValidate.component"></Input>
    </FormItem>
    <FormItem label="排序">
      <InputNumber :min='1' v-model="formValidate.sort"></InputNumber>&nbsp&nbsp&nbsp&nbsp数值越大排名越靠前
    </FormItem>
    <FormItem label="重定向">
      <Input v-model.trim="formValidate.redirect" placeholder="不要轻易填写"></Input>
    </FormItem>
    <FormItem label="类型" prop="type" v-if="showRadio">
      <RadioGroup v-model="formValidate.type">
        <Radio label="1">菜单</Radio>
        <Radio label="2">按钮</Radio>
      </RadioGroup>
    </FormItem>
    <FormItem label="功能类型" prop="backend" v-if="showRadio">
      <RadioGroup v-model="formValidate.backend">
        <Radio label="1">后台功能</Radio>
        <Radio label="2">商户功能</Radio>
      </RadioGroup>
    </FormItem>
  </Form>
</template>
<script>
export default {
  name: "fouterFrom",
  props: {
    formValidate: {
      default:()=>{
				return {}
			}
    },
    showRadio: {
      default: true
    }
  },
  data() {
    return {
      ruleValidate: {
        title: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        path: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        name: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        icon: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        component: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ]
      }
    };
  },
  methods: {
  },
  mounted() {}
};
</script>

<style lang="less" scoped>
.ivu-input-wrapper {
  width: 350px;
  margin-right: 5px;
}
</style>
