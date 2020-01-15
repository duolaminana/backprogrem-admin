<template>
  <div class="goodsCommodity">
    <div class="leftBox">
        <goods-types
          :treeRowData = 'treeRowData'
          :pageNumType = 'pageNumType'
          :totalType = 'totalType'
          :pageSizeType = 'pageSizeType'
          :showNewlyType = 'goodsTypesShowNewlyType'
          :newlyAdded = 'goodsTypesNewlyAdded'
          :formValidate = 'goodsTypesFormValidate'
          :selectData = 'selectData'
          @pageTypeChange  = 'pageTypeChange'
          @showModal = 'showModal'
          @goodsTypesAdded = 'goodsTypesAdded'
          @delType = 'delType'
          @selectType = 'selectType'
          @init = 'init'
        >
          <template v-slot>
            <Coustom-tree 
              :treeData='treeData'
              @pickTree = 'pickTree'
            >
            </Coustom-tree>
          </template>
        </goods-types>
    </div>
    <div class='rightDiv'>
      <Input v-model="numID" placeholder="商品编号" clearable class='marginRight' />
      <Input v-model="name" placeholder="商品名称" clearable  class='marginRight'/>
      <Select v-model="auditStatus"  class='marginRight' placeholder="状态">
          <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
      <Button @click="clickQuery" type="primary">查询</Button>
      <Button @click='reset' type="primary">重置</Button>
      <Button v-if="hasPerm('pro:goods:edit')"  type="primary" @click='showNewlyAdded("xz")' class='xzbtn' icon="md-add">新增</Button>
      <Table border ref="selection" :columns="columns" :data="datas">
        <template slot-scope="{ row, index }" slot="edit">
          <Button type="success" v-if="row.auditStatus==1&&hasPerm('pro:goods:edit')" size="small" class="marBtn" @click='submit(row)'>提交</Button>
          <Button type="success" v-if="row.auditStatus==2&&hasPerm('pro:goods:edit')" size="small" class="marBtn" @click='verify(row)'>审核</Button>
          <Button v-if="hasPerm('pro:goods:edit')"  type="primary" size="small" class="marBtn" @click='showNewlyAdded("bj",index)'>编辑</Button>
          <Button v-if="hasPerm('pro:goods:edit')"  type="error" size="small" @click="modalDel=true;delID=row.id;delIndex=index">删除</Button>
        </template>
        <template slot-scope="{ row}" slot="img">
          <viewer :images="[row.imageAddress]">
            <img :src="row.imageAddress" />
          </viewer>
        </template>
        <template slot-scope="{ row}" slot="status">
          <span v-if="row.auditStatus==1" class='blue'>待提交</span>
          <span v-if="row.auditStatus==2" class='orange'>待审核</span>
          <Poptip placement="right" width="350" trigger='hover' >
            <span v-if="row.auditStatus==3" class='red'>审核不通过</span>
            <div slot="content">
              {{row.remark}}
            </div>
          </Poptip>
          <span v-if="row.auditStatus==4" class='green'>审核通过</span>
        </template>
      </Table>
      <Page
        :total="total"
        show-elevator
        :current="pageNum"
        @on-change="pageChange"
        :page-size="pageSize"
        @on-page-size-change='sizeChange'
        show-sizer
      />
    </div>
    <delete-component
        :modalDel = 'modalDel'
        :del_loading = 'modal_loading'
        @cancel = 'delCancel'
        @del = 'del'
      >
    </delete-component>
    <!-- 新增弹框的模态框 -->
    <Modal
      v-model="newlyAdded"
      width="640"
      :title="showNewlyType=='xz'?'新增基础商品':'编辑基础商品'"
      :mask-closable="false"
    >
      <Form class='custom' ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
        <FormItem label="商品类型" prop="categoryId" class='modelInput'>
          <Cascader
            :data="selectData"
            v-model="formValidate.categoryId"
            @on-change="selectChange"
          ></Cascader>
        </FormItem>
        <Divider />
        <div  class="rightImg">
          <FormItem label="上传图片" prop="imageAddress">
            <img
              :src="formValidate.imageAddress"
              class="uploadImg"
              v-if="formValidate.imageAddress"
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
          <FormItem label="商品名称" prop="productName" class='modelInput'>
            <Input v-model.trim="formValidate.productName" placeholder="请输入商品名称" />
          </FormItem>
          <FormItem label="商品编码" prop="productCode" class='modelInput'>
            <Input v-model.trim="formValidate.productCode" placeholder="请输入商品编码" />
          </FormItem>
          <FormItem label="进价" prop="buyPrice" class='modelInput'>
            <Input type='number' v-model.number="formValidate.buyPrice" placeholder="请输入进价" />
          </FormItem>
          <FormItem label="商品单位" prop="dictUnit" class='modelInput' >
              <Select v-model="formValidate.dictUnit">
                <Option v-for="item in dictUnitList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <FormItem label="进价上浮百分比" prop="buyPriceUpper" class='modelInput'>
            <InputNumber
              :max="100"
              :min="1"
              v-model="formValidate.buyPriceUpper"
              :formatter="value => `${value}%`"
              :parser="value => value.replace('%', '')"
              @on-blur="PercentageChange"
            ></InputNumber>
          </FormItem>
          <FormItem label="售价" prop="salePrice" class='modelInput'>
            <Input type='number' v-model.trim.number="formValidate.salePrice" placeholder="请输入售价"/>
          </FormItem>
          <FormItem v-if='formValidate.categoryId[0]!=drugsID' prop="productDesc" label="商品描述" class='modelInput'>
            <Input v-model.trim="formValidate.productDesc" placeholder="请输入商品描述"/>
          </FormItem>
          <template v-if='formValidate.categoryId[0]==drugsID'>
            <FormItem label="功能主治" prop="productFunction" class='modelInput'>
              <Input v-model.trim="formValidate.productFunction" placeholder="请输入功能主治"/>
            </FormItem>
            <FormItem label="药品成分" prop="productIngredient" class='modelInput'>
              <Input type="textarea" v-model.trim="formValidate.productIngredient" placeholder="请输入药品成分"/>
            </FormItem>
            <FormItem label="包装规格" prop="productSpecification" class='modelInput'>
              <Input v-model.trim="formValidate.productSpecification" placeholder="请输入包装规格"/>
            </FormItem>
          </template>
        </div>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="newlyAdded=false">取消</Button>
        <Button type="primary" size="large" @click="Added(formValidate,4,'formValidate')" :loading="sure_loading">确定</Button>
        <!-- <Button type="primary" size="large" @click="Added(formValidate,1)" :loading="sure_loading">确定</Button>
        <Button type="success" size="large" @click="Added(formValidate,2)" :loading="sure_loading" v-show='showNewlyType=="xz"'>确定并提交</Button> -->
      </div>
    </Modal>
    <!-- 审核 -->
    <Modal
      v-model="examine"
      width="640"
      title="审核"
      :mask-closable="false"
    >
      <Form class='custom' ref="examine" :model="formValidate" :rules="examineRuleValidate" :label-width="120">
        <FormItem label="商品类型" class='modelInput'>
          <Cascader
            disabled
            :data="selectData"
            v-model="formValidate.categoryId"
            @on-change="selectChange"
          ></Cascader>
        </FormItem>
        <Divider />
        <div  class="rightImg">
          <FormItem label="上传图片">
            <img
              :src="formValidate.imageAddress"
              class="uploadImg"
              v-if="formValidate.imageAddress"
            />
          </FormItem>
        </div>
        <div style="float:left"> 
          <FormItem label="商品名称" class='modelInput'>
            <Input disabled v-model.trim="formValidate.productName" placeholder="请输入商品名称" />
          </FormItem>
          <FormItem label="商品编码" class='modelInput'>
            <Input disabled v-model.trim="formValidate.productCode" placeholder="请输入商品编码" />
          </FormItem>
          <FormItem label="进价" class='modelInput'>
            <Input disabled type='number' v-model.trim="formValidate.buyPrice" placeholder="请输入进价" />
          </FormItem>
          <FormItem label="商品单位" class='modelInput'>
              <Select disabled v-model="formValidate.dictUnit">
                <Option v-for="item in dictUnitList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <FormItem label="售价" prop="salePrice" class='modelInput'>
            <Input disabled type='number' v-model.trim="formValidate.salePrice" placeholder="请输入售价"/>
          </FormItem>
          <FormItem v-if='formValidate.categoryId[0]!=drugsID' label="商品描述" class='modelInput'>
            <Input disabled v-model.trim="formValidate.productDesc" placeholder="请输入商品描述"/>
          </FormItem>
          <template v-else>
            <FormItem label="功能主治" prop="productFunction" class='modelInput'>
              <Input disabled v-model.trim="formValidate.productFunction" placeholder="请输入功能主治"/>
            </FormItem>
            <FormItem label="药品成分" prop="productIngredient" class='modelInput'>
              <Input disabled type="textarea" v-model.trim="formValidate.productIngredient" placeholder="请输入药品成分"/>
            </FormItem>
            <FormItem label="包装规格" prop="productSpecification" class='modelInput'>
              <Input disabled v-model.trim="formValidate.productSpecification" placeholder="请输入包装规格"/>
            </FormItem>
          </template>
        </div>
        <Divider />
        <FormItem label="进价上浮百分比" prop="buyPriceUpper" class='modelInput'>
          <InputNumber
            :max="100"
            :min="1"
            v-model="formValidate.buyPriceUpper"
            :formatter="value => `${value}%`"
            :parser="value => value.replace('%', '')"
            @on-blur="PercentageChange"
          ></InputNumber>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="examine=false">取消</Button>
        <Button type="error" size="large" @click="examineSubmit(formValidate,3,'examine')">审核不通过</Button>
        <Button type="success" size="large" @click="examineSubmit(formValidate,4,'examine')">审核通过</Button>
      </div>
    </Modal>
    <Modal
      class='positionSet'
      v-model="notPassNewlyAdded"
      width="600"
      title="审核不通过"
      :mask-closable="false"
    >
      <Input :maxlength='100' v-model='formValidate.remark'  style='width:100%' type="textarea" :rows="4" placeholder="审核不通过的原因...." />
      <div slot="footer">
        <Button type="text" size="large" @click="notPassNewlyAdded=false">取消</Button>
        <Button type="primary" size="large" @click="notPass(formValidate)" >确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import { netWorkGoods, Upload,netWorkHttp } from "@/api/data";
