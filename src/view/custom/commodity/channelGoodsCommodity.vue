<template>
	<div class="channelGoodsCommodity">
      <div class="leftBox">
        <channel-tree @clickTreeRow='clickTreeRow' ref='channelTree'></channel-tree>
      </div>
      <div class='rightDiv'>
        <Input v-model="name"  placeholder="商品名称" clearable class='marginRight'/>
        <Select v-model="status"  class='marginRight' placeholder="状态" >
          <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <Button  @click='clickQuery' type="primary">查询</Button>
        <Button  @click='reset' type="primary">重置</Button>
        <Button v-if="channelId==$store.state.user.userVo.channelId && hasPerm('pro:name:edit') "  type="primary" @click='showNewlyAdded("xz")' class='xzbtn' icon="md-add">新增</Button>
        <Table border ref="selection" :columns="columns" :data="datas">
          <template slot-scope="{ row }"  slot="history">
              <a class='underline' @click.default ='showHistory(row.id)'>查看</a>
          </template>
					<template slot-scope="{ row, index }"  slot="edit">
              <Button v-if="channelId==$store.state.user.userVo.channelId&&hasPerm('pro:name:edit')&&(row.auditStatus==4&&row.status)" type="error" size="small"  class='marBtn' @click="enable(row.id,row.status,index)">下架</Button>
							<Button v-if="channelId==$store.state.user.userVo.channelId&&hasPerm('pro:name:edit')&&(row.auditStatus==4&&!row.status)" type="success" size="small"  class='marBtn' @click="enable(row.id,row.status,index)">上架</Button>
              <Button v-if="channelId==$store.state.user.userVo.channelId&&hasPerm('pro:name:edit')&&row.auditStatus!=2" type="primary" size="small"  class='marBtn' @click='showNewlyAdded("bj",index)'>编辑</Button>
              <Button v-if="channelId==$store.state.user.userVo.channelId&&hasPerm('pro:name:edit')&&row.auditStatus!=2" type="error" size="small" @click="deleteGoods(row,index)">删除</Button>
          </template>
					<template slot-scope="{ row}" slot="img">
            <viewer :images="[row.imageAddress]">
              <img :src="row.imageAddress" />
            </viewer>
          </template>
					<template slot-scope="{ row,index}" slot="status">
              <span v-show='row.auditStatus==4&&row.status' class='green'>上架</span>
              <span v-show='row.auditStatus==4&&!row.status' class='gray'>下架</span>
              <span v-show='row.auditStatus==2' class='orange'>待审核</span>
              <Poptip placement="right" width="350" trigger='hover'>
                <span v-show='row.auditStatus==3' class='red'>未通过</span>
                <div slot="content">
                  {{row.remark}}
                </div>
              </Poptip>
          </template>
        </Table>
        <Page :total="total" show-elevator :current='pageNum' @on-change='pageChange' :page-size='pageSize' @on-page-size-change='sizeChange'  show-sizer/>
      </div>
      <!-- 删除 -->
      <delete-component
        :modalDel = 'modalDel'
        :del_loading = 'modal_loading'
        @cancel = 'delCancel'
        @del = 'del'
      >
      </delete-component>
      <!-- 新增弹框的模态框 -->
      <Modal v-model="newlyAdded" width="640"  :mask-closable='false'>
        <div slot="header">
          <span @click='tabsClick' :class="{'action':custom}" style="margin-right:20px;cursor: pointer;" v-if="showNewlyType=='xz'">自定义商品</span >
          <span @click='tabsClick' style="cursor: pointer;" v-if="showNewlyType=='xz'" :class="{'action':!custom}">新增商品</span>
          <span v-if="showNewlyType=='bj'">编辑商品</span>
        </div>
          <Form  v-show='!custom' ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
            <FormItem label="销售范围" class='modelInput' prop="categoryId">
              <Select v-model="formValidate.categoryId" @on-change = 'categoryChange'>
                  <Option v-for="item in rangeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </FormItem>
            <Divider />
            <FormItem label="商品分类" prop="categorylId" class='modelInput'>
              <Select v-model="formValidate.categorylId">
                  <Option v-for="item in channelList" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </FormItem>
            <FormItem label="商品"  class='modelInput must'>
              <div v-if='formValidate.categoryId' class="getOnModal" @click='getOnModal'>{{formValidate.productName}}</div>
              <Input v-else placeholder="请选择商品" disabled/>
            </FormItem>
            <FormItem label="商品进价" class='modelInput must'>
              <Input type="number" v-model.trim="formValidate.buyPrice" placeholder="请输入商品进价"/>
            </FormItem>
            <FormItem label="参考售价" prop="salePrice" class='modelInput'>
              <Input type="number" v-model.trim="formValidate.salePrice" placeholder="参考售价" :disabled='true'/>
            </FormItem>
            <FormItem label="实际售价" prop="actualPrice" class='modelInput'>
              <Input v-model.number="formValidate.actualPrice" placeholder="请输入实际售价"/>
            </FormItem>
            <FormItem label="备注" prop="remark" class='modelInput'>
              <Input v-model.trim="formValidate.remark" placeholder="请输入备注"/>
            </FormItem>
          </Form>
          <!-- 自定义 -->
          <Form class='custom' v-show='custom' ref="customFormValidate" :model="customFormValidate" :rules="customRuleValidate" :label-width="120">
            <FormItem label="销售范围" class='modelInput' prop="categoryId">
              <Select v-model="customFormValidate.categoryId" @on-change = 'customCategoryChange'>
                  <Option v-for="item in rangeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </FormItem>
            <Divider />
            <div  class="rightImg">
              <FormItem label="上传图片" prop="imageAddress">
                <img
                  :src="customFormValidate.imageAddress"
                  class="uploadImg"
                  v-if="customFormValidate.imageAddress"
                />
                <template>
                  <Upload
                    :show-upload-list="false"
                    :action="Upload"
                    name="multipartFile"
                    :format="['jpg','jpeg','png']"
                    :on-format-error="formtError"
                    :on-error="onError"
                    :on-success="imgSuccess"
                    :max-size="128"
                    :on-exceeded-size = 'exceededSize'
                  >
                    <div style="width:116px;height:116px;line-height: 116px;border:1px dashed blue;text-align:center">
                        <Icon type="ios-camera" size="50" color='169BD5'></Icon>
                    </div>
                  </Upload>
                </template>
                <p style="margin-left:-70px;">图片格式为：jpg，jpeg，png</p>
                <p style="margin-left:-70px;">图片大小不超过128KB</p>
              </FormItem>
            </div>
            <div style="float:left">
              <img v-show='codeImg' class='codeImg' :src="require('../../../assets/images/codeImg.png')" >
              <FormItem label="商品分类" prop="channelCategorylId" class='modelInput'>
                <Select v-model="customFormValidate.channelCategorylId">
                    <Option v-for="item in channelList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
              </FormItem>
              <FormItem label="商品名称" prop="productName" class='modelInput'>
                <Input v-model.trim="customFormValidate.productName" placeholder="请输入商品名称" />
              </FormItem>
              <FormItem label="商品编码" class='modelInput' prop="productCode">
                <Input @on-focus='codeImg=true' @on-blur='codeImg=false' v-model.trim="customFormValidate.productCode" placeholder="请输入商品编码" />
              </FormItem>
              <FormItem label="商品单位" class='modelInput' >
                <Select v-model="customFormValidate.dictUnit">
                  <Option v-for="item in dictUnitList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
              </FormItem>
              <FormItem label="进价" prop="buyPrice" class='modelInput'>
                <Input type="number" v-model.trim="customFormValidate.buyPrice" placeholder="请输入进价" />
              </FormItem>
              <FormItem label="售价" prop="salePrice" class='modelInput'>
                <Input type="number" v-model.trim="customFormValidate.salePrice" placeholder="请输入售价"/>
              </FormItem>
              <FormItem prop="productDesc" v-show='customFormValidate.categoryId!=drugsID' label="商品描述" class='modelInput'>
                <Input v-model.trim="customFormValidate.productDesc" placeholder="请输入商品描述"/>
              </FormItem>
              <template v-if='customFormValidate.categoryId==drugsID'>
                <FormItem label="功能主治" prop="productFunction" class='modelInput'>
                  <Input v-model.trim="customFormValidate.productFunction" placeholder="请输入功能主治"/>
                </FormItem>
                <FormItem label="药品成分" prop="productIngredient" class='modelInput'>
                  <Input type="textarea" v-model.trim="customFormValidate.productIngredient" placeholder="请输入药品成分"/>
                </FormItem>
                <FormItem label="包装规格" prop="productSpecification" class='modelInput'>
                  <Input v-model.trim="customFormValidate.productSpecification" placeholder="请输入包装规格"/>
                </FormItem>
              </template>
            </div>
          </Form>
         <div slot="footer">
          <Button type="text" size="large" @click='newlyAdded=false'>取消</Button>
          <Button type="primary" size="large" :loading="sure_loading" @click="Added(custom?customFormValidate:formValidate,custom?'customFormValidate':'formValidate')">确定</Button>
         </div>
      </Modal>
      <goodsid-modal 
        :showGoodsIDmodal='showGoodsIDmodal'
        :GoodsIDdatas='GoodsIDdatas' 
        :GoodsIdTotal='GoodsIdTotal' 
        :GoodsIDPageSize='GoodsIDPageSize' 
        :GoodsIDPageNum='GoodsIDPageNum'
        @getGoodsIDPageDatas = 'getGoodsIDPageDatas'
        @GoodsIDPageChange = 'GoodsIDPageChange'
        @hideGoodsIdModal = 'hideGoodsIdModal'
        @getGoodsId = 'getGoodsId'
        >
      </goodsid-modal>
      <Modal v-model="historyModal" width="600" title="查看历史记录">
        <Table border ref="selection" :columns="columnsHistory" :data="datasHistory" height="500">
        </Table>
        <div slot="footer">
          <Button type="primary" size="large" @click="historyModal=false">确定</Button>
        </div>
      </Modal>
  </div>
