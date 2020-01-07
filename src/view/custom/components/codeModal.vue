<template>
  <div class="QRcodeModal">
    <!-- 收钱码弹框的模态框 -->
    <Modal v-model="isQRShow" :mask-closable="false" width="800" :closable="false">
      <div slot="header">
        <p>收款账户配置</p>
        <Icon type="md-close" size="20" color="#515a6e" class="icon" @click="cancel" />
      </div>
      <div class="alertText">提示：两种账户均可选择，也可二选一</div>
      <div class="content">
        <div class="weixin-pay">
          <div class="title">
            <img src="@/assets/images/weixin.jpg" alt />
            <span>微信支付配置</span>
            <span v-if="formValidateWX.auditType==1" style="color:#ffbd72">（待审核）</span>
            <span v-if="formValidateWX.auditType==2" style="color:#19be6b">（审核通过）</span>
            <Tooltip max-width="200">
              <div slot="content">{{formValidateWX.remark}}</div>
              <span v-if="formValidateWX.auditType==3" style="color:#ed4014">（审核失败）</span>
            </Tooltip>
            <Button
              v-if="((!idWX&&formValidateWX.auditType!=1)||formValidateWX.configStat==2)"
              type="primary"
              size="small"
              class="toButton"
              @click="toStartWX"
            >去启用</Button>
            <Button
              v-if="idWX&&formValidateWX.auditType!=1&&formValidateWX.configStat==1"
              type="error"
              size="small"
              class="toButton"
              @click="toEndWX"
            >禁用</Button>
          </div>
          <div>
            <Form
              ref="formValidateWX"
              :model="formValidateWX"
              :rules="ruleValidateWX"
              :label-width="120"
            >
              <FormItem label="AppID" prop="appId">
                <Input v-model="formValidateWX.appId" placeholder="AppID" :disabled="isdisabledWX"></Input>
              </FormItem>
              <FormItem label="AppSecret" prop="payKey">
                <Input
                  v-model="formValidateWX.payKey"
                  placeholder="AppSecret"
                  :disabled="isdisabledWX"
                  type="textarea"
                  :autosize="{minRows: 1,maxRows: 3}"
                ></Input>
              </FormItem>
              <FormItem label="商户号" prop="merchantId">
                <Input
                  v-model="formValidateWX.merchantId"
                  placeholder="商户号"
                  :disabled="isdisabledWX"
                ></Input>
              </FormItem>
              <FormItem label="商户名称" prop="merchantName">
                <Input
                  v-model="formValidateWX.merchantName"
                  placeholder="商户名称"
                  :disabled="isdisabledWX"
                ></Input>
              </FormItem>
              <FormItem label="p12证书" prop="paySecret" class="wxP12">
                <template>
                  <div class="ivu-upload-list">{{formValidateWX.paySecret}}</div>
                  <Upload
                    :show-upload-list="false"
                    style="display:inline-block"
                    ref="upload"
                    name="multipartFile"
                    :action="Upload"
                    :format="['p12']"
                    :on-format-error="formtFileError"
                    :on-error="onError"
                    :on-success="formtFileSuccess"
                  >
                    <Button type="primary" :disabled="isdisabledWX">选择</Button>
                  </Upload>
                </template>
              </FormItem>
            </Form>
          </div>
        </div>
        <div class="zhifubao-pay">
          <div class="title">
            <img src="@/assets/images/zhifubao.jpg" alt />
            <span>支付宝配置</span>
            <span v-if="formValidateZFB.auditType==1" style="color:#ffbd72">（待审核）</span>
            <span v-if="formValidateZFB.auditType==2" style="color:#19be6b">（审核通过）</span>
            <Tooltip max-width="200">
              <div slot="content">{{formValidateZFB.remark}}</div>
              <span v-if="formValidateZFB.auditType==3" style="color:#ed4014">（审核失败）</span>
            </Tooltip>
            <Button
              v-if="((!idZFB&&formValidateZFB.auditType!=1)||formValidateZFB.configStat==2)"
              type="primary"
              size="small"
              class="toButton"
              @click="toStartZFB"
            >去启用</Button>
            <Button
              v-if="idZFB&&formValidateZFB.auditType!=1&&formValidateZFB.configStat==1"
              type="error"
              size="small"
              class="toButton"
              @click="toEndZFB"
            >禁用</Button>
          </div>
          <div>
            <Form
              ref="formValidateZFB"
              :model="formValidateZFB"
              :rules="ruleValidateZFB"
              :label-width="120"
            >
              <FormItem label="AppID" prop="appId">
                <Input
                  v-model="formValidateZFB.appId"
                  placeholder="AppID"
                  :disabled="isdisabledZFB"
                ></Input>
              </FormItem>
              <FormItem label="PID" prop="merchantId">
                <Input
                  v-model="formValidateZFB.merchantId"
                  placeholder="PID"
                  :disabled="isdisabledZFB"
                ></Input>
              </FormItem>
              <FormItem label="商户名称" prop="merchantName">
                <Input
                  v-model="formValidateZFB.merchantName"
                  placeholder="商户名称"
                  :disabled="isdisabledZFB"
                ></Input>
              </FormItem>
              <FormItem label="商户私钥" prop="paySecret">
                <Input
                  v-model="formValidateZFB.paySecret"
                  placeholder="商户私钥"
                  :disabled="isdisabledZFB"
                  type="textarea"
                  :autosize="{minRows: 1,maxRows: 3}"
                ></Input>
              </FormItem>
              <FormItem label="支付宝公钥" prop="payKey">
                <Input
                  v-model="formValidateZFB.payKey"
                  placeholder="支付宝公钥"
                  :disabled="isdisabledZFB"
                  type="textarea"
                  :autosize="{minRows: 1,maxRows: 3}"
                ></Input>
              </FormItem>
            </Form>
          </div>
        </div>
      </div>
      <div slot="footer" class="foot">
        <div class="footerWX" style="width:50%;display:inline-block;padding-right:30px">
          <Button
            v-if="isSaveWX&&this.formValidateWX.auditType!=1"
            type="primary"
            :disabled="isdisabledWX"
            :loading="loadingWX"
            @click="WXQRModal('formValidateWX')"
          >保存</Button>
          <Button
            v-if="!isSaveWX&&formValidateWX.auditType!=1"
            type="primary"
            @click="editModalWX"
          >编辑</Button>
          <Button v-if="formValidateWX.auditType==1" disabled>待审核...</Button>
        </div>
        <div class="footerZFB" style="width:50%;display:inline-block;padding-right:30px">
          <Button
            v-if="isSaveZFB&&formValidateZFB.auditType!=1"
            type="primary"
            :disabled="isdisabledZFB"
            :loading="loadingZFB"
            @click="ZFBQRModal('formValidateZFB')"
          >保存</Button>
          <Button
            v-if="!isSaveZFB&&formValidateZFB.auditType!=1"
            type="primary"
            @click="editModalZFB"
          >编辑</Button>
          <Button v-if="formValidateZFB.auditType==1" disabled>待审核...</Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
