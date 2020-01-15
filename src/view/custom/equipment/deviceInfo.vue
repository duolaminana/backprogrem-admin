<template>
  <div class='deviceInfo' v-if="!isDetail">
    <div class="leftBox">
      <channel-tree @clickTreeRow='clickTreeRow' ref='channelTree'></channel-tree>
    </div>
    <div class='rightDiv'>
        <Input v-model="routeName	"  placeholder="分区线路" clearable class='marginRight'/>
        <Input v-model="name"  placeholder="设备编码" clearable class='marginRight'/>
        <Button  @click="clickQuery" type="primary">查询</Button>
        <Button  @click='reset' type="primary">重置</Button>
        <Button v-if="channelId==$store.state.user.userVo.channelId && hasPerm('pos:dev:edit')"  type="primary" @click='showNewlyAdded("xz")' class='xzbtn' icon="md-add">新增</Button>
        <Button v-if="channelId==$store.state.user.userVo.channelId&& hasPerm('pos:dev:edit')"  type="primary" @click='transferNewlyAdded = true' :disabled='!tableRowData'>设备转移</Button>
        <Poptip placement="right" trigger='hover' >
          <Button  type="success" @click='exportTemplate'>导出模板</Button>
          <div slot="content">
            <p>用于批量添加设备，</p>
            <p>导出模板后填写好设备信息联系平台工作人员，</p>
            <p>协助您批量加入。</p>
          </div>
        </Poptip>
        <!-- <Button  type="success" @click='importNewlyAdded=true'>导入</Button> -->
        <Table :row-class-name='trBgColor' border ref="selection" :highlight-row='true' :columns="columns" :data="datas" @on-row-click='tableClick'>
          <template slot-scope="{ row, index }" slot="edit">
              <Button v-if="channelId==$store.state.user.userVo.channelId&&hasPerm('pos:dev:edit')&&row.enable==0" type="success" size="small" class='marBtn' @click='enable(row,index,true)'  :disabled='row.surplusDays<0'>启用</Button>
              <Button v-if="channelId==$store.state.user.userVo.channelId&&hasPerm('pos:dev:edit')&&row.enable==1" type="error" size="small" class='marBtn' @click='enable(row,index,false)' :disabled='row.surplusDays<0'>停用</Button>
              <Button v-if="channelId==$store.state.user.userVo.channelId&&hasPerm('pos:dev:edit')" type="primary" size="small" class='marBtn' @click='showNewlyAdded("bj",index,row)' :disabled='$store.state.user.userVo.type!=2||row.ownership!=3||row.status!=2||row.surplusDays<0'>编辑</Button>
              <!-- {{$store.state.user.userVo.type!=2}}=={{row.ownership!=3}}=={{row.surplusDays<0}}=={{row.stock>0}} -->
              <Button v-if="channelId==$store.state.user.userVo.channelId&&hasPerm('pos:dev:edit')" type="error" size="small" class='marBtn' @click="devDelete(row,index)" :disabled='$store.state.user.userVo.type!=2||row.ownership!=3||row.surplusDays<0'>删除</Button>
          </template>
          <template slot-scope="{ row, index }" slot="info">
              <a class='lookDetails' @click='showNewlyAdded("ck",index,row)' :disabled="row.surplusDays<0">查看详情</a>
          </template>
          <template slot-scope="{ row, index }" slot="position">
              <a class='lookDetails'  v-if='row.positionId' :disabled="row.status!=3||row.surplusDays<0||channelId!=$store.state.user.userVo.channelId" @click='positionInfo(row,index,false)'>{{row.positionName}}</a>
              <a v-else-if='!row.positionId&&(row.status==1||row.status==7)' @click='positionInfo(row,index,true)' :disabled="row.surplusDays<0||channelId!=$store.state.user.userVo.channelId" class='green' >去设定</a>
              <a v-else class='gray'>去设定</a>
          </template>
          <template slot-scope="{ row, index }" slot="cargoWay">
              <a class='lookDetails' :disabled="!row.machineType||row.surplusDays<0||channelId!=$store.state.user.userVo.channelId||!hasPerm('pos:dev:dgp')" @click='toLink(row)'>查看详情</a>
          </template>
          <template slot-scope="{ row, index }" slot="interest">
              <a class='lookDetails' v-if="row.num>0&&($store.state.user.userVo.type==2||hasPerm('pos:dev:bef'))"  @click='toLinkInterest(row,false)' :disabled="row.surplusDays<0||channelId!=$store.state.user.userVo.channelId">去查看</a>
              <a v-else-if="row.num<=0&&($store.state.user.userVo.type==2||hasPerm('pos:dev:bef'))" @click='toLinkInterest(row,true)' class='green' :disabled="row.surplusDays<0||channelId!=$store.state.user.userVo.channelId">去设定</a>
              <a v-else class='gray'>去设定</a>
          </template>
          <template slot-scope="{ row, index }" slot="network">
              <span v-if='row.networkStatus==1' :class='row.surplusDays<0?"gray":"green"' >在线</span>
              <span v-else class='gray'>离线</span>
          </template>
          <template slot-scope="{ row, index }" slot="deviceStatus">
              <span v-show='row.enable==1'  :class='row.surplusDays<0?"gray":"green"'>已启用</span>
              <span v-show='row.enable==0' class='gray'>未启用</span>
          </template>
          <template slot-scope="{ row, index }" slot="status">
              <span v-show='row.status==0' class='orange'>待审核</span>
              <span v-show='row.status==1'  :class='row.surplusDays<0?"gray":"orange"'>待使用</span>
              <Poptip placement="right" width="350" trigger='hover' >
                <span v-show='row.status==2'  class='red'>审核不通过</span>
                <div slot="content">
                  {{row.remark}}
                </div>
              </Poptip>
              <span v-show='row.status==3'  :class='row.surplusDays<0?"gray":"green"'>点位中</span>
              <span v-show='row.status==4' class='gray'>故障中</span>
              <span v-show='row.status==5' class='gray'>维修中</span>
              <span v-show='row.status==6' class='gray'>报废</span>
              <span v-show='row.status==7' class='gray'>待激活</span>
          </template>
          <template slot-scope="{ row, index }" slot="time">
              <span v-show='row.activateDate' >{{row.activateDate}}</span>
              <span v-show='!row.activateDate' class='gray'>未激活</span>
          </template>
          <template slot-scope="{ row, index }" slot="stock">
              <input @click='' @keydown.enter='stockChange(row)' @change="stockChange(row)" class='stockInput' type="number" v-model='row.stockWarning' :disabled="row.surplusDays<0||channelId!=$store.state.user.userVo.channelId">
          </template>
          <template slot-scope="{ row, index }" slot="erweima">
            <img @click='erweimaClick(row)' :src="require('../../../assets/images/erweima.png')">
          </template>
          <template slot-scope="{ row, index }" slot="kaimen">
            <a class='lookDetails' @click='pushPlate(row)' :disabled="row.surplusDays<0||channelId!=$store.state.user.userVo.channelId">查看详情</a>
          </template>
          <template slot-scope="{ row, index }" slot="expireDate">
            <span v-if='row.surplusDays<0' class='red'>已到期</span>
            <span v-else>{{row.expireDate}}</span>
          </template>
          <template slot-scope="{ row, index }" slot="setHumidity">
            <template v-if='row.temperatureHumidityStatus'>
              <a v-if='row.machineHumidness&&row.machineTemperature' class='lookDetails' :disabled="row.surplusDays<0||channelId!=$store.state.user.userVo.channelId||!hasPerm('pos:dev:edit')"  @click='setHun(row,index,false)'>{{row.machineTemperature}}℃/{{row.machineHumidness}}%</a>
              <a v-else class='green lookDetails' :disabled="row.surplusDays<0||channelId!=$store.state.user.userVo.channelId" @click='setHun(row,index,true)'>去设定</a>
            </template>
            <span v-else>——</span>
          </template>
          <template slot-scope="{ row, index }" slot="newHumidity">
            <template v-if='row.temperatureHumidityStatus'>
              <template v-if='(row.currentTemperature||row.currentTemperature==0)||(row.currentHumidness||row.currentHumidness==0)'>
                <span v-if='row.currentTemperature||row.currentTemperature==0' :class='row.temperatureStatus?"green":"red"'>{{row.currentTemperature}}℃/</span><span v-if='row.currentHumidness||row.currentHumidness==0' :class='row.humidnessStatus?"green":"red"'>{{row.currentHumidness}}%</span>
              </template>
              <span v-else>——</span>
            </template>
            <span v-else>——</span>
          </template>
          </Table>
        </Table>
        <Page :total="total" show-elevator :current='pageNum' @on-change='pageChange' :page-size='pageSize' @on-page-size-change='sizeChange'  show-sizer/>
      </div>
      <!-- 新增弹框的模态框 -->
      <Modal v-model="newlyAdded" width="740" :title="showNewlyType=='xz'?'新增信息管理':'编辑信息管理'"  :mask-closable='false'>
        <Form ref="formValidate" class='newAddModal' :model="formValidate" :rules="ruleValidate" :label-width="120" inline>
          <FormItem label="设备类型" prop="remark" >
            <Input v-model.trim="formValidate.machineName" v-if='showNewlyType=="ck"&&formValidate.machineName' :disabled='showNewlyType=="ck"' placeholder="如：自助咖啡机"/>
            <Input v-model.trim="formValidate.remark" v-else :disabled='showNewlyType=="ck"' placeholder="如：自助咖啡机"/>
          </FormItem>
          <FormItem label="设备编码">
            <Input v-model.trim="formValidate.machineCode" :disabled='showNewlyType=="ck"||true' />
          </FormItem>
          <FormItem label="IMEI"  >
            <Input v-model.trim="formValidate.machineImei" :disabled='showNewlyType=="ck"' placeholder="请输入机器串号"/>
            <p class='ivu-form-item-error-tip'>'IMEI'为特殊选填项（有的话必须填）</p>
          </FormItem>
          <FormItem label="设备识别码" prop="headingCode" >
            <Input v-model.trim="formValidate.headingCode" :disabled='showNewlyType=="ck"||showNewlyType=="sh"' placeholder="请输入设备S/N编码"/>
          </FormItem>
          <FormItem label="摄像头编码">
            <Input v-model.trim="formValidate.cameraCode" :disabled='showNewlyType=="ck"' placeholder="请输入摄像头编码"/>
          </FormItem>
          <FormItem label="工控机code">
            <Input v-model.trim="formValidate.ipcCode" :disabled='showNewlyType=="ck"' placeholder="请输入工控机code"/>
          </FormItem>
          <FormItem label="工控机版本">
            <Input v-model.trim="formValidate.ipcVersion" :disabled='showNewlyType=="ck"' placeholder="请输入工控机版本"/>
          </FormItem>
          <FormItem label="钥匙编码">
            <Input v-model.trim="formValidate.keyCode" :disabled='showNewlyType=="ck"' placeholder="请输入钥匙编码"/>
          </FormItem>
          <FormItem label="设备来源">
            <Input v-model.trim="formValidate.machineOrigin" :disabled='showNewlyType=="ck"' placeholder="机器来源"/>
          </FormItem>
          <FormItem label="单片机code">
            <Input v-model.trim="formValidate.scmCode" :disabled='showNewlyType=="ck"' placeholder="请输入单片机code"/>
          </FormItem>
          <FormItem label="单片机版本号">
            <Input v-model.trim="formValidate.scmVersion" :disabled='showNewlyType=="ck"' placeholder="请输入单片机版本号"/>
          </FormItem>
          <FormItem label="屏幕编码">
            <Input v-model.trim="formValidate.screenNo" :disabled='showNewlyType=="ck"' placeholder="屏幕编码"/>
          </FormItem>
          <FormItem label="屏幕类型">
            <Select v-model="formValidate.screenType" :disabled='showNewlyType=="ck"'>
                <Option v-for="item in screenTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <!-- <FormItem label="使用类型">
            <Select v-model="formValidate.ownership" :disabled='showNewlyType=="ck"'  style="width:160px">
                <Option v-for="item in ownershipList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem> -->
        </Form>
         <div slot="footer">
          <Button type="text" size="large" @click='newlyAdded=false'>取消</Button>
          <Button type="primary" size="large" @click="Added(formValidate,'formValidate')" v-show='showNewlyType!="ck"'>确定</Button>
         </div>
      </Modal>
      <Modal
        v-model="importNewlyAdded"
        width="600"
        title="导入模板"
        :mask-closable="false"
      >
        <Form ref="importFormValidate" :model="importFormValidate" :rules="importRuleValidate" :label-width="120">
          <FormItem label="渠道" prop="channelId">
            <div  class='inputTree' @click='treeNewlyAdded=true'>{{importFormValidate.channelName}}</div>
          </FormItem>
          <FormItem label="机型" prop="machineType">
            <Select v-model="importFormValidate.machineType">
                <Option v-for="item in equipmentList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <FormItem label="自动生成货道" >
            <RadioGroup v-model="importFormValidate.roadExist">
              <Radio label="1">
                  <span>有</span>
              </Radio>
              <Radio label="0">
                  <span>无</span>
              </Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="导入模板" prop="imageAddress">
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
          <Button type="primary" size="large" @click="upload" :disabled='!file'>确定</Button>
        </div>
      </Modal>
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
      <!-- 利益分配 -->
      <Modal
        class='interest'
        v-model="interestNewlyAdded"
        width="750"
        title="利益分配"
        :mask-closable="false"
      >
        <template v-if='interestIsSet'>
          <Select @on-change='interestChange' v-model='initInterst' placeholder="模板" :clearable="false">
            <Option v-for="item in interestList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
          <Button type="error" v-show='initInterst&&runDate' @click="initInterstDel" style='float:right;margin-left:10px'>删除</Button>
          <div style="float:right">
            生效时间：<DatePicker @on-change='runDateTimeChange' :options="options" v-model='runDate'  type="datetime" format="yyyy-MM-dd HH:mm:ss" placeholder="时间选择" style="width: 200px" ></DatePicker>
          </div>
          <Divider />
          <interest-component
            :datas = 'interestDatas'
            :isDisabled = 'false'
            :receivablesList = 'receivablesList'
            :receivablesInfo = 'receivablesInfo'
            @delete = 'interestDel'
            @changeBen = 'changeBen'
          >
          </interest-component>
          <Button type="primary" v-show='interestDatas.length' size="large" @click='initInterestAdd'>新增</Button>
        </template>
        <template v-else>
          <template v-for='(v,i) in interestTemList'>
            <div style="margin-bottom:15px;overflow: hidden;">
              <span style="float:left;margin-top:7px;" v-if='v.status||v.status==0'>利益分配详情</span>
              <Select v-else @on-change='setInterestChange($event,i)' v-model="interestValue"  :placeholder="interestName?interestName:'模板'" :clearable="false">
                <Option v-for="item in interestList" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
              <Button type="error" v-if='v.status!=1' @click="initerestsDel(i,v)" style='float:right;margin-left:10px'>删除</Button>
              <div style="float:right;">
                生效时间：<DatePicker :options="options" @on-change='timeChange($event,i)' :disabled='v.status==1' v-model='v.effectDate' type="datetime" format="yyyy-MM-dd HH:mm:ss" placeholder="时间选择" style="width: 200px" ></DatePicker>
              </div>
            </div>
            <interest-component
              :datas.sync = 'v.details'
              :isDisabled = 'v.status==1'
              :receivablesList = 'receivablesList'
              :receivablesInfo = 'receivablesInfo'
              @changeBen = 'setChangeBen'
              @delete = 'interestsDelete'
              :cIndex = 'i' 
            >
            </interest-component>
            <Button type="primary" v-show='v.details&&v.details.length&&v.status!=1' size="large" @click='interestsAddItem(i)'>新增</Button>
            <Divider v-show='i==0' />
            <div>
            </div>
          </template>
          <Button type="primary" size="large" v-if='interestTemList.length<2' @click='interestAdd'>新增利益分配</Button>
        </template>
        <div slot="footer">
          <Button size="large" @click="interestNewlyAdded=false">取消</Button>
          <Button type="primary" size="large"  @click="interestSure">确定</Button>
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
        class='erweima'
        v-model="erweimaNewlyAdded"
        width="800"
        title="二维码下载"
        :mask-closable="false"
      >
        <img :src="erwemaImg" >
        <div slot="footer">
          <Button size="large" @click="erweimaNewlyAdded=false">取消</Button>
          <Button type="success" size="large"  @click="erweimaDown">下载</Button>
        </div>
      </Modal>
      <table-modal
        title = '开门记录'
        :newlyAdded = 'openDoorNewlyAdded'
        :datas = 'openDoorData'
        :columns = 'openDoorColumns'
        :pageSize = 'openPageSize'
        :total = 'openTotal'
        :pageNum = 'openPageNum'
        @pageChange = 'openPageChange'
        @sizeChange = 'openSizeChange'
        @sure = 'openDoorCancel'
        @cancel = 'openDoorCancel'
      ></table-modal>
      <Modal
        v-model="humidityNewlyAdded"
        title="温度/湿度设置"
        :mask-closable="false"
      >
        <Form ref="humidityFormValidate" :model="humidityFormValidate" :rules="humidityRuleValidate" :label-width="60">
          <FormItem label="温度" prop="machineTemperature">
            <InputNumber
              :max="60"
              :min="-5"
              v-model="humidityFormValidate.machineTemperature"
              :formatter="value => `${value}℃`"
              :parser="value => value.replace('℃', '')"
              @on-blur="temperatureChange"
            ></InputNumber>
            <span style='margin:0px 20px' class='gray'>温度范围：-5~60℃，正常波动：+</span>
            <InputNumber
              v-model="humidityFormValidate.rangeTemperature"
              :formatter="value => `${value}℃`"
              :parser="value => value.replace('℃', '')"
            ></InputNumber>
          </FormItem>
          <FormItem label="湿度" prop="machineHumidness">
            <InputNumber
              :max="50"
              :min="0"
              v-model="humidityFormValidate.machineHumidness"
              :formatter="value => `${value}%`"
              :parser="value => value.replace('%', '')"
              @on-blur="humidnessChange"
            ></InputNumber>
            <span style='margin:0px 20px' class='gray'>湿度范围：0~50 %，正常波动：+</span>
            <InputNumber
              class='gray'
              v-model="humidityFormValidate.rangeHumidness"
              :formatter="value => `${value}%`"
              :parser="value => value.replace('%', '')"
              @on-blur=""
            ></InputNumber>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button size="large" @click="humidityNewlyAdded=false">取消</Button>
          <Button type="primary" size="large"  @click="humiditySrue(humidityFormValidate,'humidityFormValidate')">确定</Button>
        </div>
      </Modal>
  </div>
  <div v-else>
    <device-component
      :priceTemplate = 'priceTemplate'
      :channelId = 'priceChannelId'
      :selectList = 'selectList'
      :machineCode = 'machineCode'
      :query = 'query'
      @toBack =  'toBack'
      ref='device'
    ></device-component>
  </div>
  