import { setTimeout } from "timers";
import CoustomTree from '../components/coustom-tree';
import goodsTypes from  '../components/goodsTypes';
import  deleteComponent from "@/view/custom/components/deleteComponent";
import configs from '@/config'
export default {
  components: {
    CoustomTree,
    goodsTypes,
    deleteComponent
  },
  computed:{
    ispurview(){
      return
    }
  },
  name: "goodsCommodity",
  data() {
    return {
      notPassNewlyAdded:false,
      drugsID:configs.drugsID,
      dictUnitList:[],
      sure_loading:false,
      statusList:[
        {value:'0',label:'全部'},
        {value:'1',label:'待提交'},
        {value:'2',label:'待审核'},
        {value:'3',label:'不通过'},
        {value:'4',label:'已通过'},
      ],
      examine:false,
      categoryType:null,
      auditStatus:'0',
      treePids:null,
      selectData:[],
      goodsTypesFormValidate:{
        categoryName: null, //分类名称
        pid:[],//父id
        remark: null,//备注
        customerRebate:0,
        recommenderRebate:0,
        isLimitedEdition:'1'
      },
      goodsTypesNewlyAdded:false,
      goodsTypesShowNewlyType:'xz',
      treeRowData:{},
      totalType: null,
      pageSizeType: 10,
      pageNumType:1,
      nameType:null,
      treeData:[],
      // tupians:[],
      Upload, //上传文件地址
      showNewlyType: "xz",
      formValidate: {
        //新增字段
        productName: "", //商品名称
        categoryId: [], //商品类型
        productCode: "", //商品编码
        buyPrice: "", //进价
        buyPriceUpper: 0, //进价上浮百分比
        salePrice: "", //售价
        productDesc: "", //商品描述
        imageAddress: null,
        image: null,
        dictUnit:"1",
        productSpecification:null,
        productIngredient:null,
        productFunction:null,
        remark:null,
      },
      ruleValidate: {
        categoryId: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "change",
            type:'array'
          }
        ],
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
        buyPrice: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur",
            type: "number"
          }
        ],
        dictUnit: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        buyPriceUpper: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur",
            type: "number"
          }
        ],
        salePrice: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur",
            type: "number",
          },
          { max: 9999, message: "不能超过最大值9999", trigger: "blur",type: "number" }
        ],
        imageAddress: [
          {
            required: true,
            message: "图片不能为空",
            trigger: "blur"
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
        ],
        productDesc: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          },
          { max: 20, message: "长度最多是20个字符", trigger: "blur" }
        ],
      },
      examineRuleValidate:{
        buyPriceUpper: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur",
            type: "number"
          }
        ],
      },
      newlyAdded: false, //新增按钮的弹框
      modal_loading: false, //删除的loading
      delID: null, //删除的ID
      delIndex: null, //删除的索引
      modalDel: false,
      numID: "",
      name: "",
      selectValue: [],
      pageNum: 1,
      total: null,
      pageSize: 15,
      datas: [],
      columns: [
        {
          title: '序号',
          type: 'index',
          width:50,
          align: 'center',
        },
        {
          title: "商品编号",
          key: "productCode",
          align: "center",
          tooltip: true
        },
        {
          title: "商品名称",
          key: "productName",
          align: "center",
          minWidth:60,
          tooltip: true
        },
        {
          title: "商品类型",
          key: "categoryName",
          align: "center",
          tooltip: true
        },
        {
          title: "进价",
          key: "buyPrice",
          align: "center",
          tooltip: true
        },
        {
          title: "售价",
          key: "salePrice",
          align: "center",
          tooltip: true
        },
        {
          title: "商品图片",
          align: "center",
          slot: "img",
          tooltip: true
        },
        {
          title: "商品描述",
          key: "productDesc",
          align: "center",
          tooltip: true
        },
        {
          title: "状态",
          slot: "status",
          align: "center",
          maxWidth: 90,
          tooltip: true
        },
        {
          title: "更新时间",
          key: "updateDate",
          align: "center",
          tooltip: true
        },
        {
          title: "操作",
          align: "center",
          slot: "edit",
          width:200,
          tooltip: true
        }
      ],
      operator:this.$store.state.user.userId,
      operatorName:this.$store.state.user.userName,
      channelId:this.$store.state.user.channelId
    };
  },
  methods: {
    clickQuery(){
      this.pageNum = 1;
      this.getPageDatas();
    },
    reset(){
      this.pageNum = 1;
      this.total = null;
      this.pageSize = 15;
      this.numID = null;
      this.name = null;
      this.channelId = this.$store.state.user.channelId;
      this.categoryId = null;
      this.treePids = null;
      this.categoryType = null;
      this.treeRowData = {};
      this.goodsTypesFormValidate.pid = []
      this.getPageDatas();
      this.getTreeData();
    },
    delCancel(){
      this.modal_loading = false;
      this.modalDel = false;
    },
    verify(row){
      this.formValidate = JSON.parse(JSON.stringify(row));
      let ary = [];
      if (row.categoryIds) {
        ary = row.categoryIds.split(",");
        ary = ary.map(item => {
          return parseInt(item);
        });
      }
      this.formValidate.categoryId = [
        ...ary,
        row.categoryId
      ];
      this.examine = true;
    },
    examineSubmit(examineData,value,name){
      if(value==3){
        
        this.examine = false;
        this.notPassNewlyAdded = true;
      }else{
        this.$refs[name].validate(valid => {
          let data = {
            auditor:this.operator,
            auditorName:this.operatorName,
            operator:this.operator,
            operatorName:this.operatorName,
            channelId:this.channelId,
            id:examineData.id,
            auditStatus:value,
            buyPriceUpper:examineData.buyPriceUpper,
          }
          if(valid){
            netWorkGoods("/product/productModified",data).then(res => {
              if (res.result) {
                this.getPageDatas(); //刷新页面
                this.examine = false;
                this.$Message.success("操作成功");
              }
            })
          }
        })
      }
    },
    notPass({id,remark}){
      let data = {
          id,
          remark,
          auditStatus:3,
          auditor:this.operator,
          auditorName:this.operatorName,
          operator:this.operator,
          operatorName:this.operatorName,
          channelId:this.channelId,
        }
        netWorkGoods("/product/productModified",data).then(res => {
          if (res.result) {
            this.getPageDatas(); //刷新页面
            this.notPassNewlyAdded = false;
            this.$Message.success("操作成功");
          }
        })
    },
    submit(row){
      let data = {
        auditStatus:2,
        id: row.id,
        operator:this.operator,
        operatorName:this.operatorName,
        channelId:this.channelId,
      };
      netWorkGoods("/product/productModified",data).then(res => {
        if (res.result) {
          this.categoryId = null; //清除掉 筛选id
          this.getPageDatas(); //刷新页面
          this.$Message.success("操作成功");
        }
      })
    },
    //左侧
    init(){
      this.goodsTypesFormValidate.categoryName = null;
    },
    selectType(value){
      this.nameType = value;
      this.getTreeData();
    },
    delType(){
      this.getPageDatas();
      this.getTreeData();
      this.getSelectData();
    },
    goodsTypesAdded(value){
      if(value.categoryName){
          let  { categoryName,pid,remark,customerRebate,recommenderRebate,isLimitedEdition} =  value;
          if(this.goodsTypesShowNewlyType=='xz'){
            let data = {
              categoryName,
              customerRebate,
              recommenderRebate,
              pid:pid[pid.length-1],
              remark,
              isLimitedEdition,
              operator:this.operator,
              operatorName:this.operatorName,
              channelId:this.channelId,
            }
            netWorkGoods('/category/categorySave',data).then(res => {
              this.getTreeData();//刷新页面
              this.getSelectData(); //刷新筛选条件
              this.goodsTypesNewlyAdded = false;
              this.$Message.success('新增成功');
            })
          }else if(this.goodsTypesShowNewlyType=='bj'){
            let data = {
              categoryName,
              // pid:pid[pid.length-1],
              customerRebate,
              recommenderRebate,
              remark,
              isLimitedEdition,
              id:value.id,
              operator:this.operator,
              operatorName:this.operatorName,
              channelId:this.channelId,
            }
            netWorkGoods('/category/categoryModified',data).then(res => {
              this.getTreeData();//刷新页面
              this.getSelectData(); //刷新筛选条件
              this.goodsTypesNewlyAdded = false;
              this.$Message.success('编辑成功');
            })
          }
        }else{
          this.$Message.error('信息填写不完整！');
        }
    },
    showModal(data){
      let {status,type,isTop} = data; //isTop 直接添加顶部
      if(!status) return this.goodsTypesNewlyAdded = status; //取消
      if(type) this.goodsTypesShowNewlyType = type;
      if(type=='xz'){
        if(isTop){
          this.treeRowData = {};
          this.goodsTypesNewlyAdded = status;
          if(this.treeRowData.pids){
            let ary = [];
            ary = this.treeRowData.pids.split(",");
            ary = ary.map(item => {
              return parseInt(item);
            });
            this.treeRowData.pid = [
              ...ary,
              this.treeRowData.id
            ];
          }else{
            this.treeRowData.pid = [
              ...[],this.treeRowData.id
            ];
          }
          this.$set(this.goodsTypesFormValidate,'pid',this.treeRowData.pid[0]?this.treeRowData.pid:[])
        }else{
          if(this.treeRowData.id){
            this.goodsTypesNewlyAdded = status;
            if(this.treeRowData.pids){
              let ary = [];
              ary = this.treeRowData.pids.split(",");
              ary = ary.map(item => {
                return parseInt(item);
              });
              this.treeRowData.pid = [
                ...ary,
                this.treeRowData.id
              ];
            }else{
              this.treeRowData.pid = [
                ...[],this.treeRowData.id
              ];
            }
            console.log(this.treeRowData.pid)
            this.$set(this.goodsTypesFormValidate,'pid',this.treeRowData.pid[0]?this.treeRowData.pid:[])
          }else{
            this.$Message.error('请先点击选择分类节点！')
            this.goodsTypesFormValidate = {
              categoryName: null,
              pid:[],
              remark: null,
              customerRebate:0,
              recommenderRebate:0,
              isLimitedEdition:'1'
            }
          }
        }
      }else if(type=='bj'){
        this.goodsTypesNewlyAdded = status;
        if(this.treeRowData.pids){
          let ary = [];
          ary = this.treeRowData.pids.split(",");
          ary = ary.map(item => {
            return parseInt(item);
          });
          this.treeRowData.pid = [
            ...ary,
            this.treeRowData.id
          ];
        }else{
          console.log(this.treeRowData.id)
          this.treeRowData.pid = [
            ...[],this.treeRowData.id
          ];
        }
        this.goodsTypesFormValidate = JSON.parse(JSON.stringify(this.treeRowData)) ;
        this.goodsTypesFormValidate.isLimitedEdition = this.goodsTypesFormValidate.isLimitedEdition+''
        console.log(this.goodsTypesFormValidate)
      }
    },
    pickTree(data){
      if(data){
        this.treeRowData = data;
        this.categoryId = data.id;
        this.pageNum = 1;
        this.treePids = data.pids;
        this.categoryType = data.categoryType;
        this.getPageDatas();
        console.log(this.treeRowData)
      }else{
        this.categoryId = null;
        this.pageNum = 1;
        this.treePids = null;
        this.categoryType = null;
        this.treeRowData = {};
        this.goodsTypesFormValidate.pid = []
      }
      console.log(data)
    },
    pageTypeChange(value){
      this.pageNumType = value;
      this.getTreeData();
    },
    //获取树的数据
    getTreeData(){
      let data = {
        categoryName:this.nameType,
        pageNum:this.pageNumType,
        pageSize:this.pageSizeType
      }
      netWorkGoods('/category/findCategoryPage',data).then(res => {
        this.pageNumType = Math.ceil(res.result.pageNum/res.result.pageSize);
        this.totalType = res.result.size;
        this.treeData = res.result.list;
      })
    },
    //文件上传
    exceededSize(file, fileList){
      this.$Message.error("上传文件超过最大限制128KB！");
    },
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
        this.$set(this.formValidate, "imageAddress", response.result.url);
        console.log(this.formValidate.imageAddress);
        this.formValidate.image = response.result.key;
        this.$Message.success("图片上传成功");
      } else if (response.code === 500) {
        this.$Message.error(response.message);
      }
      console.log(response);
    },
    PercentageChange(event) {
      console.log(this.formValidate.buyPriceUpper)
      if(this.formValidate.buyPriceUpper>100){
        this.formValidate.buyPriceUpper = 100;
      }else if(this.formValidate.buyPriceUpper<1){
        this.formValidate.buyPriceUpper = 1;
      }
    },
    async showNewlyAdded(type, index) {
      await this.initialization(['formValidate','examine']);
      this.showNewlyType = type;
      this.uploadImgUrl = null;
      this.sure_loading = false;
      //初始化数据
      this.formValidate = {
        //新增字段
        productName: "", //商品名称
        categoryId: [], //商品类型
        productCode: "", //商品编码
        buyPrice: "", //进价
        buyPriceUpper:0, //进价上浮百分比
        salePrice: "", //售价
        productDesc: "", //商品描述
        dictUnit:"1",
        productSpecification:null,
        productIngredient:null,
        productFunction:null
      };
      if (type == "bj") {
        this.formValidate = JSON.parse(JSON.stringify(this.datas[index]));
        let ary = [];
        if (this.datas[index].categoryIds) {
          ary = this.datas[index].categoryIds.split(",");
          ary = ary.map(item => {
            return parseInt(item);
          });
        }
        this.formValidate.categoryId = [
          ...ary,
          this.datas[index].categoryId
        ];
      }
      this.newlyAdded = true;
    },
    Added(value,auditStatus,name) {
      this.sure_loading = true;
      this.$refs[name].validate(valid => {
        console.log(valid)
        if (valid) {
          let {
            enable,
            buyPrice,
            buyPriceUpper,
            categoryId,
            productCode,
            productDesc,
            productName,
            salePrice,
            imageAddress,
            image,
            dictUnit,
            productSpecification,
            productIngredient,
            productFunction
          } = value;
          console.log(11111)
          if (this.showNewlyType == "xz") { 
            console.log(buyPrice)
            let data = {
              buyPrice,
              buyPriceUpper,
              categoryId: categoryId[categoryId.length - 1],
              productCode,
              productDesc,
              productName,
              salePrice,
              imageAddress,
              image,
              auditStatus,
              dictUnit,
              productSpecification,
              productIngredient,
              productFunction,
              operator:this.operator,
              operatorName:this.operatorName,
              channelId:this.channelId,
            };
            console.log(data)
            netWorkGoods('/product/productSave',data).then(res => {
              if (res.result) {
                this.categoryId = null; //清除掉 筛选id
                this.treePids = null;
                this.categoryType = null;
                this.getPageDatas(); //刷新页面
                this.newlyAdded = false;
                this.$Message.success("新增成功");
                this.sure_loading = false;
              }
            }).catch(()=>{
              this.sure_loading = false;
            })
          } else if (this.showNewlyType == "bj") {
            let data = {
              enable,
              buyPrice,
              buyPriceUpper,
              categoryId: categoryId[categoryId.length - 1],
              productCode,
              productDesc,
              productName,
              salePrice,
              imageAddress,
              image,
              dictUnit,
              productSpecification,
              productIngredient,
              productFunction,
              id: value.id,
              operator:this.operator,
              operatorName:this.operatorName,
              channelId:this.channelId,
              auditStatus,
            };
            netWorkGoods("/product/productModified",data).then(res => {
              if (res.result) {
                // this.categoryId = null; //清除掉 筛选id
                this.treePids = null;
                this.categoryType = null;
                this.getPageDatas(); //刷新页面
                this.newlyAdded = false;
                this.$Message.success("编辑成功");
                this.sure_loading = false;
              }
            }).catch(()=>{
              this.sure_loading = false;
            })
          }
        } else {
          this.sure_loading = false;
        }
      })
    },
    selectChange(value) {
      this.categoryId = value[value.length - 1];
    },
    del() {
      this.modal_loading = true;
      let url = "/product/productDelete?id=" + this.delID;
      netWorkGoods(url).then(res => {
        this.modal_loading = false;
        this.modalDel = false;
        this.datas.splice(this.delIndex, 1);
        this.delID = null; //删除的ID
        this.delIndex = null; //删除的索引
        this.$Message.success("删除成功");
      }).catch(err => {
        this.modal_loading = false;
      });
    },
    pageChange(value) {
      this.pageNum = value;
      this.getPageDatas();
    },
    sizeChange(value){
      this.pageSize = value;
      this.getPageDatas();
    },
    getAllDictDataList(){
      let url = "//dictData/queryAllDictDataList?dictTypeId=1";
      netWorkHttp(url,null,'get').then(res => {
        res.result.map((v,i)=>{
          this.dictUnitList.push({label:v.dataName,value:v.dataValue})
        })
      })
    },
    getPageDatas() {
      let data = {
        categoryType:this.categoryType,
        auditStatus:this.auditStatus,
        enable: "START",
        productCode: this.numID,
        productName: this.name,
        categoryId: this.categoryId,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        pids:this.treePids,
      };
      netWorkGoods("/product/findProductPage", data).then(res => {
        this.pageNum = res.result.pageNum;
        this.total = res.result.total;
        this.datas = res.result.list;
      })
    },
    getSelectData(){
      netWorkGoods('/category/findCategoryTree').then(res => {
        this.selectData = res.result;
      })
    },
  },
  mounted() {
    this.getPageDatas();
    this.getTreeData();
    this.getSelectData();
    this.getAllDictDataList()
  },
};
</script>

