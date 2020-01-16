<template>
  <div class="clientManagement">
    <div class="clientManagementContent">
      <Input class="input" v-model="memberName" clearable placeholder="会员姓名" />
      <Input class="input" v-model="cardNo" placeholder="身份证号" clearable />
      <Input class="input" v-model="memberPhone" placeholder="联系电话" clearable />
      <Button type="primary" @click="searchGetMember">查询</Button>
      <Button type="primary" @click="reset">重置</Button>

      <!-- 表格 -->
      <Table
        highlight-row
        ref="table"
        border
        :columns="columns"
        :data="dataTable"
        style="margin:20px 0"
      >
        <template slot-scope="{row,index}" slot="cardNo">
          <span>{{row.cardNo|cardNo}}</span>
        </template>
        <!-- 联系电话 -->
        <template slot-scope="{row,index}" slot="memberPhone">{{row.memberPhone|text}}</template>
        <!-- 返现金额 -->
        <template slot-scope="{row,index}" slot="rebatePrice">
          <a
            v-show="row.rebatePrice"
            class="lookDetails"
            @click="seeRebatePrice(row)"
          >{{row.rebatePrice|priceText}}</a>
          <span v-show="!row.rebatePrice">——</span>
        </template>
        <!-- 积分 -->
        <template slot-scope="{row,index}" slot="integral">
          <a v-show="row.integral" class="lookDetails" @click="seeIntegral(row)">{{row.integral}}</a>
          <span v-show="!row.integral">——</span>
        </template>
        <!-- 交易记录 -->
        <template slot-scope="{row,index}" slot="action">
          <a class="lookDetails" @click="seeOrder(row)">查看详情</a>
        </template>
      </Table>

      <!-- 页码 -->
      <Page
        :total="total"
        show-elevator
        :current="pageNum"
        @on-change="pageChange"
        :page-size="pageSize"
        @on-page-size-change="sizeChange"
        show-sizer
      />

      <!-- 交易订单明细弹出框 -->
      <Modal v-model="isShow" :mask-closable="false" width="1200" title="交易明细">
        <Table
          :columns="columnsOrder"
          :data="dataTableOrder"
          border
          height="500"
          ref="table"
          style="margin:20px 0"
        >
          <template slot-scope="{row,index}" slot="couponAquire">{{row.couponAquire|text}}</template>
          <template slot-scope="{row,index}" slot="integralAquire">{{row.integralAquire|text}}</template>
          <template slot-scope="{row,index}" slot="orderStatus">
            <span v-show="row.shipingStatus==2||row.shipingStatus==4">交易正常</span>
            <span v-show="row.shipingStatus==1||row.shipingStatus==3" style="color:red">交易失败</span>
          </template>
          <!-- 出货状态 -->
          <template slot-scope="{row,index}" slot="Status">
            <span v-show="row.shipingStatus==1">待出货</span>
            <span v-show="row.shipingStatus==2||row.shipingStatus==4">出货成功</span>
            <span v-show="row.shipingStatus==3" style="color:red">出货失败</span>
          </template>
        </Table>
        <div slot="footer">
          <Button type="primary" size="large" @click="isShow=false">确定</Button>
        </div>
      </Modal>

      <!-- 返利弹框 -->
      <Modal v-model="isShowRebatePrice" :mask-closable="false" width="500" title="返现">
        <Table
          height="500"
          :columns="columnsRebatePrice"
          :data="dataTablemodal"
          border
          ref="tablemodal"
          style="margin:20px 0"
        ></Table>
        <div slot="footer">
          <Button type="primary" size="large" @click="isShowRebatePrice=false">确定</Button>
        </div>
      </Modal>
      <!-- 积分弹框 -->
      <Modal v-model="isShowIntegral" :mask-closable="false" width="500" title="积分">
        <Table
          height="500"
          :columns="columnsIntegral"
          :data="dataTablemodal"
          border
          ref="tableIntegral"
          style="margin:20px 0"
        ></Table>
        <div slot="footer">
          <Button type="primary" size="large" @click="isShowIntegral=false">确定</Button>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script>
