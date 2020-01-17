<template>
  <div class="userManagement">
    <div class="leftBox">
      <!-- 按钮 -->
      <Button
        type="primary"
        icon="md-add-circle"
        @click="addModalDep"
        style="margin-right: 20px"
        v-if="hasPerm('sys:user:edit')"
      >添加部门</Button>
      <!-- 下拉菜单 -->
      <Dropdown @on-click="getDropdownData">
        <Button>
          更多操作
          <Icon type="ios-arrow-down"></Icon>
        </Button>
        <DropdownMenu slot="list">
          <DropdownItem :name="deptId" v-if="hasPerm('sys:user:edit')">编辑部门</DropdownItem>
          <DropdownItem @click.native="delOneDep" v-if="hasPerm('sys:user:edit')">删除部门</DropdownItem>
          <DropdownItem @click.native="refresh" v-if="hasPerm('sys:user:see')">刷新</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <!-- 警告 -->
      <div style="width:215px">
        <Alert style="margin: 20px 0" show-icon>
          当前选择：{{alertvalue}}
          <div v-show="isDiv">
            <a href="javascript:;" @click="refresh">取消选择</a>
          </div>
        </Alert>
      </div>
      <!-- 部门树 -->
      <Coustom-tree :treeData="treeData" @pickTree="pickTree"></Coustom-tree>
    </div>
    <div class="rightDiv">
      <Input v-model="userName" style="margin-right:10px" placeholder="用户名" clearable />
      <Input v-model="phone" style="margin-right:10px" placeholder="手机号码" clearable />
      <Select v-model="status" clearable placeholder="用户状态" style="margin-right:10px;width:90px">
        <Option v-for="item in List" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
      <Button type="primary" @click="searchuserManagement" v-if="hasPerm('sys:user:see')">查询</Button>
      <Button type="primary" @click="addModal" class="xzbtn" v-if="hasPerm('sys:user:edit')">新增</Button>
      <Button type="primary" @click="reset" v-if="hasPerm('sys:user:see')">重置</Button>
      <Table highlight-row :columns="columns" :data="dataTable" border ref="table">
        <!-- 图像 -->
        <template slot-scope="{ row, index }" slot="img">
          <img :src="row.imageAddress" class="imgstyle" />
        </template>
        <!-- 状态 -->
        <template slot="status" slot-scope="{ row, index }">
          <span v-show="row.status==1" style="margin-right: 5px;color:#19be6b">正常</span>
          <span v-show="row.status==2" style="margin-right: 5px;color:#ed4014">锁定</span>
        </template>
        <!-- 管理分区 -->
        <template slot="userRoutes" slot-scope="{ row, index }">
          <span v-if="row.type==2||row.managerRoute==1">全部</span>
          <Tooltip max-width="200" :content="row.routerStr" placement="top">
            <span v-if="row.type!=2&&row.managerRoute!=1">{{row.userRouteVos|userRouteVosText}}</span>
          </Tooltip>
        </template>
        <!-- 开门权限 -->
        <template slot="isOpen" slot-scope="{ row, index }">
          <a
            class="lookDetails"
            v-if="row.openDoor==2&&hasPerm('sys:user:edit')"
            @click="toOpenModal(row)"
          >去开启</a>
          <Button
            style="margin-right:0px"
            type="primary"
            v-if="row.openDoor==1&&hasPerm('sys:user:edit')"
            size="small"
            @click="toOpenModal(row)"
          >编辑</Button>
        </template>
        <!-- 操作 -->
        <template slot-scope="{ row, index }" slot="operation">
          <!-- 编辑按钮 -->
          <Button
            type="primary"
            size="small"
            @click="editModal(row)"
            v-if="row.type!=2&&hasPerm('sys:user:edit')"
          >编辑</Button>
          <Button
            type="success"
            size="small"
            @click="resetPwd(row)"
            v-if="row.type!=2&&hasPerm('sys:user:edit')"
          >密码重置</Button>
          <!-- 删除按钮 -->
          <Button
            style="margin-right: 0px"
            type="error"
            size="small"
            @click="modalDel=true;delID=row.id;delIndex=index;isDep=false"
            v-if="row.type!=2&&hasPerm('sys:user:edit')"
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
    <!-- 新增用户弹框的模态框 -->
    <Modal v-model="isShow" :mask-closable="false" :title="isAdd==true?'新增【用户】':'编辑【用户】'">
      <Form
        ref="formValidate"
        :model="formValidate"
        :rules="ruleValidate"
        :label-width="100"
        style="max-height:700px;overflow:auto"
      >
        <FormItem label prop="imageAddress" id="header_image">
          <template>
            <Upload
              :show-upload-list="false"
              :action="Upload"
              name="multipartFile"
              :format="['jpg','jpeg','png']"
              :max-size="100"
              :on-exceeded-size="handleMaxSize"
              :on-format-error="formtError"
              :on-error="onError"
              :on-success="imgSuccess"
              style="text-align: center"
            >
              <img
                :src="formValidate.imageAddress"
                style="width:120px;height:150px"
                class="uploadImg"
                v-show="uploadResult"
              />

              <div style="padding: 20px 0" v-show="!uploadResult">
                <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                <p>点击上传头像</p>
                <span style="color:#afb2b7">推荐图片格式：jpg/png</span>
              </div>
            </Upload>
          </template>
        </FormItem>
        <FormItem label="登录名称" prop="userNameNew" style="display:inline-block">
          <Input v-model="formValidate.userNameNew" placeholder="请输入登录名称" style="width:180px"></Input>
          <Input
            v-if="isAdd"
            v-model="formValidate.userName"
            type="text"
            style="width:10px;opacity: 0;position: absolute"
          ></Input>
        </FormItem>
        <FormItem label="密码" prop="passwordNew" v-if="ispassword" style="display:inline-block">
          <Input
            v-model="formValidate.password"
            type="password"
            style="width:10px;opacity: 0;position: absolute"
          ></Input>
          <Input
            v-model="formValidate.passwordNew"
            :type="pswd?'text':'password'"
            placeholder="请输入密码"
            style="width:180px"
          >
            <Icon @click.native="pswd=!pswd" :type="pswd?'md-eye-off':'md-eye'" slot="suffix" />
          </Input>
        </FormItem>
        <FormItem label="真实姓名" prop="name" style="display:inline-block">
          <Input v-model="formValidate.name" placeholder="请输入真实姓名" style="width:180px"></Input>
        </FormItem>
        <FormItem label="身份证号" prop="card" style="display:inline-block">
          <Input v-model="formValidate.card" placeholder="请输入身份证号" style="width:180px"></Input>
        </FormItem>

        <FormItem label="手机号码" prop="phone">
          <Input v-model="formValidate.phone" placeholder="请输入手机号码" style="width:180px"></Input>
        </FormItem>
        <FormItem label="邮箱">
          <Input v-model="formValidate.email" placeholder="请输入邮箱" style="width: 220px"></Input>
        </FormItem>

        <FormItem label="所属部门" prop="newDeptId" style="margin-bottom:10px">
          <Cascader
            style="width: 220px"
            :data="depData"
            v-model="formValidate.newDeptId"
            @on-change="selectChange"
            :render-format="format"
            placeholder="请选择部门"
            change-on-select
          ></Cascader>
        </FormItem>
        <FormItem label="性别" prop="sex" style="margin-bottom:10px">
          <RadioGroup v-model="formValidate.sex">
            <Radio label="1">男</Radio>
            <Radio label="2">女</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="状态" prop="status" style="margin-bottom:10px">
          <RadioGroup v-model="isStatus">
            <Radio label="1">正常</Radio>
            <Radio label="2">锁定</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="角色 " prop="roleId" style="margin-bottom:10px">
          <RadioGroup v-model="formValidate.roleId">
            <Radio v-for="item in allRoleList" :label="item.id" :key="item.id">{{item.roleName}}</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="管理分区" style="margin-bottom:0px">
          <RadioGroup v-model="formValidate.managerRoute" @on-change="changeRoute">
            <Radio label="1">全部</Radio>
            <Radio label="2">部分</Radio>
          </RadioGroup>
        </FormItem>
        <div class="routesTree" v-show="isShowRouteTree">
          <Tree
            style="max-height:280px;overflow:auto"
            ref="treeData"
            :data="routeTreeList"
            show-checkbox
            multiple
            check-strictly
            check-directly
          ></Tree>
        </div>
      </Form>

      <div slot="footer">
        <Button type="text" size="large" style="border:1px solid #c6c9ce" @click="cancel">取消</Button>
        <Button
          type="primary"
          size="large"
          :loading="loading"
          @click="getUserManagementModal('formValidate')"
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

    <!-- 新增部门弹框的模态框 -->
    <Modal v-model="isShowDep" :mask-closable="false" :title="isAddDep==true?'新增【部门】':'编辑【部门】'">
      <Form
        ref="formValidateDep"
        :model="formValidateDep"
        :rules="ruleValidateDep"
        :label-width="120"
      >
        <FormItem label="部门名称" prop="deptName">
          <Input v-model="formValidateDep.deptName" placeholder="部门名称"></Input>
        </FormItem>
        <FormItem label="上级部门" prop="newPid " v-if="isAddDep">
          <Cascader
            style="width: 300px"
            :data="depData"
            v-model="formValidateDep.newPid"
            @on-change="selectChange"
            change-on-select
          ></Cascader>
        </FormItem>
        <FormItem label="排序号" prop="sort">
          <Input v-model="formValidateDep.sort" placeholder="排序号"></Input>
        </FormItem>
        <FormItem label="备注" prop="remark">
          <Input v-model="formValidateDep.remark" placeholder="备注"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" style="border:1px solid #c6c9ce" @click="cancelDep">取消</Button>
        <Button
          type="primary"
          size="large"
          :loading="loadingDep"
          @click="getDepartmentModal('formValidateDep')"
        >确定</Button>
      </div>
      <div slot="close">
        <Icon
          type="md-close"
          size="20"
          color="#515a6e"
          style="margin-top:10px;margin-right:15px"
          class="icon"
          @click="closeDep"
        />
      </div>
    </Modal>

    <!-- 开门权限模态框 -->
    <Modal v-model="isShowOpen" :mask-closable="false" title="开门权限" width="800">
      <div class="titleBox">
        开门权限：
        <RadioGroup v-model="openDoor" @on-change="radioChange">
          <Radio label="1">
            <span>开通</span>
          </Radio>
          <Radio label="2">
            <span>关闭</span>
          </Radio>
        </RadioGroup>
      </div>
      <Divider />
      <div class="contentBox">
        <Transfer
          filterable
          :titles="titles"
          :data="transferData"
          :target-keys="targetKeys"
          :list-style="{width:'350px',height:'400px'}"
          :render-format="render"
          @on-change="handleChange"
        ></Transfer>
      </div>
      <div slot="footer">
        <Button
          type="text"
          size="large"
          style="border:1px solid #c6c9ce"
          @click="isShowOpen=false"
        >取消</Button>
        <Button type="primary" size="large" @click="openDoorModal">确定</Button>
      </div>
    </Modal>
    <!-- 重置密码模态框 -->
    <Modal v-model="isShowPwd" width="600" title="密码重置" :mask-closable="false">
      <Form
        ref="formValidatePwd"
        :model="formValidatePwd"
        :rules="ruleValidatePwd"
        :label-width="120"
      >
        <FormItem label="新密码" prop="newPassword" class="modelInput">
          <Input
            :type="newPswd?'text':'password'"
            v-model.trim="formValidatePwd.newPassword"
            placeholder="新密码"
          >
            <Icon
              @click.native="newPswd=!newPswd"
              :type="newPswd?'md-eye-off':'md-eye'"
              slot="suffix"
            />
          </Input>
        </FormItem>
        <FormItem label="再次输入新密码" prop="newPasswordAgain" class="modelInput">
          <Input
            :type="newPswdAgain?'text':'password'"
            v-model.trim="formValidatePwd.newPasswordAgain"
            placeholder="再次输入新密码"
          >
            <Icon
              @click.native="newPswdAgain=!newPswdAgain"
              :type="newPswdAgain?'md-eye-off':'md-eye'"
              slot="suffix"
            />
          </Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="cancel">取消</Button>
        <Button
          type="primary"
          size="large"
          :loading="loading"
          @click="resetPwdModal('formValidatePwd')"
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
  Upload,
  addDept,
  delDept,
  editDept,
  searchDeptBychannelId,
  searchDeptById,
  addUser,
  delUser,
  editUser,
  searchUser,
  searchRoleByChannelId,
  searchRoleByUserId,
  modifyUserMachine,
  searchRouteTreeByChannelId,
  searchUserMachineList,
  searchRouteListByChannelId,
  resetPwd
} from "@/api/http";
import CoustomTree from "@/view/custom/components/coustom-tree";
import deleteComponent from "@/view/custom/components/deleteComponent";
export default {
  components: {
    CoustomTree,
    deleteComponent
  },
  name: "userManagement",

  data() {
    const validateUserName = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("输入不能为空"));
      } else if (!/^(?!^\d+$)[0-9a-zA-Z]+$/.test(value)) {
        callback(new Error("不能为纯数字且不包含汉字"));
      } else {
        callback();
      }
    };
    const validatePassword = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("输入不能为空"));
      } else if (!/^(?!^\d+$)(?!^[a-zA-Z]+$)[0-9a-zA-Z]+$/.test(value)) {
        callback(new Error("密码请使用数字和字母组合"));
      } else {
        callback();
      }
    };
    const validatePhone = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("输入不能为空"));
      } else if (!/^1[3456789]\d{9}$/.test(value)) {
        callback(new Error("电话号码格式错误"));
      } else {
        callback();
      }
    };
    const validateCard = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("输入不能为空"));
      } else if (
        !/^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(
          value
        )
      ) {
        callback(new Error("身份证号码格式错误"));
      } else {
        callback();
      }
    };
    return {
      newPswd: false,
      newPswdAgain: false,
      formValidatePwd: {
        newPassword: null,
        newPasswordAgain: null
      },
      ruleValidatePwd: {
        newPassword: [
          { required: true, validator: validatePassword, trigger: "blur" },
          { min: 6, max: 20, message: "密码长度6-20个字符", trigger: "blur" }
        ],
        newPasswordAgain: [
          { required: true, validator: validatePassword, trigger: "blur" },
          { min: 6, max: 20, message: "密码长度6-20个字符", trigger: "blur" }
        ]
      },
      isShowPwd: false,
      pswd: false, //密码显示方式
      routerStr: "",
      managerRoute: null,
      isShowRouteTree: false,
      routeTreeList: [],
      formValidateStr: "",
      formValidateDepStr: "",
      isDefault: true,
      cacheValue: null, //缓存级联change的值
      userId: null, //用户id
      openDoor: 2, //开门权限 1有 2无
      // form:{},
      machineCodes: [], //设备列表
      targetKeys: [],
      transferData: [],
      titles: ["未关联设备", "已关联设备"],
      isShowOpen: false,
      modalDel: false,
      modal_loading: false, //删除的loading
      delID: null, //删除的ID
      isDep: false, //是否是部门删除模式
      ispassword: true, //用户密码框显示模式
      isDiv: false, //是否显示a标签
      isStatus: "1", //状态切换
      isShowModel: false, // 用户模态框不显示部分
      treeData: [], // 部门树
      depData: [], // 上级部门数据
      Upload, // 上传文件地址
      List: [
        {
          value: "1",
          label: "正常"
        },
        {
          value: "2",
          label: "锁定"
        }
      ],
      model8: "",
      total: null, // 页码数
      delFormVisible: false, // 删除用户模态框显示方式
      isShow: false, // 用户弹框显示状态
      isAdd: false, // 判断当前用户弹框是否新增
      loading: false, //用户模态框确定按钮的延时
      uploadResult: false,
      // 新增用户模态框表单数据
      formValidate: {
        birth: null, // 出生日期
        card: null, //身份证号码
        channelId: this.$store.state.user.channelId, // 渠道id
        newDeptId: [], // 部门id
        deptId: "", // 部门id
        email: "", // 电子邮件
        image: "", // 头像
        imageAddress: "", // 头像地址
        name: "", // 姓名
        operator: this.$store.state.user.userId, // 操作人
        password: "", // 密码
        passwordNew: "", // 密码
        phone: "", // 手机
        remark: "", // 备注
        roleId: "", // 角色id
        sex: "1", // 性别
        status: "1", // 状态
        type: "1", // 用户类型
        managerRoute: "1",
        userName: "", // 用户名
        userNameNew: "", // 用户名
        routes: [], //线路集合
        openDoor: 2 //开门权限，1有 2无，默认无
      },
      ruleValidate: {
        userNameNew: [
          { required: true, validator: validateUserName, trigger: "blur" },
          {
            max: 20,
            message: "长度最多是20个字符",
            trigger: "blur"
          }
        ],
        passwordNew: [
          { required: true, validator: validatePassword, trigger: "blur" },
          { min: 6, max: 20, message: "密码长度6-20个字符", trigger: "blur" }
        ],
        phone: [{ required: true, validator: validatePhone, trigger: "blur" }],
        card: [{ required: true, validator: validateCard, trigger: "blur" }],
        newDeptId: [
          {
            type: "array",
            required: true,
            message: "部门不能为空",
            trigger: "blur"
          }
        ],
        roleId: [{ required: true, message: "角色不能为空" }]
      },
      loadingDep: false, //部门模态框确定按钮的延时
      isShowDep: false, // 用户弹框显示状态
      isAddDep: false, // 判断当前用户弹框是否新增
      alertvalue: null, // alert框数据
      departmentByID: {}, // 部门信息
      // 新增部门模态框表单数据
      formValidateDep: {
        channelId: this.$store.state.user.channelId, // 渠道id
        deptName: "", // 部门名称
        operator: this.$store.state.user.userId, // 操作人
        newPid: [],
        pid: "", // 父ID
        pids: "", // 父IDS
        remark: "", // 备注
        sort: 0 // 排序
      },
      ruleValidateDep: {
        deptName: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ]
      },
      deptId: "", // 部门id
      deptName: "", // 部门名称
      channelId: this.$store.state.user.channelId, // 渠道ID
      pageNum: 1, // 页码
      pageSize: 15, // 页容量
      phone: "", // 联系方式
      userName: "", // 用户名
      status: "", // 用户状态
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
          title: "用户名",
          key: "userName",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "头像",
          slot: "img",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "真实姓名",
          key: "name",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "身份证号",
          key: "card",
          align: "center",
          minWidth: 140,
          tooltip: true
        },
        {
          title: "手机号码",
          key: "phone",
          align: "center",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "邮箱",
          key: "email",
          align: "center",
          minWidth: 140,
          tooltip: true
        },
        {
          title: "所属部门",
          key: "deptName",
          align: "center",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "用户状态",
          align: "center",
          slot: "status",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "角色",
          align: "center",
          key: "roleName",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "管理分区",
          align: "center",
          slot: "userRoutes",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "创建时间",
          key: "createDate",
          align: "center",
          minWidth: 120,
          tooltip: true
        },
        {
          title: "开门权限",
          slot: "isOpen",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "操作",
          align: "center",
          slot: "operation",
          minWidth: 180,
          tooltip: true
        }
      ],
      // 数据
      dataTable: [],
      allRoleList: [] // 所有角色数据
    };
  },

  methods: {
    resetPwd(row) {
      console.log(row);
      this.newPswd = false;
      this.newPswdAgain = false;
      this.isShowPwd = true;
      this.userId = row.id;
    },
    resetPwdModal(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          if (
            this.formValidatePwd.newPasswordAgain !=
            this.formValidatePwd.newPassword
          ) {
            return this.$Message.error("两次输入密码不相同，请重新输入");
          }
          this.loading = true;
          let data = {
            id: this.userId,
            modifyType: 1,
            newPwd: this.formValidatePwd.newPasswordAgain
          };
          resetPwd(data)
            .then(res => {
              if (res.data.code == 200) {
                this.loading = false;
                this.isShowPwd = false;
                this.$Message.info("密码修改成功");
                this.getDepData(); // 重新获取数据
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
      });
    },
    changeRoute(value) {
      console.log(value);
      if (value == "2") {
        this.isShowRouteTree = true;
        this.getRouteTreeList();
      } else {
        this.isShowRouteTree = false;
        this.routeTreeList = [];
      }
    },
    render(item) {
      if (item.disabled) return `${item.key} - ${item.value}`;
      return `${item.key} - ${item.value}`;
    },
    handleChange(newTargetKeys) {
      this.targetKeys = newTargetKeys;
    },
    radioChange(value) {
      if (parseInt(value) == 1) {
        this.getUserMachineList();
      } else {
        this.transferData = [];
      }
    },
    // 去开门弹框
    toOpenModal(row) {
      this.managerRoute = row.managerRoute;
      this.userId = row.id;
      this.isShowOpen = true;
      this.openDoor = row.openDoor + "";
      if (row.openDoor == 1) {
        this.getUserMachineList();
      } else {
        this.transferData = [];
      }
    },
    // 开门权限确定按钮
    openDoorModal() {
      let data = {
        channelId: this.$store.state.user.channelId, // 渠道id
        operator: this.$store.state.user.userId, // 操作人id
        openDoor: this.openDoor, //开门权限 1有 2无
        machineCodes: this.targetKeys, //设备列表
        userId: this.userId
      };
      modifyUserMachine(data).then(res => {
        if (res.data.code == 200) {
          this.$Message.success("操作成功");
          this.isShowOpen = false;
          this.getuserManagement();
        }
      });
    },
    // 删除按钮操作
    delCancel() {
      this.modal_loading = false;
      this.modalDel = false;
    },
    del() {
      this.modal_loading = true;
      if (this.isDep) {
        delDept(this.deptId)
          .then(res => {
            if (res.data.code == 200) {
              this.modal_loading = false;
              this.modalDel = false;
              this.refresh();
              this.$Message.info("删除成功");
            } else {
              this.modal_loading = false;
              this.$Message.error(res.data.message);
            }
          })
          .catch(err => {
            this.modal_loading = false;
            this.$Message.error(res.data.message);
          });
      } else {
        delUser(this.delID)
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
      }
    },
    // 部门删除按钮操作
    delOneDep() {
      if (this.deptId == "") {
        this.$Message.error("请选择部门");
      } else {
        this.modalDel = true;
      }
    },

    // 文件大小限制
    handleMaxSize(file) {
      this.$Message.error("上传文件大于100K，请重新上传");
    },

    // 文件格式验证失败
    formtError(file, fileList) {
      this.$Message.error("上传文件类型错误");
    },
    // 文件上传失败
    onError(error) {
      this.uploadResult = false;
      this.$Message.error("上传失败");
    },
    // 文件上传成功
    imgSuccess(response, file, fileList) {
      this.uploadResult = true;
      if (response.code === 200) {
        this.$set(this.formValidate, "imageAddress", response.result.url);
        this.formValidate.image = response.result.key;
        this.$Message.success("图片上传成功");
      } else if (response.code === 500) {
        this.$Message.error(response.message);
      }
    },

    // 用户重置按钮
    reset() {
      this.phone = ""; // 联系方式
      this.userName = ""; // 用户名
      this.status = ""; // 用户状态
      this.pageNum = 1;
      this.getuserManagement();
      this.getDepData();
    },

    // 页码改变时触发
    pageChange(value) {
      this.pageNum = value;
      // 重新获取数据
      this.getuserManagement();
    },

    // 页容量改变时触发
    sizeChange(value) {
      this.pageSize = value;
      this.getuserManagement();
    },
    // 用户右上角关闭按钮
    close() {
      this.loading = false;
      this.isShow = false;
      this.isShowPwd = false;
      this.$refs.formValidate.resetFields();
      this.$refs.formValidatePwd.resetFields();
    },
    // 用户取消按钮
    cancel() {
      this.$Message.info("取消操作");
      this.loading = false;
      this.isShow = false;
      this.isShowPwd = false;
      this.$refs.formValidate.resetFields();
      this.$refs.formValidatePwd.resetFields();
    },
    // 部门模态框删除
    closeDep() {
      this.loadingDep = false;
      this.isShowDep = false;
      this.$refs.formValidateDep.resetFields();
    },
    // 部门模态框点击取消
    cancelDep() {
      this.$Message.info("取消操作");
      this.loadingDep = false;
      this.isShowDep = false;
      this.$refs.formValidateDep.resetFields();
    },

    // 部门新增点击事件
    addModalDep() {
      this.isAddDep = true;
      this.isShowDep = true;
      this.formValidateDep = {
        channelId: this.$store.state.user.channelId, // 渠道id
        deptName: "", // 部门名称
        operator: this.$store.state.user.userId, // 操作人
        newPid: [],
        pid: "", // 父ID
        pids: "", // 父IDS
        remark: "", // 备注
        sort: 0 // 排序
      };
    },

    // 用户级联选择器
    selectChange(value) {
      this.formValidate.newDeptId = value;
      this.formValidate.deptId = this.formValidate.newDeptId[
        this.formValidate.newDeptId.length - 1
      ];
      this.formValidateDep.newPid = value;
      this.formValidateDep.pids = "," + value.join(",") + ",";
      this.formValidateDep.pid = this.formValidateDep.newPid[
        this.formValidateDep.newPid.length - 1
      ];
    },

    format(labels, selectedData) {
      const index = labels.length - 1;
      const data = selectedData[index] || false;
      if (data && data.code) {
        return labels[index] + " - " + data.code;
      }
      return labels[index];
    },

    // 部门获取Dropdown下拉框数据
    async getDropdownData(name) {
      if (name == "") {
        this.$Message.error("请选择部门");
      } else if (name == this.deptId) {
        this.isAddDep = false;
        this.isShowDep = true;
        // 加载所有级联部门树数据
        // this.getDepData();
        // 查询当前部门值 选中
        await this.getsearchDepartmentByID(name);
      }
    },

    // 部门刷新按钮操作
    refresh() {
      this.deptId = "";
      this.pageNum = 1;
      this.dataTable = [];
      this.treeData = [];
      this.alertvalue = "";
      this.getDepData();
      this.getuserManagement();
      this.isDiv = false;
    },

    // 点击部门树
    pickTree(data) {
      this.alertvalue = data.title;
      this.deptId = data.id;
      this.deptName = data.title;
      this.getuserManagement();
      this.isDiv = true;
      this.isDep = true;
    },

    // 部门弹框确认的点击事件
    getDepartmentModal(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          // 对的
          this.loadingDep = true;
          if (this.isAddDep) {
            addDept(this.formValidateDep)
              .then(res => {
                if (res.data.code == 200) {
                  this.loadingDep = false;
                  this.isShowDep = false;
                  this.$Message.info("新增成功");
                  this.getDepData(); // 重新获取数据
                } else {
                  this.loadingDep = false;
                  this.$Message.error(res.data.message);
                }
              })
              .catch(err => {
                this.loadingDep = false;
                this.$Message.error(res.data.message);
              });
          } else if (!this.isAddDep) {
            if (
              this.formValidateDepStr == JSON.stringify(this.formValidateDep)
            ) {
              this.loadingDep = false;
              this.isShowDep = false;
            } else {
              editDept(this.formValidateDep)
                .then(res => {
                  if (res.data.code == 200) {
                    this.loadingDep = false;
                    this.isShowDep = false;
                    this.$Message.info("修改成功");
                    this.getDepData();
                  } else {
                    this.loadingDep = false;
                    this.$Message.error(res.data.message);
                  }
                })
                .catch(err => {
                  this.loadingDep = false;
                  this.$Message.error(res.data.message);
                });
            }
          }
        }
      });
    },

    // 新增用户点击事件
    addModal() {
      this.$Spin.show();
      this.isShowRouteTree = false;
      this.uploadResult = false;
      this.isAdd = true;
      this.ispassword = true;
      this.userId = null;
      this.getRouteTreeList();
      this.formValidate = {
        birth: null, // 出生日期
        card: null, //身份证号码
        channelId: this.$store.state.user.channelId, // 渠道id
        newDeptId: [], // 部门id
        deptId: "", // 部门id
        email: "", // 电子邮件
        image: null, // 头像
        imageAddress: null, // 头像地址
        name: "", // 姓名
        operator: this.$store.state.user.userId, // 操作人
        password: "", // 密码
        passwordNew: "", // 密码
        phone: "", // 手机
        remark: "", // 备注
        roleId: "", // 角色id
        sex: "1", // 性别
        status: "1", // 状态
        type: "1", // 类型
        managerRoute: "1",
        userName: "", // 用户
        userNameNew: "", // 用户
        routes: [], //线路集合
        openDoor: 2 //开门权限，1有 0无，默认无
      };
      setTimeout(() => {
        this.$refs.formValidate.resetFields();
      }, 1000);
      setTimeout(() => {
        this.isShow = true;
        this.$Spin.hide();
      }, 1200);
    },
    // 用户编辑点击事件
    async editModal(row) {
      console.log(row);
      this.uploadResult = true;
      this.isAdd = false;
      this.isShow = true;
      this.ispassword = false;
      this.userId = row.id;
      this.formValidate = JSON.parse(JSON.stringify(row));
      this.formValidate.userNameNew = this.formValidate.userName;
      this.formValidate.password = null;
      row.status == "1" ? (this.isStatus = "1") : (this.isStatus = "2");
      this.formValidate.status = row.status + "";
      this.formValidate.sex = row.sex + "";
      this.formValidate.managerRoute = row.managerRoute + "";
      if (this.formValidate.managerRoute == "1") {
        this.isShowRouteTree = false;
        this.formValidate.routes = [];
      } else {
        this.isShowRouteTree = true;
        await searchRouteTreeByChannelId(this.channelId, this.userId).then(
          res => {
            if (res.data.code == 200) {
              this.routeTreeList = res.data.result;
            }
          }
        );
        this.formValidate.routes = this.$refs.treeData
          .getCheckedNodes()
          .map(i => i.id);
      }
      // 根据用户id查询角色
      await searchRoleByUserId(row.id).then(res => {
        if (res.data.code == 200) {
          let roleId = res.data.result[0].roleId;
          this.getAllRoleByChannelId(roleId);
          this.formValidate.roleId = roleId;
        }
      });
      await this.getDepData();
      // 根据部门id查询部门信息
      await searchDeptById(this.formValidate.deptId).then(res => {
        if (res.data.code == 200) {
          var strPids = res.data.result.pids + "," + res.data.result.id;
          var array = strPids.split(",");
          var array2 = [];
          // 字符串数组 转数字数组
          array.forEach(function(data, index) {
            array2[index] = parseInt(data);
          });
          this.formValidate.newDeptId = array2;
        }
      });
      this.formValidateStr = await JSON.stringify(this.formValidate);
    },

    // 用户弹框确认的点击事件
    getUserManagementModal(name) {
      if (this.formValidate.managerRoute == "1") {
        this.formValidate.routes = [];
      } else {
        let ary = this.$refs.treeData.getCheckedNodes();
        this.formValidate.routes = ary.map(i => i.id);
      }
      this.isStatus == "1"
        ? (this.formValidate.status = "1")
        : (this.formValidate.status = "2");
      this.formValidate.userName = this.formValidate.userNameNew;
      this.$refs[name].validate(valid => {
        if (valid) {
          this.loading = true;
          if (this.isAdd) {
            // 对的
            this.formValidate.password = this.formValidate.passwordNew;
            addUser(this.formValidate)
              .then(res => {
                if (res.data.code == 200) {
                  this.loading = false;
                  this.isShow = false;
                  this.$Message.info("新增成功");
                  this.getuserManagement(); // 重新获取数据
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
              this.loading = false;
              this.isShow = false;
            } else {
              this.formValidate.userRouteVos = [];
              editUser(this.formValidate)
                .then(res => {
                  if (res.data.code == 200) {
                    this.loading = false;
                    this.isShow = false;
                    this.$Message.info("修改成功");
                    this.getuserManagement();
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
    searchuserManagement() {
      this.pageNum = 1;
      this.getuserManagement();
    },
    // 获取用户信息
    getuserManagement() {
      let data = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        phone: this.phone,
        userName: this.userName,
        status: this.status,
        channelId: this.channelId,
        deptId: this.deptId
      };
      searchUser(data).then(res => {
        if (res.data.code == 200) {
          this.dataTable = res.data.result.list;
          this.total = res.data.result.total;
          this.pageNum = res.data.result.pageNum;
          this.dataTable.forEach(item => {
            let ary = [];
            if (item.userRouteVos != null) {
              item.userRouteVos.forEach(v => {
                ary.push(v.label);
                v.routerStr = ary.join("/");
              });
            }
            item.routerStr = ary.join("/");
          });
        }
      });
    },

    // 查询渠道商的所有角色
    getAllRoleByChannelId(row) {
      searchRoleByChannelId(this.channelId).then(res => {
        if (res.data.code == 200) {
          this.allRoleList = res.data.result;
          this.formValidate.roleId = row;
        }
      });
    },

    // 根据id查询部门信息
    getsearchDepartmentByID() {
      searchDeptById(this.deptId).then(res => {
        if (res.data.code == 200) {
          this.departmentByID = res.data.result;
          this.formValidateDep = res.data.result;
          var strPids = res.data.result.pids + "," + res.data.result.id;
          var array = strPids.split(",");
          var array2 = [];
          // 字符串数组 转数字数组
          array.forEach(function(data, index) {
            array2[index] = parseInt(data);
          });
          this.formValidateDep.newPid = array2;
          this.formValidateDepStr = JSON.stringify(this.formValidateDep);
        }
      });
    },

    // 获取部门树
    getDepData() {
      searchDeptBychannelId(this.channelId).then(res => {
        if (res.data.code == 200) {
          this.treeData = res.data.result;
          this.depData = this.forData(res.data.result);
        }
      });
    },

    // 获取设备列表
    getUserMachineList() {
      searchUserMachineList({
        channelId: this.channelId,
        userId: this.userId,
        managerRoute: this.managerRoute
      }).then(res => {
        if (res.data.code == 200) {
          this.transferData = res.data.result.data;
          this.targetKeys = res.data.result.targetKeys;
          res.data.result.data.forEach((item, index) => {
            item.value = item.label;
            item.label = item.key + item.value;
          });
        }
      });
    },
    // 根据渠道id查询线路树形列表
    getRouteTreeList() {
      searchRouteTreeByChannelId(this.channelId, this.userId).then(res => {
        if (res.data.code == 200) {
          this.routeTreeList = res.data.result;
        }
      });
    },
    // 递归拿到级联数据
    forData(array) {
      var ary = [];
      for (var i = 0; i < array.length; i++) {
        ary[i] = {};
        ary[i].value = array[i].value;
        ary[i].label = array[i].label;
        if (array[i].children) {
          ary[i].children = this.forData(array[i].children);
        }
      }
      return ary;
    }
  },
  filters: {
    userRouteVosText(value) {
      let str = "";
      value.forEach((v, i) => {
        str += v.label + "/";
      });
      let str2 = str.slice(0, str.length - 1);
      if (str2.length > 8) {
        return str2.slice(0, 8) + "...";
      }
      return str2;
    }
  },
  mounted() {
    this.getuserManagement();
    this.getDepData();
    this.getAllRoleByChannelId();
  }
};
</script>
<style lang="less" scoped>
.leftBox {
  // min-width: 250px;
  min-height: 900px;
  float: left;
  margin-right: 20px;
}
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
.uploadImg {
  width: 50px;
  height: 50px;
  border-radius: 2px;
  margin-right: 10px;
  vertical-align: bottom;
}
.ivu-upload {
  display: inline-block;
  vertical-align: middle;
}
.ivu-form-item {
  margin-bottom: 20px;
}
.imgstyle {
  width: 50px;
  height: 50px;
  margin: 5px 5px 0px 5px;
  box-sizing: border-box;
}

#header_image {
  margin-left: -100px;
  margin-right: 20px;
  float: right;
}
.lookDetails {
  text-decoration: underline;
}
.routesTree {
  border: 1px solid #c1c1c1;
  width: 300px;
  padding-left: 20px;
  margin-left: 100px;
}
.contentBox {
  /deep/ .ivu-input-wrapper {
    width: 100%;
  }
}
</style>
