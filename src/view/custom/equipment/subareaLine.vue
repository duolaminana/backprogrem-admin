<template>
	<div>
      <!-- <div class="leftBox">
        <div style='font-size:14px;color:#2d8cf0;font-weight:700'>商户列表</div>
        <channel-tree @clickTreeRow='clickTreeRow'></channel-tree>
      </div> -->
      <div class="leftBox">
        <!-- <Cascader :data="channelList" v-model="channelValue" @on-change='channerChanges' change-on-select></Cascader> -->
        <Input :value="$store.state.user.channelName"  readonly/>
        <div style='font-size:14px;color:#2d8cf0;font-weight:700;margin-top:20px;'>线路列表</div>
        <coustom-tree 
          :treeData='treeData'
          @pickTree = 'pickTree'
        ></coustom-tree>
      </div>
      <div class='rightDiv'>
        <Input v-model="routeName"  placeholder="线路名称" clearable class='marginRight'/>
        <Select v-model="routeType"  class='marginRight' placeholder="线路类型" :clearable='true'>
            <Option v-for="item in routeTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <Button  @click='clickQuery' type="primary" >查询</Button>
        <Button  @click='reset' type="primary">重置</Button>
        <Button v-if="channelId==$store.state.user.userVo.channelId && hasPerm('pos:sub:edit') " type="primary" @click='showNewlyAdded("xz")' class='xzbtn' icon="md-add">新增</Button>
        <Table border ref="selection" :columns="columns" :data="datas">
          <template slot-scope="{ row, index }"  slot="edit">
              <Button v-if="channelId==$store.state.user.userVo.channelId && hasPerm('pos:sub:edit') " type="primary" size="small" @click='showNewlyAdded("bj",index,row)' class='marBtn' >编辑</Button>
              <Button v-if="channelId==$store.state.user.userVo.channelId && hasPerm('pos:sub:edit') " type="error" size="small" @click="modalDel=true;delID=row.id;delIndex=index;delRouteType=row.routeType">删除</Button>
          </template>
          <template slot-scope="{ row, index }"  slot="routeType" >
              <!-- <span v-show='row.routeType==1' class='blue'>分区</span> -->
              <Poptip placement="right" width="300" trigger='hover' >
                <span v-show='row.routeType==2' class='blue'>线路</span>
                <div slot="content">
                  <div>线路下面不能新增分区，用于直接关联多个点位</div>
                </div>
              </Poptip>
              <Poptip placement="right" width="300" trigger='hover' >
                <span v-show='row.routeType==1' >分区</span>
                <div slot="content">
                  <div>分区下面可新增分区</div>
                </div>
              </Poptip>
          </template>
        </Table>
        <Page :total="total" show-elevator :current='pageNum' @on-change='pageChange' :page-size='pageSize' @on-page-size-change='sizeChange'  show-sizer/>
      </div>
      <!-- 新增弹框的模态框 -->
      <Modal v-model="newlyAdded" width="600" :title="showNewlyType=='xz'?'新增路线':'编辑路线'"  :mask-closable='false'>
        <h4 style='padding:0 0 10px 60px' v-if='pickTreeData&&pickTreeData.name'>已选分区：{{pickTreeData.name}}（{{pickTreeData.routeType==1?'分区':'线路'}}）</h4>
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
          <FormItem label="线路名称" prop="routeName" class='modelInput'>
            <Input v-model.trim="formValidate.routeName" placeholder="线路名称"/>
          </FormItem>
          <FormItem label="备注" prop="remark" class='modelInput'>
            <Input v-model.trim="formValidate.remark" placeholder="请输入备注"/>
          </FormItem>
          <FormItem label="线路类型" v-show='showNewlyType=="xz"' class='modelInput'>
            <RadioGroup v-model="formValidate.routeType" >
              <Radio label="1" :disabled="$store.state.user.userVo.managerRoute==2">分区</Radio>
              <Radio label="2">线路</Radio>
            </RadioGroup>
            <p class='gray'>(注：分区下面还可新增分区，路线下面不能新增分区，用于直接关联设备)</p>
          </FormItem>
        </Form>
         <div slot="footer">
          <Button type="text" size="large" @click='newlyAdded=false'>取消</Button>
          <Button type="primary" size="large" @click="Added(formValidate,'formValidate')">确定</Button>
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
import channelTree from '../components/channelTree';
import CoustomTree from '../components/coustom-tree';
import { netWorkDevice,netWorkHttp} from "@/api/data";
import  deleteComponent from "@/view/custom/components/deleteComponent";
export default {
  components: {
    channelTree,
    CoustomTree,
    deleteComponent
  },
  name: 'subareaLine',
  data () {
    return {
      channelValue:[],
      channelList:[],
      routeType:null,
      delRouteType:null,
      routeTypeList:[
        {value:'1',label:'分区'},
        {value:'2',label:'线路'},
      ],
      delID:null,//删除的ID
      delIndex:null,//删除的索引
      modalDel:false,
      modal_loading:false,//删除的loading
      pickTreeData:null,
      formValidate:{
        routeName:null,
        remark:null,
        routeType:this.$store.state.user.userVo.managerRoute==2?'2':'1'
      },
      ruleValidate:{
        routeName: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          },
          { max: 8, message: "长度最多是8个字符", trigger: "blur" },
        ],
        remark: [
          { max: 20, message: "长度最多是20个字符", trigger: "blur" },
        ]
      },
      newlyAdded:false,
      showNewlyType:'xz',
      routeID:null,
      treeData:[],
      pageNum:1,
      total:null,
      pageSize:15,
      routeName:null,
			datas: [],
      columns: [
        {
          title: '序号',
          type: 'index',
          width:50,
          align: 'center'
        },
        {
          title: '线路名称',
          key: 'routeName',
          align: 'center',
          tooltip:true
        },
        {
          title: '线路类型',
          slot: 'routeType',
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
          title: '修改时间',
          align: 'center',
          key: 'updateDate',
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
      this.routeType = null;
      this.pageNum = 1;
      this.total = null;
      this.pageSize = 15;
      this.routeName = null;
      this.routeID = null;
      this.channelId = this.$store.state.user.channelId;
      this.pickTreeData = null;
      this.channelValue = [];
      this.getPageDatas();
      this.getTreeData();
    },
    delCancel(){
      this.modal_loading = false;
      this.modalDel = false;
    },
    channerChanges(value, selectedData){
      this.channelId = value[value.length-1]||this.$store.state.user.channelId;
      this.getTreeData();
    },
    del(){
      this.modal_loading = true;
      let url = `/route/deleteRoute?id=${this.delID}&&routeType=${this.delRouteType}`
      netWorkDevice(url,null,'delete').then(res => {
        this.modal_loading = false;
        this.modalDel = false;
        this.datas.splice(this.delIndex,1);
        this.delID = null;//删除的ID
        this.delIndex =null;//删除的索引
        this.$Message.success('删除成功');
        this.getTreeData();
      }).catch(err => {
        this.modal_loading = false;
        // this.$Message.error(err);
      });
    },
    async showNewlyAdded(type,index){
      await this.initialization('formValidate');
      this.showNewlyType = type;
      this.formValidate = {
        routeName:null,
        remark:null,
        routeType:'1'
      };
      //初始化数据
      if(type=='bj'){
        this.formValidate = JSON.parse(JSON.stringify(this.datas[index]));
        this.formValidate.routeType = this.formValidate.routeType+'';
      }
      this.newlyAdded=true;
    },
    Added(value,name){
      this.$refs[name].validate(valid => {
        if(valid){
          let  { routeName,remark,routeType} =  value;
          if(this.showNewlyType=='xz'){
            if(this.pickTreeData&&this.pickTreeData.routeType==2){
              this.$Message.error('不能往下新增了');
              return false
            }
            let data = {
              routeName:routeType==1?routeName:routeName+'(线路)',
              remark,
              routeType,
              pid:this.pickTreeData?this.pickTreeData.id:-1,
              pids:(this.pickTreeData?this.pickTreeData.parentIds?this.pickTreeData.parentIds+this.pickTreeData.id:this.pickTreeData.id:'')+',',
              operator:this.operator,
              operatorName:this.operatorName,
              channelId:this.channelId,
            }
            netWorkDevice('/route/addRoute',data).then(res => {
              this.getTreeData();
              this.newlyAdded = false;
              this.$Message.success('新增成功');
            })
          }else if(this.showNewlyType=='bj'){
            let data = {
              routeName,
              remark,
              routeType,
              operator:this.operator,
              operatorName:this.operatorName,
              channelId:this.channelId,
              id:value.id
            }
            netWorkDevice('/route/modifyRoute',data).then(res => {
              this.getPageDatas();//刷新页面
              this.newlyAdded = false;
              this.$Message.success('编辑成功');
            })
          }
        }else{
          // this.$Message.error('信息填写不完整！');
        }
      })
      
    },
    pickTree(value){
      this.pickTreeData = value;
      console.log(this.pickTreeData)
      if(value){
        this.routeID = value.id;
        this.routeName = null;
        this.routeType = null;
        this.pageNum = 1;
        this.getPageDatas()
      }else{
        this.routeID = null;
      }
    },
    clickTreeRow(value){
      if(value){
        this.channelId = value.id;
        this.getTreeData();
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
    getTreeData(){
      const data = {
        channelId:this.channelId,
        managerRoute:this.$store.state.user.userVo.managerRoute,
        userId:this.$store.state.user.userVo.id,
        type:this.$store.state.user.userVo.type
      }
      netWorkDevice('/route/queryRouteTreeByUser', data).then(res => {
        this.treeData = res.result;
      })
    },
    getPageDatas(){
      let data = {
        routeType:this.routeType,
        routeName:this.routeName,
        pageNum:this.pageNum,
        pageSize:this.pageSize,
        channelId:this.channelId,
        id:this.routeID,
        managerRoute:this.$store.state.user.userVo.managerRoute,
        userId:this.$store.state.user.userVo.id,
        type:this.$store.state.user.userVo.type
      }
      netWorkDevice('/route/queryRouteListByCondition', data).then(res => {
        this.pageNum = res.result.pageNum;
        this.total = res.result.total;
        this.datas = res.result.list;
      })
    },
    getChannelList(){
      let url = `/channel/querySelectChannelTreeByChannelId?channelId=${this.channelId}`
      netWorkHttp(url).then(res => {
        this.channelList = res.result;
      })
    }
  },
  mounted () {
    this.getPageDatas();
    // this.getChannelList();
    this.getTreeData();
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
	.ivu-table-cell img{
		width: 33px;
		height: 33px;
  }
  .leftBox {
    min-width: 200px;
    min-height: 900px;
    float: left;
    margin-right: 20px;
  }
</style>
