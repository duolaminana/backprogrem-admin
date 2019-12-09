<template>
  <div class="transactionsManagement">
    <div class="leftBox">
      <channel-tree @clickTreeRow="clickTreeRow"></channel-tree>
    </div>
    <div class="rightDiv">
      <Input v-model="orderNo" style="margin-right:10px" placeholder="订单编号" clearable />
      <Input v-model="machineCode" style="margin-right:10px" placeholder="设备编码" clearable />
      <DatePicker
        v-model="startDate"
        type="datetime"
        :options="startOptions"
        placeholder="开始时间"
        @on-change="handleChangeStart"
        style="width: 160px"
      ></DatePicker>
      <span>&nbsp&nbsp至&nbsp&nbsp</span>
      <DatePicker
        v-model="endDate"
        type="datetime"
        :options="endOptions"
        placeholder="结束时间"
        @on-change="handleChangeEnd"
        style="width: 160px"
      ></DatePicker>
      <Button type="primary" @click="searchOrder" v-if="hasPerm('set:tranlist:seeback')">查询</Button>
      <Button type="primary" @click="reset" v-if="hasPerm('set:tranlist:seeback')">重置</Button>
      <Button type="primary" @click="exportTable" v-if="hasPerm('set:tranlist:seeback')">导出</Button>
      <Table
        highlight-row
        :columns="columns"
        ref="table"
        :data="dataTable"
        border
        style="margin:20px 0"
        @on-select="select"
        @on-select-cancel="selectCancel"
        @on-select-all="selectAll"
        @on-select-all-cancel="selectAllCancel"
      >
        <!-- 点位名称 -->
        <template slot-scope="{row,index}" slot="positionName">
          <a class="lookDetails" @click="showPositin(row)">{{row.positionName}}</a>
        </template>
        <!-- 订单详情 -->
        <template slot-scope="{row,index}" slot="orserList">
          <a class="lookDetails" @click="seeSettlementMore(row)">查看详情</a>
        </template>
        <!-- 抽成金额 -->
        <template slot-scope="{row,index}" slot="commissionPrice">
          <span>{{row.commissionPrice|amountText}}</span>
        </template>
        <!-- 收款金额 -->
        <template slot-scope="{row,index}" slot="payAmount">
          <span v-show="row.orderStatus!=1">{{row.payAmount}}</span>
          <span v-show="row.orderStatus==1">0</span>
        </template>
        <!-- 利益分配 -->
        <template slot-scope="{row,index}" slot="templateName">
          <a v-show="row.benefitId" class="lookDetails" @click="toLinkInterest(row)">查看详情</a>
          <span v-show="!row.benefitId">——</span>
        </template>
        <!-- 交易状态 -->
        <template slot-scope="{row,index}" slot="orderStatus">
          <span v-show="row.orderStatus==1">待支付</span>
          <span v-show="row.orderStatus==2" style="color:#2d8cf0">待出货</span>
          <span v-show="row.orderStatus==3" style="color:#19be6b">交易正常</span>
          <span v-show="row.orderStatus==6" style="color:#ff9900">交易异常</span>
          <span v-show="row.orderStatus==4||row.orderStatus==5" style="color:#ed4014">交易失败</span>
        </template>
        <!-- 出货状态 -->
        <template slot-scope="{row,index}" slot="Status">
          <span v-show="row.orderStatus==3" style="color:#19be6b">出货成功</span>
          <span v-show="row.orderStatus==6" style="color:#ff9900">部分出货成功</span>
          <span v-show="row.orderStatus==4" style="color:#ed4014">出货失败</span>
          <span v-show="row.orderStatus==5" style="color:#ed4014">订单关闭</span>
        </template>
        <template slot-scope="{row,index}" slot="operation">
          <!-- 退款按钮 -->
          <Button
            style="margin-right:0px"
            type="primary"
            size="small"
            @click="refund(row)"
            v-if="hasPerm('set:tranlist:refundback')&&row.orderStatus==4"
          >退款</Button>
          <Button
            style="margin-right:0px"
            disabled
            type="primary"
            size="small"
            v-if="hasPerm('set:tranlist:refund')&&false"
          >已退款</Button>
          <Button
            style="margin-right:0px；margin-right:10px"
            type="error"
            size="small"
            @click="modalDel=true;delID=row.id;delIndex=index"
            v-if="hasPerm('set:tranlist:refund')&&row.orderStatus==4"
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
    <!-- 订单详情弹框的模态框 -->
    <Modal v-model="isShow" :mask-closable="false" title="订单详情" width="1200">
      <Table :columns="columnsMore" :data="dataTableMore" border ref="table" style="margin:20px 0">
        <!-- 订单详情抽成金额 -->
        <template slot-scope="{row,index}" slot="commissionPriceMore">
          <span>{{(row.actualPrice-row.buyPrice)*row.productProduce*(row.commissionPercent/100)}}</span>
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
        <Button type="primary" size="large" @click="isShow=false">确定</Button>
      </div>
    </Modal>
    <!-- 利益分配 -->
    <Modal
      class="interest"
      v-model="interestNewlyAdded"
      width="700"
      title="利益分配"
      :mask-closable="false"
    >
      <Table
        :columns="columnsBenefit"
        :data="dataTableBenefit"
        border
        ref="table"
        style="margin:20px 0"
      >
        <template slot-scope="{row,index}" slot="benefitType">{{row.benefitType|benefitTypeText}}</template>
      </Table>
      <div slot="footer">
        <Button type="primary" size="large" @click="interestNewlyAdded=false">确定</Button>
      </div>
    </Modal>
    <!-- 点位信息 -->
    <position-info :newlyAdded="newlyAdded" :formValidate="formValidate" @cancel="cancel"></position-info>
  </div>
