<template>
  <div>
    <template v-if="hasPerm('pro:goods:edit')" >
      <!-- 按钮 -->
      <Button type="primary" icon="md-add" @click='showModal(true,"xz",false)'>新增子分类</Button>
      <Button style="margin-left: 10px" icon="md-add" @click='showModal(true,"xz",true);isTop=true'>添加顶部分类</Button>
      <!-- 下拉菜单 -->
      <Dropdown style="margin-left: 10px"  @on-click='typeCLick'>
        <Button>
          更多操作
          <Icon type="ios-arrow-down"></Icon>
        </Button>
        <DropdownMenu slot="list">
          <DropdownItem name ='editType'>编辑分类</DropdownItem>
          <DropdownItem name ='delType'>删除分类</DropdownItem>
          <DropdownItem name ='refreshType'>刷新</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <!-- 警告 -->
    </template>
      <Alert style="margin-top: 20px" show-icon>当前选择：{{treeRowData.title?treeRowData.title:''}}</Alert>
      <!-- 搜索 -->
      <Input
        suffix="ios-search"
        style="margin-bottom: 20px"
        v-model="nameType"
        @keyup.enter.native="selectType"
        @on-change='textChange'
        placeholder="请输入分类名称"
        clearable
      />
      <slot></slot>
      <Page :current="pageNumType" :total="totalType" :page-size="pageSizeType" simple @on-change="pageChange" />
      <!-- 新增弹框的模态框 -->
      <Modal v-model="newlyAdded" width="600" :title="showNewlyType=='xz'?'新增基础商品类型':'编辑基础商品类型'"  :mask-closable='false' :closable='false'>
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
          <FormItem label="分类名称" prop="categoryName">
            <Input v-model.trim="formValidate.categoryName" placeholder="请输入分类名称"/>
          </FormItem>
          <FormItem label="上级类型" v-if='!isTop'>
            <Cascader :data="selectData" v-model="formValidate.pid"  change-on-select :disabled='showNewlyType=="bj"' :clearable='false'></Cascader>
          </FormItem>
          <FormItem label="备注">
            <Input v-model.trim="formValidate.remark" placeholder="请输入备注"/>
          </FormItem>
          <div v-show='formValidate.pid.length==0||formValidate.parentId==-1' >
            <div class='cashback'>
              <span>返现积分</span>
              <div>
                <p>消费者比例</p>
                <InputNumber
                  :max="100"
                  :min="0"
                  v-model="formValidate.customerRebate"
                  :formatter="value => `${value}%`"
                  :parser="value => value.replace('%', '')"
                ></InputNumber>
              </div>
              <div>
                <p>推荐人比例</p>
                <InputNumber
                  :max="100"
                  :min="0"
                  v-model="formValidate.recommenderRebate"
                  :formatter="value => `${value}%`"
                  :parser="value => value.replace('%', '')"
                ></InputNumber>
              </div>
            </div>
            <FormItem label="限免活动" >
              <RadioGroup v-model="formValidate.isLimitedEdition">
                <Radio label="1">
                    <span>开启</span>
                </Radio>
                <Radio label="2">
                    <span>关闭</span>
                </Radio>
              </RadioGroup>
          </FormItem>
          </div>
        </Form>
         <div slot="footer">
          <Button type="text" size="large" @click='showModal(false)'>取消</Button>
          <Button type="primary" size="large" @click="Added(formValidate)">确定</Button>
         </div>
      </Modal>
      <!-- 删除 -->
      <delete-component
        :modalDel="modalDel"
        :del_loading="modal_loading"
        @cancel="delCancel"
        @del="del"
      ></delete-component>
  </div>
</template>

<script>
import  deleteComponent from "@/view/custom/components/deleteComponent";
import {netWorkGoods} from '@/api/data'
export default {
  name:'goodsTypes',
  components: {
    deleteComponent
  },
  props:{
    treeRowData:{
      default:()=>{
        return {};
      }
    },
    pageNumType:{
      default:1,
    },
    totalType:{
      default:1,
    },
    pageSizeType:{
      default:10,
    },
    showNewlyType:{
      default:'xz'
    },
    newlyAdded:{
      default:false
    },
    formValidate:{
      default:()=>{
        return {};
      }
    },
    selectData:{
      default:()=>{
        return [];
      }
    }
  },
  data(){
    return{
      isTop:false,
      nameType:null,
      modalDel:false,
      modal_loading:false,//删除的loading
      ruleValidate: {
        categoryName: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur",
          }
        ]
      },
    }
  },
  methods:{
    textChange(e){
      if(!e.target.value){
        this.$emit('selectType',null)
      }
    },
    delCancel(){
      this.modal_loading = false;
      this.modalDel = false;
    },
    showModal(status,type,isTop){
      if(type=='xz'){
        this.$emit('init')
      }
      this.$emit('showModal',{status,type,isTop})
    },
    del(){
      this.modal_loading = true;
      let url = '/category/categoryDelete?id='+this.treeRowData.id
      netWorkGoods(url).then(res => {
        this.modal_loading = false;
        this.modalDel = false;
        this.$emit('delType')
        this.$Message.success('删除成功');
      }).catch(err => {
        this.modal_loading = false;
        // this.$Message.error(err);
      });
    },
    typeCLick(name){
      switch(name){
        case 'editType':
          if(this.treeRowData.title){
            this.$emit('showModal',{status:true,type:'bj'})
          }else{
            this.$Message.error('请先选择节点！');
          };
          break;
        case 'delType':
          if(this.treeRowData.title){
            this.modalDel = true;
          }else{
            this.$Message.error('请先选择节点！');
          };
          break;
        case 'refreshType':
          this.$emit('delType')
          break;
      }
    },
    selectType(){
      this.$emit('selectType',this.nameType)
    },
    pageChange(value){
      this.$emit('pageTypeChange',value)
    },
    Added(value){
      this.$emit('goodsTypesAdded',value)
    }
  },
}
</script>

<style lang="less" scoped>
  .cashback{
    overflow: hidden;
    >span{
      width: 120px;
      text-align: right;
      vertical-align: middle;
      font-size: 12px;
      color: #515a6e;
      line-height: 1;
      padding: 10px 12px 10px 0;
      box-sizing: border-box;
      display: inline-block;
      vertical-align: top;
    }
    >div{
      display: inline-block;
      margin-top: 7px;
      width: 100px;
      margin-right: 20px;
      overflow: hidden;
      .ivu-input-number{
        width: 100%;
        margin-top: 5px;
      }
    }
  }
</style>