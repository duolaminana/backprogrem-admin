<style lang="less" scoped>
#register-ent {
  .ivu-input-wrapper {
    width: 250px !important;
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
  .ivu-cascader {
    width: 250px;
  }
  .receivablesInfo {
    display: inline-block;
    margin-right: 20px;
  }
  .foot {
    height: 160px;
    .check-text {
      color: rgb(134, 134, 134);
      font-size: 10px;
    }
    .attestation {
      float: left;
      width: 100%;
    }
    .ivu-form-item-content {
      margin-left: 0px !important;
      line-height: 20px;
    }
  }
  .submitBotton {
    width: 660px;
    margin-top: 40px;
    /deep/ .ivu-form-item-content {
      margin-left: 0px !important;
    }
  }
  .card_image {
    text-align: center;
    width: 120px;
    height: 100px;
    margin-top: 10px;
    margin-right: 10px;
    /deep/ .ivu-form-item-content {
      margin-left: 0px !important;
      line-height: 24px;
    }
    /deep/ .ivu-form-item-error-tip {
      margin-left: 25%;
    }
    /deep/.ivu-upload-list-file-finish {
      display: none;
    }
    #exampleImg {
      background: url("../../assets/images/example.png") no-repeat 0px 0px;
      width: 662px;
      height: 317px;
      position: absolute;
      bottom: 20px;
      z-index: 22;
      border: 2px solid green;
      display: none;
    }
    .example:hover #exampleImg {
      display: block;
    }
  }
  .card {
    .ivu-form-item-label {
      margin-top: -5px;
    }
  }
  .cascader {
    /deep/.ivu-input-wrapper-default {
      width: 250px;
    }
  }
}
</style>

