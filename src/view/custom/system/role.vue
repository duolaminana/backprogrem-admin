<template>
  <div class="role">
    <Input v-model="roleName" style="margin-right:10px" placeholder="请输入角色名称" clearable />
    <Button type="primary" @click="searchSearchRole" v-if="hasPerm('sys:role:see')">查询</Button>
    <Button type="primary" @click="addModal" class="xzbtn" v-if="hasPerm('sys:role:edit')">新增</Button>
    <Button type="primary" @click="reset" v-if="hasPerm('sys:role:see')">重置</Button>
    <Table
      highlight-row
      :columns="columns"
      :data="dataTable"
      border
      ref="table"
      style="margin:20px 0"
    >
      <!-- 操作 -->
      <template slot-scope="{ row, index }" slot="operation">
        <!-- 分配权限 -->
        <Button
          type="warning"
          size="small"
          @click="getRoleMenu(row)"
          v-if="hasPerm('sys:role:edit')"
        >分配权限</Button>
        <!-- 编辑按钮 -->
        <Button
          type="primary"
          size="small"
          @click="editModal(row)"
          v-if="hasPerm('sys:role:edit')"
        >编辑</Button>
        <!-- 删除按钮 -->
        <Button
          style="margin-right: 0px"
          type="error"
          size="small"
          v-if="hasPerm('sys:role:edit')"
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
    <!-- </div> -->
    <!-- 删除 -->
    <delete-component
      :modalDel="modalDel"
      :del_loading="modal_loading"
      @cancel="delCancel"
      @del="del"
    ></delete-component>
    <!-- 新增弹框的模态框 -->
    <Modal v-model="isShow" :mask-closable="false" :title="isAdd==true?'新增【角色】':'编辑【角色】'">
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
        <FormItem label="角色名称" prop="roleName">
          <Input v-model="formValidate.roleName" placeholder="角色名称"></Input>
        </FormItem>
        <FormItem label="角色" prop="role">
          <Input v-model="formValidate.role" placeholder="角色"></Input>
        </FormItem>
        <FormItem label="备注" prop="remark">
          <Input v-model="formValidate.remark" placeholder="备注"></Input>
        </FormItem>
      </Form>

      <div slot="footer">
        <Button type="text" size="large" style="border:1px solid #c6c9ce" @click="cancel">取消</Button>
        <Button type="primary" size="large" @click="getRoleModal('formValidate')">确定</Button>
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

    <!-- 分配权限弹框的模态框 -->
    <Modal v-model="purviewFormVisible" title="权限分配" class="purviewForm">
      <Tree
        style="max-height:500px;overflow:auto"
        ref="treeData"
        :data="purviewList"
        show-checkbox
        multiple
        :check-strictly="false"
        check-directly
      ></Tree>

      <div slot="footer">
        <Button type="text" size="large" style="border:1px solid #c6c9ce" @click="cancelPurview">取消</Button>
        <Button type="primary" size="large" :loading="loading" @click="getNodes">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import {
  addRole,
  delRole,
  editRole,
  searchRole,
  permissionByRole,
  permissionToRole
} from "@/api/http";
import channelTree from "@/view/custom/components/channelTree";
import deleteComponent from "@/view/custom/components/deleteComponent";
export default {
  components: {
    channelTree,
    deleteComponent
  },
  name: "role",

  data() {
    return {
      formValidateStr: "",
      modalDel: false,
      modal_loading: false, //删除的loading
      delID: null, //删除的ID
      purviewFormVisible: false, // 分配权限模态框显示方式
      isShowModel: false, // 是否显示组件
      total: null, // 页码数
      // isShowModel: false, //是否显示组件
      delFormVisible: false, // 删除模态框显示方式
      isShow: false, // 弹框显示状态
      isAdd: false, // 判断当前弹框是否新增
      loading: false, //模态框确定按钮的延时
      // 新增模态框表单数据
      formValidate: {
        channelId: this.$store.state.user.channelId, // 渠道id
        operator: this.$store.state.user.userId, // 操作人
        remark: "", // 备注
        role: "", // 角色
        roleName: "" // 角色名称
      },

      // 新增模态框表单规则
      ruleValidate: {
        roleName: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        role: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ]
      },
      channelId: this.$store.state.user.channelId, // 渠道ID
      pageNum: 1, // 页码
      pageSize: 15, // 页容量
      roleName: "", // 角色名称
      roleId: "", // 角色id
      // 数据结构
      columns: [
        {
          title: "序号",
          type: "index",
          maxWidth: 60,
          minWidth: 30,
          align: "center"
        },
        {
          title: "角色名称",
          key: "roleName",
          align: "center",
          // maxWidth: 100,
          tooltip: true
        },
        {
          title: "角色",
          key: "role",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "备注",
          key: "remark",
          align: "center",
          // maxWidth: 100,
          tooltip: true
        },
        {
          title: "创建时间",
          key: "createDate",
          align: "center",
          minWidth: 80,
          tooltip: true
        },

        {
          title: "操作",
          align: "center",
          slot: "operation",
          minWidth: 120,
          tooltip: true
        }
      ],
      // 数据
      dataTable: [],
      // 权限列表
      purviewList: []
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
      delRole(this.delID)
        .then(res => {
          if (res.data.code == 200) {
            this.modal_loading = false;
            this.modalDel = false;
            this.delID = null; //删除的ID
            this.$Message.success("删除成功");
            this.dataTable.splice(this.delIndex, 1);
            this.delIndex = null; //删除的索引
          } else {
            this.modal_loading = false;
            this.$Message.error(res.data.message);
          }
        })
        .catch(err => {
          this.modal_loading = false;
          this.$Message.error(res.data.message);
        });
    },

    clickTreeRow(value) {
      if (value) {
        this.channelId = value.id;
        this.getRole();
      }
    },
    // 用户重置按钮
    reset() {
      this.roleName = "";
      this.pageNum = 1;
    },
    // 页码改变时触发
    pageChange(value) {
      this.pageNum = value;
      this.getRole(); // 重新获取数据
    },
    // 页容量改变时触发
    sizeChange(value) {
      this.pageSize = value;
      this.getRole(); // 重新获取数据
    },
    // 右上角关闭按钮
    close() {
      this.isShow = false;
      this.loading = false;
      this.$refs.formValidate.resetFields();
    },
    cancel() {
      this.$Message.info("取消操作");
      this.isShow = false;
      this.loading = false;
      this.$refs.formValidate.resetFields();
    },

    // 获取用户菜单用于分配权限-分配权限点击事件
    getRoleMenu(row) {
      this.roleId = row.id;
      this.purviewFormVisible = true;
      permissionByRole(this.channelId, row.id).then(res => {
        if (res.data.code == 200) {
          this.purviewList = res.data.result;
          this.purviewList.map(v => {
            this.isCheck(v);
          });
        }
      });
    },
    isCheck(obj) {
      if (obj.children && obj.children.length) {
        delete obj.checked;
      }
      obj.children.map((v, i) => {
        if (v.children && v.children.length) {
          delete obj.checked;
          this.isCheck(v);
        }
      });
    },
    cancelPurview() {
      this.purviewFormVisible = false;
      this.$Message.info("取消操作");
    },

    // 获取tree组件的选中子节点
    getNodes() {
      let ary = this.$refs.treeData.getCheckedAndIndeterminateNodes();
      if (ary.length) {
        const pidsStr = ary.map(i => i.id).join(",");
        permissionToRole({ pids: pidsStr, roleId: this.roleId }).then(res => {
          if (res.data.code == 200) {
            this.purviewFormVisible = false;
            this.$Message.info("权限更新成功！！！！");
            // 重新渲染页面
            this.getRole();
          }
        });
      } else {
        this.$Message.error("请给该角色选择权限！");
      }
    },

    // 新增点击事件
    addModal() {
      this.isAdd = true;
      this.isShow = true;
      this.formValidate = {
        channelId: this.$store.state.user.channelId, // 渠道id
        operator: this.$store.state.user.userId, // 操作人
        remark: "", // 备注
        role: "", // 角色
        roleName: "" // 角色名称
      };
    },

    // 编辑点击事件
    editModal(row) {
      console.log(row);
      this.isAdd = false;
      this.isShow = true;
      this.formValidate = JSON.parse(JSON.stringify(row));
      this.formValidate.role = row.role.slice(5);
      this.formValidateStr = JSON.stringify(this.formValidate);
    },

    // 弹框确认的点击事件
    getRoleModal(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          // 对的
          this.loading = true;
          if (this.isAdd) {
            this.formValidate.role = "ROLE_" + this.formValidate.role;
            addRole(this.formValidate)
              .then(res => {
                if (res.data.code == 200) {
                  this.loading = false;
                  this.isShow = false;
                  this.$Message.info("新增成功");
                  this.getRole();
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
              this.formValidate.role = "ROLE_" + this.formValidate.role;
              editRole(this.formValidate)
                .then(res => {
                  if (res.data.code == 200) {
                    this.loading = false;
                    this.isShow = false;
                    this.$Message.info("修改成功");
                    this.getRole();
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
    searchSearchRole() {
      this.pageNum = 1;
      this.getRole();
    },
    // 获取用户信息
    getRole() {
      let data = {
        channelId: this.channelId,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        roleName: this.roleName
      };
      searchRole(data).then(res => {
        if (res.data.code == 200) {
          this.dataTable = res.data.result.list;
          this.total = res.data.result.total;
          this.pageNum = res.data.result.pageNum;
        }
      });
    }
  },

  mounted() {
    this.getRole();
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
.purviewForm {
  /deep/ .ivu-modal-body {
    padding: 20px 32px;
  }
}
</style>
