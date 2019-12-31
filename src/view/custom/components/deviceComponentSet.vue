<template>
  <Card class='typeTemplateDetails'>
    <div class=headBox>
      <Button type="primary" size="large" class='keep' icon='md-albums' @click='keep'>保存</Button>
      <Button type="primary" size="large" @click='toBack' style="float:left;margin-right:30px;">返回</Button>
      <Input v-model="templateName"  placeholder="模板名称"  clearable class='marginRight'/>
      <Select v-show='showNewlyType=="xz"' @on-change='deviceChange' v-model="modal" class='marginRight' :clearable='true' placeholder="设备类型选择">
          <Option v-for="item in equipmentList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
    </div>
    <Divider />
    行：<InputNumber :max="maxLayerNo" :min="1" placeholder="行"  v-model="layerNo"  style="margin-right:10px"></InputNumber>
    列：<InputNumber :max="maxColumnNo" :min="1"   placeholder="列"  v-model="columnNo"  style="margin-right:40px"></InputNumber>
    <!-- <Input v-model="stock"  placeholder="最大库存" style="width:100px" clearable class='marginRight'/> -->
    <Button type="primary" size="large" @click='generate'  :disabled='showNewlyType=="bj"'>生成货道</Button>
    <Button type="error" size="large" @click='deleteRow' style="float:right;" :disabled='listData.length==0' >删除行</Button>
    <Button type="primary" size="large" @click='addRow'  style="margin-right:20px;float:right;" :disabled='listData.length>=layerNo'>添加行</Button>
    <Card class='box' :padding='6'>
      <template v-for='(v,i) in listData'>
      <div class='rowBefore'>
        <Button type="error" icon="md-remove" @click='deleteClomun(i)':disabled='listData[i].AddMachineTypeRoadDto.length==0' ></Button>
        <Button type="primary" icon="md-add" @click='addClomun(i)' :disabled='listData[i].AddMachineTypeRoadDto.length>=columnNo' ></Button>
      </div>
      <Card class='row' :padding='6' :bordered='false'  :key='v+i'>
        <Card class='item' :class='{"itemAction":value.roadStatus==2}'  v-for='(value,index) in v.AddMachineTypeRoadDto' :key='value+index' :id='"box"+i+""+index' :ref='"box"+i+""+index' v-show='value.roadStatus!=3'  style='width:160px;'>
          <div class='item_bigbox' @mouseenter='imgBoxOver(i,index,value.goodsShow,$event)' @mouseleave='imgBoxOut(i,index,value.goodsShow,$event)'>
            <p class='topBox'>
            {{value.layerNo}}-{{value.columnNo}}
            <img v-show='value.goodsShow' :src="require('../../../assets/images/huodao_close.png')" title='取消商品' @click='imgClick(i,index,value.roadStatus,value.goodsShow)'>
            <img :src="require('../../../assets/images/huodao_qiyong.png')" v-show='value.roadStatus==2' @click='value.roadStatus=1' title='启用'>
            <img :src="require('../../../assets/images/huodao_tingyong.png')" v-show='value.roadStatus==1' @click='value.roadStatus=2' title='停用'>
            <img :src="require('../../../assets/images/huodao_quxiaohebing.png')" v-show='value.merged&&value.roadStatus!=2' @click='cancelMerger(i,index,1)' title='取消合并'>
            <img :src="require('../../../assets/images/huodao_hebing.png')" v-show='value.roadStatus!=3&&index!=0&&value.roadStatus!=2' @click='merge(i,index,3)' title='合并'>
            </p>
            <div class='itemInfo' :ref='"item"+i+""+index' v-show='value.goodsShow'>
              <div>{{value.rowData.productName}}</div>
              <!-- <p style="margin-top:20px">最大库存(盒)：<Input v-model="value.stock" :disabled='value.roadStatus==2'/> -->
              <p style="margin-top:10px;margin-bottom:20px">商品售价(元)：<Input v-model="value.rowData.actualPrice" @on-change='priceChange($event,i,index)' :disabled='value.roadStatus==2'/>
              </p>
            </div>
          <div :ref='"img"+i+""+index' v-show='value.goodsShow' >
            <div class='boxShadow' >
              <img  :src="value.rowData.imageAddress" >
              <p >{{value.rowData.productName}}</p>
            </div>
          </div>
          <img v-show='!value.goodsShow' :src="require('../../../assets/images/add_img.png')" class='showGoodsImg' @click='imgClick(i,index,value.roadStatus,value.goodsShow)'>
          </div>
        </Card>
      </Card> 
      </template>
      <modal-table
        :showModal = 'showPriceTemplate'
        :modalColumns = 'priceTemplateColumns'
        :modalDatas = 'priceTemplateDatas'
        :modalTotal = 'priceTemplateTotal' 
        :modalPageSize = 'priceTemplatePageSize' 
        :modalPageNum = 'priceTemplatePageNum'
        @modalGetDatas = 'getTemplate'
        @modalPageChange = 'TemplatePageChange'
        @modalHide = 'TemplateHide'
        @modalGetRow = 'TemplateGetRow'
      >
      </modal-table>
    </Card>
  </Card>
