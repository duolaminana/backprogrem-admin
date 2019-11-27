<template>
  <Modal v-model="modalDel" width="400" class='deleteComponent' :mask-closable='false' :closable='false' >
    <div slot="header">
      <p>提示信息</p>
      <Icon type="md-close" size='20' color='#515a6e' class='icon' @click='cancel'/>
    </div>
    <div class='center'>
      <img class='wain' :src="require('../../../assets/images/totast_img.png')">
      <div>
        <h6>确定要删除该信息？</h6>
        <p>如果是请点击删除，否则点击取消。</p>
      </div>
    </div>
    <div slot="footer">
      <Button type="primary"  size="large" @click="del" :loading="del_loading">删除</Button>
      <Button size="large" @click='cancel'>取消</Button>
    </div>
  </Modal>
</template>

<script>
export default {
  props:{
    modalDel:{
      default:false
    },
    del_loading:{
      default: false
    },
  },
  name:'deleteComponent',
  methods:{
    cancel(){
      this.$emit('cancel')
    },
    del(){
      this.$emit('del')
    }
  }
}
</script>

<style lang="less" scoped>
  .deleteComponent{
    /deep/.ivu-modal-content{
      overflow: hidden;
    }
    .icon{
      position: absolute;
      right:16px;
      top:18px;
      cursor: pointer;
    }
    /deep/.ivu-modal-header{
      padding:20px 16px;
      position: relative;
    }
    /deep/.ivu-modal-footer{
      border:none;
      text-align: center;
      margin-bottom: 20px;
      button{
        padding: 6px 20px 6px 20px;
      }
    }
    .center{
      overflow: hidden;
      .wain{
        margin-left: 20px;
        float: left;
        margin-right: 20px;
      }
      >div{
        overflow: hidden;
        >h6{
          margin-top: 5px;
        }
        >p{
          margin-top: 5px;
          color:#afb2b7
        }
      }
    }
  }
  
</style>