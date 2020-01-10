<template>
  <div class="account">
    <Modal v-model="isShowAccount" :mask-closable="false" width="450" :closable="false">
      <div slot="header">
        <p>收款人详情</p>
        <Icon type="md-close" size="20" color="#515a6e" class="icon" @click="cancel" />
      </div>
      <Form ref="formValidate" :model="formValidate" :label-width="120">
        <FormItem label="收款方：" prop="beneficiary">
          <Input v-model="formValidate.beneficiary" placeholder="收款方" disabled></Input>
        </FormItem>
        <FormItem label="收款人：" prop="payee">
          <Input v-model="formValidate.payee" placeholder="收款人" disabled></Input>
        </FormItem>
        <FormItem label="收款账户：" prop="account">
          <Input v-model="formValidate.account" placeholder="收款账户" disabled></Input>
        </FormItem>
        <FormItem label="开户行：" prop="openingBank">
          <Input v-model="formValidate.openingBank" placeholder="开户行" disabled></Input>
        </FormItem>
        <FormItem label="备注：" prop="remark">
          <Input v-model="formValidate.remark" placeholder="备注" disabled></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" size="large" @click="cancel">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import {} from "@/api/http";
export default {
  name: "account",
  props: {
    isShowAccount: {
      //收钱码模态框显示方式
      default: false
    },
    formValidate: {
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {};
  },
  methods: {
    cancel(){
      this.$emit('cancel')
    },
  },
  mounted() {}
};
</script>

<style lang="less" scoped>
.ivu-input-wrapper {
  width: 220px;
  margin-right: 5px;
}
.ivu-btn {
  margin-right: 10px;
}
.ivu-table-wrapper {
  margin-top: 20px;
}
.ivu-table-cell {
  padding-left: 0px;
  padding-right: 0px;
}
.ivu-page {
  text-align: center;
  margin-top: 10px;
}
.icon {
  position: absolute;
  right: 16px;
  top: 15px;
  cursor: pointer;
}
</style>