import { addQRcode, editQRcode, searchQRcodeByChannelId } from "@/api/http";
import { Upload } from "@/api/data";
import store from "@/store";
export default {
  name: "QRcodeModal",
  props: {
    //收钱码模态框显示方式
    loadingWX: { default: false },
    loadingZFB: { default: false },
    isQRShow: { default: false },
    //微信保存编辑显示方式
    isSaveWX: { default: true },
    //支付宝保存编辑显示方式
    isSaveZFB: { default: true },
    auditType: { default: null, type: Number },
  },
  data() {
    return {
      strWX: "",
      strZFB: "",
      idWX: "",
      idZFB: "",
      channelId: store.state.user.channelId, //渠道id
      QRcodeList: [], //渠道收钱码列表
      Upload,
      isdisabledWX: true, //微信模态框可操作模式
      isdisabledZFB: true, //支付宝模态框可操作模式
      // 模态框微信表单数据
      formValidateWX: {
        configStat: "", //配置状态 1启用 2禁用,默认禁用
        appId: "", //微信appid
        payKey: "", //微信key
        merchantId: "", //微信商户id
        merchantName: "", //商户名称
        paySecret: "", //微信p12证书
        auditType: "", //审核状态 1 待审核 2 审核成功 3 审核失败
        channelId: store.state.user.channelId, //渠道id
        operator: store.state.user.userId, //操作人
        payType: 1, //支付类型 1 微信 2支付宝
        remark: "" //备注
      },
      ruleValidateWX: {
        appId: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        payKey: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        merchantId: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        merchantName: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        paySecret: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ]
      },
      // 模态框支付宝表单数据
      formValidateZFB: {
        configStat: "", //配置状态 1启用 2禁用,默认禁用
        appId: "", //支付宝appid
        merchantId: "", //支付宝的商户id
        merchantName: "", //商户名称
        paySecret: "", //支付宝私钥
        payKey: "", //支付宝公钥
        auditType: "", //审核状态 1 待审核 2 审核成功 3 审核失败
        channelId: store.state.user.channelId, //渠道id
        operator: store.state.user.userId, //操作人
        payType: 2, //支付类型 1 微信 2支付宝
        remark: "" //备注
      },
      ruleValidateZFB: {
        appId: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        merchantId: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        merchantName: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        paySecret: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        payKey: [
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
    // 微信p12上传类型错误提示
    formtFileError(file, fileList) {
      this.$Message.error("上传文件类型错误");
    },
    // 文件上传失败
    onError(error) {
      this.$Message.error("上传失败");
    },
    // 微信p12上传成功
    formtFileSuccess(response, file, fileList) {
      if (response.code === 200) {
        this.$set(this.formValidateWX, "paySecret", response.result.url);
        // this.formValidateWX.wxP12 = response.result.key;
        this.$Message.success("文件上传成功");
      } else if (response.code === 500) {
        this.$Message.error(response.message);
      }
    },
    // 叉叉关闭
    cancel() {
      this.$emit("update:isQRShow", false);
      this.isdisabledWX = true;
      this.isdisabledZFB = true;
      this.$refs.formValidateWX.resetFields();
      this.$refs.formValidateZFB.resetFields();
      this.getQRcodeByChannelId();
    },
    // 去禁用微信
    async toEndWX() {
      this.isdisabledWX = true;
      this.formValidateWX.auditType = null;
      this.formValidateWX.configStat = 2;
      await editQRcode(this.formValidateWX).then(res => {
        if (res.data.code == 200) {
          this.$Message.info("微信支付禁用成功");
          this.$emit("update:isSaveWX", true);
        }
      });
    },
    // 去启用微信
    toStartWX() {
      this.isdisabledWX = false;
      this.$emit("update:isSaveWX", true);
    },
    // 去禁用支付宝
    async toEndZFB() {
      this.isdisabledZFB = true;
      this.formValidateZFB.auditType = null;
      this.formValidateZFB.configStat = 2;
      await editQRcode(this.formValidateZFB).then(res => {
        if (res.data.code == 200) {
          this.$Message.info("支付宝禁用成功");
          this.$emit("update:isSaveZFB", true);
        }
      });
    },
    // 去启用支付宝
    toStartZFB() {
      this.isdisabledZFB = false;
      this.$emit("update:isSaveZFB", true);
    },
    // 编辑微信
    editModalWX() {
      this.isdisabledWX = false;
      this.$emit("update:isSaveWX", true);
      this.strWX = JSON.stringify(this.formValidateWX);
    },
    // 编辑支付宝
    editModalZFB() {
      this.isdisabledZFB = false;
      this.$emit("update:isSaveZFB", true);
      this.strZFB = JSON.stringify(this.formValidateZFB);
    },
    // 微信收钱码
    WXQRModal(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.$emit("update:loadingWX", true);
          // 新增
          if (this.formValidateWX.id == null) {
            this.formValidateWX.auditType = 1;
            this.formValidateWX.configStat = 1;
            addQRcode(this.formValidateWX)
              .then(res => {
                if (res.data.code == 200) {
                  this.isdisabledWX = true;
                  this.$emit("update:isSaveWX", false);
                  this.$emit("update:loadingWX", false);
                  this.$Message.info("微信支付配置成功,请等待审核");
                } else {
                  this.$emit("update:loadingWX", false);
                  this.$Message.error(res.data.message);
                }
              })
              .catch(err => {
                this.$emit("update:loadingWX", false);
                this.$Message.error(res.data.message);
              });
          } else if (this.formValidateWX.id != null) {
            // 编辑
            if (this.strWX == JSON.stringify(this.formValidateWX)) {
              this.isdisabledWX = true;
              this.$emit("update:isSaveWX", false);
              this.$emit("update:loadingWX", false);
            } else {
              this.formValidateWX.auditType = 1;
              this.formValidateWX.configStat = 1;
              editQRcode(this.formValidateWX)
                .then(res => {
                  if (res.data.code == 200) {
                    this.isdisabledWX = true;
                    this.$emit("update:isSaveWX", false);
                    this.$emit("update:loadingWX", false);
                    this.$Message.info("微信支付编辑成功,请等待审核");
                  } else {
                    this.$emit("update:loadingWX", false);
                    this.$Message.error(res.data.message);
                  }
                })
                .catch(err => {
                  this.$emit("update:loadingWX", false);
                  this.$Message.error(res.data.message);
                });
            }
          }
        }
      });
    },

    // 支付宝收钱码
    ZFBQRModal(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.$emit("update:loadingZFB", true);
          // 新增
          if (this.formValidateZFB.id == null) {
            this.formValidateZFB.auditType = 1;
            this.formValidateZFB.configStat = 1;
            addQRcode(this.formValidateZFB)
              .then(res => {
                if (res.data.code == 200) {
                  this.isdisabledZFB = true;
                  this.$emit("update:isSaveZFB", false);
                  this.$emit("update:loadingZFB", false);
                  this.$Message.info("支付宝配置成功,请等待审核");
                } else {
                  this.$emit("update:loadingZFB", false);
                  this.$Message.error(res.data.message);
                }
              })
              .catch(err => {
                this.$emit("update:loadingZFB", false);
                this.$Message.error(res.data.message);
              });
          } else if (this.formValidateZFB.id != null) {
            // 编辑
            if (this.strZFB == JSON.stringify(this.formValidateZFB)) {
              this.isdisabledZFB = true;
              this.$emit("update:isSaveZFB", false);
              this.$emit("update:loadingZFB", false);
            } else {
              this.formValidateZFB.auditType = 1;
              this.formValidateZFB.configStat = 1;
              editQRcode(this.formValidateZFB)
                .then(res => {
                  if (res.data.code == 200) {
                    this.isdisabledZFB = true;
                    this.$emit("update:isSaveZFB", false);
                    this.$emit("update:loadingZFB", false);
                    this.$Message.info("支付宝编辑成功,请等待审核");
                  } else {
                    this.$emit("update:loadingZFB", false);
                    this.$Message.error(res.data.message);
                  }
                })
                .catch(err => {
                  this.$emit("update:loadingZFB", false);
                  this.$Message.error(res.data.message);
                });
            }
          }
        }
      });
    },
    // 据终端设备收款码应用id查询终端设备收款码信息
    getQRcodeByChannelId() {
      searchQRcodeByChannelId(this.channelId).then(res => {
        if (res.data.code == 200) {
          this.QRcodeList = res.data.result;
          let array = [];
          this.QRcodeList.forEach(item => {
            array = [...array, item.auditType];
            if (item.payType == 1) {
              this.formValidateWX = item;
              this.idWX = item.id;
            } else if (item.payType == 2) {
              this.formValidateZFB = item;
              this.idZFB = item.id;
            }
          });
          if (array.includes(3)) {
            this.$emit("update:auditType", 3);
          } else if (array.includes(2) && !array.includes(1)) {
            this.$emit("update:auditType", 2);
          } else if (array.includes(1)) {
            this.$emit("update:auditType", 1);
          }
        }
      });
    }
  },
  mounted() {
    this.getQRcodeByChannelId();
  }
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
.alertText {
  font-size: 14px;
  color: #9a9a9a;
  margin: 14px 0 30px 6px;
}
.content {
  overflow: hidden;

  .weixin-pay,
  .zhifubao-pay {
    width: 50%;
    border-right: 1px solid #e7e7e7;
    box-sizing: border-box;
    float: left;
    .title {
      width: 100%;
      margin-left: 30px;
      margin-bottom: 20px;
      box-sizing: border-box;
      img {
        width: 30px;
        height: 30px;
        display: inline-block;
        vertical-align: middle;
      }
      span {
        margin-left: 5px;
        font-size: 16px;
      }
      .toButton {
        margin-right: 75px;
        float: right;
      }
    }
    /deep/ .ivu-form-item-label:before {
      content: "";
    }
  }
  .zhifubao-pay {
    border-right: 0;
  }
  .wxP12 {
    /deep/.ivu-upload-list {
      margin-top: 0;
      border: 1px solid #c6c9ce;
      display: inline-block;
      width: 165px;
      height: 32px;
      box-sizing: border-box;
      overflow: hidden;
      .ivu-icon-ios-close {
        display: none;
      }
    }
    /deep/.ivu-upload-select {
      float: right;
      > button {
        border-radius: 0px 4px 4px 0;
        height: 32px;
      }
    }
    /deep/ .ivu-form-item-content {
      line-height: 32px;
    }
  }
}
.icon {
  position: absolute;
  right: 16px;
  top: 15px;
  cursor: pointer;
}
</style>