<template>
  <div class="channelMerchants">
    <div class="leftBox">
      <!-- 渠道树 -->
      <channel-tree @clickTreeRow="clickTreeRow"></channel-tree>
    </div>
    <div class="rightDiv">
      <Input v-model="channelName" style="margin-right:10px" placeholder="商户名称" clearable />
      <Select v-model="auditStatus" clearable placeholder="审核状态" style="margin-right:10px;width:100px">
        <Option
          v-for="item in auditStatusList"
          :value="item.value"
          :key="item.value"
        >{{ item.label }}</Option>
      </Select>
      <Select v-model="accountType" clearable placeholder="注册类型" style="margin-right:10px;width:100px">
        <Option
          v-for="item in accountTypeList"
          :value="item.value"
          :key="item.value"
        >{{ item.label }}</Option>
      </Select>
      <Button type="primary" @click="searchMerchant" v-if="hasPerm('sys:merchantinfoMang:see')">查询</Button>
      <Button type="primary" @click="reset" v-if="hasPerm('sys:merchantinfoMang:see')">重置</Button>
      <Table highlight-row :columns="columns" :data="dataTable" border>
        <template slot-scope="{ row, index }" slot="businessScope">
          <span>{{row.businessScope|businessScopeText|text(saleList)}}</span>
        </template>
        <template slot-scope="{ row, index }" slot="operation">
          <!-- 按钮 -->
          <Button
            type="primary"
            size="small"
            v-if="hasPerm('sys:merchantinfoMang:check')&&(row.auditStatus==4||row.auditStatus==3||row.auditStatus==2)"
            @click="checkModal(row,'bj')"
            :disabled="row.auditStatus==2"
          >编辑</Button>

          <Button
            type="success"
            size="small"
            style="margin-right: 0px"
            @click="checkModal(row,'sh')"
            v-if="hasPerm('sys:merchantinfoMang:check')&&row.auditStatus==2"
          >&nbsp&nbsp审核&nbsp&nbsp</Button>

          <Button
            size="small"
            style="margin-right: 0px"
            v-if="hasPerm('sys:merchantinfoMang:check')&&(row.auditStatus==4||row.auditStatus==3)"
            disabled
          >已审核</Button>

          <!-- 删除按钮 -->
          <Button type="error" size="small" @click="modalDel=true;delID=row.id" v-if="false">删除</Button>
        </template>
        <!-- 状态 -->
        <template slot-scope="{ row, index }" slot="status">
          <span v-show="row.auditStatus==1" style="color:#2d8cf0">待提交</span>
          <span v-show="row.auditStatus==2" style="color:#ffbd72">待审核</span>
          <span v-show="row.auditStatus==3" style="color:#ed4014">审核失败</span>
          <span v-show="row.auditStatus==4" style="color:#19be6b">审核通过</span>
        </template>
      </Table>
      <Page
        :page-size="pageSize"
        :total="total"
        show-elevator
        :current="pageNum"
        @on-change="pageChange"
        @on-page-size-change="sizeChange"
        show-sizer
      />
      <!-- 删除 -->
      <delete-component
        :modalDel="modalDel"
        :del_loading="modal_loading"
        @cancel="delCancel"
        @del="del"
      ></delete-component>
    </div>
    <!-- 弹框的模态框 -->
    <Modal v-model="isShow" :mask-closable="false" :title="modalTitle" width="800">
      <!-- 个人注册 -->
      <div v-show="tabIndex==1" :class="{selected:tabIndex==1}">
        <Form ref="formValidatePre" :model="formValidatePre" inline :label-width="120">
          <div style="margin-bottom:10px">
            <strong>基础信息</strong>
          </div>
          <FormItem label="商户名称">
            <Input v-model="formValidatePre.channelName" placeholder="商户名称" disabled></Input>
          </FormItem>
          <FormItem label="真实姓名">
            <Input v-model="formValidatePre.name" placeholder="真实姓名" disabled></Input>
          </FormItem>
          <FormItem label="手机号码">
            <Input v-model="formValidatePre.phone" placeholder="手机号码" disabled></Input>
          </FormItem>
          <FormItem label="身份证号码">
            <Input v-model="formValidatePre.card" placeholder="身份证号码" disabled></Input>
          </FormItem>
          <FormItem label="区域" class="NewareaNames">
            <Cascader
              disabled
              style="width: 220px"
              :data="cityData"
              v-model="formValidatePre.NewareaNames"
              change-on-select
            ></Cascader>
          </FormItem>
          <FormItem label="详细地址">
            <Input v-model="formValidatePre.address" placeholder="详细地址" disabled></Input>
          </FormItem>
          <FormItem label="销售范围" style="margin-bottom:20px">
            <Select
              v-model="formValidatePre.sale"
              @on-change="changeValue"
              multiple
              style="width:575px"
              filterable
            >
              <Option
                v-for="item in saleList"
                :label="item.label"
                :value="item.value"
                :key="item.id"
              ></Option>
            </Select>
          </FormItem>
          <Divider />
          <div style="margin:10px 0">
            <strong class="receivablesInfo">收款信息</strong>
            <!-- <RadioGroup v-model="isReceiveType">
              <Radio label="1" disabled>
                <span>支付宝</span>
              </Radio>
              <Radio label="2" disabled>
                <span>银行卡</span>
              </Radio>
            </RadioGroup>-->
          </div>
          <FormItem label="收款人" style="margin-bottom:20px">
            <Input v-model="formValidatePre.receiveName" placeholder="请输入收款人" disabled></Input>
          </FormItem>
          <FormItem label="收款人身份证号码" style="margin-bottom:10px">
            <Input v-model="formValidatePre.receiveCard" placeholder="请输入收款人身份证号码" disabled></Input>
          </FormItem>
          <FormItem style="margin-bottom:20px" :label="this.isReceiveType==2?'收款账号':'支付宝账号'">
            <Input v-model="formValidatePre.receiveAccount" placeholder="请输入账号" disabled></Input>
          </FormItem>
          <FormItem label="开户行" v-show="this.isReceiveType=='2'" style="margin-bottom:20px">
            <Input v-model="formValidatePre.receiveBank" placeholder="请输入开户行" disabled></Input>
          </FormItem>
          <Divider />
          <div style="margin:10px 0">
            <strong>用户信息</strong>
          </div>
          <FormItem label="用户名称">
            <Input v-model="formValidatePre.userName" placeholder="登陆账号用户名" disabled></Input>
          </FormItem>
          <FormItem label="密码">
            <Input v-model="formValidatePre.password" type="password" placeholder="密码" disabled></Input>
          </FormItem>
          <Divider />
          <div class="foot">
            <div class="attestation">
              <strong>资质认证</strong>
              <div class="check-text">(上传图片的大小不能超过2M，推荐格式:png/jpg)</div>
              <FormItem label class="card_image">
                <template>
                  <img
                    :src="formValidatePre.frontAddress"
                    style="width:130px;height:100px"
                    class="uploadImg"
                    v-show="formValidatePre.cardFront"
                  />
                  <div style="padding: 20px 0" v-show="!formValidatePre.cardFront">
                    <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                    <p>手持身份证正面</p>
                    <a>查看示例</a>
                  </div>
                </template>
              </FormItem>
              <FormItem label class="card_image">
                <template>
                  <img
                    :src="formValidatePre.backAddress"
                    style="width:130px;height:100px"
                    class="uploadImg"
                    v-show="formValidatePre.cardBack"
                  />
                  <div style="padding: 20px 0" v-show="!formValidatePre.cardBack">
                    <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                    <p>手持身份证反面</p>
                    <a>查看示例</a>
                  </div>
                </template>
              </FormItem>
              <FormItem label class="card_image">
                <template>
                  <img
                    :src="formValidatePre.otherAddress"
                    style="width:130px;height:100px"
                    class="uploadImg"
                    v-show="formValidatePre.other"
                  />
                  <div style="padding: 20px 0" v-show="!formValidatePre.other">
                    <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                    <p>其他</p>
                  </div>
                </template>
              </FormItem>
            </div>
          </div>
          <Divider />
          <div class="other" style="margin:10px 0">
            <strong>商户设置</strong>
          </div>
          <div class="setMerchant">
            <div style="height:40px">
              <Checkbox
                style="margin-top:8px"
                v-model="formValidatePre.receiveTerminal"
                @on-change="changeReceive"
              >商户收款</Checkbox>
              <FormItem label="上级商户" prop="parentChannelName" style="float:right">
                <span v-if="isSpan">{{formValidatePre.parentChannelName}}</span>
                <Cascader
                  v-if="!isSpan"
                  :data="treeData"
                  v-model="formValidatePre.newParentIds"
                  @on-change="selectChange"
                  :render-format="format"
                  change-on-select
                ></Cascader>
              </FormItem>
            </div>
            <Divider />
            <Table :columns="columnsSale" :data="saleData">
              <!-- 抽成比例 -->
              <template slot-scope="{ row, index }" slot="businessScope">
                <InputNumber
                  :disabled="receiveTerminal"
                  :max="100"
                  :min="row.customerRebate+row.recommenderRebate"
                  v-model="row.benefitPercent"
                  :formatter="value => `${value}%`"
                  :parser="value => value.replace('%', '')"
                  @on-change="changeInputNumber(row,index)"
                  @on-blur="blurInputNumber(row,index)"
                ></InputNumber>
              </template>
              <!-- 开关 -->
              <template slot-scope="{ row, index }" slot="activityScopee">
                <i-switch v-model="row.activityAuthority" @on-change="changeSwitch(row,index)" />
                <span v-show="row.activityAuthority" style="color:#2d8cf0">&nbsp开通</span>
                <span v-show="!row.activityAuthority">&nbsp关闭</span>
              </template>
            </Table>
          </div>
        </Form>
      </div>

      <!-- 企业注册 -->
      <div v-show="tabIndex==2" :class="{selected:tabIndex==2}">
        <Form ref="formValidateEnt" :model="formValidateEnt" inline :label-width="120">
          <div style="margin-bottom:10px">
            <strong>基础信息</strong>
          </div>
          <FormItem label="公司名称">
            <Input v-model="formValidateEnt.companyName" placeholder="公司名称" disabled></Input>
          </FormItem>
          <FormItem label="法人姓名">
            <Input v-model="formValidateEnt.name" placeholder="法人姓名" disabled></Input>
          </FormItem>
          <FormItem label="手机号码">
            <Input v-model="formValidateEnt.phone" placeholder="手机号码" disabled></Input>
          </FormItem>
          <FormItem label="公司税号">
            <Input v-model="formValidateEnt.companyNo" placeholder="公司税号" disabled></Input>
          </FormItem>
          <FormItem label="区域" class="NewareaNames">
            <Cascader
              disabled
              style="width: 220px"
              :data="cityData"
              v-model="formValidateEnt.NewareaNames"
              change-on-select
            ></Cascader>
          </FormItem>
          <FormItem label="详细地址">
            <Input v-model="formValidateEnt.address" placeholder="详细地址" disabled></Input>
          </FormItem>
          <FormItem label="销售范围" style="margin-bottom:20px">
            <Select
              v-model="formValidateEnt.sale"
              @on-change="changeValue"
              multiple
              style="width:575px"
            >
              <Option
                v-for="item in saleList"
                :label="item.label"
                :value="item.value"
                :key="item.id"
              ></Option>
            </Select>
          </FormItem>
          <Divider />
          <div style="margin:10px 0">
            <strong class="receivablesInfo">收款信息</strong>
            <!-- <RadioGroup v-model="isReceiveType">
              <Radio label="1" disabled>
                <span>支付宝</span>
              </Radio>
              <Radio label="2" disabled>
                <span>银行卡</span>
              </Radio>
            </RadioGroup>-->
          </div>
          <FormItem label="收款人" style="margin-bottom:20px">
            <Input v-model="formValidateEnt.receiveName" placeholder="请输入收款人" disabled></Input>
          </FormItem>
          <FormItem label="收款人身份证号码" style="margin-bottom:10px">
            <Input v-model="formValidateEnt.receiveCard" placeholder="请输入收款人身份证号码" disabled></Input>
          </FormItem>
          <FormItem :label="this.isReceiveType==2?'收款账号':'支付宝账号'" style="margin-bottom:20px">
            <Input v-model="formValidateEnt.receiveAccount" placeholder="请输入收款账号" disabled></Input>
          </FormItem>
          <FormItem
            label="开户行"
            v-show="this.isReceiveType=='2'?true:false "
            style="margin-bottom:20px"
          >
            <Input v-model="formValidateEnt.receiveBank" placeholder="请输入开户行" disabled></Input>
          </FormItem>
          <Divider />
          <div style="margin:10px 0">
            <strong>用户信息</strong>
          </div>
          <FormItem label="用户名称">
            <Input v-model="formValidateEnt.userName" placeholder="登陆账号用户名" disabled></Input>
          </FormItem>
          <FormItem label="密码">
            <Input v-model="formValidateEnt.password" type="password" placeholder="请输入密码" disabled></Input>
          </FormItem>
          <Divider />
          <div class="foot">
            <div class="attestation">
              <strong>资质认证</strong>
              <div class="check-text">(上传图片的大小不能超过2M，推荐格式:png / jpg)</div>
              <FormItem label class="card_image">
                <template>
                  <img
                    :src="formValidateEnt.licenseAddress"
                    style="width:130px;height:100px"
                    class="uploadImg"
                    v-show="formValidateEnt.license"
                  />
                  <div style="padding: 20px 0" v-show="!formValidateEnt.license">
                    <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                    <p>营业执照</p>
                    <p>(三证合一)</p>
                  </div>
                </template>
              </FormItem>
              <FormItem label class="card_image">
                <template>
                  <img
                    :src="formValidateEnt.openAccountAddress"
                    style="width:130px;height:100px"
                    class="uploadImg"
                    v-show="formValidateEnt.openAccount"
                  />
                  <div style="padding: 20px 0" v-show="!formValidateEnt.openAccount">
                    <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                    <p>开户许可证</p>
                  </div>
                </template>
              </FormItem>
              <FormItem label class="card_image">
                <template>
                  <img
                    :src="formValidateEnt.frontAddress"
                    style="width:130px;height:100px"
                    class="uploadImg"
                    v-show="formValidateEnt.cardFront"
                  />
                  <div style="padding: 20px 0" v-show="!formValidateEnt.cardFront">
                    <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                    <p>手持身份证正面</p>
                    <a>查看示例</a>
                  </div>
                </template>
              </FormItem>
              <FormItem label class="card_image">
                <template>
                  <img
                    :src="formValidateEnt.backAddress"
                    style="width:130px;height:100px"
                    class="uploadImg"
                    v-show="formValidateEnt.cardBack"
                  />

                  <div style="padding: 20px 0" v-show="!formValidateEnt.cardBack">
                    <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                    <p>手持身份证反面</p>
                    <a>查看示例</a>
                  </div>
                </template>
              </FormItem>
              <FormItem label class="card_image">
                <template>
                  <img
                    :src="formValidateEnt.otherAddress"
                    style="width:130px;height:100px"
                    class="uploadImg"
                    v-show="formValidateEnt.other"
                  />
                  <div style="padding: 20px 0" v-show="!formValidateEnt.other">
                    <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                    <p>其他</p>
                  </div>
                </template>
              </FormItem>
            </div>
          </div>
          <Divider />
          <div class="other" style="margin:10px 0">
            <strong>商户设置</strong>
          </div>
          <div class="setMerchant">
            <div style="height:40px">
              <Checkbox
                style="margin-top:8px"
                v-model="formValidateEnt.receiveTerminal"
                @on-change="changeReceive"
              >商户收款</Checkbox>
              <FormItem label="上级商户" prop="parentChannelName" style="float:right">
                <span v-if="isSpan">{{formValidateEnt.parentChannelName}}</span>
                <Cascader
                  v-if="!isSpan"
                  :data="treeData"
                  v-model="formValidateEnt.newParentIds"
                  @on-change="selectChange"
                  :render-format="format"
                  change-on-select
                ></Cascader>
              </FormItem>
            </div>
            <Divider />
            <Table :columns="columnsSale" :data="saleData">
              <!-- 抽成比例 -->
              <template slot-scope="{ row, index }" slot="businessScope">
                <InputNumber
                  :disabled="receiveTerminal"
                  :max="100"
                  :min="row.customerRebate+row.recommenderRebate"
                  v-model="row.benefitPercent"
                  :formatter="value => `${value}%`"
                  :parser="value => value.replace('%', '')"
                  @on-change="changeInputNumber(row,index)"
                  @on-blur="blurInputNumber(row,index)"
                ></InputNumber>
              </template>
              <!-- 开关 -->
              <template slot-scope="{ row, index }" slot="activityScopee">
                <i-switch v-model="row.activityAuthority" @on-change="changeSwitch(row,index)" />

                <span v-show="row.activityAuthority" style="color:#2d8cf0">&nbsp&nbsp开通</span>
                <span v-show="!row.activityAuthority">&nbsp&nbsp关闭</span>
              </template>
            </Table>
          </div>
        </Form>
      </div>
      <div slot="close">
        <Icon
          type="md-close"
          size="20"
          color="#515a6e"
          style="margin-top:10px;margin-right:15px"
          class="icon"
          @click="close"
        />
      </div>
      <div slot="footer">
        <Button type="text" size="large" @click="cancel">取消</Button>
        <!-- 企业注册按钮 -->
        <Button
          v-show="tabIndex==2&&modalTitle=='编辑【商户】'"
          type="primary"
          size="large"
          :loading="loading"
          @click="checkPass('formValidateEnt')"
        >确定</Button>
        <Poptip
          confirm
          placement="right"
          @on-ok="checkNoPass('formValidateEnt')"
          @on-cancel="formValidateEnt.remark=''"
          class="PoptipTitle"
        >
          <div slot="title">
            <div>审核不通过原因：</div>
            <Input
              :autosize="{minRows: 1,maxRows: 5}"
              type="textarea"
              :maxlength="100"
              v-model="formValidateEnt.remark"
            ></Input>
          </div>
          <Button
            v-if="(formValidateEnt.auditStatus!=1&&tabIndex==2&&modalTitle=='审核【商户】')"
            type="text"
            style="border:1px solid #c6c9ce"
            size="large"
            :loading="loadingNo"
          >审核不通过</Button>
        </Poptip>
        <Button
          v-if="(formValidateEnt.auditStatus!=1&&tabIndex==2&&modalTitle=='审核【商户】')"
          type="primary"
          size="large"
          :loading="loading"
          @click="checkPass('formValidateEnt')"
        >审核通过</Button>
        <!-- 个人注册按钮 -->
        <Button
          v-show="tabIndex==1&&modalTitle=='编辑【商户】'"
          type="primary"
          size="large"
          :loading="loading"
          @click="checkPass('formValidatePre')"
        >确定</Button>
        <Poptip
          confirm
          placement="right"
          @on-ok="checkNoPass('formValidatePre')"
          @on-cancel="formValidatePre.remark=''"
          class="PoptipTitle"
        >
          <div slot="title">
            <div>审核不通过原因：</div>
            <Input
              :autosize="{minRows: 1,maxRows: 5}"
              type="textarea"
              :maxlength="100"
              v-model="formValidatePre.remark"
            ></Input>
          </div>
          <Button
            v-if="(formValidatePre.auditStatus!=1&&tabIndex==1&&modalTitle=='审核【商户】')"
            type="text"
            style="border:1px solid #c6c9ce"
            size="large"
            :loading="loadingNo"
          >审核不通过</Button>
        </Poptip>
        <Button
          v-if="(formValidatePre.auditStatus!=1&&tabIndex==1&&modalTitle=='审核【商户】')"
          type="primary"
          size="large"
          :loading="loading"
          @click="checkPass('formValidatePre')"
        >审核通过</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import {
  Upload,
  addChannelApply,
  delChannelApply,
  editChannelApply,
  searchChannelApply,
  auditChannel,
  productType,
  searchMerchantCategory,
  searchTreeData,
  searchMerchantCategorySale
} from "@/api/http";
import { cityData } from "@/api/cityData.js";
import channelTree from "../components/channelTree";
import deleteComponent from "../components/deleteComponent";
import format from "@/plugin/format.js"; //格式化时间YYYY-MM-DD
export default {
  components: {
    channelTree,
    deleteComponent
  },
  name: "merchantManagement",
  data() {
    return {
      receiveTerminal: false,
      isSpan: false,
      saleDataList: [],
      businessStr: "",
      // saleArray: [],
      // 销售范围数据
      columnsSale: [
        {
          title: "销售范围",
          key: "categoryName",
          align: "center",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "利润抽成比例",
          slot: "businessScope",
          align: "center",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "活动权限",
          slot: "activityScopee",
          align: "center",
          minWidth: 60,
          tooltip: true
        }
      ],
      saleData: [], //销售数据
      modalDel: false,
      modal_loading: false, //删除的loading
      delID: null, //删除的ID
      isReceiveType: "2", //全局收款方式变量
      saleList: [], //销售范围
      parentChannelName: "", //上级商户名
      isEnterprise: true, // 企业切换显示
      isPerson: true, // 个人切换显示
      tabIndex: null,
      cityData,
      modalTitle: "", // 模式标题
      Upload, // 上传文件地址
      total: null, // 页码数
      delFormVisible: false, // 删除模态框显示方式
      isShow: false, // 弹框显示状态
      isAdd: false, // 判断当前弹框是否新增
      loading: false, //通过按钮的延时
      loadingNo: false, //不通过按钮的延时
      // 个人模态框表单数据
      formValidatePre: {
        channelBusinessDtoList: [], //业务范围对象
        receiveTerminal: "", //是否开启收款码
        receiveName: "", //收款人姓名
        receiveBank: "", //开户行
        receiveCard: "", //收款人身份证号
        receiveAccount: "", //收款账户
        receiveType: "2", //收款方式
        businessScope: "", //经营范围
        sale: [], //销售范围
        NewareaNames: [], // 级联数据
        accountType: 1, // 注册类型
        address: "", // 详细地址
        areaIds: "", // 区域ids
        areaNames: "", // 区域names
        auditDate: "", // 审核时间
        auditStatus: 1, // 审核状态
        sourceType: 2, // 数据来源
        auditor: this.$store.state.user.userId, // 审核人
        card: "", // 身份证号码
        cardFront: null, // 身份证正面
        frontAddress: null, // 身份证正面地址
        cardBack: null, // 身份证反面
        backAddress: null, // 身份证反面地址
        other: null, //其他
        otherAddress: null, //其他地址
        channelId: "", // 渠道id
        channelName: "", // 渠道名称
        createDate: "", // 创建时间
        name: "", // 姓名
        operator: null, // 操作人
        parentId: "", // 父渠道id
        parentIds: "", //父渠道ids
        newParentIds: [], //渠道树数据
        password: "", // 密码
        phone: "", // 手机
        remark: "", // 备注
        updateDate: "", // 修改时间
        userName: "" // 用户名
      },
      // 企业模态框表单数据
      formValidateEnt: {
        channelBusinessDtoList: [], //业务范围对象
        auditor: this.$store.state.user.userId, // 审核人
        receiveTerminal: "", //是否开启收款码
        receiveName: "", //收款人姓名
        receiveBank: "", //开户行
        receiveCard: "", //收款人身份证号
        receiveAccount: "", //收款账户
        receiveType: "2", //收款类型
        businessScope: "", //经营范围
        sale: [], //销售范围
        NewareaNames: [], // 级联数据
        accountType: 2, // 注册类型
        address: "", // 详细地址
        areaIds: "", // 区域ids
        areaNames: "", // 区域names
        auditDate: "", // 审核时间
        auditStatus: 1, // 审核状态
        sourceType: 2, // 数据来源
        license: null, // 营业执照
        licenseAddress: null, // 营业执照地址openAccount: null, //开户许可证
        openAccountAddress: null, //开户许可证地址
        cardFront: null, // 身份证正面
        frontAddress: null, // 身份证正面地址
        cardBack: null, // 身份证反面
        backAddress: null, // 身份证反面地址
        other: null, //其他
        otherAddress: null, //其他地址
        channelId: "", // 渠道id
        channelName: "", // 渠道名称
        companyName: "", // 公司名称
        companyNo: "", // 社会统一信用代码
        createDate: "", // 创建时间
        name: "", // 姓名
        operator: null, // 操作人
        parentId: "", // 父渠道id
        parentIds: "", //父渠道ids
        newParentIds: [], //渠道树数据
        password: "", // 密码
        phone: "", // 手机
        remark: "", // 备注
        updateDate: "", // 修改时间
        userName: "" // 用户名
      },
      accountType: "", // 注册类型
      auditStatus: "", // 审核状态
      channelId: this.$store.state.user.channelId, // 渠道id
      channelName: "", // 渠道名称
      pageNum: 1, // 页码
      pageSize: 15, // 页面大小
      sourceType: "", // 数据来源
      columns: [
        {
          title: "序号",
          type: "index",
          maxWidth: 60,
          minWidth: 30,
          align: "center"
        },
        {
          title: "商户名称",
          key: "channelName",
          align: "center",
          minWidth: 100,
          tooltip: true
        },
        {
          title: "经营范围",
          slot: "businessScope",
          align: "center",
          minWidth: 120,
          tooltip: true
        },
        {
          title: "用户名",
          key: "userName",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "利润抽成比(%)",
          key: "channelBusinessInfo",
          align: "center",
          minWidth: 120,
          tooltip: true
        },
        {
          title: "联系电话",
          key: "phone",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "创建时间",
          key: "createDate",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "审核状态",
          slot: "status",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "审核时间",
          key: "auditDate",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "备注",
          key: "remark",
          align: "center",
          minWidth: 50,
          tooltip: true
        },
        {
          title: "操作",
          align: "center",
          slot: "operation",
          minWidth: 130,
          tooltip: true
        }
      ],
      dataTable: [],
      auditStatusList: [
        {
          value: "1",
          label: "待提交"
        },
        {
          value: "2",
          label: "待审核"
        },
        {
          value: "3",
          label: "审核失败"
        },
        {
          value: "4",
          label: "审核通过"
        }
      ],
      treeData: [],
      accountTypeList: [
        {
          value: "1",
          label: "个人注册"
        },
        {
          value: "2",
          label: "企业注册"
        }
      ]
    };
  },
  methods: {
    changeValue(value) {
      this.formValidatePre.businessScope = value.join(",");
      this.formValidateEnt.businessScope = value.join(",");
      let arrSale = [];
      this.saleList.forEach(item => {
        value.forEach(i => {
          if (item.value == i) {
            item.benefitPercent = 0;
            arrSale.push(item);
          }
        });
      });
      this.saleData = arrSale;
    },
    change(status) {
      this.$Message.info("开关状态：" + status);
    },
    // 删除按钮操作
    delCancel() {
      this.modal_loading = false;
      this.modalDel = false;
    },
    del() {
      this.modal_loading = true;
      delChannelApply(this.delID)
        .then(res => {
          if (res.data.code == 200) {
            this.getRole();
            this.modal_loading = false;
            this.modalDel = false;
            this.delID = null; //删除的ID
            this.$Message.success("删除成功");
          }
        })
        .catch(err => {
          this.modal_loading = false;
        });
    },

    // 点击部门树
    clickTreeRow(value) {
      if (value) {
        this.channelId = value.id;
        this.pageNum = 1;
        this.getMerchant(); // 重新获取数据
      }
    },

    // 用户重置按钮
    reset() {
      (this.channelId = this.$store.state.user.channelId),
        (this.channelName = ""); // 渠道名称
      this.auditStatus = ""; // 审核状态
      this.accountType = ""; // 注册类型
      this.pageNum = 1;
      this.getMerchant(); // 重新获取数据
    },

    // 页码改变时触发
    pageChange(value) {
      this.pageNum = value;
      this.getMerchant(); // 重新获取数据
    },

    // 页容量改变时触发
    sizeChange(value) {
      this.pageSize = value;
      this.getMerchant(); // 重新获取数据
    },

    cancel() {
      this.loading = false;
      this.loadingNo = false;
      this.isShow = false;
      this.$Message.info("取消操作");
    },
    // 右上角关闭按钮
    close() {
      this.loading = false;
      this.loadingNo = false;
      this.isShow = false;
    },

    // 用户级联选择器
    selectChange(value) {
      if (this.tabIndex == 1) {
        this.formValidatePre.parentIds = "," + value.join(",") + ",";
        this.formValidatePre.parentId = value[value.length - 1];
        this.formValidateEnt.parentIds = "";
        this.formValidateEnt.parentId = "";
      } else if (this.tabIndex == 2) {
        this.formValidateEnt.parentIds = "," + value.join(",") + ",";
        this.formValidateEnt.parentId = value[value.length - 1];
        this.formValidatePre.parentIds = "";
        this.formValidatePre.parentId = "";
      }
    },

    format(labels, selectedData) {
      const index = labels.length - 1;
      const data = selectedData[index] || false;
      if (data && data.code) {
        return labels[index] + " - " + data.code;
      }
      return labels[index];
    },

    changeReceive($event) {
      console.log(this.tabIndex);

      if ($event) {
        this.receiveTerminal = false;
        this.tabIndex == 1
          ? (this.formValidatePre.receiveTerminal = true)
          : (this.formValidateEnt.receiveTerminal = true);
      } else {
        this.receiveTerminal = true;
        this.tabIndex == 1
          ? (this.formValidatePre.receiveTerminal = false)
          : (this.formValidateEnt.receiveTerminal = false);
        let str = "";
        this.tabIndex == 1
          ? (str = this.formValidatePre.businessScope)
          : (str = this.formValidateEnt.businessScope);
        console.log(str);
        console.log(str.split(","));
        let arr = [];
        str.split(",").forEach(item => {
          arr.push(parseInt(item));
        });
        let arrSale = [];
        this.saleList.forEach(item => {
          arr.forEach(i => {
            if (item.value == i) {
              item.benefitPercent = 0;
              arrSale.push(item);
            }
          });
        });
        this.saleData = arrSale;
      }
      console.log(this.formValidateEnt.receiveTerminal);
    },
    blurInputNumber(row, index) {
      if (this.this.saleData[index].benefitPercent > 100) {
        this.saleData[index].benefitPercent = 100;
      } else if (
        this.saleData[index].benefitPercent <
        row.customerRebate + row.recommenderRebate
      ) {
        this.saleData[index].benefitPercent =
          row.customerRebate + row.recommenderRebate;
      }
    },
    // 抽成比例改变事件
    changeInputNumber(row, index) {
      console.log(row);
      this.saleData[index].benefitPercent = row.benefitPercent;
    },
    // 开关的改变事件
    changeSwitch(row, index) {
      console.log(row);
      this.saleData[index].activityAuthority = row.activityAuthority;
    },

    // 审核点击事件
    async checkModal(row,type) {
      console.log(row);
      await this.getTreeData(); //获取渠道树信息
      // this.saleArray = [];
      row.parentChannelName == null
        ? (this.parentChannelName = row.channelName)
        : (this.parentChannelName = row.parentChannelName);
      row.channelId == null ? (this.isSpan = false) : (this.isSpan = true);
      type=="sh"?this.modalTitle = "审核【商户】":this.modalTitle="编辑【商户】";
      this.getProductType();
      this.isShow = true;
      let array = row.areaIds.split(",");
      let array2 = [];
      // 字符串数组 转数字数组
      array.forEach(function(data, index) {
        array2[index] = parseInt(data);
      });
      let arr = row.businessScope.split(",");
      let arr2 = [];
      // 字符串数组 转数字数组
      arr.forEach(function(data, index) {
        arr2[index] = parseInt(data);
      });
      let ary = row.parentIds.split(",");
      let ary2 = [];
      ary.forEach(function(data, index) {
        ary2[index] = parseInt(data);
      });
      if (row.accountType == 1) {
        this.isPerson = true;
        this.isEnterprise = false;
        this.tabIndex = 1;
        this.formValidatePre = JSON.parse(JSON.stringify(row));
        this.formValidatePre.remark = "";
        this.formValidatePre.NewareaNames = array2;
        this.formValidatePre.sale = arr2;
        this.formValidatePre.newParentIds = ary2;
        row.receiveTerminal == 1
          ? (this.formValidatePre.receiveTerminal = false)
          : (this.formValidatePre.receiveTerminal = true);
        row.receiveTerminal == 1
          ? (this.receiveTerminal = true)
          : (this.receiveTerminal = false);
        this.channelId = row.channelId;
        this.businessStr = row.businessScope;
        await this.getMerchantCategorySale();
      } else if (row.accountType == 2) {
        this.isPerson = false;
        this.isEnterprise = true;
        this.tabIndex = 2;
        this.formValidateEnt = JSON.parse(JSON.stringify(row));
        this.formValidateEnt.remark = "";
        this.formValidateEnt.NewareaNames = array2;
        this.formValidateEnt.sale = arr2;
        this.formValidateEnt.newParentIds = ary2;
        row.receiveTerminal == 1
          ? (this.formValidateEnt.receiveTerminal = false)
          : (this.formValidateEnt.receiveTerminal = true);
        row.receiveTerminal == 1
          ? (this.receiveTerminal = true)
          : (this.receiveTerminal = false);
        this.channelId = row.channelId;
        this.businessStr = row.businessScope;
        await this.getMerchantCategorySale();
      }
    },

    // 审核通过事件
    checkPass(name) {
      this.saleData.forEach(item => {
        item.activityAuthority
          ? (item.activityAuthority = 1)
          : (item.activityAuthority = 2);
      });
      if (this.tabIndex == 1) {
        this.loading = true;
        this.formValidatePre.auditDate = format(
          new Date(),
          "YYYY-MM-DD hh:mm:ss"
        );
        this.formValidatePre.auditStatus = 4;
        this.formValidatePre.receiveTerminal
          ? (this.formValidatePre.receiveTerminal = 2)
          : (this.formValidatePre.receiveTerminal = 1);
        this.formValidatePre.channelBusinessDtoList = this.saleData;
        auditChannel(this.formValidatePre)
          .then(res => {
            if (res.data.code == 200) {
              this.isShow = false;
              this.loading = false;
              this.channelId = this.$store.state.user.channelId;
              this.getMerchant(); // 重新获取数据
              this.title=="审核【商户】"?this.$Message.info("审核通过"):this.$Message.info("修改成功");
            } else {
              this.loading = false;
              this.$Message.error(res.data.message);
            }
          })
          .catch(err => {
            this.loading = false;
            this.$Message.error(res.data.message);
          });
      } else if (this.tabIndex == 2) {
        this.loading = true;
        this.formValidateEnt.auditDate = format(
          new Date(),
          "YYYY-MM-DD hh:mm:ss"
        );
        this.formValidateEnt.auditStatus = 4;
        this.formValidateEnt.receiveTerminal
          ? (this.formValidateEnt.receiveTerminal = 2)
          : (this.formValidateEnt.receiveTerminal = 1);
        this.formValidateEnt.channelBusinessDtoList = this.saleData;
        auditChannel(this.formValidateEnt)
          .then(res => {
            if (res.data.code == 200) {
              this.isShow = false;
              this.loading = false;
              this.channelId = this.$store.state.user.channelId;
              this.getMerchant(); // 重新获取数据
              this.title=="审核【商户】"?this.$Message.info("审核通过"):this.$Message.info("修改成功");
            } else {
              this.loading = false;
              this.$Message.error(res.data.message);
            }
          })
          .catch(err => {
            this.loading = false;
            this.$Message.error(res.data.message);
          });
      }
    },
    // 审核不通过事件
    checkNoPass(name) {
      this.saleData.forEach(item => {
        item.activityAuthority
          ? (item.activityAuthority = 1)
          : (item.activityAuthority = 2);
      });
      if (this.tabIndex == 1) {
        this.loadingNo = true;
        this.formValidatePre.auditDate = format(
          new Date(),
          "YYYY-MM-DD hh:mm:ss"
        );
        this.formValidatePre.auditStatus = 3;
        this.formValidatePre.receiveTerminal
          ? (this.formValidatePre.receiveTerminal = 2)
          : (this.formValidatePre.receiveTerminal = 1);
        this.formValidatePre.channelBusinessDtoList = this.saleData;
        auditChannel(this.formValidatePre)
          .then(res => {
            if (res.data.code == 200) {
              this.isShow = false;
              this.loadingNo = false;
              this.formValidatePre.remark = "";
              this.channelId = this.$store.state.user.channelId;
              this.$Message.info("审核不通过");
              this.getMerchant(); // 重新获取数据
            } else {
              this.loadingNo = false;
              this.$Message.error(res.data.message);
            }
          })
          .catch(err => {
            this.loadingNo = false;
            this.$Message.error(res.data.message);
          });
      } else if (this.tabIndex == 2) {
        this.loadingNo = true;
        this.formValidateEnt.auditDate = format(
          new Date(),
          "YYYY-MM-DD hh:mm:ss"
        );
        this.formValidateEnt.auditStatus = 3;
        this.formValidateEnt.receiveTerminal
          ? (this.formValidateEnt.receiveTerminal = 2)
          : (this.formValidateEnt.receiveTerminal = 1);
        this.formValidateEnt.channelBusinessDtoList = this.saleData;
        auditChannel(this.formValidateEnt)
          .then(res => {
            if (res.data.code == 200) {
              this.isShow = false;
              this.loadingNo = false;
              this.formValidateEnt.remark = "";
              this.channelId = this.$store.state.user.channelId;
              this.$Message.info("审核不通过");
              this.getMerchant(); // 重新获取数据
            } else {
              this.loadingNo = false;
              this.$Message.error(res.data.message);
            }
          })
          .catch(err => {
            this.loadingNo = false;
            this.$Message.error(res.data.message);
          });
      }
    },
    searchMerchant() {
      this.pageNum = 1;
      this.getMerchant();
    },

    // 获取商户信息
    getMerchant() {
      let data = {
        accountType: this.accountType,
        auditStatus: this.auditStatus,
        channelId: this.channelId,
        channelName: this.channelName,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        sourceType: this.sourceType
      };
      searchChannelApply(data).then(res => {
        if (res.data.code == 200) {
          this.dataTable = res.data.result.list;
          this.total = res.data.result.total;
          this.pageNum = res.data.result.pageNum;
        }
      });
    },

    // 查询基础商品类型数据
    getProductType() {
      productType().then(res => {
        if (res.data.code == 200) {
          this.saleList = res.data.result;
          this.saleList.forEach(item => {
            item.categoryId = item.id;
            item.benefitPercent == null
              ? (item.benefitPercent = 0)
              : (item.benefitPercent = item.benefitPercent);
          });
        }
      });
    },
    // 查询渠道商的业务范围
    getMerchantCategorySale() {
      searchMerchantCategorySale(this.channelId, this.businessStr).then(res => {
        if (res.data.code == 200) {
          this.saleData = res.data.result;
          this.saleData.forEach((item, index) => {
            item.activityAuthority == 1
              ? (item.activityAuthority = true)
              : (item.activityAuthority = false);
            item.benefitPercent == null
              ? (item.benefitPercent = 0)
              : (item.benefitPercent = item.benefitPercent);
          });
        }
      });
    },
    // 获取渠道树数据
    getTreeData() {
      return searchTreeData(1).then(res => {
        if (res.data.code == 200) {
          this.treeData = res.data.result;
        }
      });
    }
  },
  filters: {
    businessScopeText(value) {
      return value.split(",");
    },
    text(value, saleList) {
      let str = "";
      value.forEach((v, i) => {
        saleList.forEach((value, index) => {
          if (value.id == v) {
            str += `${value.label},`;
          }
        });
      });
      return str.slice(0, str.length - 1);
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.getMerchant();
      vm.getProductType();
    });
  }
};
</script>
<style lang="less" scoped>
.channelMerchants {
  .leftBox {
    min-height: 900px;
    float: left;
    margin-right: 20px;
  }
}
.ivu-divider-horizontal {
  margin: 0;
}
.ivu-input-wrapper {
  width: 220px;
  margin-right: 5px;
}
.ivu-btn {
  margin-right: 10px;
}
.ivu-table-wrapper {
  margin-top: 20px;
}
.ivu-table-cell {
  padding-left: 0px;
  padding-right: 0px;
}
.ivu-page {
  text-align: center;
  margin-top: 10px;
}
.uploadImg {
  width: 50px;
  height: 50px;
  border-radius: 2px;
  margin-right: 10px;
  vertical-align: bottom;
}
.NewareaNames {
  /deep/ .ivu-form-item-content {
    width: 225px;
  }
}
/*商品Tab样式*/
.tab-head {
  display: block;
  height: 30px;
  background: #fff;
}

