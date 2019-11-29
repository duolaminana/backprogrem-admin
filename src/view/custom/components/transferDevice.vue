<template>
  <div>
    <Modal
      v-model="newlyAdded"
      width="600"
      title="选择渠道"
      :mask-closable = "false"
      :closable = 'false'
    >
      <Table border ref="selection" :highlight-row='true' :columns="columns" :data="datas" @on-row-click='tableClick'>
      </Table>
      <!-- <Page :total="total" show-elevator :current='pageNum' @on-change='pageChange' :page-size='pageSize' @on-page-size-change='sizeChange'  show-sizer/> -->
      <div slot="footer">
        <Button size="large" @click="cancel" >取消</Button>
      </div>
    </Modal>
    <Modal
      v-model="transferNewlyAdded"
      width="400"
      title="转移设备"
      :mask-closable = "false"
      :closable = 'false'
    >
      <h2>是否要将设备转入【{{rowData.channelName}}】,转移后设备与原有商品将被清空，是否清空?</h2>
      <div slot="footer">
        <Button size="large" @click="transferNewlyAdded=false" >取消</Button>
        <!-- <Button size="large" @click="transferBtn(false)" >否</Button> -->
        <Button size="large" type="primary" @click="transferBtn(true)" >是</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import {netWorkHttp} from '@/api/data'
export default {
  name:'transferDevice',
  props:['newlyAdded'],
  data(){
    return{
      transferNewlyAdded:false,
      rowData:{},
      datas:[],
      columns:[
        {
          type: 'index',
          width: 60,
          align: 'center'
        },
        {
          title: '名称',
          key: 'channelName',
          align: 'center',
          width: 507,
          tooltip:true
        }
      ],
      pageSize:10,
      total:null,
      pageNum:1,
      datas:[],
    }
  },
  methods:{
    transferBtn(isClean){
      this.$emit('onSure',this.rowData.id,isClean)
    },
    tableClick(row){
      this.rowData = row;
      this.transferNewlyAdded = true;
      // this.$Modal.confirm({
      //   title: "是否要将设备转入【"+row.channelName+"】,转移后设备与原有商品将被清空，是否继续?",
      //   // 点击了确定
      //   onOk: () => {
      //     this.$emit('onSure',row.id)
      //   },
      // });
    },
    cancel(){
      this.$emit('cancel')
    },
    pickTree(value){
      console.log(value)
      this.$emit('clickTreeRow',value)
    },
    pageChange(value){
      this.pageNum = value;
      this.getPageDatas();
    },
    sizeChange(value){
      this.pageSize = value;
      this.getPageDatas();
    },
    getData(){
      let data = {
        channelId:this.$store.state.user.channelId,
        pageNum:this.pageNum,
        auditStatus:4,
        pageSize:this.pageSize
      }
      const url =`/channel/queryRelationChannelByChannelId?channelId=${this.$store.state.user.channelId}`
      netWorkHttp(url,null,'get').then(res => {
        this.datas = res.result;
      })
    }
  },
  mounted(){
    this.getData()
  }
}
</script>
<style lang="less" scoped>
  .ivu-page{
    text-align: center;
    margin-top: 10px;
  }
</style>