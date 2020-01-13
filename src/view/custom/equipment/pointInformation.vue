<template>
  <div class='pointInformation'>
    <div>
        <Select v-model="routeId"  class='marginRight' placeholder="线路" :clearable='true'>
            <Option v-for="item in routeNameList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <Cascader :data="cityData" v-model="areaIds" placeholder="区域" class='marginRight'></Cascader>
        <Input v-model="positionName"  placeholder="点位名称" clearable class='marginRight'/>
        <Button  @click='inquiry' type="primary">查询</Button>
        <Button  @click='reset' type="primary">重置</Button>
        <Button v-if="hasPerm('pos:sub:edit')" type="primary" @click='showNewlyAdded("xz")' class='xzbtn' icon="md-add">新增</Button>
        <Button v-if="hasPerm('pos:sub:edit')" type="primary" @click='replace' :disabled='!tableRowData' class='xzbtn' >更改设备</Button>
        <Table :highlight-row='true' border ref="selection" :columns="columns" :data="datas" @on-row-click='tableClick'>
          <template slot-scope="{ row, index }" slot="cooperationType">
            <span v-show='row.cooperationType==1'>分成</span>
            <span v-show='row.cooperationType==2'>租用</span>
          </template>
          <template slot-scope="{ row, index }" slot="networkStatus">
            <span v-show='row.networkStatus==1' class='green'>在线</span>
            <span v-show='row.networkStatus==0' class='gray'>离线</span>
          </template>
          <template slot-scope="{ row, index }" slot="positionStatus">
              <span v-show='row.positionStatus==1'>待提交</span>
              <span v-show='row.positionStatus==2'>待审核</span>
              <span v-show='row.positionStatus==3'>待布机</span>
              <span v-show='row.positionStatus==4'>运营中</span>
              <span v-show='row.positionStatus==5'>暂停中</span>
              <span v-show='row.positionStatus==6'>已撤机</span>
              <span v-show='row.positionStatus==7'>审核不通过</span>
          </template>
          <template slot-scope="{ row, index }" slot="positionType">
              <span v-show='row.positionType==1'>小区</span>
              <span v-show='row.positionType==2'>CBD</span>
              <span v-show='row.positionType==3'>酒吧 </span>
              <span v-show='row.positionType==4'>KTV </span>
              <span v-show='row.positionType==5'>酒店</span>
              <span v-show='row.positionType==6'>机场</span>
              <span v-show='row.positionType==7'>车站</span>
              <span v-show='row.positionType==8'>交通枢纽</span>
              <span v-show='row.positionType==9'>个体</span>
              <span v-show='row.positionType==10'>其他</span>
          </template>
          <template slot-scope="{ row, index }" slot="edit">
              <!-- <Button type="success" size="small" class='marBtn' v-show='row.positionStatus==1' @click.stop='Submission(row,index,2)'>提交</Button>
              <Button type="success" size="small" class='marBtn' v-show='row.positionStatus==2' @click.stop='rowData=row;rowIndex=index;examine=true'>审核</Button> -->
              <!-- <Button type="success" size="small" class='marBtn' v-show='row.enable==0' @click.stop='enable(row,index)'>启用</Button>
              <Button type="error" size="small" class='marBtn' v-show='row.enable==1' @click.stop='enable(row,index)'>停用</Button> -->
              <Button v-if="hasPerm('pos:sub:edit')" type="error" size="small" class='marBtn' v-show='row.machineCode' @click.stop='untying(row,index)'>解绑设备</Button>
              <Button v-if="hasPerm('pos:sub:edit')" type="primary" size="small" class='marBtn' v-show='!row.machineCode' @click.stop='binded(row)'>绑定设备</Button>
              <Button v-if="hasPerm('pos:sub:edit')" type="primary" size="small" class='marBtn' @click.stop='showNewlyAdded("bj",index)'>编辑</Button>
              <Button v-if="hasPerm('pos:sub:edit')" type="error" size="small" @click.stop="itemDelete(row,index)" >删除</Button>
          </template>
          <template slot-scope="{ row, index }" slot="priceTemplate">
            <a @click.stop='rowData=row;lookPriceTemplate(row,index)' v-if='row.priceTemplate'>查看详情</a>
            <span v-else>---</span>
          </template>
        </Table>
        <Page :total="total" show-elevator :current='pageNum' @on-change='pageChange' :page-size='pageSize' @on-page-size-change='sizeChange'  show-sizer/>
      </div>
      <!-- 弹框的模态框 -->
      <Modal v-model="newlyAdded" width="800" title="新增点位信息"  :mask-closable='false'>
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120" inline>
          <FormItem label="点位名称" prop="positionName">
            <Input v-model="formValidate.positionName	" placeholder="点位名称"></Input>
          </FormItem>
          <FormItem label="分区线路" prop="routeId" >
            <Select v-model="formValidate.routeId" :clearable='true'>
                <Option v-for="item in routeNameList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <FormItem label="区域" prop="areaIds">
            <Cascader :data="cityData" v-model="formValidate.areaIds" @on-change='cityChange'></Cascader>
          </FormItem>
          <FormItem label="地址" prop="positionAddress">
            <mapDrag 
              ref='map'
              :lat='formValidate.laytitude' 
              :lng='formValidate.longitude' 
              :searchKey='formValidate.positionAddress'
              :positionRlue = 'positionRlue'
              @drag="dragMap" 
              class="mapbox"
            >
            </mapDrag>
          </FormItem>
          <FormItem label="类型" prop="positionType">
            <Select v-model="formValidate.positionType" :clearable='true'>
                <Option v-for="item in positionType" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <FormItem label="运营时间" prop="runDate">
            <TimePicker v-model='formValidate.runDate' :clearable='true' type="timerange" placement="bottom-end" placeholder="点位运营时间"></TimePicker>
          </FormItem>
          <FormItem label="负责人" prop="chargeName">
            <Input v-model="formValidate.chargeName" placeholder="点位负责人姓名"></Input>
          </FormItem>
          <FormItem label="联系人" prop="positionOwner">
            <Input v-model="formValidate.positionOwner" placeholder="点位联系人"></Input>
          </FormItem>
          <FormItem label="联系人电话" prop="ownerPhone">
            <Input v-model="formValidate.ownerPhone" placeholder="点位联系人电话"></Input>
          </FormItem>
          <!-- <FormItem label="设备编码">
            <Input v-if="showNewlyType=='bj'" :disabled='true' v-model="formValidate.machineCode" ></Input>
            <Cascader v-else :data="machineCodeList" v-model="formValidate.machineCode"></Cascader>
          </FormItem> -->
          <FormItem label="价格模板">
            <Select v-model="formValidate.priceTemplate" :clearable='true'>
                <Option v-for="item in priceTemplateList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <FormItem label="备注">
            <Input v-model="formValidate.remark"  placeholder="备注"></Input>
          </FormItem>
          <!-- <FormItem label="利益模板" prop="benefitId">
            <Select v-model="formValidate.benefitId">
                <Option v-for="item in benefitList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <FormItem label="经度" prop="longitude">
            <Input v-model="formValidate.longitude" placeholder="经度"></Input>
          </FormItem>
          <FormItem label="维度" prop="laytitude">
            <Input v-model="formValidate.laytitude" placeholder="维度"></Input>
          </FormItem>
          <FormItem label="合作方式" prop="cooperationType">
            <RadioGroup v-model="formValidate.cooperationType">
              <Radio label="1">分成</Radio>
              <Radio label="2">租用</Radio>
            </RadioGroup>
          </FormItem> -->
        </Form>
        <div slot="footer">
          <Button type="text" size="large" @click='newlyAdded=false'>取消</Button>
          <Button type="primary" size="large" @click="Added(formValidate,3,'formValidate')">确定</Button>
      <!--     <Button type="primary" size="large" @click="Added(formValidate,1)">确定</Button> -->
          <!-- <Button type="success" size="large" @click="Added(formValidate,2)">发布</Button> -->
        </div>
      </Modal>
      <!-- 审核 -->
      <Modal
        v-model="examine"
        width="500"
        title="审核"
        :mask-closable="false"
      >
        <p>确定通过审核吗？</p>
        <div slot="footer">
          <Button type="text" size="large" @click="examine=false">取消</Button>
          <Button type="error" size="large" @click="Submission(rowData,rowIndex,7)">审核不通过</Button>
          <Button type="success" size="large" @click="Submission(rowData,rowIndex,3)">审核通过</Button>
        </div>
      </Modal>
      <!-- 绑定设备 -->
      <Modal
        class='binding'
        v-model="binding"
        width="500"
        title="绑定设备"
        :mask-closable="false"
      >
        <!-- 设备类型：<Cascader :data="machineTypeList"  placeholder="机器类型" class='marginRight'></Cascader> -->
        <div>
          设备类型：<Select filterable  placeholder="设备类型" :clearable='true' @on-change='machineTypeChange'>
              <Option v-for="item in machineTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </div>
        <div style='margin-top:20px'>
          设备编码：<Select filterable v-model="machineTypeValue" placeholder="设备编码" :clearable='true'>
              <Option v-for="item in machineList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </div>
        <div slot="footer">
          <Button type="text" size="large" @click="binding=false">取消</Button>
          <Button type="primary" size="large" @click="bindedSure">确定</Button>
        </div>
      </Modal>
      <delete-component
        :modalDel="modalDel"
        :del_loading="modal_loading"
        @cancel="delCancel"
        @del="del"
      ></delete-component>
      <table-modal
        title = '查看价格模板'
        :newlyAdded = 'priceNewlyAdded'
        :datas = 'priceData'
        :columns = 'priceColumns'
        :total = 'priceTotal'
        :pageNum = 'pricePageNum'
        :pageSize = 'pricePageSize'
        @pageChange = 'pricePageChange'
        @sizeChange = 'priceSizeChange'
        @sure = 'priceCancel'
        @cancel = 'priceCancel'
      ></table-modal>
  </div>
