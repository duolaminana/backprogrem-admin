<template>
  <div class="stockControl">
    <Row style="padding:20px">
      <Col span="8">
        <Card :bordered="false" dis-hover>
          <p style="font-size:16px;margin-top:8px">总商品库存</p>
          <Table highlight-row border ref="stockData" :columns="stockColumns" :data="stockDatas">
            <!-- 商品名称 -->
            <template slot-scope="{row}" slot="productName">
              <a @click="searchProduct(row)">{{row.productName}}</a>
            </template>
          </Table>
          <Page :total="totalAll" @on-change="pageChangeAll" :page-size="pageSizeAll" simple />
        </Card>
      </Col>
      <Col span="16">
        <Card :bordered="false" dis-hover>
          <div>
            <Input v-model="machineCode" style="margin-right:10px" placeholder="设备编码" clearable />
            <Input v-model="positionName" style="margin-right:10px" placeholder="点位名称" clearable />
            <Button type="primary" @click="searchSearchStockControl">查询</Button>
            <Button type="primary" @click="reset">重置</Button>
            <Table highlight-row border ref="selection" :columns="columns" :data="datas">
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
          </div>
        </Card>
      </Col>
    </Row>
    <!-- 点位信息 -->
    <position-info :newlyAdded="newlyAdded" :formValidate="formValidate" @cancel="cancel"></position-info>
  </div>
</template>

<script>
import positionInfo from "@/view/custom/components/positionInfo";
import {
  searchStockControl,
  searchStockControlAll,
  searchmachinePosition
} from "@/api/http";
export default {
  name: "stockControl",
  components: {
    positionInfo
  },
  data() {
    return {
      positionData: {}, //点位数据
      positionId: null, //点位id
      formValidate: {},
      newlyAdded: false,
      channelId: this.$store.state.user.channelId, //渠道id
      pageSize: 10, //页容量
      pageNum: 1, //页码
      total: null,
      productCode: null,
      machineCode: null, //机器编码
      positionName: null, //点位名称
      type: this.$store.state.user.userVo.type, //用户类型
      userId: this.$store.state.user.userVo.id, //用户id
      pageNumAll: 1, //商品总库存页码
      pageSizeAll: 10, //商品总库存页容量
      totalAll: null,
      stockDatas: [],
      stockColumns: [
        {
          title: "序号",
          type: "index",
          maxWidth: 60,
          minWidth: 30,
          align: "center"
        },
        {
          title: "商品名称",
          slot: "productName",
          align: "center",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "商品数量",
          key: "productNumber",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "单位",
          key: "unit",
          align: "center",
          minWidth: 20,
          tooltip: true
        }
      ],
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
          title: "设备类型",
          key: "machineName",
          align: "center",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "机型编码",
          key: "machineCode",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "点位信息",
          slot: "positionName",
          align: "center",
          minWidth: 60,
          tooltip: true
        },

        {
          title: "商品名称",
          key: "productName",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "商品数量",
          key: "productNumber",
          align: "center",
          minWidth: 40,
          tooltip: true
        },
        {
          title: "单位",
          key: "dictUnitName",
          align: "center",
          minWidth: 20,
          tooltip: true
        }

      ]
    };
  },
  methods: {
    searchProduct(row) {
      console.log(row);
      this.productCode = row.productCode;
      this.getSearchStockControl();
    },
    showPositin(row) {
      console.log(row);
      this.positionId = row.positionId;
      this.getmachinePosition();
      this.newlyAdded = true;
    },
    cancel() {
      this.newlyAdded = false;
    },
    // 用户重置按钮
    reset() {
      this.machineCode = null; // 机器编码
      this.positionName = null; // 点位名称
      this.productCode = null;
      this.pageNum = 1;
      this.getSearchStockControl();
    },
    pageChange(value) {
      this.pageNum = value;
      this.getSearchStockControl();
    },
    sizeChange(value) {
      this.pageSize = value;
      this.getSearchStockControl();
    },
    pageChangeAll(value) {
      this.pageNumAll = value;
      this.getSearchStockControlAll();
    },
    searchSearchStockControl() {
      this.pageNum = 1;
      this.productCode = null;
      this.getSearchStockControl();
    },
    getSearchStockControl() {
      let data = {
        channelId: this.channelId,
        machineCode: this.machineCode,
        managerRoute: this.$store.state.user.userVo.managerRoute,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        positionName: this.positionName,
        productCode: this.productCode,
        type: this.type,
        userId: this.userId
      };
      searchStockControl(data).then(res => {
        if (res.data.code == 200) {
          this.pageNum = res.data.result.pageNum;
          this.total = res.data.result.total;
          this.datas = res.data.result.list;
        }
      });
    },
    getSearchStockControlAll() {
      let data = {
        channelId: this.channelId,
        machineCode: this.machineCode,
        managerRoute: this.$store.state.user.userVo.managerRoute,
        pageNum: this.pageNumAll,
        pageSize: this.pageSizeAll,
        type: this.type,
        userId: this.userId
      };
      searchStockControlAll(data).then(res => {
        if (res.data.code == 200) {
          this.stockDatas = res.data.result.list;
          this.pageNumAll = res.data.result.pageNum;
          this.totalAll = res.data.result.total;
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
    }
  },
  mounted() {
    this.getSearchStockControl();
    this.getSearchStockControlAll();
  }
};
</script>

<style lang="less" scoped>
.stockControl {
  .ivu-input-wrapper {
    margin-right: 5px;
  }
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
