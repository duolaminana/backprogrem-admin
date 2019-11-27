<template>
  <div>
    <Modal
      v-model="newlyAdded"
      :width="modalWidth"
      :title="title"
      :mask-closable = "false"
      :closable = 'false'
    >
      <Table border ref="selection" :highlight-row='highlight' :columns="columns" :data="datas" @on-row-click='tableClick'>
      </Table>
      <Page v-if='showPage' :total="total" show-elevator :current='pageNum' @on-change='pageChange' :page-size='pageSize' @on-page-size-change='sizeChange'  show-sizer/>
      <div slot="footer">
        <Button size="large" @click="cancel">取消</Button>
        <Button type="primary" size="large" @click="sure">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  name:'tableModal',
  props:{
    highlight:{
      default:true
    },
    modalWidth:{
      default:600
    },
    showPage:{
      default:true
    },
    newlyAdded:{
      default:false
    },
    datas:{
      default:()=>{
        return []
      }
    },
    columns:{
      default:()=>{
        return []
      }
    },
    title:{},
    pageSize:{
      default:10
    },
    total:{
      default:null
    },
    pageNum:{
      default:1
    }
  },
  data(){
    return{}
  },
  methods:{
    sure(){
      this.$emit('sure')
    },
    tableClick(row){
      this.$emit('tableClick',row)
    },
    cancel(){
      this.$emit('cancel')
    },
    pageChange(value){
      this.$emit('pageChange',value)
    },
    sizeChange(value){
      this.$emit('sizeChange',value)
    },
  },
}
</script>
<style lang="less" scoped>
  .ivu-page{
    text-align: center;
    margin-top: 10px;
  }
</style>