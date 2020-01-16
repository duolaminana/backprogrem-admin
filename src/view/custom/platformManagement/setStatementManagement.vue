<template>
  <div class="setStatementManagement">
    <div class="leftBox">
      <channel-tree @clickTreeRow="clickTreeRow" ref="channelTree"></channel-tree>
    </div>
    <div class="rightDiv">
      <Input v-model="accountName" style="margin-right:10px" placeholder="收款人" clearable />
      <Select v-model="accountId" placeholder="收款方" style="margin-right:10px" clearable>
        <Option v-for="item in accountList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
      <DatePicker
        v-model="clearingStartDate"
        type="datetime"
        :options="startOptions"
        placeholder="结算开始时间"
        @on-change="handleChangeStart"
        style="width: 160px"
      ></DatePicker>
      <span>&nbsp至&nbsp&nbsp</span>
      <DatePicker
        v-model="clearingEndDate"
        type="datetime"
        :options="endOptions"
        placeholder="结算结束时间"
        @on-change="handleChangeEnd"
        style="width: 160px"
      ></DatePicker>
      <Button type="primary" @click="searchSettlement" v-if="hasPerm('set:sta:seeback')">查询</Button>
      <Button type="primary" @click="reset" v-if="hasPerm('set:sta:seeback')">重置</Button>
      <Table
        highlight-row
        :columns="columns"
        :data="dataTable"
        border
        ref="table"
        style="margin:20px 0"
      >
        <!-- 关联设备 -->
        <template slot-scope="{row,index}" slot="facilityNumber">
          <a class="lookDetails" @click="contactEquipment(row)">查看详情</a>
        </template>
        <!-- 收款人信息 -->
        <template slot-scope="{row,index}" slot="userInfo">
          <a class="lookDetails" @click="seeAccount(row)">查看详情</a>
        </template>
        <!-- 结算详情 -->
        <template slot-scope="{row,index}" slot="SettlementList">
          <a class="lookDetails" @click="seeSettlementMore(row)">查看详情</a>
        </template>
        <!-- 操作 -->
        <template slot-scope="{row,index}" slot="operation">
          <!-- 结算 -->
          <Button
            style="margin-left:0px"
            type="primary"
            size="small"
            @click="getSettlementClick(row)"
            v-if="hasPerm('set:sta:setback')"
          >结算</Button>
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
    <!-- 结算详情弹框的模态框 -->
    <Modal v-model="isShow" :mask-closable="false" :title="'结算详情('+deductAccount+')'" width="1800">
      <div>
        <strong
          v-if="accountId!=deductAccountId"
          style="color:red"
        >提示：待结算金额 =（总利润-被抽成金额）* 利润百分比 + 本金</strong>
        <strong
          v-if="accountId==deductAccountId"
          style="color:red"
        >提示：待结算金额 =（总利润-被抽成金额）* 利润百分比 + 本金 + 抽成金额 - 使用返利金额</strong>
      </div>
      <Table
        class="setMore"
        :columns="columnsMoreText"
        :data="dataTableMore"
        border
        ref="table"
        style="margin:20px 0"
      >
        <template slot-scope="{row,index}" slot="primayCapital">
          <span>{{row.primayCapital|primayCapital}}</span>
        </template>
        <template slot-scope="{row,index}" slot="cardNo">
          <span>{{row.cardNo|cardNo}}</span>
        </template>
        <template slot-scope="{row,index}" slot="flowType">
          <span>{{row.flowType|flowTypeText}}</span>
        </template>
      </Table>
      <Page
        :total="totalMore"
        show-elevator
        :current="pageNumMore"
        @on-change="pageChangeMore"
        :page-size="pageSizeMore"
        @on-page-size-change="sizeChangeMore"
        show-sizer
      />
      <div slot="footer">
        <Button type="success" size="large" @click="exportTable">导出</Button>
        <Button type="primary" size="large" @click="handleClick">确定</Button>
      </div>
      <div slot="close">
        <Icon
          type="md-close"
          size="20"
          color="#515a6e"
          style="margin-top:10px;margin-right:15px"
          class="icon"
          @click="handleClick"
        />
      </div>
    </Modal>
    <!-- 收款人详情弹框的模态框 -->
    <account :isShowAccount.sync="isShowAccount" :formValidate="formValidate" @cancel="cancel"></account>
    <!-- 关联设备弹框的模态框 -->
    <Modal v-model="isShowEquipment" :mask-closable="false" title="关联设备" width="600">
      <Table
        :columns="columnsEquipment"
        :data="dataTableEquipment"
        border
        ref="dataTableEquipment"
        style="margin:20px 0"
      ></Table>
      <div slot="footer">
        <Button
          type="primary"
          size="large"
          @click="isShowEquipment=false;accountId=null"
        >确定</Button>
      </div>
      <div slot="close">
        <Icon
          type="md-close"
          size="20"
          color="#515a6e"
          style="margin-top:10px;margin-right:15px"
          class="icon"
          @click="isShowEquipment=false;accountId=null"
        />
      </div>
    </Modal>
    <!-- 结算页面 -->
    <Modal v-model="isSettlement" :mask-closable="false" :title="'结算('+beneficiaryName+')'">
      <Form ref="formValidateSettlement" :model="formValidateSettlement" :label-width="80">
        <FormItem label="收款方：" prop="beneficiary">
          <Input
            v-model="formValidateSettlement.beneficiary"
            placeholder="收款方"
            disabled
            style="width:250px"
          ></Input>
        </FormItem>
        <FormItem label="收款人：" prop="payee">
          <Input
            v-model="formValidateSettlement.payee"
            placeholder="收款人"
            disabled
            style="width:250px"
          ></Input>
        </FormItem>
        <FormItem label="收款账户：" prop="account">
          <Input
            v-model="formValidateSettlement.account"
            placeholder="收款账户"
            disabled
            style="width:250px"
          ></Input>
        </FormItem>
        <FormItem label="开户行：" prop="openingBank">
          <Input
            v-model="formValidateSettlement.openingBank"
            placeholder="开户行"
            disabled
            style="width:250px"
          ></Input>
        </FormItem>
        <FormItem label="活动时间：" class="time" prop="startDate">
          <DatePicker
            type="datetime"
            placeholder="开始时间"
            v-model="formValidateSettlement.createDate"
            disabled
            style="width:187px"
          ></DatePicker>
          <span style="line-height:32px">&nbsp&nbsp至&nbsp&nbsp</span>
          <DatePicker
            type="datetime"
            placeholder="结束时间"
            v-model="endDate"
            disabled
            style="width:187px"
          ></DatePicker>
        </FormItem>
        <FormItem label="结算金额：" prop="price">
          <Input
            v-model="formValidateSettlement.gatheringPrice"
            placeholder="结算金额"
            disabled
            style="width:250px"
          ></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button
          type="text"
          style="border:1px solid #c6c9ce"
          size="large"
          @click="isSettlement=false"
        >取消</Button>
        <Button type="primary" size="large" :loading="loading" @click="settlementModal">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import channelTree from "@/view/custom/components/channelTree";
