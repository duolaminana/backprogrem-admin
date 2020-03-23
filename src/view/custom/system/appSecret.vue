<template>
  <div>
    <!-- <Coustom-tree></Coustom-tree> -->
    <div>
      <Input style="margin-right:10px" v-model="mchId" placeholder="请输入商户编号" clearable />
      <Input style="margin-right:10px" v-model="mchName" placeholder="请输入商户名称" clearable />
      <Input style="margin-right:10px" v-model="appSecret" placeholder="请输入商户秘钥" clearable />
      <Select
        v-model="enableLabel"
        @on-change="enableChange"
        placeholder="请选择状态类型"
        clearable
        style="margin-right:10px"
      >
        <Option v-for="item in enableList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
      <Button type="primary" @click="searchAppSecret">查询</Button>
      <Button type="primary" @click="addModal" class="xzbtn">新增</Button>
      <Button type="primary" @click="reset">重置</Button>
      <Table highlight-row :columns="columns" :data="dataTable" border>
        <!-- 状态按钮 -->
        <template slot="enable" slot-scope="{ row, index }">
          <span v-show="row.enable=='1'" size="small" class="green">已启用</span>
          <span v-show="row.enable=='0'" size="small" class='gray'>不启用</span>
        </template>
        <template slot-scope="{ row, index }" slot="operation">
          <!-- 编辑按钮 -->
          <Button
            type="primary"
            size="small"
            @click="editModal(row)"
          >编辑</Button>

          <!-- 删除按钮 -->
          <Button
          style="margin-right: 0px"
            type="error"
            size="small"
            @click="modalDel=true;delID=row.id;delIndex=index"
          >删除</Button>
        </template>
      </Table>
      <Page
        :total="total"
        show-elevator
        :current="pageNum"
        @on-change="pageChange"
        :page-size="pageSize"
        @on-page-size-change="sizeChange"
        show-sizer
      />
    </div>
    <delete-component
      :modalDel="modalDel"
      :del_loading="modal_loading"
      @cancel="delCancel"
      @del="del"
    ></delete-component>

    <!-- 弹框的模态框 -->
    <Modal v-model="isShow" :mask-closable="false" :title="isAdd==true?'新增【商户秘钥】':'编辑【商户秘钥】'">
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
        <FormItem label="商户编号" prop="mchId">
          <Input v-model="formValidate.mchId" placeholder="商户号"></Input>
        </FormItem>
        <FormItem label="商户名" prop="mchName">
          <Input v-model="formValidate.mchName" placeholder="商户名"></Input>
        </FormItem>
        <FormItem label="应用ID" prop="appId">
          <Input v-model="formValidate.appId" placeholder="应用ID"></Input>
        </FormItem>
        <FormItem label="备注" prop="remark">
          <Input v-model="formValidate.remark" placeholder="备注"></Input>
        </FormItem>
        <FormItem label="状态" prop="enable">
          <RadioGroup v-model="isenable">
            <Radio label="0">不启用</Radio>
            <Radio label="1">启用</Radio>
          </RadioGroup>
        </FormItem>
      </Form>

      <div slot="footer">
        <Button type="text" size="large" style="border:1px solid #c6c9ce" @click="cancel">取消</Button>
        <Button
          type="primary"
          size="large"
          :loading="loading"
          @click="getAppSecretModal('formValidate')"
        >确定</Button>
      </div>
      <div slot="close">
        <Icon
          type="md-close"
          size="20"
          color="#515a6e"
          style="margin-top:10px;margin-right:15px"
          class="icon"
          @click="close"
        />
      </div>
    </Modal>
  </div>
