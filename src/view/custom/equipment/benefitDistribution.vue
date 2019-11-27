<template>
  <div class='benefitDistribution'>
    <div style="overflow: hidden;">
      <Button  type="primary" @click='showNewlyAdded("xz")' class='xzbtn' icon="md-add">新增</Button>
    </div>
    <Table border ref="selection" :columns="columns" :data="datas">
      <template slot-scope="{ row, index }"  slot="edit">
        <Button type="success" size="small" class='marBtn' @click='details(row)'>详情</Button>
        <Button type="primary" size="small" class='marBtn' @click='showNewlyAdded("bj",index,row)'>编辑</Button>
        <Button type="error" size="small" @click="modalDel=true;delID=row.id;delIndex=index">删除</Button>
      </template>
    </Table>
    <Page :total="total" show-elevator :current='pageNum' @on-change='pageChange' :page-size='pageSize' @on-page-size-change='sizeChange'  show-sizer/>
    <!-- 删除 -->
    <delete-component
      :modalDel="modalDel"
      :del_loading="modal_loading"
      @cancel="delCancel"
      @del="del"
    ></delete-component>
    <!-- 新增弹框的模态框 -->
    <Modal
      v-model="newlyAdded"
      width="600"
      :title="showNewlyType=='xz'?'新增利益分配':'编辑利益分配'"
      :mask-closable="false"
    >
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
        <FormItem label="模板名称" prop="templateName">
          <Input v-model.trim="formValidate.templateName" placeholder="" />
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
    <benefit-assembly
      :benefitNewlyAdded = 'benefitNewlyAdded'
      :datas = 'benefitDatas'
      :total = 'benefitTotal'
      :pageNum = 'benefitPageNum'
      :pageSize = 'benefitPageSize'
      :templateId = 'rowId'
      @hideNewlyAdded = 'hideNewlyAdded'
      @pageChange = 'benefitPageChange'
      @sizeChange = 'benefitSizeChange'
    ></benefit-assembly>
  </div>

</template>

<script>
import { netWorkDevice} from "@/api/data";
import benefitAssembly from "@/view/custom/components/benefitAssembly";
import  deleteComponent from "@/view/custom/components/deleteComponent";
export default {
  components:{
    benefitAssembly,
    deleteComponent
  },
  name:'benefitDistribution',
  data(){
    return{
      benefitTotal:null,
      benefitPageNum:1,
      benefitPageSize:15,
      benefitDatas:[],
      benefitNewlyAdded:false,
      rowId:null,
      //详情
      modalDel:false,
      modal_loading:false,//删除的loading
      delID:null,//删除的ID
      delIndex:null,//删除的索引
      formValidate:{ //新增字段
        templateName:null,
        remark:null,
      },
      ruleValidate: {
      },
      showNewlyType:'xz',
      newlyAdded:false,
      pageNum:1,
      total:null,
      pageSize:15,
      datas: [],
      columns: [
        {
          title: '模板名称',
          key: 'templateName',
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
          width:'200',
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
    hideNewlyAdded(){
      this.benefitNewlyAdded = false;
    },
    details(row){
      if(row)this.rowId = row.id
      let data ={
        templateId:this.rowId
      }
      netWorkDevice('/benefitDetail/list',data).then(res => {
        this.benefitNewlyAdded = true;
        this.benefitDatas = res.result.list;
      })
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
    showNewlyAdded(type, index,row) {
      this.showNewlyType = type;
      this.formValidate = { //新增字段
        templateName:null,
        remark:null,
      };
      //初始化数据
      if (type == "bj") {
        this.formValidate = JSON.parse(JSON.stringify(row));
      }
      this.newlyAdded = true;
    },
    Added(value) {
      if (true) {
        let {
          templateName,
          remark,
        } = value;
        if (this.showNewlyType == "xz") {
          let data = {
            templateName,
            remark,
            operator:this.operator,
            operatorName:this.operatorName,
            channelId:this.channelId,
          };
          netWorkDevice("/benefitTemplate/add", data).then(res => {
            this.getPageDatas(); //刷新页面
            this.newlyAdded = false;
            this.$Message.success("新增成功");
          })
        } else if (this.showNewlyType == "bj") {
          let data = {
            templateName,
            remark,
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
        }
      } else {
        this.$Message.error("信息填写不完整！");
      }
    },
    benefitPageChange(value){
      this.benefitPageNum = value;
      this.details();
    },
    benefitSizeChange(value){
      this.benefitPageSize = value;
      this.details();
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
        channelId:this.channelId,
        pageNum:this.pageNum,
        pageSize:this.pageSize,
      }
      netWorkDevice('/benefitTemplate/list', data).then(res => {
        this.pageNum = res.result.pageNum;
        this.total = res.result.total;
        this.datas = res.result.list;
      })
      // .catch(err => {
      //   this.$Message.error(err);
      // });
    }
  },
  mounted(){
    this.getPageDatas();
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
</style>