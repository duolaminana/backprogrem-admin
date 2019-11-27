<template>
  <Card class='typeTemplateDetails'>
    <Button type="primary" size="large" class='keep' icon='md-albums' @click='keep'>保存</Button>
    机型名称：<Input v-model="query.machineName" class='marginRight' :disabled='true' clearable/>
    货道类型：<Select v-model="roadType"  class='marginRight' :clearable='true'>
            <Option v-for="item in roadTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
    <div style="margin-top:10px">
    行/列：<InputNumber :max="query.maxLayer" :min="1"  v-model="layerNo"  style="margin-right:10px"></InputNumber>
    <InputNumber :max="query.maxClomun" :min="1"  v-model="columnNo"  style="margin-right:40px"></InputNumber>
    <Button type="primary" size="large" @click='generate' :disabled='listData.length>0'>生成货道</Button>
    <Button type="warning" size="large" @click='addRow' :disabled='listData.length>=query.maxLayer'>添加行</Button>
    <Button type="warning" size="large" @click='deleteRow' :disabled='listData.length==0'>删除行</Button>
    <Button type="warning" size="large" @click='toBack'>返回</Button>
    </div>
    <Card class='box' :padding='6'>
      <template v-for='(v,i) in listData'>
        <div class='rowBefore'>
          <Button type="primary" icon="md-add" @click='addClomun(i)' :disabled='listData[i].AddMachineTypeRoadDto.length>=query.maxClomun'></Button>
          <Button type="error" icon="md-close" @click='deleteClomun(i)' :disabled='listData[i].AddMachineTypeRoadDto.length==0'></Button>
        </div>
        <Card class='row' :padding='6' :bordered='false'  :key='v+i'>
          <Card class='item' :class='{"itemAction":value.roadStatus==2,"itemMerged":value.merged}'  v-for='(value,index) in v.AddMachineTypeRoadDto' :key='value+index'>
            <p>行：{{value.layerNo}}&nbsp&nbsp&nbsp&nbsp列：{{value.columnNo}}</p>
            <p>货道编码：{{value.roadNo}}</p>
            <p>
              货道类型：<Select v-model="value.roadType"  class='itemSelect' :clearable='true' :disabled='value.roadStatus==2'>
                <Option v-for="item in roadTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
            </p>
            <p>
              <Button type="success" size="large" v-show='value.roadStatus==2' @click='value.roadStatus=1'>启用</Button>
              <Button type="warning" size="large" v-show='value.roadStatus==1' @click='value.roadStatus=2'>停用</Button>
              <Button type="error" size="large" v-show='value.roadStatus==3' @click='cancelMerger(i,index,1)'>取消合并</Button>
              <Button type="error" size="large" v-show='value.roadStatus!=3' @click='merge(i,index,3)'>合并</Button>
            </p>
          </Card>
        </Card>
      </template>
    </Card>
  </Card>
</template>

