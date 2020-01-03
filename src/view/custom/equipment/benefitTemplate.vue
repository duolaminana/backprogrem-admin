<template>
  <div class='benefitTemplate'>
    <div style='display: inline-block;vertical-align: top;width:39%;margin-right:2%'>
      <div style="overflow: hidden;">
        <Input v-model="templateName"  placeholder="模板名称" clearable class='marginRight'/>
        <Button  @click='clickQuery' type="primary" >查询</Button>
        <Button @click='reset' type="primary">重置</Button>
        <Button v-if="hasPerm('pos:bet:edit')"  type="primary" @click='showNewlyAdded("xz")' class='xzbtn' icon="md-add">新增</Button>
      </div>
      <Table  border ref="selection" :columns="columns" :data="datas" :highlight-row='true' @on-row-click='tableClick'>
        <template slot-scope="{ row, index }"  slot="edit">
          <Button v-if="hasPerm('pos:bet:edit')" type="primary" size="small" class='marBtn' @click='showNewlyAdded("bj",index,row)'>编辑</Button>
          <Button v-if="hasPerm('pos:bet:edit')" type="error" size="small" @click="modalDel=true;delID=row.id;delIndex=index">删除</Button>
        </template>
      </Table>
      <Page :total="total" show-elevator :current='pageNum' @on-change='pageChange' :page-size='pageSize' @on-page-size-change='sizeChange'  show-sizer/>
    </div>
    <benefit-account ref='benefitAccount' :rowData='tableRowData' style='display: inline-block;vertical-align: top;width:59%;'></benefit-account> 
    <!-- 新增弹框的模态框 -->
    <Modal
      class='interest'
      v-model="newlyAdded"
      width="700"
      :title="showNewlyType=='xz'?'新增模板':'编辑模板'"
      :mask-closable="false"
    >
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
        <FormItem  prop="name">
          <Input v-model.trim="formValidate.name" placeholder="模板名称" />
        </FormItem>
        <FormItem  prop="remark">
          <Input v-model.trim="formValidate.remark" placeholder="备注" style="margin-left:20px;" />
        </FormItem>
        <Divider />
        <interest-component
          ref='interest'
          :datas.sync = 'interestDatas'
          :receivablesList = 'receivablesList'
          :receivablesInfo = 'receivablesInfo'
          :isDeviceInfo = 'false'
          @delete = 'interestDel'
          @changeBen = 'changeBen'
        >
        </interest-component>
        <Button  type="primary" style="margin-top:10px;" @click='interestAdd'>新增</Button>
        <div  id='item'>
          <Select v-model="interestDatas[interestDatas.length-1].benefitType" :disabled='true'>
            <Option v-for="(item,index) in interestList" :disabled='item.disabled' :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
          <InputNumber
            :disabled="true"
            v-model="interestDatas[interestDatas.length-1].benefitPercent"
            :formatter="value => `${value}%`"
            :max = '100'
            :min = '0'
            :parser="value => value.replace('%', '')"
          ></InputNumber>
          <Select :disabled='true'  :value="interestDatas[interestDatas.length-1].accountId+''" @on-change='changeGetId($event,interestDatas.length-1)'>
            <Option v-for="item in receivablesList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
          <Input v-model="interestDatas[interestDatas.length-1].payee"  placeholder="收款人"  :disabled='true'/>
          <Input class='account' v-model="interestDatas[interestDatas.length-1].account" :disabled='true'  placeholder="收款人账号"/>
        </div>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="newlyAdded=false">取消</Button>
        <Button type="primary" size="large" @click="Added(formValidate,'formValidate')">确定</Button>
      </div>
    </Modal>
    <delete-component
      :modalDel = 'modalDel'
      :del_loading = 'modal_loading'
      @cancel = 'delCancel'
      @del = 'del'
    >
    </delete-component>
  </div>

</template>