</template>
<script>
import goodsidModal from '../components/goodsIDmodal';
import {netWorkGoods,netWorkHttp,Upload,netWorkDevice} from '@/api/data'
import { setTimeout } from 'timers';
import channelTree from '../components/channelTree';
import  deleteComponent from "@/view/custom/components/deleteComponent";
import configs from '@/config'
export default {
  components: {
    goodsidModal,
    channelTree,
    deleteComponent
  },
  name: 'channelGoodsCommodity',
  data () {
    return {
      codeImg:false,
      drugsID:configs.drugsID,
      rangeList:[],
      dictUnitList:[],
      sure_loading:false,
      statusList:[
        {value:'-1',label:'全部'},
        {value:'1',label:'上架'},
        {value:'0',label:'下架'},
      ],
      customRuleValidate: {
        productName: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          },
          { max: 10, message: "长度最多是10个字符", trigger: "blur" }
        ],
        productCode: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        channelCategorylId: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur",
            type:'number'
          }
        ],
        buyPrice: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        salePrice: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        productDesc: [
          { max: 20, message: "长度最多是20个字符", trigger: "blur" }
        ],
        imageAddress: [
          {
            required: true,
            message: "图片不能为空",
            trigger: "blur"
          }
        ],
        categoryId: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "change",
            type:'number'
          }
        ],
        productSpecification: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          },
          { max: 10, message: "长度最多是10个字符", trigger: "blur" }
        ],
        productIngredient: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          },
          { max: 50, message: "长度最多是50个字符", trigger: "blur" }
        ],
        productFunction: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          },
          { max: 20, message: "长度最多是20个字符", trigger: "blur" }
        ]
      },
      customFormValidate: {
        //新增字段
        productName:null, //商品名称
        channelCategorylId:null, //商品类型
        productCode: null, //商品编码
        buyPrice: null, //进价
        salePrice:null, //售价
        productDesc:null, //商品描述
        imageAddress: null,
        image: null,
        dictUnit:"1",
        categoryId:null,
        productSpecification:null,
        productIngredient:null,
        productFunction:null
      },
      custom:false,//自定义商品
      Upload,
      status:'-1',
      datasHistory:[],
      columnsHistory:[
        {
          title: '序号',
          type: 'index',
          align: 'center',
          width:80,
          tooltip:true
        },
        {
          title: '商品进价',
          key: 'buyPrice',
          align: 'center',
          tooltip:true
        },
        {
          title: '操作人姓名',
          key: 'operatorName',
          align: 'center',
          tooltip:true
        },
        {
          title: '修改时间',
          key: 'updateDate',
          align: 'center',
          tooltip:true
        },
      ],
      historyModal:false,
      //渠道
      channelList:[],
      // 商品
      GoodsIDdatas:[],
      GoodsIdTotal:null,
      GoodsIDPageSize:10,
      GoodsIDPageNum:1,
      showGoodsIDmodal:false,
      categoryIdValue:[],
      showNewlyType:'xz',
      formValidate:{ //新增字段
        buyPrice:null, //商品进价
        categorylId:null,//渠道分类id
        productId:null,//商品id
        salePrice: null,//商品售价
        actualPrice:null,//实际售价
        remark:null,//备注
        productName:null,
        categoryId:null,
      },
      ruleValidate: {
        categorylId: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur",
            type:'number'
          }
        ],
        actualPrice: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur",
            type:'number'
          },
          { max: 9999, message: "不能超过最大值9999", trigger: "blur",type: "number" }
        ],
        categoryId: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "change",
            type:'number'
          }
        ],
        remark: [
          { max: 20, message: "长度最多是20个字符", trigger: "blur" }
        ]
      },
      newlyAdded:false,//新增按钮的弹框
      modal_loading:false,//删除的loading
      delID:null,//删除的ID
      delIndex:null,//删除的索引
      categoryId:null,//下拉框查询id
      modalDel:false,
      name: '',
      pageNum:1,
      total:null,
      pageSize:15,
			datas: [],
      columns: [
        {
          title: '序号',
          type: 'index',
          width:80,
          align: 'center',
        },
        {
          title: '商品名称',
          key: 'productName',
          align: 'center',
          minWidth:100,
          tooltip:true
        },
        {
          title: '渠道分类名称',
          key: 'categoryName',
          align: 'center',
          minWidth:60,
          tooltip:true
        },
        {
          title: '操作人姓名',
          key: 'operatorName',
          align: 'center',
          tooltip:true
        },
        {
          title: '商品进价',
          key: 'buyPrice',
          align: 'center',
          tooltip:true
        },
        {
          title: '商品售价',
          key: 'salePrice',
          align: 'center',
          tooltip:true
        },
        {
          title: '实际售价',
          key: 'actualPrice',
          align: 'center',
          tooltip:true
        },
				{
          title: '商品图片',
          align: 'center',
          slot: 'img',
          tooltip:true
				},
				{
          title: '商品描述',
          key: 'productDesc',
          align: 'center',
          tooltip:true
        },
				{
          title: '状态',
          slot: 'status',
          align: 'center',
          tooltip:true
        },
        {
          title: '更新时间',
          key: 'updateDate',
          align: 'center',
          tooltip:true
        },
        {
          title: '进价记录',
          align: 'center',
          slot: 'history',
          tooltip:true
        },
        {
          title: '操作',
          align: 'center',
          slot: 'edit',
          width:160,
          tooltip:true
				},
      ],
      operator:this.$store.state.user.userId,
      operatorName:this.$store.state.user.userName,
      channelId:this.$store.state.user.channelId
    }
  },
  methods: {
    clickQuery(){
      this.pageNum = 1;
      this.getPageDatas();
    },
    customCategoryChange(value){
      this.getChannelList(value);
    },
    categoryChange(value){
      this.getGoodsIDPageDatas();
      this.getChannelList(value);
    },
    deleteGoods(row,index){
      const url = `/machineRoad/findIsHasProduct?channelId=${this.channelId}&&productCode=${row.productCode}`
      netWorkDevice(url,null,'get').then(res=>{
        if(res.result){
          this.modalDel=true;
          this.delID=row.id;
          this.delIndex=index
        }else{
          this.$Message.error("该商品在设备中有库存，不允许删除！");
        }
      })
      
    },
    reset(){
      this.pageNum = 1;
      this.total = null;
      this.pageSize = 15;
      this.name = null;
      this.channelId = this.$store.state.user.channelId;
      this.status = '-1';
      this.getPageDatas();
      this.$refs.channelTree.getTreeData();
    },
    delCancel(){
      this.modal_loading = false;
      this.modalDel = false;
    },
    tabsClick(event){
      if(!event.target.className){
        this.custom = !this.custom;
        // if(this.custom){ //自定义商品
        //   this.getRange();
        // }
      }
    },
    exceededSize(file, fileList){
      this.$Message.error("上传文件超过最大限制128KB！");
    },
     //文件上传
    formtError(file, fileList) {
      console.log(file);
      console.log(fileList);
      this.$Message.error("上传文件类型错误");
    },
    onError(error) {
      console.log(err);
      this.$Message.error("上传失败");
    },
    imgSuccess(response) {
      if (response.code === 200) {
        this.$set(this.customFormValidate, "imageAddress", response.result.url);
        this.customFormValidate.image = response.result.key;
        this.$Message.success("图片上传成功");
      } else if (response.code === 500) {
        this.$Message.error(response.message);
      }
      console.log(response);
    },
    clickTreeRow(value){
      if(value){
        this.pageNum = 1;
        this.channelId = value.id;
        this.getPageDatas();
      }
    },
    showHistory(productId){
      console.log(3333)
      let data = {
        productId
      }
      netWorkGoods('/productChannelHistory/findProductChannelHistory',data).then(res => {
        this.datasHistory = res.result;
        this.historyModal = true;
      })
    },
    getGoodsId(row){ //点击一行传过来的id
      console.log(row)
      this.formValidate.productId = row.id;
      this.formValidate.productName = row.productName
      this.formValidate.buyPrice = row.buyPrice
      this.formValidate.salePrice = row.salePrice
    },
    hideGoodsIdModal(){  //隐藏点击商品的弹框
      this.showGoodsIDmodal =false;
    },
    getOnModal(){
      this.showGoodsIDmodal=true
    },
    GoodsIDPageChange(value){
      this.GoodsIDPageNum = value;
      this.getGoodsIDPageDatas()
    },
    getGoodsIDPageDatas(value){
      let data = {
        categoryId:this.formValidate.categoryId,
        enable:'START',
        productName:value,
        pageNum:this.GoodsIDPageNum,
        pageSize:this.GoodsIDPageSize,
        auditStatus:4,
        channelId:this.channelId,
      }
      return netWorkGoods('/product/channelFindProductPage',data).then(res => {
        this.GoodsIDPageNum = res.result.pageNum;
        this.GoodsIdTotal = res.result.total;
        this.GoodsIDdatas = res.result.list;
        console.log(this.GoodsIDdatas)
      })
    },
    //点击新增商品 事件
    async showNewlyAdded(type,index){
      await this.initialization(['formValidate','customFormValidate']);
      this.getRange();
      this.sure_loading = false;
      this.showNewlyType = type;
      this.custom = false;
      //初始化数据
      this.formValidate = { //新增字段
        buyPrice:null, //商品进价
        categorylId:null,//渠道分类id
        productId:null,//商品id
        salePrice: null,//商品售价
        actualPrice:null,//实际售价
        remark:null,//备注
        productName:null,
        categoryId:null,
      }
      this.customFormValidate = {
        //新增字段
        productName:null, //商品名称
        channelCategorylId:null, //商品类型
        productCode: null, //商品编码
        buyPrice: null, //进价
        salePrice:null, //售价
        productDesc:null, //商品描述
        imageAddress: null,
        image: null,
        dictUnit:"1",
        categoryId:null,
        productSpecification:null,
        productIngredient:null,
        productFunction:null
      };
      this.categoryIdValue = [];
      if(type=='bj'){
        console.log(this.formValidate.categoryId)
        this.formValidate = JSON.parse(JSON.stringify(this.datas[index]));
        if(this.formValidate.status=='true'){
          this.formValidate.status = true;
        }else if(this.formValidate.status=='false'){
          this.formValidate.status = false;
        }
        if(!this.rangeList.length)this.getChannelList();
      }
      this.newlyAdded=true
    },
    Added(value,name){
          this.sure_loading = true;
          if(this.showNewlyType=='xz'){
            if(!this.custom){ //新增商品
              this.$refs[name].validate(valid => {
                if (valid) {
                  let  { buyPrice ,categorylId,productId,salePrice,remark,actualPrice,categoryId} =  value;
                  if(productId&&buyPrice){
                    let data = {
                      actualPrice,
                      buyPrice,
                      categorylId,
                      productId,
                      salePrice,
                      remark,
                      categoryId,
                      operator:this.operator,
                      operatorName:this.operatorName,
                      channelId:this.channelId,
                    }
                    netWorkGoods('/productChannel/productChannelSave',data).then(res => {
                      this.getPageDatas();//刷新页面
                      this.newlyAdded = false;
                      this.$Message.success('新增成功');
                      this.sure_loading = false;
                    }).catch(()=>{
                      this.sure_loading = false;
                    })
                  }else{
                    this.$Message.error('参数填写不完整');
                    this.sure_loading = false;
                  }
                }else{
                  this.sure_loading = false;
                }
              })
              
            }else{ //自定义商品
              this.$refs[name].validate(valid => {
                if (valid) {
                  let  { productName ,channelCategorylId,productCode,buyPrice,salePrice,productDesc,imageAddress,image,dictUnit,categoryId,productSpecification,productIngredient,productFunction} =  value;
                  let data = {
                    productName,
                    channelCategorylId,
                    productCode,
                    buyPrice,
                    salePrice,
                    productDesc,
                    imageAddress,
                    image,
                    enable:true,
                    dictUnit,
                    categoryId,
                    productSpecification,
                    productIngredient,
                    productFunction,
                    operator:this.operator,
                    operatorName:this.operatorName,
                    channelId:this.channelId,
                  }
                  netWorkGoods('/productChannel/customProductChannelSave',data).then(res => {
                    this.getPageDatas();//刷新页面
                    this.newlyAdded = false;
                    this.$Message.success('新增成功');
                    this.sure_loading = false;
                  }).catch(()=>{
                    this.sure_loading = false;
                  })
                }else{
                  this.sure_loading = false;
                }
              })
            }
          }else if(this.showNewlyType=='bj'){
            let  { buyPrice ,categorylId,productId,salePrice,remark,actualPrice,categoryId} =  value;
            this.$refs[name].validate(valid => {
              if (valid) {
                if(productId&&buyPrice){
                  let data = {
                    actualPrice,
                    buyPrice,
                    categorylId,
                    productId,
                    salePrice,
                    remark,
                    categoryId,
                    id:value.id,
                    operator:this.operator,
                    operatorName:this.operatorName,
                    channelId:this.channelId,
                  }
                  netWorkGoods('/productChannel/productChannelModified',data).then(res => {
                    this.categoryId = null; //清除掉 筛选id
                    this.getPageDatas();//刷新页面
                    this.newlyAdded = false;
                    this.$Message.success('编辑成功');
                    this.sure_loading = false;
                  }).catch(()=>{
                    this.sure_loading = false;
                  })
                }else{
                  this.$Message.error('参数填写不完整');
                  this.sure_loading = false;
                }
              }else{
                this.sure_loading = false;
              }
            })
          }
    },
    del(){
      this.modal_loading = true;
      let url = '/productChannel/productChannelDelete?id='+this.delID
      netWorkGoods(url).then(res => {
        this.modal_loading = false;
        this.modalDel = false;
        this.datas.splice(this.delIndex,1);
        this.delID = null;//删除的ID
        this.delIndex =null;//删除的索引
        this.$Message.success('删除成功');
      }).catch(err => {
        this.modal_loading = false;
        // this.$Message.error(err);
      });
    },
    enable(id,value,index){
      let data = {
        id,
        status:!value,
        operator:this.operator,
        operatorName:this.operatorName,
        channelId:this.channelId,
      }
      netWorkGoods('/productChannel/productChannelModified',data).then(res => {
        if(res.result){
          this.datas[index].status = !this.datas[index].status;
        }
      })
      // .catch(err => {
      //   this.$Message.error(err);
      // });
    },
    pageChange(value){
      this.pageNum = value;
      this.getPageDatas();
    },
    sizeChange(value){
      this.pageSize = value;
      this.getPageDatas();
    },
    getPageDatas(){
      let data = {
        enable: "START",
        channelId:this.channelId,
        productName:this.name,
        pageNum:this.pageNum,
        pageSize:this.pageSize,
        status:this.status=='0'?false:this.status=='1'?true:null
      }
      netWorkGoods('/productChannel/findProductChannelPage',data).then(res => {
        this.pageNum = res.result.pageNum;
        this.total = res.result.total;
        this.datas = res.result.list;
      })
    },
    // 查询所有渠道商商品类型
    getChannelList(categoryId){
      netWorkGoods('/categoryChannel/findAllCategoryChannel',{channelId:this.channelId,categoryId}).then(res => {
        this.channelList = res.result.map(v=>{
          return {value:v.id,label:v.categoryName}
        });
        console.log(this.channelList)
      })
    },
    getAllDictDataList(){
      let url = "//dictData/queryAllDictDataList?dictTypeId=1";
      netWorkHttp(url,null,'get').then(res => {
        res.result.map((v,i)=>{
          this.dictUnitList.push({label:v.dataName,value:v.dataValue})
        })
      })
    },
    getRange(){
      const url = `/channelBusiness/queryChannelBusinessByChannelId?channelId=${this.channelId}`
      return netWorkGoods(url,null,'get').then(res=>{
        this.rangeList = res.result.map(v=> {
          return {value:v.categoryId,label:v.categoryName}
        })
      })
    }
  },
  mounted () {
    // this.$Spin.show()
    let p1 = this.getPageDatas();
    // let p2 = this.getGoodsIDPageDatas();
    this.getAllDictDataList();
    // Promise.all('p1').then(()=>{
    //   this.$Spin.hide()
    // }).catch(()=>{
    //   this.$Spin.hide()
    // })
  }
} 
</script>

