<template>
	<div class='commodityPrice'>
      <div>
        <Select v-model="categoryId" class="marginRight" placeholder="销售范围" clearable>
          <Option v-for="item in rangeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <Input v-model="name"  placeholder="模板名称" clearable class='marginRight'/>
        <Button @click='clickQuery' type="primary">查询</Button>
        <Button @click='reset' type="primary">重置</Button>
        <Button  v-if="hasPerm('pro:price:edit')"  type="primary" @click='showNewlyAdded("xz")' class='xzbtn' icon="md-add">新增</Button>
        <Table border ref="selection" :columns="columns" :data="datas">
          <template slot-scope="{ row, index }" slot="templateName">
              <Poptip placement="right" width="380" trigger='hover' @on-popper-show='popperShow(row)' >
                <Icon type="ios-paper" color='#2d8cf0' size='20' style="margin-left:5px;"/>
                <div slot="content">
                  <template v-if='priceTemplateDetailVos.length>0'>
                  <Card v-for='(v,i) in priceTemplateDetailVos' :key='v.id'>
                    <div class='poptipDiv'>
                        商品：{{v.productName}}&nbsp&nbsp进价：{{v.buyPrice}}售价：{{v.actualPrice}}
                    </div>
                  </Card>
                  </template>
                  <template v-else>
                    暂无数据
                  </template>
                </div>
              </Poptip>
              {{row.templateName}}
          </template>
          <template slot-scope="{ row, index }"    slot="edit">
              <Button v-if="hasPerm('pro:price:edit')" type="success" size="small" class='marBtn' @click='clickTemplate(row)'>模板</Button>
              <Button v-if="hasPerm('pro:price:edit')" type="primary" size="small" class='marBtn' @click='showNewlyAdded("bj",index)'>编辑</Button>
              <Button v-if="hasPerm('pro:price:edit')" type="error" size="small" @click="modalDel=true;delID=row.id;delIndex=index">删除</Button>
          </template>
        </Table>
        <Page :total="total" show-elevator :current='pageNum' @on-change='pageChange' :page-size='pageSize' @on-page-size-change='sizeChange'  show-sizer/>
      </div>
      <!-- 删除 -->
      <delete-component
        :modalDel = 'modalDel'
        :del_loading = 'modal_loading'
        @cancel = 'delCancel'
        @del = 'del'
      >
      </delete-component>
      <!-- 新增弹框的模态框 -->
      <Modal v-model="newlyAdded" width="600" :title="showNewlyType=='xz'?'新增商品价格模板':'编辑商品价格模板'"  :mask-closable='false'>
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
          <FormItem label="销售范围"  prop="categoryId" class='modelInput'>
            <Select v-model="formValidate.categoryId">
                <Option v-for="item in rangeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <Divider />
          <FormItem label="模板名称" prop="templateName" class='modelInput'>
            <Input v-model.trim="formValidate.templateName" placeholder="模板名称"/>
          </FormItem>
          <FormItem label="备注" prop="remark" class='modelInput'>
            <Input v-model.trim="formValidate.remark" placeholder="备注"/>
          </FormItem>
        </Form>
         <div slot="footer">
          <Button type="text" size="large" @click='newlyAdded=false'>取消</Button>
          <Button type="primary" size="large":loading="sure_loading"  @click="Added(formValidate,'formValidate')">确定</Button>
         </div>
      </Modal>
      <template-transfer
        :data = "transferData"
        :targetKeys = 'targetKeys'
        :showModal = 'showModal'
        @hideModal = 'hideModal'
        @transferSure = 'transferSure'
        @handleChange = 'handleChange'
      >
      </template-transfer>
  </div>
