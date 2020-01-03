<template>
	<div class="gis">
    <Card>
      <channel-tree id='tree' @clickTreeRow="clickTreeRow" ></channel-tree>
    </Card>
    <Card>
      <big-data-map 
      ref='gis'
      :isColor='true' 
      id='gis'
      :dataList = 'dataList'
      >
      </big-data-map>
    </Card>
    <p class='ps'>
      <template v-for='(v,i) in ps'>
        <img :src="v.img" :key='v+i'>
        <span>{{v.describe}}</span>
      </template>
    </p>
  </div>
</template>
<script>
import channelTree from "../components/channelTree";
import bigDataMap from '@/view/custom/components/bigDataMap'
import { netWorkDevice } from "@/api/data";
export default {
  components: {
    channelTree,
    bigDataMap,
  },
  name: 'GIS',
  data () {
    return {
      channelId:this.$store.state.user.channelId,
      dataList:[],
      ps:[
        {
          img: require('../../../assets/images/p_red.png'),
          describe:'棉花糖机'
        },
        {
          img: require('../../../assets/images/p_orange.png'),
          describe:'烟机'
        },
        {
          img: require('../../../assets/images/p_green.png'),
          describe:'药机'
        },
        {
          img: require('../../../assets/images/p_pink.png'),
          describe:'电子烟'
        },
        {
          img: require('../../../assets/images/p_blue.png'),
          describe:'购物袋'
        },
        {
          img: require('../../../assets/images/p_change.png'),
          describe:'混合机'
        }
      ]
		}
  },
  methods: {
    async clickTreeRow(value) {
      if (value) {
        this.channelId = value.id;
        await this.getAllGISByChannelId();
        this.$refs.gis.initMap();
      }
    },
    getAllGISByChannelId(){
      const data = {
        channelId:this.channelId,
        managerRoute:this.$store.state.user.userVo.managerRoute,
        userId:this.$store.state.user.userVo.id,
        type:this.$store.state.user.userVo.type
      }
      return netWorkDevice('/machineInfo/queryAllGISByChannelId',data).then(res=>{
        this.dataList = res.result;
      })
    }
  },
  mounted () {
    this.getAllGISByChannelId().then(()=>{
      this.$refs.gis.initMap();
    });
  },
}
</script>

<style lang="less" scoped>
  .gis{
    font-size: 0px;
    overflow: hidden;
    >div.ivu-card{
      height: 700px;
    }
    >div.ivu-card:first-of-type{
      float: right;
      z-index: 1;
      overflow-y: auto;
    }
    >div.ivu-card:last-of-type{
      /deep/.ivu-card-body{
        padding:0;
        height:100%;
      }
    }
  }
  .ps{
    margin-top: 20px;
    >span{
      margin-right: 20px;
      margin-left: 5px;
      font-size: 12px;
    }
    >img{
      width:24px
    }
  }
</style>
