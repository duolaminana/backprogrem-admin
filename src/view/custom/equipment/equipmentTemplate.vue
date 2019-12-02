<template>
	<div class='equipmentTemplate' v-if="!isDetail">
      <Input v-model="templateName"  placeholder="模板名称" class='marginRight'  clearable/>
      <Button  @click='clickQuery'  type="primary">查询</Button>
      <Button  @click='reset' type="primary">重置</Button>
      <Button v-if="hasPerm('pos:eqt:edit')"  type="primary" @click='showNewlyAdded("xz")' class='xzbtn' icon="md-add">新增</Button>
      <Table border ref="selection" :columns="columns" :data="datas" >
        <template slot-scope="{ row, index }"  slot="edit">
          <!-- <Button type="success" size="small" class='marBtn' @click='toLink(row)'>模板</Button> -->
            <Button v-if="hasPerm('pos:eqt:edit')" type="primary" size="small" class='marBtn'@click='showNewlyAdded("bj",row)' >编辑</Button>
            <Button v-if="hasPerm('pos:eqt:edit')" type="error" size="small" @click="modalDel=true;delID=row.id;delIndex=index">删除</Button>
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
  </div>
  <div v-else>
    <device-component-set
      :query = 'query'
      :equipmentList = 'equipmentList'
      :showNewlyType = 'showNewlyType'
      :rowData = 'rowData'
      @toBack =  'toBack'
      ref='device'
    ></device-component-set>
  </div>
</template> 
<script>
import { netWorkDevice} from "@/api/data";
import deviceComponentSet from '@/view/custom/components/deviceComponentSet';
import  deleteComponent from "@/view/custom/components/deleteComponent";
export default {
  components: {
    deviceComponentSet,
    deleteComponent
  },
  name: 'equipmentTemplate',
  data () {
    return {
      rowData:{},
      query:[],
      isDetail:false,
      delID:null,//删除的ID
      delIndex:null,//删除的索引
      modalDel:false,
      modal_loading:false,//删除的loading
      equipmentList:[],
      showNewlyType:'xz',
      pageNum:1,
      total:null,
      pageSize:15,
      templateName:null,
			datas: [],
      columns: [
        {
          title: '序号',
          type: 'index',
          width:80,
          align: 'center'
        },
        {
          title: '模板名称',
          key: 'templateName',
          align: 'center',
          tooltip:true
        },
        {
          title: '设备类型',
          key: 'machineName',
          align: 'center',
          tooltip:true
        },
        {
          title: '操作人姓名',
          key: 'operatorName',
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
          title: '创建时间',
          key: 'createDate',
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
  methods: {
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
    delCancel(){
      this.modal_loading = false;
      this.modalDel = false;
    },
    toBack(){
      this.isDetail = false;
      this.query = [];
      this.getPageDatas()
    },
    toLink(row){
      this.$Spin.show()
      let url = `/machineTemplateDetail/queryByTemplateId?templateId=${row.id}`;
      netWorkDevice(url,null,'get').then(res => {
        this.query = res.result;
        this.query.list.forEach((v,i)=>{
          v.AddMachineTypeRoadDto.forEach((val,index)=>{
            val.roadType =  val.roadType?val.roadType.toString():'1';
            val.rowData =  val.rowData?val.rowData:{};
            setTimeout(()=>{  //延时让组件先渲染 否则为空
              if(this.query.list[i].AddMachineTypeRoadDto[index].merged){
                if(this.query.list[i].AddMachineTypeRoadDto[index].roadStatus==1){
                  this.query.setWidthAfterNum = index;
                }
                this.$refs.device.setWidthAfter(i,index)
              }
            },1)
            console.log(1111111)
          })
        })
        this.$Spin.hide()
        this.isDetail = true;
      })
      .catch(err => {
        this.$Spin.hide()
      });
    },
    del(){
      this.modal_loading = true;
      let url = '/machineTemplate/deleteMachineTemplate?id='+this.delID
      netWorkDevice(url,null,'delete').then(res => {
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
    showNewlyAdded(type,row){
      this.showNewlyType = type;
      //初始化数据
      if(type=='bj'){
        this.toLink(row);
        this.rowData = JSON.parse(JSON.stringify(row));
      }else{
        this.rowData = {};
        this.isDetail = true;
        this.getEquipment();
      }
    },
    Added(value){
      if(true){
        let  { templateName,machineType,remark} =  value;
        if(this.showNewlyType=='xz'){
          let data = {
            templateName,
            machineType,
            remark,
            operator:this.operator,
            operatorName:this.operatorName,
            channelId:this.channelId,
          }
          netWorkDevice('/machineTemplate/addMachineTemplate',data).then(res => {
            this.getPageDatas();//刷新页面
            this.$Message.success('新增成功');
          })
        }else if(this.showNewlyType=='bj'){
          let data = {
            templateName,
            machineType,
            remark,
            operator:this.operator,
            operatorName:this.operatorName,
            channelId:this.channelId,
            id:value.id
          }
          netWorkDevice('/machineTemplate/modifyMachineTemplate',data).then(res => {
            this.getPageDatas();//刷新页面
            this.$Message.success('编辑成功');
          })
        }
      }else{
        this.$Message.error('信息填写不完整！');
      }
    },
    pageChange(value){
      this.pageNum = value;
      this.getPageDatas();
    },
    sizeChange(value){
      this.pageSize = value;
      this.getPageDatas();
    },
    getEquipment(){
      let url = '/machineType/queryNameByCategoryId'
      netWorkDevice(url, null,'get').then(res => {
        this.equipmentList = res.result
      })
    },
    getPageDatas(){
      let data = {
        channelId:this.channelId,
        templateName:this.templateName,
        pageNum:this.pageNum,
        pageSize:this.pageSize,
      }
      netWorkDevice('/machineTemplate/queryMachineTemplateByCondition', data).then(res => {
        this.pageNum = res.result.pageNum;
        this.total = res.result.total;
        this.datas = res.result.list;
      })
    }
  },
  mounted () {
    this.getPageDatas();
    
  },
  beforeRouteLeave (to, from, next) {
    this.isDetail = false;
    next();
  },
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
	.ivu-table-cell img{
		width: 33px;
		height: 33px;
  }
  .ivu-form-item-content .ivu-input-wrapper{
    width: 330px
  }
</style>
