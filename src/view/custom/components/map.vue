<template>
  <Poptip  placement="bottom" width='400' padding='0px 0px' @on-popper-show='poptipShow' >
    <input :class='{"positionRlue":positionRlue}' id='input_id' type="text" v-model="inputValue" @input='SelectInput'  class='selectInput' placeholder="点位地址">
    <div slot="content" id='js-container'>
    </div>
  </Poptip>
</template>
<script>
import remoteLoad from '@/libs/remoteLoad.js'
import config from '@/config'
import axios from 'axios'
export default {
  props: ['lat', 'lng','searchKey','positionRlue'],
  computed:{
    inputValue:{
      get(){
        return this.searchKey;
      },
      set(){

      }
    },
  },
  data () {
    return {
      pipShow:false,
      placeSearch: null,
      dragStatus: false,
      AMapUI: null,
      AMap: null
    }
  },
  methods: {
    poptipShow(){
      this.initMap ();
    },
    SelectInput(event){
      let data = {
        address:event.target.value,
      }
      this.$emit('drag', data);
    },
    // 实例化地图
    initMap () {
      let that = this;
      let AMapUI = this.AMapUI = window.AMapUI
      let AMap = this.AMap = window.AMap
      let mapConfig = {
        zoom: 16,
      }
      AMapUI.loadUI(['misc/PositionPicker'], PositionPicker => {
        if (this.lat && this.lng) {
          mapConfig.center = [this.lng, this.lat];
          console.log(mapConfig.center)
        }
        let map = new AMap.Map('js-container', mapConfig);
        AMap.plugin('AMap.Autocomplete', function(){
          var autoOptions = {
            input: 'input_id'
          }
          var autoComplete= new AMap.Autocomplete(autoOptions);
          AMap.event.addListener(autoComplete,'select',res=>{
            if(res.poi.location.lng){
              let data = {
                address:res.poi.name,
                position:{
                  lng:res.poi.location.lng,
                  lat:res.poi.location.lat
                }
              }
              that.$emit('drag', data);
            }else{
              let url = `https://restapi.amap.com/v3/geocode/geo?key=a63edeccaf444460aaeb254bb2a2de90&&address=${res.poi.name}&&output=JSON`;
              axios.get(url).then(res=>{
                if(res.data.status=='1'){
                  let ary = res.data.geocodes[0].location.split(",");
                  let data = {
                    address:res.data.geocodes[0].formatted_address,
                    position:{
                      lng:ary[0],
                      lat:ary[1]
                    }
                  }
                  that.$emit('drag', data);
                }
              })
            }
          })
        })
        // 创建地图拖拽
        let positionPicker = new PositionPicker({
          mode: 'dragMarker', // 设定为拖拽地图模式，可选'dragMap'、'dragMarker'，默认为'dragMap'
          map: map // 依赖地图对象
        })
        // 拖拽完成发送自定义 drag 事件
        positionPicker.on('success', positionResult => {
          // 过滤掉初始化地图后的第一次默认拖放
          if (!this.dragStatus) {
            this.dragStatus = true
          } else {
            let data = {
              address:positionResult.address,
              position:{
                lng:positionResult.position.lng,
                lat:positionResult.position.lat
              }
            }
            this.$emit('drag', data);
          }
        })
        positionPicker.on('fail', function(positionResult) {
          console.log(positionResult)
        });
        // 启动拖放
        positionPicker.start()
      })
    }
  },
  async created () {
    if (window.AMap && window.AMapUI) {
      this.initMap()
    } else {
      await remoteLoad(`http://webapi.amap.com/maps?v=1.4.15&key=${config.MapKey}`)
      await remoteLoad('http://webapi.amap.com/ui/1.0/main.js')
      this.initMap()
    }
  }
}
</script>

<style lang="css">
#js-container{height: 300px;}
.m-map{position: relative; }
.m-map .map{ width: 100%; height: 100%; }
.m-map .search{ position: absolute; top: 10px; left: 10px; width: 285px; z-index: 1; }
.m-map .search input{ width: 180px; border: 1px solid #ccc; line-height: 20px; padding: 5px; outline: none; }
.m-map .search button{ line-height: 26px; background: #fff; border: 1px solid #ccc; width: 50px; text-align: center; }
.m-map .result{ max-height: 300px; overflow: auto; margin-top: 10px; }
.ivu-input-wrapper,.ivu-select,.ivu-cascader,.ivu-date-picker{
  width: 220px;
  margin-right: 5px;
}
.selectInput{
  display: inline-block;
  width: 220px;
  height: 32px;
  line-height: 1.5;
  padding: 4px 7px;
  font-size: 12px;
  border: 1px solid #dcdee2;
  border-radius: 4px;
  color: #515a6e;
  background-color: #fff;
  background-image: none;
  position: relative;
  cursor: text;
}
input.selectInput::placeholder{
  color: #ccc;
}
.amap-sug-result{
  z-index: 9999;
}
.positionRlue{
  border: 1px solid #ed4014;
}
</style>