<template>
  <div id="register-ent">
    <Form
      ref="registerEnt"
      :model="form"
      :rules="ruleValidate"
      @keydown.enter.native="handleSubmit"
      inline
      :label-width="75"
    >
      <div style="margin-bottom:10px">
        <strong>公司信息</strong>
      </div>
      <FormItem prop="channelName" label="公司名称" style="margin-bottom:20px">
        <Input v-model.trim="form.channelName" placeholder="请输入公司名称"></Input>
      </FormItem>
      <FormItem prop="name" label="法人姓名" style="margin-bottom:20px">
        <Input :maxlength="30" v-model.trim="form.name" placeholder="请输入法人姓名"></Input>
      </FormItem>
      <FormItem prop="phone" label="手机号码" style="margin-bottom:20px">
        <Input
          :maxlength="11"
          v-model.trim="form.phone"
          placeholder="请输入手机号码"
          @on-blur="checkPhone"
        ></Input>
      </FormItem>
      <FormItem prop="companyNo" label="公司税号" style="margin-bottom:20px">
        <Input :maxlength="20" v-model.trim="form.companyNo" placeholder="税号由15位.18位或20位组成"></Input>
      </FormItem>
      <FormItem prop="NewareaNames" label="所在区域" style="margin-bottom:20px;width:325px">
        <Cascader
          placeholder="请选择所在区域"
          class="cascader"
          :data="cityData"
          v-model="form.NewareaNames"
          @on-change="selectChange"
          :render-format="format"
          change-on-select
        ></Cascader>
      </FormItem>
      <FormItem prop="address" label="详细地址" style="margin-bottom:20px">
        <Input v-model.trim="form.address" placeholder="请输入详细地址"></Input>
      </FormItem>
      <FormItem prop="sale" label="销售范围" style="margin-bottom:20px">
        <Select
          placeholder="请选择销售范围"
          v-model="form.sale"
          multiple
          style="width:585px"
          @on-change="saleChange"
        >
          <Option v-for="item in saleList" :label="item.label" :value="item.value" :key="item.id"></Option>
        </Select>
      </FormItem>
      <div style="margin-bottom:10px">
        <strong class="receivablesInfo">收款信息</strong>
        <!-- <RadioGroup v-model="isReceiveType">
          <Radio label="1">
            <span>支付宝</span>
          </Radio>
          <Radio label="2">
            <span>银行卡</span>
          </Radio>
        </RadioGroup>-->
      </div>
      <FormItem prop="receiveName" label="收款人" style="margin-bottom:20px">
        <Input :maxlength="30" v-model.trim="form.receiveName" placeholder="请输入收款人姓名"></Input>
      </FormItem>
      <FormItem prop="receiveCard" class="card" label="收款人身份证号码" style="margin-bottom:10px">
        <Input :maxlength="18" v-model.trim="form.receiveCard" placeholder="请输入收款人18位身份证号码"></Input>
      </FormItem>
      <FormItem
        prop="receiveAccount"
        :label="this.isReceiveType==2?'收款账号':'支付宝账号'"
        style="margin-bottom:20px"
      >
        <Input
          :maxlength="30"
          v-model="form.receiveAccount"
          placeholder="请输入收款人收款账号"
          @on-blur="getBank"
        ></Input>
      </FormItem>
      <FormItem
        prop="receiveBank"
        label="开户行"
        v-show="this.isReceiveType=='2'?true:false "
        style="margin-bottom:20px"
      >
        <Input v-model.trim="form.receiveBank" placeholder="请输入开户行名称"></Input>
      </FormItem>
      <div style="margin-bottom:10px">
        <strong>商户信息</strong>
      </div>
      <FormItem prop="userNameNew" label="用户名称" style="margin-bottom:20px">
        <Input
          name="namepl"
          type="text"
          :maxlength="30"
          v-model.trim="form.userNameNew"
          placeholder="小于20个字符"
          @on-blur="checkUserName"
        ></Input>
        <Input v-model="form.userName" type="text" style="opacity: 0;position: absolute"></Input>
      </FormItem>
      <FormItem prop="passwordNew" label="密码" style="margin-bottom:20px">
        <Input v-model="form.password" type="password" style="opacity: 0;position: absolute"></Input>
        <Input
          name="psdpl"
          :maxlength="30"
          v-model.trim="form.passwordNew"
          :type="pswd?'text':'password'"
          placeholder="字母+数字组合,大于6小于20个字符"
        >
          <Icon @click.native="pswd=!pswd" :type="pswd?'md-eye-off':'md-eye'" slot="suffix" />
        </Input>
      </FormItem>
      <div class="foot">
        <div class="attestation">
          <strong>资质认证</strong>
          <div class="check-text">(上传图片的大小不能超过2M，推荐格式:png / jpg)</div>
          <FormItem label prop="licenseAddress" class="card_image">
            <template>
              <Upload
                :action="Upload"
                name="multipartFile"
                :format="['jpg','jpeg','png']"
                :max-size="2048"
                :on-exceeded-size="handleMaxSize"
                :on-format-error="formtError"
                :on-error="onError"
                :on-success="licenseSuccess"
                style="text-align: center"
              >
                <img
                  :src="form.licenseAddress"
                  style="width:120px;height:100px;margin-top:10px"
                  class="uploadImg"
                  v-if="uploadResult"
                />

                <div style="padding-top: 10px" v-if="!uploadResult">
                  <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                  <p>营业执照(三证合一)</p>
                  <p></p>
                </div>
              </Upload>
            </template>
          </FormItem>
          <FormItem label prop="openAccountAddress" class="card_image">
            <template>
              <Upload
                :action="Upload"
                name="multipartFile"
                :format="['jpg','jpeg','png']"
                :max-size="2048"
                :on-exceeded-size="handleMaxSize"
                :on-format-error="formtError"
                :on-error="onError"
                :on-success="openAccountSuccess"
              >
                <img
                  :src="form.openAccountAddress"
                  style="width:120px;height:100px;margin-top:10px"
                  class="uploadImg"
                  v-if="openAccountResult"
                />

                <div style="padding-top: 10px" v-if="!openAccountResult">
                  <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                  <p>开户许可证</p>
                </div>
              </Upload>
            </template>
          </FormItem>
          <FormItem label prop="frontAddress" class="card_image">
            <template>
              <Upload
                :action="Upload"
                name="multipartFile"
                :format="['jpg','jpeg','png']"
                :max-size="2048"
                :on-exceeded-size="handleMaxSize"
                :on-format-error="formtError"
                :on-error="onError"
                :on-success="cardFrontSuccess"
              >
                <img
                  :src="form.frontAddress"
                  style="width:120px;height:100px;margin-top:10px"
                  class="uploadImg"
                  v-if="uploadFrontResult"
                />

                <div style="padding-top: 10px" v-if="!uploadFrontResult">
                  <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                  <p>手持身份证正面</p>
                  <a class="example">
                    查看示例
                    <div id="exampleImg" style="left:-260px"></div>
                  </a>
                </div>
              </Upload>
            </template>
          </FormItem>
          <FormItem label prop="backAddress" class="card_image">
            <template>
              <Upload
                :action="Upload"
                name="multipartFile"
                :format="['jpg','jpeg','png']"
                :max-size="2048"
                :on-exceeded-size="handleMaxSize"
                :on-format-error="formtError"
                :on-error="onError"
                :on-success="cardBackSuccess"
              >
                <img
                  :src="form.backAddress"
                  style="width:120px;height:100px;margin-top:10px "
                  class="uploadImg"
                  v-if="uploadBackResult"
                />

                <div style="padding-top: 10px" v-if="!uploadBackResult">
                  <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                  <p>手持身份证反面</p>
                  <a class="example">
                    查看示例
                    <div id="exampleImg" style="left:-390px"></div>
                  </a>
                </div>
              </Upload>
            </template>
          </FormItem>
          <FormItem label prop="otherAddress" class="card_image">
            <template>
              <Upload
                :action="Upload"
                name="multipartFile"
                :format="['jpg','jpeg','png']"
                :max-size="2048"
                :on-exceeded-size="handleMaxSize"
                :on-format-error="formtError"
                :on-error="onError"
                :on-success="otherSuccess"
              >
                <img
                  :src="form.otherAddress"
                  style="width:120px;height:100px;margin-top:10px"
                  class="uploadImg"
                  v-if="otherResult"
                />

                <div style="padding-top: 10px" v-if="!otherResult">
                  <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                  <p>其他</p>
                </div>
              </Upload>
            </template>
          </FormItem>
        </div>
      </div>
      <FormItem class="submitBotton">
        <Button @click="handleSubmit" type="primary" long>提交审核</Button>
      </FormItem>
    </Form>
  </div>
