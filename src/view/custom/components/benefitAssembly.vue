<template>
<div class='benefitAssembly'>
  <Modal
    v-model="benefitNewlyAdded"
    width="800"
    title="利益分配详情"
    :mask-closable="false"
    :closable = 'false'
  >
    <Button  type="primary"  @click='showNewlyAdded("xz")'>新增</Button>
    <Table border ref="selection" :columns="columns" :data="datas">
      <template slot-scope="{ row, index }"  slot="benefitType">
        <span v-show='row.benefitType==1'>本金</span>
        <span v-show='row.benefitType==2'>点位</span>
        <span v-show='row.benefitType==3'>运营</span>
        <span v-show='row.benefitType==4'>资产</span>
        <span v-show='row.benefitType==5'>软件平台</span>
        <span v-show='row.benefitType==6'>其他</span>
      </template>
      <template slot-scope="{ row, index }"  slot="edit">
        <Button type="primary" size="small" class='marBtn' @click='showNewlyAdded("bj",index,row)'>编辑</Button>
        <Button type="error" size="small" @click="modalDel=true;delID=row.id;delIndex=index">删除</Button>
      </template>
    </Table>
    <Page :total="total" show-elevator :current='pageNum' @on-change='pageChange' :page-size='pageSize' @on-page-size-change='sizeChange'  show-sizer/>
    <div slot="footer">
      <Button type="text" size="large" @click="cancel">取消</Button>
    </div>
  </Modal>
  <!-- 新增弹框的模态框 -->
  <Modal
    v-model="newlyAdded"
    width="600"
    :title="showNewlyType=='xz'?'新增利益分配详情':'编辑利益分配详情'"
    :mask-closable="false"
  >
    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
      <FormItem label="分配类型" prop="benefitType">
        <Select v-model="formValidate.benefitType"   :clearable='true'>
          <Option v-for="item in benefitTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
      </FormItem>
      <FormItem label="利益分配百分比" prop="benefitPercent">
        <!-- <Input v-model.trim="formValidate.benefitPercent" placeholder="" /> -->
        <InputNumber
          :max="100"
          :min="0"
          v-model="Percentage"
          :formatter="value => `${value}%`"
          :parser="value => value.replace('%', '')"
          @on-change="PercentageChange"
        ></InputNumber>
      </FormItem>
      <FormItem label="备注" prop="remark">
        <Input v-model.trim="formValidate.remark" placeholder="" />
      </FormItem>
    </Form>
    <div slot="footer">
      <Button type="text" size="large" @click="newlyAdded=false">取消</Button>
      <Button type="primary" size="large" @click="Added(formValidate)">确定</Button>
    </div>
  </Modal>
  <!-- 删除 -->
    <delete-component
      :modalDel="modalDel"
      :del_loading="modal_loading"
      @cancel="delCancel"
      @del="del"
    ></delete-component>
</div>
</template>

<script>
import { netWorkDevice} from "@/api/data";
import  deleteComponent from "@/view/custom/components/deleteComponent";
export default {
  name:'benefitAssembly',
  components: {
    deleteComponent
  },
  props:['benefitNewlyAdded','datas',"total",'pageNum','pageSize','templateId'],
  data(){
    return{
      modalDel:false,
      modal_loading:false,//删除的loading
      delID:null,//删除的ID
      delIndex:null,//删除的索引
      benefitTypeList:[
        {
          value: '1',
          label: '本金'
        },
        {
          value: '2',
          label: '点位'
        },
        {
          value: '3',
          label: '运营'
        },
        {
          value: '4',
          label: '资产'
        },
        {
          value: '5',
          label: '软件平台'
        },
        {
          value: '6',
          label: '其他'
        }
      ],
      Percentage: 0, //浮动百分比
      formValidate:{ //新增字段
        benefitPercent:0,
        benefitType:null,
        remark:null,
      },
      ruleValidate: {
      },
      showNewlyType:'xz',
      newlyAdded:false,
      columns:[
        {
          title: '分配类型',
          slot: 'benefitType',
          align: 'center',
          tooltip:true
        },
        {
          title: '利益分配百分比',
          key: 'benefitPercent',
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
				}
      ],
      operator:this.$store.state.user.userId,
      operatorName:this.$store.state.user.userName,
      channelId:this.$store.state.user.channelId
    }
  },
  methods:{
    delCancel(){
      this.modal_loading = false;
      this.modalDel = false;
    },
    del(){
      this.modal_loading = true;
      let url = '/benefitDetail/delete?id='+this.delID
      netWorkDevice(url,null,'delete').then(res => {
        this.modal_loading = false;
        this.modalDel = false;
        this.$emit("pageChange",1); //刷新页面
        this.delID = null;//删除的ID
        this.delIndex =null;//删除的索引
        this.$Message.success('删除成功');
      }).catch(err => {
        this.modal_loading = false;
      });
    },
    PercentageChange(value) {
      this.formValidate.benefitPercent = value;
    },
    showNewlyAdded(type, index,row) {
      this.showNewlyType = type;
      this.formValidate = { //新增字段
        benefitPercent:0,
        benefitType:null,
        remark:null,
      };
      //初始化数据
      if (type == "bj") {
        this.formValidate = row;
        this.formValidate.benefitType = this.formValidate.benefitType.toString();
        this.Percentage = this.formValidate.benefitPercent
      }
      this.newlyAdded = true;
    },
    Added(value) {
      if (true) {
        let {
          benefitPercent,
          benefitType,
          remark,
        } = value;
        if (this.showNewlyType == "xz") {
          let data = {
            benefitPercent,
            benefitType,
            remark,
            templateId:this.templateId,
            operator:this.operator,
            operatorName:this.operatorName,
            channelId:this.channelId,
          };
          netWorkDevice("/benefitDetail/add", data).then(res => {
            this.$emit("pageChange",1); //刷新页面
            this.newlyAdded = false;
            this.$Message.success("新增成功");
          })
        } else if (this.showNewlyType == "bj") {
          let data = {
            benefitPercent,
            benefitType,
            remark,
            operator:this.operator,
            operatorName:this.operatorName,
            channelId:this.channelId,
            id: value.id,
          };
          netWorkDevice("/benefitDetail/modify", data).then(res => {
            this.$emit("pageChange",1); //刷新页面
            this.newlyAdded = false;
            this.$Message.success("编辑成功");
          })
        }
      } else {
        this.$Message.error("信息填写不完整！");
      }
    },
    cancel(){
      this.$emit("hideNewlyAdded")
    },
    sizeChange(value){
      this.$emit("sizeChange",value)
    },
    pageChange(value){
      this.$emit("pageChange",value)
    }
  }
}
</script>

<style lang="less" scoped>
    .ivu-input-wrapper{
      width: 180px;
    }
    .ivu-select{
      width: 180px;
    }
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
</style>