<template>
  <div class="cylindricalData">
    <p>{{title}}</p>
    <div  v-for="(v,i) in dataList" :key='i+v'>
      <span>{{v.productProduce}}</span>
      <i>{{v.companyName}}</i>
      <div>
        <!-- <div ref='dataWidth' :data-width='v.num/count*100' :style="{width:(v.num/count*100)+'%',background:'#2D8CF0'}" ></div> -->
        <div ref='dataWidth' :data-width='v.productProduce/count*100' :style="{background:'#2D8CF0'}" ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name:'cylindricalData',
  props:{
    title:{
      default:'销量Top10(分公司)',
      type:String
    },
    maxNum:{ //根据最大值显示长度
      default:true,
      type:Boolean
    },
    dataList:{
      type:Array,
      default:()=>{
        return [
          {channelId: 1, productProduce: 1, companyName: "深圳环阳通总部"},
        ]
      }
    }
  },
  computed:{
    count(){
      if(this.maxNum) return Math.max.apply(null,this.dataList.map(v=>v.productProduce))
      return this.dataList.map(v=>v.productProduce).reduce((prev,cur)=>prev+cur,0)
    }
  },
  data(){
    return{
    }
  },
  methods:{
  },
  mounted(){
    this.$nextTick(()=>{
      let ary = this.$refs.dataWidth;
      ary.map(v=>{
        v.style.width = v.dataset.width+'%'
      })
    })
  },
}
</script>

<style lang="less" scoped>
  .cylindricalData{
    padding:15px;
    >p{
      color:#515A6E;
      font-size: 18px;
      margin-bottom: 10px;
    }
    >div{
      overflow: hidden;
      margin-top: 5px;
      
      >span{
        float: right;
        width: 50px;
        text-align: right;
        overflow: hidden;
      }
      >i{
        float: left;
        width: 110px;
        font-style: normal;
        overflow: hidden;
        padding-left: 10px;
      }
      >div{
        height: 15px;
        margin:0px 60px 0 110px;
        >div{
          border-radius:7px;
          height: 7px;
          margin-top: 5px;
          width: 0;
          transition:all 1.2s ease;
        }
      }
    }
  }
</style>