<script>
import { netWorkDevice} from "@/api/data";
export default {
  name:'typeTemplateDetails',
  props:['query'],
  data(){
    return{
      listData:this.query.list||[],
      columnNo:this.query.maxClomun,
      layerNo:this.query.maxLayer,
      roadType:'1',
      roadTypeList:[
        {value:'1',label:'履带'},
        {value:'2',label:'弹簧'}
      ]
    }
  },
  methods:{
    addClomun(i){
      let previous = this.listData[i].AddMachineTypeRoadDto[this.listData[i].AddMachineTypeRoadDto.length-1]||{};
      console.log(previous)
      let data = {};
      data.id = null;
      data.roadNo = previous.roadNo+1||(i+1-1)*this.query.maxClomun+1;
      data.columnNo = previous.columnNo+1||1;
      data.layerNo = previous.layerNo||i+1;
      data.roadType = "1";
      data.roadStatus = 1;
      data.merged = false;
      this.listData[i].AddMachineTypeRoadDto = [...this.listData[i].AddMachineTypeRoadDto,data]
    },
    deleteClomun(i){
      let idBe = this.listData[i].AddMachineTypeRoadDto[this.listData[i].AddMachineTypeRoadDto.length-1].id;
      if(idBe){
        this.$Message.error('存在id,不允许删除');
      }else{
        this.listData[i].AddMachineTypeRoadDto.pop();
      }
    },
    deleteRow(){
      let idBe = this.listData[this.listData.length-1].AddMachineTypeRoadDto.some((item)=>{
        return item.id
      })
      if(idBe){
        this.$Message.error('存在id,不允许删除');
      }else{
        this.listData.pop();
      }
    },
    addRow(){
      let AddMachineTypeRoadDto = [];
      for(let j=1;j<=this.columnNo;j++){
        let data = {};
        data.id = null;
        data.roadNo = (this.listData.length+1-1)*this.query.maxClomun+j;
        data.columnNo = j;
        data.layerNo = this.listData.length+1;
        data.roadType = "1";
        data.roadStatus = 1;
        data.merged = false;
        AddMachineTypeRoadDto = [...AddMachineTypeRoadDto,data]
      }
      this.listData = [...this.listData,{AddMachineTypeRoadDto}];
    },
    keep(){
      if(this.listData.length){
        let ary = [];
        this.listData.forEach((v,i)=>{
          v.AddMachineTypeRoadDto.forEach((value,index)=>{
            ary = [...ary,value];
          })
        })
        let data = {
          channelId:this.query.channelId,
          list:ary,
          machineType:this.query.machineType,
          operatorName:null,
        }
        console.log(data)
        netWorkDevice("/machineTypeRoad/add", data).then(res => {
          this.$Message.success("操作成功");
          this.$emit('toBack')
        })
        // .catch(err => {
        //   this.$Message.error(err);
        // });
      }
    },
    cancelMerger(index1,index2,num){
      this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'roadStatus',num);
      this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'merged',false);
      if(this.listData[index1].AddMachineTypeRoadDto[index2-1].roadStatus!=3){
        this.$set(this.listData[index1].AddMachineTypeRoadDto[index2-1],'merged',false);
      }
      let len = this.listData[index1].AddMachineTypeRoadDto.length;
      for(let i = index2+1;i<=len;i++){
        if(this.listData[index1].AddMachineTypeRoadDto[i].roadStatus==3){
          this.$set(this.listData[index1].AddMachineTypeRoadDto[i],'merged',false);
          this.$set(this.listData[index1].AddMachineTypeRoadDto[i],'roadStatus',1);
        }else{
          break;
        }
      }
      // alert(index2)
    },
    merge(index1,index2,num){
      if(index2>0){
        this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'roadStatus',num);
        this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'merged',true);
        this.$set(this.listData[index1].AddMachineTypeRoadDto[index2-1],'merged',true);
      }else{
        this.$Message.error('不能合并');
      }
    },
    generate(){
      this.listData = [];
      for(let i=1;i<=this.layerNo;i++){
        let AddMachineTypeRoadDto = [];
        for(let j=1;j<=this.columnNo;j++){
          let data = {};
          data.id = null;
          data.roadNo = (i-1)*this.query.maxClomun+j;
          data.columnNo = j;
          data.layerNo = i;
          data.roadType = "1";
          data.roadStatus = 1;
          data.merged = false;
          AddMachineTypeRoadDto = [...AddMachineTypeRoadDto,data]
        }
        this.listData = [...this.listData,{AddMachineTypeRoadDto}];
      }
      this.$Message.success('操作成功');
    },
    toBack(){
      this.$emit('toBack')
    },
  }
}
</script>
<style lang="less" scoped>
  .typeTemplateDetails{
    .ivu-input-wrapper{
      width: 180px;
    }
  }
  .ivu-select{
    width: 180px;
    margin-right:5px;
	}
	.ivu-btn{
    margin-right: 10px;
	}
	.ivu-table-wrapper .ivu-btn{
		margin-right: 0px;
  }
  .ivu-table-wrapper button.marBtn{margin-right: 10px;}
  .ivu-table-wrapper{
    margin-top:20px;
  }
  .ivu-table-cell{
    padding-left: 0px;
    padding-right:0px;
  }
  .ivu-page{
    text-align: center;
    margin-top: 10px;
	}
	.ivu-table-cell img{
		width: 33px;
		height: 33px;
  }
  .ivu-form-item-content .ivu-input-wrapper{
    width: 330px
  }
  .box{
    margin-top:10px;
    overflow-x:scroll;
    min-height:700px;
    max-height:900px;
  }
  .row{
    overflow-x: inherit;
    white-space: nowrap;
    margin-top: 5px;
    min-width:170%;
    max-width: 300%;
    margin-left: 50px;
    min-height: 115px;
  }
  .rowBefore{
    width: 40px;
    min-height:40px;
    margin-top: 5px;
    float: left;
    overflow: hidden;
    margin-left: 10px;
    .ivu-btn{
      padding:5px 10px;
      margin-top: 20px;
    }
  }
  .item{
    width: 180px;
    margin-left: 10px;
    display: inline-block;
    vertical-align: top;
    margin-right: 10px;
    padding: 10px;
    p{
      margin-top: 4px;
      overflow: hidden;
    }
    /deep/.ivu-card-body{
      padding:0px;
    }
    /deep/.itemSelect {
      width:80px;
      margin-right: 0px;
      vertical-align: -5px
    }
    /deep/.ivu-select-single /deep/.ivu-select-selection {
        height: 20px;
      }
    /deep/.ivu-select-single /deep/.ivu-select-selection /deep/.ivu-select-selected-value{
      height: 20px;
      line-height: 20px;
    }
    /deep/.ivu-select-single /deep/.ivu-select-selection /deep/.ivu-select-placeholder{
      height: 20px;
      line-height: 20px;
    }
    /deep/.ivu-btn{
      margin-right: 5px;
      padding:0px 4px;
      font-size: 12px;
      margin-top: 5px
    }
  }
  .itemAction{
    background: rgba(0, 0, 0, .2);
  }
  .itemMerged{
    background: rgba(255, 127, 0, .2);
  }
  .keep{
    float: right;
    margin-right: 20%;
    min-width: 100px;
    /deep/.ivu-icon-md-albums{
      display: block;
      font-size: 24px
    }
  }
</style>
