<template>
  <div>
    <Coustom-tree 
      :treeData='treeData'
      @pickTree = 'pickTree'
    >
    </Coustom-tree>
    <Page :current="pageNumTree" :total="totalTree" :page-size="pageSizeTree" simple @on-change="pageChangeTree" />
  </div>
</template>

<script>
import CoustomTree from '../components/coustom-tree';
import {netWorkHttp} from '@/api/data'
export default {
  components: {
    CoustomTree
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
    pickTree(value){
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
        this.treeData[0].isHover=true;
      })
    }
  },
  mounted(){
    this.getTreeData();
  }
}
</script>

