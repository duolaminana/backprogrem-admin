<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
// import Main from '@/components/main'
export default {
  name: 'App',
}
</script>

<style lang="less">
.size{
  width: 100%;
  height: 100%;
  min-width: 1200px;
}
html,body{
  .size;
  min-width: 1200px;
  overflow: hidden;
  margin: 0;
  padding: 0;
}
#app {
  .size;
}
//重置element table样式
.el-table th>.cell{
  color: #515a6e;
  font-size: 12px;
}
.el-table td, .el-table th{
  height: 40px;
  padding: 0px 0;
}
.el-table .cell, .el-table th div, .el-table--border td:first-child .cell, .el-table--border th:first-child .cell {
  font-size: 12px;
}
.el-table [class*=el-table__row--level] .el-table__expand-icon{
  margin-left: -28px
}
.marginRight{
  margin-right: 10px!important
}
#app {
    .ivu-table-cell {
      padding-left: 0px;
      padding-right: 0px;
    }
    .ivu-input-wrapper{
      width: 160px;
    }
    .ivu-select{
      width: 160px;
    }
    .ivu-cascader{
      width: 160px;
    }
    .ivu-date-picker{
      width: 160px;
    }
    /deep/ .ztree .level0.center_open:before{
    content: '';
    background:url('./assets/images/jianhao.png');
    background-size: 100%;
    border:none;
    display:inline-block;
    width: 14px;
    height: 14px;
    top:4px;
    transform: none
  }
  /deep/ .ztree .level0.center_close:before{
    content: '';
    background:url('./assets/images/jiahao.png');
    background-size: 100%;
    border:none;
    display:inline-block;
    width: 14px;
    height: 14px;
    top:4px;
    transform: none
  }
  /deep/ .ztree .level0.roots_close:before{
    content: '';
    background:url('./assets/images/jiahao.png');
    background-size: 100%;
    border:none;
    display:inline-block;
    width: 14px;
    height: 14px;
    top:4px;
    transform: none
  }
  /deep/ .ztree .level0.roots_open:before{
    content: '';
    background:url('./assets/images/jianhao.png');
    background-size: 100%;
    border:none;
    display:inline-block;
    width: 14px;
    height: 14px;
    top:4px;
    transform: none
  }
  /deep/ .ztree .level0.bottom_close:before{
    content: '';
    background:url('./assets/images/jiahao.png');
    background-size: 100%;
    border:none;
    display:inline-block;
    width: 14px;
    height: 14px;
    top:4px;
    transform: none
  }
  /deep/ .ztree .level0.bottom_open:before{
    content: '';
    background:url('./assets/images/jianhao.png');
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
  .ztree .level0.center_open:before{
    content: '';
    background:url('./assets/images/jianhao.png');
    background-size: 100%;
    border:none;
    display:inline-block;
    width: 14px;
    height: 14px;
    top:4px;
    transform: none
  }
  .ztree .level0.center_close:before{
    content: '';
    background:url('./assets/images/jiahao.png');
    background-size: 100%;
    border:none;
    display:inline-block;
    width: 14px;
    height: 14px;
    top:4px;
    transform: none
  }
  .ztree .level0.roots_close:before{
    content: '';
    background:url('./assets/images/jiahao.png');
    background-size: 100%;
    border:none;
    display:inline-block;
    width: 14px;
    height: 14px;
    top:4px;
    transform: none
  }
  .ztree .level0.roots_open:before{
    content: '';
    background:url('./assets/images/jianhao.png');
    background-size: 100%;
    border:none;
    display:inline-block;
    width: 14px;
    height: 14px;
    top:4px;
    transform: none
  }
  .ztree .level0.bottom_close:before{
    content: '';
    background:url('./assets/images/jiahao.png');
    background-size: 100%;
    border:none;
    display:inline-block;
    width: 14px;
    height: 14px;
    top:4px;
    transform: none
  }
  .ztree .level0.bottom_open:before{
    content: '';
    background:url('./assets/images/jianhao.png');
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
  .rightDiv{
    // margin-left:320px
    overflow: hidden;
  }
  .xzbtn{
    float: right;
  }
  .ivu-input-wrapper{
    width: 200px;
  }
  .ivu-select-disabled .ivu-select-selection,.ivu-input[disabled],.ivu-input-number-disabled .ivu-input-number-input{
    color:#515a6e!important;
    opacity: 1!important
  }
  .gray{
    color:#afb2b7
  }
  .blue{
    color:#2d8cf0
  }
  .red{
    color:#ed4014
  }
  .orange{
    color:#ff9900
  }
  .green{
    color:#19be6b
  }
  .underline{
    text-decoration: underline
  }
  .visi{
    visibility: hidden;
  }
  .must{
    label::before{
      content: '*';
      display: inline-block;
      margin-right: 4px;
      line-height: 1;
      font-family: SimSun;
      font-size: 12px;
      color: #ed4014;
    }
  }
  .headBox{
    overflow: hidden;
    text-align: center
  }
  .modelInput{
    width: 350px!important;
    margin-left: 50px;
  }
  .trBgColor{
    background: #EEEEEE
  }
  .trBgColor>td{
    background:transparent!important
  }
</style>
