<template>
  <div class="stockAdd">
    <Input v-model="machineCode" style="margin-right:10px" placeholder="设备编码" clearable />
    <Input v-model="positionName" style="margin-right:10px" placeholder="点位名称" clearable />
    <Input v-model="productName" style="margin-right:10px" placeholder="商品名称" clearable />
    <Select v-model="routeId" placeholder="分区线路" class="marginRight" clearable>
      <Option v-for="item in routeNameList" :value="item.value" :key="item.value">{{ item.label }}</Option>
    </Select>

    <Button type="primary" @click="searchPageDatas">查询</Button>
    <Button type="primary" @click="reset">重置</Button>
    <Table highlight-row border ref="selection" :columns="columns" :data="datas">
      <template slot-scope="{ row, index }" slot="operateType">
        <span v-show="row.operateType==1">补货</span>
        <span v-show="row.operateType==2" style="color:red">商品下架</span>
      </template>
      <!-- 点位信息 -->
      <template slot-scope="{row}" slot="positionName">
        <a class="lookDetails" @click="showPositin(row)">{{row.positionName}}</a>
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
    <position-info :newlyAdded="newlyAdded" :formValidate="formValidate" @cancel="cancel"></position-info>
  </div>
</template>

<script>
import positionInfo from "@/view/custom/components/positionInfo";
import {
  searchStock,
  searchmachinePosition,
  searchRouteList
} from "@/api/http";
export default {
  name: "stockAdd",
  components: {
    positionInfo
  },
  data() {
    return {
      positionIdMore: null,
      positionData: {}, //点位数据
      positionId: null, //点位id
      formValidate: {}, // 表单数据
      newlyAdded: false,
      operateTypeList: [
        { value: 1, label: "补货" },
        { value: 2, label: "商品下架" }
      ],
      routeNameList: [],
      positionIdList: [],
      datas: [],
      columns: [
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
          title: "商品出厂批次号",
          key: "batchNo",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "点位信息",
          slot: "positionName",
          align: "center",
          tooltip: true
        },
        {
          title: "货道编码",
          key: "roadNo",
          align: "center",
          tooltip: true
        },
        {
          title: "补货商品",
          key: "productName",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "商品编码",
          key: "productCode",
          align: "center",
          minWidth: 60,
          tooltip: true
        },

        {
          title: "现有库存数",
          key: "stock",
          align: "center",
          tooltip: true
        },
        {
          title: "原始库存数",
          key: "originStock",
          align: "center",
          tooltip: true
        },
        {
          title: "补货数量",
          key: "productNumber",
          align: "center",
          tooltip: true
        },
        {
          title: "补货类型 ",
          slot: "operateType",
          align: "center",
          tooltip: true
        },
        {
          title: "补货人员 ",
          key: "operatorName",
          align: "center",
          tooltip: true
        },
        {
          title: "补货时间",
          key: "createDate",
          align: "center",
          minWidth: 80,
          tooltip: true
        }
      ],
      operator: this.$store.state.user.userId,
      operatorName: this.$store.state.user.userName,
      channelId: this.$store.state.user.channelId,
      type: this.$store.state.user.userVo.type, //用户类型
      userId: this.$store.state.user.userVo.id, //用户id
      machineCode: null, //设备编码
      operateType: null, //补货类型 1 补货 2 商品下架
      positionId: null, //点位id
      positionName: null, //点位名称
      routeId: null, //线路id
      productName: null,
      pageSize: 10,
      pageNum: 1,
      total: null
    };
  },
  methods: {
    showPositin(row) {
      console.log(row);
      this.positionIdMore = row.positionId;
      this.getmachinePosition();
      this.newlyAdded = true;
    },
    // 用户重置按钮
    reset() {
      this.machineCode = null; // 设备编码
      this.positionName = null; // 点位名称
      this.routeId = null; //线路id
      this.productName = null;
      this.pageNum = 1;
      this.getPageDatas();
    },
    cancel() {
      this.newlyAdded = false;
    },
    pageChange(value) {
      this.pageNum = value;
      this.getPageDatas();
    },
    sizeChange(value) {
      this.pageSize = value;
      this.getPageDatas();
    },
    getRouteName() {
      //根据渠道id查找线路名称列表
      searchRouteList(this.channelId,this.$store.state.user.userVo.managerRoute,this.userId,).then(res => {
        if (res.data.code == 200) {
          this.routeNameList = res.data.result;
        }
      });
    },
    searchPageDatas() {
      this.pageNum = 1;
      this.getPageDatas();
    },
    // 获取补货记录列表
    getPageDatas() {
      let data = {
        channelId: this.channelId,
        machineCode: this.machineCode,
        managerRoute:this.$store.state.user.userVo.managerRoute,
        operateType: this.operateType,
        positionId: this.positionId,
        positionName: this.positionName,
        productName: this.productName,
        routeId: this.routeId,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        type: this.type,
        userId: this.userId
      };
      searchStock(data).then(res => {
        if (res.data.code == 200) {
          this.pageNum = res.data.result.pageNum;
          this.total = res.data.result.total;
          this.datas = res.data.result.list;
        }
      });
    },
    //通过点位id和渠道id查找点位信息
    getmachinePosition() {
      let data = {
        channelId: this.channelId,
        positionId: this.positionIdMore,
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
    }
  },
  mounted() {
    this.getRouteName();
    this.getPageDatas();
  }
};
</script>

<style lang="less" scoped>
.stockAdd {
  .ivu-btn {
    margin-right: 10px;
  }
  .ivu-table-wrapper .ivu-btn {
    margin-right: 0px;
  }
  .ivu-table-wrapper button.marBtn {
    margin-right: 10px;
  }
  .ivu-table-wrapper {
    margin-top: 20px;
  }
  /deep/ .ivu-table-cell {
    padding-left: 0px;
    padding-right: 0px;
  }
  .ivu-page {
    text-align: center;
    margin-top: 10px;
  }
  .lookDetails {
    text-decoration: underline;
  }
}
</style>

