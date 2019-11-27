<template>
  <Modal v-model="showModal" width="800" title="模板" :loading='addedLoadding' :mask-closable='false' :closable='false'>
    <Transfer
      :titles='["我的商品","已添加商品"]'
      :data="data"
      :target-keys="targetKeys"
      :render-format="render"
      :list-style = "{width:'350px',height:'600px'}"
      :filter-method="filterMethod"
      filterable
      @on-change="handleChange">
      <!-- <div :style="{float: 'right', margin: '5px'}">
        <Button size="small" @click="reloadMockData">重置</Button>
      </div> -->
    </Transfer>
    <div slot="footer">
      <Button type="text" size="large" @click='hideModal'>取消</Button>
      <Button type="primary" size="large" @click="sure">确定</Button>
     </div>
  </Modal>
</template>
<script>
export default {
  name:'templateTransfer',
  props:{
    showModal:{
      default:false,
    },
    data:{
      default:()=>{
				return []
			}
    },
    targetKeys:{
      default:()=>{
				return []
			}
    }
  },
  data(){
    return {
      addedLoadding:false,
    }
  },
  created(){
  },
  methods:{
    sure(){
      this.$emit('transferSure');
    },
    hideModal(){
      this.$emit('hideModal');
    },
    render(item) {
      if(this.targetKeys.includes(item.key)){
        return `名称：${item.label}&nbsp&nbsp&nbsp&nbsp现价：<input value=${item.modifiedTemplateActualPrice?item.modifiedTemplateActualPrice:item.productActualPrice} style='width:60px' class='inputText' data-index='${item.index}'/>`
      }else{
        return `名称：${item.label}&nbsp&nbsp&nbsp&nbsp实际售价：￥${item.productActualPrice}`;
      }
    },
    handleChange (newTargetKeys, direction, moveKeys) {
      this.$emit('handleChange',newTargetKeys);
    },
    filterMethod (data, query) {
      return data.label.indexOf(query) > -1;
    }
  }
}
</script>

<style lang="less" scoped>
.inputText {
  outline: none;
  border:1px solid red;
  width: 20px;
  border-radius: 5px;
}
</style>