<template>
  <div>
    <div>
      <Input style="margin-right:10px" v-model="appId" placeholder="请输入应用id" clearable />
      <Input style="margin-right: 10px" v-model="appName" placeholder="请输入应用名称" clearable />
      <Button type="primary" @click="searchAppManage">查询</Button>
      <Button type="primary" @click="addModal" class="xzbtn">新增</Button>
      <Button type="primary" @click="reset">重置</Button>
      <Table highlight-row :columns="columns" :data="dataTable" border>
        <template slot-scope="{ row, index }" slot="operation">
          <!-- 编辑按钮 -->
          <Button type="primary" size="small" @click="editModal(row)">编辑</Button>
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
    <!-- 删除 -->
    <delete-component
      :modalDel="modalDel"
      :del_loading="modal_loading"
      @cancel="delCancel"
      @del="del"
    ></delete-component>

    <!-- 弹框的模态框 -->
    <Modal
      v-model="isShow"
      :mask-closable="false"
      :title="isAdd==true?'新增【应用】':'编辑【应用】'"
      width="500"
    >
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
        <FormItem label="应用名称" prop="appName">
          <Input v-model="formValidate.appName" placeholder="应用名称"></Input>
        </FormItem>
        <FormItem label="应用描述" prop="appDesc">
          <Input v-model="formValidate.appDesc" placeholder="应用描述"></Input>
        </FormItem>
        <FormItem label="备注" prop="remark">
          <Input v-model="formValidate.remark" placeholder="备注"></Input>
        </FormItem>
      </Form>

      <div slot="footer">
        <Button type="text" size="large" style="border:1px solid #c6c9ce" @click="cancel">取消</Button>
        <Button
          type="primary"
          size="large"
          :loading="loading"
          @click="getAppManageModal('formValidate')"
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
  addAppManage,
  delAppManage,
  editAppManage,
  searchAppManage
} from "@/api/http";
import deleteComponent from "@/view/custom/components/deleteComponent";
export default {
  components: {
    deleteComponent
  },
  name: "appManage",
  data() {
    return {
      formValidateStr: "",
      modalDel: false,
      modal_loading: false, //删除的loading
      delID: null, //删除的ID
      total: null, // 页码数
      delFormVisible: false, // 删除模态框显示方式
      isShow: false, // 弹框显示状态
      isAdd: false, // 判断当前弹框是否新增
      loading: false, //模态框确定按钮的延时
      // 模态框表单数据
      formValidate: {
        appDesc: "", // 应用描述
        appName: "", // 应用名称
        operator: this.$store.state.user.userId, // 操作人
        remark: "" // 备注
      },
      ruleValidate: {
        appName: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "change"
          }
        ]
      },
      appId: "", // 应用id
      appDesc: "", // 应用描述
      appName: "", // 应用名称
      pageNum: 1, // 页码
      pageSize: 15, // 页容量
      columns: [
        {
          title: "序号",
          type: "index",
          maxWidth: 60,
          minWidth: 30,
          align: "center"
        },
        {
          title: "应用名称",
          key: "appName",
          align: "center",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "应用id",
          key: "appId",
          align: "center",
          // maxWidth: 100,
          tooltip: true
        },
        {
          title: "应用描述",
          key: "appDesc",
          align: "center",
          minWidth: 50,
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
      delAppManage(this.delID)
        .then(res => {
          if (res.data.code == 200) {
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
      this.appDesc = ""; // 应用描述
      this.appName = ""; // 应用名称
      this.pageNum = 1;
      this.getAppManage();
    },

    // 页码改变时触发
    pageChange(value) {
      this.pageNum = value;
      // 重新获取数据
      this.getAppManage();
    },

    // 页容量改变时触发
    sizeChange(value) {
      this.pageSize = value;
      this.getAppManage();
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
      this.formValidate = {
        appDesc: "", // 应用描述
        appName: "", // 应用名称
        operator: this.$store.state.user.userId, // 操作人
        remark: "" // 备注
      };
    },

    // 编辑点击事件
    editModal(row) {
      this.isAdd = false;
      this.isShow = true;
      this.formValidate = JSON.parse(JSON.stringify(row));
      this.formValidateStr = JSON.stringify(this.formValidate);
    },

    // 弹框确认的点击事件
    getAppManageModal(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.loading = true;
          if (this.isAdd) {
            // 对的
            addAppManage(this.formValidate)
              .then(res => {
                if (res.data.code == 200) {
                  this.loading = false;
                  this.isShow = false;
                  this.$Message.info("新增成功");
                  this.getAppManage();
                } else {
                  this.loading = false;
                  this.$Message.error(res.data.message);
                }
              })
              .catch(err => {
                this.loading = false;
                this.$Message.error(res.data.message);
              });
          } else if (!this.isAdd) {
            if (this.formValidateStr == JSON.stringify(this.formValidate)) {
              this.isShow = false;
              this.loading = false;
            } else {
              editAppManage(this.formValidate)
                .then(res => {
                  if (res.data.code == 200) {
                    this.loading = false;
                    this.isShow = false;
                    this.$Message.info("修改成功");
                    this.getAppManage();
                  } else {
                    this.loading = false;
                    this.$Message.error(res.data.message);
                  }
                })
                .catch(err => {
                  this.loading = false;
                  this.$Message.error(res.data.message);
                });
            }
          }
        }
      });
    },
    searchAppManage() {
      this.pageNum = 1;
      this.getAppManage();
    },
    // 获取商户信息
    getAppManage() {
      let data = {
        appId: this.appId,
        appDesc: this.appDesc,
        appName: this.appName,
        pageNum: this.pageNum,
        pageSize: this.pageSize
      };
      searchAppManage(data).then(res => {
        if (res.data.code == 200) {
          this.dataTable = res.data.result.list;
          this.total = res.data.result.total;
          this.pageNum = res.data.result.pageNum;
        }
      });
    }
  },
  mounted() {
    this.getAppManage();
  }
};
</script>
<style lang="less" scoped>
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
