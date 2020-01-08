<template>
  <div class="transactionsManagement">
    <div class="leftBox">
      <channel-tree @clickTreeRow="clickTreeRow" ref="channelTree"></channel-tree>
    </div>
    <div class="rightDiv">
      <Input v-model="orderNo" style="margin-right:10px" placeholder="订单编号" clearable />
      <Input v-model="machineCode" style="margin-right:10px" placeholder="设备编码" clearable />
      <Poptip
        trigger="click"
        placement="bottom"
        @on-popper-hide="popperHide"
        @on-popper-show="popperShow"
      >
        <Input v-model="routeName" placeholder="分区线路" />
        <div slot="content">
          <Tree
            multiple
            show-checkbox
            check-strictly
            style="max-height:180px;overflow:auto"
            ref="treeData"
            :data="treeData"
          ></Tree>
        </div>
      </Poptip>
      <Select
        v-model="orderStatus"
        clearable
        placeholder="交易状态"
        style="width:100px;margin-right:10px"
      >
        <Option v-for="(item,i) in statusList" :value="item.value" :key="item+i">{{ item.label }}</Option>
      </Select>
      <Select
        v-model="refundStatusText"
        clearable
        placeholder="退款状态"
        @on-change="refundStatusChange"
        style="width:100px;margin-right:10px"
      >
        <Option v-for="(item,i) in refundList" :value="item.value" :key="item+i">{{ item.label }}</Option>
      </Select>
      <DatePicker
        v-model="startDate"
        type="datetime"
        :options="startOptions"
        placeholder="开始时间"
        @on-change="handleChangeStart"
        style="width: 160px"
      ></DatePicker>
      <span>&nbsp至&nbsp&nbsp</span>
      <DatePicker
        v-model="endDate"
        type="datetime"
        :options="endOptions"
        placeholder="结束时间"
        @on-change="handleChangeEnd"
        style="width: 160px"
      ></DatePicker>
      <Button type="primary" @click="getSearchOrder" v-if="hasPerm('set:tranlist:seeback')">查询</Button>
      <Button type="primary" @click="reset" v-if="hasPerm('set:tranlist:seeback')">重置</Button>
      <Button type="success" @click="exportTable" v-if="hasPerm('set:tranlist:seeback')">导出</Button>
      <Table
        @on-row-click="rowClick"
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
          <span style="color:#ed4014">{{row.commissionPrice|amountText}}</span>
        </template>
        <!-- 收款金额 -->
        <template slot-scope="{row,index}" slot="payAmount">
          <span
            style="color:#19be6b"
            v-show="row.orderStatus!=1&&row.orderStatus!=5"
          >{{row.payAmount}}</span>
          <span style="color:#19be6b" v-show="row.orderStatus==1||row.orderStatus==5">0</span>
        </template>
        <!-- 利益分配 -->
        <template slot-scope="{row,index}" slot="templateName">
          <a v-show="row.benefitId" class="lookDetails" @click="toLinkInterest(row)">查看详情</a>
          <span v-show="!row.benefitId">——</span>
        </template>
        <!-- 交易状态 -->
        <template slot-scope="{row,index}" slot="orderStatus">
          <span v-show="row.orderStatus==1">待支付</span>
          <span v-show="row.orderStatus==2">待出货</span>
          <span v-show="row.orderStatus==3">交易正常</span>
          <span v-show="row.orderStatus==4">交易失败</span>
          <span v-show="row.orderStatus==5">订单关闭</span>
          <span v-show="row.orderStatus==6">交易异常</span>
        </template>
        <!-- 出货状态 -->
        <template slot-scope="{row,index}" slot="Status">
          <span v-show="row.orderStatus==3" style="color:#19be6b">出货成功</span>
          <span v-show="row.orderStatus==6" style="color:#ff9900">部分出货成功</span>
          <span v-show="row.orderStatus==4" style="color:#ed4014">出货失败</span>
        </template>
        <template slot-scope="{row,index}" slot="refundAmount">
          <span style="color:#ed4014" v-show="row.refundStatus==2">{{row.refundAmount}}</span>
        </template>
        <template slot-scope="{row,index}" slot="operation">
          <!-- 退款按钮 -->
          <Button
            style="float:left"
            type="primary"
            size="small"
            @click="refund(row)"
            v-if="hasPerm('set:tranlist:refundback')&&((row.sendBack==2&&row.orderStatus==3)||row.sendBack!=2)&&row.refundStatus==1&&(row.orderStatus==2||row.orderStatus==3||row.orderStatus==4||row.orderStatus==6)"
          >&nbsp退款&nbsp</Button>
          <Button
            style="float:left"
            disabled
            type="primary"
            size="small"
            v-if="hasPerm('set:tranlist:refundback')&&row.refundStatus==2&&(row.orderStatus==2||row.orderStatus==3||row.orderStatus==4||row.orderStatus==6)"
          >已退款</Button>
          <Button
            style="float:left"
            type="primary"
            size="small"
            @click="clear(row)"
            v-if="hasPerm('set:tranlist:refundback')&&(row.sendBack==3||row.sendBack==1)&&(row.orderStatus==2||row.orderStatus==4||row.orderStatus==6)"
          >&nbsp清算&nbsp</Button>
          <Button
            style="float:left;margin-right:5px"
            disabled
            type="primary"
            size="small"
            v-if="hasPerm('set:tranlist:refundback')&&row.sendBack==2&&(row.orderStatus==2||row.orderStatus==4||row.orderStatus==6)"
          >已清算</Button>
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
    <!-- 订单详情弹框的模态框 -->
    <Modal v-model="isShow" :mask-closable="false" title="订单详情" width="1200">
      <Table :columns="columnsMore" :data="dataTableMore" border ref="table" style="margin:20px 0">
        <!-- 订单详情抽成金额 -->
        <template slot-scope="{row,index}" slot="commissionPriceMore">
          <span>{{parseFloat((row.actualPrice-row.buyPrice)*row.productProduce*(row.commissionPercent/100)).toFixed(2)}}</span>
        </template>
      </Table>
      <div slot="footer">
        <Button type="primary" size="large" @click="isShow=false">确定</Button>
      </div>
    </Modal>
    <!-- 利益分配 -->
    <Modal
      class="interest"
      v-model="interestNewlyAdded"
      width="800"
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
    <!-- 退款页面 -->
    <Modal
      v-model="isShowRefund"
      :mask-closable="false"
      title="退款"
      width="1200"
      class="refundModal"
    >
      <Table
        :columns="columnsRefund"
        :data="dataTableMore"
        border
        ref="tableRefund"
        style="margin:20px 0"
      >
        <!-- 出货状态 -->
        <template slot-scope="{row,index}" slot="productType">
          <span v-show="(row.productNumber-row.productProduce)==0" style="color:#19be6b">出货正常</span>
          <span
            v-show="(row.productNumber-row.productProduce)==row.productNumber"
            style="color:#ed4014"
          >出货失败</span>
          <span
            v-show="(row.productNumber-row.productProduce)>0&&row.productProduce!=0"
            style="color:#ff9900"
          >部分出货成功</span>
        </template>
        <template slot-scope="{row,index}" slot="activityPrice">{{row.activityPrice|activityText}}</template>
        <template slot-scope="{row,index}" slot="productPrice">
          <span v-if="row.activityPrice>0">{{row.productNumber*row.activityPrice}}</span>
          <span v-else>{{row.productNumber*row.actualPrice}}</span>
        </template>
        <template slot-scope="{row,index}" slot="refundNum">
          <div>
            <button class="subBtn" @click="subtract(row,index)">-</button>
            <input @input="countChange(index,row)" class="stockInput" v-model="row.refundNumber" />
            <button class="addBtn" @click="add(row,index)">
              <span class="spanAdd">+</span>
            </button>
          </div>
        </template>
      </Table>
      <div class="textDiv">
        <div class="leftReason">
          退款原因：
          <Input :maxlength="30" v-model.trim="refundReason" />
        </div>
        <div class="rightPrice">
          使用返利金额：
          <strong>{{couponAmount}}</strong>&nbsp元&nbsp
          实际收款金额：
          <strong>{{payAmount}}</strong>&nbsp元&nbsp
          退款金额：
          <Input disabled :value="refundAmount" class="text" />元
        </div>
      </div>
      <div slot="footer">
        <Button
          type="text"
          style="border:1px solid #c6c9ce"
          size="large"
          @click="isShowRefund=false"
        >取消</Button>
        <Button type="primary" size="large" :loading="loading" @click="refundModalConfirm">确定</Button>
      </div>
    </Modal>
    <!-- 清算页面 -->
    <Modal v-model="isShowClear" :mask-closable="false" title="清算" width="1200" class="clearModal">
      <Table
        :columns="columnsClear"
        :data="dataTableMore"
        border
        ref="tableRefund"
        style="margin:20px 0"
      >
        <!-- 出货状态 -->
        <template slot-scope="{row,index}" slot="productType">
          <span v-show="(row.productNumber-row.productProduce)==0" style="color:#19be6b">出货正常</span>
          <span
            v-show="(row.productNumber-row.productProduce)==row.productNumber"
            style="color:#ed4014"
          >出货失败</span>
          <span
            v-show="(row.productNumber-row.productProduce)>0&&row.productProduce!=0"
            style="color:#ff9900"
          >部分出货成功</span>
        </template>
        <template slot-scope="{row,index}" slot="activityPrice">{{row.activityPrice|activityText}}</template>
        <template slot-scope="{row,index}" slot="productPrice">
          <span v-if="row.activityPrice>0">{{row.productNumber*row.activityPrice}}</span>
          <span v-else>{{row.productNumber*row.actualPrice}}</span>
        </template>
        <template
          slot-scope="{row,index}"
          slot="clearNum"
        >{{row.productNumber-row.productProduce-row.refundNumber|clearNumText}}</template>
      </Table>
      <div class="textDiv">
        <div class="leftReason">
          清算原因：
          <Input :maxlength="30" v-model.trim="refundReason" />
        </div>
        <div class="rightPrice">
          使用返利金额：
          <strong>{{couponAmount}}</strong>&nbsp元&nbsp
          实际收款金额：
          <strong>{{payAmount}}</strong>&nbsp元&nbsp
          清算金额：
          <Input disabled v-model="clearPrice" class="text" />元
        </div>
      </div>
      <div slot="footer">
        <Button
          type="text"
          style="border:1px solid #c6c9ce"
          size="large"
          @click="isShowClear=false"
        >取消</Button>
        <Button type="primary" size="large" @click="isShowClear=false">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import channelTree from "@/view/custom/components/channelTree";
