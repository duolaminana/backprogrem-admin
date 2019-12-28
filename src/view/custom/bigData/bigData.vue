<template>
  <div class='bigData'>
    <div class='head'>
      <div>
        <p>注册商户(个)</p>
        <h1>
          <count-to
              :startVal= 'startVal'
              :endVal = 'merchantData.allNum'
              :decimals = 'isZero'
              :duration = 'duration'
            ></count-to>
        </h1>
        <h6>
          <span>
            企业注册:<count-to
              :startVal= 'startVal'
              :endVal = 'merchantData.enterprisereGistrationCount'
              :decimals = 'isZero'
              :duration = 'duration'
            ></count-to>
          </span>
          <span>
            个人注册:<count-to
              :startVal= 'startVal'
              :endVal = 'merchantData.personalRegistrationCount'
              :decimals = 'isZero'
              :duration = 'duration'
            ></count-to>
          </span>
        </h6>
        <div>
          <span class='green'>
            审核通过:<count-to
              :startVal= 'startVal'
              :endVal = 'merchantData.examineSuccessCount'
              :decimals = 'isZero'
              :duration = 'duration'
            ></count-to>
          </span>
          <span class='red'> 
            审核不通过:<count-to
              :startVal= 'startVal'
              :endVal = 'merchantData.examinErrooCount'
              :decimals = 'isZero'
              :duration = 'duration'
            ></count-to>
          </span>
          <span class='orange'>
            待审核:<count-to
              :startVal= 'startVal'
              :endVal = 'merchantData.waitExaminCount'
              :decimals = 'isZero'
              :duration = 'duration'
            ></count-to>
          </span>
        </div>
        <img :src="require('../../../assets/images/merchant_icon.png')">
      </div>
      <div>
        <p>商品库(个)</p>
        <h1>
          <count-to
            :startVal= 'startVal'
            :endVal = 'goodsData.productCount'
            :decimals = 'isZero'
            :duration = 'duration'
          ></count-to>
        </h1>
        <h6>
          <span v-for='(v,i) in goodsData.categoryCountVos' :key='v+i'>
            {{v.name}}:<count-to
              :startVal= 'startVal'
              :endVal = 'v.value'
              :decimals = 'isZero'
              :duration = 'duration'
            ></count-to>
          </span>
        </h6>
        <div>
          <span class='green'>
            基础商品：
            <count-to
              :startVal= 'startVal'
              :endVal = 'goodsData.basicCommodityQuantity'
              :decimals = 'isZero'
              :duration = 'duration'
            ></count-to>
          </span>
          <span class='orange'> 
            自定义商品：
            <count-to
              :startVal= 'startVal'
              :endVal = 'goodsData.customItemQuantity'
              :decimals = 'isZero'
              :duration = 'duration'
            ></count-to>
          </span>
        </div>
        <img :src="require('../../../assets/images/commodity_icon.png')">
      </div>
      <div>
        <p>设备(台)</p>
        <h1>
          <count-to
            :startVal= 'startVal'
            :endVal = 'equipmentData.equipmentCount'
            :decimals = 'isZero'
            :duration = 'duration'
          ></count-to>
        </h1>
        <h6>
          <span v-for='(v,i) in equipmentData.venMachineTypeVos' :key='v+i'>
            {{v.machineName}}:<count-to
              :startVal= 'startVal'
              :endVal = 'v.num'
              :decimals = 'isZero'
              :duration = 'duration'
            ></count-to>
          </span>
        </h6>
        <div>
          <span class='green'>
            正常：
            <count-to
              :startVal= 'startVal'
              :endVal = 'equipmentData.normalMachine'
              :decimals = 'isZero'
              :duration = 'duration'
            ></count-to>
          </span>
          <span class='orange'>
            故障：
            <count-to
              :startVal= 'startVal'
              :endVal = 'equipmentData.faultMachine'
              :decimals = 'isZero'
              :duration = 'duration'
            ></count-to>
          </span>
          <span class='gray'>
            未激活：
            <count-to
              :startVal= 'startVal'
              :endVal = 'equipmentData.inactiveMachine'
              :decimals = 'isZero'
              :duration = 'duration'
            ></count-to>
          </span>
          <span class='orange'>
            待审核：
            <count-to
              :startVal= 'startVal'
              :endVal = 'equipmentData.auditMachine'
              :decimals = 'isZero'
              :duration = 'duration'
            ></count-to>
          </span>
          <span class='red'>
            审核不通过：
            <count-to
              :startVal= 'startVal'
              :endVal = 'equipmentData.noPassMachine'
              :decimals = 'isZero'
              :duration = 'duration'
            ></count-to>
          </span>
        </div>
        <img :src="require('../../../assets/images/equipment_icon.png')">
      </div>
    </div>
    <div class='nav'>
      <Select v-model="selectValue" clearable  class='marginRight' @on-change='selectChange' >
        <Option v-for="item in list" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
      <Button @click='timeBtn("before")' style="margin-right:10px">前一{{index==1?'天':index==2?'月':'年'}}</Button>
      <DatePicker v-model="dateValue" @on-change='dateChange' :options='options' :type="index==2?'month':index==3?'year':'date'" placeholder="时间选择" style="margin-right:10px" :clearable='false' ></DatePicker>
      <Button @click='timeBtn("after")' :disabled='disableDate'>后一{{index==1?'天':index==2?'月':'年'}}</Button>
      <div class='date'>
        <span :class='{"action":index==1}' @click='tabNav(1)'>日</span>
        <span :class='{"action":index==2}' @click='tabNav(2)'>月</span>
        <span :class='{"action":index==3}' @click='tabNav(3)'>年</span>
      </div>
    </div>
    <div class='content'>
      <p class='nums'>销售额<span>{{mapData.sales||0}}</span>元&nbsp&nbsp&nbsp&nbsp&nbsp利润额<span>{{mapData.profits||0}}</span>元</p>
      <big-data-map 
        :dataList = 'mapList'
      ></big-data-map>
      <div>
        <cylindrical-data
          v-if = 'cylindricalData.length'
          :dataList = 'cylindricalData'
        ></cylindrical-data>
        <div class='pie'>
          <p>销售点类型销量统计对比</p>
          <charts-pie v-if='pieData.length' :value="pieData" :colorList='colorList'></charts-pie>
          <div class='pieRight'>
            <div v-for='(v,i) in pieData' :key='v+i'>
              <b :style="{background:colorList[i]}"></b>
              <span>{{v.name}}</span>
              <i>{{v.value}}</i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import bigDataMap from '@/view/custom/components/bigDataMap';