</template>
<script>
import channelTree from "@/view/custom/components/channelTree";
import positionInfo from "@/view/custom/components/positionInfo";
import interestComponent from "@/view/custom/components/interestComponent";
import format from "@/plugin/format.js"; //格式化时间YYYY-MM-DD
import deleteComponent from "@/view/custom/components/deleteComponent";
import {
  searchOrder,
  searchOrderMore,
  searchmachinePosition,
  searchBenefitMachine,
  getOrderExcle,
  deleteOrder
} from "@/api/http";
export default {
  components: {
    channelTree,
    interestComponent,
    positionInfo,
    deleteComponent
  },
  name: "transactionsManagement",

  data() {
    return {
      modalDel: false,
      modal_loading: false, //删除的loading
      delID: null, //删除的ID
      orderNoList: [], //订单字符串数组
      benefitId: null, //利益分配id
      interestNewlyAdded: false,
      positionData: {}, //点位数据
      positionId: null, //点位id
      formValidate: {},
      newlyAdded: false,
      totalMore: null, // 页码数
      pageNumMore: 1, // 页码
      pageSizeMore: 15, // 页容量
      orderNoMore: null, //订单编号
      productCode: null, //商品编码
      productName: null, //商品名称
      shipingStatus: null, //出货状态 出货状态 1 待出货 2 出货成功 3 出货失败 4 部分出货成功
      isShow: false, // 弹框显示状态
      isAdd: false, // 判断当前弹框是否新增
      cardNo: null, //会员身份证（消费者）
      channelId: this.$store.state.user.channelId, // 渠道ID
      endDate: new Date(), //结束时间
      startDate: "", //开始时间
      machineCode: null, //机器编码
      orderNo: null, //主键
      orderStatus: null, //订单状态 1 待支付 2 待出货 3 出货成功 4 出货失败 5 订单关闭 6 部分出货成功
      pageNum: 1, // 页码
      pageSize: 15, // 页容量
      paymentType: null, //支付类型 1:微信, 2:支付宝, 3:人脸支付
      positionId: null, //点位id
      routeId: null, //线路id
      userId: this.$store.state.user.userVo.id,
      userType: this.$store.state.user.userVo.type,
      total: null, // 页码数
      selectionData: [], //选中的数据
      // 数据结构
      columns: [
        {
          type: "selection",
          width: 30,
          align: "center"
        },
        {
          title: "序号",
          type: "index",
          maxWidth: 60,
          minWidth: 30,
          align: "center"
          // render: (h, params) => {
          //   return h("span", params.index+(this.pageNum-1)*this.pageSize+1)
          // }
        },
        {
          title: "订单编号",
          key: "orderNo",
          align: "center",
          minWidth: 130,
          tooltip: true
        },
        {
          title: "消费者",
          key: "cardNo",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "设备编码",
          key: "machineCode",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "点位名称",
          slot: "positionName",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "订单详情",
          slot: "orserList",
          align: "center",
          minWidth: 60,
          tooltip: true
        },

        {
          title: "交易金额(元)",
          key: "orderAmount",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "使用返利金额(元)",
          key: "couponAmount",
          align: "center",
          minWidth: 50,
          tooltip: true
        },
        // {
        //   title: "利润抽成比例(%)",
        //   key: "commissionPercent",
        //   align: "center",
        //   minWidth: 50,
        //   tooltip: true,
        //   render: (h, param) => {
        //     return h("div", param.row.commissionPercent + "%");
        //   }
        // },
        {
          title: "利润抽成总金额(元)",
          slot: "commissionPrice",
          align: "center",
          minWidth: 50,
          tooltip: true
        },
        {
          title: "收款金额(元)",
          slot: "payAmount",
          align: "center",
          minWidth: 50,
          tooltip: true
        },
        {
          title: "利益分配",
          slot: "templateName",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "收款方",
          key: "channelName",
          align: "center",
          minWidth: 40,
          tooltip: true
        },
        {
          title: "交易时间",
          key: "createDate",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "交易状态",
          slot: "orderStatus",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "出货状态",
          slot: "Status",
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
      dataTable: [], // 数据
      // 订单详情的数据结构
      columnsMore: [
        {
          title: "序号",
          type: "index",
          minWidth: 50,
          align: "center"
        },
        {
          title: "商品名称",
          key: "productName",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "购买数量",
          key: "productNumber",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "出货数量",
          key: "productProduce",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "商品进价(元)",
          key: "buyPrice",
          align: "center",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "实际售价(元)",
          key: "actualPrice",
          align: "center",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "活动售价(元)",
          key: "activityPrice",
          align: "center",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "利润抽成比例(%)",
          key: "commissionPercent",
          align: "center",
          minWidth: 120,
          tooltip: true,
          render: (h, param) => {
            if (param.row.commissionPercent == null) {
              return h("div", "0%");
            }
            return h("div", param.row.commissionPercent + "%");
          }
        },
        {
          title: "利润抽成金额(元)",
          slot: "commissionPriceMore",
          align: "center",
          minWidth: 120,
          tooltip: true
        }
      ],
      dataTableMore: [], //订单详情数据
      // 利益分配的数据结构
      columnsBenefit: [
        {
          title: "分配类型",
          slot: "benefitType",
          align: "center",
          // minWidth: 60,
          tooltip: true
        },
        {
          title: "利益分配(%)",
          key: "benefitPercent",
          align: "center",
          // minWidth: 60,
          tooltip: true,
          render: (h, param) => {
            return h("div", param.row.benefitPercent + "%");
          }
        },
        {
          title: "收款方",
          key: "beneficiary",
          align: "center",
          // minWidth: 60,
          tooltip: true
        },
        {
          title: "收款人",
          key: "payee",
          align: "center",
          // minWidth: 60,
          tooltip: true
        },
        {
          title: "收款账户",
          key: "account",
          align: "center",
          minWidth: 100,
          tooltip: true
        }
      ],
      dataTableBenefit: [] //利益分配数据
    };
  },
  computed: {
    startOptions: function() {
      //开始时间的限制，不能选择结束时间之后的时间
      let limitTime = this.endDate; //获取结束时间
      return {
        disabledDate(time) {
          return time > new Date(limitTime);
        }
      };
    },
    endOptions: function() {
      //结束时间的限制，不能选择开始时间之后的时间
      let limitTime = this.startDate; //获取开始时间
      return {
        disabledDate(time) {
          return time < new Date(limitTime);
        }
      };
    }
  },
  // 过滤器
  filters: {
    benefitTypeText(num) {
      switch (num) {
        case 1:
          return "本金";
          break;
        case 2:
          return "利润";
          break;
        case 3:
          return "利润";
          break;
      }
    },
    amountText(value) {
      let realVal = "";
      if (value) {
        // 截取当前数据到小数点后两位
        realVal = parseFloat(value).toFixed(2);
      } else {
        realVal = 0;
      }
      return realVal;
    }
  },
  methods: {
    // 删除按钮操作
    delCancel() {
      this.modal_loading = false;
      this.modalDel = false;
    },
    del() {
      this.modal_loading = true;
      deleteOrder(this.delID)
        .then(res => {
          if (res.data.code == 200) {
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
    select(selection, row) {
      this.orderNoList = [];
      this.selectionData = selection;
    },
    selectCancel(selection, row) {
      this.orderNoList = [];
      this.selectionData = selection;
    },
    selectAll(selection, row) {
      this.orderNoList = [];
      this.selectionData = selection;
    },
    selectAllCancel(selection, row) {
      this.orderNoList = [];
      this.selectionData = selection;
    },
    exportTable() {
      this.selectionData.forEach(item => this.orderNoList.push(item.orderNo));
      this.exportOrderExcle();
    },
    // 利益分配查看详情
    toLinkInterest(row, value) {
      console.log(row);
      this.benefitId = row.benefitId;
      this.getBenefitMachine();
      this.interestNewlyAdded = true;
    },
    // 点位信息
    showPositin(row) {
      this.positionId = row.positionId;
      this.getmachinePosition();
      this.newlyAdded = true;
    },
    cancel() {
      this.newlyAdded = false;
    },
    handleChangeStart(value) {
      this.startDate = value;
    },
    handleChangeEnd(value) {
      this.endDate = value;
    },
    clickTreeRow(value) {
      if (value) {
        this.channelId = value.id;
        this.getOrder();
      }
    },
    // 用户重置按钮
    reset() {
      this.startDate = "";
      this.endDate = "";
      this.orderNo = "";
      this.machineCode = null;
      this.pageNum = 1;
      this.getOrder(); // 重新获取数据
    },
    // 页码改变时触发
    pageChange(value) {
      this.pageNum = value;
      this.getOrder(); // 重新获取数据
    },
    // 页容量改变时触发
    sizeChange(value) {
      this.pageSize = value;
      this.getOrder(); // 重新获取数据
    },
    // 交易详情页码改变时触发
    pageChangeMore(value) {
      this.pageNumMore = value;
    },
    //交易详情页容量改变时触发
    sizeChangeMore(value) {
      this.pageSizeMore = value;
    },
    //查看交易详情
    seeSettlementMore(row) {
      this.orderNoMore = row.orderNo;
      this.isShow = true;
      this.getOrderMore();
    },
    // 退款点击事件
    refund(row) {},
    searchOrder() {
      this.pageNum = 1;
      this.getOrder();
    },
    // 获取交易列表
    getOrder() {
      this.startDate = format(this.startDate, "YYYY-MM-DD 00:00:00");
      this.endDate = format(this.endDate, "YYYY-MM-DD HH:mm:ss");
      let data = {
        cardNo: this.cardNo, //会员身份证（消费者）
        channelId: this.channelId, // 渠道ID
        endDate: this.endDate, //结束时间
        startDate: this.startDate, //开始时间
        machineCode: this.machineCode, //机器编码
        orderNo: this.orderNo, //主键
        orderStatus: this.orderStatus, //订单状态 1 待支付 2 待出货 3 出货成功 4 出货失败 5 订单关闭 6 部分出货成功
        paymentType: this.paymentType, //支付类型 1:微信, 2:支付宝, 3:人脸支付
        positionId: this.positionId, //点位id
        routeId: this.routeId, //线路id
        pageNum: this.pageNum, // 页码
        pageSize: this.pageSize, // 页容量
        userId: this.userId,
        userType: this.userType
      };
      searchOrder(data).then(res => {
        if (res.data.code == 200) {
          this.dataTable = res.data.result.list;
          this.total = res.data.result.total;
          this.pageNum = res.data.result.pageNum;
        }
      });
    },
    // 获取交易列表详情
    getOrderMore() {
      let data = {
        orderNo: this.orderNoMore, //主键
        productCode: this.productCode, //商品编码
        productName: this.productName, //商品名称
        shipingStatus: this.shipingStatus, //出货状态 出货状态 1 待出货 2 出货成功 3 出货失败 4 部分出货成功
        pageNum: this.pageNumMore, // 页码
        pageSize: this.pageSizeMore // 页容量
      };
      searchOrderMore(data).then(res => {
        if (res.data.code == 200) {
          this.dataTableMore = res.data.result;
        }
      });
    },
    //通过点位id和渠道id查找点位信息
    getmachinePosition() {
      let data = {
        channelId: this.channelId,
        positionId: this.positionId,
        pageNum: 1,
        pageSize: 1
      };
      searchmachinePosition(data).then(res => {
        if (res.data.code == 200) {
          this.positionData = res.data.result.list[0];
          this.formValidate = this.positionData;
          this.formValidate.areaIds = this.positionData.areaIds
            .split(",")
            .map(item => {
              return parseInt(item);
            });
          this.formValidate.runDate = this.positionData.runDate.split("-");
          this.formValidate.positionType = this.positionData.positionType + "";
          this.formValidate.cooperationType =
            this.positionData.cooperationType + "";
          this.formValidate.benefitId = this.positionData.benefitId + "";
          this.formValidate.routeId = this.positionData.routeId + "";
        }
      });
    },
    // 根据id查询利益分配详情信息
    getBenefitMachine() {
      searchBenefitMachine(this.benefitId).then(res => {
        if (res.data.code == 200) {
          this.dataTableBenefit = res.data.result;
        }
      });
    },
    // 导出的方法
    exportOrderExcle() {
      this.startDate = format(this.startDate, "YYYY-MM-DD 00:00:00");
      this.endDate = format(this.endDate, "YYYY-MM-DD HH:mm:ss");
      let data = {
        channelId: this.channelId, // 渠道ID
        endDate: this.endDate, //结束时间
        startDate: this.startDate, //开始时间
        machineCode: this.machineCode, //机器编码
        // pageNum: this.pageNum, // 页码
        // pageSize: this.pageSize, // 页容量
        userId: this.userId,
        userType: this.userType,
        orderNoList: this.orderNoList
      };
      getOrderExcle(data).then(res => {
        const blob = new Blob([res.data]);
        const fileName = "订单列表.xlsx";
        const elink = document.createElement("a");
        elink.download = fileName;
        elink.style.display = "none";
        elink.href = URL.createObjectURL(blob);
        document.body.appendChild(elink);
        elink.click();
        URL.revokeObjectURL(elink.href); // 释放URL 对象
        document.body.removeChild(elink);
      });
    }
  },

  mounted() {
    var date1 = new Date();
    var date2 = new Date(date1);
    this.startDate = date2.setDate(date1.getDate() - 30);
    this.getOrder();
  }
};
</script>

<style lang="less" scoped>
.transactionsManagement {
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
  .leftBox {
    min-width: 250px;
    min-height: 900px;
    float: left;
    margin-right: 20px;
  }
  .lookDetails {
    text-decoration: underline;
  }
}
</style>