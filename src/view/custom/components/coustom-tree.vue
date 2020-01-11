<template>
  <div class="tree">
    <tree :nodes="treeData" :setting="setting" @onClick="pick" />
    <img src alt />
  </div>
</template>

<script>
import tree from "vue-giant-tree";
import {netWorkHttp} from '@/api/data';
export default {
  name: "DemoTree",
  components: {
    tree
  },
  props: {
    treeData: {
      default: () => {
        return [];
      }
    }
  },
  watch:{
    treeData:{
      handler(newVal,oldVal){
        this.init(newVal)
      },
      deep:true
    }
  },
  data() {
    return {
      setting: {
        data: {
          key: {
            name: "title",
            title: "id",
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
      list:[],
      nodes: [],
    };
  },
  methods: {
    init(newVal){
      const r = this.recursion(newVal);
      if(!r){
        this.getMoney(this.list)
      }
    },
    recursion(ary){
      ary.map(v=>{
        if(v.payee==2){
          this.list.push(v.id)
        }
        if(v.children&&v.children.length){
          return this.recursion(v.children);
        }else{
          return true
        }
      })
    },
    pick(event, treeId, treeNode) {
      this.$emit("pickTree", treeNode);
    },
    getMoney(ary){
      ary.map((v,i)=>{
        setTimeout(() => {
          let node = document.querySelector(`a[title='${v}']`);
          if(node){
            let hasImg = node.querySelector(`img`);
            if(!hasImg){
              let img=document.createElement("img");
              img.src=require('../../../assets/images/money.png');
              img.className = 'tapImg'
              node.insertBefore(img,node.childNodes[0])
            }
          }
        }, 500);
      })
    },
    getMoneyList(){
      const url = `/channelApply/queryHasReceiveTerminalChannelId`;
      netWorkHttp(url,null,'get').then(res=>{
        this.getMoney(res.result)
      })
    }
  },
  mounted(){
  }
};
</script>
<style lang="less" scoped>
.ivu-page {
  text-align: center;
  margin-top: 10px;
}
.tree {
  // max-height: 800px;
  // overflow: auto;
  /deep/ .level1 {
    margin-top: 5px;
  }
  /deep/ .node_name {
    font-size: 12px;
  }
  /deep/ .ztree li {
    margin-top: 5px;
  }
  /deep/ .ztree .button {
    margin-right: 3px;
  }
  /deep/ .ztree .button.center_open:before {
    content: "";
    background: url("../../../assets/images/jianhao.png");
    background-size: 100%;
    border: none;
    display: inline-block;
    width: 14px;
    height: 14px;
    top: 4px;
    transform: none;
  }
  /deep/ .ztree .button.center_close:before {
    content: "";
    background: url("../../../assets/images/jiahao.png");
    background-size: 100%;
    border: none;
    display: inline-block;
    width: 14px;
    height: 14px;
    top: 4px;
    transform: none;
  }
  /deep/ .ztree .button.roots_close:before {
    content: "";
    background: url("../../../assets/images/jiahao.png");
    background-size: 100%;
    border: none;
    display: inline-block;
    width: 14px;
    height: 14px;
    top: 4px;
    transform: none;
  }
  /deep/ .ztree .button.roots_open:before {
    content: "";
    background: url("../../../assets/images/jianhao.png");
    background-size: 100%;
    border: none;
    display: inline-block;
    width: 14px;
    height: 14px;
    top: 4px;
    transform: none;
  }
  /deep/ .ztree .button.bottom_close:before {
    content: "";
    background: url("../../../assets/images/jiahao.png");
    background-size: 100%;
    border: none;
    display: inline-block;
    width: 14px;
    height: 14px;
    top: 4px;
    transform: none;
  }
  /deep/ .ztree .button.bottom_open:before {
    content: "";
    background: url("../../../assets/images/jianhao.png");
    background-size: 100%;
    border: none;
    display: inline-block;
    width: 14px;
    height: 14px;
    top: 4px;
    transform: none;
  }
  /deep/ .ztree .button.root_open:before {
    content: "";
    background: url("../../../assets/images/jianhao.png");
    background-size: 100%;
    border: none;
    display: inline-block;
    width: 14px;
    height: 14px;
    top: 4px;
    transform: none;
  }
  /deep/ .ztree .button.root_close:before {
    content: "";
    background: url("../../../assets/images/jiahao.png");
    background-size: 100%;
    border: none;
    display: inline-block;
    width: 14px;
    height: 14px;
    top: 4px;
    transform: none;
  }

  /deep/.ztree .line:before {
    border-right: 1px dotted #ccc;
  }
  /deep/.ztree .bottom_docu:after,
  /deep/.ztree .bottom_docu:before,
  /deep/ .ztree .center_docu:after,
  /deep/ .ztree .center_docu:before,
  /deep/.ztree .roots_docu:after,
  /deep/.ztree .roots_docu:before {
    position: absolute;
    content: "";
    border: 0.5px dotted #ccc;
  }
  /deep/.tapImg{
    width: 14px;
    height: 14px;
    vertical-align: -2px
  }
}
</style>