import cylindricalData from '@/view/custom/components/cylindricalData';
import format from "@/plugin/format.js";
import chartsPie from '@/view/custom/components/chartsPie';
import countTo from 'vue-count-to';
import { netWorkDevice,netWorkGoods,netWorkHttp,netWorkOrder} from "@/api/data";
export default {
  components: {
    bigDataMap,
    cylindricalData,
    chartsPie,
    countTo
  },
  name:'bigData',
  data(){
    return{
      mapData:{},
      mapList:[],
      cylindricalData:[],
      duration:2000,//持续时间
      decimals:2, //显示的小数位数
      isZero:0,
      startVal:0, //起始值
      colorList:['#40A4F9', '#15D0FF', '#FB7E33', '#FFDB15', '#28D59D', '#F66F95','#3080E8','#B47EED','#E7B72F','#78C654'],
      pieData:[
        // {name: "芙蓉王（硬红带细支）", value: 1},
        // {name: "软白沙", value: 3}, 
        // {name: "芙蓉王", value: 1}
      ],
      dateValue:new Date(),
      index:3,
      selectValue:0,
      list:[],
      options:{
        disabledDate (date) {
          return date && date.valueOf() > Date.now();
        }
      },
      goodsData:{},
      merchantData:{},
      equipmentData:{},
      channelId:this.$store.state.user.channelId
    }
  },
  computed:{
    disableDate(){
      if(this.index==1){
        return this.dateValue.valueOf() > Date.now()-(24*60*60*1000)  //一天
      }else if(this.index==2){
        return this.dateValue.valueOf() > Date.now()-(28*24*60*60*1000)  //一月
      }else{
        return this.dateValue.valueOf() > Date.now()-(366*24*60*60*1000)  //一年
      }
      
    }
  },
  methods:{
    dateChange(value){
      this.getFindCompanySales();
      this.getFindProductSales();
      this.getProfits()
    },
    selectChange(value){
      if(!value){
        this.selectValue = 0;
      }
      this.getFindProductSales();
      this.getProfits()
    },
    timeBtn(type){
      let time
      if(this.index==1){
        time =  format(this.dateValue, "YYYY-MM-DD");
      }else if(this.index==2){
        time =  format(this.dateValue, "YYYY-MM");
      }else{
        time =  format(this.dateValue, "YYYY");
      }
      time = time.split("-")
      if(type=='before'){
        time.map((v,i)=>{
          if(i==time.length-1) time[i] = parseFloat(v)-1;
        })
        if(this.index==1){
          this.dateValue = new Date(this.dateValue.valueOf()-(24*60*60*1000))
        }else if(this.index==2){
          this.dateValue = new Date(this.dateValue.valueOf()-(28*24*60*60*1000))
        }else{
          this.dateValue = new Date(this.dateValue.valueOf()-(366*24*60*60*1000))
        }
        
      }else if(type=='after'){
        time.map((v,i)=>{
          if(i==time.length-1) time[i] = parseFloat(v)+1;
        })
        if(this.index==1){
          this.dateValue = new Date(this.dateValue.valueOf()+(24*60*60*1000))
        }else if(this.index==2){
          this.dateValue = new Date(this.dateValue.valueOf()+(28*24*60*60*1000))
        }else{
          this.dateValue = new Date(this.dateValue.valueOf()+(366*24*60*60*1000))
        }
      }
      time = time.join('-');
      this.getFindCompanySales();
      this.getFindProductSales();
      this.getProfits()
    },
    tabNav(value){
      this.index = value;
      this.getFindCompanySales();
      this.getFindProductSales();
      this.getProfits();
    },
    getFindAllCount(){
      const url = `/product/findAllCount`;
      netWorkGoods(url,null,'get').then(res=>{
        this.goodsData = res.result;
      })
    },
    getFindAllMerchantCount(){
      const url = `/channelApply/findAllMerchantCount`;
      netWorkHttp(url,null,'get').then(res=>{
        this.merchantData = res.result;
      })
    },
    getFindAllDeviceCount(){
      const url = `/machineInfo/findAllDeviceCount`;
      netWorkDevice(url,null,'get').then(res=>{
        this.equipmentData = res.result;
      })
    },
    getFindCompanySales(){
      let time;
      if(this.index==1){
        time =  format(this.dateValue, "YYYY-MM-DD");
      }else if(this.index==2){
        time =  format(this.dateValue, "YYYY-MM");
      }else{
        time =  format(this.dateValue, "YYYY");
      }
      const url = `/orderDetail/findCompanySales?createTime=${time}&&dateType=${this.index}`
      netWorkOrder(url,null,'get').then(res=>{
        this.cylindricalData = res.result;
      })
    },
    getFindProductSales(){
      let time;
      if(this.index==1){
        time =  format(this.dateValue, "YYYY-MM-DD");
      }else if(this.index==2){
        time =  format(this.dateValue, "YYYY-MM");
      }else{
        time =  format(this.dateValue, "YYYY");
      }
      const url = `/orderDetail/findProductSales?createTime=${time}&&dateType=${this.index}&&categoryId=${this.selectValue}`
      netWorkOrder(url,null,'get').then(res=>{
        this.pieData = res.result;
      })
    },
    getRange(){
      const url = `/channelBusiness/queryChannelBusinessByChannelId?channelId=${this.channelId}`
      return netWorkGoods(url,null,'get').then(res=>{
        this.list = res.result.map(v=> {
          return {value:v.categoryId,label:v.categoryName}
        })
      })
    },
    getMapData(){
      const url = `/machinePosition/queryPlat`
      return netWorkDevice(url,null,'get').then(res=>{
        this.mapList = res.result;
      })
    },
    getProfits(){
      let time;
      if(this.index==1){
        time =  format(this.dateValue, "YYYY-MM-DD");
      }else if(this.index==2){
        time =  format(this.dateValue, "YYYY-MM");
      }else{
        time =  format(this.dateValue, "YYYY");
      }
      const url = `/order/querySalesAndProfits?createTime=${time}&&dateType=${this.index}&&categoryId=${this.selectValue}&&channelId=${this.channelId}`
      netWorkOrder(url,null,'get').then(res=>{
        this.mapData = res.result?res.result:{sales:0, profits:0}
      })
    },
  }, 
  mounted(){
    this.getFindAllCount();
    this.getFindAllMerchantCount();
    this.getFindAllDeviceCount();
    this.getFindCompanySales();
    this.getFindProductSales();
    this.getRange();
    this.getMapData();
    this.getProfits()
  }
}
</script>