import positionInfo from "@/view/custom/components/positionInfo";
import interestComponent from "@/view/custom/components/interestComponent";
import format from "@/plugin/format.js"; //格式化时间YYYY-MM-DD
import {
  searchOrder,
  searchOrderMore,
  searchmachinePosition,
  searchBenefitMachine,
  getOrderExcle,
  deleteOrder,
  searchTreeByUser,
  refundOrder
} from "@/api/http";
export default {
  components: {
    channelTree,
    interestComponent,
    positionInfo
  },
  name: "transactionsManagement",

  data() {
    return {
      loading: false,
      refundReason: null,
      isShowClear: false,
      columnsClear: [
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
          minWidth: 180,
          tooltip: true
        },
        {
          title: "购买数量",
          key: "productNumber",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "出货数量",
          key: "productProduce",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "退款数量",
          key: "refundNumber",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "出货状态",
          slot: "productType",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "销售价格(元)",
          key: "actualPrice",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "活动价格(元)",
          slot: "activityPrice",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "销售金额(元)",
          slot: "productPrice",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "清算数量",
          slot: "clearNum",
          align: "center",
          minWidth: 80,
          tooltip: true
        }
      ],
      once: false,
      routeName: null,
      treeData: [],
      statusList: [
        {
          value: "1",
          label: "待支付"
        },
        {
          value: "2",
          label: "待出货"
        },
        {
          value: "3",
          label: "交易正常"
        },
        {
          value: "4",
          label: "交易失败"
        },
        {
          value: "5",
          label: "订单关闭"
        },
        {
          value: "6",
          label: "交易异常"
        }
      ],
      refundList: [
        {
          value: "0",
          label: "全部"
        },
        {
          value: "1",
          label: "未退款"
        },
        {
          value: "2",
          label: "已退款"
        }
      ],
      couponAmount: null,
      payAmount: null,
      isShowRefund: false,
      columnsRefund: [
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
          minWidth: 180,
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
          title: "出货状态",
          slot: "productType",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "销售价格(元)",
          key: "actualPrice",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "活动价格(元)",
          slot: "activityPrice",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "销售金额(元)",
          slot: "productPrice",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "退款数量",
          align: "center",
          slot: "refundNum",
          minWidth: 120,
          tooltip: true
        }
      ],
      orderNoList: [], //订单字符串数组
      benefitId: null, //利益分配id
      interestNewlyAdded: false,
      positionData: {}, //点位数据
      positionId: null, //点位id
      formValidate: {},
      newlyAdded: false,
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
      refundStatusText: null,
      refundStatus: null, //是否已退款 1 未退款 2 已退款
      orderStatus: null, //订单状态 1 待支付 2 待出货 3 出货成功 4 出货失败 5 订单关闭 6 部分出货成功
      pageNum: 1, // 页码
      pageSize: 15, // 页容量
      paymentType: null, //支付类型 1:微信, 2:支付宝, 3:人脸支付
      positionId: null, //点位id
      routeId: null, //线路id
      routeType: null,
      routes: [],
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
        {
          title: "利润抽成总金额(元)",
          slot: "commissionPrice",
          align: "center",
          minWidth: 60,
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
          minWidth: 100,
          tooltip: true
        },
        {
          title: "交易时间",
          key: "createDate",
          align: "center",
          minWidth: 120,
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
          minWidth: 130,
          tooltip: true
        },
        {
          title: "退款金额",
          align: "center",
          slot: "refundAmount",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "退款时间",
          align: "center",
          key: "refundDate",
          minWidth: 80,
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
          minWidth: 180,
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
          minWidth: 80,
          tooltip: true
        },
        {
          title: "实际售价(元)",
          key: "actualPrice",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "活动售价(元)",
          key: "activityPrice",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "利润抽成比例(%)",
          key: "commissionPercent",
          align: "center",
          minWidth: 80,
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
          minWidth: 80,
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
          minWidth: 60,
          tooltip: true
        },
        {
          title: "利益分配(%)",
          key: "benefitPercent",
          align: "center",
          minWidth: 60,
          tooltip: true,
          render: (h, param) => {
            if (param.row.benefitPercent == 0) {
              return h("div", "————");
            }
            return h("div", param.row.benefitPercent + "%");
          }
        },
        {
          title: "收款方",
          key: "beneficiary",
          align: "center",
          minWidth: 120,
          tooltip: true
        },
        {
          title: "收款人",
          key: "payee",
          align: "center",
          minWidth: 120,
          tooltip: true
        },
        {
          title: "收款账户",
          key: "account",
          align: "center",
          minWidth: 120,
          tooltip: true
        }
      ],
      dataTableBenefit: [] //利益分配数据
    };
  },
  computed: {
    clearPrice() {
      let value = this.dataTableMore
        .map((v, i) => {
          if (v.productNumber != v.productProduce) {
            if (v.activityPrice) {
              return (
                (v.productNumber - v.productProduce - v.refundNumber) *
                v.activityPrice
              );
            } else {
              return (
                (v.productNumber - v.productProduce - v.refundNumber) *
                v.actualPrice
              );
            }
          }
        })
        .reduce((pre, cur) => {
          return pre + cur || 0;
        }, 0);
      return value < 0 ? 0 : value > this.payAmount ? this.payAmount : value;
    },
    refundAmount() {
      let value = this.dataTableMore
        .map((v, i) => {
          if (v.activityPrice) return v.refundNumber * v.activityPrice;
          return v.refundNumber * v.actualPrice;
        })
        .reduce((pre, cur) => {
          return pre + cur;
        }, 0);
      let value2 = this.dataTableMore
        .map((v, i) => {
          if (v.productNumber != v.productProduce) {
            if (v.activityPrice) {
              return (v.productNumber - v.productProduce) * v.activityPrice;
            } else {
              return (v.productNumber - v.productProduce) * v.actualPrice;
            }
          }
        })
        .reduce((pre, cur) => {
          return pre + cur || 0;
        }, 0);
      return value > this.payAmount
        ? this.payAmount
        : this.once
        ? value2
        : value;
    },
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
    },
    activityText(value) {
      let realVal = "";
      if (value) {
        // 截取当前数据到小数点后两位
        realVal = parseFloat(value).toFixed(2);
      } else {
        realVal = "——";
      }
      return realVal;
    },
    clearNumText(num) {
      let realVal = "";
      if (num >= 0) {
        realVal = num;
      } else {
        realVal = 0;
      }
      return realVal;
    }
  },
  methods: {
    rowClick(value, index) {
      const id = value.channelId;
      const treeData = this.$refs.channelTree.treeData;
      this.recursion(treeData, id);
      let nodes = document.querySelectorAll(".tree a");
      nodes.forEach((v, i) => {
        nodes[i].classList.remove("curSelectedNode");
      });
      let node = document.querySelector(
        '.tree a[title="' + this.recursionData.id + '"]'
      );
      node.classList.add("curSelectedNode");
    },
    recursion(ary, value) {
      ary.find(v => {
        if (value == v.id) {
          this.recursionData = v;
          return true;
        } else {
          if (v.children) this.recursion(v.children, value);
        }
      });
    },
    popperShow() {
      this.getSearchTreeByUser();
      this.routes = [];
    },
    popperHide() {
      let ary = [];
      this.$refs.treeData.getCheckedNodes().forEach(item => {
        this.routes.push({
          routeId: item.id,
          routeType: item.routeType
        });
        ary.push(item.name);
      });
      this.routeName = ary.join(",");
    },
    countChange(index, row) {
      this.once = false;
      if (row.refundNumber > row.productNumber) {
        row.refundNumber = row.productNumber;
        this.dataTableMore[index].refundNumber = row.productNumber;
      } else {
        this.dataTableMore[index].refundNumber = row.refundNumber;
      }
    },
    add(row, index) {
      this.once = false;
      console.log(row);
      if (row.refundNumber >= row.productNumber) {
        row.refundNumber = row.productNumber;
      } else {
        row.refundNumber++;
        this.dataTableMore[index].refundNumber = row.refundNumber;
      }
    },
    subtract(row, index) {
      this.once = false;
      if (row.refundNumber <= 0) {
        row.refundNumber = 0;
        this.dataTableMore[index].refundNumber = 0;
      } else {
        row.refundNumber--;
        this.dataTableMore[index].refundNumber = row.refundNumber;
      }
    },
    refundStatusChange(value) {
      value == "0"
        ? (this.refundStatus = null)
        : value == "1"
        ? (this.refundStatus = 1)
        : (this.refundStatus = 2);
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
        const treeData = this.$refs.channelTree.treeData;
        this.recursion(treeData, this.channelId);
        let nodes = document.querySelectorAll(".tree a");
        nodes.forEach((v, i) => {
          nodes[i].classList.remove("curSelectedNode");
        });
        let node = document.querySelector(
          '.tree a[title="' + this.recursionData.id + '"]'
        );
        node.classList.add("curSelectedNode");
      }
    },
    // 用户重置按钮
    reset() {
      this.startDate = "";
      this.endDate = "";
      this.orderNo = "";
      this.machineCode = null;
      this.orderStatus = null;
      this.refundStatus = null;
      this.refundStatusText = null;
      this.routeName = null;
      this.routes = [];
      this.pageNum = 1;
      this.pageSize = 15;
      this.total = null;
      this.channelId = this.$store.state.user.channelId;
      this.getOrder(); // 重新获取数据
      this.getSearchTreeByUser();
      this.$refs.channelTree.getTreeData();
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
    //查看交易详情
    seeSettlementMore(row) {
      this.orderNoMore = row.orderNo;
      this.isShow = true;
      this.getOrderMore();
    },
    // 退款点击事件
    refund(row) {
      console.log(row);
      this.loading = false;
      this.refundReason = null;
      this.once = true;
      this.channelId = row.channelId;
      this.orderNoMore = row.orderNo;
      this.isShowRefund = true;
      this.couponAmount = row.couponAmount;
      this.payAmount = row.payAmount;
      this.getOrderMore();
    },
    refundModalConfirm() {
      let array = [];
      this.dataTableMore.forEach(item => {
        if (item.productNumber != item.productProduce) {
          if (item.refundNumber == 0) {
            array.push(item.refundNumber);
          }
        }
      });
      if (array.length) {
        this.$Message.error("退货数量有误,请修改!");
      } else {
        if (!this.refundAmount) {
          this.$Message.error("请修改退款金额");
        } else {
          this.loading = true;
          let list = [];
          this.dataTableMore.forEach(item => {
            list.push({
              activityPrice: item.activityPrice,
              actualPrice: item.actualPrice,
              buyPrice: item.buyPrice,
              channelId: item.channelId,
              couponAquire: item.couponAquire,
              detailNo: item.detailNo,
              integralAquire: item.integralAquire,
              productCode: item.productCode,
              productName: item.productName,
              refundNumber: item.refundNumber,
              salePrice: item.salePrice
            });
          });
          let data = {
            refundDetailList: list,
            channelId: this.channelId,
            operator: this.$store.state.user.userId,
            operatorName: this.$store.state.user.userName,
            orderNo: this.orderNoMore,
            refundAmount: this.refundAmount,
            refundStatus: 3,
            refundType: 1,
            refundReason: this.refundReason
          };
          refundOrder(data)
            .then(res => {
              if (res.data.code == 200) {
                this.loading = false;
                this.isShowRefund = false;
                this.$Message.info("退款成功");
                this.getOrder();
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
    },
    clear(row) {
      console.log(row);
      this.channelId = row.channelId;
      this.orderNoMore = row.orderNo;
      this.isShowClear = true;
      this.couponAmount = row.couponAmount;
      this.payAmount = row.payAmount;
      this.getOrderMore();
    },
    getSearchOrder() {
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
        refundStatus: this.refundStatus,
        orderStatus: this.orderStatus, //订单状态 1 待支付 2 待出货 3 出货成功 4 出货失败 5 订单关闭 6 部分出货成功
        paymentType: this.paymentType, //支付类型 1:微信, 2:支付宝, 3:人脸支付
        positionId: this.positionId, //点位id
        routes: this.routes,
        pageNum: this.pageNum, // 页码
        pageSize: this.pageSize, // 页容量
        userId: this.userId,
        userType: this.userType,
        managerRoute: this.$store.state.user.userVo.managerRoute
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
        pageNum: 1, // 页码
        pageSize: 10000 // 页容量
      };
      searchOrderMore(data).then(res => {
        if (res.data.code == 200) {
          this.dataTableMore = res.data.result;
          this.dataTableMore.forEach(item => {
            item.refundNumber == null
              ? (item.refundNumber = 0)
              : item.refundNumber;
          });
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
        userId: this.userId,
        userType: this.userType,
        orderNoList: this.orderNoList,
        managerRoute: this.$store.state.user.userVo.managerRoute,
        sendBack: this.sendBack,
        routes: this.routes,
        refundStatus: this.refundStatus
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
    },
    getSearchTreeByUser() {
      let data = {
        channelId: this.channelId,
        managerRoute: this.$store.state.user.userVo.managerRoute,
        userId: this.$store.state.user.userVo.id,
        userType: this.$store.state.user.userVo.type
      };
      searchTreeByUser(data).then(res => {
        if (res.data.code == 200) {
          this.treeData = res.data.result;
        }
      });
    }
  },

  mounted() {
    var date1 = new Date();
    var date2 = new Date(date1);
    this.startDate = date2.setDate(date1.getDate() - 30);
    this.getOrder();
    this.getSearchTreeByUser();
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
.refundModal,
.clearModal {
  .subBtn,
  .addBtn {
    width: 22px;
    height: 22px;
    margin: 0 5px;
    border: 0px;
    border-radius: 2px;
    line-height: 19px;
  }
  .subBtn {
    border: 1px solid #ddd;
    background-color: #fff;
    /deep/ .spanSubtract {
      font-size: 14px;
    }
  }
  .addBtn {
    border: 1px solid #2d8cf0;
    background-color: #2d8cf0;
    /deep/ .spanAdd {
      font-size: 14px;
      color: #fff;
    }
  }
  .textDiv {
    overflow: hidden;
    .leftReason {
      float: left;
    }
    .rightPrice {
      float: right;
    }
  }
  .text {
    width: 80px;
    /deep/ .ivu-input {
      text-align: center;
      font-size: 14px;
    }
  }
  .stockInput {
    width: 60px;
    height: 22px;
    text-align: center;
  }
}
</style>