<template>
  <div class="QRcode">
    <div class="leftBox">
      <!-- 渠道树 -->
      <channel-tree @clickTreeRow="clickTreeRow"></channel-tree>
    </div>
    <div class="rightDiv">
      <Input v-model="merchantName" style="margin-right:10px" placeholder="商户名称" clearable />
      <Select v-model="auditType" clearable placeholder="审核状态" style="margin-right:10px">
        <Option v-for="item in auditTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
      <Select v-model="payType" clearable placeholder="支付类型" style="margin-right:10px">
        <Option v-for="item in payTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
      <Button type="primary" @click="searchGetQRcode">查询</Button>
      <Button type="primary" @click="reset">重置</Button>
      <Table highlight-row :columns="columns" :data="dataTable" border>
        <template slot-scope="{ row, index }" slot="payType">{{row.payType | payTypeText}}</template>
        <template slot-scope="{ row, index }" slot="operation">
          <!-- 按钮 -->
          <Button
            type="primary"
            size="small"
            @click="checkModal(row)"
            v-if="row.auditType==1"
          >&nbsp&nbsp审核&nbsp&nbsp</Button>

          <Button size="small" v-if="row.auditType==2||row.auditType==3" disabled>已审核</Button>
          <Button type="primary" size="small" :disabled="row.auditType==1" style="margin-right: 0px" @click="seeResult(row)">查看</Button>

          <!-- 删除按钮 -->
          <Button
            type="error"
            size="small"
            @click="modalDel=true;delID=row.id;delIndex=index"
            v-if="false&&hasPerm('sys:merchantinfo:del')"
          >删除</Button>
        </template>
        <!-- 状态 -->
        <template slot-scope="{ row, index }" slot="auditType">
          <span v-show="row.auditType==1" style="color:#ff9900">待审核</span>
          <span v-show="row.auditType==2" style="color:#19be6b">审核成功</span>
          <span v-show="row.auditType==3" style="color:#ed4014">审核失败</span>
        </template>
      </Table>
      <Page
        :page-size="pageSize"
        :total="total"
        show-elevator
        :current="pageNum"
        @on-change="pageChange"
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
    <!-- 微信弹框的模态框 -->
    <Modal v-model="isShowWX" :mask-closable="false" :title="modalTitleWX" width="450">
      <div class="content">
        <div class="weixin-pay">
          <div class="title">
            <img src="@/assets/images/weixin.jpg" alt />
            <span>微信支付配置</span>
          </div>
          <div>
            <Form ref="formValidateWX" :model="formValidateWX" :label-width="120">
              <FormItem label="AppID" prop="appId">
                <Input v-model="formValidateWX.appId" placeholder="AppID" disabled></Input>
              </FormItem>
              <FormItem label="AppSecret" prop="payKey">
                <Input
                  v-model="formValidateWX.payKey"
                  placeholder="AppSecret"
                  disabled
                  type="textarea"
                  :autosize="{minRows: 1,maxRows: 5}"
                ></Input>
              </FormItem>
              <FormItem label="商户号" prop="merchantId">
                <Input v-model="formValidateWX.merchantId" placeholder="商户号" disabled></Input>
              </FormItem>
              <FormItem label="商户名称" prop="merchantName">
                <Input v-model="formValidateWX.merchantName" placeholder="商户名称" disabled></Input>
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
                    <Button type="primary" disabled>选择</Button>
                  </Upload>
                </template>
              </FormItem>
            </Form>
          </div>
        </div>
      </div>
      <div slot="footer">
        <div v-if="isSee">
          <Button type="primary" @click="isShowWX=false">关闭</Button>
        </div>
        <div v-if="!isSee">
          <Button type="text" @click="cancel">取消</Button>
          <Poptip
            confirm
            placement="bottom"
            @on-ok="checkNoPass('formValidateWX')"
            @on-cancel="formValidateWX.remark=''"
            class="PoptipTitle"
          >
            <div slot="title">
              <div>审核不通过原因：</div>
              <Input
                :autosize="{minRows: 1,maxRows: 3}"
                type="textarea"
                v-model.trim="formValidateWX.remark"
                :maxlength="100"
              ></Input>
            </div>
            <Button type="text" style="border:1px solid #c6c9ce">审核不通过</Button>
          </Poptip>
          <Button type="primary" @click="checkPass('formValidateWX')">审核通过</Button>
        </div>
      </div>
    </Modal>
    <!-- 支付宝弹框的模态框 -->
    <Modal v-model="isShowZFB" :mask-closable="false" :title="modalTitleZFB" width="450">
      <div class="content">
        <div class="zhifubao-pay">
          <div class="title">
            <img src="@/assets/images/zhifubao.jpg" alt />
            <span>支付宝配置</span>
          </div>
          <div>
            <Form ref="formValidateZFB" :model="formValidateZFB" :label-width="120">
              <FormItem label="AppID" prop="appId">
                <Input v-model="formValidateZFB.appId" placeholder="AppID" disabled></Input>
              </FormItem>
              <FormItem label="PID" prop="merchantId">
                <Input v-model="formValidateZFB.merchantId" placeholder="PID" disabled></Input>
              </FormItem>
              <FormItem label="商户名称" prop="merchantName">
                <Input v-model="formValidateZFB.merchantName" placeholder="商户名称" disabled></Input>
              </FormItem>
              <FormItem label="商户私钥" prop="paySecret">
                <Input
                  v-model="formValidateZFB.paySecret"
                  placeholder="商户私钥"
                  disabled
                  type="textarea"
                  :autosize="{minRows: 1,maxRows: 3}"
                ></Input>
              </FormItem>
              <FormItem label="支付宝公钥" prop="payKey">
                <Input
                  v-model="formValidateZFB.payKey"
                  placeholder="支付宝公钥"
                  disabled
                  type="textarea"
                  :autosize="{minRows: 1,maxRows: 3}"
                ></Input>
              </FormItem>
            </Form>
          </div>
        </div>
      </div>

      <div slot="footer">
        <div v-if="isSee">
          <Button type="primary" @click="isShowZFB=false">关闭</Button>
        </div>
        <div v-if="!isSee">
          <Button type="text" @click="cancel">取消</Button>
          <Poptip
            confirm
            placement="bottom"
            @on-ok="checkNoPass('formValidateZFB')"
            @on-cancel="formValidateZFB.remark=''"
            class="PoptipTitle"
          >
            <div slot="title">
              <div>审核不通过原因：</div>
              <Input
                :autosize="{minRows: 1,maxRows: 5}"
                type="textarea"
                :maxlength="100"
                v-model.trim="formValidateZFB.remark"
              ></Input>
            </div>
            <Button type="text" style="border:1px solid #c6c9ce" :loading="loadingNo">审核不通过</Button>
          </Poptip>
          <Button type="primary" @click="checkPass('formValidateZFB')" :loading="loading">审核通过</Button>
        </div>
      </div>
    </Modal>
  </div>