</template>

<script>
import { netWorkDevice,netWorkGoods} from "@/api/data";
import  modalTable from "@/view/custom/components/modalTable";
export default {
  components:{
    modalTable
  },
  name:'typeTemplateDetails',
  // props:['equipmentList','query','priceTemplate','machineCode'],
  props:['equipmentList','query','showNewlyType','rowData'],
  data (){
    return {
      categoryId:null,
      templateName:this.rowData.templateName||null,
      stock:null,
      clickSecondNum:null,
      clickFirstNum:null,
      priceTemplateColumns:[
        {
          title: '商品名称',
          key: 'productName',
					align: 'center',
					minWidth:142,
          tooltip:true
        },
        {
          title: '商品进价',
          key: 'buyPrice',
					align: 'center',
					minWidth:142,
          tooltip:true
        },
        {
          title: '商品售价',
          key: 'actualPrice',
					align: 'center',
					minWidth:142,
          tooltip:true
        },
        {
          title: '图片',
          slot: 'img',
					align: 'center',
					minWidth:142,
          tooltip:true
				}
      ],
      showPriceTemplate:false,
      priceTemplateTotal:null,
      priceTemplatePageSize:10,
      priceTemplatePageNum:1,
      priceTemplateDatas:[],
      listData:this.query.list||[],
      columnNo:this.query.maxClomun,
      layerNo:this.query.maxLayer,
      maxColumnNo:this.query.maxClomun,
      maxLayerNo:this.query.maxLayer,
      modal:null,
      roadTypeList:[
        {value:'1',label:'履带'},
        {value:'2',label:'弹簧'}
      ],
      operator:this.$store.state.user.userId,
      operatorName:this.$store.state.user.userName,
      channelId:this.$store.state.user.channelId
    }
  },
  methods:{
    deviceChange(value){
      if(this.modal){
        this.listData = [];
        this.$Spin.show()
        let url = `/machineTypeRoad/queryByType?machineType=${this.modal}`;
        netWorkDevice(url,null,'get').then(res => {
          this.categoryId = res.result.categoryId;
          this.maxColumnNo = res.result.maxClomun;
          this.maxLayerNo = res.result.maxLayer;
          this.columnNo = res.result.maxClomun;
          this.layerNo = res.result.maxLayer;
          this.listData = res.result.list;
          this.listData.forEach((v,i)=>{
            v.AddMachineTypeRoadDto.forEach((val,index)=>{
              val.roadType =  val.roadType?val.roadType.toString():'1';
              val.rowData =  val.rowData?val.rowData:{};
              val.id = null;
              val.stock = this.stock;
              val.channelId = this.$store.state.user.channelId;
              setTimeout(()=>{  //延时让组件先渲染 否则为空
                if(index>0&&this.listData[i].AddMachineTypeRoadDto[index].merged){
                  this.setWidthAfter(i,index)
                }
              },1)
            })
          })
          this.$Spin.hide()
        }).catch(err => {
          this.$Spin.hide()
        });
        this.equipmentList.map(v=>{
          if(v.value==value){
            this.getTemplate(null,v.categoryId)
          }
        })
      }else{
        this.maxLayerNo = this.query.maxLayer;
        this.maxColumnNo = this.query.maxClomun;
        this.columnNo = this.query.maxClomun;
        this.layerNo = this.query.maxLayer;
        this.listData = [];
      }
    },
    imgBoxOver(i,index,is,event){
      if(is){
        this.$refs[("img"+i+""+index)][0].style.display = 'none'
        this.$refs[("item"+i+""+index)][0].style.bottom='0px';
      } 
    },
    imgBoxOut(i,index,is,event){
      if(is){
        this.$refs[("img"+i+""+index)][0].style.display = 'block'
        this.$refs[("item"+i+""+index)][0].style.bottom='-140px';
      }
    },
    addClomun(i){
      let previous = this.listData[i].AddMachineTypeRoadDto[this.listData[i].AddMachineTypeRoadDto.length-1]||{};
      console.log(previous)
      let data = {};
      data.id = null;
      data.roadNo = parseInt(previous.roadNo)+1||(i+1-1)*this.columnNo+1;
      data.roadNo = null;
      data.columnNo = previous.columnNo+1||1;
      data.layerNo = previous.layerNo||i+1;
      data.roadType = "1";
      data.roadStatus = 1;
      data.merged = false;
      data.rowData = {};
      data.goodsShow = false,
      data.channelId = this.$store.state.user.channelId;
      this.listData[i].AddMachineTypeRoadDto = [...this.listData[i].AddMachineTypeRoadDto,data]
      console.log(this.listData[i].AddMachineTypeRoadDto)
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
        data.roadNo = (this.listData.length+1-1)*this.columnNo+j;
        data.columnNo = j;
        data.layerNo = this.listData.length+1;
        data.roadType = "1";
        data.roadStatus = 1;
        data.merged = false;
        data.rowData = {};
        data.goodsShow = false,
        data.channelId = this.$store.state.user.channelId;
        AddMachineTypeRoadDto = [...AddMachineTypeRoadDto,data]
      }
      this.listData = [...this.listData,{AddMachineTypeRoadDto}];
    },
    imgReplace(index1,index2){
      this.showPriceTemplate = true;
      this.clickFirstNum = index1;
      this.clickSecondNum = index2;
    },
    imgClick(index1,index2,val,show){
      this.clickFirstNum = null;
      this.clickSecondNum = null;
      if(val!=2&&!show){
        this.showPriceTemplate = true;
        this.clickFirstNum = index1;
        this.clickSecondNum = index2;
      }else{
        this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'productCode',null);
        this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'goodsShow',false);
        this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'rowData',{});
      }
    },
    async keep(){
      let ary = [];
      console.log(this.listData)
      this.listData.forEach((v,i)=>{
        v.AddMachineTypeRoadDto.forEach((value,index)=>{
          const v = value;
          if(v.rowData.isChange){
            v.actualPrice = v.rowData.actualPrice;
          }
          v.machineCode = this.machineCode;
          ary = [...ary,v];
        })
      })
      if(this.showNewlyType=='xz'){
        if(this.listData.length&&this.templateName&&this.modal){
          this.$Spin.show()
          let data = {
            channelId:this.channelId,
            list:ary,
            machineType:this.modal,
            operator:this.operator,
            operatorName:this.operatorName,
            templateName:this.templateName
          }
          await netWorkDevice('/machineTemplate/addMachineTemplate', data).then(res => {
            this.$Message.success("操作成功");
            this.templateName = null;
            this.$emit('toBack')
            this.$Spin.hide()
          }).catch(()=>{
            this.$Spin.hide()
          })
        }else{
          this.$Message.error('请输入模板名称生成模板,且选择设备类型！')
        }
      }else{
        if(this.templateName){
          this.$Spin.show()
          let data = {
            channelId:this.channelId,
            id:this.rowData.id,
            list:ary,
            machineType:this.rowData.machineType,
            operator:this.operator,
            operatorName:this.operatorName,
            templateName:this.templateName
          }
          await netWorkDevice('/machineTemplate/modifyMachineTemplate', data).then(res => {
            this.$Message.success("操作成功");
            this.$emit('toBack')
          })
          this.$Spin.hide()
        }else{
          this.$Message.error('请输入模板名称！')
        }
      }
      
    },
    cancelMerger(index1,index2,num){
      this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'roadStatus',num);
      this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'merged',false);
      if(this.listData[index1].AddMachineTypeRoadDto[index2+1].roadStatus!=3){
        this.$set(this.listData[index1].AddMachineTypeRoadDto[index2+1],'merged',false);
      }
      let len = this.listData[index1].AddMachineTypeRoadDto.length;
      for(let i = index2+1;i<len;i++){
        if(this.listData[index1].AddMachineTypeRoadDto[i].roadStatus==3){
          this.$set(this.listData[index1].AddMachineTypeRoadDto[i],'merged',false);
          this.$set(this.listData[index1].AddMachineTypeRoadDto[i],'roadStatus',1);
          let w = parseInt(this.$refs[("box"+index1+""+index2)][0].$el.style.width) //点击合并盒子的宽度
          let width = parseInt(this.$refs[("box"+index1+""+(index2+1))][0].$el.style.width)
          // this.$refs[("box"+index1+""+(i-1))][0].$el.style.width = w-10-width+'px';
          this.$refs[("box"+index1+""+(i-1))][0].$el.style.width = '160px';
        }else{
          break;
        }
      }
    },
    merge(index1,index2,num){
      if(index2>0){
        if(this.listData[index1].AddMachineTypeRoadDto[index2].goodsShow||this.listData[index1].AddMachineTypeRoadDto[index2-1].goodsShow){
          this.$Message.error('已有货道商品，不能被合并');
          return false;
        }
        this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'roadStatus',num);
        this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'merged',true);
        this.$set(this.listData[index1].AddMachineTypeRoadDto[index2-1],'merged',true);
        this.setWidth(index1,index2);
      }else{
        this.$Message.error('不能合并');
      }
    },
    setWidth(index1,index2){
      let i  = this.isFalse(index1,index2-1);
      let w = parseInt(this.$refs[("box"+index1+""+index2)][0].$el.style.width) //点击合并盒子的宽度
      let width = parseInt(this.$refs[("box"+index1+""+i)][0].$el.style.width)
      this.$refs[("box"+index1+""+i)][0].$el.style.width = 10+w+width+'px';
    },
    isFalse(index1,index2){ //判断前面是否被合并
      if(this.listData[index1].AddMachineTypeRoadDto[index2].roadStatus==3){
        return this.isFalse(index1,index2-1);
      }else{
        return index2;
      }
    },
    setWidthAfter(index1,index2){ //加载数据时 判断
      let i  = this.isFalseAfter(index1,index2+1);
      let b = index2>0?(index2-1):index2
      // if(i===0||i){
        let w = parseInt(this.$refs[("box"+index1+""+index2)][0].$el.style.width) //点击合并盒子的宽度
        let width = parseInt(this.$refs[("box"+index1+""+b)][0].$el.style.width);
        if(index2!=0||i!=0){
          console.log(w,width)
          if((index2!=i)&&(index2!=0&&i!=0)){
            this.$refs[("box"+index1+""+i)][0].$el.style.width = width+'px';
          }else{
            this.$refs[("box"+index1+""+i)][0].$el.style.width = 10+w+width+'px';
          }
        }
      // }
    },
    isFalseAfter(index1,index2){ //判断后面是否被合并
      if(this.listData[index1].AddMachineTypeRoadDto[index2].roadStatus==3){
        return index2-1;
      }else{
        return this.query.setWidthAfterNum;
      }
    },
    generate(){
      // this.modal = null;
      this.listData = [];
      setTimeout(()=>{
        for(let i=1;i<=this.layerNo;i++){
          let AddMachineTypeRoadDto = [];
          for(let j=1;j<=this.columnNo;j++){
            let data = {};
            data.roadNo = (i-1)*this.columnNo+j;
            data.columnNo = j;
            data.layerNo = i;
            data.roadType = this.roadType;
            data.roadStatus = 1;
            data.merged = false;
            data.rowData = {};
            data.goodsShow = false;
            data.channelId = this.$store.state.user.channelId;
            AddMachineTypeRoadDto = [...AddMachineTypeRoadDto,data]
          }
          this.listData = [...this.listData,{AddMachineTypeRoadDto}];
        }
      },100)
    },
    toBack(){
      this.modal = null;
      this.$emit('toBack')
    },
    priceChange(event,index1,index2){
      console.log(event,index1,index2)
      let value = event.target.value;
      let old = this.listData[index1].AddMachineTypeRoadDto[index2].rowData.Comparative;
      if(value!=old){
        this.listData[index1].AddMachineTypeRoadDto[index2].rowData.isChange = true;
      }else{
        this.listData[index1].AddMachineTypeRoadDto[index2].rowData.isChange = false;
      }
    },
    //获取一行的信息
    TemplateGetRow(row){
      let data = {
        productName:row.productName,
        buyPrice:row.buyPrice,
        actualPrice:row.actualPrice,
        imageAddress:row.imageAddress,
        Comparative:row.actualPrice,
        isChange:false
      }
      this.$set(this.listData[this.clickFirstNum].AddMachineTypeRoadDto[this.clickSecondNum],'goodsShow',true);
      this.$set(this.listData[this.clickFirstNum].AddMachineTypeRoadDto[this.clickSecondNum],'rowData',data);
      this.$set(this.listData[this.clickFirstNum].AddMachineTypeRoadDto[this.clickSecondNum],'productCode',row.productCode);
      console.log(row)
    },
     //  查询所有渠道商商品信息 分页
    TemplatePageChange(value){
      this.priceTemplatePageNum = value;
      this.getTemplate();
    },
    TemplateHide(){  //隐藏点击商品的弹框
      this.showPriceTemplate =false;
    },
    //查询所有商品价格模版
    getTemplate(value,categoryId){
      let data = {
        // enable:'START',
        categoryId:this.query.categoryId||this.categoryId||categoryId,
        productName:value,
        status:true,
        channelId:this.channelId,
        pageNum:this.priceTemplatePageNum,
        pageSize:this.priceTemplatePageSize,
        templateId:this.priceTemplate?this.priceTemplate:null,
      }
      netWorkGoods('/productChannel/findProductOrTemplatePricePage',data).then(res=>{
        this.priceTemplatePageNum = res.result.pageNum;
        this.priceTemplateTotal = res.result.total;
        this.priceTemplateDatas = res.result.list;
      })
    },
  },
  mounted(){
    this.getTemplate();
  },
}
</script>
<style lang="less" scoped>
  .typeTemplateDetails{
    .ivu-input-wrapper{
      width: 140px;
    }
  }
  .ivu-select{
    width: 140px;
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
      padding:0px 4px;
      border-radius: 2px;
      margin-top:8px;
    }
  }
  .item{
    margin-left: 10px;
    display: inline-block;
    vertical-align: top;
    padding:3px 5px;
    position: relative;
    height:210px;
    overflow: hidden;
    .item_bigbox{
      height:210px;
      overflow: hidden;
    }
    p{
      width: 100%;
      margin-top: 4px;
      overflow: hidden;
      font-size: 12px;
      padding:2px 0px 2px 15px;
    }
    /deep/.ivu-card-body{
      padding:0px;
    }
    /deep/.itemSelect {
      widows: 40px!important;
      margin-right: 0px;
      vertical-align: -5px
    }
    /deep/.ivu-input-wrapper{
      width:40px!important;
      margin-right: 0px;
    }
    /deep/.ivu-input{
      height: 20px;
      line-height: 20px;
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
  .keep{
    float: right;
    margin-right: 15px;
  }
  .itemFloatBox{
    position: absolute;
    top:25px;
    right: 10px;
    width:60px;
    overflow: hidden;
    text-align: center;
    >img{
      width:20px;
      height: 20px;
      vertical-align: top;
      cursor: pointer;
      margin-top:0px;
    }
    >p{
      font-size: 12px;
      text-align: center;
      width: 100%
    }
  }
  .showGoodsImg{
    width:80px;
    height:90px;
    display:block;
    margin:30px auto 0px;
    &+p{
      width: 100%;
      text-align: center;
      padding:0px;
    }
  }
  .itemInfo{
    position: absolute;
    bottom:-140px;
    left: 0px;
    width: 100%;
    transition: all 0.3s linear;
    background: white;
    margin:0 auto;
    >div{
      background:rgba(45,140,240,1);
      font-size: 14px;
      margin-bottom:5px;
      height: 28px;
      line-height: 28px;
      color:white;
      text-align: center
    }
    >P{
      text-align: center;
      padding: 0px;
      
    }
  }
  .iconFloat{
    float: right;
  }
  .topBox{
    overflow: hidden;
    >img{
      width:20px;
      height:20px;
      vertical-align: middle;
      float: right;
      margin-left:6px;
      cursor: pointer;
    }
  }
  .boxShadow{
    width:120px;
    background:rgba(255,255,255,1);
    box-shadow: inset 0px 0px 10px 0px rgba(0,21,41,0.3);
    overflow: hidden;
    border-radius:1px;
    margin:0 auto;
    margin-top:10px;
    >img{
      width: 120px;
      height: 120px;
      margin:0 auto;
      display:block;
    }
    >p{
      background:rgba(45,140,240,1);
      border-radius:2px;
      font-size: 14px;
      margin-top: 0px;
      height: 28px;
      line-height: 28px;
      color:white;
      text-align: center;
      padding:0
    }
  }
</style>