</template>
<script>
import { cityData } from "@/api/cityData";
import {
  productType,
  searchBank,
  addChannelApply,
  Upload,
  getFastCheck
} from "@/api/http";
export default {
  name: "registerPperson",
  props: {
    uploadResult: {
      //营业执照显示方式
      default: false
    },
    openAccountResult: {
      //开户许可证显示方式
      default: false
    },
    uploadFrontResult: {
      //身份证正面显示方式
      default: false
    },
    uploadBackResult: {
      //身份证反面显示方式
      default: false
    },
    otherResult: {
      //其他显示方式
      default: false
    }
  },
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
        callback(new Error("密码请用数字和字母组合"));
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
    const validateCompanyNo = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("输入不能为空"));
      } else if (
        !/^([0-9a-zA-Z]{15}|[0-9a-zA-Z]{18}|[0-9a-zA-Z]{20})$/.test(value)
      ) {
        callback(new Error("公司税号格式错误"));
      } else {
        callback();
      }
    };
    const validateReceiveAccount = (rule, value, callback) => {
      let val = value.replace(/\s+/g, "");
      if (!val) {
        return callback(new Error("输入不能为空"));
      } else if (!/^(\d{15}|\d{16}|\d{17}|\d{19})$/.test(val)) {
        callback(new Error("收款账号格式错误"));
      } else {
        callback();
      }
    };

    return {
      checkType: null, //1用户名2手机号
      checkParam: null,
      pswd: false, //密码显示方式
      isReceiveType: "2", //全局收款方式变量
      saleList: [], //销售范围
      Upload, // 上传文件地址
      cityData,
      // 表单数据
      form: {
        receiveTerminal: 1, //是否开启收款码，默认不开启
        receiveName: "", //收款人姓名
        receiveBank: "", //开户行
        receiveCard: "", //收款人身份证号
        card: "", // 身份证号码
        receiveAccount: "", //收款账户
        // recAccount:"",//收款账户替换
        receiveType: "2", //收款方式
        businessScope: "", //经营范围
        sale: [], //销售范围
        NewareaNames: [], // 级联数据
        accountType: 2, // 注册类型
        address: "", // 详细地址
        areaIds: "", // 区域ids
        areaNames: "", // 区域names
        auditStatus: 2, // 审核状态
        sourceType: 1, // 数据来源
        license: null, // 营业执照
        licenseAddress: null, // 营业执照地址
        openAccount: null, //开户许可证
        openAccountAddress: null, //开户许可证地址
        cardFront: null, // 身份证正面
        frontAddress: null, // 身份证正面地址
        cardBack: null, // 身份证反面
        backAddress: null, // 身份证反面地址
        other: null, //其他
        otherAddress: null, //其他地址
        channelName: "", //渠道名称
        companyName: "", // 公司名称
        companyNo: "", // 社会统一信用代码
        name: "", // 姓名
        parentId: "1", // 父渠道id
        parentIds: ",1,", //父渠道pids
        operator: "1", // 操作人
        password: "", // 密码
        passwordNew: "",
        phone: "", // 手机
        userName: "", // 用户名
        userNameNew: "",
        remark: "" //备注
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
        receiveCard: [
          { required: true, validator: validateCard, trigger: "blur" }
        ],
        sale: [
          {
            type: "array",
            required: true,
            message: "请选择销售范围",
            trigger: "blur"
          }
        ],
        licenseAddress: [
          {
            required: true,
            message: "请上传图片",
            trigger: "change"
          }
        ],
        openAccountAddress: [
          {
            required: true,
            message: "请上传图片",
            trigger: "change"
          }
        ],
        frontAddress: [
          {
            required: true,
            message: "请上传图片",
            trigger: "change"
          }
        ],
        backAddress: [
          {
            required: true,
            message: "请上传图片",
            trigger: "change"
          }
        ],
        channelName: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        companyNo: [
          { required: true, validator: validateCompanyNo, trigger: "blur" }
        ],
        name: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          },
          { max: 10, message: "最多输入10个字符", trigger: "blur" }
        ],
        receiveName: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        receiveAccount: [
          { required: true, validator: validateReceiveAccount, trigger: "blur" }
        ],
        receiveBank: [
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
    checkPhone(event) {
      this.checkType = 2;
      this.checkParam = event.target.value;
      this.searchFastCheck();
    },
    checkUserName(event) {
      this.checkType = 1;
      this.checkParam = event.target.value;
      this.searchFastCheck();
    },
    // 用户级联选择器
    selectChange(value) {
      this.form.areaIds = value;
      this.form.areaIds = value.join(",");
    },
    format(labels) {
      return labels.join("/");
      this.form.NewareaNames = labels;
      this.form.areaNames = this.form.NewareaNames.join(",");
    },

    // 经营范围改变
    saleChange(value) {
      this.form.businessScope = value.join(",");
    },
    // 文件大小限制
    handleMaxSize(file) {
      this.$Message.error("上传文件大于2M，请重新上传");
    },
    // 文件格式验证失败
    formtError(file, fileList) {
      this.$Message.error("上传文件类型错误");
    },
    // 文件上传失败
    onError(error) {
      this.$emit("update:uploadResult", false);
      this.$emit("update:openAccountResult", false);
      this.$emit("update:uploadFrontResult", false);
      this.$emit("update:uploadBackResult", false);
      this.$emit("update:otherResult", false);
      this.$Message.error("上传失败");
    },
    // 营业执照文件上传成功
    licenseSuccess(response, file, fileList) {
      this.$emit("update:uploadResult", true);
      if (response.code === 200) {
        this.$set(this.form, "licenseAddress", response.result.url);
        this.form.license = response.result.key;
        this.$Message.success("图片上传成功");
      } else if (response.code === 500) {
        this.$Message.error(response.message);
      }
    },
    // 开户许可证文件上传成功
    openAccountSuccess(response, file, fileList) {
      this.$emit("update:openAccountResult", true);
      if (response.code === 200) {
        this.$set(this.form, "openAccountAddress", response.result.url);
        this.form.openAccount = response.result.key;
        this.$Message.success("图片上传成功");
      } else if (response.code === 500) {
        this.$Message.error(response.message);
      }
    },
    // 身份证正面文件上传成功
    cardFrontSuccess(response, file, fileList) {
      this.$emit("update:uploadFrontResult", true);
      if (response.code === 200) {
        this.$set(this.form, "frontAddress", response.result.url);
        this.form.cardFront = response.result.key;
        this.$Message.success("图片上传成功");
      } else if (response.code === 500) {
        this.$Message.error(response.message);
      }
    },
    // 身份证反面文件上传成功
    cardBackSuccess(response, file, fileList) {
      this.$emit("update:uploadBackResult", true);
      if (response.code === 200) {
        this.$set(this.form, "backAddress", response.result.url);
        this.form.cardBack = response.result.key;
        this.$Message.success("图片上传成功");
      } else if (response.code === 500) {
        this.$Message.error(response.message);
      }
    },
    // 其他类型文件上传成功
    otherSuccess(response, file, fileList) {
      this.$emit("update:otherResult", true);
      if (response.code === 200) {
        this.$set(this.form, "otherAddress", response.result.url);
        this.form.other = response.result.key;
        this.$Message.success("图片上传成功");
      } else if (response.code === 500) {
        this.$Message.error(response.message);
      }
    },

    handleSubmit() {
      this.$refs.registerEnt.validate(valid => {
        if (valid) {
          // this.isReceiveType == "1"
          //   ? (this.form.receiveType = 1)
          //   : (this.form.receiveType = 2);
          this.form.userName = this.form.userNameNew;
          this.form.password = this.form.passwordNew;
          this.form.areaNames = this.form.NewareaNames.join(",");
          this.form.companyName = this.form.channelName;
          this.form.card = this.form.receiveCard;
          addChannelApply(this.form).then(res => {
            if (res.data.code == 200) {
              //展示注册完成通知,跳转页面
              this.$router.push("registerover");
            }
          });
        }
      });
    },
    // 查询基础商品类型数据
    getProductType() {
      productType().then(res => {
        if (res.data.code == 200) {
          this.saleList = res.data.result;
        }
      });
    },
    // 获取开户行
    getBank(event) {
      this.form.receiveAccount = event.target.value
        .split(" ")
        .join("")
        .trim();
      searchBank(this.form.receiveAccount).then(res => {
        if (res.data.code == 200) {
          this.form.receiveBank = res.data.result;
        }
      });
    },
    // 检查校验
    searchFastCheck() {
      getFastCheck(this.checkParam, this.checkType).then(res => {
        if (res.data.code == 200) {
          if (!res.data.result) {
            if (this.checkType == 1) {
              this.$Message.error("用户名已存在，请重新输入");
              this.form.userName = null;
            } else if (this.checkType == 2) {
              this.$Message.error("电话号码已存在，请重新输入");
              this.form.phone = null;
            }
          }
        }
      });
    }
  },
  mounted() {
    this.getProductType();
    this.$Spin.show();
    setTimeout(() => {
      this.$refs.registerEnt.resetFields();
    }, 1000);
    setTimeout(() => {
      this.$Spin.hide();
    }, 1200);
  }
};
</script>
