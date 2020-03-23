<template>
  <div class='benefitAccount'>
    <div style="overflow: hidden;">
      <!-- <Input v-model="templateName"  placeholder="模板名称" clearable class='marginRight'/>
      <Button @click='getPageDatas' icon="ios-search">查询</Button> -->
      <Button @click='getPageDatas(true)' type="primary" >查询所有</Button>
      <Button v-if="hasPerm('pos:bet:edit')"  type="primary" @click='showNewlyAdded("xz")' class='xzbtn' icon="md-add">新增</Button>
    </div>
    <Table border ref="selection" :columns="columns" :data="datas">
      <template slot-scope="{ row, index }"  slot="edit">
        <Button v-if="row.type!=1&&hasPerm('pos:bet:edit')" type="primary" size="small" class='marBtn' @click='showNewlyAdded("bj",index,row)'>编辑</Button>
        <Button v-if="row.type!=1&&hasPerm('pos:bet:edit')" type="error" size="small" @click="modalDel=true;delID=row.id;delIndex=index">删除</Button>
      </template>
    </Table>
    <Page :total="total" show-elevator :current='pageNum' @on-change='pageChange' :page-size='pageSize' @on-page-size-change='sizeChange'  show-sizer/>
    <!-- 删除 -->
    
    <!-- 新增弹框的模态框 -->
    <Modal
      class='interest'
      v-model="newlyAdded"
      width="600"
      :title="showNewlyType=='xz'?'新增':'编辑'"
      :mask-closable="false"
    >
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
        <FormItem label="收款方" prop="beneficiary" class='modelInput'>
          <Input v-model.trim="formValidate.beneficiary" placeholder="收款方" />
        </FormItem>
        <FormItem label="收款人" prop="payee" class='modelInput'>
          <Input v-model.trim="formValidate.payee" placeholder="收款人" />
        </FormItem>
        <FormItem label="收款账号" prop="account" class='modelInput' >
          <Input v-model.trim="formValidate.account" placeholder="收款账号" @on-blur="getBankEnt" />
        </FormItem>
        <FormItem label="开户行" prop="openingBank" class='modelInput'>
          <Input v-model.trim="formValidate.openingBank" placeholder="开户行" />
        </FormItem>
        <FormItem label="备注" class='modelInput'>
          <Input v-model.trim="formValidate.remark" placeholder="备注" />
        </FormItem>
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
import { netWorkDevice,netWorkHttp} from "@/api/data";
import  interestComponent from "@/view/custom/components/interestComponent";
import  deleteComponent from "@/view/custom/components/deleteComponent";
export default {
  components:{
    interestComponent,
    deleteComponent
  },
  name:'benefitAccount',
  props:['rowData'],
  data(){
    const validateReceiveAccount = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("输入不能为空"));
      } else if (!/^(\d{15}|\d{16}|\d{17}|\d{19})$/g.test(value)) {
        callback(new Error("银行账号格式错误"));
      } else {
        callback();
      }
    };
    return{
      templateName:null,
      //详情
      modalDel:false,
      modal_loading:false,//删除的loading
      delID:null,//删除的ID
      delIndex:null,//删除的索引
      formValidate:{ //新增字段
        beneficiary:null,
        payee:null,
        account:null,
        openingBank:null,
        remark:null,
      },
      ruleValidate: {
        beneficiary: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur",
          },
          { max: 8, message: "长度最多是8个字符", trigger: "blur" },
        ],
        payee: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur",
          }
        ],
        account: [
          {
            required: true,
            trigger: "blur",
            validator:validateReceiveAccount
          }
        ],
        openingBank: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur",
          }
        ],
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
          title: '收款方',
          key: 'beneficiary',
          align: 'center',
          tooltip:true
        },
        {
          title: '收款人',
          key: 'payee',
          align: 'center',
          tooltip:true
        },
        {
          title: '收款账号',
          key: 'account',
          align: 'center',
          tooltip:true
        },
        {
          title: '开户行',
          key: 'openingBank',
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
          width:120,
          tooltip:true
				}
      ],
      operator:this.$store.state.user.userId,
      operatorName:this.$store.state.user.userName,
      channelId:this.$store.state.user.channelId
    }
  },
  methods:{
    getBankEnt(event){
      let value = event.target.value.replace(/\s+/g,"")
      const url = `/channelApply/getChannelBankOfDeposit?cardNumber=${value}`;
      netWorkHttp(url,null,'get').then(res=>{
        this.formValidate.openingBank = res.result;
      })
    },
    delCancel(){
      this.modal_loading = false;
      this.modalDel = false;
    },
    del(){
      this.modal_loading = true;
      let url = '/benefitAccount/delete?id='+this.delID
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
      this.formValidate = { //初始化数据
        beneficiary:null,
        payee:null,
        account:null,
        openingBank:null,
        remark:null,
      };
      if (type == "bj") {
        this.formValidate = JSON.parse(JSON.stringify(row));
      }
      this.newlyAdded = true;
    },
    Added(value,name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          let {
            beneficiary,
            payee,
            account,
            openingBank,
            remark
          } = value;
          if (this.showNewlyType == "xz") {
            let data = {
              beneficiary,
              payee,
              account,
              openingBank,
              remark,
              operator:this.operator,
              operatorName:this.operatorName,
              channelId:this.channelId,
              type:2
            };
            netWorkDevice("/benefitAccount/add", data).then(res => {
              this.getPageDatas(); //刷新页面
              this.newlyAdded = false;
              this.$Message.success("新增成功");
            })
          } else if (this.showNewlyType == "bj") {
            let data = {
              beneficiary,
              payee,
              account,
              openingBank,
              remark,
              operator:this.operator,
              operatorName:this.operatorName,
              type:this.$store.state.user.userVo.type,
              managerRoute:this.$store.state.user.userVo.managerRoute,
              channelId:this.channelId,
              id: value.id,
            };
            netWorkDevice("/benefitAccount/modify", data).then(res => {
              this.getPageDatas(); //刷新页面
              this.newlyAdded = false;
              this.$Message.success("编辑成功");
            })
          }
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
    getPageDatas(isAll=false){
      console.log(this.rowData.id)
      let data = {
        channelId:this.channelId,
        userId:this.operator,
        pageNum:isAll?1:this.pageNum,
        pageSize:this.pageSize,
        templateName:this.templateName,
        templateId:isAll?null:this.rowData.id
      }
      netWorkDevice('/benefitAccount/list', data).then(res => {
        this.pageNum = res.result.pageNum;
        this.total = res.result.total;
        this.datas = res.result.list;
      })
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
  .interest{
    /deep/.ivu-modal-body{
      min-height:300px;
      max-height:500px;
      overflow: auto;
    }
    .ivu-divider{
      margin:16px 0px;
    }
  }
</style>