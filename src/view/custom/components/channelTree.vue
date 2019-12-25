<template>
  <div class="channelTree">
    <Icon type="ios-arrow-back" class="backArrow" v-show="isShowArrow" @click="leftArrow()" />
    <Icon
      type="ios-arrow-forward"
      class="forwardArrow"
      v-show="!isShowArrow"
      @click="leftArrow()"
    />
    <div v-if="isShowArrow">
      <Coustom-tree :treeData="treeData" @pickTree="pickTree"></Coustom-tree>
      <Page
        :current="pageNumTree"
        :total="totalTree"
        :page-size="pageSizeTree"
        simple
        @on-change="pageChangeTree"
      />
    </div>
  </div>
</template>

<script>
import CoustomTree from "../components/coustom-tree";
import { netWorkHttp } from "@/api/data";
export default {
  components: {
    CoustomTree
  },
  data() {
    return {
      isShowArrow: true,
      pageSizeTree: 10,
      totalTree: null,
      pageNumTree: 1,
      treeData: [] //渠道树
    };
  },
  methods: {
    leftArrow() {
      this.isShowArrow = !this.isShowArrow;
      this.$emit("leftArrow",this.isShowArrow);
    },
    pickTree(value) {
      this.$emit("clickTreeRow", value);
    },
    pageChangeTree(value) {
      this.pageNumTree = value;
      this.getTreeData();
    },
    getTreeData() {
      let data = {
        channelId: this.$store.state.user.channelId,
        pageNum: this.pageNumTree,
        pageSize: this.pageSizeTree
      };
      netWorkHttp("/channel/queryChannelTreeByChannelId", data).then(res => {
        this.pageNumTree = res.result.pageNum;
        this.totalTree = res.result.total;
        this.treeData = res.result.list;
        this.treeData[0].isHover = true;
      });
    }
  },
  mounted() {
    this.getTreeData();
  }
};
</script>
<style lang="less" scoped>
.channelTree {
  min-width: 20px;
  min-height: 900px;
  position: relative;
  .backArrow {
    position: absolute;
    top: 0;
    right: -15px;
    font-size: 18px;
    cursor: pointer;
  }
  .forwardArrow {
    position: absolute;
    top: 0;
    left:0px;
    font-size: 18px;
  }
}
</style>