<script>
import { netWorkDevice} from "@/api/data";
import  interestComponent from "@/view/custom/components/interestComponent";
import  deleteComponent from "@/view/custom/components/deleteComponent";
import  benefitAccount from "./benefitAccount";
export default {
  components:{
    interestComponent,
    deleteComponent,
    benefitAccount
  },
  name:'benefitTemplate',
  data(){
    return{
      tableRowData:{},
      interestList:[
        {value:1,label:'本金',disabled:true},
        {value:2,label:'利润'},
        {value:3,label:'商户利润',disabled:true},
      ],
      receivablesInfo:[],
      receivablesList:[],
      templateName:null,
      interestDatas:[
        {
          benefitType:1,
          benefitPercent:0,
          accountId:null,
          payee:null,
          account:null,
        }
      ],
      //详情
      modalDel:false,
      modal_loading:false,//删除的loading
      delID:null,//删除的ID
      delIndex:null,//删除的索引
      formValidate:{ //新增字段
        name:null,
        remark:null,
      },
      ruleValidate: {
        name: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur",
          },
          { max: 8, message: "长度最多是8个字符", trigger: "blur" },
        ],
        remark: [
          { max: 20, message: "长度最多是20个字符", trigger: "blur" },
        ]
      },
      showNewlyType:'xz',
      newlyAdded:false,
      pageNum:1,
      total:null,
      pageSize:15,
      datas: [],
      columns: [
        {
          title: '序号',
          type: 'index',
          width:50,
          align: 'center'
        },
        {
          title: '模板名称',
          key: 'templateName',
          align: 'center',
          tooltip:true
        },
        {
          title: '创建人',
          key: 'operatorName',
          align: 'center',
          tooltip:true
        },
        {
          title: '创建时间',
          key: 'createDate',
          align: 'center',
          tooltip:true
        },
        {
          title: '修改时间',
          key: 'updateDate',
          align: 'center',
          tooltip:true
        },
        {
          title: '备注',
          key: 'remark',
          align: 'center',
          tooltip:true
        },
        {
          title: '操作',
          align: 'center',
          slot: 'edit',
          width: 120,
          tooltip:true
				}
      ],
      operator:this.$store.state.user.userId,
      operatorName:this.$store.state.user.userName,
      channelId:this.$store.state.user.channelId
    }
  },
  methods:{
    clickQuery(){
      this.pageNum = 1;
      this.getPageDatas();
    },
    reset(){
      this.templateName = null;
      this.pageNum = 1;
      this.total = null;
      this.pageSize = 15;
      this.getPageDatas();
    },
    tableClick(row,index){
      this.tableRowData = row;
      setTimeout(()=>{
        this.$refs.benefitAccount.getPageDatas();
      },1)
    },
    changeGetId(event,i){
      const data = this.receivablesInfo.find((v,i,ary)=>{
        return v.value == event
      })
      this.$set(this.interestDatas[i],'accountId',data.value)
      this.$set(this.interestDatas[i],'payee',data.payee)
      this.$set(this.interestDatas[i],'account',data.account)
    },
    changeBen(res){
      let {data,i:index} = res;
      this.$set(this.interestDatas[index],'accountId',data.value)
      this.$set(this.interestDatas[index],'payee',data.payee)
      this.$set(this.interestDatas[index],'account',data.account)
    },
    delCancel(){
      this.modal_loading = false;
      this.modalDel = false;
    },
    isNotNull(){
      console.log(this.interestDatas)
      return this.interestDatas[this.interestDatas.length-2].benefitType&&this.interestDatas[this.interestDatas.length-2].accountId
    },
    interestSure(){
      console.log(this.interestDatas);
      this.interestNewlyAdded=false;
    },
    interestDel({index}){
      console.log(1111)
      this.interestDatas.splice(index, 1);
      this.$refs.interest.numChange();
    },
    interestAdd(){
      let data = {
        benefitType:null,
        benefitPercent:0
      }
      if(this.isNotNull()){
        this.interestDatas.splice(this.interestDatas.length-1,0,data);
        // this.interestDatas = [...this.interestDatas,data];
        console.log(this.interestDatas)
      }else{
        this.$Message.error("请先完成上条数据！");
      }
    },
    del(){
      this.modal_loading = true;
      let url = '/benefitTemplate/delete?id='+this.delID
      netWorkDevice(url,null,'delete').then(res => {
        this.modal_loading = false;
        this.modalDel = false;
        this.datas.splice(this.delIndex,1);
        this.delID = null;//删除的ID
        this.delIndex =null;//删除的索引
        this.$Message.success('删除成功');
      })
    },
    async showNewlyAdded(type, index,row) {
      await this.initialization('formValidate');
      this.showNewlyType = type;
      this.formValidate = { //新增字段
        name:null,
        remark:null,
      };
      this.interestDatas = [
        {
          benefitType:1, //默认本金
          benefitPercent:0,
          accountId:null,
          payee:null,
          account:null,
        }
      ];
      //初始化数据
      if (type == "xz") {
        await this.queryAccount();
      }else if (type == "bj") {
        console.log(row)
        this.formValidate = JSON.parse(JSON.stringify(row));
        this.formValidate.name = row.templateName;
        await this.getBenefitData(row.channelId);
        await this.getInterestDatas(row.id)
        // this.interestDatas.map((v)=>{
        //   console.log(v.accountId)
        //   v.accountId = v.accountId?v.accountId.toString():v.accountId
        // })
      }
      this.newlyAdded = true;
    },
    Added(value,name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          let {
            name:templateName,
            remark,
          } = value;
          if (this.showNewlyType == "xz") {
            if(this.isNotNull()){
              let c = 0;
              this.interestDatas.forEach((value,index)=>{
                c += value.benefitPercent;
              })
              if(c<=100){
                let data = {
                  templateName,
                  remark,
                  list:this.interestDatas,
                  operator:this.operator,
                  operatorName:this.operatorName,
                  channelId:this.channelId,
                };
                netWorkDevice("/benefitTemplate/add", data).then(res => {
                  this.getPageDatas(); //刷新页面
                  this.newlyAdded = false;
                  this.$Message.success("新增成功");
                })
              }else{
                this.$Message.error("利益分配不能超过百分之百！");
              }
            }else{
              this.$Message.error("先选择填写完数据！");
            }
          } else if (this.showNewlyType == "bj") {
            if(this.isNotNull()){
              let c = 0;
              this.interestDatas.forEach((value,index)=>{
                c += value.benefitPercent;
              })
              if(c<=100){
                let data = {
                  templateName,
                  remark,
                  list:this.interestDatas,
                  operator:this.operator,
                  operatorName:this.operatorName,
                  channelId:this.channelId,
                  id: value.id,
                };
                netWorkDevice("/benefitTemplate/modify", data).then(res => {
                  this.getPageDatas(); //刷新页面
                  this.newlyAdded = false;
                  this.$Message.success("编辑成功");
                })
              }else{
                this.$Message.error("利益分配不能超过百分之百！");
              }
            }else{
              this.$Message.error("先选择填写完数据！");
            }
            
          }
        } else {
          // this.$Message.error("请填写模板名称！");
        }
      })
    },
    queryAccount(){
      let url = `/benefitTemplate/queryAccount?channelId=${this.channelId}`;
      return netWorkDevice(url, null,'get').then(res => {
        console.log(this.interestDatas)
        this.interestDatas = [...this.interestDatas,res.result];
        console.log(this.interestDatas)
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
    getBenefitData(channelId){
        let url = `/benefitAccount/getBox?channelId=${channelId?channelId:this.channelId}`
        return netWorkDevice(url, null,'get').then(res => {
          this.receivablesList = res.result.boxVoList;
          this.receivablesInfo = res.result.list;
        })
    },
    getInterestDatas(templateId){
      let data = {
        templateId,
        pageNum:1,
        pageSize:100,
      }
      return netWorkDevice('/benefitDetail/list',data).then(res => {
        this.interestDatas = res.result.list;
      })
    },
    getPageDatas(){
      let data = {
        channelId:this.channelId,
        pageNum:this.pageNum,
        pageSize:this.pageSize,
        userId:this.operator,
        type:this.$store.state.user.userVo.type,
        managerRoute:this.$store.state.user.userVo.managerRoute,
        templateName:this.templateName
      }
      netWorkDevice('/benefitTemplate/list', data).then(res => {
        this.pageNum = res.result.pageNum;
        this.total = res.result.total;
        this.datas = res.result.list;
      })
    }
  },
  mounted(){
    this.getPageDatas();
    this.getBenefitData();
  }
}
</script>

<style lang="less" scoped>
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
  .ivu-table-cell{
    padding-left: 0px;
    padding-right:0px;
  }
  .ivu-page{
    text-align: center;
    margin-top: 10px;
  }
  .interest{
    /deep/.ivu-modal-body{
      min-height:300px;
      max-height:500px;
      overflow: auto;
    }
    /deep/ .ivu-input-wrapper{
      width: 160px;
    }
    .ivu-select{
      width: 160px;
    }
    .ivu-divider{
      margin:16px 0px;
    }
  }
  #item{
    margin-top:10px;
    >div{
      margin-right: 10px;
    }
    .ivu-select{
      width: 100px;
    }
    .ivu-input-number{
      width:70px;
    }
    .ivu-input-wrapper{
      width:100px;
    }
    .account{
      width: 160px;
    }
  }
  .interest{
    /deep/.ivu-form-item{
      display: inline-block;
      .ivu-form-item-content{
        margin-left: 0px!important
      }
    }
  }
</style>