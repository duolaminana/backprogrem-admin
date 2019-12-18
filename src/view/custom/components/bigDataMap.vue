<template>
  <div class='bigDataMap' :id='id'>
  </div>
</template>

<script>
import remoteLoad from '@/libs/remoteLoad.js'
import config from '@/config'
export default {
  name:'bigDataMap',
  props:{
    isColor:{  //是否现在正常颜色
      default:false,
      type:Boolean
    },
    id:{
      default:"container"
    },
    dataList:{
      default:()=>{
        return [
          // {enable:2,longitude:120.412618,laytitude:36.382612,machineCode:'1234'},
          // {enable:3,longitude:113.370643,laytitude:22.938827,machineCode:'1234'},
          // {enable:4,longitude:113.001181,laytitude:23.120518,machineCode:'1234'},
          // {enable:5,longitude:113.890205,laytitude:22.798043,machineCode:'1234'},
        ];
      }
    }
  },
  data(){
    return{
      mapStyle:this.isColor?null:"amap://styles/3289a96c2f25483d91b867caf3cc3b53",
      size:50,
    }
  },
  methods:{
    initMap(){
      //创建地图
      const map = new AMap.Map(this.id, {
          zoom:5,
          mapStyle:this.mapStyle,
          center:[104.13487,33.02311]
      });
      let list = [];
      this.dataList.map((v,i)=>{
        let imgUrl;
        switch(v.categoryId){
          case 175:
            imgUrl = require('../../../assets/images/p_red.png');
            break;
          case 174:
            imgUrl = require('../../../assets/images/p_orange.png');
            break;
          case 157:
            imgUrl = require('../../../assets/images/p_green.png');
            break;
          case 183:
            imgUrl = require('../../../assets/images/p_pink.png');
            break;
          case 182:
            imgUrl = require('../../../assets/images/p_blue.png');
            break;
          default:
            imgUrl = require('../../../assets/images/p_change.png');
        }
        let marker = new AMap.Marker({
          icon:imgUrl,
          position: [v.longitude,v.laytitude],
          title:v.machineCode
        });
        list = [...list,marker]
      })
      map.add(list);
      AMapUI.loadUI(['geo/DistrictExplorer'], function(DistrictExplorer) {
        var districtExplorer = new DistrictExplorer({
            map: map
        });
        var adcode = 100000;
        districtExplorer.loadAreaNode(adcode, function(error, areaNode) {
            //更新地图视野
            // map.setBounds(areaNode.getBounds(), null, null, true);
            //清除已有的绘制内容
            districtExplorer.clearFeaturePolygons();
            districtExplorer.renderParentFeature(areaNode, {
                cursor: 'default',
                bubble: true,
                strokeColor: '#5191d4', //线颜色
                strokeOpacity: 1, //线透明度
                strokeWeight:2, //线宽
                fillColor: null, //填充色
                fillOpacity: 0.35, //填充透明度
            });
        });
      });
    }
  },
  async mounted () {
    if (window.AMap && window.AMapUI) {
      this.initMap()
    } else {
      await remoteLoad(`http://webapi.amap.com/maps?v=1.4.15&key=${config.MapKey}`)
      await remoteLoad(`http://webapi.amap.com/ui/1.0/main.js?v=1.0.11`)
      this.initMap()
    }
  }
}
</script>

<style lang="less" scoped>
.bigDataMap{
  min-height:600px;
  height: 100%;
}

</style>