<style lang="less" scoped>
  .channelGoodsCommodity{
    .ivu-select{
      width:80px!important;
    }
    .ivu-btn{
      margin-right: 10px;
    }
    .ivu-table-wrapper .ivu-btn{
      margin-right: 0px;
      margin-left:  0px;
    }
    .ivu-table-wrapper button.marBtn{margin-right: 10px;}
    .ivu-table-wrapper{
      margin-top:20px;
    }
    /deep/ .ivu-table-cell{
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
  }
  .getOnModal{
    display: inline-block;
    width: 100%;
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
    cursor:pointer;
  }
  div.GoodsIdname{
    width: 180px;
    margin-right:5px;
  }
  div.goodsIDTable{
    margin-top: 10px;
  }
  .modalPage{
    text-align: center;
    margin-top: 10px;
  }
  .ivu-table-cell img {
    width: 33px;
    height: 33px;
  }
  .leftBox {
    // min-width: 250px;
    max-width: 320px;
    min-height: 900px;
    float: left;
  }
  .uploadImg {
    width: 116px;
    height: 116px;
    border-radius: 2px;
    margin-right: 10px;
    display: block;
    margin: 50px 0px 0px -60px;
  }
  .ivu-upload {
    margin-top:40px;
    margin-left: -60px;
  }
  .smallWidth{
    width: 300px;
  }
  .rightImg{
    height:350px;
    float: right;
  }
  .ivu-form{
    overflow: hidden;
  }
  .action{
    color: #fff;
    background-color: #2d8cf0;
    border-color: #2d8cf0;
    padding: 6px 15px 6px 15px;
    font-size: 14px;
    border-radius: 4px;
  }
  .custom{
    position: relative;
    .codeImg{
      position: absolute;
      right: 0px;
      top:150px;
      z-index: 9999;
      width: 240px;
    }
  }
</style>