</template>
<script>
import {
  addAppSecret,
  delAppSecret,
  editAppSecret,
  searchAppSecret
} from "@/api/http";
import deleteComponent from "@/view/custom/components/deleteComponent";
export default {
  components: {
    deleteComponent
  },
  name: "appSecret",
  data() {
    return {
      formValidateStr: "",
      enableLabel: "", //下拉框绑定数据
      modalDel: false,
      modal_loading: false, //删除的loading
      delID: null, //删除的ID
      isenable: null, // 是否启用
      total: null, // 页码数
      delFormVisible: false, // 删除模态框显示方式
      isShow: false, // 弹框显示状态
      isAdd: false, // 判断当前弹框是否新增
      loading: false, //模态框确定按钮的延时
      // 模态框表单数据
      formValidate: {
        appId: "", // 应用id
        appSecret: "", // 秘钥
        enable: "1", // 是否启用
        mchId: "", // 商户号
        mchName: "", // 商户名称
        operator: this.$store.state.user.userId, // 操作人
        remark: "" // 备注
      },
      ruleValidate: {
        appId: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        mchId: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        mchName: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ]
      },
      appId: "", // 应用id
      appSecret: "", // 秘钥
      enable: "", // 是否启用
      mchId: "", // 商户号
      mchName: "", // 商户名
      pageNum: 1, // 页码
      pageSize: 15, // 页容量
      enableList: [
        {
          value: "1",
          label: "启用"
        },
        {
          value: "0",
          label: "不启用"
        }
      ],
      columns: [
        {
          title: "序号",
          type: "index",
          maxWidth: 60,
          minWidth: 30,
          align: "center"
        },
        {
          title: "商户编号",
          key: "mchId",
          align: "center",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "商户名称",
          key: "mchName",
          align: "center",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "应用id",
          key: "appId",
          align: "center",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "商户秘钥",
          key: "appSecret",
          align: "center",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "状态",
          align: "center",
          slot: "enable",
          maxWidth: 100,
          tooltip: true
        },
        {
          title: "创建日期",
          key: "createDate",
          align: "center",
          minWidth: 25,
          tooltip: true
        },
        {
          title: "操作",
          align: "center",
          slot: "operation",
          minWidth: 80,
          tooltip: true
        }
      ],
      dataTable: []
    };
  },
  methods: {
    // 删除按钮操作
    delCancel() {
      this.modal_loading = false;
      this.modalDel = false;
    },
    del() {
      this.modal_loading = true;
      delAppSecret(this.delID)
        .then(backData => {
          if (backData.data.code == 200) {
            this.modal_loading = false;
            this.modalDel = false;
            this.delID = null; //删除的ID
            this.$Message.success("删除成功");
            this.dataTable.splice(this.delIndex, 1);
            this.delIndex = null; //删除的索引
          }else {
            this.modal_loading = false;
            this.$Message.error(res.data.message);
          }
        })
        .catch(err => {
          this.modal_loading = false;
          this.$Message.error(res.data.message);
        });
    },

    // 重置按钮
    reset() {
      this.appId = ""; // 应用id
      this.appSecret = ""; // 秘钥
      this.enable = ""; // 是否启用
      this.mchId = ""; // 商户号
      this.mchName = ""; // 商户名
      this.enableLabel = "";
      this.pageNum = 1;
      this.getAppSecret();
    },

    show(index) {
      alert(index);
    },
    // 页码改变时触发
    pageChange(value) {
      this.pageNum = value;
      // 重新获取数据
      this.getAppSecret();
    },
    // 页容量改变时触发
    sizeChange(value) {
      this.pageSize = value;
      this.getAppSecret();
    },
    // 状态改变时触发
    enableChange(value) {
      value == "1" ? (this.enable = true) : (this.enable = false);
    },
    cancel() {
      this.loading = false;
      this.isShow = false;
      this.$Message.info("取消操作");
      this.$refs.formValidate.resetFields();
    },
    // 右上角关闭按钮
    close() {
      this.loading = false;
      this.isShow = false;
      this.$refs.formValidate.resetFields();
    },
    // 新增点击事件
    addModal() {
      this.isAdd = true;
      this.isShow = true;
      this.isenable = "1";
      // 模态框表单数据清空
      this.formValidate = {
        appId: "", // 应用id
        appSecret: "", // 秘钥
        enable: true, // 是否启用
        mchId: "", // 商户号
        mchName: "", // 商户名称
        operator: this.$store.state.user.userId, // 操作人
        remark: "" // 备注
      };
    },

    // 编辑点击事件
    editModal(row) {
      this.isAdd = false;
      this.isShow = true;
      this.formValidate = JSON.parse(JSON.stringify(row));
      this.formValidate.mchId = this.formValidate.mchId.toString();
      this.formValidate.appId = this.formValidate.appId.toString();
      this.formValidateStr = JSON.stringify(this.formValidate);
      row.enable ? (this.isenable = "1") : (this.isenable = "0");
    },
    // 弹框确认的点击事件
    getAppSecretModal(name) {
      this.isenable == "1"
        ? (this.formValidate.enable = true)
        : (this.formValidate.enable = false);
      this.$refs[name].validate(valid => {
        if (valid) {
          // 对的
          this.loading = true;
          if (this.isAdd) {
            addAppSecret(this.formValidate)
              .then(backData => {
                if (backData.data.code == 200) {
                  this.loading = false;
                  this.isShow = false;
                  this.$Message.info("新增成功");
                  this.getAppSecret();
                } else {
                  this.loading = false;
                  this.$Message.error(res.data.message)
                }
              })
              .catch(err => {
                this.loading = false;
                this.$Message.error(res.data.message)
              });
          } else if (!this.isAdd) {
            if (this.formValidateStr == JSON.stringify(this.formValidate)) {
              this.isShow = false;
              this.loading = false;
            } else {
              editAppSecret(this.formValidate)
                .then(backData => {
                  if (backData.data.code == 200) {
                    this.loading = false;
                    this.isShow = false;
                    this.$Message.info("修改成功");
                    this.getAppSecret();
                  } else {
                    this.loading = false;
                    this.$Message.error(res.data.message)
                  }
                })
                .catch(err => {
                  this.loading = false;
                  this.$Message.error(res.data.message)
                });
            }
          }
        }
      });
    },
    searchAppSecret() {
      this.pageNum = 1;
      this.getAppSecret();
    },
    // 获取秘钥信息
    getAppSecret() {
      let data = {
        appId: this.appId, // 应用id
        appSecret: this.appSecret, // 秘钥
        enable: this.enable, // 是否启用
        mchId: this.mchId, // 商户号
        mchName: this.mchName, // 商户名
        pageNum: this.pageNum, // 页码
        pageSize: this.pageSize // 页容量
      };
      searchAppSecret(data).then(backData => {
        if (backData.data.code == 200) {
          this.dataTable = backData.data.result.list;
          this.total = backData.data.result.total;
          this.pageNum = backData.data.result.pageNum;
        }
      });
    }
  },
  mounted() {
    this.getAppSecret();
  }
};
</script>
<style lang="less" scoped>
.ivu-input-wrapper {
  width: 300px;
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
</style>