<style lang="less" scoped>
.bigData{
  margin:-18px;
  background:#EEEEEE;
  padding:18px;
  min-height: 1000px;
  .head{
    overflow: hidden;
    >div{
      display: inline-block;
      vertical-align: top;
      width:32.5%;
      margin-right:1.25%;
      padding:15px;
      background: white;
      position: relative;
      min-height: 150px;
      border-radius: 5px;
      margin-bottom:-10000px;
      padding-bottom:10000px;
      >p{
        font-size: 16px;
        color:#515A6E
      }
      >h1{
        font-size: 26px;
        line-height: 1;
        color:#515A6E;
        margin-top: 10px;
        margin-bottom: 10px;
      }
      >h6{
        height:50px;
        >span{
          font-size: 12px;
          color:#515A6E;
          margin-right: 10px;
          font-weight: 400
        }
      }
      >div{
        >span{
          font-size: 14px;
          margin-right: 10px;
        }
        margin-bottom: 10px;
      };
      >img{
        position: absolute;
        top:15px;
        right:7%;
        width: 72px;
        height: 67px;
      }
    }
    >div:last-of-type{
      margin-right: 0px;
    }
  }
  .nav{
    overflow: hidden;
    margin:15px 0px;
    padding:5px 0px;
    .date{
      float: right;
      margin-top:12px;
      >span{
        padding:5px 15px;
        cursor: pointer;
      }
      .action{
        background:#2D8CF0;
        color:white;
        border-radius:3px;
      }
    }
  }
  .content{
    overflow: hidden;
    width:100%;
    position: relative;
    .nums{
      position: absolute;
      top:15px;
      left: 40px;
      z-index: 1;
      font-size: 18px;
      >span{
        font-size: 24px;
        margin:0 10px;
      }
    }
    >div{
      display: inline-block;
      vertical-align: top;
    }
    >div:first-of-type{
      width:66.5%;
      height: 500;
      margin-right: 1.25%;
    }
    >div:last-of-type{
      width:32%;
      >div{
        background: white;
        border-radius: 5px;
      }
    }
    .pie{
      min-height: 200px;
      margin-top: 12px;
      overflow: hidden;
      position: relative;
      >p{
        font-size: 14px;
        color: #515A6E;
        padding:10px;
        position: absolute;
        top:10px;
        left: 10px;;
      }
      .pieRight{
        position: absolute;
        top:50%;
        right: 0px;
        width: 55%;
        transform: translateY(-50%);
        padding-left: 5%;
        >div{
          overflow: hidden;
          >b{
            display: inline-block;
            vertical-align: middle;
            width:12px;
            height: 12px;
            border-radius: 3px;
          }
          >span{
            color:#515A6E;
            font-size: 12px;
            margin-left: 10px;
          }
          >i{
            float: right;
            font-style: normal;
            color:#AFB2B7;
            font-size: 12px;
            margin-right: 20%
          }
        }
      }
    }
  }
}
</style>