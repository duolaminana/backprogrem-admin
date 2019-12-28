<template>
  <div class='content'>
    <div v-for='(v,i) in list' :key='v+i'>
      <h2>{{v.headTitle}}</h2>
      <template v-for='(value,index) in v.children' >
        <h1 :key='value+index+i' :id='value.id' class='peg'>{{value.title}}</h1>
        <template v-for='(item,itemIndex) in value.children'>
          <template v-if='item.children&&item.children.length'>
            <h3 :key='item+itemIndex+i+index' :id='item.id' class='peg'>{{item.title}}</h3>
            <template v-for='(itemChild,itemIndexChild) in item.children'>
              <p :key='item+itemIndex+i+index+itemIndexChild' :id='itemChild.id' class='peg'>{{itemChild.describe}}</p>
              <img v-if='itemChild.img' :src="itemChild.img" >
            </template>
          </template>
          <template v-else>
            <h3 :key='item+itemIndex+i+index' :id='item.id' class='peg'>{{item.title}}</h3>
            <p>{{item.describe}}</p>
            <img v-if='item.img' :src="item.img" >
          </template>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name:'centerContent',
  props:{
    list:{
      default:[],
      type: Array,
    }
  }
}
</script>

<style lang="less" scoped>
  .content{
    color:#515A6E;
    >div{
      h2{
        font-size: 16px;
        margin-top: 30px;
      }
      h1{
        font-size: 16px;
        margin-top: 20px;
      }
      h3{
        font-size: 14px;
        padding-left: 25px;
        margin-top:30px;
      }
      p{
        font-size: 12px;
        padding-left: 35px;
        margin-top: 10px;
      }
      img{
        margin-top: 20px;
        padding-left: 35px;
        display: block
      }
    }
  }
</style>