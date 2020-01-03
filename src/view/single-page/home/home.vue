<template>
  <div class="layout">
    <Layout>
      <Header>
        <Row :gutter="24">
          <Col span="8">
            <div class="box-content">
              <div class="sales">
                <span>今日销售额(元)</span>
              </div>
              <div class="money">
                <strong>
                  <count-to
                    :startVal="startVal"
                    :endVal="headInfoData.todayMarket"
                    :decimals="decimals"
                    :duration="duration"
                  ></count-to>
                </strong>
              </div>
              <div class="awiat">
                待处理的销售额：
                <count-to
                  :startVal="startVal"
                  :endVal="headInfoData.todayPendingMarket"
                  :decimals="decimals"
                  :duration="duration"
                ></count-to>
                元
              </div>
              <div class="middle gray">
                昨日：
                <count-to
                  :startVal="startVal"
                  :endVal="headInfoData.yesterdayMarket"
                  :decimals="decimals"
                  :duration="duration"
                ></count-to>
              </div>
              <div class="saleType">
                <ul>
                  <li v-for="(v,i) in headInfoData.productTodayMarket" :key="v+i">
                    <span>{{v.categoryName}}：</span>
                    <strong>
                      <count-to
                        :startVal="startVal"
                        :endVal="v.mrket"
                        :decimals="decimals"
                        :duration="duration"
                      ></count-to>
                    </strong>
                  </li>
                </ul>
              </div>
              <div class="icon">
                <img :src="require('../../../assets/images/sale_icon.png')" />
              </div>
            </div>
          </Col>
          <Col span="8">
            <div class="box-content">
              <div class="sales">
                <span>今日利润额(元)</span>
              </div>
              <div class="money">
                <strong>
                  <count-to
                    :startVal="startVal"
                    :endVal="headInfoData.todayProfit"
                    :decimals="decimals"
                    :duration="duration"
                  ></count-to>
                </strong>
              </div>
              <div class="awiat">
                待处理的利润额：
                <count-to
                  :startVal="startVal"
                  :endVal="headInfoData.todayPendingProfit"
                  :decimals="decimals"
                  :duration="duration"
                ></count-to>
                元
              </div>
              <div class="middle gray">
                昨日：
                <count-to
                  :startVal="startVal"
                  :endVal="headInfoData.yesterdayProfit"
                  :decimals="decimals"
                  :duration="duration"
                ></count-to>
              </div>
              <div class="saleType">
                <ul>
                  <li v-for="(v,i) in headInfoData.productTodayProfit" :key="v+i">
                    <span>{{v.categoryName}}：</span>
                    <strong>
                      <count-to
                        :startVal="startVal"
                        :endVal="v.profit"
                        :decimals="decimals"
                        :duration="duration"
                      ></count-to>
                    </strong>
                  </li>
                </ul>
              </div>
              <div class="icon">
                <img :src="require('../../../assets/images/profit_icon.png')" />
              </div>
            </div>
          </Col>
          <Col span="8">
            <div class="box-content">
              <div class="sales">
                <span>设备数(台)</span>
              </div>
              <div class="money">
                <strong>
                  <count-to
                    :startVal="startVal"
                    :endVal="headInfoData.machineNumsVo.allNums"
                    :decimals="isZero"
                    :duration="duration"
                  ></count-to>
                </strong>
              </div>
              <div class="middle gray">
                <span>
                  正常：
                  <count-to
                    :startVal="startVal"
                    :endVal="headInfoData.machineNumsVo.normalNum"
                    :decimals="isZero"
                    :duration="duration"
                  ></count-to>
                </span>
                <span>
                  故障：
                  <count-to
                    :startVal="startVal"
                    :endVal="headInfoData.machineNumsVo.faultNum"
                    :decimals="isZero"
                    :duration="duration"
                  ></count-to>
                </span>
                <span>
                  未激活：
                  <count-to
                    :startVal="startVal"
                    :endVal="headInfoData.machineNumsVo.noActivationNum"
                    :decimals="isZero"
                    :duration="duration"
                  ></count-to>
                </span>
                <span>
                  待使用：
                  <count-to
                    :startVal="startVal"
                    :endVal="headInfoData.machineNumsVo.waitNum"
                    :decimals="isZero"
                    :duration="duration"
                  ></count-to>
                </span>
                <span>
                  待审核：
                  <count-to
                    :startVal="startVal"
                    :endVal="headInfoData.machineNumsVo.auditMachine"
                    :decimals="isZero"
                    :duration="duration"
                  ></count-to>
                </span>
                <span>
                  审核不通过：
                  <count-to
                    :startVal="startVal"
                    :endVal="headInfoData.machineNumsVo.noPassMachine"
                    :decimals="isZero"
                    :duration="duration"
                  ></count-to>
                </span>
              </div>
              <div class="icon">
                <img :src="require('../../../assets/images/equipment_icon.png')" />
              </div>
            </div>
          </Col>
        </Row>
      </Header>
      <div class="whiteBack"></div>
      <Content>
        <div class="head">
          <div class="textHead">
            <strong>销售额统计</strong>
            <Icon @click='isAnimate=true;getHeadInfo()' type="md-refresh" :class='{"isAnimate":isAnimate}'  style="cursor: pointer;margin-left:15px;"/>
          </div>
          <div id="tabHead" class="tab-head">
            <ul>
              <li>
                <a
                  href="javascript:;"
                  @click="tabIndexChange(1)"
                  :class="{'selected':tabIndex==1}"
                >近七天</a>
              </li>
              <li>
                <a
                  href="javascript:;"
                  @click="tabIndexChange(2)"
                  :class="{'selected':tabIndex==2}"
                >近三十天</a>
              </li>
              <li>
                <a
                  href="javascript:;"
                  @click="tabIndexChange(3)"
                  :class="{'selected':tabIndex==3}"
                >近半年</a>
              </li>
            </ul>
          </div>
        </div>
        <div class="echart-content">
          <div class="basicAreaChart-left">
            <example
              v-if="xAxisData.length"
              style="height: inherit"
              :xAxisData="xAxisData"
              :series="series"
              :colorList="colorList"
            />
          </div>
          <div class="doughnutChart-right">
            <div>
              <div class="statistics">
                <span>销量统计</span>
              </div>
              <Select v-model="model" style="width:100%;margin-bottom:20px" @on-change="pieChange">
                <Option
                  v-for="item in saleList"
                  :value="item.value"
                  :key="item.value"
                >{{ item.label }}</Option>
              </Select>
            </div>
            <div>
              <chart-pie
                style="height: 260px;margin-top: -20px;"
                :value="pieData"
                v-if="pieData.length"
              ></chart-pie>
            </div>
            <div class="saleList">
              <div class="list" v-for="(v,i) in pieData" :key="v+i">
                <div class="list-left">{{v.name}}：</div>
                <div class="list-right">
                  <strong>{{v.value}}</strong>
                  <span>盒</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Content>
    </Layout>
    <div
      class="message"
      v-if="$store.state.user.merchant.receiveTerminal==2&&QRcodeList.length==0&&$store.state.user.userVo.type==2"
    >
      <p>
        注册审核已通过，请尽快完善收款账户信息。
        <a @click="toInfo">点击完善</a>
      </p>
    </div>
  </div>
