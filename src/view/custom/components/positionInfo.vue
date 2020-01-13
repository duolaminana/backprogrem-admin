<template>
  <!-- 弹框的模态框 -->
  <Modal v-model="newlyAdded" width="800"  :mask-closable="false" :closable='false'>
    <div slot="header">
      <p>点位信息</p>
      <Icon type="md-close" size='20' color='#515a6e' class='icon' @click='cancel'/>
    </div>
    <Form ref="formValidate" :model="formValidate" :label-width="120" inline>
      <FormItem label="点位名称" prop="positionName	">
        <Input :disabled='isRead' v-model="formValidate.positionName	" placeholder="点位名称"></Input>
      </FormItem>
      <FormItem label="分区线路" prop="routeId">
        <Select placeholder="分区线路" v-model="formValidate.routeId" :disabled='isRead'>
          <Option
            v-for="item in routeNameList"
            :value="item.value"
            :key="item.value"
          >{{ item.label }}</Option>
        </Select>
      </FormItem>
      <FormItem label="区域">
        <Cascader :disabled='isRead' :data="cityData" v-model="formValidate.areaIds" @on-change="cityChange"></Cascader>
      </FormItem>
      <FormItem label="点位地址" prop="positionAddress">
        <mapDrag
          v-if='!isRead'
          :lat="formValidate.laytitude"
          :lng="formValidate.longitude"
          :searchKey="formValidate.positionAddress"
          @drag="dragMap"
          class="mapbox"
        ></mapDrag>
        <Input v-else :disabled='isRead' v-model="formValidate.positionAddress" placeholder="点位地址"></Input>
      </FormItem>
      <FormItem label="点位类型" prop="positionType">
        <Select placeholder="点位类型" v-model="formValidate.positionType" :disabled='isRead'>
          <Option
            v-for="item in positionType"
            :value="item.value"
            :key="item.value"
          >{{ item.label }}</Option>
        </Select>
      </FormItem>
      <FormItem label="点位运营时间" prop="runDate">
        <TimePicker
          :disabled='isRead'
          v-model="formValidate.runDate"
          type="timerange"
          placement="bottom-end"
          placeholder="点位运营时间"
        ></TimePicker>
      </FormItem>
      <FormItem label="价格模板" prop="priceTemplate">
        <Select placeholder="价格模板" v-model="formValidate.priceTemplate" :disabled='isRead'>
          <Option
            v-for="item in priceTemplateList"
            :value="item.value"
            :key="item.value"
          >{{ item.label }}</Option>
        </Select>
      </FormItem>
      <FormItem label="负责人" prop="chargeName">
        <Input :disabled='isRead' v-model="formValidate.chargeName" placeholder="点位负责人姓名"></Input>
      </FormItem>
      <FormItem label="联系人" prop="positionOwner">
        <Input :disabled='isRead' v-model="formValidate.positionOwner" placeholder="点位联系人"></Input>
      </FormItem>
      <FormItem label="联系人电话" prop="ownerPhone">
        <Input :disabled='isRead' v-model="formValidate.ownerPhone" placeholder="点位联系人电话"></Input>
      </FormItem>
      <FormItem label="机器编码">
        <Input :disabled='isRead' v-model="formValidate.machineCode" placeholder="机器编码"></Input>
        <!-- <Cascader :disabled='isRead' :data="machineCodeList" v-model="formValidate.machineCode"></Cascader> -->
      </FormItem>
      <FormItem label="备注" prop="remark">
        <Input :disabled='isRead' v-model="formValidate.remark" placeholder="备注"></Input>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button type="primary" size="large" @click="cancel">确定</Button>
    </div>
  </Modal>
</template>

<script>
import { netWorkDevice, netWorkGoods } from "@/api/data";
import { cityData } from "@/api/cityData";
import mapDrag from "../components/map";
export default {
  components: {
    mapDrag
  },
  props:{
    isRead:{
      default:true,
    },
    newlyAdded:{
      default:false
    },
    formValidate:{
      default:()=>{
        return {
          benefitId: null, //利益模板id
          areaNames: null, //区域names
          areaIds: [], //区域ids
          positionType: null, //点位类型
          positionAddress: null, //点位地址
          longitude: null,
          laytitude: null,
          priceTemplate: null, //价格模板id,
          chargeName: null, //点位负责人姓名
          positionOwner: null, //点位联系人
          ownerPhone: null, //点位联系人电话
          cooperationType: "1", //合作方式 1 分成 2 租用
          remark: null, //备注
          machineCode: [], //机器编码
          runDate: null, //点位运营时间
          routeId: null,
          positionName: null
        }
      }
    }
  },
  data() {
    return {
      channelId: this.$store.state.user.channelId, //渠道id
      routeNameList: [],
      cityData,
      positionType: [
        { value: "1", label: "小区" },
        { value: "2", label: "CBD" },
        { value: "3", label: "酒吧" },
        { value: "4", label: "KTV" },
        { value: "5", label: "酒店" },
        { value: "6", label: "机场" },
        { value: "7", label: "车站" },
        { value: "8", label: "交通枢纽" },
        { value: "9", label: "个体" },
        { value: "10", label: "其他" }
      ],
      // machineCodeList: [],
      priceTemplateList: [],
    };
  },
  methods: {
    cancel(){
      this.$emit('cancel')
    },
    dragMap(data) {
      this.formValidate.positionAddress = data.address;
      this.formValidate.longitude = data.position.lng;
      this.formValidate.laytitude = data.position.lat;
    },
    cityChange(value, selectedData) {
      this.formValidate.areaNames =
        selectedData[selectedData.length - 1].__label;
    },
    getmPriceTemplate() {
      //查询所有商品价格模版
      let data = {
        channelId: this.channelId,
        enable: true
      };
      netWorkGoods("/priceTemplate/findAllPriceTemplate", data).then(res => {
        console.log(res);
        
        let ary = [];
        if (res.result.length) {
          res.result.forEach((v, i) => {
            ary[i] = {};
            ary[i].value = v.id;
            ary[i].label = v.templateName;
          });
        }
        this.priceTemplateList = ary;
        console.log(res.result);
      });
    },
    // getmMachineInfo() {
    //   //根据渠道id查找未被绑定的设备
    //   let url = "/machineInfo/queryByChannelId?channelId=" + this.channelId;
    //   netWorkDevice(url, null, "get").then(res => {
    //     this.machineCodeList = res.result;
    //   });
    // },
    getBenefitTemplate(){ //根据渠道id查找利益分配模板列表
      let url = '/benefitTemplate/queryByChannelId?channelId='+this.channelId;
      netWorkDevice(url,null,'get').then(res => {
        this.benefitList = res.result;
        console.log(this.benefitList)
      })
    },
    getRouteName() {
      //根据渠道id查找利益分配模板列表
      let url = `/route/queryRouteNameByChannelId?channelId=${this.channelId}&&managerRoute=${this.$store.state.user.userVo.managerRoute}&&userId=${this.$store.state.user.userVo.id}`;
      netWorkDevice(url, null, "get").then(res => {
        this.routeNameList = res.result;
      });
    },
  },
  mounted() {
    this.getmPriceTemplate();
    // this.getmMachineInfo();
    this.getRouteName();
  },
};
</script>

<style lang="less" scoped>
.icon{
  position: absolute;
  right:16px;
  top:15px;
  cursor: pointer;
}
</style>