</template>
<script>
import {netWorkGoods} from '@/api/data'
import templateTransfer from '../components/templateTransfer';
import { setTimeout } from 'timers';
import { Promise } from 'q';
import  deleteComponent from "@/view/custom/components/deleteComponent";
export default {
  components: {
    templateTransfer,
    deleteComponent
  },
  name: 'commodityPrice',
  data () {
    return {
      categoryId:null,
      rangeList:[],
      priceTemplateDetailVos:[],
      sure_loading:false,
      templateChannelId:null,//模板渠道id
      templateRemark:null,//模板备注
      templateID:null,//模板ID
      targetKeys:[],
      transferData:[],
      showModal:false,
      modalDel:false,
      modal_loading:false,//删除的loading
      delID:null,//删除的ID
      delIndex:null,//删除的索引
      pIdValue:[],
      showNewlyType:'xz',
      newlyAdded:false,//新增按钮的弹框
      formValidate:{ //新增字段
        templateName: null, //模板名称
        remark:null,
        categoryId:null
      },
      ruleValidate: {
        templateName: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur",
          },
          { max: 8, message: "长度最多是8个字符", trigger: "blur" }
        ],
        categoryId: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "change",
            type:'number'
          }
        ],
        remark: [
          { max: 20, message: "长度最多是20个字符", trigger: "blur" }
        ],
      },
      pageNum:1, //当前页数
      total:null,//总条数
      pageSize:15,//每页条数
      name: null,
      datas: [],
      columns: [
        {
          title: '序号',
          type: 'index',
          width:80,
          align: 'center',
        },
        {
          title: '销售范围',
          key: 'categoryName',
          align: 'center',
          tooltip:true
        },
        {
          title: '模板名称',
          slot: 'templateName',
          align: 'center',
          className:'templateName',
          tooltip:true
        },
        {
          // title: '操作人姓名',
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
          tooltip:true
				},
      ],
      operator:this.$store.state.user.userId,
      operatorName:this.$store.state.user.userName,
      channelId:this.$store.state.user.channelId
    }
  },
  methods: {
    clickQuery(){
      this.pageNum = 1;
      this.getPageDatas();
    },
    reset(){
      this.pageNum = 1;
      this.categoryId = null;
      this.name = null;
      this.getPageDatas();
    },
    popperShow(row){
      const data = {
        channelId:this.channelId,
        templateId:row.id,
        pageNum:1,
        pageSize:200
      }
      netWorkGoods('/priceTemplateDetail/findPriceTemplateDetailPage',data).then(res=>{
        this.priceTemplateDetailVos = res.result.list;
      })
    },
    delCancel(){
      this.modal_loading = false;
      this.modalDel = false;
    },
    handleChange(newTargetKeys){
      this.targetKeys = newTargetKeys;
      setTimeout(() => {
        this.bandInput()
      },10);
    },
    transferSure(){
        let array = []; //刷选已选模板的数据
        this.transferData.forEach((value,index)=>{
          this.targetKeys.forEach((v,i)=>{
            if(v==value.key){
              array = [...array,value];
            }
          })
        });
        console.log(this.targetKeys)
        let dataList = [];  //组装信息
        console.log(array)
        array.forEach((v,i)=>{
          let obj = {};
          obj.actualPrice = v.templateActualPrice?v.templateActualPrice:v.productActualPrice;
          obj.productId = v.key;
          obj.templateId = this.templateID;
          obj.remark = this.templateRemark;
          obj.channelId = this.templateChannelId;
          dataList = [...dataList,obj]
        })
        let data = {
          modifiedPriceTemplateDetailDto:dataList,
          templateId:this.templateID
        }
        netWorkGoods('/priceTemplateDetail/batchModifiedPriceTemplateDetail',data).then(res => {
          this.transferData = [];//初始化数据
          this.targetKeys = [];//初始化数据
          this.$Message.success('操作成功');
          this.showModal = false;
        })
    },
    async clickTemplate(row){
      this.templateID = row.id;
      this.templateRemark = row.remark;
      this.templateChannelId = row.channelId;
      this.showModal=true;
      await this.getTransfer(row).then(()=>{
        this.bandInput()
      });
    },
    bandInput(){
        let input = document.querySelectorAll('.inputText');
        let that = this;
        console.log(input)
        input.forEach((value,index)=>{
          value.addEventListener("input", function(event){
              let index = this.dataset['index'];
              if(event.target.value>9999){
                event.target.value =9999;
              }
              let value = event.target.value;
              that.$set(that.transferData[index],'templateActualPrice',value);
              console.log(that.transferData[index].templateActualPrice)
          })
          value.addEventListener("click", function(event){
              event.stopPropagation();
          })
        })
    },
    hideModal(){
      this.showModal = false;
    },
    getRowKeys(row){
      return row.value;
    },
    del(){
      this.modal_loading = true;
      let url = '/priceTemplate/priceTemplateDelete?id='+this.delID
      netWorkGoods(url).then(res => {
        this.modal_loading = false;
        this.modalDel = false;
        this.datas.splice(this.delIndex,1);
        this.delID = null;//删除的ID
        this.delIndex =null;//删除的索引
        this.$Message.success('删除成功');
      }).catch(err => {
        this.modal_loading = false;
        // this.$Message.error(err);
      });
    },
    async showNewlyAdded(type,index){
      await this.initialization('formValidate');
      this.sure_loading = false;
      this.showNewlyType = type;
      //初始化数据
      this.formValidate = {//新增字段
        templateName: null, //模板名称
        remark:null,
        categoryId:null
      };
      this.pIdValue = [];
      if(type=='bj'){
        this.formValidate =JSON.parse(JSON.stringify(this.datas[index]));
      }
      this.newlyAdded=true
    },
    Added(value,name){
      this.sure_loading = true;
      this.$refs[name].validate(valid => {
        if (valid) {
          let  { templateName,remark,categoryId} =  value;
          if(this.showNewlyType=='xz'){
            let data = {
              remark,
              templateName,
              categoryId,
              operator:this.operator,
              operatorName:this.operatorName,
              channelId:this.channelId,
            }
            netWorkGoods('/priceTemplate/priceTemplateSave',data).then(res => {
              this.getPageDatas();//刷新页面
              this.newlyAdded = false;
              this.$Message.success('新增成功');
              this.sure_loading = false;
            }).catch(()=>{
              this.sure_loading = false;
            })
          }else if(this.showNewlyType=='bj'){
            let data = {
              remark,
              templateName,
              categoryId,
              id:value.id,
              operator:this.operator,
              operatorName:this.operatorName,
              channelId:this.channelId,
            }
            netWorkGoods('/priceTemplate/priceTemplateModified',data).then(res => {
              this.getPageDatas();//刷新页面
              this.newlyAdded = false;
              this.$Message.success('编辑成功');
              this.sure_loading = false;
            }).catch(()=>{
              this.sure_loading = false;
            })
          }
        }else{
          this.sure_loading = false;
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
    getPageDatas(){
      let data = {
        templateName:this.name,
        enable:true,
        pageNum:this.pageNum,
        pageSize:this.pageSize,
        channelId:this.channelId,
        categoryId:this.categoryId
      }
      netWorkGoods('/priceTemplate/findPriceTemplatePage',data).then(res => {
        this.pageNum = res.result.pageNum;
        this.total = res.result.total;
        this.datas = res.result.list;
      })
    },
    getTransfer({categoryId}){
      let data = {
        templateId:this.templateID,
        channelId:this.channelId,
        categoryId
      }
      return new Promise((resolve, reject)=>{
        netWorkGoods('/priceTemplateDetail/findPriceTemplateDetailJSONObject',data).then(res => {
          this.transferData  = res.result.notAddedProduct;
          this.targetKeys  = res.result.addedProduct;
          this.transferData.forEach((value,index)=>{
            this.$set(this.transferData[index],'index',index);
          });
          resolve();
        }).catch(err => {
          reject();
        });
      })
    },
    getRange(){
      const url = `/channelBusiness/queryChannelBusinessByChannelId?channelId=${this.channelId}`
      return netWorkGoods(url,null,'get').then(res=>{
        this.rangeList = res.result.map(v=> {
          return {value:v.categoryId,label:v.categoryName}
        })
      })
    }
  },
  mounted () {
    this.getPageDatas();
    this.getRange();
  }
}
</script>

<style lang="less" scoped>
  .commodityPrice{
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
    /deep/ .ivu-poptip-inner {
      text-align: left;
      max-height: 200px;
      overflow: auto;
    }
    /deep/ .ivu-table-wrapper{
      overflow: inherit
    }
    /deep/ .ivu-card-body{
      padding:5px
    }
    .poptipDiv{
      font-size:14px;
    }
    /deep/ .templateName{
      padding-left: 10px;
    }
  }
</style>