</template>
<script>
import channelTree from "@/view/custom/components/channelTree";
import deleteComponent from "@/view/custom/components/deleteComponent";
import { Upload, searchQRcode, delQRcode, editQRcode } from "@/api/http";
import format from "@/plugin/format.js"; //格式化时间YYYY-MM-DD
export default {
  components: {
    channelTree,
    deleteComponent
  },
  name: "QRcode",
  data() {
    return {
      modalTitleZFB:null,
      modalTitleWX:null,
      isSee: false,
      loading: false,
      loadingNo: false,
      // 模态框微信表单数据
      formValidateWX: {
        appId: "", //微信appid
        payKey: "", //微信key
        merchantId: "", //微信商户id
        merchantName: "", //商户名称
        paySecret: "", //微信p12证书
        auditType: null, //审核状态 1 待审核 2 审核成功 3 审核失败
        channelId: this.$store.state.user.channelId, //渠道id
        auditOperator: this.$store.state.user.userId, //审核人
        payType: 1, //支付类型 1 微信 2支付宝
        remark: "", //备注
        auditData: "" //审核时间
      },
      // 模态框支付宝表单数据
      formValidateZFB: {
        appId: "", //支付宝appid
        merchantId: "", //支付宝的商户id
        merchantName: "", //商户名称
        paySecret: "", //支付宝私钥
        payKey: "", //支付宝公钥
        auditType: null, //审核状态 1 待审核 2 审核成功 3 审核失败
        channelId: this.$store.state.user.channelId, //渠道id
        auditOperator: this.$store.state.user.userId, //审核人
        payType: 2, //支付类型 1 微信 2支付宝
        remark: "", //备注
        auditData: "" //审核时间
      },
      modalDel: false,
      modal_loading: false, //删除的loading
      delID: null, //删除的ID
      tabIndex: null,
      Upload, // 上传文件地址
      total: null, // 页码数
      isShowWX: false, // 微信弹框显示状态
      isShowZFB: false, //支付宝弹框显示状态
      accountType: null, //注册类型
      auditType: null, // 审核状态
      channelId: this.$store.state.user.channelId, // 渠道id
      merchantName: null, //商户名称
      pageNum: 1, // 页码
      pageSize: 15, // 页面大小
      payType: null, // 支付类型
      columns: [
        {
          title: "序号",
          type: "index",
          maxWidth: 60,
          minWidth: 30,
          align: "center"
        },
        {
          title: "商户名称",
          key: "merchantName",
          align: "center",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "用户名",
          key: "username",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "收款方式",
          slot: "payType",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "联系电话",
          key: "phone",
          align: "center",
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
          title: "审核状态",
          slot: "auditType",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "审核时间",
          key: "auditData",
          align: "center",
          minWidth: 120,
          tooltip: true
        },
        {
          title: "备注",
          key: "remark",
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
      dataTable: [],
      auditTypeList: [
        {
          value: "1",
          label: "待审核"
        },
        {
          value: "2",
          label: "审核成功"
        },
        {
          value: "3",
          label: "审核失败"
        }
      ],
      payTypeList: [
        {
          value: "1",
          label: "微信"
        },
        {
          value: "2",
          label: "支付宝"
        }
      ]
    };
  },
  // 过滤器
  filters: {
    payTypeText(payType) {
      return payType == 2 ? "支付宝" : "微信";
    }
  },
  methods: {
    // 文件上传失败
    onError(error) {
      this.$Message.error("上传失败");
    },
    // 微信p12上传类型错误提示
    formtFileError(file, fileList) {
      this.$Message.error("上传文件类型错误");
    },
    // 微信p12上传成功
    formtFileSuccess(response, file, fileList) {
      if (response.code === 200) {
        // this.$set(this.formValidateWX, "wxP12", response.result.url);
        this.formValidateWX.paySecret = response.result.key;
        this.$Message.success("文件上传成功");
      } else if (response.code === 500) {
        this.$Message.error(response.message);
      }
    },
    // 删除按钮操作
    delCancel() {
      this.modal_loading = false;
      this.modalDel = false;
    },
    del() {
      this.modal_loading = true;
      delQRcode(this.delID)
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
    },

    // 点击部门树
    clickTreeRow(value) {
      if (value) {
        this.channelId = value.id;
        this.getQRcode(); // 重新获取数据
      }
    },
    // 页码改变时触发
    pageChange(value) {
      this.pageNum = value;
      this.getQRcode(); // 重新获取数据
    },

    // 页容量改变时触发
    sizeChange(value) {
      this.pageSize = value;
      this.getQRcode(); // 重新获取数据
    },

    // 用户重置按钮
    reset() {
      this.merchantName = null; // 商户名称
      this.auditType = null; // 审核状态
      this.payType = null; //支付方式
      this.getQRcode(); // 重新获取数据
    },
    cancel() {
      this.tabIndex == 1 ? (this.isShowWX = false) : (this.isShowZFB = false);
      this.$Message.info("取消操作");
    },
    seeResult(row) {
      console.log(row);
      this.isSee = true;
      row.payType == 1
        ? (this.formValidateWX = JSON.parse(JSON.stringify(row)))
        : (this.formValidateZFB = JSON.parse(JSON.stringify(row)));
      row.payType == 1 ? (this.isShowWX = true) : (this.isShowZFB = true);
      row.payType == 1 ? (this.modalTitleWX="查看【商户收钱码】") : (this.modalTitleZFB="查看【商户收钱码】");
    },
    // 审核点击事件
    checkModal(row) {
      console.log(row);
      // this.modalTitleZFB="审核【商户收钱码】";
      // this.modalTitleWX="审核【商户收钱码】";
      this.isSee = false;
      row.payType == 1
        ? (this.formValidateWX = JSON.parse(JSON.stringify(row)))
        : (this.formValidateZFB = JSON.parse(JSON.stringify(row)));
      row.payType == 1 ? (this.isShowWX = true) : (this.isShowZFB = true);
      row.payType == 1 ? (this.modalTitleWX="审核【商户收钱码】") : (this.modalTitleZFB="审核【商户收钱码】");
      row.payType == 1 ? (this.tabIndex = 1) : (this.tabIndex = 2);
      row.payType == 1
        ? (this.formValidateWX.remark = "")
        : (this.formValidateZFB.remark = "");
    },

    // 审核通过事件
    checkPass(name) {
      this.loading = true;
      if (this.tabIndex == 1) {
        this.formValidateWX.auditType = 2;
        this.formValidateWX.auditOperator = this.$store.state.user.userId;
        this.formValidateWX.auditData = format(
          new Date(),
          "YYYY-MM-DD hh:mm:ss"
        );
        console.log(this.formValidateWX.auditData);

        editQRcode(this.formValidateWX)
          .then(res => {
            if (res.data.code == 200) {
              this.loading = false;
              this.isShowWX = false;
              this.$Message.info("审核通过");
              this.getQRcode(); // 重新获取数据
            } else {
              this.loading = false;
              this.$Message.error(res.data.message);
            }
          })
          .catch(err => {
            this.loading = false;
            this.$Message.error(res.data.message);
          });
      } else if (this.tabIndex == 2) {
        this.formValidateZFB.auditType = 2;
        this.formValidateZFB.auditOperator = this.$store.state.user.userId;
        this.formValidateZFB.auditData = format(
          new Date(),
          "YYYY-MM-DD hh:mm:ss"
        );
        editQRcode(this.formValidateZFB)
          .then(res => {
            if (res.data.code == 200) {
              this.loading = false;
              this.isShowZFB = false;
              this.$Message.info("审核通过");
              this.getQRcode(); // 重新获取数据
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
    },
    // 审核不通过事件
    checkNoPass(name) {
      this.loadingNo = true;
      if (this.tabIndex == 1) {
        this.formValidateWX.auditType = 3;
        this.formValidateWX.auditOperator = this.$store.state.user.userId;
        this.formValidateWX.auditData = format(
          new Date(),
          "YYYY-MM-DD hh:mm:ss"
        );
        editQRcode(this.formValidateWX)
          .then(res => {
            if (res.data.code == 200) {
              this.loadingNo = false;
              this.isShowWX = false;
              this.formValidateWX.remark = "";
              this.$Message.info("审核不通过");
              this.getQRcode(); // 重新获取数据
            } else {
              this.loadingNo = false;
              this.$Message.error(res.data.message);
            }
          })
          .catch(err => {
            this.loadingNo = false;
            this.$Message.error(res.data.message);
          });
      } else if (this.tabIndex == 2) {
        this.formValidateZFB.auditType = 3;
        this.formValidateWX.auditOperator = this.$store.state.user.userId;
        this.formValidateWX.auditData = format(
          new Date(),
          "YYYY-MM-DD hh:mm:ss"
        );
        editQRcode(this.formValidateZFB)
          .then(res => {
            if (res.data.code == 200) {
              this.loadingNo = false;
              this.isShowZFB = false;
              this.formValidateZFB.remark = "";
              this.$Message.info("审核不通过");
              this.getQRcode(); // 重新获取数据
            } else {
              this.loadingNo = false;
              this.$Message.error(res.data.message);
            }
          })
          .catch9(err => {
            this.loading = false;
            this.$Message.error(res.data.message);
          });
      }
    },
    searchGetQRcode() {
      this.pageNum = 1;
      this.getQRcode();
    },

    // 获取收款码信息
    getQRcode() {
      let data = {
        accountType: this.accountType, //注册类型
        auditType: this.auditType, // 审核状态
        channelId: this.channelId, // 渠道id
        merchantName: this.merchantName, //商户名称
        pageNum: this.pageNum, // 页码
        pageSize: this.pageSize, // 页面大小
        payType: this.payType // 支付类型
      };
      searchQRcode(data).then(res => {
        if (res.data.code == 200) {
          this.dataTable = res.data.result.list;
          this.total = res.data.result.total;
          this.pageNum = res.data.result.pageNum;
        }
      });
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.getQRcode();
    });
  }
  // mounted() {
  //   this.getQRcode();
  // }
};
</script>
<style lang="less" scoped>
.QRcode {
  .leftBox {
    min-height: 900px;
    float: left;
    margin-right: 20px;
  }
}
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
.content {
  // overflow: hidden;
  .weixin-pay,
  .zhifubao-pay {
    width: 100%;
    box-sizing: border-box;
    // float: left;
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
    }
  }
  // .zhifubao-pay {
  //   border-right: 0;
  // }
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
.PoptipTitle {
  /deep/ .ivu-poptip-inner {
    text-align: left;
    width: 255px;
  }
  /deep/ .ivu-input {
    // height: 80px;
    // width: 280px;
    margin-top: 10px;
    margin-left: -18px;
  }
  // .remarkZFB{
  //   width: 200px;
  //   height: 60px;
  //   border: 1px solid #c6c9ce;
  //   margin-left: -18px;
  //   margin-top: 10px;
  // }
}
</style>