import account from "@/view/custom/components/account";
import format from "@/plugin/format.js"; //格式化时间YYYY-MM-DD
import {
  searchSettlement,
  searchSettlementMore,
  searchAccountByAccountId,
  searchMachineByAccountId,
  getSettlementExcle,
  searchBenefitAccount,
  settlementClearing
} from "@/api/http";
export default {
  components: {
    channelTree,
    account
  },
  name: "setStatementManagement",

  data() {
    return {
      loading: false,
      endDate: "",
      beneficiaryName: null,
      isSettlement: false,
      formValidateSet: {},
      formValidateSettlement: {},
      accountList: [],
      deductAccount: null,
      createDate: "",
      // 收款人弹框表单数据
      formValidate: {
        merchantId: null
      },
      isShowAccount: false, //结算账户弹框显示方式
      totalMore: null, // 页码数
      pageNumMore: 1, // 页码
      pageSizeMore: 10, // 页容量
      orderNo: null, //订单号
      clearingId: null, //结算主表id
      isShow: false, //结算详情弹框显示方式
      accountId: null, //收款账号Id,
      accountName: null, //收款账号名称
      channelId: this.$store.state.user.channelId, // 渠道ID
      clearingEndDate: "", //结算结束时间
      clearingStartDate: "", //结算开始时间
      clearingStatus: 0, //结算状态0 未结算 1 已结算
      deductAccountId: null, //扣款账号Id
      deductAccountName: null, //扣款账号名称
      gatheringPrice: null, //收款总金额
      id: null, //主键id
      operator: null, //操作人id
      operatorName: null, //操作人名称
      pageNum: 1, // 页码
      pageSize: 15, // 页容量
      userId: this.$store.state.user.userVo.id,
      userType: this.$store.state.user.userVo.type,
      total: null, // 页码数
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
          title: "收款方",
          key: "beneficiary",
          align: "center",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "收款人",
          key: "accountName",
          align: "center",
          minWidth: 180,
          tooltip: true
        },
        {
          title: "关联设备",
          slot: "facilityNumber",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "收款人详情",
          slot: "userInfo",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "上次结算时间",
          key: "lastClearingTime",
          align: "center",
          minWidth: 140,
          tooltip: true
        },
        {
          title: "累计金额(元)",
          key: "gatheringPrice",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "结算详情",
          slot: "SettlementList",
          align: "center",
          minWidth: 80,
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
      dataTable: [], // 数据
      // 结算详情的数据结构
      columnsMoreText: [],
      columnsMore: [
        {
          title: "序号",
          type: "index",
          minWidth: 50,
          align: "center"
        },
        {
          title: "订单编号",
          key: "orderNo",
          align: "center",
          minWidth: 150,
          tooltip: true
        },
        {
          title: "消费者",
          slot: "cardNo",
          align: "center",
          minWidth: 150,
          tooltip: true
        },
        {
          title: "设备编码",
          key: "memberCard",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "商品名称",
          key: "productName",
          align: "center",
          minWidth: 120,
          tooltip: true
        },
        {
          title: "商品进价",
          key: "buyPrice",
          align: "center",
          minWidth: 50,
          tooltip: true
        },
        {
          title: "实际售价",
          key: "actualPrice",
          align: "center",
          minWidth: 50,
          tooltip: true
        },
        {
          title: "活动售价",
          key: "activityPrice",
          align: "center",
          minWidth: 50,
          tooltip: true
        },
        {
          title: "购买数量",
          key: "productNumber",
          align: "center",
          minWidth: 50,
          tooltip: true
        },
        {
          title: "出货数量",
          key: "productProduce",
          align: "center",
          minWidth: 50,
          tooltip: true
        },
        {
          title: "退货数量",
          key: "refundNumber",
          align: "center",
          minWidth: 50,
          tooltip: true
        },
        {
          title: "清算数量",
          key: "settlementNumber",
          align: "center",
          minWidth: 50,
          tooltip: true
        },
        {
          title: "交易时间",
          key: "dealDate",
          align: "center",
          minWidth: 140,
          tooltip: true
        },
        {
          title: "使用返利金额",
          key: "couponAmount",
          align: "center",
          minWidth: 60,
          tooltip: true,
          className: "more"
        },
        {
          title: "本金",
          slot: "primayCapital",
          align: "center",
          minWidth: 60,
          tooltip: true,
          className: "more"
        },
        {
          title: "被抽成金额",
          key: "commissionPrice",
          align: "center",
          minWidth: 60,
          tooltip: true,
          className: "more"
        },
        {
          title: "利润",
          key: "profitPrice",
          align: "center",
          minWidth: 60,
          tooltip: true,
          className: "more"
        },
        {
          title: "利润百分比",
          key: "profitPercent",
          align: "center",
          minWidth: 60,
          tooltip: true,
          render: (h, param) => {
            return h("div", param.row.profitPercent + "%");
          },
          className: "more"
        },
        {
          title: "待结算金额",
          key: "benefitPrice",
          align: "center",
          minWidth: 60,
          tooltip: true,
          className: "more"
        },
        {
          title: "资金流动类型",
          slot: "flowType",
          align: "center",
          minWidth: 70,
          tooltip: true
        }
      ],
      dataTableMore: [], //结算详情数据
      isShowEquipment: false, //关联设备模态框显示方式
      // 关联设备数据结构
      columnsEquipment: [
        {
          title: "序号",
          type: "index",
          maxWidth: 60,
          minWidth: 30,
          align: "center"
        },
        {
          title: "设备编码",
          key: "machineCode",
          align: "center",
          tooltip: true
        },
        {
          title: "设备类型",
          key: "machineName",
          align: "center",
          tooltip: true
        },
        {
          title: "点位名称",
          key: "positionName",
          align: "center",
          tooltip: true
        }
      ],
      dataTableEquipment: [] //关联设备数据
    };
  },
  computed: {
    startOptions: function() {
      //开始时间的限制，不能选择结束时间之后的时间
      let limitTime = this.clearingEndDate; //获取结束时间
      return {
        disabledDate(time) {
          return time > new Date(limitTime);
        }
      };
    },
    endOptions: function() {
      //结束时间的限制，不能选择开始时间之后的时间
      let limitTime = this.clearingStartDate; //获取开始时间
      return {
        disabledDate(time) {
          return time < new Date(limitTime);
        }
      };
    }
  },
  // 过滤器
  filters: {
    primayCapital(value) {
      let realVal = "";
      if (value) {
        // 截取当前数据到小数点后两位
        realVal = parseFloat(value).toFixed(2);
      } else {
        realVal = "——";
      }
      return realVal;
    },
    cardNo(value) {
      let realVal = "";
      if (value) {
        realVal = value;
      } else {
        realVal = "——";
      }
      return realVal;
    },
    flowTypeText(num) {
      switch (num) {
        case 1:
          return "正常交易";
          break;
        case 2:
          return "退款";
          break;
        case 3:
          return "清算";
          break;
      }
    }
  },
  methods: {
    handleChangeStart(value) {
      this.clearingStartDate = value;
    },
    handleChangeEnd(value) {
      this.clearingEndDate = value;
    },
    clickTreeRow(value) {
      if (value) {
        this.channelId = value.id;
        this.getSettlement();
        this.getBenefitAccount();
      }
    },
    // 用户重置按钮
    reset() {
      this.accountName = null;
      this.accountId = null;
      this.clearingStartDate = "";
      this.clearingEndDate = "";
      this.pageNum = 1;
      this.total = null;
      this.channelId = this.$store.state.user.channelId;
      this.getSettlement();
      this.$refs.channelTree.getTreeData();
    },
    // 页码改变时触发
    pageChange(value) {
      this.pageNum = value;
      this.getSettlement();
    },
    // 页容量改变时触发
    sizeChange(value) {
      this.pageSize = value;
      this.getSettlement();
    },
    // 结算详情页码改变时触发
    pageChangeMore(value) {
      this.pageNumMore = value;
      this.getSettlementMore();
    },
    // 结算详情页容量改变时触发
    sizeChangeMore(value) {
      this.pageSizeMore = value;
      this.getSettlementMore();
    },
    // 关联设备
    contactEquipment(row) {
      console.log(row);
      this.isShowEquipment = true;
      this.accountId = row.accountId;
      this.getMachine();
    },
    // 查看收款人信息
    seeAccount(row) {
      this.isShowAccount = true;
      this.accountId = row.accountId;
      this.getAccount();
    },
    cancel() {
      this.isShowAccount = false;
      this.accountId = null;
    },
    //查看结算详情
    seeSettlementMore(row) {
      console.log(row);
      this.accountId = row.accountId;
      this.deductAccountId = row.deductAccountId;
      this.clearingId = row.id;
      this.createDate = row.createDate;
      this.deductAccount = row.beneficiary;
      this.isShow = true;
      this.columnsMoreText = [...this.columnsMore];
      this.getSettlementMore();
      if (row.accountId != row.deductAccountId) {
        this.columnsMoreText.splice(
          this.columnsMoreText.findIndex(item => item.key === "couponAmount"),
          1
        );
      }
    },
    // 结算详情确定按钮
    handleClick() {
      this.isShow = false;
      this.clearingId = null;
      this.accountName = null;
      this.createDate = "";
      this.accountId = null;
      this.deductAccountId = null;
    },
    // 导出表格
    exportTable() {
      let data = {
        clearingId: this.clearingId
      };
      getSettlementExcle(data).then(res => {
        const fileNames =
          this.deductAccount +
          format(this.createDate, "YYYY-MM-DD") +
          "至" +
          format(new Date(), "YYYY-MM-DD");
        const blob = new Blob([res.data]);
        const fileName = fileNames + ".xlsx";
        const elink = document.createElement("a");
        elink.download = fileName;
        elink.style.display = "none";
        elink.href = URL.createObjectURL(blob);
        document.body.appendChild(elink);
        elink.click();
        URL.revokeObjectURL(elink.href); // 释放URL 对象
        document.body.removeChild(elink);
      });
    },

    // 结算点击事件
    async getSettlementClick(row) {
      console.log(row);
      this.loading = false;
      this.beneficiaryName = row.beneficiary;
      this.isSettlement = true;
      this.accountId = row.accountId;
      await this.getAccount();
      this.formValidateSettlement = row;
      this.endDate = format(new Date(), "YYYY-MM-DD HH:mm:ss");
      this.formValidateSettlement.beneficiary = this.formValidateSet.beneficiary;
      this.formValidateSettlement.payee = this.formValidateSet.payee;
      this.formValidateSettlement.account = this.formValidateSet.account;
      this.formValidateSettlement.openingBank = this.formValidateSet.openingBank;
    },
    settlementModal() {
      this.loading = true;
      let data = {
        accountId: this.formValidateSettlement.accountId,
        accountName: this.formValidateSettlement.accountName,
        channelId: this.formValidateSettlement.channelId,
        clearingStatus: 1,
        deductAccountId: this.formValidateSettlement.deductAccountId,
        deductAccountName: this.formValidateSettlement.deductAccountName,
        gatheringPrice: this.formValidateSettlement.gatheringPrice,
        id: this.formValidateSettlement.id,
        operator: this.$store.state.user.userId,
        operatorName: this.$store.state.user.userName
      };
      settlementClearing(data)
        .then(res => {
          if (res.data.code == 200) {
            this.loading = false;
            this.isSettlement = false;
            this.$Message.info("结算成功");
            this.channelId = this.$store.state.user.channelId;
            this.accountId = null;
            this.getSettlement();
          } else {
            this.loading = false;
            this.$Message.error(res.data.message);
          }
        })
        .catch(err => {
          this.loading = false;
          this.$Message.error(res.data.message);
        });
    },
    searchSettlement() {
      this.pageNum = 1;
      this.getSettlement();
    },
    // 获取未结算列表
    getSettlement() {
      let data = {
        channelId: this.channelId, // 渠道ID
        accountId: this.accountId, //收款账号Id,
        accountName: this.accountName, //收款账号名称
        clearingEndDate: this.clearingEndDate, //结算结束时间
        clearingStartDate: this.clearingStartDate, //结算开始时间
        clearingStatus: this.clearingStatus, //结算状态0 未结算 1 已结算
        deductAccountId: this.deductAccountId, //扣款账号Id
        deductAccountName: this.deductAccountName, //扣款账号名称
        gatheringPrice: this.gatheringPrice, //收款总金额
        id: this.id, //主键id
        operator: this.operator, //操作人id
        operatorName: this.operatorName, //操作人名称
        pageNum: this.pageNum, // 页码
        pageSize: this.pageSize, // 页容量
        userId: this.userId,
        userType: this.userType,
        managerRoute: this.$store.state.user.userVo.managerRoute
      };
      searchSettlement(data).then(res => {
        if (res.data.code == 200) {
          this.dataTable = res.data.result.list;
          this.total = res.data.result.total;
          this.pageNum = res.data.result.pageNum;
        }
      });
    },
    // 获取未结算列表详情
    getSettlementMore() {
      let data = {
        clearingId: this.clearingId, // 结算主表id
        id: this.id, //主键id
        orderNo: this.orderNo, //订单编号
        pageNum: this.pageNumMore, // 页码
        pageSize: this.pageSizeMore, // 页容量
        channelId:this.channelId,
        managerRoute:this.$store.state.user.userVo.managerRoute,
        userId:this.$store.state.user.userVo.id,
        userType:this.$store.state.user.userVo.type,
      };
      searchSettlementMore(data).then(res => {
        if (res.data.code == 200) {
          this.dataTableMore = res.data.result.list;
          this.totalMore = res.data.result.total;
          this.pageNumMore = res.data.result.pageNum;
        }
      });
    },
    // 获取收款人详情
    getAccount() {
      return searchAccountByAccountId(this.accountId).then(res => {
        if (res.data.code == 200) {
          this.formValidate = res.data.result;
          this.formValidateSet = res.data.result;
        }
      });
    },
    // 获取关联设备详情
    getMachine() {
      searchMachineByAccountId(this.accountId, this.channelId).then(res => {
        if (res.data.code == 200) {
          this.dataTableEquipment = res.data.result;
        }
      });
    },
    // 获取利益分配账户下拉列表
    getBenefitAccount() {
      searchBenefitAccount(this.channelId).then(res => {
        if (res.data.code == 200) {
          this.accountList = res.data.result.boxVoList;
        }
      });
    }
  },

  mounted() {
    this.getSettlement();
    this.getBenefitAccount();
  }
};
</script>

<style lang="less" scoped>
.setStatementManagement {
  .ivu-input-wrapper {
    width: 300px;
    margin-right: 5px;
  }
  .ivu-btn {
    margin-left: 10px;
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
  .leftBox {
    min-height: 900px;
    float: left;
    margin-right: 20px;
  }
  .lookDetails {
    text-decoration: underline;
  }
}
.setMore {
  /deep/ .ivu-table .more {
    color: #2d8cf0;
  }
}
.time {
  /deep/ .ivu-input-wrapper {
    width: 187px;
  }
}
</style>
