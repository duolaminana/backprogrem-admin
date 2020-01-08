<template>
    <div class='deviceInfo' v-if="!isDetail">
      <div class="leftBox">
        <channel-tree @clickTreeRow='clickTreeRow'  ref='channelTree'></channel-tree>
      </div>
      <div class='rightDiv'>
          <Select v-model="machineType" placeholder="设备类型" clearable>
              <Option v-for="item in equipmentList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
          <Select v-model="machineStatus" placeholder="设备状态" clearable>
              <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
          <Input v-model="name"  placeholder="设备编码" clearable class='marginRight'/>
          <Button @click='clickQuery' type="primary">查询</Button>
          <Button @click='reset' type="primary">重置</Button>
          <Button v-if="hasPerm('pos:devAdmin:edit')"  type="primary" @click='showNewlyAdded("xz")' class='xzbtn' icon="md-add">新增</Button>
          <Button  type="primary" @click='transferNewlyAdded = true' :disabled='!tableRowData'>设备转移</Button>
          <Button  type="success" @click='exportTemplate'>导出模板</Button>
          <Button v-if="hasPerm('pos:devAdmin:edit')"  type="success" @click='importTemplate'>导入</Button>
          <Table border ref="selection" :highlight-row='true' :columns="columns" :data="datas" @on-row-click='tableClick'>
            <template slot-scope="{ row, index }" slot="edit">
              <Button v-if="row.status==0&&hasPerm('pos:devAdmin:edit')"  type="success" size="small"  @click='showNewlyAdded("sh",index,row)'  class='marBtn' >审核</Button>
              <Button v-if="hasPerm('pos:devAdmin:edit')"  type="primary" size="small" @click='showNewlyAdded("bj",index,row)' class='marBtn' >编辑</Button>
              <Button v-if="hasPerm('pos:devAdmin:edit')"   type="error" size="small" class='marBtn' @click="devDelete(row,index)" >删除</Button>
            </template>
            <template slot-scope="{ row, index }" slot="info">
              <a class='lookDetails' @click='showNewlyAdded("ck",index,row)'>查看详情</a>
            </template>
            <template slot-scope="{ row, index }" slot="position">
              <a class='lookDetails' :disabled="row.status!=3||channelId!=$store.state.user.userVo.channelId" v-if='row.positionId'@click='positionInfo(row,index,false)'>{{row.positionName}}</a>
              <a :disabled='channelId!=$store.state.user.userVo.channelId' v-else-if='!row.positionId&&(row.status==1||row.status==7)' @click='positionInfo(row,index,true)' class='green' >去设定</a>
              <a v-else class='gray'>去设定</a>
            </template>
            <template slot-scope="{ row, index }" slot="network">
              <span v-if='row.networkStatus==1' class='green'>在线</span>
              <span v-else class='gray'>离线</span>
            </template>
            <template slot-scope="{ row, index }" slot="status">
              <span v-show='row.status==0' class='gray'>待审核</span>
              <span v-show='row.status==1' class='orange'>待使用</span>
              <span v-show='row.status==2' class='red'>审核不通过</span>
              <span v-show='row.status==3' class='green'>点位中</span>
              <span v-show='row.status==4' class='gray'>故障中</span>
              <span v-show='row.status==5' class='gray'>维修中</span>
              <span v-show='row.status==6' class='gray'>报废</span>
              <span v-show='row.status==7' class='gray'>待激活</span>
            </template>
            <template slot-scope="{ row, index }" slot="time">
              <span v-show='row.activateDate'>{{row.activateDate}}</span>
              <span v-show='!row.activateDate' class='gray'>未激活</span>
            </template>
            <template slot-scope="{ row, index }" slot="expireEdit">
              <Button v-if="(row.status==3||row.status==1)&&hasPerm('pos:devAdmin:edit')" type="primary" size="small" @click='renewal(row,index)'>续租</Button>
            </template>
            <!-- <template slot-scope="{ row, index }" slot="cargoWay">
              <a class='lookDetails' @click='toLink(row)'>查看详情</a>
            </template> -->
            <template slot-scope="{ row, index }" slot="cargoModal">
              <a class='lookDetails' :disabled="!row.machineType" @click='cargoModalToLink(row)'>查看详情</a>
            </template>
            <template slot-scope="{ row, index }" slot="kaimen">
              <a class='lookDetails' @click='openTheDoor(row)'>查看详情</a>
            </template>
            <template slot-scope="{ row, index }" slot="surplusDays">
              <span v-if='row.surplusDays>=0'>{{row.surplusDays}}</span>
              <span v-else class='red'>已到期</span>
            </template>
          </Table>
          <Page :total="total" show-elevator :current='pageNum' @on-change='pageChange' :page-size='pageSize' @on-page-size-change='sizeChange'  show-sizer/>
        </div>
        <!-- 新增弹框的模态框 -->
        <Modal v-model="newlyAdded" width="740" :title="showNewlyType=='xz'?'新增信息管理':'编辑信息管理'"  :mask-closable='false'>
          <Form ref="formValidate" class='newAddModal' :model="formValidate" :rules="ruleValidate" :label-width="120" inline>
            <FormItem label="设备类型" prop="remark" v-if='showNewlyType=="sh"'>
              <Input v-model.trim="formValidate.remark" :disabled='showNewlyType=="ck"||showNewlyType=="sh"||showNewlyType=="bj"' placeholder="请输入机型"/>
            </FormItem>
            <FormItem label="设备类型" prop="machineType" v-else>
              <Select v-model="formValidate.machineType" :disabled='showNewlyType=="ck"||showNewlyType=="sh"||showNewlyType=="bj"'>
                  <Option v-for="item in equipmentList" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </FormItem>
            <FormItem label="设备编码" prop="machineCode" >
              <Input v-model.trim="formValidate.machineCode" :disabled='showNewlyType=="ck"||showNewlyType=="sh"||showNewlyType=="bj"' placeholder="请输入机器编码"/>
            </FormItem>
            <FormItem label="IMEI" prop="machineImei" >
              <Input v-model.trim="formValidate.machineImei" :disabled='showNewlyType=="ck"||showNewlyType=="sh"' placeholder="请输入机器串号"/>
              <p class='ivu-form-item-error-tip'>'IMEI'为特殊选填项（有的话必须填）</p>
            </FormItem>
            <FormItem label="硬件指令版本"  prop="hardwareVersion">
              <Select v-model="formValidate.hardwareVersion" placeholder="硬件指令版本" clearable :disabled='showNewlyType=="ck"||showNewlyType=="sh"'>
                <Option v-for="item in hardwareVersionList" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </FormItem>
            <FormItem label="设备识别码">
              <Input v-model.trim="formValidate.headingCode" :disabled='showNewlyType=="ck"||showNewlyType=="sh"' placeholder="请输入设备识别码"/>
            </FormItem>
            <FormItem label="摄像头编码">
              <Input v-model.trim="formValidate.cameraCode" :disabled='showNewlyType=="ck"||showNewlyType=="sh"' placeholder="请输入摄像头编码"/>
            </FormItem>
            <FormItem label="工控机code">
              <Input v-model.trim="formValidate.ipcCode" :disabled='showNewlyType=="ck"||showNewlyType=="sh"' placeholder="请输入工控机code"/>
            </FormItem>
            <FormItem label="工控机版本">
              <Input v-model.trim="formValidate.ipcVersion" :disabled='showNewlyType=="ck"||showNewlyType=="sh"' placeholder="请输入工控机版本"/>
            </FormItem>
            <FormItem label="钥匙编码">
              <Input v-model.trim="formValidate.keyCode" :disabled='showNewlyType=="ck"||showNewlyType=="sh"' placeholder="请输入钥匙编码"/>
            </FormItem>
            <FormItem label="设备来源">
              <Input v-model.trim="formValidate.machineOrigin" :disabled='showNewlyType=="ck"||showNewlyType=="sh"' placeholder="机器来源"/>
            </FormItem>
            <FormItem label="单片机code">
              <Input v-model.trim="formValidate.scmCode" :disabled='showNewlyType=="ck"||showNewlyType=="sh"' placeholder="请输入单片机code"/>
            </FormItem>
            <FormItem label="单片机版本号">
              <Input v-model.trim="formValidate.scmVersion" :disabled='showNewlyType=="ck"||showNewlyType=="sh"' placeholder="请输入单片机版本号"/>
            </FormItem>
            <FormItem label="屏幕编码">
              <Input v-model.trim="formValidate.screenNo" :disabled='showNewlyType=="ck"||showNewlyType=="sh"' placeholder="屏幕编码"/>
            </FormItem>
            <FormItem label="屏幕类型">
              <Select v-model="formValidate.screenType" :disabled='showNewlyType=="ck"||showNewlyType=="sh"'>
                  <Option v-for="item in screenTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </FormItem>
            <FormItem label="备注">
              <Input v-model.trim="formValidate.remark" :disabled='showNewlyType=="ck"||showNewlyType=="sh"' placeholder="请输入备注"/>
            </FormItem>
            <!-- <FormItem label="使用类型">
              <Select v-model="formValidate.ownership" :disabled='showNewlyType=="ck"||showNewlyType=="sh"'  style="width:160px">
                  <Option v-for="item in ownershipList" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </FormItem> -->
            <FormItem label="管理年费" v-show='showNewlyType!="sh"' >
              <Input v-model.trim="formValidate.annualFee" placeholder="元/天" :disabled='showNewlyType=="ck"||showNewlyType=="sh"'/>
            </FormItem>
            <template v-if='showNewlyType=="sh"'>
              <Divider/>
              <FormItem label="经营范围" prop="categoryId">
                <Select v-model="formValidate.categoryId" @on-change='categoryChange' placeholder="设备类型" clearable>
                  <Option v-for="item in rangeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
              </FormItem>
              <FormItem label="设备类型"  prop="shMachineType">
                <Select v-model="formValidate.shMachineType" placeholder="设备类型" clearable>
                  <Option v-for="item in equipmentList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
              </FormItem>
              <FormItem label="管理年费"  prop="annualFee">
                <Input v-model.trim="formValidate.annualFee" placeholder="元/天"/>
              </FormItem>
              <FormItem label="硬件指令版本"  prop="hardwareVersion">
                <Select v-model="formValidate.hardwareVersion" placeholder="硬件指令版本" clearable>
                  <Option v-for="item in hardwareVersionList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
              </FormItem>
            </template>
          </Form>
           <div slot="footer">
            <Button type="text" size="large" @click='newlyAdded=false'>取消</Button>
            <Button type="primary" size="large" @click="Added(formValidate,'formValidate')" v-show='showNewlyType!="ck"&&showNewlyType!="sh"'>确定</Button>
            <Button type="error" size="large" @click="examine(formValidate,false,'formValidate')" v-show='showNewlyType=="sh"'>审核不通过</Button>
            <Button type="success" size="large" @click="examine(formValidate,true,'formValidate')" v-show='showNewlyType=="sh"'>审核通过</Button>
           </div>
        </Modal>
        <Modal
          v-model="importNewlyAdded"
          width="600"
          title="导入模板"
          :mask-closable="false"
        >
          <Form ref="importRuleValidate" :model="importFormValidate" :rules="importRuleValidate" :label-width="120">
            <FormItem label="商户" prop="channelId">
              <div class='inputTree' @click='treeNewlyAdded=true'>{{importFormValidate.channelName}}</div>
            </FormItem>
            <FormItem label="设备类型" prop="machineType">
              <Select v-model="importFormValidate.machineType">
                  <Option v-for="item in equipmentList" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </FormItem>
            <!-- <FormItem label="自动生成货道" >
              <RadioGroup v-model="importFormValidate.roadExist">
                <Radio label="1">
                    <span>有</span>
                </Radio>
                <Radio label="0">
                    <span>无</span>
                </Radio>
              </RadioGroup>
            </FormItem> -->
            <FormItem label="设备来源" >
              <RadioGroup v-model="importFormValidate.ownership">
                <Radio label="1">
                    <span>购买</span>
                </Radio>
                <Radio label="2">
                    <span>租用</span>
                </Radio>
                <Radio label="3">
                    <span>第三方</span>
                </Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label="导入模板" prop="file">
              <span v-show="file">{{file?file.name:''}}</span>
              <template>
                <Upload
                  ref = 'upload'
                  :data = 'importFormValidate'
                  name="multipartFile"
                  :show-upload-list="false"
                  :before-upload="handleUpload"
                  :action="UploadExcel"
                  :format="['xlsx','xls']"
                  :on-format-error="formtError"
                  :on-error="onError"
                  :on-success="imgSuccess"
                >
                  <Button icon="ios-cloud-upload-outline">上传模板</Button>
                </Upload>
              </template>
            </FormItem>
          </Form>
          <div slot="footer">
            <Button type="text" size="large" @click="importNewlyAdded=false">取消</Button>
            <Button type="primary" size="large" @click="upload('importRuleValidate')" :disabled='!file'>确定</Button>
          </div>
        </Modal>
        <good-way-goods-tree
          :newlyAdded = 'treeNewlyAdded'
          :isgoods = 'false'
          :isdraggable = 'false'
          @cancel = 'cancel'
          @clickTreeRow = 'clickTree'
        >
        </good-way-goods-tree>
        <!-- 设备转移 -->
        <transfer-device
          ref='transfer'
          :newlyAdded = 'transferNewlyAdded'
          @cancel = 'transferCancel'
          @onSure = 'onSure'
        >
        </transfer-device>
        <delete-component
            :modalDel = 'modalDel'
            :del_loading = 'modal_loading'
            @cancel = 'delCancel'
            @del = 'del'
          >
        </delete-component>
        <Modal
          class='positionSet'
          v-model="notPassNewlyAdded"
          width="600"
          title="审核不通过"
          :mask-closable="false"
        >
          <Input :maxlength='100' v-model="formValidate.remark" style='width:100%' type="textarea" :rows="4" placeholder="审核不通过的原因...." />
          <div slot="footer">
            <Button type="text" size="large" @click="notPassNewlyAdded=false">取消</Button>
            <Button type="primary" size="large" @click="notPass(formValidate)" >确定</Button>
          </div>
        </Modal>
        <Modal
          class='renewal'
          v-model="renewalNewlyAdded"
          width="400"
          title="续租"
          :mask-closable="false"
          style='min-height:200px'
        >
          <span>续租时间：</span><DatePicker :options="options" v-model='endTime' type="datetime" format="yyyy-MM-dd HH:mm:ss" placeholder="选择到期时间" style="width: 200px" ></DatePicker>
          <p v-show='surplusDay' style='padding-left:60px;margin-top:15px'>续约共计：{{surplusDay}}天</p>
          <div slot="footer">
            <Button type="text" size="large" @click="renewalNewlyAdded=false">取消</Button>
            <Button type="primary" size="large" @click="renewalSure" >确定</Button>
          </div>
        </Modal>
        <!-- 点位信息 -->
        <position-info 
          :newlyAdded="positionNewlyAdded" 
          :formValidate="positionFormValidate" 
          @cancel="positionCancel">
        </position-info>
        <!-- 点位设置 -->
        <Modal
          class='positionSet'
          v-model="pointionNewlyAdded"
          width="600"
          title="点位信息"
          :mask-closable="false"
        >
          <Tabs @on-click='tabsClick' v-model='positionTabs'>
              <TabPane :label="isSetPosition?'点位选择':'当前点位'" name='pick'>
                <Table border ref="selection" :highlight-row='isSetPosition' :columns="pointionColumns" :data="pointionDatas" @on-row-click='potiontTbleClick'>
                </Table>
                <Page :total="potionTotal" show-elevator :current='potionPageNum' @on-change='potionPageChange' :page-size='potionPageSize' @on-page-size-change='potionSizeChange'  show-sizer/>
              </TabPane>
              <TabPane label="历史点位记录" name='history'>
                <Table border ref="selection" :columns="pointionColumns" :data="historyData">
                </Table>
                <Page :total="historyTotal" show-elevator :current='historyPageNum' @on-change='historyPageChange' :page-size='historyPageSize' @on-page-size-change='historySizeChange'  show-sizer/>
              </TabPane>
              <div slot="extra">
                <Input v-model="positionName"  placeholder="点位名称" clearable />
                <Button  type="primary" icon="ios-search" @click='positionSelect'>查询</Button>
              </div>
          </Tabs>
          <div slot="footer">
            <Button type="text" size="large" @click="pointionNewlyAdded=false">取消</Button>
            <Button type="primary" size="large" @click="potionSure" v-show='isSetPosition'>确定</Button>
          </div>
        </Modal>
        <table-modal
          title = '开门记录'
          :newlyAdded = 'openDoorNewlyAdded'
          :datas = 'openDoorData'
          :columns = 'openDoorColumns'
          :showPage = 'false'
          @sure = 'openDoorCancel'
          @cancel = 'openDoorCancel'
        ></table-modal>
    </div>
    <div v-else>
      <!-- <device-component
        :priceTemplate = 'priceTemplate'
        :channelId = 'priceChannelId'
        :selectList = 'selectList'
        :machineCode = 'machineCode'
        :query = 'query'
        @toBack =  'toBack'
        ref='device'
      ></device-component> -->
      <device-modal-component
        ref='device'
        :query = 'query'
        @toBack =  'toBack'
      >
      </device-modal-component>
    </div>