<style lang="less" scoped>
.ivu-input-wrapper,
.ivu-cascader {
  display: inline-block;
  width: 100%
}
.goodsCommodity {
  .ivu-btn {
    margin-right: 10px;
  }
  .rightDiv{
    .ivu-select{
      width: 80px!important;
    }
  }
  .ivu-table-wrapper .ivu-btn {
    margin-right: 0px;
  }
  .ivu-table-wrapper button.marBtn {
    margin-right: 10px;
  }
  .ivu-table-wrapper {
    margin-top: 20px;
  }
  /deep/ .ivu-table-cell {
    padding-left: 0px;
    padding-right: 0px;
  }
  .ivu-page {
    text-align: center;
    margin-top: 10px;
  }
  .ivu-table-cell img {
    width: 33px;
    height: 50px;
    vertical-align: middle;
    margin:5px 0px;
  }
}
.uploadImg {
  width: 50px;
  height: 50px;
  border-radius: 2px;
  margin-right: 10px;
  vertical-align: bottom;
}
.ivu-upload {
  display: inline-block;
  vertical-align: middle;
}
.leftBox {
  // min-width: 250px;
  min-height: 900px;
  float: left;
  margin-right: 20px;
}
.elastic{
  margin-left:15px;
  color:red;
  font-size: 14px;
  cursor: pointer;
  vertical-align: -2px;
}
.rightImg{
  height:350px;
  float: right;
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
.custom{
  overflow: hidden;
}
</style>