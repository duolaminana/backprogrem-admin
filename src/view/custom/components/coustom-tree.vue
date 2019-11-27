<template>
  <div class="tree">
    <tree :nodes="treeData" :setting="setting" @onClick="pick" />
    <img src alt />
  </div>
</template>

<script>
import tree from "vue-giant-tree";
export default {
  name: "DemoTree",
  components: {
    tree
  },
  props: {
    treeData: {
      default:()=>{
        return []
      }
    }
  },
  data() {
    return {
      setting: {
        data: {
          key: {
            name: "title"
          }
        },
        ivew: {
          expandSpeed: "fast",
          fontCss: {
            color: "#515a6e",
            "font-size": "12px",
            "font-family": "Arial"
          },
          showIcon: true
        }
      },
      nodes: []
    };
  },
  methods: {
    pick(event, treeId, treeNode) {
      this.$emit("pickTree", treeNode);
    }
  }
};
</script>
<style lang="less" scoped>
.ivu-page {
  text-align: center;
  margin-top: 10px;
}
  .tree{
    /deep/ .level1{
      margin-top:5px;
    }
    /deep/ .node_name{
      font-size:12px;
    }
    /deep/ .ztree li {
        margin-top: 5px;
    }
    /deep/ .ztree .button {
      margin-right: 3px;
    }
    /deep/ .ztree .button.center_open:before{
      content: '';
      background:url('../../../assets/images/jianhao.png');
      background-size: 100%;
      border:none;
      display:inline-block;
      width: 14px;
      height: 14px;
      top:4px;
      transform: none
    }
    /deep/ .ztree .button.center_close:before{
      content: '';
      background:url('../../../assets/images/jiahao.png');
      background-size: 100%;
      border:none;
      display:inline-block;
      width: 14px;
      height: 14px;
      top:4px;
      transform: none
    }
    /deep/ .ztree .button.roots_close:before{
      content: '';
      background:url('../../../assets/images/jiahao.png');
      background-size: 100%;
      border:none;
      display:inline-block;
      width: 14px;
      height: 14px;
      top:4px;
      transform: none
    }
    /deep/ .ztree .button.roots_open:before{
      content: '';
      background:url('../../../assets/images/jianhao.png');
      background-size: 100%;
      border:none;
      display:inline-block;
      width: 14px;
      height: 14px;
      top:4px;
      transform: none
    }
    /deep/ .ztree .button.bottom_close:before{
      content: '';
      background:url('../../../assets/images/jiahao.png');
      background-size: 100%;
      border:none;
      display:inline-block;
      width: 14px;
      height: 14px;
      top:4px;
      transform: none
    }
    /deep/ .ztree .button.bottom_open:before{
      content: '';
      background:url('../../../assets/images/jianhao.png');
      background-size: 100%;
      border:none;
      display:inline-block;
      width: 14px;
      height: 14px;
      top:4px;
      transform: none
    }
    /deep/ .ztree .button.root_open:before{
      content: '';
      background:url('../../../assets/images/jianhao.png');
      background-size: 100%;
      border:none;
      display:inline-block;
      width: 14px;
      height: 14px;
      top:4px;
      transform: none
    }/deep/ .ztree .button.root_close:before{
      content: '';
      background:url('../../../assets/images/jiahao.png');
      background-size: 100%;
      border:none;
      display:inline-block;
      width: 14px;
      height: 14px;
      top:4px;
      transform: none
    }
    
    /deep/.ztree .line:before{
        border-right: 1px dotted #ccc;
    }
    /deep/.ztree .bottom_docu:after, /deep/.ztree .bottom_docu:before,/deep/ .ztree .center_docu:after,/deep/ .ztree .center_docu:before, /deep/.ztree .roots_docu:after, /deep/.ztree .roots_docu:before {
        position: absolute;
        content: "";
        border: 0.5px dotted #ccc;
    }
}
</style>
