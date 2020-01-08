<template>
  <div class="dict">
    <!-- 栅格布局 -->
    <div class="leftBox">
      <!-- 按钮 -->
      <Button type="primary" icon="md-add" @click="addModal">添加字典类型</Button>
      <!-- 下拉菜单 -->
      <Dropdown style="margin-left: 10px" @on-click="getDropdownData">
        <Button>
          更多操作
          <Icon type="ios-arrow-down"></Icon>
        </Button>
        <DropdownMenu slot="list">
          <DropdownItem :name="dictId">编辑字典</DropdownItem>
          <DropdownItem @click.native="delOne">删除字典</DropdownItem>
          <DropdownItem @click.native="refresh">刷新</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <!-- 警告 -->
      <div style="width:230px">
        <Alert style="margin-top: 20px" show-icon>
          当前选择：{{dictDataByID.name}}
          <div v-show="isDiv">
            <a href="javascript:;" @click="refresh">取消选择</a>
          </div>
        </Alert>
      </div>
      <!-- 搜索 -->
      <Input
        suffix="ios-search"
        style="margin-bottom:20px;width:230px"
        v-model="name"
        placeholder="请输入"
        clearable
        @keyup.enter.native="getDictType"
        @on-change="clearName"
      />
      <div class="dictContedataNamet">
        <Menu active-name="1" width="240" @on-select="selectRow">
          <MenuItem :name="item.id" v-for="item in dictTypeList" :key="item.id">{{item.name}}</MenuItem>
        </Menu>
      </div>
      <Page :total="totalType" simple @on-change="pageChangeType" :page-size="pageSizeType" />
    </div>
    <div class="rightDiv">
      <Input v-model="dataName" style="margin-right:10px" placeholder="请输入字典名称" clearable />
      <Input v-model="dataValue" style="margin-right:10px" placeholder="请输入字典值" clearable />
      <Button type="primary" @click="searchSearchDictData">查询</Button>
      <Button type="primary" style="margin-right: 10px" @click="addModalData" class="xzbtn">新增</Button>
      <Button type="primary" style="margin-left: 10px" @click="reset">重置</Button>
      <Table highlight-row :columns="columns" :data="dataTable" border style="margin: 20px 0">
        <template slot-scope="{ row, index }" slot="operation">
          <!-- 编辑按钮 -->
          <Button
            type="primary"
            size="small"
            style="margin-right: 10px"
            @click="editModalData(row)"
          >编辑</Button>

          <!-- 删除按钮 -->
          <Button
            type="error"
            size="small"
            @click="modalDel=true;delID=row.id;delIndex=index;isDictType=false"
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

      <!-- 删除 -->
      <delete-component
        :modalDel="modalDel"
        :del_loading="modal_loading"
        @cancel="delCancel"
        @del="del"
      ></delete-component>
    </div>
    <!-- 字典类型弹框的模态框 -->
    <Modal v-model="isShow" :title="isAdd==true?'新增【字典类型】':'编辑【字典类型】'">
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100">
        <FormItem label="字典类型名称" prop="name">
          <Input v-model="formValidate.name" placeholder="字典类型名称" />
        </FormItem>
        <FormItem label="字典类型" prop="type">
          <Input v-model="formValidate.type" placeholder="字典类型" />
        </FormItem>
        <FormItem label="备注" prop="remark">
          <Input v-model="formValidate.remark" placeholder="备注" />
        </FormItem>
      </Form>

      <div slot="footer">
        <Button type="text" size="large" style="border:1px solid #c6c9ce" @click="cancel">取消</Button>
        <Button
          type="primary"
          size="large"
          :loading="loadingType"
          @click="getDictTypeModal('formValidate')"
        >确定</Button>
      </div>
      <div slot="close">
        <Icon
          type="md-close"
          size="20"
          color="#515a6e"
          style="margin-top:10px;margin-right:15px"
          class="icon"
          @click="closeType"
        />
      </div>
    </Modal>

    <!-- 字典数据弹框的模态框 -->
    <Modal
      v-model="isShowData"
      :mask-closable="false"
      :title="isAddData==true?'新增【字典数据】':'编辑【字典数据】'"
      width="450"
    >
      <Form
        ref="formValidateData"
        :model="formValidateData"
        :rules="ruleValidateData"
        :label-width="80"
      >
        <FormItem label="字典名称" prop="dataName">
          <Input v-model="formValidateData.dataName" placeholder="字典名称" />
        </FormItem>
        <FormItem label="字典值" prop="dataValue">
          <Input v-model="formValidateData.dataValue" placeholder="字典值" />
        </FormItem>
        <FormItem label="备注" prop="remark">
          <Input v-model="formValidateData.remark" placeholder="备注" />
        </FormItem>
        <FormItem label="排序" prop="sort">
          <Input v-model="formValidateData.sort" placeholder="排序" />
        </FormItem>
      </Form>

      <div slot="footer">
        <Button type="text" size="large" style="border:1px solid #c6c9ce" @click="cancelData">取消</Button>
        <Button
          type="primary"
          size="large"
          :loading="loadingData"
          @click="getDictDataModal('formValidateData')"
        >确定</Button>
      </div>
      <div slot="close">
        <Icon
          type="md-close"
          size="20"
          color="#515a6e"
          style="margin-top:10px;margin-right:15px"
          class="icon"
          @click="closeData"
        />
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  addDictType,
  delDictType,
  editDictType,
  searchDictType,
  searchDictTypeById,
  addDictData,
  delDictData,
  editDictData,
  searchDictData
} from "@/api/http";
import deleteComponent from "@/view/custom/components/deleteComponent";
export default {
  components: {
    deleteComponent
  },
  name: "dict",
  data() {
    return {
      formValidateDataStr: "",
      formValidateStr: "",
      modalDel: false,
      modal_loading: false, //删除的loading
      isDictType: false, //是否是字典类型删除模式
      delID: null, //删除的ID
      isDiv: false, //是否显示a标签
      totalType: null, // 字典类型页码数
      total: null, // 字典数据页码数
      dictDataByID: {}, // 字典类型信息
      delFormVisibleData: false, // 删除模态框显示方式
      isShowData: false, // 弹框显示状态
      isAddData: false, // 判断当前弹框是否新增
      loadingData: false, //字典数据模态框确定按钮的延时
      // 字典数据模态框表单数据
      formValidateData: {
        dataName: "", // 字典名称
        dataValue: "", // 字典值
        dictId: "", // 字典类型id
        operator: this.$store.state.user.userId, // 操作人
        remark: "", // 备注
        sort: 0 // 排序
      },
      ruleValidateData: {
        dataName: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        dataValue: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ]
      },
      delFormVisible: false, // 删除模态框显示方式
      isShow: false, // 弹框显示状态
      isAdd: false, // 判断当前弹框是否新增
      loadingType: false, //字典类型模态框确定按钮的延时
      // 字典类型模态框表单数据
      formValidate: {
        name: "", // 字典类型名称
        type: "", // 字典类型
        operator: this.$store.state.user.userId, // 操作人
        remark: "" // 备注
      },
      ruleValidate: {
        name: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        type: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ]
      },
      name: "", // 字典类型名称
      type: "", // 字典类型
      pageNumType: 1, // 字典类型页码
      pageSizeType: 15, // 字典类型页容量
      dataName: "", // 字典名称
      dataValue: "", // 字典值
      dictId: "", // 字典类型id
      // dictTypeName: "", //字典类型的名称
      pageNum: 1, // 字典数据页码
      pageSize: 15, // 字典数据页容量
      // 字典类型列表
      dictTypeList: [],
      // 字典数据列表
      columns: [
        {
          title: "序号",
          type: "index",
          maxWidth: 60,
          minWidth: 30,
          align: "center"
        },
        {
          title: "字典名称",
          key: "dataName",
          align: "center",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "字典值",
          key: "dataValue",
          align: "center",
          maxWidth: 100,
          tooltip: true
        },
        {
          title: "排序值",
          key: "sort",
          align: "center",
          minWidth: 50,
          tooltip: true
        },
        {
          title: "备注",
          key: "remark",
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
    delCancel() {
      this.modal_loading = false;
      this.modalDel = false;
    },
    del() {
      this.modal_loading = true;
      if (this.isDictType) {
        delDictType(this.dictId)
          .then(backData => {
            if (backData.data.code == 200) {
              this.modal_loading = false;
              this.modalDel = false;
              this.refresh(); //调用刷新
              this.$Message.info("删除成功");
            }
          })
          .catch(err => {
            this.modal_loading = false;
          });
      } else {
        delDictData(this.delID)
          .then(backData => {
            if (backData.data.code == 200) {
              this.modal_loading = false;
              this.modalDel = false;
              this.delID = null; //删除的ID
              this.$Message.success("删除成功");
              this.dataTable.splice(this.delIndex, 1);
              this.delIndex = null; //删除的索引
            }
          })
          .catch(err => {
            this.modal_loading = false;
          });
      }
    },

    // 字典类型删除按钮操作
    delOne() {
      if (this.dictId == "") {
        this.$Message.error("请选择字典");
      } else {
        this.modalDel = true;
      }
    },

    // 字典类型页码改变时触发
    pageChangeType(value) {
      this.pageNumType = value;
      this.getDictType(); // 重新获取字典类型
    },
    // 字典数据页码改变时触发
    pageChange(value) {
      this.pageNum = value;
      // 重新获取数据
      this.getDictData();
    },

    // 页容量改变时触发
    sizeChange(value) {
      this.pageSize = value;
      this.getDictData();
    },
    // 点击字典类型触发
    selectRow(name) {
      this.dictId = name;
      this.getsearchDictTypeByID(name);
      this.getDictData();
      this.isDictType = true;
    },

    // 字典数据重置按钮
    reset() {
      this.dataName = "";
      this.dataValue = "";
      this.refresh()
      // this.getDictData();
      // this.getDictType();
    },

    // 字典数据模态框取消按钮点击事件
    cancelData() {
      this.$Message.info("取消操作");
      this.loadingData = false;
      this.isShowData = false;
      this.$refs.formValidateData.resetFields();
    },
    // 字典数据右上角关闭按钮
    closeData() {
      this.loadingData = false;
      this.isShowData = false;
      this.$refs.formValidateData.resetFields();
    },

    // 字典数据新增点击事件
    addModalData() {
      if (this.dictId == "") {
        return this.$Message.error("请选择一个字典类型");
      }
      // 字典数据模态框表单数据
      (this.formValidateData = {
        dataName: "", // 字典名称
        dataValue: "", // 字典值
        dictId: "", // 字典类型id
        operator: this.$store.state.user.userId, // 操作人
        remark: "", // 备注
        sort: 0 // 排序
      }),
        (this.isAddData = true);
      this.isShowData = true;
      this.formValidateData.dictId = this.dictId;
    },

    // 字典数据编辑点击事件
    editModalData(row) {
      this.isAddData = false;
      this.isShowData = true;
      this.formValidateData = JSON.parse(JSON.stringify(row));
      this.formValidateDataStr = JSON.stringify(this.formValidateData);
    },

    // 字典数据弹框确认的点击事件
    getDictDataModal(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          // 对的
          this.loadingData = true;
          if (this.isAddData) {
            addDictData(this.formValidateData)
              .then(backData => {
                if (backData.data.code == 200) {
                  this.loadingData = false;
                  this.isShowData = false;
                  this.$Message.info("新增成功");
                  this.getDictData();
                } else {
                  this.loadingData = false;
                  this.$Message.error(res.data.message);
                }
              })
              .catch(err => {
                this.loadingData = false;
                this.$Message.error(res.data.message);
              });
          } else if (!this.isAddData) {
            if (
              this.formValidateDataStr == JSON.stringify(this.formValidateData)
            ) {
              this.isShowData = false;
              this.loadingData = false;
            } else {
              editDictData(this.formValidateData)
                .then(backData => {
                  if (backData.data.code == 200) {
                    this.loadingData = false;
                    this.isShowData = false;
                    this.$Message.info("修改成功");
                    this.getDictData();
                  } else {
                    this.loadingData = false;
                    this.$Message.error(res.data.message);
                  }
                })
                .catch(err => {
                  this.loadingData = false;
                  this.$Message.error(res.data.message);
                });
            }
          }
        }
      });
    },

    // 字典类型弹框取消点击事件
    cancel() {
      this.loadingType = false;
      this.$Message.info("取消操作");
      this.isShow = false;
      this.$refs.formValidate.resetFields();
    },
    // 字典类型弹框右上角关闭按钮
    closeType() {
      this.loadingType = false;
      this.isShow = false;
      this.$refs.formValidate.resetFields();
    },

    // 字典类型新增点击事件
    addModal() {
      this.isAdd = true;
      this.isShow = true;
      this.formValidate = {
        name: "", // 字典类型名称
        type: "", // 字典类型
        operator: this.$store.state.user.userId, // 操作人
        remark: "" // 备注
      };
    },

    // 字典类型获取Dropdown下拉框数据
    getDropdownData(name) {
      if (name == "") {
        this.$Message.error("请选择字典");
      } else if (name == this.dictId) {
        this.getsearchDictTypeByID(name);
        this.formValidate = this.dictDataByID;
        this.formValidateStr = JSON.stringify(this.formValidate);
        this.isAdd = false;
        this.isShow = true;
      }
    },

    // 字典类型刷新按钮操作
    refresh() {
      this.dictId = "";
      this.name = "";
      this.pageNumType = 1;
      this.pageNum = 1;
      this.dictTypeList = null;
      this.dictDataByID = {};
      this.getDictType(); // 重新获取字典类型
      this.getDictData();
      this.isDiv = false;
    },

    clearName($event) {
      if (!$event.target.value) {
        this.name = "";
        this.getDictType(); // 重新获取字典类型
      }
    },

    // 字典类型弹框确认的点击事件
    getDictTypeModal(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          if (this.isAdd) {
            // 对的
            this.loadingType = true;
            addDictType(this.formValidate)
              .then(backData => {
                if (backData.data.code == 200) {
                  this.loadingType = false;
                  this.isShow = false;
                  this.$Message.info("新增成功");
                  this.getDictType(); // 重新获取字典类型
                } else {
                  this.loadingType = false;
                  this.$Message.error(res.data.message);
                }
              })
              .catch(err => {
                this.loadingType = false;
                this.$Message.error(res.data.message);
              });
          } else if (!this.isAdd) {
            if (this.formValidateStr == JSON.stringify(this.formValidate)) {
              this.isShow = false;
              this.loadingType = false;
            } else {
              editDictType(this.formValidate)
                .then(backData => {
                  if (backData.data.code == 200) {
                    this.loadingType = false;
                    this.isShow = false;
                    this.$Message.info("修改成功");
                    this.getDictType(); // 重新获取字典类型
                    this.getsearchDictTypeByID();
                  } else {
                    this.loadingType = false;
                    this.$Message.error(res.data.message);
                  }
                })
                .catch(err => {
                  this.loadingType = false;
                  this.$Message.error(res.data.message);
                });
            }
          }
        }
      });
    },

    // 获取字典类型
    getDictType() {
      let data = {
        name: this.name,
        type: this.type,
        pageNum: this.pageNumType,
        pageSize: this.pageSizeType
      };
      searchDictType(data).then(backData => {
        if (backData.data.code == 200) {
          this.dictTypeList = backData.data.result.list;
          this.totalType = backData.data.result.total;
          this.pageNumType = backData.data.result.pageNum;
        }
      });
    },
    searchSearchDictData() {
      this.pageNum = 1;
      this.getDictData();
    },
    // 获取字典数据
    getDictData() {
      let data = {
        dataName: this.dataName,
        dataValue: this.dataValue,
        dictId: this.dictId,
        pageNum: this.pageNum,
        pageSize: this.pageSize
      };
      searchDictData(data).then(backData => {
        if (backData.data.code == 200) {
          this.dataTable = backData.data.result.list;
          this.total = backData.data.result.total;
          this.pageNum = backData.data.result.pageNum;
        }
      });
    },

    getsearchDictTypeByID() {
      // 根据字典id获取字典类型信息
      searchDictTypeById(this.dictId).then(backData => {
        if (backData.data.code == 200) {
          this.dictDataByID = backData.data.result;
          this.isDiv = true;
        }
      });
    }
  },

  mounted() {
    this.getDictType();
    this.getDictData();
  }
};
</script>

<style lang="less" scoped>
.dict {
  .leftBox {
    // min-width: 250px;
    min-height: 900px;
    float: left;
    margin-right: 20px;
  }
  .dictContedataNamet {
    .ivu-menu-item-active {
      padding: 0;
    }
    /deep/ .ivu-menu-item-active:not(.ivu-menu-submenu) {
      background: #fff;
      padding: 5px 0;
    }
    /deep/ .ivu-menu-item-active:not(.ivu-menu-submenu):after {
      background: #fff;
    }
    /deep/ .ivu-menu-vertical.ivu-menu-light:after {
      width: 0;
    }
    /deep/ .ivu-menu {
      padding-left: 15px;
    }
    margin-bottom: 30px;
    li {
      padding: 5px 0;
      font-family: "Microsoft Yahei";
      font-size: 12px;
    }
  }
}
</style>
