<template>
    <div ref="dom">
    </div>
</template>

<script>
import echarts from 'echarts'
import { on, off } from '@/libs/tools'
export default {
  name: 'serviceRequests',
  props:{
    xAxisData:{
      type:Array,
    },
    series:{
      type:Array,
    },
    colorList:{
      type:Array,
    }
  },
  data () {
    return {
      dom: null,
      option:{
        // color:['#00ff00','#333333','#00ff00','#333333'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        grid: {
          top: '8%',
          left: '1.2%',
          right: '2%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data:this.xAxisData,
            axisLabel: {  
              interval:0,      //坐标轴刻度标签的显示间隔(在类目轴中有效) 0:显示所有  1：隔一个显示一个 :3：隔三个显示一个...
              rotate:-20    //标签倾斜的角度，显示不全时可以通过旋转防止标签重叠（-90到90）
            }
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        legend: {
          data:this.series.map(v=>v.name),
        },
        color:this.colorList,
        series:this.series,
      }
    }
  },
  methods: {
    resize () {
      this.dom.resize()
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.dom = echarts.init(this.$refs.dom)
      this.dom.setOption(this.option)
      on(window, 'resize', this.resize)
    })
  },
  beforeDestroy () {
    off(window, 'resize', this.resize)
  }
}
</script>