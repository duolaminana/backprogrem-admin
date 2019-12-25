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
      dataList:[
        // {imgNum:1,longitude:114.08595,laytitude:22.547},
        // {imgNum:2,longitude:120.412618,laytitude:36.382612},
        // {imgNum:3,longitude:113.370643,laytitude:22.938827},
        // {imgNum:4,longitude:113.001181,laytitude:23.120518},
        // {imgNum:5,longitude:113.890205,laytitude:22.798043}
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
</style>