</template>

<script>
import { netWorkHttp,netWorkGoods,netWorkDevice,UploadExcel} from "@/api/data";
import channelTree from '../components/channelTree';
import goodWayGoodsTree  from '@/view/custom/components/goodWayGoodsTree';
import transferDevice  from '@/view/custom/components/transferDevice';
import deviceComponent from '@/view/custom/components/deviceComponent';
import  modalTable from "@/view/custom/components/modalTable";
import  interestComponent from "@/view/custom/components/interestComponent";
import format from "@/plugin/format.js"; //格式化时间YYYY-MM-DD
import  deleteComponent from "@/view/custom/components/deleteComponent";
import  tableModal from "@/view/custom/components/tableModal";
export default {
  name:'deviceInfo',
  components: {
    goodWayGoodsTree,
    channelTree,
    transferDevice,
    deviceComponent,
    modalTable,
    interestComponent,
    deleteComponent,
    tableModal
  },
  data(){
    return{
      openPageNum:1,
      openTotal:null,
      openPageSize:10,
      humidityRuleValidate: {
        machineTemperature: [
          {
            required: true,
            message: "不能为空",
            trigger: "blur",
            type:'number'
          }
        ],
        machineHumidness: [
          {
            required: true,
            message: "不能为空",
            trigger: "blur",
            type:'number'
          }
        ],
      },
      humidityFormValidate:{
        machineHumidness:null,
        machineTemperature:null,
        rangeHumidness:5,
        rangeTemperature:5
      },
      humidityNewlyAdded:false,
      initInterst:null,
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
      routeName:null,
      erweimaMachineCode:null,
      erwemaImg:null,
      erweimaNewlyAdded:false,
      modal_loading: false, //删除的loading
      delID: null, //删除的ID
      delIndex: null, //删除的索引
      modalDel: false,
      ownershipList:[
        {value:1,label:'购买'},
        {value:2,label:'租用'},
      ],
      options:{
        disabledDate (date) {
          return date && date.valueOf() < Date.now() - 86400000;
        },
      },
      interestTemList:[],
      runDate:null,
      receivablesInfo:[],
      receivablesList:[],
      priceChannelId:null,
      templateId:null,
      interestName:null,
      interestDatas:[],
      interestIsSet:false,
      interestValue:null,
      interestList:null,
      interestNewlyAdded:null,
      priceTemplate:null,
      selectList:[],
      query:null,
      isDetail:false,
      positionTabs:'pick',
      positionName:null,
      rowData:null, //行信息
      historyData:[],
      historyPageNum:1,
      historyTotal:null,
      historyPageSize:10,
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
      transferNewlyAdded:null,
      tableRowData:null,
      screenTypeList:[
        {value:1,label:'竖屏'},
        {value:2,label:'横屏'},
        {value:3,label:'无屏幕'},
      ],
      formValidate:{ //新增字段
        machineType:null,
        machineCode:null,
        machineImei:null,
        status:0,
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
        ownership:3,
        headingCode:null,
      },
      ruleValidate: {
        remark: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          },
          { max: 8, message: "最多8个字符", trigger: "blur" }
        ],
        headingCode:[
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          },
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
        channelId:null,
        channelName:null,
        operator:null,
        operatorName:null,
        roadExist:'1',
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
          title: '货道商品',
          slot: 'cargoWay',
          align: 'center',
          tooltip:true
        },
        {
          title: '利益分配',
          slot: 'interest',
          align: 'center',
          tooltip:true
        },
        {
          title: '设备网络状态',
          slot: 'network',
          align: 'center',
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
          tooltip:true
        },
        {
          title: '激活时间',
          slot: 'time',
          align: 'center',
          tooltip:true
        },
        {
          title: '到期时间',
          slot: 'expireDate',
          align: 'center',
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
          title: '库存预警设置',
          slot: 'stock',
          align: 'center',
          tooltip:true
        },
        {
          title: '设定温度/湿度',
          slot: 'setHumidity',
          align: 'center',
          tooltip:true
        },
        {
          title: '当前温度/湿度',
          slot: 'newHumidity',
          align: 'center',
          tooltip:true
        },
        {
          title: '下载二维码',
          slot: 'erweima',
          align: 'center',
          tooltip:true
        },
        {
          title: '启用状态',
          slot: 'deviceStatus',
          align: 'center',
          width:60,
          tooltip:true
        },
        
        {
          title: '操作',
          slot: 'edit',
          align: 'center',
          width:160,
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
    pushPlate(row){
      this.rowData = row;
      this.openTheDoor();
    },
    openPageChange(value){
      this.openPageNum = value;
      this.openTheDoor();
    },
    openSizeChange(value){
      this.openPageSize = value;
      this.openTheDoor();
    },
    temperatureChange(){
      const v = this.humidityFormValidate.machineTemperature;
      if(v<-5){
        this.$set(this.humidityFormValidate,'machineTemperature',-5)
      }else if(v>60){
        this.$set(this.humidityFormValidate,'machineTemperature',60)
      }
    },
    humidnessChange(){
      const v = this.humidityFormValidate.machineHumidness;
      if(v<0){
        this.$set(this.humidityFormValidate,'machineHumidness',0)
      }else if(v>50){
        this.$set(this.humidityFormValidate,'machineHumidness',50)
      }
    },
    humiditySrue({machineHumidness,machineTemperature,rangeHumidness,rangeTemperature},name){
      this.$refs[name].validate(valid => {
        if (valid) {
          let {networkStatus,machineCode,currentTemperature,currentHumidness,id,machineTemperature:oldMachineTemperature,machineHumidness:oldMachineHumidness,humitureId} = this.rowData
          const data ={
            networkStatus,
            machineCode,
            currentTemperature,
            currentHumidness,
            machineHumidness,
            machineTemperature,
            rangeHumidness,
            rangeTemperature,
            id
          }
          if(humitureId){//修改
            netWorkDevice('/machineApply/modifyMachineApply',data).then(res => {
              this.getPageDatas();
              this.humidityNewlyAdded = false;
              this.$Message.success('操作成功');
            })
          }else{
            netWorkDevice('/machineApply/addMachineApply',data).then(res => {
              this.getPageDatas();
              this.humidityNewlyAdded = false;
              this.$Message.success('操作成功');
            })
          }
        }
      })
    },
    async setHun(row,index,isSet){
      console.log(row)
      await this.initialization('humidityFormValidate');
      if(!isSet){
        this.$set(this.humidityFormValidate,'machineHumidness',row.machineHumidness)
        this.$set(this.humidityFormValidate,'machineTemperature',row.machineTemperature)
      }
      this.humidityNewlyAdded = true;
      this.rowData = row;
    },
    devDelete(row,index){
      if(row.status!=3){
        if(row.stock==null||row.stock>0){
          this.modalDel=true;
          this.delID=row.id;
          this.delIndex=index
        }else{
          this.$Message.error("存在商品不能删除！");
        }
      }else{
        this.$Message.error("在点位中不能被删除！");
      }
    },
    trBgColor(row,index){
      if(row.surplusDays<0){
        return 'trBgColor';
      }
      return '';
    },
    clickQuery(){
      this.pageNum = 1;
      this.getPageDatas();
    },
    reset(){
      this.routeName = null;
      this.pageNum = 1;
      this.total = null;
      this.pageSize = 15;
      this.name = null;
      this.channelId = this.$store.state.user.channelId;
      this.getPageDatas();
      this.$refs.channelTree.getTreeData();
    },
    interestsDelete({index,cIndex}){
      this.interestTemList[cIndex].details.splice(index,1);
      console.log(index,i)
    },
    initerestsDel(index,{status,allotId}){
      if(status||status==0){
        const url =`/benefitMachine/delete?id=${allotId}`
        netWorkDevice(url,null,'delete').then(res => {
          this.getPageDatas();
          this.interestTemList.splice(index,1);
          if(!this.interestTemList.length){
            this.getInteresList(this.rowData);
            this.interestIsSet = true;
          } 
        })
      }else{
        this.interestTemList.splice(index,1);
        if(!this.interestTemList.length){
          this.getInteresList(this.rowData);
          this.interestIsSet = true;
        }
      }
      
    },
    initInterestAdd(){
      let item = {
        benefitType:2,
        benefitPercent:0,
        accountId:null,
        payee:null,
        account:null
      }
      if(this.isNotNull(this.interestDatas)){
      this.interestDatas.splice(this.interestDatas.length-1, 0, item)
      }else{
        this.$Message.error("请先完成上条数据！");
      }
    },
    interestsAddItem(index){
      let item = {
        benefitType:2,
        benefitPercent:0,
        accountId:null,
        payee:null,
        account:null
      }
      if(this.isNotNull(this.interestTemList[index].details)){
      this.interestTemList[index].details.splice(this.interestTemList[index].details.length-1, 0, item)
      }else{
        this.$Message.error("请先完成上条数据！");
      }
    },
    isNotNull(ary){
      return ary[ary.length-2].benefitType&&ary[ary.length-2].accountId
    },
    initInterstDel(){
      this.initInterst = null;
      this.runDate = null;
    },
    runDateTimeChange(time){
      if(new Date(time).valueOf()<Date.now()){ //小于当前时间
        this.runDate = format(new Date((Date.now())+(5*60*1000)), "YYYY-MM-DD HH:mm:ss");
      }
    },
    timeChange(time,index){
      if(new Date(time).valueOf()<Date.now()){ //小于当前时间
        this.$set(this.interestTemList[index],'effectDate',format(new Date((Date.now())+(5*60*1000)), "YYYY-MM-DD HH:mm:ss"))
      }
    },
    openTheDoor(){
      const data ={
        pageNum:this.openPageNum,
        pageSize:this.openPageSize,
        channelId:this.channelId,
        machineCode:this.rowData.machineCode
      }
      netWorkDevice('/positionDoor/list',data).then(res => {
        this.openPageNum = res.result.pageNum;
        this.openTotal = res.result.total;
        this.openDoorData = res.result.list
        this.openDoorNewlyAdded =  true;
      })
    },
    openDoorCancel(){
      this.openDoorNewlyAdded = false;
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
    erweimaDown(){
      this.downloadFile(this.erweimaMachineCode,this.erwemaImg);
      this.erweimaNewlyAdded =  false;
    },
    erweimaClick({machineCode}){
      this.erweimaMachineCode = machineCode;
      const data = {
        machineCode,
        wight:200,
        high:200
      }
      netWorkDevice('/machineInfo/createMachineQRCode',data).then(res => {
        this.erwemaImg = res.result
        this.erweimaNewlyAdded =  true;
      })
    },
    stockChange(row){
      if(row.stockWarning){
        row.stockWarning = parseInt(row.stockWarning)
        const data = {
          id:row.id,
          stockWarning:row.stockWarning
        }
        netWorkDevice('/machineInfo/modify',data).then(res => {
          this.$Message.success("修改成功");
        })
      }
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
    setChangeBen(res){
      let {data,i:index,cIndex} = res;
      this.$set(this.interestTemList[cIndex].details[index],'accountId',data.value)
      this.$set(this.interestTemList[cIndex].details[index],'payee',data.payee)
      this.$set(this.interestTemList[cIndex].details[index],'account',data.account)
    },
    setInterestChange(value,index){
      let data = {
        templateId:value,
        pageNum:1,
        pageSize:100,
      }
      netWorkDevice('/benefitDetail/list',data).then(res => {
        this.$set(this.interestTemList[index],'details',res.result.list);
      })
    },
    changeBen(res){
      let {data,i:index} = res;
      this.$set(this.interestDatas[index],'accountId',data.value)
      this.$set(this.interestDatas[index],'payee',data.payee)
      this.$set(this.interestDatas[index],'account',data.account)
    },
    interestChange(value){
      if(value){
        this.templateId = value;
        let data = {
          templateId:value,
          pageNum:1,
          pageSize:100,
        }
        netWorkDevice('/benefitDetail/list',data).then(res => {
          this.interestDatas = res.result.list;
          this.interestDatas.forEach(v=>{
            if(v.accountId) v.accountId = v.accountId.toString()
          })
        })
      }else{
        this.interestDatas = [];
      }
    },
    interestAdd(){
      this.getInteresList(this.rowData).then(()=>{
        this.interestValue = null;
        let obj = {
          channelId:this.channelId,
          operator:this.operator,
          operatorName:this.operatorName,
          positionId:this.rowData.positionId,
        };
        this.interestTemList = [...this.interestTemList,obj]
      })
    },
    interestSure(){
      if(this.interestIsSet){  //去设定
        if(this.runDate){
          if(this.isNotNull(this.interestDatas)){
            let list = [
              {effectDate:format(this.runDate, "YYYY-MM-DD hh:mm:ss"),details:this.interestDatas}
            ];
            const data = {
              list,
              channelId:this.channelId,
              operator:this.operator,
              operatorName:this.operatorName,
              positionId:this.rowData.positionId,
            }
            netWorkDevice('/benefitMachine/addOrModify',data).then(res => {
              this.getPageDatas();
              this.interestNewlyAdded=false;
              this.$Message.success('操作成功');
            })
          }else{
            this.$Message.error("请先完成数据！");
          }
        }else{
          this.$Message.error("请先选择生效时间！");
        }
      }else{
        const judge = this.interestTemList.every((v)=>v.effectDate);
        if(judge){
          console.log(this.interestTemList)
          if(this.isNotNull(this.interestTemList[0].details)&&this.isNotNull(this.interestTemList[1].details)){
            this.interestTemList.map((v)=>{
              v.effectDate = format(v.effectDate, "YYYY-MM-DD HH:mm:ss");
            });
            const data = {
              list:this.interestTemList,
              channelId:this.channelId,
              operator:this.operator,
              operatorName:this.operatorName,
              positionId:this.rowData.positionId,
            }
            netWorkDevice('/benefitMachine/addOrModify',data).then(res => {
              this.getPageDatas();
              this.interestNewlyAdded=false;
              this.$Message.success('操作成功');
            })
          }else{
            this.$Message.error("请先完成数据！");
          }
        }else{
          this.$Message.error("请先选择生效时间！");
        }
      }
    },
    interestDel({index}){
      this.interestDatas.splice(index, 1)
    },
    getInteresList(row){
      let url = `/benefitTemplate/queryByChannelId?channelId=${row.channelId}`;
      return  netWorkDevice(url,null,'get').then(res => {
        this.interestList = res.result;
        this.interestNewlyAdded = true;
      })
    },
    toLinkInterest(row,value){
      this.rowData = row;
      this.interestDatas = []; //初始化
      this.initInterst = null;
      this.interestIsSet = value;
      this.interestName = null;
      if(value){  //去设定
        this.interestValue = null;
        this.runDate = null;
        if(row.positionId){
          this.getInteresList(this.rowData)
        }else{
          this.$Message.error("请先设置点位！");
        }
        
      }else{
        this.interestName = row.templateName;
        const url = `/benefitMachine/list?positionId=${row.positionId}&&channelId=${row.channelId}`
        netWorkDevice(url,null,'get').then(res => {
          this.interestTemList = res.result.list;
          this.interestNewlyAdded = true;
        })
      }
      
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
          if(!this.query.isHasStock){
            this.getselectList(row);
          }
          if( this.query.list.length){
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
          }else{
            this.query.list1.forEach((v,i)=>{
              v.AddMachineTypeRoadDto.forEach((val,index)=>{
                val.roadType =  val.roadType?val.roadType.toString():'1';
                val.rowData =  val.rowData?val.rowData:{};
                setTimeout(()=>{  //延时让组件先渲染 否则为空
                  if(this.query.list1[i].AddMachineTypeRoadDto[index].merged){
                    if(this.query.list1[i].AddMachineTypeRoadDto[index].roadStatus==1){
                      this.query.setWidthAfterNum = index;
                    }
                    this.$refs.device.setWidthAfter(i,index)
                  }
                },1)
              })
            })
          }
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
    toLink(row=this.rowData){
      this.rowData = row;
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
    toBack(){
      this.getPageDatas();
      this.isDetail = false;
      this.query = null;
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
    positionInfo(row,index,value){
      this.isSetPosition  = value;
      this.positionIndex = index;
      this.positionTabs = 'pick';
      this.rowData = row;
      this.priceTemplate = row.priceTemplate;
      this.pointionNewlyAdded = true;
      this.getPotionData()
    },
    enable(row,index,isEnable){
      let {enable,id} = row;
      let data = {
        enable:enable==1?0:1,
        id
      }
      if(isEnable){
        if(row.status==0||row.status==2){
          this.$Message.error('审核通过后才能启用！');
          return
        }else if(row.status==1||row.status==7){
          this.$Message.error('请先绑定点位！');
          return
        }else if(row.status==3){
          return netWorkDevice("/machineInfo/modify", data).then(res => {
            this.$set(this.datas[index],'enable',data.enable)
            this.$Message.success('操作成功');
          })
        }else{
          this.$Message.error('请等待维修结果！');
          return
        }
      }
      netWorkDevice("/machineInfo/modify", data).then(res => {
        this.$set(this.datas[index],'enable',data.enable)
        this.$Message.success('操作成功');
      })
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
      console.log(row)
      this.tableRowData = row;
    },
    async showNewlyAdded(type,index,row){
      await this.initialization('formValidate');
      this.showNewlyType = type;
      this.formValidate = { //新增字段
        machineType:null,
        machineCode:null,
        machineImei:null,
        status:0,
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
        ownership:3,
        headingCode:null,
      };
      if(type!='xz'){
        console.log(row)
        this.formValidate = JSON.parse(JSON.stringify(row));
        this.formValidate.status = 0;
        this.formValidate.enable = this.formValidate.enable+'';
        this.formValidate.machineType = this.formValidate.machineType+'';
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
            headingCode
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
              operator:this.operator,
              operatorName:this.operatorName,
              channelId:this.channelId,
              enable,
              ownership,
              headingCode
            };
            netWorkDevice("/machineInfo/addCustom", data).then(res => {
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
              operator:this.operator,
              operatorName:this.operatorName,
              channelId:this.channelId,
              enable,
              ownership,
              headingCode,
              id:value.id
            };
            netWorkDevice("/machineInfo/modify", data).then(res => {
              this.getPageDatas(); //刷新页面
              this.newlyAdded = false;
              this.$Message.success("修改成功");
            })
          }
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
    upload () {
      console.log(this.uploadData)
      this.$refs.upload.post(this.file);
      this.file = null;
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
    clickTreeRow(value){
      if(value){
        this.channelId = value.id;
        this.tableRowData = null;
        this.pageNum = 1;
        this.getPageDatas();
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
    getEquipment(){
      let url = '/machineType/queryNameByCategoryId'
      netWorkDevice(url, null,'get').then(res => {
        this.equipmentList = res.result
      })
    },
    getBenefitData(channelId){
        let url = `/benefitAccount/getBox?channelId=${channelId?channelId:this.channelId}`
        return netWorkDevice(url, null,'get').then(res => {
          this.receivablesList = res.result.boxVoList;
          this.receivablesInfo = res.result.list;
        })
    },
    getPageDatas() {
      let data = {
        channelId:this.channelId,
        userId:this.operator,
        type:this.operatorType,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        machineCode:this.name,
        routeName:this.routeName,
        managerRoute:this.$store.state.user.userVo.managerRoute
      };
      netWorkDevice("/machineInfo/list", data).then(res => {
        this.pageNum = res.result.pageNum;
        this.total = res.result.total;
        this.datas = res.result.list;
      })
    },
  },
  beforeRouteLeave (to, from, next) {
    this.isDetail = false;
    next();
  },
  mounted(){
    this.getPageDatas();
    this.getEquipment();
    this.getBenefitData();
    // [1,117].map(v=>{
    //   console.log(document.querySelector())
    // })
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
    .ivu-input-wrapper{
      width: 200px;
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
</style>
