<template>
	<div  v-if="!isDetail">
      <div>
        <Input v-model="machineName" class='marginRight'  placeholder="设备名称" clearable/>
        <Select v-model="categoryId" placeholder="设备类型" class='marginRight' clearable>
            <Option v-for="item in rootCategory" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <Button @click="clickQuery"  type="primary">查询</Button>
        <Button @click='reset' type="primary">重置</Button>
				<Button v-if="hasPerm('pos:eqmAdmin:edit')"  type="primary"  @click='showNewlyAdded("xz")' class='xzbtn' icon="md-add">新增</Button>
        <Table border ref="selection" :columns="columns" :data="data" >
					<template slot-scope="{ row, index }" slot="edit">
              <Button v-if="hasPerm('pos:eqmAdmin:edit')"  type="success"  class='marBtn' size="small" @click='toLink(row)'>模板</Button>
              <Button v-if="hasPerm('pos:eqmAdmin:edit')"  type="primary" size="small" class='marBtn'  @click='showNewlyAdded("bj",index,row)'>编辑</Button>
              <Button v-if="hasPerm('pos:eqmAdmin:edit')"  type="error" size="small" @click="modalDel=true;delID=row.id;delIndex=index">删除</Button>
          </template>
          <template slot-scope="{ row, index }" slot="img">
            <viewer :images="[row.imageAddress]">
              <img :src="row.imageAddress" />
            </viewer>
          </template>
        </Table>
        <Page 
          :total="total" 
          show-elevator 
          :current="pageNum"  
          :page-size="pageSize"
          @on-change="pageChange"
          @on-page-size-change='sizeChange'
          show-sizer
        />
      </div>
      <!-- 新增弹框的模态框 -->
      <Modal
        v-model="newlyAdded"
        width="600"
        :title="showNewlyType=='xz'?'新增':'编辑'"
        :mask-closable="false"
      >
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
          <template v-if="showNewlyType=='xz'">
            <FormItem label="销售范围" prop="categoryId" >
              <Select v-model="formValidate.categoryId" placeholder="选择范围" class='marginRight'>
                  <Option v-for="item in rootCategory" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </FormItem>
            <Divider />
          </template>
          <FormItem label="设备类型" prop="machineName">
            <Input v-model.trim="formValidate.machineName" placeholder="" />
          </FormItem>
          <FormItem label="厂商" prop="manufactory">
            <Input v-model.trim="formValidate.manufactory" placeholder="" />
          </FormItem>
          
          <FormItem label="上传图片" prop="imageAddress">
            <img
              :src="formValidate.imageAddress"
              alt
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
              >
                <Button icon="ios-cloud-upload-outline">上传图片</Button>
              </Upload>
            </template>
          </FormItem>
          <!-- <FormItem label="有无货道" >
            <RadioGroup v-model="formValidate.roadExist">
              <Radio label="1">
                  <span>有</span>
              </Radio>
              <Radio label="0">
                  <span>无</span>
              </Radio>
            </RadioGroup>
          </FormItem> -->
          <FormItem label="人证识别" >
            <RadioGroup v-model="formValidate.isCardModule">
              <Radio label="1">
                  <span>支持</span>
              </Radio>
              <Radio label="0">
                  <span>不支持</span>
              </Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="恒温控湿" >
            <RadioGroup v-model="formValidate.temperatureHumidityStatus">
              <Radio label="1">
                  <span>支持</span>
              </Radio>
              <Radio label="0">
                  <span>不支持</span>
              </Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="取货方式" >
            <RadioGroup v-model="formValidate.shippingWay">
              <Radio label="1">
                  <span>直接取货</span>
              </Radio>
              <Radio label="0">
                  <span>二维码电子凭证取货</span>
              </Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="货道模板" v-if="showNewlyType=='xz'" >
            <RadioGroup v-model="formValidate.isAutomatic">
              <Radio label="1">
                  <span>自动生成</span>
              </Radio>
              <Radio label="0">
                  <span>自定义</span>
              </Radio>
            </RadioGroup>
          </FormItem>
          <template v-if='formValidate.isAutomatic==1&&showNewlyType=="xz"'>
            <FormItem label="货道最大列数" prop='maxClomun'>
              <Input v-model.trim="formValidate.maxClomun" placeholder=""/>
            </FormItem>
            <FormItem label="货道最大层数" prop='maxLayer'>
              <Input v-model.trim="formValidate.maxLayer" placeholder=""/>
            </FormItem>
          </template>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" @click="newlyAdded=false">取消</Button>
          <Button type="primary" size="large" @click="Added(formValidate,'formValidate')">确定</Button>
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
  <div v-else>
    <device-modal-component-custom
      v-if='isCustom'
      :query = 'query'
      ref='deviceCustom'
      :formValidate = 'formValidate'
      @toBack =  'toBack'
    >
    </device-modal-component-custom>
    <device-modal-component
      v-else
      ref='device'
      :query = 'query'
      @toBack =  'toBack'
    >
    </device-modal-component>
  </div>