</template>

<script>
import { netWorkHttp,netWorkGoods,netWorkDevice,UploadExcel} from "@/api/data";
import channelTree from '../components/channelTree';
import goodWayGoodsTree  from '@/view/custom/components/goodWayGoodsTree';
import transferDevice  from '@/view/custom/components/transferDevice';
import  modalTable from "@/view/custom/components/modalTable";
import format from "@/plugin/format.js"; //格式化时间YYYY-MM-DD
import positionInfo from "@/view/custom/components/positionInfo";
import  deleteComponent from "@/view/custom/components/deleteComponent";
import deviceComponent from '@/view/custom/components/deviceComponent';
import  tableModal from "@/view/custom/components/tableModal";
import  deviceModalComponent from "@/view/custom/components/deviceModalComponent";
export default {
  name:'deviceInfo',
  components: {
    goodWayGoodsTree,
    channelTree,
    transferDevice,
    modalTable,
    deleteComponent,
    positionInfo,
    deviceComponent,
    tableModal,
    deviceModalComponent
  },
  computed:{
    surplusDay(){
      if(this.endTime&&this.rowData){
        console.log(this.rowData.expireDate)
        if(this.rowData.expireDate&&new Date(this.rowData.expireDate).valueOf()>Date.now()){
          return parseInt(((new Date(this.endTime).valueOf())-(new Date(this.rowData.expireDate).valueOf()))/(1000 * 60 * 60 * 24));
        }
          return parseInt(((new Date(this.endTime).valueOf())-(new Date().valueOf()))/(1000 * 60 * 60 * 24));
      }
        return '0'
    }
  },
  data(){
    return{
      recursionData:{},
      machineStatus:null,
      statusList:[
        {value:0,label:'待审核'},
        {value:1,label:'待使用'},
        {value:2,label:'审核不通过'},
        {value:3,label:'点位中'},
        {value:4,label:'故障中'},
        {value:5,label:'维修中'},
        {value:6,label:'报废'},
        {value:7,label:'待激活'},
      ],
      openDoorNewlyAdded:false,
      openDoorData:[],
      openDoorColumns:[
        {
          title: '序号',
          type: 'index',
          width: 60,
          align: 'center'
        },
        {
          title: '开门时间',
          key: 'openDate',
          align: 'center',
          width: 127,
          tooltip:true
        },
        {
          title: '用户',
          key: 'operatorName',
          align: 'center',
          width: 127,
          tooltip:true
        },
        {
          title: '开门方式',
          key: 'openTypeName',
          align: 'center',
          width: 127,
          tooltip:true
        },
        {
          title: '手机号',
          key: 'phone',
          align: 'center',
          width: 127,
          tooltip:true
        },
      ],
      historyData:[],
      historyPageNum:1,
      historyTotal:null,
      historyPageSize:10,
      positionTabs:'pick',
      positionName:null,
      isSetPosition:false,
      potionPickRowData:null,
      positionIndex:null,
      potionPageNum:1,
      potionTotal:null,
      potionPageSize:10,
      pointionColumns:[
        {
          title: '序号',
          type: 'index',
          width: 60,
          align: 'center'
        },
        {
          title: '线路名称',
          key: 'routeName',
          align: 'center',
          width: 120,
          tooltip:true
        },
        {
          title: '点位名称',
          key: 'positionName',
          align: 'center',
          width: 120,
          tooltip:true
        },
        {
          title: '点位地址',
          key: 'positionAddress',
          align: 'center',
          width: 267,
          tooltip:true
        }
      ],
      pointionDatas:[],
      pointionNewlyAdded:false,
      machineType:null,
      isDetail:false,
      query:null,
      selectList:[],
      priceChannelId:null,
      priceTemplate:null,
      positionFormValidate:{},
      positionNewlyAdded:false,
      options:{},
      endTime:null,
      renewalNewlyAdded:false,
      notPassNewlyAdded:false,
      modal_loading: false, //删除的loading
      delID: null, //删除的ID
      delIndex: null, //删除的索引
      modalDel: false,
      ownershipList:[
        {value:1,label:'购买'},
        {value:2,label:'租用'},
      ],
      hardwareVersionList:[
        {value:1,label:'第一代'},
        {value:2,label:'第二代'},
        {value:3,label:'药机指令'},
      ],
      priceTemplate:null,
      rowData:null, //行信息
      transferNewlyAdded:null,
      tableRowData:null,
      screenTypeList:[
        {value:1,label:'竖屏'},
        {value:2,label:'横屏'},
        {value:3,label:'无屏幕'},
      ],
      rangeList:[],
      formValidate:{ //新增字段
        machineType:null,
        machineCode:null,
        machineImei:null,
        status:7,
        remark:null,
        cameraCode:null,
        ipcCode:null,
        ipcVersion:null,
        keyCode:null,
        machineOrigin:null,
        scmCode:null,
        scmVersion:null,
        screenNo:null,
        screenType:1,
        enable:'1',
        ownership:2,//使用类型  平台默认为2
        annualFee:null,//管理年费/天
        headingCode:null,
        shMachineType:null, //审核设备类型
        categoryId:null,//经营范围
        hardwareVersion:null
      },
      ruleValidate: {
        machineType: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        machineCode: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        remark: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          },
          { max:8, message: "长度最多是8个字符", trigger: "blur" },
        ],
        categoryId: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "change",
            type:'number'
          }
        ],
        shMachineType: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "change",
          }
        ],
        annualFee: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        hardwareVersion: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "change",
            type:'number'
          }
        ],
      },
      showNewlyType:'xz',
      newlyAdded:false,
      treeNewlyAdded:false,
      equipmentList:[],
      UploadExcel,
      file: null,
      importFormValidate: {
        machineType:null,
        channelId:this.$store.state.user.channelId,
        channelName:null,
        operator:this.$store.state.user.userId,
        operatorName:this.$store.state.user.userName,
        // roadExist:'1',
        ownership:'1',
      },
      importRuleValidate: {
        machineType: [
          {
            required: true,
            message: "不能为空",
            trigger: "blur"
          }
        ],
        channelId: [
          {
            required: true,
            message: "不能为空",
            trigger: "blur"
          }
        ],
        file: [
          {
            required: true,
            message: "不能为空",
            trigger: "blur"
          }
        ],
      },
      importNewlyAdded:false,
      pageSize:10,
      pageNum:1,
      total:null,
      datas:[],
      columns:[
        {
          title: '序号',
          type: 'index',
          width:40,
          align: 'center'
        },
        {
          title: '设备编码',
          key: 'machineCode',
          align: 'center',
          tooltip:true
        },
        {
          title: '设备类型',
          key: 'machineName',
          align: 'center',
          width:140,
          tooltip:true
        },
        // {
        //   title: '货道商品',
        //   slot: 'cargoWay',
        //   align: 'center',
        //   tooltip:true
        // },
        {
          title: '货道模板',
          slot: 'cargoModal',
          align: 'center',
          tooltip:true
        },
        {
          title: '出厂信息',
          slot: 'info',
          align: 'center',
          tooltip:true
        },
        {
          title: '点位设定',
          slot: 'position',
          align: 'center',
          tooltip:true
        },
        {
          title: '机器网络状态',
          slot: 'network',
          align: 'center',
          width:60,
          tooltip:true
        },
        {
          title: '设备状态',
          slot: 'status',
          align: 'center',
          width:60,
          tooltip:true
        },
        {
          title: '设备维护费用/年',
          key: 'annualFees',
          align: 'center',
          width:60,
          tooltip:true
        },
        {
          title: '激活时间',
          slot: 'time',
          align: 'center',
          tooltip:true
        },
        {
          title: '使用年限/天',
          key: 'useDays',
          align: 'center',
          width:60,
          tooltip:true
        },
        {
          title: '到期剩余时间/天',
          slot: 'surplusDays',
          align: 'center',
          width:60,
          tooltip:true
        },
        {
          title: '开门记录',
          slot: 'kaimen',
          align: 'center',
          tooltip:true
        },
        {
          title: '备注',
          key: 'remark',
          align: 'center',
          tooltip:true
        },
        {
          title: '操作',
          slot: 'edit',
          align: 'center',
          width:'180',
          tooltip:true
        },
        {
          title: '到期操作',
          slot: 'expireEdit',
          align: 'center',
          width:80,
          tooltip:true
        }
      ],
      name:'',//查询名称
      operator:this.$store.state.user.userId,
      operatorName:this.$store.state.user.userName,
      operatorType:this.$store.state.user.userVo.type,
      channelId:this.$store.state.user.channelId
    }
  },
  methods:{
    devDelete(row,index){
      if(row.status!=3){
        this.modalDel=true;
        this.delID=row.id;
        this.delIndex=index
      }else{
        this.$Message.error("在点位中不能被删除！");
      }
    },
    categoryChange(value){
      this.$set(this.formValidate,'shMachineType',null)
      // this.formValidate.shMachineType = null;
      this.getEquipment(value);
    },
    clickQuery(){
      this.pageNum = 1;
      this.getPageDatas();
    },
    reset(){
      this.machineType = null;
      this.machineStatus = null;
      this.pageNum = 1;
      this.total = null;
      this.pageSize = 15;
      this.name = null;
      this.channelId = this.$store.state.user.channelId;
      this.getPageDatas();
      this.$refs.channelTree.getTreeData();
    },
    cargoModalToLink(row){
      let url = `/machineTypeRoad/queryByType?machineType=${row.machineType}`;
      netWorkDevice(url,null,'get').then(res => {
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
                  this.$refs.device.setWidthAfter(i,index)
                }
              },1)
            })
          })
        } else {
          this.query.list =[]
        }
        this.isDetail = true;
      })
    },
    openTheDoor(row){
      const data ={
        channelId:this.channelId,
        machineCode:row.machineCode
      }
      netWorkDevice('/positionDoor/list',data).then(res => {
        this.openDoorData = res.result.list
        this.openDoorNewlyAdded =  true;
      })
    },
    openDoorCancel(){
      this.openDoorNewlyAdded = false;
    },
    positionSelect(){
      if(this.positionTabs=='pick'){
        this.getPotionData();
      }else{
        this.positionHistory();
      }
    },
    positionHistory(){
      let data = {
        positionName:this.positionName,
        channelId:this.rowData.channelId,
        machineCode:this.rowData.machineCode,
        pageNum:this.historyPageNum,
        pageSize:this.historyPageSize,
      }
      netWorkDevice("/machineMove/list", data).then(res => {
        this.historyPageNum = res.result.pageNum;
        this.historyTotal = res.result.total;
        this.historyData = res.result.list;
      })
    },
    tabsClick(name){
      if(name=='history'){
        this.positionHistory();
      }
    },
    potionSure(){
      if(this.potionPickRowData){
        console.log(this.potionPickRowData);
        // this.$Spin.show()
        let data = {
          channelId:this.potionPickRowData.channelId,
          operator:this.operator,
          operatorName:this.operatorName,
          id:this.potionPickRowData.id,
          channelId:this.potionPickRowData.channelId,
          machineCode:this.rowData.machineCode,
          routeId:this.potionPickRowData.routeId,
          routeName:this.potionPickRowData.routeName,
          positionAddress:this.potionPickRowData.positionAddress,
          positionName:this.potionPickRowData.positionName,
        }
        netWorkDevice("/machinePosition/bundlingMachine", data).then(res => {
          this.pointionNewlyAdded = false;
          this.getPageDatas();
          this.$Message.success('绑定成功');
          // this.$Spin.hide()
        })
        // .catch(()=>{
        //   this.$Spin.hide()
        // })
      }else{
        this.$Message.error("暂未选择点位！");
      }
    },
    potiontTbleClick(row){
      this.potionPickRowData = row;
      console.log(row)
    },
    historyPageChange(value){
      this.historyPageNum = value;
      this.positionHistory();
    },
    historySizeChange(value){
      this.historyPageSize = value;
      this.positionHistory();
    },
    potionPageChange(value){
      this.potionPageNum = value;
      this.getPotionData();
    },
    potionSizeChange(value){
      this.potionPageSize = value;
      this.getPotionData();
    },
    getPotionData(row){
      let data = {
        positionName:this.positionName,
        channelId:this.rowData.channelId,
        machineCode:this.isSetPosition?null:this.rowData.machineCode,
        pageNum:this.potionPageNum,
        enable:this.isSetPosition?1:null,
        positionStatus:this.isSetPosition?3:null,
        pageSize:this.potionPageSize
      }
      netWorkDevice('/machinePosition/list',data)
      .then(res => {
        this.potionPageNum = res.result.pageNum;
        this.potionTotal = res.result.total;
        this.pointionDatas = res.result.list;
      })
    },
    positionInfo(row,index,value){
      this.isSetPosition  = value;
      this.positionIndex = index;
      this.positionTabs = 'pick';
      this.rowData = row;
      this.priceTemplate = row.priceTemplate;
      this.pointionNewlyAdded = true;
      this.getPotionData()
    },
    getByMachineCode(row){
      this.priceTemplate = row.priceTemplate;
      this.priceChannelId = row.channelId
      return new Promise((resolve, reject)=>{
        let data = {
          channelId:this.channelId,
          machineCode:row.machineCode,
          priceTemplate:row.priceTemplate
        }
        let url = `/machineRoad/queryByMachineCode`;
        netWorkDevice(url,data).then(res => {
          this.query = res.result;
          if(!this.query.list[0].AddMachineTypeRoadDto){
            this.query.list = [];
            this.getselectList(row);
          }
          this.query.list.forEach((v,i)=>{
            v.AddMachineTypeRoadDto.forEach((val,index)=>{
              val.roadType =  val.roadType?val.roadType.toString():'1';
              val.rowData =  val.rowData?val.rowData:{};
              setTimeout(()=>{  //延时让组件先渲染 否则为空
                if(index>0&&this.query.list[i].AddMachineTypeRoadDto[index].merged){
                  this.$refs.device.setWidthAfter(i,index)
                }
              },1)
            })
          })
          console.log(this.query)
          this.isDetail = true;
          resolve();
        }).catch(err => {
          reject();
        });
      })
    },
    getselectList(row){
      return new Promise((resolve, reject)=>{
        console.log(row)
        let url = `/machineTemplate/queryTemplateByCodeOrId?MachineCode=${row.machineCode}&machineType=0`;
        netWorkDevice(url,null,'get').then(res => {
          this.selectList = res.result;
          resolve();
        }).catch(err => {
          reject();
        });
      })
    },
    toBack(){
      this.isDetail = false;
      this.query = null;
      this.getPageDatas()
    },
    toLink(row){
      this.$Spin.show();
      this.selectList = [];//初始化数据
      this.machineCode = row.machineCode;
      let p1 = this.getByMachineCode(row)
      Promise.all([p1]).then((result) => {
        this.$Spin.hide()
      }).catch((error) => {
        this.$Spin.hide()
      })
    },
    positionLink(row){
      let data = {
        channelId: this.channelId,
        positionId: row.positionId,
        pageNum: 1,
        pageSize: 1
      };
      netWorkDevice("/machinePosition/list", data).then(res => {
        let positionData = res.result.list[0];
        this.positionFormValidate = positionData;
        this.positionFormValidate.areaIds = positionData.areaIds
          .split(",")
          .map(item => {
            return parseInt(item);
          });
        this.positionFormValidate.runDate = positionData.runDate.split("-");
        this.positionFormValidate.positionType = positionData.positionType + "";
        this.positionFormValidate.cooperationType =
          positionData.cooperationType + "";
        this.positionFormValidate.benefitId = positionData.benefitId + "";
        this.positionFormValidate.routeId = positionData.routeId + "";
        this.positionNewlyAdded = true;
      })
    },
    positionCancel(){
      this.positionNewlyAdded = false;
    },
    renewalSure(){
      if(this.endTime){
        if(this.surplusDay<0){
          this.$Message.error("请选择到期时间之后的时间！");
        }else{
          const data = {
            id:this.rowData.id,
            expireDate:format(this.endTime, "YYYY-MM-DD HH:mm:ss")
          }
          netWorkDevice("/machineInfo/modify", data).then(res => {
            this.getPageDatas(); //刷新页面
            this.renewalNewlyAdded = false;
            this.$Message.success("操作成功");
          })
        }
      }else{
        this.$Message.error("请先选择时间！");
      }
    },
    renewal(row){
      this.endTime = null;
      this.rowData = row;
      this.options = {
        disabledDate:(date)=> {
          if(this.rowData.expireDate&&new Date(this.rowData.expireDate).valueOf()>Date.now()){
            return date && date.valueOf() < new Date(this.rowData.expireDate).valueOf();
          }
          return date && date.valueOf() < Date.now();
        },
      }
      this.renewalNewlyAdded = true;
    },
    notPass({id,annualFee,remark}){
      const data = {id,annualFee,status:2,remark};
      netWorkDevice("/machineInfo/modify", data).then(res => {
        this.getPageDatas(); //刷新页面
        this.notPassNewlyAdded = false;
        this.$Message.success("操作成功");
      })
    },
    examine({id,annualFee,shMachineType,categoryId,hardwareVersion,machineCode},isPass,name){
      if(isPass){
        console.log(id,annualFee,shMachineType,categoryId,hardwareVersion)
        this.$refs[name].validate(valid => {
          if(valid){
            const data = {
              id,
              annualFee,
              categoryId,
              hardwareVersion,
              machineType:shMachineType,
              status:7,
              machineCode,
              channelId:this.channelId
            };
            netWorkDevice("/machineInfo/audit", data).then(res => {
              this.getPageDatas(); //刷新页面
              this.newlyAdded = false;
              this.$Message.success("操作成功");
            })
          }
        })
      }else{
        this.newlyAdded = false;
        this.notPassNewlyAdded = true;
      }
    },
    //base 图片下载
    downloadFile(fileName, content) {
        let aLink = document.createElement('a');
        let blob = this.base64ToBlob(content); // new Blob([content]);
        let evt = document.createEvent('HTMLEvents');
        evt.initEvent('click', true, true);// initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
        aLink.download = fileName;
        aLink.href = URL.createObjectURL(blob);
        aLink.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));// 兼容火狐
    },
    // base64转blob
    base64ToBlob(code) {
        let parts = code.split(';base64,');
        let contentType = parts[0].split(':')[1];
        let raw = window.atob(parts[1]);
        let rawLength = raw.length;

        let uInt8Array = new Uint8Array(rawLength);

        for(let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        return new Blob([uInt8Array], {type: contentType});
    },
    delCancel(){
      this.modal_loading = false;
      this.modalDel = false;
    },
    del() {
      this.modal_loading = true;
      let url = "/machineInfo/delete?id=" + this.delID;
      netWorkDevice(url,null,'delete').then(res => {
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
    onSure(id,isClean){
      let data = {
        id:this.tableRowData.id,
        operator:this.$store.state.user.userId,
        operatorName:this.$store.state.user.userName,
        channelId:this.tableRowData.channelId,
        machineCode:this.tableRowData.machineCode,
        newChannelId:id,
        isSetNull:isClean,
        positionId:this.tableRowData.positionId
      }
      netWorkDevice('/machineInfo/modifyChannelId',data).then(res => {
        this.getPageDatas();
        this.tableRowData = null;
        this.$Message.success("操作成功");
        this.transferNewlyAdded = false;
        this.$refs.transfer.transferNewlyAdded = false;
      })
    },
    transferCancel(){
      this.transferNewlyAdded = false
    },
    tableClick(row,index){
      this.tableRowData = row;
      const id = row.channelId;
      const treeData = this.$refs.channelTree.treeData;
      this.recursion(treeData,id)
      const cId = this.recursionData.id;
      let nodes = document.querySelectorAll('.tree a');
      nodes.forEach((v,i)=>{
        nodes[i].classList.remove('curSelectedNode')
      })
      let node = document.querySelector('.tree a[title="'+cId+'"]')
      node.classList.add('curSelectedNode')
    },
    recursion(ary,value,){
      ary.find(v=>{
        if(value == v.id){
          this.recursionData = v
          return true
        }else{
          if(v.children)this.recursion(v.children,value)
        }
      })
    },
    async showNewlyAdded(type,index,row){
      await this.initialization('formValidate');
      this.showNewlyType = type;
      this.formValidate = { //新增字段
        machineType:null,
        machineCode:null,
        machineImei:null,
        status:7,
        remark:null,
        cameraCode:null,
        ipcCode:null,
        ipcVersion:null,
        keyCode:null,
        machineOrigin:null,
        scmCode:null,
        scmVersion:null,
        screenNo:null,
        screenType:1,
        enable:'1',
        ownership:2,
        annualFee:null,
        headingCode:null,
        categoryId:null,
        shMachineType:null,
        hardwareVersion:null,
      };
      if(type!='xz'){
        console.log(row)
        this.formValidate = JSON.parse(JSON.stringify(row));
        this.formValidate.enable = this.formValidate.enable+'';
        this.formValidate.machineType = this.formValidate.machineType+'';
        if(type=='sh'){
          const url = `/channelBusiness/queryChannelBusinessByChannelId?channelId=${this.channelId}`
          return netWorkGoods(url,null,'get').then(res=>{
            this.rangeList = res.result.map(v=> {
              return {value:v.categoryId,label:v.categoryName}
            })
            this.newlyAdded=true
          })
        }
      }
      this.newlyAdded=true
    },
    Added(value,name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          let {
            machineType,
            machineCode,
            machineImei,
            status,
            remark,
            cameraCode,
            ipcCode,
            ipcVersion,
            keyCode,
            machineOrigin,
            scmCode,
            scmVersion,
            screenNo,
            screenType,
            enable,
            ownership,
            annualFee,
            headingCode,
            hardwareVersion
          } = value;
          if (this.showNewlyType == "xz") {
            let data = {
              machineType,
              machineCode,
              machineImei,
              status,
              remark,
              cameraCode,
              ipcCode,
              ipcVersion,
              keyCode,
              machineOrigin,
              scmCode,
              scmVersion,
              screenNo,
              screenType,
              hardwareVersion,
              operator:this.operator,
              operatorName:this.operatorName,
              channelId:this.channelId,
              enable,
              ownership,
              annualFee,
              headingCode
            };
            netWorkDevice("/machineInfo/add", data).then(res => {
              this.getPageDatas(); //刷新页面
              this.newlyAdded = false;
              this.$Message.success("新增成功");
            })
          }else if(this.showNewlyType=='bj'){
            let data = {
              machineType,
              machineCode,
              machineImei,
              status,
              remark,
              cameraCode,
              ipcCode,
              ipcVersion,
              keyCode,
              machineOrigin,
              scmCode,
              scmVersion,
              screenNo,
              screenType,
              hardwareVersion,
              operator:this.operator,
              operatorName:this.operatorName,
              channelId:this.channelId,
              enable,
              ownership,
              annualFee,
              headingCode,
              id:value.id
            };
            netWorkDevice("/machineInfo/modify", data).then(res => {
              this.getPageDatas(); //刷新页面
              this.newlyAdded = false;
              this.$Message.success("修改成功");
            })
          }
        } else {
          // this.$Message.error("信息填写不完整！");
        }
      })
    },
    clickTree(value){
      this.importFormValidate.channelId = value.id;
      this.importFormValidate.channelName = value.name;
      this.treeNewlyAdded = false;
    },
    cancel(){
      this.treeNewlyAdded = false;
    },
    //文件上传
    upload (name) {
      // this.$refs[name].validate(valid => {
      //   if (valid) {
          this.$refs.upload.post(this.file);
          this.file = null;
      //   }
      // })
    },
    handleUpload(file){
      this.file = file;
      return false;
    },
    formtError(file, fileList) {
      this.$Message.error("上传文件类型错误");
    },
    onError(error) {
      this.$Message.error("上传失败");
    },
    imgSuccess(response) {
      if (response.code === 200) {
        this.file = null;
        this.importNewlyAdded = false;
        if(response.result){
          this.$Message.error(response.result);
          return false;
        }
        this.getPageDatas();
      } else if (response.code === 500) {
        this.$Message.error(response.message);
      }
    },
    exportTemplate(){
      // window.location.href = 'http://tobacco.sun-hyt.com:8888/newadv/%E8%AE%BE%E5%A4%87%E4%BF%A1%E6%81%AF%E5%BD%95%E5%8F%96%E6%A8%A1%E6%9D%BF.xls'
      let url = `/machineInfo/getTemplate`
      return netWorkDevice(url, null,'get').then(res => {
        window.location.href = res.result;
      }).catch(err=>{
        this.$Message.error('下载失败');
      })
    },
    async importTemplate(){
      // await this.initialization('importRuleValidate');
      this.importFormValidate = {
        machineType:null,
        channelId:this.$store.state.user.channelId,
        channelName:null,
        operator:this.$store.state.user.userId,
        operatorName:this.$store.state.user.userName,
        // roadExist:'1',
        ownership:'1',
      }
      this.importNewlyAdded = true;
    },
    clickTreeRow(value){
      if(value){
        this.channelId = value.id;
        this.tableRowData = null;
        this.pageNum = 1;
        this.getPageDatas(value.id);
        const cId = value.id;
        let nodes = document.querySelectorAll('.tree a');
        nodes.forEach((v,i)=>{
          nodes[i].classList.remove('curSelectedNode')
        })
        let node = document.querySelector('.tree a[title="'+cId+'"]')
        node.classList.add('curSelectedNode')
        console.log(value)
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
    getEquipment(value){
      let url
      if(value){
        url = '/machineType/queryNameByCategoryId?categoryId='+value
      }else{
        url = '/machineType/queryNameByCategoryId';
      }
      netWorkDevice(url, null,'get').then(res => {
        this.equipmentList = res.result
      })
    },
    getPageDatas(id=null) {
      let data = {
        channelId:id,
        status:this.machineStatus,
        userId:this.operator,
        type:this.operatorType,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        machineCode:this.name,
        machineType:this.machineType
      };
      netWorkDevice("/machineInfo/list", data).then(res => {
        this.pageNum = res.result.pageNum;
        this.total = res.result.total;
        this.datas = res.result.list;
      })
    },
  },
  mounted(){
    this.getPageDatas();
    this.getEquipment();
  }
}
</script>
<style lang="less" scoped>
  .deviceInfo{
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
    /deep/ .ivu-table-cell{
      padding-left: 0px;
      padding-right:0px;
    }
    .ivu-page{
      text-align: center;
      margin-top: 10px;
    }
    /deep/ .ivu-table-fixed{
      box-shadow:1px 1px 20px #6d4a4a;
      box-shadow:0px 0px 0px #fff;
    }
    .leftBox {
      // min-width: 250px;
      min-height: 900px;
      float: left;
      margin-right: 20px;
    }
  }
  .inputTree{
    width: 160px;
    height: 32px;
    line-height:2;
    font-size: 12px;
    border:1px solid #dcdee2;
    margin-bottom: 10px;
    border-radius: 4px;
    color: #515a6e;
    cursor: pointer;
    background: white;
    padding: 4px 7px;
    &:hover{
      border-color:#57a3f3
    }
  }
  .ivu-upload {
    display: inline-block;
    vertical-align: middle;
    margin-left: 20px;
  }
  .newAddModal{
    /deep/ .ivu-select , /deep/.ivu-input-wrapper{
      width:200px
    } 
  }
  .lookDetails{
    text-decoration: underline
  }
  .positionSet{
    .ivu-input-wrapper{
      width: 120px;
      margin-right: 10px;
    }
    /deep/.ivu-tabs-nav-container{
      margin-bottom: 9px;
    }
    /deep/.ivu-tabs-nav /deep/.ivu-tabs-tab-active {
      background: #2d8cf0;
      color:white;
      padding:5px 16px;
      border-radius: 4px;
    }
    /deep/.ivu-tabs-ink-bar{
      height: 0px;
    }
    /deep/ .ivu-table-cell{
      padding-left: 0px;
      padding-right:0px;
    }
    .ivu-page{
      text-align: center;
      margin-top: 10px;
    }
  }
  .interest{
    /deep/.ivu-modal-body{
      min-height:500px;
      overflow: auto;
    }
    .ivu-select{
      width: 160px;
    }
    .ivu-divider{
      margin:16px 0px;
    }
  }
  img{
    cursor: pointer;
  }
  .stockInput{
    width: 100%;
    outline: none;
    text-align: center;
    border: none;
  }
  .erweima{
    height: 400px;
    img{
      margin:0 auto;
      display: block;
    }
  }
  .renewal{
    /deep/.ivu-modal-body{
      min-height:100px;
      padding:25px;
    }
  }
</style>
