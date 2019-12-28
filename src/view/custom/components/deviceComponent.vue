<template>
  <Card class='typeTemplateDetails'>
    <div class=headBox>
      <Button type="primary" size="large" class='keep' icon='md-albums' @click='keep'>保存</Button>
      <Button size="large" class='keep' @click='keepModel '>保存为模板</Button>
      <Button type="primary"  size="large" @click='toBack' style="float:left;margin-right:30px;">返回</Button>
      <strong style="margin-right:30px;font-size:18px">{{query.machineCode}}</strong>
      <Select v-model="modal" :disabled='isKong>0&&query.isHasStock'  @on-change='deviceChange' class='marginRight' :clearable='true' placeholder="货道商品模板">
          <Option v-for="item in selectList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
    </div>
    <Divider />
    <!-- <Input v-model="stock"  placeholder="最大库存" style="width:100px" clearable class='marginRight'/> -->
    行：<InputNumber :max="maxLayerNo"  :min="1" placeholder="行"  v-model="layerNo"  style="margin-right:10px"></InputNumber>
    列：<InputNumber :max="maxColumnNo" :min="1"   placeholder="列"  v-model="columnNo"  style="margin-right:40px"></InputNumber>
    <Button type="primary" size="large" @click='generate' :disabled='isKong>0' >生成货道</Button>
    <Button type="primary" size="large" @click='reset'>复位货道</Button>
    <Button type="error" size="large" @click='deleteRow' style="float:right;" :disabled='listData.length==0' >删除行</Button>
    <Button type="primary" size="large" @click='addRow'  style="margin-right:20px;float:right;" :disabled='listData.length>=layerNo'>添加行</Button>
    <Card class='box' :padding='6'>
      <template  v-for='(v,i) in listData'>
      <div class='rowBefore'>
        <Button type="error" icon="md-remove" @click='deleteClomun(i)' :disabled='listData[i].AddMachineTypeRoadDto.length==0'></Button>
        <Button type="primary" icon="md-add" @click='addClomun(i)' :disabled='listData[i].AddMachineTypeRoadDto.length>=columnNo'></Button>
      </div>
      <Card class='row' :padding='6' :bordered='false'  :key='v+i'>
        <Card class='item' :class='{"itemAction":value.roadStatus==2}'  v-for='(value,index) in v.AddMachineTypeRoadDto' :key='value+index' :id='"box"+i+""+index' :ref='"box"+i+""+index' v-show='value.roadStatus!=3'  style='width:160px;'>
          <div class='item_bigbox' @mouseenter='imgBoxOver(i,index,value.goodsShow,$event)' @mouseleave='imgBoxOut(i,index,value.goodsShow,$event)'>
            <p class='topBox'>
            <strong>{{value.roadNo|prefixValue}}</strong>&nbsp({{value.layerNo}}-{{value.columnNo}})
            <img v-show='value.goodsShow' :src="require('../../../assets/images/huodao_close.png')" title='取消商品' @click='imgClick(i,index,value.roadStatus,value.goodsShow)'>
            <img :src="require('../../../assets/images/huodao_qiyong.png')" v-show='value.roadStatus==2' @click='value.roadStatus=1' title='启用'>
            <img :src="require('../../../assets/images/huodao_tingyong.png')" v-show='value.roadStatus==1' @click='value.roadStatus=2' title='停用'>
            <img :src="require('../../../assets/images/huodao_quxiaohebing.png')" v-show='value.merged&&value.roadStatus!=2' @click='cancelMerger(i,index,1)' title='取消合并'>
            <img :src="require('../../../assets/images/huodao_hebing.png')" v-show='value.roadStatus!=3&&index!=0&&value.roadStatus!=2' @click='merge(i,index,3)' title='合并'>
            </p>
            <div class='itemInfo' :ref='"item"+i+""+index' v-show='value.goodsShow'>
              <div>{{value.rowData.productName}}</div>
              <p style="margin-top:20px">库存数量：{{value.stock}}
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
    </Card>
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
    <Modal v-model="goodsDel" width="400" class='deleteComponent' :mask-closable='false' :closable='false' >
      <div slot="header">
        <p>提示信息</p>
        <Icon type="md-close" size='20' color='#515a6e' class='icon' @click='goodsDel=false'/>
      </div>
      <div class='center'>
        <img class='wain' :src="require('../../../assets/images/totast_img.png')">
        <div>
          <h6>当前商品库存：{{nowStock}}</h6>
          <p>继续删除将清除当前设备内商品库存值</p>
        </div>
      </div>
      <div slot="footer">
        <Button type="primary"  size="large" @click="CoveringGoods(clickFirstNum,clickSecondNum)">删除</Button>
        <Button size="large" @click='goodsDel=false'>取消</Button>
      </div>
    </Modal>
    <Modal v-model="keepValidate" title="保存模板" :mask-closable='false'>
      <Form ref="keepValidate" :model="keepData" :rules="keepRuleValidate" :label-width="120">
        <FormItem label="模板名称" prop="templateName">
          <Input v-model.trim="keepData.templateName" placeholder="请输入模板名称"/>
        </FormItem>
        <FormItem label="备注" prop="remark">
          <Input v-model.trim="keepData.remark" placeholder="请输入备注"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button size="large" @click='keepValidate=false'>取消</Button>
        <Button type="primary"  size="large" @click="keepModelSure(keepData,'keepValidate')">确定</Button>
      </div>
    </Modal>
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
  props:['selectList','query','priceTemplate','machineCode','channelId'],
  filters:{
    prefixValue(value){
      console.log(value)
      if(value<=9) return '0'+value
      return value
    }
  },
  data(){
    return{
      keepRuleValidate:{
        templateName: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          },
          { max: 8, message: "最多8个字符", trigger: "blur" }
        ],
        remark: [
          { max: 20, message: "最多20个字符", trigger: "blur" }
        ],
      },
      keepData:{
        templateName:null,
        remark:null
      },
      keepValidate:false,
      setWidthAfterNum:this.query.setWidthAfterNum,
      isReset:false,
      nowStock:0,
      goodsDel:false,
      isKong:this.query.list.length,
      priceSetObj:{},
      stock:null,
      clickSecondNum:0,
      clickFirstNum:0,
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
      listData:[],
      columnNo:this.query.maxClomun,
      layerNo:this.query.maxLayer,
      maxLayerNo:this.query.maxLayer,
      maxColumnNo:this.query.maxClomun,
      modal:null,
      roadTypeList:[
        {value:'1',label:'履带'},
        {value:'2',label:'弹簧'}
      ],
      operator:this.$store.state.user.userId,
      operatorName:this.$store.state.user.userName,
    }
  },
  methods:{
    reset(){
      if(!this.query.isHasStock){
        this.$Spin.show()
        const url = `/machineRoad/resetRoad?machineType=${this.query.machineType}`;
        netWorkDevice(url,null,'get').then(res => {
          this.listData = [];
          setTimeout(()=>{
            this.listData = res.result;
            this.listData.forEach((v,i)=>{
              v.AddMachineTypeRoadDto.forEach((val,index)=>{
                val.roadType =  val.roadType?val.roadType.toString():'1';
                val.rowData =  val.rowData?val.rowData:{};
                val.id = null;
                val.maxStock = this.stock;
                val.channelId = this.$store.state.user.channelId;
                setTimeout(()=>{  //延时让组件先渲染 否则为空
                  if(this.listData[i].AddMachineTypeRoadDto[index].merged){
                    if(this.listData[i].AddMachineTypeRoadDto[index].roadStatus==1){
                      this.setWidthAfterNum = index;
                      console.log(this.setWidthAfterNum)
                    }
                    this.setWidthAfter(i,index)
                  }
                },1)
              })
            })
          this.$Spin.hide();
          },1000)
          this.isReset = true;
        }).catch(err => {
          this.$Spin.hide()
        });
      }else{
        this.$Notice.warning({
          top: 50,
          duration: 3,
          desc:'当前货道已有货道，需要确认商品库存并下架商品，才可复位货道'
        });
      }
      // this.$parent.toLink();
      // this.listData = this.query.list.length?this.query.list:this.query.list1;
    },
    deviceChange(value){
      this.isReset = false;
      if(this.modal){
        this.listData = [];
        this.$Spin.show()
        let url = `/machineTemplateDetail/queryByTemplateId?templateId=${this.modal}`;
        netWorkDevice(url,null,'get').then(res => {
          this.maxColumnNo = res.result.maxClomun;
          this.maxLayerNo = res.result.maxLayer;
          this.listData = res.result.list;
          this.listData.forEach((v,i)=>{
            v.AddMachineTypeRoadDto.forEach((val,index)=>{
              val.roadType =  val.roadType?val.roadType.toString():'1';
              val.rowData =  val.rowData?val.rowData:{};
              val.id = null;
              val.maxStock = this.stock;
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
        const productCode = this.listData[i].AddMachineTypeRoadDto[index].productCode;
        const isExistence = Object.keys(this.priceSetObj).some((v)=> v==productCode);
        if(isExistence) this.$set(this.listData[i].AddMachineTypeRoadDto[index].rowData,'actualPrice',this.priceSetObj[productCode]);
        console.log(this.priceSetObj[productCode])
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
      let data = {};
      data.id = null;
      data.roadNo = parseInt(previous.roadNo)+1||(i+1-1)*this.columnNo+1;
      data.columnNo = previous.columnNo+1||1;
      data.layerNo = previous.layerNo||i+1;
      data.roadType = "1";
      data.roadStatus = 1;
      data.merged = false;
      data.rowData = {};
      data.goodsShow = false,
      data.channelId = this.$store.state.user.channelId;
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
        console.log(this.listData,this.listData.length)
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
      this.clickFirstNum = 0;
      this.clickSecondNum = 0;
      // if(val!=2){
      //   if(!show){ //加号
      //     this.showPriceTemplate = true;
      //     this.clickFirstNum = index1;
      //     this.clickSecondNum = index2;
      //   }else{
      //     this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'productCode',null);
      //     this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'goodsShow',false);
      //     console.log(this.listData[index1].AddMachineTypeRoadDto[index2].goodsShow)
      //     this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'rowData',{});
      //   }
      // }else{
      //   this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'productCode',null);
      //   this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'goodsShow',false);
      //   console.log(this.listData[index1].AddMachineTypeRoadDto[index2].goodsShow)
      //   this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'rowData',{});
      // }
      this.clickFirstNum = index1;
      this.clickSecondNum = index2;
      if(val!=2&&!show){
        this.showPriceTemplate = true;
        //添加商品
      }else{
        if(this.isKong&&this.listData[index1].AddMachineTypeRoadDto[index2].stock>0){
          this.nowStock = this.listData[index1].AddMachineTypeRoadDto[index2].stock
          this.goodsDel = true;
          // this.CoveringGoods(this.clickFirstNum,this.clickSecondNum)
        }else{
          this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'productCode',null);
          this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'actualPrice',null);
          this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'goodsShow',false);
          this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'rowData',{});
        }
        console.log(this.listData[index1].AddMachineTypeRoadDto[index2].stock)
      }
    },
    CoveringGoods(index1,index2){
      this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'oldProductCode',this.listData[index1].AddMachineTypeRoadDto[index2].productCode);
      this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'productCode',null);
      this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'actualPrice',null);
      this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'goodsShow',false);
      this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'oldBuyPrice',this.listData[index1].AddMachineTypeRoadDto[index2].rowData.buyPrice);
      this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'oldProductName',this.listData[index1].AddMachineTypeRoadDto[index2].rowData.productName);
      this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'rowData',{});
      this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'oldStock',this.listData[index1].AddMachineTypeRoadDto[index2].stock);
      this.$set(this.listData[index1].AddMachineTypeRoadDto[index2],'stock',0);
      this.goodsDel = false;
    },
    async keepModel(){
      await this.initialization('keepValidate');
      this.keepValidate=true;
    },
    keepModelSure(value,name){
      this.$refs[name].validate(valid => {
        if (valid) {
          this.$Spin.show()
          let ary = [];
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
          let data = {
            channelId:this.channelId,
            list:ary,
            machineType:this.query.machineType,
            operator:this.operator,
            operatorName:this.operatorName,
            templateName:value.templateName,
            remark:value.remark
          }
          netWorkDevice('/machineTemplate/addMachineTemplate', data).then(res => {
            this.$Message.success("保存成功");
            this.keepValidate=false;
            this.$Spin.hide()
          }).catch(()=>{
            this.$Spin.hide()
          })
        }
      })
    },
    async keep(){
      if(this.listData.length){
        this.$Spin.show()
        let ary = [];
        this.listData.forEach((v,i)=>{
          v.AddMachineTypeRoadDto.forEach((value,index)=>{
            const v = value;
            if(v.rowData.isChange){
              v.actualPrice = v.rowData.actualPrice;
            }
            v.machineCode = this.machineCode;
            const isExistence = Object.keys(this.priceSetObj).some((val)=> val==v.productCode);
            if(isExistence) v.actualPrice = this.priceSetObj[v.productCode];
            ary = [...ary,v];
          })
        })
        
        if(this.isReset){
          let data = {
            list:ary,
            channelId:this.channelId,
            machineCode:this.query.machineCode
          }
          console.log(data)
          console.log(this.listData)
          netWorkDevice('/machineRoad/resetAndSave', data).then(res => {
            this.$Message.success("操作成功");
            this.$emit('toBack')
            this.$Spin.hide()
          }).catch(()=>{
            this.$Spin.hide()
          })
        }else{
          let data = {
            list:ary,
            templateId:this.modal,
            channelId:this.channelId,
            machineCode:this.query.machineCode
          }
          let url;
          if(!this.isKong){
            url = "/machineRoad/add";
          }else{
            url = "/machineRoad/modify";
          }
          console.log(data)
          await netWorkDevice(url, data).then(res => {
            this.$Message.success("操作成功");
            this.$emit('toBack')
            this.$Spin.hide()
          }).catch(()=>{
            this.$Spin.hide()
          })
        }
      }
    },
    cancelMerger(index1,index2,num){
      console.log(index1,index2,num)
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
      let width = parseInt(this.$refs[("box"+index1+""+i)][0].$el.style.width);
      console.log(10+w+width)
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
        return this.setWidthAfterNum?this.setWidthAfterNum:this.query.setWidthAfterNum;
      }
    },
    generate(){
      this.isReset = false;
      this.modal = null;
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
          console.log(this.listData)
        }
      },100)
    },
    toBack(){
      this.modal = null;
      this.$emit('toBack')
    },
    priceChange(event,index1,index2){
      console.log(event,index1,index2);
      console.log(this.listData[index1].AddMachineTypeRoadDto[index2])
      let value = event.target.value;
      if(value<9999){
        let old = this.listData[index1].AddMachineTypeRoadDto[index2].rowData.Comparative;
        if(value!=old){
          this.listData[index1].AddMachineTypeRoadDto[index2].rowData.isChange = true;
        }else{
          this.listData[index1].AddMachineTypeRoadDto[index2].rowData.isChange = false;
        }
        const productCode = this.listData[index1].AddMachineTypeRoadDto[index2].productCode;
        this.priceSetObj[productCode] = value;
      }else{
        this.$Message.error('价格不能超过最大值9999');
        this.listData[index1].AddMachineTypeRoadDto[index2].rowData.actualPrice = 9999;
        const productCode = this.listData[index1].AddMachineTypeRoadDto[index2].productCode;
        this.priceSetObj[productCode] = 9999;
      }
      
      console.log(this.priceSetObj)
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
        // productCode:row.productCode,
      }
      this.$set(this.listData[this.clickFirstNum].AddMachineTypeRoadDto[this.clickSecondNum],'goodsShow',true);
      this.$set(this.listData[this.clickFirstNum].AddMachineTypeRoadDto[this.clickSecondNum],'rowData',data);
      this.$set(this.listData[this.clickFirstNum].AddMachineTypeRoadDto[this.clickSecondNum],'productCode',row.productCode);
      console.log(this.listData[this.clickFirstNum].AddMachineTypeRoadDto[this.clickSecondNum].rowData)
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
    getTemplate(value){
      let data = {
        // enable:'START',
        categoryId:this.query.categoryId,
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
  created(){
    this.listData = this.query.list.length?this.query.list:this.query.list1;
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
  .deleteComponent{
    /deep/.ivu-modal-content{
      overflow: hidden;
    }
    .icon{
      position: absolute;
      right:16px;
      top:18px;
      cursor: pointer;
    }
    /deep/.ivu-modal-header{
      padding:20px 16px;
      position: relative;
    }
    /deep/.ivu-modal-footer{
      border:none;
      text-align: center;
      margin-bottom: 20px;
      button{
        padding: 6px 20px 6px 20px;
      }
    }
    .center{
      overflow: hidden;
      .wain{
        margin-left: 20px;
        float: left;
        margin-right: 20px;
      }
      >div{
        overflow: hidden;
        >h6{
          margin-top: 5px;
        }
        >p{
          margin-top: 5px;
          color:#afb2b7
        }
      }
    }
  }
</style>