</template>

<script>
import {cityData} from '@/api/cityData'
import { netWorkDevice,netWorkGoods} from "@/api/data";
import mapDrag from '../components/map';
import  deleteComponent from "@/view/custom/components/deleteComponent";
import  tableModal from "@/view/custom/components/tableModal";
import axios from 'axios'
export default {
  name:'pointInformation',
  props:{
    pickTreeData:{
      default:() => {
        return {};
      }
    }
  },
  components:{
    mapDrag,
    deleteComponent,
    tableModal
  },
  data(){
    const validatePhone = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("输入不能为空"));
      } else if (!/^1[3456789]\d{9}$/.test(value)) {
        callback(new Error("电话号码格式错误"));
      } else {
        callback();
      }
    };
    return{
      positionName:null,
      machineList:[],
      priceTotal:null,
      pricePageNum:1,
      pricePageSize:10,
      priceColumns:[
        {
          title: '模版名称',
          key: 'templateName',
          align: 'center',
          tooltip:true
        },
        {
          title: '商品名称',
          key: 'productName',
          align: 'center',
          tooltip:true
        },
        {
          title: '商品进价',
          key: 'buyPrice',
          align: 'center',
          tooltip:true
        },
        {
          title: '实际售价',
          key: 'actualPrice',
          align: 'center',
          tooltip:true
        },
      ],
      priceData:[],
      priceNewlyAdded:false,
      positionRlue:false,
      modal_loading:false,//删除的loading
      delID:null,//删除的ID
      delIndex:null,//删除的索引
      modalDel:false,
      isReplace:false,
      tableRowData:null,
      bindPositionId:null,
      machineTypeList:[],
      machineTypeValue:null,
      binding:false,
      examine:false,
      routeNameList:[],
      routeId:null,
      areaIds:[],//区域id
      priceTemplateList:[],
      machineCodeList:[],
      cityData,
      positionType:[
        {value:'1',label:'小区'},
        {value:'2',label:'CBD'},
        {value:'3',label:'酒吧'},
        {value:'4',label:'KTV'},
        {value:'5',label:'酒店'},
        {value:'6',label:'机场'},
        {value:'7',label:'车站'},
        {value:'8',label:'交通枢纽'},
        {value:'9',label:'个体'},
        {value:'10',label:'其他'},
      ],
      benefitList:[],
      formValidate:{ //新增字段
        benefitId:null,//利益模板id
        areaNames:null,//区域names
        areaIds:[],//区域ids
        positionType:null,//点位类型
        positionAddress:null,//点位地址
        longitude:null,
        laytitude:null,
        priceTemplate:null,//价格模板id,
        chargeName:null,//点位负责人姓名
        positionOwner:null,//点位联系人
        ownerPhone:null,//点位联系人电话
        cooperationType:'1',//合作方式 1 分成 2 租用
        remark:null,//备注
        // machineCode:[],//机器编码
        runDate:[ "00:00:00", "23:59:59" ],//点位运营时间
        routeId:null,
        positionName:null,
      },
      ruleValidate: {
        positionName: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur",
          },
          { max: 8, message: "长度最多是8个字符", trigger: "blur" },
        ],
        routeId: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur",
          },
        ],
        areaIds: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur",
            type:'array'
          },
        ],
        positionAddress: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur",
          },
        ],
        positionType: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur",
          },
        ],
        runDate: [
          {
            required: true,
            message: "输入不能为空",
            trigger: 'change' ,
            type: 'array'
          },
        ],
        chargeName: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur",
          },
        ],
        positionOwner: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur",
          },
        ],
        ownerPhone: [
          {
            required: true,
            trigger: "blur",
            validator: validatePhone,
          }
        ],
      },
      rowData:null,
      rowIndex:null,
      showNewlyType:'xz',
      newlyAdded:false,
      pageSize:10,
      pageNum:1,
      total:null,
      datas:[],
      columns:[
        {
          title: '序号',
          type: 'index',
          width:50,
          align: 'center'
        },
        {
          title: '点位名称',
          key: 'positionName',
          align: 'center',
          width:150,
          tooltip:true
        },
        {
          title: '线路名称',
          key: 'routeName',
          align: 'center',
          tooltip:true
        },
        {
          title: '设备编码',
          key: 'machineCode',
          align: 'center',
          tooltip:true
        },
        {
          title: '价格模板',
          slot: 'priceTemplate',
          align: 'center',
          tooltip:true
        },
        {
          title: '点位状态',
          slot: 'positionStatus',
          align: 'center',
          tooltip:true
        },
        {
          title: '点位地址',
          key: 'positionAddress',
          align: 'center',
          width:'180',
          tooltip:true
        },
        {
          title: '区域',
          key: 'areaNames',
          align: 'center',
          tooltip:true
        },
        {
          title: '运营时间',
          key: 'runDate',
          align: 'center',
          width:'140',
          tooltip:true
        },
        {
          title: '点位负责人姓名',
          key: 'chargeName',
          align: 'center',
          tooltip:true
        },
        {
          title: '点位联系人',
          key: 'positionOwner',
          align: 'center',
          tooltip:true
        },
        // {
        //   title: '机器网络状态',
        //   slot: 'networkStatus',
        //   align: 'center',
        //   tooltip:true
        // },
        {
          title: '点位联系人电话',
          key: 'ownerPhone',
          align: 'center',
          tooltip:true
        },
        {
          title: '点位类型',
          slot: 'positionType',
          align: 'center',
          tooltip:true
        },
        
        // {
        //   title: '合作方式',
        //   slot: 'cooperationType',
        //   align: 'center',
        //   tooltip:true
        // },
        {
          title: '操作',
          slot: 'edit',
          align: 'center',
          width:200,
          tooltip:true
        },
      ],
      machineCode:null,
      operator:this.$store.state.user.userId,
      operatorName:this.$store.state.user.userName,
      operatorType:this.$store.state.user.userVo.type,
      channelId:this.$store.state.user.channelId
    }
  },
  methods:{
    machineTypeChange(value){
      const item = 
      this.machineList = this.machineTypeList.find(v=>{
        return v.value==value;
      }).children
    },
    itemDelete(row,index){
      if(!row.machineCode){
        this.modalDel=true;
        this.delID=row.id;
        this.delIndex=index;
      }else{
        this.$Message.error('请先解绑设备!');
      }
    },
    reset(){
      this.positionName = null;
      this.routeId = null;
      this.machineCode = null;
      this.pageNum = 1;
      this.total = null;
      this.pageSize = 10;
      this.areaIds = [];
      this.channelId = this.$store.state.user.channelId;
      this.getPageDatas();
    },
    pricePageChange(value){
      this.pricePageNum = value;
      this.lookPriceTemplate();
    },
    priceSizeChange(value){
      this.pricePageSize = value;
      this.lookPriceTemplate();
    },
    priceCancel(){
      this.priceNewlyAdded = false;
    },
    lookPriceTemplate(){
      const data = {
        channelId:this.channelId,
        templateId:this.rowData.priceTemplate,
        pageNum:this.pricePageNum,
        pageSize:this.pricePageSize
      }
      netWorkGoods('/priceTemplateDetail/findPriceTemplateDetailPage',data).then(res=>{
        this.priceData =  res.result.list;
        this.pricePageNum = res.result.pageNum;
        this.priceTotal = res.result.total;
        this.priceNewlyAdded = true;
      })
    },
    delCancel(){
      this.modal_loading = false;
      this.modalDel = false;
    },
    del(){
      this.modal_loading = true;
      let url = '/machinePosition/delete?id='+this.delID
      netWorkDevice(url,null,'delete').then(res => {
        this.modal_loading = false;
        this.modalDel = false;
        this.datas.splice(this.delIndex,1);
        this.delID = null;//删除的ID
        this.delIndex =null;//删除的索引
        this.$Message.success('删除成功');
      }).catch(err => {
        this.modal_loading = false;
      });
    },
    replace(){
      this.isReplace = true;
      this.binded(this.tableRowData);
    },
    tableClick(row,index){
      this.tableRowData = row;
    },
    bindedSure(){
      if(this.machineTypeValue){
        if(this.isReplace){ //更换设备
          let data = {
            id:this.tableRowData.id,
            machineCode:this.machineTypeValue,
            operator:this.operator,
            operatorName:this.operatorName,
            channelId:this.channelId
          }
          netWorkDevice("/machinePosition/bundlingMachine", data).then(res => {
            this.getPageDatas();
            this.binding = false;
            this.tableRowData = null;
            this.$Message.success('更换成功');
          })
        }else{
          let data = {
            id:this.bindPositionId,
            machineCode:this.machineTypeValue,
            operator:this.operator,
            operatorName:this.operatorName,
            channelId:this.channelId
          }
          netWorkDevice("/machinePosition/bundlingMachine", data).then(res => {
            this.getPageDatas();
            this.binding = false;
            this.$Message.success('绑定成功');
          })
        }
      }else{
        this.$Message.error('请先选择设备类型！');
      }
    },
    binded(row){
      this.bindPositionId = row.id;
      this.machineTypeValue = null;//初始化
      let url =`/machineInfo/queryByChannelId?channelId=${row.channelId}`; 
      netWorkDevice(url, null,'get').then(res => {
        this.machineTypeList = res.result;
        this.binding=true;
      })
    },
    untying(row,index){
      let data = {
        id:row.id,
        machineCode:row.machineCode,
        operator:this.operator,
        operatorName:this.operatorName,
        channelId:this.channelId
      }
      netWorkDevice("/machinePosition/unbundlingMachine", data).then(res => {
        this.$set(this.datas[index],'machineCode',null)
        this.$Message.success('解绑成功');
        this.examine = false;
      })
    },
    inquiry(){
      this.machineCode = null;
      this.channelId = this.$store.state.user.channelId;
      this.pageNum = 1;
      this.getPageDatas();
    },
    Submission(row,index,value){
      let {id} = row;
      let data = {
        positionStatus:value,
        id
      }
      netWorkDevice("/machinePosition/modify", data).then(res => {
        this.$set(this.datas[index],'positionStatus',value)
        this.$Message.success('操作成功');
        this.examine = false;
      })
    },
    async showNewlyAdded(type,index){
      await this.initialization('formValidate');
      this.positionRlue = false;
      this.showNewlyType = type;
      //初始化数据
      this.formValidate = { //新增字段
        benefitId:null,//利益模板id
        areaNames:null,//区域names
        areaIds:[],//区域ids
        positionType:null,//点位类型
        positionAddress:null,//点位地址
        longitude:null,
        laytitude:null,
        priceTemplate:null,//价格模板id,
        chargeName:null,//点位负责人姓名
        positionOwner:null,//点位联系人
        ownerPhone:null,//点位联系人电话
        cooperationType:'1',//合作方式 1 分成 2 租用
        remark:null,//备注
        // machineCode:[],//机器编码
        runDate:[ "00:00:00", "23:59:59" ],//点位运营时间
        routeId:null,
        positionName:null,
      };
      if(type=='bj'){
        this.formValidate.areaIds = this.datas[index].areaIds.split(",").map((item)=>{return parseInt(item)})
        this.formValidate.runDate = this.datas[index].runDate.split("-")
        this.formValidate.positionType = this.datas[index].positionType+'';
        this.formValidate.cooperationType = this.datas[index].cooperationType+'';
        this.formValidate.benefitId = this.datas[index].benefitId+'';
        // this.formValidate.machineCode = [this.datas[index].machineName,this.datas[index].machineCode];
        // this.formValidate.machineCode = this.datas[index].machineCode;
        this.formValidate.priceTemplate = this.datas[index].priceTemplate;
        this.formValidate.positionAddress = this.datas[index].positionAddress;
        this.formValidate.longitude = this.datas[index].longitude;
        this.formValidate.laytitude = this.datas[index].laytitude;
        this.formValidate.positionOwner = this.datas[index].positionOwner;
        this.formValidate.remark = this.datas[index].remark;
        this.formValidate.ownerPhone = this.datas[index].ownerPhone;
        this.formValidate.chargeName = this.datas[index].chargeName;
        this.formValidate.routeId = this.datas[index].routeId+'';
        this.formValidate.id = this.datas[index].id;
        this.formValidate.positionName = this.datas[index].positionName
      }
      this.newlyAdded=true
    },
    enable(row,index){
      let {enable,id} = row;
      let data = {
        enable:enable==1?0:1,
        id
      }
      netWorkDevice("/machinePosition/modify", data).then(res => {
        this.$set(this.datas[index],'enable',data.enable)
        this.$Message.success('操作成功');
      })
    },
    Added(value,positionStatus,name){
      this.$refs[name].validate(valid => {
        if(!valid&&!value.positionAddress){
          this.positionRlue = !valid;
        }
        if (valid) {
          let {benefitId,areaNames,areaIds,positionType,positionAddress,longitude,laytitude,priceTemplate,chargeName,positionOwner,ownerPhone,cooperationType,remark,runDate,routeId,positionName} = value;
          if(this.showNewlyType=='xz'){
            let data = {
              positionStatus,
              benefitId,
              areaNames,
              areaIds:areaIds.join(","),
              positionType,
              positionAddress,
              longitude,
              laytitude,
              priceTemplate,
              chargeName,
              positionOwner,
              ownerPhone,
              cooperationType,
              remark,
              // machineCode:machineCode[machineCode.length-1],
              runDate:runDate?runDate.join('-'):null,
              routeId,
              positionName,
              operator:this.operator,
              operatorName:this.operatorName,
              channelId:this.channelId,
            }
            netWorkDevice("/machinePosition/add", data).then(res => {
              this.newlyAdded = false;
              this.getPageDatas();
              this.$Message.success('添加成功');
            })
          }else if(this.showNewlyType=='bj'){
            let data = {
              benefitId,
              areaNames,
              areaIds:areaIds.join(","),
              positionType,
              positionAddress,
              longitude,
              laytitude,
              priceTemplate:priceTemplate?priceTemplate:0,
              chargeName,
              positionOwner,
              ownerPhone,
              cooperationType,
              remark,
              // machineCode:machineCode[machineCode.length-1],
              runDate:runDate.join('-'),
              operator:this.operator,
              operatorName:this.operatorName,
              channelId:this.channelId,
              routeId,
              positionName,
              id:value.id
            }
            netWorkDevice("/machinePosition/modify", data).then(res => {
              this.newlyAdded = false;
              this.getPageDatas();
              this.$Message.success('修改成功');
            })
          }
        }
      })
    },
    dragMap (data) {
      this.formValidate.positionAddress = data.address;
      this.formValidate.longitude = data.position.lng;
      this.formValidate.laytitude = data.position.lat;
      // this.$refs.map.initMap();
    },
    cityChange(value,selectedData){
      this.formValidate.areaNames = selectedData[selectedData.length-1].__label;
      const str = this.formValidate.areaNames.replace(/\//g, "").replace(/\s/g,"");
      let url = `https://restapi.amap.com/v3/geocode/geo?key=a63edeccaf444460aaeb254bb2a2de90&&address=${str}&&output=JSON`;
      axios.get(url).then(res=>{
        if(res.data.status=='1'){
          let ary = res.data.geocodes[0].location.split(",");
          this.formValidate.positionAddress = res.data.geocodes[0].formatted_address;
          this.formValidate.longitude = ary[0];
          this.formValidate.laytitude = ary[1];
          // let data = {
          //   address:res.data.geocodes[0].formatted_address,
          //   position:{
          //     lng:ary[0],
          //     lat:ary[1]
          //   }
          // }
          // console.log(data)
        }
      })
    },
    pageChange(value){
      this.pageNum = value;
      this.getPageDatas();
    },
    sizeChange(value){
      this.pageSize = value;
      this.getPageDatas();
    },
    getmPriceTemplate(){ //查询所有商品价格模版
      let data = {
        channelId:this.channelId,
        enable:true
      }
      netWorkGoods('/priceTemplate/findAllPriceTemplate',data).then(res => {
        let ary = [];
        if(res.result.length){
          res.result.forEach((v,i)=>{
            ary[i] = {};
            ary[i].value = v.id;
            ary[i].label = v.templateName;
          })
        }
        this.priceTemplateList = ary;
        console.log(res.result)
      })
    },
    getmMachineInfo(){ //根据渠道id查找未被绑定的设备
      let url = '/machineInfo/queryByChannelId?channelId='+this.channelId;
      netWorkDevice(url,null,'get').then(res => {
        this.machineCodeList = res.result;
      })
    },
    getBenefitTemplate(){ //根据渠道id查找利益分配模板列表
      let url = '/benefitTemplate/queryByChannelId?channelId='+this.channelId;
      netWorkDevice(url,null,'get').then(res => {
        this.benefitList = res.result;
        console.log(this.benefitList)
      })
    },
    getRouteName(){ //根据渠道id查找利益分配模板列表
      let url = `/route/queryRouteNameByChannelId?channelId=${this.channelId}&&managerRoute=${this.$store.state.user.userVo.managerRoute}&&userId=${this.$store.state.user.userVo.id}`;
      netWorkDevice(url,null,'get').then(res => {
        this.routeNameList = res.result;
      })
    },
    getPageDatas(){
      let data = {
        positionName:this.positionName,
        pageNum:this.pageNum,
        pageSize:this.pageSize,
        areaIds:this.areaIds.join(','),
        routeId:this.pickTreeData&&this.pickTreeData.id?this.pickTreeData.id:this.routeId,
        channelId:this.channelId,
        userId:this.operator,
        type:this.operatorType,
        managerRoute:this.$store.state.user.userVo.managerRoute,
        machineCode:this.machineCode
      }
      netWorkDevice('/machinePosition/list',data).then(res => {
        this.pageNum = res.result.pageNum;
        this.total = res.result.total;
        this.datas = res.result.list;
      })
    },
  },
  // beforeRouteEnter(to,from,next){
  //   if(to.query.channelId){
  //     next(vm=>{
  //       vm.channelId = to.query.channelId;
  //       vm.machineCode = to.query.machineCode;
  //       vm.getPageDatas();
  //     });
  //   }else{
  //     next(vm=>{
  //       vm.getPageDatas();
  //     });
  //   }
  // },
  // beforeRouteLeave (to, from, next) {
  //   this.channelId = this.$store.state.user.channelId;
  //   this.machineCode = null;
  //   next();
  // },
  mounted(){
    this.getPageDatas();
    this.getRouteName();
    this.getmPriceTemplate();
    // this.getmMachineInfo();
    this.getBenefitTemplate();
  },
}
</script>
<style lang="less" scoped>
  .pointInformation{
    .ivu-btn{
      margin-right: 10px;
    }
    .ivu-table-wrapper .ivu-btn{
      margin-right: 0px;
    }
    .ivu-table-wrapper button.marBtn{margin-right: 10px;}
    .ivu-table-wrapper{
      margin-top:20px;
    }
    /deep/ .ivu-table-cell{
      padding-left: 0px;
      padding-right:0px;
    }
    .ivu-page{
      text-align: center;
      margin-top: 10px;
    }
  }
  .ivu-input-wrapper,.ivu-select,.ivu-cascader,.ivu-date-picker{
    width: 220px;
  }
  #container{
    height: 300px;
  }
  .ivu-cascader{
    display: inline-block
  }
  .binding{
    /deep/.ivu-modal-body{
      padding-left: 32px;
      .ivu-cascader{
        margin-left:30px;
      }
    }
  }
</style>