</template>

<script>
import Example from "./example.vue";
import { ChartPie } from "_c/charts";
import { netWorkOrder } from "@/api/data";
import countTo from "vue-count-to";
import { searchQRcodeByChannelId } from "@/api/http";
import { setInterval } from 'timers';
export default {
  components: {
    ChartPie,
    Example,
    countTo
  },
  name: "home",
  data() {
    return {
      isAnimate:false,
      timing:null,
      QRcodeList: [],
      pieDataList: [],
      xAxisData: [],
      series: [],
      colorList: [],
      duration: 2000, //持续时间
      decimals: 2, //显示的小数位数
      isZero: 0,
      startVal: 0, //起始值
      headInfoData: null,
      pieData: [],
      saleList: [],
      model: null,
      tabIndex: 1 //tab栏下标
    };
  },
  methods: {
    pieChange(value) {
      this.pieData = [];
      setTimeout(() => {
        const ary = this.pieDataList.find(v => v.categoryId == value);
        this.pieData = ary.data;
      }, 1);
    },
    tabIndexChange(value) {
      this.tabIndex = value;
      this.xAxisData = [];
      this.pieData = [];
      this.getSalesVolumeReport();
      this.getPieReport();
    },
    getHeadInfo() {
      const store = this.$store.state.user;
      let url = `/report/findOrderDetailReport?channelId=${store.channelId}&&userId=${store.userId}&&userType=${store.userVo.type}&&managerRoute=${store.userVo.managerRoute}`;
      return netWorkOrder(url, null, "get").then(res => {
        this.headInfoData = res.result;
        this.isAnimate = false;
      }).catch(()=>{
        this.isAnimate = false;
      });
    },
    getSalesVolumeReport() {
      const store = this.$store.state.user;
      let url = `/report/findSalesVolumeReport?channelId=${store.channelId}&&userId=${store.userId}&&userType=${store.userVo.type}&&dateType=${this.tabIndex}&&managerRoute=${store.userVo.managerRoute}`;
      return netWorkOrder(url, null, "get").then(res => {
        this.xAxisData = res.result.dateList;
        this.series = res.result.lineGraphSeriesList;
        // this.series.map(v=>v.smooth=true) //曲线图
        res.result.lineGraphSeriesList.forEach(item => {
          this.colorList.push(item.areaStyle.normal.color);
          item.stack="销售额";
        });
      });
    },
    getPieReport() {
      const store = this.$store.state.user;
      let url = `/report/findPieReport?channelId=${store.channelId}&&userId=${store.userId}&&userType=${store.userVo.type}&&dateType=${this.tabIndex}&&managerRoute=${store.userVo.managerRoute}`;
      return netWorkOrder(url, null, "get").then(res => {
        this.saleList = res.result.categoryList;
        this.pieDataList = res.result.pieData;
        this.pieData = res.result.pieData[0] ? res.result.pieData[0].data : [];
        this.model = res.result.categoryList[0]
          ? res.result.categoryList[0].value
          : [];
      });
    },
    toInfo() {
      this.$router.push({ name: "Information" });
    },
    getQRcodeByChannelId() {
      searchQRcodeByChannelId(this.$store.state.user.channelId).then(res => {
        if (res.data.code == 200) {
          this.QRcodeList = res.data.result;
        }
      });
    },
    repeat(){
      this.getHeadInfo();
    }
  },
  mounted(){
    this.getSalesVolumeReport();
    this.getPieReport();
    this.getQRcodeByChannelId();
    console.log(this.$store)
  },
  beforeRouteEnter(to,from,next){
    next(vm=>{
      vm.repeat();
      vm.timing =  window.setInterval(()=>{
        vm.repeat()
      },600000)
    })
  },
  beforeRouteLeave(to, from, next) {
    clearInterval(this.timing);
    next();
  }
};
</script>
<style lang="less" scoped>
li {
  list-style-type: none;
}