.tab-head ul li {
  float: left;
  margin-left: 10px;
  list-style-type: none;
}

.tab-head ul li a {
  display: block;
  padding: 0 30px;
  height: 30px;
  line-height: 30px;
  color: #555;
  font-size: 14px;
}

.tab-head ul li a:hover,
.tab-head ul li a.selected {
  color: #fff;
  background: #57a3f3;
}

.receivablesInfo {
  display: inline-block;
  margin-right: 20px;
}

.foot {
  height: 160px;
  margin: 10px 0;
  margin-bottom: 20px;

  .check-text {
    color: #999;
    font-size: 10px;
  }
  .attestation {
    float: left;
    width: 100%;
    /deep/ .ivu-form-item-content {
      margin-left: 40px !important;
      line-height: 20px;
    }
  }
  .sale {
    float: left;
    width: 35%;
    /deep/ .ivu-form-item-content {
      margin-left: -20px !important;
      margin-top: 30px;
    }
  }
}
.setMerchant {
  width: 100%;
  padding: 10px 50px;
  border: 1px dashed #c6c9ce;
  .ivu-form-item {
    margin-right: 0;
  }
  .ivu-input-wrapper {
    margin-right: 0;
  }
}
.card_image {
  text-align: center;
  width: 130px;
  height: 100px;
  margin-top: 10px;
  margin-right: 5px;
  box-sizing: border-box;
  .ivu-form-item-content {
    margin-left: 0px !important;
  }
}
.PoptipTitle {
  /deep/ .ivu-poptip-inner {
    text-align: left;
    width: 255px;
  }
  /deep/ .ivu-input {
    // height: 80px;
    // width: 280px;
    margin-top: 10px;
    margin-left: -18px;
  }
  // .remarkZFB{
  //   width: 200px;
  //   height: 60px;
  //   border: 1px solid #c6c9ce;
  //   margin-left: -18px;
  //   margin-top: 10px;
  // }
}
</style>