import CoustomTree from "@/view/custom/components/coustom-tree";
import { searchMember, searchMemberMore, searchMemberOrder } from "@/api/http";
export default {
  components: {
    CoustomTree
  },
  name: "clientManagement",
  data() {
    return {
      isShowIntegral: false,
      columnsIntegral: [
        { title: "序号", type: "index", width: 60, align: "center" },
        {
          title: "商品类型",
          key: "categoryName",
          align: "center",
          tooltip: true
        },
        {
          title: "积分(分)",
          key: "integral",
          align: "center",
          tooltip: true
        }
      ],
      isShowRebatePrice: false,
      columnsRebatePrice: [
        { title: "序号", type: "index", width: 60, align: "center" },
        {
          title: "商品类型",
          key: "categoryName",
          align: "center",
          tooltip: true
        },
        {
          title: "返利金额(元)",
          key: "remainingProfit",
          align: "center",
          tooltip: true
        },
        {
          title: "推荐返利金额(元)",
          key: "recommendedProfit",
          align: "center",
          tooltip: true
        }
      ],
      dataTablemodal: [], //积分和返利数据
      cardNoMore: null,
      isShow: false, // 交易记录弹框显示方式
      // 交易记录数据结构
      columnsOrder: [
        { title: "序号", type: "index", width: 60, align: "center" },
        {
          title: "订单编号",
          key: "orderNo",
          align: "center",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "设备编码",
          key: "machineCode",
          align: "center",
          tooltip: true
        },
        {
          title: "交易时间",
          key: "createDate",
          align: "center",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "购买商品",
          key: "productName",
          align: "center",
          minWidth: 100,
          tooltip: true
        },

        {
          title: "交易金额",
          key: "price",
          align: "center",
          tooltip: true
        },
        {
          title: "返现",
          slot: "couponAquire",
          align: "center",
          maxWidth: 100,
          tooltip: true
        },
        {
          title: "积分",
          slot: "integralAquire",
          align: "center",
          tooltip: true
        },
        {
          title: "交易状态",
          slot: "orderStatus",
          align: "center",
          tooltip: true
        },
        {
          title: "出货状态",
          slot: "Status",
          align: "center",
          tooltip: true
        }
      ],
      dataTableOrder: [], //交易记录数据
      cardNoOrder: null, //会员身份证（消费者）
      total: null, // 总页码数
      pageNum: 1, // 页码
      pageSize: 15, // 页容量
      alipayState: "", // 是否已绑定支付宝用户唯一标识 0 未绑定 1绑定
      buyerId: null, //支付宝唯一买家账号
      cardNo: null, //身份证号码
      id: null, //id
      memberName: null, //姓名
      memberPhone: null, //电话
      memberSex: null, //性别:1 男 2 女
      openId: null, //如果用户使用微信支付并且关注了公众号即可获取
      pid: null, //
      wxState: null, //是否已绑定微信用户唯一标识 0 未绑定 1绑定
      // 会员表格数据结构
      columns: [
        {
          title: "序号",
          type: "index",
          maxWidth: 60,
          minWidth: 30,
          align: "center"
        },
        {
          title: "所属商户",
          key: "channelNames",
          align: "center",
          minWidth: 240,
          tooltip: true,
          render: (h, param) => {
            return h("div", param.row.channelNames.join(","));
          }
        },
        {
          title: "会员姓名",
          key: "nickName",
          align: "center",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "身份证号码",
          slot: "cardNo",
          align: "center",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "联系电话",
          slot: "memberPhone",
          align: "center",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "交易次数",
          key: "dealNumber",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "交易金额(元)",
          key: "orderPrice",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "返现(元)",
          slot: "rebatePrice",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "积分(分)",
          slot: "integral",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "交易记录",
          slot: "action",
          minWidth: 80,
          align: "center",
          tooltip: true
        }
      ],
      dataTable: [] //会员表格数据
    };
  },
  // 过滤器
  filters: {
    cardNo(value) {
      let realVal = "";
      if (value) {
        realVal = `${value.substring(0, 3)}****${value.substring(
          value.length - 4
        )}`;
      } else {
        realVal = "——";
      }
      return realVal;
    },
    priceText(value) {
      let realVal = "";
      if (value) {
        // 截取当前数据到小数点后两位
        realVal = parseFloat(value).toFixed(2);
      }
      return realVal;
    },
    text(value) {
      let realVal = "";
      if (value) {
        realVal = value;
      } else {
        realVal = "——";
      }
      return realVal;
    }
  },
  methods: {
    // 用户重置按钮
    reset() {
      this.memberName = null;
      this.cardNo = null;
      this.memberPhone = null;
      this.pageNum = 1;
      this.getMember();
    },
    // 页码改变时触发
    pageChange(value) {
      this.pageNum = value;
      this.getMember();
    },
    // 页容量改变时触发
    sizeChange(value) {
      this.pageSize = value;
      this.getMember();
    },
    // 查看返现金额
    seeRebatePrice(row) {
      console.log(row);
      if (row.rebatePrice) {
        this.isShowRebatePrice = true;
        this.cardNoMore = row.cardNo;
        this.getMemberMore();
      }
    },
    // 查看积分
    seeIntegral(row) {
      if (row.integral) {
        this.isShowIntegral = true;
        this.cardNoMore = row.cardNo;
        this.getMemberMore();
      }
    },
    // 查看订单详情
    seeOrder(row) {
      console.log(row);
      this.isShow = true;
      searchMemberOrder(this.$store.state.user.channelId, row.id).then(res => {
        if (res.data.code == 200) {
          this.dataTableOrder = res.data.result;
        }
      });
    },
    searchGetMember() {
      this.pageNum = 1;
      this.getMember();
    },
    // 获取会员列表
    getMember() {
      let data = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        alipayState: this.alipayState,
        buyerId: this.buyerId,
        cardNo: this.cardNo,
        channelId: this.$store.state.user.channelId,
        id: this.id,
        memberName: this.memberName,
        memberPhone: this.memberPhone,
        memberSex: this.memberSex,
        openId: this.openId,
        pid: this.pid,
        wxState: this.wxState
      };
      searchMember(data).then(res => {
        if (res.data.code == 200) {
          this.pageNum = res.data.result.pageNum;
          this.total = res.data.result.total;
          this.dataTable = res.data.result.list;
        }
      });
    },

    // 获取订单交易列表
    getOrder() {},
    // 根据会员身份证号查询所有
    getMemberMore() {
      let data = {
        cardNo: this.cardNoMore //主键
      };
      searchMemberMore(data).then(res => {
        if (res.data.code == 200) {
          this.dataTablemodal = res.data.result;
        }
      });
    }
  },
  mounted() {
    this.getMember();
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
.ivu-table-cell {
  padding-left: 0px;
  padding-right: 0px;
}
.ivu-page {
  text-align: center;
  margin-top: 10px;
}
.clientManagementContent {
  .input {
    margin-right: 10px;
  }
  .page {
    margin: 20px 220px;
  }
}
.lookDetails {
  text-decoration: underline;
}
</style>