/*Clear Fix*/
.clearfix:after {
  content: ".";
  display: block;
  height: 0;
  clear: both;
  visibility: hidden;
}
.main .content-wrapper {
  background-color: #f2f2f2 !important;
  .layout {
    height: 100%;
    .message {
      position: fixed;
      top: 55px;
      right: 35px;
      width: 300px;
      line-height: 36px;
      z-index: 999999;
      border: 1px solid #e8e8e8;
      background-color: #fff;
      text-align: center;
      a {
        text-decoration: underline;
      }
    }
    .ivu-layout {
      height: 100%;
      .ivu-layout-header {
        padding: 0;
        overflow: hidden;
        height: auto;
        line-height: normal;
        .ivu-row {
          height: 100%;
          .ivu-col {
            height:195px;
            background-color: #fff;
            .box-content {
              position: relative;
              border: 1px solid #e8e8e8;
              padding-left: 24px;
              padding-top: 14px;
              height: 100%;
              .sales {
                height: 36px;
                line-height: 36px;
                font-size: 14px;
              }
              .money {
                font-size: 30px;
                margin-top: 10px;
              }
              .await {
                font-size:16px;
                margin-top:15px;
              }
              .saleType {
                font-size: 14px;
                padding-bottom: 10px;
                overflow: hidden;
                li {
                  float: left;
                  margin-right: 20px;
                }
              }
              .icon {
                height: 64px;
                width: 64px;
                position: absolute;
                top: 16px;
                right: 7%;
              }
            }
          }
        }
      }
      .ivu-layout-content {
        border: 1px solid #e8e8e8;
        background-color: #fff;
        padding: 20px;
        .head {
          border-bottom: 1px solid #e8e8e8;
          height: 8%;
          .textHead {
            float: left;
            font-size: 18px;
            margin-top: 5px;
          }
          /*Tab栏样式*/
          .tab-head {
            float: right;
            display: block;
            line-height: 30px;
            background: #fff;
          }

          .tab-head ul li {
            float: left;
            margin-left: 6px;
            list-style-type: none;
            border: 1px solid #e8e8e8;
          }

          .tab-head ul li a {
            display: block;
            padding: 0 30px;
            color: #555;
            font-size: 14px;
          }

          .tab-head ul li a:hover,
          .tab-head ul li a.selected {
            color: #fff;
            background: #57a3f3;
          }
        }
        .echart-content {
          padding-top: 20px;
          height:520px;
          .basicAreaChart-left {
            float: left;
            width: 73%;
            height: 100%;
            border-right: 1px solid #e8e8e8;
            padding-right: 10px;
            .Checkbox-content {
              margin-bottom: 20px;
            }
          }
          .doughnutChart-right {
            float: right;
            width: 27%;
            padding: 10px 0px 10px 20px;
            .statistics {
              font-size: 14px;
              margin-bottom: 20px;
            }
            .saleList {
              text-align: center;
              max-height: 140px;
              overflow: auto;
              margin-top: 5px;
              .list {
                overflow: hidden;
                margin-top: 5px;
                padding: 0 20px;
                .list-left {
                  float: left;
                }
                .list-right {
                  float: left;
                }
              }
            }
          }
        }
      }
    }
  }
}
.middle {
  margin-bottom:10px;
  margin-top: 5px;
  > span {
    margin-right: 15px;
  }
}
.whiteBack{
  width: 100%;
  height: 2%;
  background-color: #fff;
}
.isAnimate{
  animation:lds-hourglass 0.5s infinite
}
@keyframes lds-hourglass{
	0% {
	transform:rotate(0);
    animation-timing-function:cubic-bezier(.55,.055,.675,.19)
  }
  50% {
    transform:rotate(900deg);
    animation-timing-function:cubic-bezier(.215,.61,.355,1)
  }
  100% {
    transform:rotate(1800deg)
  }
}
</style>