</template>
<script>
import { netWorkDevice, Upload ,netWorkGoods} from "@/api/data";
import typeTemplateDetails from '@/view/custom/components/typeTemplateDetails';
import  deleteComponent from "@/view/custom/components/deleteComponent";
import  deviceModalComponent from "@/view/custom/components/deviceModalComponent";
import  deviceModalComponentCustom from "@/view/custom/components/deviceModalComponentCustom";
export default {
  components: {
    typeTemplateDetails,
    deleteComponent,
    deviceModalComponent,
    deviceModalComponentCustom
  },
  name: 'equipmentInformation',
  data () {
    return {
      isCustom:false,
      categoryId:null,
      rootCategory:[],
      query:[],
      isDetail:false,
      Upload, //上传文件地址
      newlyAdded: false, //新增按钮的弹框
      showNewlyType: "xz",
      delID: null, //删除的ID
      delIndex: null, //删除的索引
      modal_loading:false,
      modalDel:false,
      pageSize:10,
      pageNum:1,
      total:null,
      machineName:null, //机型名称
      formValidate: {
        //新增字段
        machineName:null, //机型名称
        manufactory:null, //厂商
        maxClomun:0, //货道最大列数
        maxLayer:0, //货道最大层数
        imageAddress: null,
        image: null,
        // roadExist:'1',
        isAutomatic:'1',
        categoryId:null,
        isCardModule:'1',
        temperatureHumidityStatus:'1',
        shippingWay:'1',
      },
      ruleValidate: {
        machineName: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          },
          { max: 10, message: "长度最多是10个字符", trigger: "blur" }
        ],
        manufactory: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          },
          { max: 10, message: "长度最多是10个字符", trigger: "blur" }
        ],
        imageAddress: [
          {
            required: true,
            message: "图片不能为空",
            trigger: "change"
          }
        ],
        categoryId:[
          {
            required: true,
            message: "输入不能为空",
            trigger: "change",
            type:'number'
          }
        ],
        maxClomun:[
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur",
          }
        ],
        maxLayer:[
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur",
          }
        ]
      },
			data: [],
      columns: [
        {
          title: '序号',
          type:'index',
          align: 'center',
          width:80,
          tooltip:true
        },
        {
          title: '设备类型',
          key: 'machineName',
          align: 'center',
          tooltip:true
        },
        {
          title: '厂商',
          key: 'manufactory',
          align: 'center',
          tooltip:true
				},
				{
          title: '货道最大列数',
          key: 'maxClomun',
          align: 'center',
          tooltip:true
				},
				{
          title: '货道最大层数',
          align: 'center',
          key: 'maxLayer',
          tooltip:true
				},
				{
          title: '操作人姓名',
          key: 'operatorName',
          align: 'center',
          tooltip:true
				},
        {
          title: '图片',
          slot: 'img',
          align: 'center',
          tooltip:true
        },
        {
          title: '操作',
          align: 'center',
          slot: 'edit',
          width:'180',
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
    reset(){
      this.machineName = null;
      this.pageNum = 1;
      this.total = null;
      this.pageSize = 15;
      this.categoryId = null;
      this.getPageDatas();
    },
    delCancel(){
      this.modal_loading = false;
      this.modalDel = false;
    },
    toBack(){
      this.isDetail = false;
      this.isCustom = false;
      this.query = [];
      this.getPageDatas()
    },
    toLink(row){
      // if(row.roadExist!=1){
      //   this.$Message.error('没有货道');
      //   return false
      // }
      // if(row.channelId&&row.maxClomun&&row.maxLayer&&row.machineName&&row.id){
        let url = `/machineTypeRoad/queryByType?machineType=${row.id}`;
        netWorkDevice(url,null,'get').then(res => {
          if(row.isAutomatic!=1){
            this.isCustom = true;
            this.formValidate = {};
          }
          this.query = res.result;
          if(this.query.list){
            this.query.list.forEach((v,i)=>{
              v.AddMachineTypeRoadDto.forEach((val,index)=>{
                val.roadType =  val.roadType?val.roadType.toString():'1';
                val.rowData =  val.rowData?val.rowData:{};
                setTimeout(()=>{  //延时让组件先渲染 否则为空
                  if(this.query.list[i].AddMachineTypeRoadDto[index].merged){
                    if(this.query.list[i].AddMachineTypeRoadDto[index].roadStatus==1){
                      this.query.setWidthAfterNum = index;
                    }
                    if(this.isCustom){
                      console.log(11111111)
                      this.$refs.deviceCustom.setWidthAfter(i,index)
                    }else{
                      this.$refs.device.setWidthAfter(i,index)
                    }
                  }
                },1)
              })
            })
          } else {
            this.query.list =[]
          }
          console.log(this.query)
          this.isDetail = true;
        })
      // }else{
      //   this.$Message.error('缺少参数');
      // }
    },
    async showNewlyAdded(type, index,row) {
      await this.initialization('formValidate');
      this.showNewlyType = type;
      //初始化数据
      this.formValidate = {
        machineName:null, //机型名称
        manufactory:null, //厂商
        maxClomun:0, //货道最大列数
        maxLayer:0, //货道最大层数
        imageAddress: null,
        image: null,
        // roadExist:'1',
        isAutomatic:'1',
        categoryId:null,
        isCardModule:'1',
        temperatureHumidityStatus:'1',
        shippingWay:'1'
      };
      if (type == "bj") {
        this.formValidate = JSON.parse(JSON.stringify(row));
        this.formValidate.isAutomatic = this.formValidate.roadExist+'';
        this.formValidate.isCardModule = this.formValidate.isCardModule+'';
        this.formValidate.temperatureHumidityStatus = this.formValidate.temperatureHumidityStatus+'';
        this.formValidate.shippingWay = this.formValidate.shippingWay+'';
        console.log(this.formValidate)
      }
      this.newlyAdded = true;
    },
    Added(value,name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          let {
            machineName,
            manufactory,
            maxClomun,
            maxLayer,
            imageAddress,
            image,
            // roadExist,
            isAutomatic,
            categoryId,
            isCardModule,
            temperatureHumidityStatus,
            shippingWay
          } = value;
          if (this.showNewlyType == "xz") {
            if(isAutomatic!=1){
              this.formValidate.channelId = this.channelId
              this.formValidate.operator = this.operator
              this.formValidate.operatorName = this.operatorName
              this.newlyAdded = false;
              setTimeout(()=>{
                this.isDetail = true;
                this.isCustom = true;
              },700)
            }else{
              let data = {
                machineName,
                manufactory,
                maxClomun,
                maxLayer,
                imageAddress,
                image,
                isAutomatic,
                isCardModule,
                temperatureHumidityStatus,
                shippingWay,
                // roadExist,
                categoryId,
                operator:this.operator,
                operatorName:this.operatorName,
                channelId:this.channelId,
              };
              netWorkDevice("/machineType/add", data).then(res => {
                this.getPageDatas(); //刷新页面
                this.newlyAdded = false;
                this.$Message.success("新增成功");
              })
            }
          } else if (this.showNewlyType == "bj") {
            let data = {
              machineName,
              manufactory,
              maxClomun,
              maxLayer,
              imageAddress,
              image,
              // roadExist,
              isAutomatic,
              isCardModule,
              temperatureHumidityStatus,
              shippingWay,
              id: value.id,
              categoryId,
              operator:this.operator,
              operatorName:this.operatorName,
              channelId:this.channelId,
            };
            netWorkDevice("/machineType/modify", data).then(res => {
              this.getPageDatas(); //刷新页面
              this.newlyAdded = false;
              this.$Message.success("编辑成功");
            })
          }
        } else {
          // this.$Message.error("信息填写不完整！");
        }
      })
      
    },
    //文件上传
    formtError(file, fileList) {
      this.$Message.error("上传文件类型错误");
    },
    onError(error) {
      this.$Message.error("上传失败");
    },
    imgSuccess(response) {
      if (response.code === 200) {
        this.$set(this.formValidate, "imageAddress", response.result.url);
        this.formValidate.image = response.result.key;
        this.$Message.success("图片上传成功");
      } else if (response.code === 500) {
        this.$Message.error(response.message);
      }
    },
    pageChange(value){
      this.pageNum = value;
      this.getPageDatas();
    },
    sizeChange(value){
      this.pageSize = value;
      this.getPageDatas();
    },
    del() {
      this.modal_loading = true;
      let url = "/machineType/delete?id=" + this.delID;
      netWorkDevice(url,null,'delete').then(res => {
        this.modal_loading = false;
        this.modalDel = false;
        this.data.splice(this.delIndex, 1);
        this.delID = null; //删除的ID
        this.delIndex = null; //删除的索引
        this.$Message.success("删除成功");
      }).catch(err => {
        this.modal_loading = false;
      });
    },
    getRootCategory(){
      netWorkGoods('/category/findChannelRootCategory',null,'get').then(res => {
        this.rootCategory = res.result;
        this.rootCategory.push({value:0,label: "混合"})
      })
    },
    getPageDatas() {
      let data = {
        channelId:this.channelId,
        machineName:this.machineName,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        categoryId:this.categoryId
      };
      netWorkDevice("/machineType/list", data).then(res => {
        this.pageNum = res.result.pageNum;
        this.total = res.result.total;
        this.data = res.result.list;
      })
    },
  },
  beforeRouteLeave (to, from, next) {
    this.isDetail = false;
    next();
  },
  mounted () {
    this.getPageDatas();
    this.getRootCategory()
  }
}
</script>

<style lang="less" scoped>
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
  .ivu-input-with-suffix {
    padding-right:0px;
  }
  .ivu-input-with-suffix{
    margin:0 3px;
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
</style>
