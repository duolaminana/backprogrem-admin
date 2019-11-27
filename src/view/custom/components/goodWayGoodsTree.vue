<template>
  <Modal
    v-model="newlyAdded"
    width="600"
    :title="isgoods?'商户选择':'选择渠道'"
    :mask-closable = "false"
    :closable = 'false'
    :draggable = 'isdraggable'
  >
    <Coustom-tree 
      :treeData='treeData'
      @pickTree = 'pickTree'
    >
    </Coustom-tree>
    <Page :current="pageNumTree" :total="totalTree" :page-size="pageSizeTree" simple @on-change="pageChangeTree" />
    <div slot="footer">
      <Button size="large" @click="cancel"  v-show='!isgoods' >取消</Button>
      <Button type="primary" size="large" @click="cancel" v-show='isgoods'>确定</Button>
    </div>
  </Modal>
</template>

<script>
import CoustomTree from '../components/coustom-tree';
import {netWorkHttp} from '@/api/data'
export default {
  components: {
    CoustomTree
  },
  name:'goodWayGoodsTree',
  props:{
    newlyAdded:{
      default:false
    },
    isgoods:{
      default:true,
    },
    isdraggable:{
      default:true
    }
  },
  data(){
    return{
      pageSizeTree:10,
      totalTree:null,
      pageNumTree:1,
      treeData:[],//渠道树
    }
  },
  methods:{
    cancel(){
      this.$emit('cancel')
    },
    pickTree(value){
      console.log(value)
      this.$emit('clickTreeRow',value)
    },
    pageChangeTree(value){
      this.pageNumTree = value;
      this.getTreeData();
    },
    getTreeData(){
      let data = {
        channelId:this.$store.state.user.channelId,
        pageNum:this.pageNumTree,
        pageSize:this.pageSizeTree
      }
      netWorkHttp('/channel/queryChannelTreeByChannelId',data).then(res => {
        this.pageNumTree = res.result.pageNum;
        this.totalTree = res.result.total;
        this.treeData = res.result.list;
      })
    }
  },
  mounted(){
    this.getTreeData()
  }
}
</script>
<style lang="less" scoped>
  .tree{
    min-height: 300px;
    height: 600px;
    overflow: auto;
  }
</style>