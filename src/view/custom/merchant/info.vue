<template>
  <div class="channelMerchants">
    <div class="leftBox">
      <div
        class="QRcode"
        v-if="$store.state.user.merchant.receiveTerminal==2&&$store.state.user.userVo.type==2&&isShowArrow"
      >
        <div class="top">
          <strong>设备收钱码</strong>
          <div class="topText">
            <span v-show="auditType==null" style="color:#d0d0d0">待配置</span>
            <span v-show="auditType==1" style="color:#ffbd72">待审核</span>
            <span v-show="auditType==2" style="color:#19be6b">审核通过</span>
            <span v-show="auditType==3" style="color:#ed4014">审核失败</span>
          </div>
        </div>
        <Divider />
        <div class="content">
          <div v-show="auditType==null||auditType!=2">待配置</div>
          <div v-show="auditType==2">
            <div class="price">
              <div class="num">
                <span v-show="!isOpenEye">********</span>
                <Poptip
                  trigger="hover"
                  placement="right-start"
                  v-model="visible"
                  class="PoptipTitle"
                >
                  <div slot="title" style="overflow: hidden">
                    <div style="float:left">余额详情</div>
                    <div class="close" style="float:right">
                      <Icon
                        type="md-close"
                        size="16"
                        color="#515a6e"
                        class="icon"
                        @click="visible=false"
                      />
                    </div>
                  </div>
                  <div slot="content">
                    <ul>
                      <li>
                        <p style="color:#19be6b" class="numMore">{{receivableAmount}}</p>
                        <p class="textMore">总收款金额(元)</p>
                      </li>
                      <li>
                        <p style="color:#ed4014" class="numMore">{{refundAmount}}</p>
                        <p class="textMore">总退款金额(元)</p>
                      </li>
                      <li style="margin-right:0px">
                        <p style="color:#ffbd72" class="numMore">{{settlementAmount}}</p>
                        <p class="textMore">总结算金额(元)</p>
                      </li>
                    </ul>
                    <Divider />
                    <Button size="small" type="primary" @click="visible=false">关闭</Button>
                  </div>
                  <span class="numText" v-show="isOpenEye">{{balance}}</span>
                </Poptip>
              </div>
              <div class="eye">
                <img
                  v-show="!isOpenEye"
                  src="../../../assets/images/eye_close.png"
                  alt
                  @click="isOpenEye=!isOpenEye"
                />
                <img
                  v-show="isOpenEye"
                  src="../../../assets/images/eye_open.png"
                  alt
                  @click="isOpenEye=!isOpenEye"
                />
              </div>
            </div>
            <div style="font-size:12px;font-weight:400;color:#d0d0d0">当前余额（元）</div>
          </div>
        </div>
        <div class="btn">
          <Button
            size="small"
            type="primary"
            style="width:100px"
            v-if="(QRcodeList[0]==null)&&$store.state.user.userVo.type==2"
            @click="toSet"
          >去配置</Button>
          <Button
            size="small"
            type="primary"
            style="width:100px"
            v-if="!(QRcodeList[0]==null)&&$store.state.user.userVo.type==2"
            @click="toSee"
          >查看/编辑</Button>
        </div>
      </div>
      <!-- 渠道树 -->
      <channel-tree @clickTreeRow="clickTreeRow" @leftArrow="leftArrow" ref="channelTree"></channel-tree>
    </div>
    <div class="rightDiv">
      <Input v-model="channelName" style="margin-right:10px" placeholder="请输入商户名称" clearable />
      <Select
        v-model="auditStatus"
        clearable
        placeholder="审核状态"
        style="margin-right:10px;width:100px"
      >
        <Option
          v-for="item in auditStatusList"
          :value="item.value"
          :key="item.value"
        >{{ item.label }}</Option>
      </Select>
      <Select
        v-model="accountType"
        clearable
        placeholder="注册类型"
        style="margin-right:10px;width:100px"
      >
        <Option
          v-for="item in accountTypeList"
          :value="item.value"
          :key="item.value"
        >{{ item.label }}</Option>
      </Select>
      <Button type="primary" @click="searchMerchant" v-if="hasPerm('sys:merchantinfo:see')">查询</Button>
      <Button
        type="primary"
        @click="addModal"
        v-if="channelId==$store.state.user.channelId&&$store.state.user.userVo.type==2"
        class="xzbtn"
      >新增子商户</Button>
      <Button type="primary" @click="reset" v-if="hasPerm('sys:merchantinfo:see')">重置</Button>
      <Table highlight-row :columns="columns" :data="dataTable" border>
        <template slot-scope="{ row, index }" slot="businessScope">
          <span>{{row.businessScope|businessScopeText|text(saleList)}}</span>
        </template>
        <template slot-scope="{ row, index }" slot="operation">
          <!-- 按钮 -->
          <Button
            style="margin-right:0px;float:left;margin-left:10px"
            type="success"
            size="small"
            @click="changeAuditStatus(row)"
            v-if="$store.state.user.userVo.type==2&&row.auditStatus==1"
          >提交</Button>

          <Button
            style="margin-right:0px;float:left;margin-left:10px"
            type="success"
            size="small"
            @click="seeReason(row)"
            v-if="$store.state.user.userVo.type==2&&((channelId==$store.state.user.channelId&&(row.auditStatus==4||row.auditStatus==2))||(row.channelId!=$store.state.user.channelId&&(row.auditStatus==4||row.auditStatus==2)))"
          >查看</Button>

          <!-- 编辑按钮 -->
          <Button
            style="margin-right:0px;float:left;margin-left:10px"
            type="primary"
            size="small"
            @click="editModal(row)"
            v-if="$store.state.user.userVo.type==2&&((channelId==$store.state.user.channelId&&row.auditStatus!=2&&row.channelId==$store.state.user.channelId)||row.auditStatus==3)"
          >编辑</Button>

          <!-- 删除按钮 -->
          <Button
            style="margin-right:0px;float:left;margin-left:10px"
            type="error"
            size="small"
            @click="modalDel=true;delID=row.id;delIndex=index"
            v-if="$store.state.user.userVo.type==2&&row.auditStatus==3"
          >删除</Button>
        </template>
        <!-- 状态 -->
        <template slot-scope="{ row, index }" slot="status">
          <span v-show="row.auditStatus==1" style="color:#2d8cf0">待提交</span>
          <span v-show="row.auditStatus==2" style="color:#ffbd72">待审核</span>
          <Tooltip max-width="200" :content="row.remark" placement="top">
            <!-- <div slot="content">{{row.remark}}</div> -->
            <span v-show="row.auditStatus==3" style="color:#ed4014">审核失败</span>
          </Tooltip>
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
    <!-- 注册弹框的模态框 -->
    <Modal v-model="isShow" :mask-closable="false" :title="modalTitle" width="800">
      <!-- 个人注册 -->
      <div v-show="tabIndex==1" :class="{selected:tabIndex==1}" v-if="isregester">
        <Form
          ref="formValidatePre"
          :model="formValidatePre"
          inline
          :rules="ruleValidatePre"
          :label-width="120"
        >
          <div style="margin-bottom:10px">
            <strong>基础信息</strong>
          </div>
          <FormItem label="商户名称" prop="channelName">
            <Input
              v-model.trim="formValidatePre.channelName"
              placeholder="请输入商户名称"
              :disabled="isdisabled"
            ></Input>
          </FormItem>
          <FormItem label="真实姓名" prop="name">
            <Input
              :maxlength="30"
              v-model.trim="formValidatePre.name"
              placeholder="请输入真实姓名"
              :disabled="isdisabled"
            ></Input>
          </FormItem>
          <FormItem label="手机号码" prop="phone">
            <Input
              :maxlength="11"
              v-model.trim="formValidatePre.phone"
              placeholder="请输入手机号码"
              :disabled="isdisabled"
              @on-blur="checkPhone"
            ></Input>
          </FormItem>
          <FormItem label="身份证号码" prop="card">
            <Input
              :maxlength="18"
              v-model.trim="formValidatePre.card"
              placeholder="请输入收款人18位身份证号码"
              :disabled="isdisabled"
            ></Input>
          </FormItem>
          <FormItem label="区域" class="NewareaNames" prop="NewareaNames">
            <Cascader
              placeholder="请选择所在区域"
              :disabled="isdisabled"
              style="width: 220px"
              :data="cityData"
              v-model="formValidatePre.NewareaNames"
              @on-change="selectChange"
              :render-format="format"
              change-on-select
            ></Cascader>
          </FormItem>
          <FormItem label="详细地址" prop="address">
            <Input
              v-model.trim="formValidatePre.address"
              placeholder="请输入详细地址"
              :disabled="isdisabled"
            ></Input>
          </FormItem>
          <FormItem prop="sale" label="销售范围" style="margin-bottom:20px">
            <Select
              placeholder="请选择销售范围"
              :disabled="isdisabled"
              v-model="formValidatePre.sale"
              multiple
              style="width:575px"
              @on-change="saleChange"
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
          </div>
          <FormItem prop="name" label="收款人" style="margin-bottom:20px">
            <Input
              :maxlength="30"
              v-model.trim="formValidatePre.name"
              placeholder="请输入收款人姓名"
              :disabled="isdisabled"
            ></Input>
          </FormItem>
          <FormItem prop="card" label="收款人身份证号" style="margin-bottom:10px">
            <Input
              :maxlength="18"
              v-model.trim="formValidatePre.card"
              placeholder="请输入收款人18位身份证号码"
              :disabled="isdisabled"
            ></Input>
          </FormItem>
          <FormItem prop="receiveAccount" style="margin-bottom:20px" label="收款账号">
            <Input
              :maxlength="30"
              v-model.trim="formValidatePre.receiveAccount"
              placeholder="请输入收款人收款账号"
              :disabled="isdisabled"
              @on-blur="getBankPre"
            ></Input>
          </FormItem>
          <FormItem prop="receiveBank" label="开户行" style="margin-bottom:20px">
            <Input
              v-model.trim="formValidatePre.receiveBank"
              placeholder="请输入开户行名称"
              :disabled="isdisabled"
            ></Input>
          </FormItem>
          <Divider />
          <div style="margin:10px 0">
            <strong>用户信息</strong>
          </div>
          <FormItem label="用户名称" prop="userName">
            <Input
              :maxlength="30"
              v-model.trim="formValidatePre.userName"
              placeholder="小于20个字符"
              :disabled="isdisabled"
              @on-blur="checkUserName"
            ></Input>
            <Input
              v-if="isTab"
              v-model="userName"
              type="text"
              style="opacity: 0;position: absolute"
            ></Input>
          </FormItem>
          <FormItem label="密码" prop="password">
            <Input
              v-if="isTab"
              v-model="password"
              type="password"
              style="opacity: 0;position: absolute"
            ></Input>
            <Input
              :maxlength="30"
              v-model.trim="formValidatePre.password"
              type="password"
              placeholder="字母+数字组合,大于6小于20个字符"
              :disabled="isdisabled"
            ></Input>
          </FormItem>
          <Divider />
          <div class="foot">
            <div class="attestation">
              <strong>资质认证</strong>
              <div class="check-text">(上传图片的大小不能超过2M，推荐格式:png / jpg)</div>
              <FormItem label prop="frontAddress" class="card_image" v-show="!isSeeReason">
                <template>
                  <Upload
                    :action="Upload"
                    name="multipartFile"
                    :format="['jpg','jpeg','png']"
                    :max-size="2048"
                    :on-exceeded-size="handleMaxSize"
                    :on-format-error="formtError"
                    :on-error="onError"
                    :on-success="cardFrontSuccess"
                    :disabled="isdisabled"
                  >
                    <img
                      :src="formValidatePre.frontAddress"
                      style="width:130px;height:100px"
                      class="uploadImg"
                      v-show="formValidatePre.cardFront"
                    />
                    <div style="padding-top: 10px" v-show="!formValidatePre.cardFront">
                      <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                      <p>手持身份证正面</p>
                      <a class="example">
                        查看示例
                        <div id="exampleImg"></div>
                      </a>
                    </div>
                  </Upload>
                </template>
              </FormItem>
              <FormItem label prop="backAddress" class="card_image" v-show="!isSeeReason">
                <template>
                  <Upload
                    :action="Upload"
                    name="multipartFile"
                    :format="['jpg','jpeg','png']"
                    :max-size="2048"
                    :on-exceeded-size="handleMaxSize"
                    :on-format-error="formtError"
                    :on-error="onError"
                    :on-success="cardBackSuccess"
                  >
                    <img
                      :src="formValidatePre.backAddress"
                      style="width:130px;height:100px"
                      class="uploadImg"
                      v-show="formValidatePre.cardBack"
                      :disabled="isdisabled"
                    />

                    <div style="padding-top: 10px" v-show="!formValidatePre.cardBack">
                      <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                      <p>手持身份证反面</p>
                      <a class="example">
                        查看示例
                        <div id="exampleImg" style="left:-80px"></div>
                      </a>
                    </div>
                  </Upload>
                </template>
              </FormItem>
              <FormItem label prop="otherAddress" class="card_image" v-show="!isSeeReason">
                <template>
                  <Upload
                    :action="Upload"
                    name="multipartFile"
                    :format="['jpg','jpeg','png']"
                    :max-size="2048"
                    :on-exceeded-size="handleMaxSize"
                    :on-format-error="formtError"
                    :on-error="onError"
                    :on-success="otherSuccess"
                  >
                    <img
                      :src="formValidatePre.otherAddress"
                      style="width:130px;height:100px"
                      class="uploadImg"
                      v-show="formValidatePre.other"
                      :disabled="isdisabled"
                    />

                    <div style="padding-top: 10px" v-show="!formValidatePre.other">
                      <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                      <p>其他</p>
                    </div>
                  </Upload>
                </template>
              </FormItem>
              <FormItem label prop="frontAddress" class="card_image" v-show="isSeeReason">
                <template>
                  <img
                    :src="formValidatePre.frontAddress"
                    style="width:130px;height:100px"
                    class="uploadImg"
                    v-show="formValidatePre.cardFront"
                  />
                  <div style="padding-top: 10px" v-show="!formValidatePre.cardFront">
                    <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                    <p>手持身份证正面</p>
                    <a>查看示例</a>
                  </div>
                </template>
              </FormItem>
              <FormItem label prop="backAddress" class="card_image" v-show="isSeeReason">
                <template>
                  <img
                    :src="formValidatePre.backAddress"
                    style="width:130px;height:100px"
                    class="uploadImg"
                    v-show="formValidatePre.cardBack"
                    :disabled="isdisabled"
                  />

                  <div style="padding-top: 10px" v-show="!formValidatePre.cardBack">
                    <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                    <p>手持身份证反面</p>
                    <a>查看示例</a>
                  </div>
                </template>
              </FormItem>
              <FormItem label prop="otherAddress" class="card_image" v-show="isSeeReason">
                <template>
                  <img
                    :src="formValidatePre.otherAddress"
                    style="width:130px;height:100px"
                    class="uploadImg"
                    v-show="formValidatePre.other"
                    :disabled="isdisabled"
                  />
                  <div style="padding-top: 10px" v-show="!formValidatePre.other">
                    <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                    <p>其他</p>
                  </div>
                </template>
              </FormItem>
            </div>
          </div>
        </Form>
      </div>

      <!-- 企业注册 -->
      <div v-show="tabIndex==2" :class="{selected:tabIndex==2}" v-if="isregester">
        <Form
          ref="formValidateEnt"
          :model="formValidateEnt"
          inline
          :rules="ruleValidateEnt"
          :label-width="120"
        >
          <div style="margin-bottom:10px">
            <strong>基础信息</strong>
          </div>
          <FormItem label="公司名称" prop="channelName">
            <Input
              v-model.trim="formValidateEnt.channelName"
              placeholder="请输入公司名称"
              :disabled="isdisabled"
            ></Input>
          </FormItem>
          <FormItem label="法人姓名" prop="name">
            <Input
              :maxlength="30"
              v-model.trim="formValidateEnt.name"
              placeholder="请输入法人姓名"
              :disabled="isdisabled"
            ></Input>
          </FormItem>
          <FormItem label="手机号码" prop="phone">
            <Input
              :maxlength="11"
              v-model.trim="formValidateEnt.phone"
              placeholder="请输入手机号码"
              :disabled="isdisabled"
              @on-blur="checkPhone"
            ></Input>
          </FormItem>
          <FormItem label="公司税号" prop="companyNo">
            <Input
              :maxlength="20"
              v-model.trim="formValidateEnt.companyNo"
              placeholder="税号由15位.18位或20位组成"
              :disabled="isdisabled"
            ></Input>
          </FormItem>
          <FormItem label="区域" class="NewareaNames" prop="NewareaNames">
            <Cascader
              placeholder="请选择所在区域"
              :disabled="isdisabled"
              style="width: 220px"
              :data="cityData"
              v-model="formValidateEnt.NewareaNames"
              @on-change="selectChange"
              :render-format="format"
              change-on-select
            ></Cascader>
          </FormItem>
          <FormItem label="详细地址" prop="address">
            <Input
              v-model.trim="formValidateEnt.address"
              placeholder="请输入详细地址"
              :disabled="isdisabled"
            ></Input>
          </FormItem>
          <FormItem prop="sale" label="销售范围" style="margin-bottom:20px">
            <Select
              placeholder="请选择销售范围"
              :disabled="isdisabled"
              v-model="formValidateEnt.sale"
              multiple
              style="width:575px"
              @on-change="saleChange"
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
          </div>
          <FormItem prop="receiveName" label="收款人" style="margin-bottom:20px">
            <Input
              :maxlength="30"
              v-model.trim="formValidateEnt.receiveName"
              placeholder="请输入收款人姓名"
              :disabled="isdisabled"
            ></Input>
          </FormItem>
          <FormItem prop="receiveCard" label="收款人身份证号" style="margin-bottom:10px">
            <Input
              :maxlength="18"
              v-model.trim="formValidateEnt.receiveCard"
              placeholder="请输入收款人18位身份证号码"
              :disabled="isdisabled"
            ></Input>
          </FormItem>
          <FormItem prop="receiveAccount" label="收款账号" style="margin-bottom:20px">
            <Input
              :maxlength="30"
              v-model.trim="formValidateEnt.receiveAccount"
              placeholder="请输入收款人收款账号"
              :disabled="isdisabled"
              @on-blur="getBankEnt"
            ></Input>
          </FormItem>
          <FormItem prop="receiveBank" label="开户行" style="margin-bottom:20px">
            <Input
              v-model.trim="formValidateEnt.receiveBank"
              placeholder="请输入开户行名称"
              :disabled="isdisabled"
            ></Input>
          </FormItem>
          <Divider />
          <div style="margin:10px 0">
            <strong>用户信息</strong>
          </div>
          <FormItem label="用户名称" prop="userName">
            <Input
              :maxlength="30"
              v-model.trim="formValidateEnt.userName"
              placeholder="小于20个字符"
              :disabled="isdisabled"
              @on-blur="checkUserName"
            ></Input>
            <Input
              v-if="isTab"
              v-model="userName"
              type="text"
              style="opacity: 0;position: absolute"
            ></Input>
          </FormItem>
          <FormItem label="密码" prop="password">
            <Input
              v-if="isTab"
              v-model="password"
              type="password"
              style="opacity: 0;position: absolute"
            ></Input>
            <Input
              :maxlength="30"
              v-model.trim="formValidateEnt.password"
              type="password"
              placeholder="字母+数字组合,大于6小于20个字符"
              :disabled="isdisabled"
            ></Input>
          </FormItem>
          <Divider />
          <div class="foot">
            <div class="attestation">
              <strong>资质认证</strong>
              <div class="check-text">(上传图片的大小不能超过2M，推荐格式:png / jpg)</div>
              <FormItem label prop="licenseAddress" class="card_image" v-show="!isSeeReason">
                <template>
                  <Upload
                    :action="Upload"
                    name="multipartFile"
                    :format="['jpg','jpeg','png']"
                    :max-size="2048"
                    :on-exceeded-size="handleMaxSize"
                    :on-format-error="formtError"
                    :on-error="onError"
                    :on-success="licenseSuccess"
                    :disabled="isdisabled"
                  >
                    <img
                      :src="formValidateEnt.licenseAddress"
                      style="width:130px;height:100px"
                      class="uploadImg"
                      v-show="formValidateEnt.license"
                    />

                    <div style="padding-top: 10px" v-show="!formValidateEnt.license">
                      <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                      <p>营业执照</p>
                      <p>(三证合一)</p>
                    </div>
                  </Upload>
                </template>
              </FormItem>
              <FormItem label prop="openAccountAddress" class="card_image" v-show="!isSeeReason">
                <template>
                  <Upload
                    :action="Upload"
                    name="multipartFile"
                    :format="['jpg','jpeg','png']"
                    :max-size="2048"
                    :on-exceeded-size="handleMaxSize"
                    :on-format-error="formtError"
                    :on-error="onError"
                    :on-success="openAccountSuccess"
                    :disabled="isdisabled"
                  >
                    <img
                      :src="formValidateEnt.openAccountAddress"
                      style="width:130px;height:100px"
                      class="uploadImg"
                      v-show="formValidateEnt.openAccount"
                    />

                    <div style="padding-top: 10px" v-show="!formValidateEnt.openAccount">
                      <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                      <p>开户许可证</p>
                    </div>
                  </Upload>
                </template>
              </FormItem>
              <FormItem label prop="frontAddress" class="card_image" v-show="!isSeeReason">
                <template>
                  <Upload
                    :action="Upload"
                    name="multipartFile"
                    :format="['jpg','jpeg','png']"
                    :max-size="2048"
                    :on-exceeded-size="handleMaxSize"
                    :on-format-error="formtError"
                    :on-error="onError"
                    :on-success="cardFrontSuccess"
                    :disabled="isdisabled"
                  >
                    <img
                      :src="formValidateEnt.frontAddress"
                      style="width:130px;height:100px"
                      class="uploadImg"
                      v-show="formValidateEnt.cardFront"
                    />
                    <div style="padding-top: 10px" v-show="!formValidateEnt.cardFront">
                      <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                      <p>手持身份证正面</p>
                      <a class="example">
                        查看示例
                        <div id="exampleImg" style="left:-250px"></div>
                      </a>
                    </div>
                  </Upload>
                </template>
              </FormItem>
              <FormItem label prop="backAddress" class="card_image" v-show="!isSeeReason">
                <template>
                  <Upload
                    :action="Upload"
                    name="multipartFile"
                    :format="['jpg','jpeg','png']"
                    :max-size="2048"
                    :on-exceeded-size="handleMaxSize"
                    :on-format-error="formtError"
                    :on-error="onError"
                    :on-success="cardBackSuccess"
                  >
                    <img
                      :src="formValidateEnt.backAddress"
                      style="width:130px;height:100px"
                      class="uploadImg"
                      v-show="formValidateEnt.cardBack"
                      :disabled="isdisabled"
                    />

                    <div style="padding-top: 10px" v-show="!formValidateEnt.cardBack">
                      <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                      <p>手持身份证反面</p>
                      <a class="example">
                        查看示例
                        <div id="exampleImg" style="left:-360px"></div>
                      </a>
                    </div>
                  </Upload>
                </template>
              </FormItem>
              <FormItem label prop="otherAddress" class="card_image" v-show="!isSeeReason">
                <template>
                  <Upload
                    :action="Upload"
                    name="multipartFile"
                    :format="['jpg','jpeg','png']"
                    :max-size="2048"
                    :on-exceeded-size="handleMaxSize"
                    :on-format-error="formtError"
                    :on-error="onError"
                    :on-success="otherSuccess"
                  >
                    <img
                      :src="formValidateEnt.otherAddress"
                      style="width:130px;height:100px"
                      class="uploadImg"
                      v-show="formValidateEnt.other"
                      :disabled="isdisabled"
                    />

                    <div style="padding-top: 10px" v-show="!formValidateEnt.other">
                      <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                      <p>其他</p>
                    </div>
                  </Upload>
                </template>
              </FormItem>
              <FormItem label prop="licenseAddress" class="card_image" v-show="isSeeReason">
                <template>
                  <img
                    :src="formValidateEnt.licenseAddress"
                    style="width:130px;height:100px"
                    class="uploadImg"
                    v-show="formValidateEnt.license"
                  />

                  <div style="padding-top: 10px" v-show="!formValidateEnt.license">
                    <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                    <p>营业执照</p>
                    <p>(三证合一)</p>
                  </div>
                </template>
              </FormItem>
              <FormItem label prop="openAccountAddress" class="card_image" v-show="isSeeReason">
                <template>
                  <img
                    :src="formValidateEnt.openAccountAddress"
                    style="width:130px;height:100px"
                    class="uploadImg"
                    v-show="formValidateEnt.openAccount"
                  />

                  <div style="padding-top: 10px" v-show="!formValidateEnt.openAccount">
                    <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                    <p>开户许可证</p>
                  </div>
                </template>
              </FormItem>
              <FormItem label prop="frontAddress" class="card_image" v-show="isSeeReason">
                <template>
                  <img
                    :src="formValidateEnt.frontAddress"
                    style="width:130px;height:100px"
                    class="uploadImg"
                    v-show="formValidateEnt.cardFront"
                  />
                  <div style="padding-top: 10px" v-show="!formValidateEnt.cardFront">
                    <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                    <p>手持身份证正面</p>
                    <a>查看示例</a>
                  </div>
                </template>
              </FormItem>
              <FormItem label prop="backAddress" class="card_image" v-show="isSeeReason">
                <template>
                  <img
                    :src="formValidateEnt.backAddress"
                    style="width:130px;height:100px"
                    class="uploadImg"
                    v-show="formValidateEnt.cardBack"
                    :disabled="isdisabled"
                  />

                  <div style="padding-top: 10px" v-show="!formValidateEnt.cardBack">
                    <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                    <p>手持身份证反面</p>
                    <a>查看示例</a>
                  </div>
                </template>
              </FormItem>
              <FormItem label prop="otherAddress" class="card_image" v-show="isSeeReason">
                <template>
                  <img
                    :src="formValidateEnt.otherAddress"
                    style="width:130px;height:100px"
                    class="uploadImg"
                    v-show="formValidateEnt.other"
                    :disabled="isdisabled"
                  />

                  <div style="padding-top: 10px" v-show="!formValidateEnt.other">
                    <Icon type="md-add" size="50" style="color: #3399ff"></Icon>
                    <p>其他</p>
                  </div>
                </template>
              </FormItem>
            </div>
          </div>
        </Form>
      </div>
      <div slot="header" id="tabHead" class="tab-head" v-if="isTab">
        <ul>
          <li>
            <a
              href="javascript:;"
              @click="enterpriseRegister"
              :class="{selected:tabIndex==2}"
              v-show="isEnterprise"
            >企业注册</a>
          </li>
          <li>
            <a
              href="javascript:;"
              @click="personRegister"
              :class="{selected:tabIndex==1}"
              v-show="isPerson"
            >个人注册</a>
          </li>
        </ul>
      </div>

      <div slot="footer">
        <!-- 企业注册按钮 -->
        <Button
          v-show="tabIndex==2&&!isSeeReason"
          type="text"
          style="border:1px solid #c6c9ce"
          size="large"
          @click="cancel('formValidateEnt')"
        >取消</Button>
        <Button
          v-show="tabIndex==2&&isSeeReason"
          type="text"
          style="border:1px solid"
          size="large"
          @click="closeModal('formValidateEnt')"
        >关闭</Button>
        <Button
          v-show="tabIndex==2&&!isSeeReason"
          type="primary"
          size="large"
          :loading="loading"
          @click="getMerchantModal('formValidateEnt')"
        >确定</Button>

        <!-- 个人注册按钮 -->
        <Button
          v-show="tabIndex==1&&!isSeeReason"
          type="text"
          style="border:1px solid #c6c9ce"
          size="large"
          @click="cancel('formValidatePre')"
        >取消</Button>
        <Button
          v-show="tabIndex==1&&isSeeReason"
          style="border:1px solid"
          type="text"
          size="large"
          @click="closeModal('formValidatePre')"
        >关闭</Button>
        <Button
          v-show="tabIndex==1&&!isSeeReason"
          type="primary"
          size="large"
          :loading="loading"
          @click="getMerchantModal('formValidatePre')"
        >确定</Button>
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
    </Modal>
    <!-- 收钱码弹框组件 -->
    <code-modal
      ref="codeModal"
      :loadingWX.sync="loadingWX"
      :loadingZFB.sync="loadingZFB"
      :isQRShow.sync="isQRShow"
      :auditType.sync="auditType"
      :isSaveWX.sync="isSaveWX"
      :isSaveZFB.sync="isSaveZFB"
    ></code-modal>
  </div>
</template>
<script>
import channelTree from "../components/channelTree";
import { netWorkHttp, Upload } from "@/api/data";
import {
  addChannelApply,
  delChannelApply,
  editChannelApply,
  searchChannelApply,
  auditChannel,
  productType,
  addQRcode,
  editQRcode,
  searchQRcodeByChannelId,
  searchMerchantCategory,
  searchBank,
  searchMerchantCategorySale,
  getFastCheck,
  getPrice
} from "@/api/http";
import { cityData } from "@/api/cityData.js";
import deleteComponent from "@/view/custom/components/deleteComponent";
import codeModal from "@/view/custom/components/codeModal";
export default {
  components: {
    channelTree,
    deleteComponent,
    codeModal
  },
  name: "info",
  data() {
    const validateUserName = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("输入不能为空"));
      } else if (!/^(?!^\d+$)[0-9a-zA-Z]+$/.test(value)) {
        callback(new Error("不能为纯数字且不包含汉字"));
      } else {
        callback();
      }
    };
    const validatePassword = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("输入不能为空"));
      } else if (!/^(?!^\d+$)(?!^[a-zA-Z]+$)[0-9a-zA-Z]+$/.test(value)) {
        callback(new Error("密码请用数字和字母组合"));
      } else {
        callback();
      }
    };
    const validatePhone = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("输入不能为空"));
      } else if (!/^1[3456789]\d{9}$/.test(value)) {
        callback(new Error("电话号码格式错误"));
      } else {
        callback();
      }
    };
    const validateCard = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("输入不能为空"));
      } else if (
        !/^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(
          value
        )
      ) {
        callback(new Error("身份证号码格式错误"));
      } else {
        callback();
      }
    };
    const validateCompanyNo = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("输入不能为空"));
      } else if (
        !/^([0-9a-zA-Z]{15}|[0-9a-zA-Z]{18}|[0-9a-zA-Z]{20})$/.test(value)
      ) {
        callback(new Error("公司税号格式错误"));
      } else {
        callback();
      }
    };
    const validateReceiveAccount = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("输入不能为空"));
      } else if (!/^(\d{15}|\d{16}|\d{17}|\d{19})$/g.test(value)) {
        callback(new Error("银行账号格式错误"));
      } else {
        callback();
      }
    };
    return {
      balance: null,
      receivableAmount: null,
      refundAmount: null,
      settlementAmount: null,
      visible: false,
      userName: null,
      password: null,
      isOpenEye: false,
      saleChannelId: null,
      isShowArrow: true,
      checkType: null, //1用户名2手机号
      checkParam: null,
      loading: false,
      businessStr: "",
      strPre: "", //定义变量对比个人注册编辑数据
      strEnt: "", //定义变量对比商户注册编辑数据
      isSeeReason: false, //是否是查看详情
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
      QRcodeList: [], //收钱码数组
      auditType: null, //收钱码审核状态
      loadingWX: false,
      loadingZFB: false,
      isQRShow: false,
      isSaveWX: true,
      isSaveZFB: true,
      modalDel: false,
      modal_loading: false, //删除的loading
      delID: null, //删除的ID
      saleList: [], //销售范围
      parentChannelName: null, //上级商户名
      isregester: false, //是否显示注册表单
      isTab: true, // 是否显示tab栏
      isEnterprise: true, // 企业切换显示
      isPerson: true, // 个人切换显示
      tabIndex: 2,
      remakedisabled: false, // 备注的是否操作模式
      isShenHe: true, // 是否是审核
      cityData,
      isdisabled: false, // 是否可编辑
      modalTitle: null, // 模式标题
      isShowModel: false, // 用户模态框不显示部分
      depData: [], // 上级部门数据
      Upload, // 上传文件地址
      total: null, // 页码数
      delFormVisible: false, // 删除模态框显示方式
      isShow: false, // 弹框显示状态
      // 个人模态框表单数据
      formValidatePre: {},
      ruleValidatePre: {
        userName: [
          { required: true, validator: validateUserName, trigger: "blur" },
          { max: 20, message: "长度最多是20个字符", trigger: "blur" }
        ],
        password: [
          { required: true, validator: validatePassword, trigger: "blur" },
          { min: 6, max: 20, message: "密码长度6-20个字符", trigger: "blur" }
        ],
        phone: [{ required: true, validator: validatePhone, trigger: "blur" }],
        card: [{ required: true, validator: validateCard, trigger: "blur" }],
        sale: [
          {
            type: "array",
            required: true,
            message: "请选择销售范围",
            trigger: "blur"
          }
        ],
        frontAddress: [
          {
            required: true,
            message: "请上传图片",
            trigger: "change"
          }
        ],
        backAddress: [
          {
            required: true,
            message: "请上传图片",
            trigger: "change"
          }
        ],
        channelName: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        name: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          },
          { max: 10, message: "最多输入10个字符", trigger: "blur" }
        ],
        receiveAccount: [
          { required: true, validator: validateReceiveAccount, trigger: "blur" }
        ],
        receiveBank: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ]
      },
      // 企业模态框表单数据
      formValidateEnt: {},
      ruleValidateEnt: {
        userName: [
          { required: true, validator: validateUserName, trigger: "blur" },
          { max: 20, message: "长度最多是20个字符", trigger: "blur" }
        ],
        password: [
          { required: true, validator: validatePassword, trigger: "blur" },
          { min: 6, max: 20, message: "密码长度6-20个字符", trigger: "blur" }
        ],
        phone: [{ required: true, validator: validatePhone, trigger: "blur" }],
        receiveCard: [
          { required: true, validator: validateCard, trigger: "blur" }
        ],
        sale: [
          {
            type: "array",
            required: true,
            message: "请选择销售范围",
            trigger: "blur"
          }
        ],
        frontAddress: [
          {
            required: true,
            message: "请上传图片",
            trigger: "change"
          }
        ],
        backAddress: [
          {
            required: true,
            message: "请上传图片",
            trigger: "change"
          }
        ],
        licenseAddress: [
          {
            required: true,
            message: "请上传图片",
            trigger: "change"
          }
        ],
        openAccountAddress: [
          {
            required: true,
            message: "请上传图片",
            trigger: "change"
          }
        ],
        channelName: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        companyNo: [
          { required: true, validator: validateCompanyNo, trigger: "blur" }
        ],
        name: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          },
          { max: 10, message: "最多输入10个字符", trigger: "blur" }
        ],
        receiveName: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ],
        receiveAccount: [
          { required: true, validator: validateReceiveAccount, trigger: "blur" }
        ],
        receiveBank: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          }
        ]
      },
      accountType: null, // 注册类型
      auditStatus: null, // 审核状态
      channelId: this.$store.state.user.channelId, // 渠道id
      channelName: null, // 渠道名称
      pageNum: 1, // 页码
      pageSize: 15, // 页面大小
      sourceType: null, // 数据来源
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
          minWidth: 80,
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
          minWidth: 80,
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
          minWidth: 120,
          tooltip: true
        },
        {
          title: "审核状态",
          slot: "status",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "审核时间",
          key: "auditDate",
          align: "center",
          minWidth: 120,
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
          width: 120,
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
    leftArrow(value) {
      this.isShowArrow = value;
    },
    checkPhone(event) {
      this.checkType = 2;
      this.checkParam = event.target.value;
      if (this.modalTitle == "新增【商户】") {
        this.searchFastCheck();
      }
    },
    checkUserName(event) {
      console.log(event);
      this.checkType = 1;
      this.checkParam = event.target.value;
      if (this.modalTitle == "新增【商户】") {
        this.searchFastCheck();
      }
    },

    // 去设置收钱码
    toSet() {
      this.isQRShow = true;
      this.isSaveWX = true;
      this.isSaveZFB = true;
    },
    // 去查看编辑收钱码
    async toSee() {
      await this.getQRcodeByChannelId();
      this.isQRShow = true;
    },
    // 删除按钮操作
    delCancel() {
      this.modal_loading = false;
      this.modalDel = false;
    },
    del() {
      this.modal_loading = true;
      delChannelApply(this.delID)
        .then(backData => {
          if (backData.data.code == 200) {
            this.modal_loading = false;
            this.modalDel = false;
            this.delID = null; //删除的ID
            this.$Message.success("删除成功");
            this.dataTable.splice(this.delIndex, 1);
            this.delIndex = null; //删除的索引
          } else {
            this.modal_loading = false;
            this.$Message.error(res.data.message);
          }
        })
        .catch(err => {
          this.modal_loading = false;
          this.$Message.error(res.data.message);
        });
    },

    // 企业注册
    enterpriseRegister() {
      this.tabIndex = 2;
      this.$refs.formValidateEnt.resetFields();
      this.formValidateEnt = {
        receiveTerminal: 1,
        receiveType: "2",
        sale: [],
        NewareaNames: [],
        accountType: 2,
        auditStatus: 1,
        sourceType: 2,
        operator: this.$store.state.user.userId, // 操作人
        parentId: this.$store.state.user.channelId, // 父渠道id
        parentIds:
          this.$store.state.user.merchant.parentIds +
          this.$store.state.user.channelId +
          "," //父渠道pids
      };
      this.receive = null;
      this.formValidatePre.cardFront = null;
      this.formValidatePre.cardBack = null;
      this.formValidatePre.other = null;
      console.log(this.formValidateEnt);
    },
    // 个人注册
    personRegister() {
      this.tabIndex = 1;
      this.$refs.formValidatePre.resetFields();
      this.formValidatePre = {
        receiveTerminal: 1,
        receiveType: "2",
        sale: [],
        NewareaNames: [],
        accountType: 1,
        auditStatus: 1,
        sourceType: 2,
        operator: this.$store.state.user.userId, // 操作人
        parentId: this.$store.state.user.channelId, // 父渠道id
        parentIds:
          this.$store.state.user.merchant.parentIds +
          this.$store.state.user.channelId +
          "," //父渠道pids
      };
      this.formValidateEnt.license = null;
      this.formValidateEnt.openAccount = null;
      this.formValidateEnt.cardFront = null;
      this.formValidateEnt.cardBack = null;
      this.formValidateEnt.other = null;
      console.log(this.formValidatePre);
    },
    // 文件大小限制
    handleMaxSize(file) {
      this.$Message.error("上传文件大于2M，请重新上传");
    },
    // 文件格式验证失败
    formtError(file, fileList) {
      this.$Message.error("上传文件类型错误");
    },
    // 文件上传失败
    onError(error) {
      this.$Message.error("上传失败");
    },
    // 营业执照文件上传成功
    licenseSuccess(response, file, fileList) {
      if (response.code === 200) {
        this.$set(this.formValidateEnt, "licenseAddress", response.result.url);
        this.formValidateEnt.license = response.result.key;
        this.$Message.success("图片上传成功");
      } else if (response.code === 500) {
        this.$Message.error(response.message);
      }
    },
    // 开户许可证文件上传成功
    openAccountSuccess(response, file, fileList) {
      if (response.code === 200) {
        this.$set(
          this.formValidateEnt,
          "openAccountAddress",
          response.result.url
        );
        this.formValidateEnt.openAccount = response.result.key;
        this.$Message.success("图片上传成功");
      } else if (response.code === 500) {
        this.$Message.error(response.message);
      }
    },
    // 身份证正面文件上传成功
    cardFrontSuccess(response, file, fileList) {
      if (response.code === 200) {
        if (this.tabIndex == 1) {
          this.$set(this.formValidatePre, "frontAddress", response.result.url);
          this.formValidatePre.cardFront = response.result.key;
        } else if (this.tabIndex == 2) {
          this.$set(this.formValidateEnt, "frontAddress", response.result.url);
          this.formValidateEnt.cardFront = response.result.key;
          this.$Message.success("图片上传成功");
        }
      } else if (response.code === 500) {
        this.$Message.error(response.message);
      }
    },
    // 身份证反面文件上传成功
    cardBackSuccess(response, file, fileList) {
      if (response.code === 200) {
        if (this.tabIndex == 1) {
          this.$set(this.formValidatePre, "backAddress", response.result.url);
          this.formValidatePre.cardBack = response.result.key;
          this.$Message.success("图片上传成功");
        } else if (this.tabIndex == 2) {
          this.$set(this.formValidateEnt, "backAddress", response.result.url);
          this.formValidateEnt.cardBack = response.result.key;
        }
      } else if (response.code === 500) {
        this.$Message.error(response.message);
      }
    },
    // 其他类型文件上传成功
    otherSuccess(response, file, fileList) {
      if (response.code === 200) {
        if (this.tabIndex == 1) {
          this.$set(this.formValidatePre, "otherAddress", response.result.url);
          this.formValidatePre.other = response.result.key;
          this.$Message.success("图片上传成功");
        } else if (this.tabIndex == 2) {
          this.$set(this.formValidateEnt, "otherAddress", response.result.url);
          this.formValidateEnt.other = response.result.key;
          this.$Message.success("图片上传成功");
        }
      } else if (response.code === 500) {
        this.$Message.error(response.message);
      }
    },

    // 用户级联选择器
    selectChange(value) {
      this.formValidatePre.areaIds = value.join(",");
      this.formValidateEnt.areaIds = value.join(",");
    },

    format(labels) {
      return labels.join("/");
      this.formValidatePre.NewareaNames = labels;
      this.formValidateEnt.NewareaNames = labels;
    },

    // 销售范围改变
    saleChange(value) {
      this.formValidatePre.businessScope = value.join(",");
      this.formValidateEnt.businessScope = value.join(",");
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
        (this.channelName = null); // 渠道名称
      this.auditStatus = null; // 审核状态
      this.accountType = null; // 注册类型
      this.pageNum = 1;
      this.pageSize = 15;
      this.total = null;
      this.getMerchant();
      this.$refs.channelTree.getTreeData();
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
    // 右上角关闭按钮
    close() {
      this.isShow = false;
      this.loading = false;
      this.$refs.formValidatePre.resetFields();
      this.$refs.formValidateEnt.resetFields();
      console.log(this.formValidatePre);
      console.log(this.formValidateEnt);
    },
    // 取消按钮
    cancel(name) {
      this.isShow = false;
      this.loading = false;
      this.$Message.info("取消操作");
      this.$refs[name].resetFields();
      console.log(this.formValidatePre);
      console.log(this.formValidateEnt);
    },

    // 关闭按钮
    closeModal(name) {
      this.isShow = false;
      this.loading = false;
      this.$refs[name].resetFields();
      console.log(this.formValidatePre);
      console.log(this.formValidateEnt);
    },
    // 提交的点击事件
    changeAuditStatus(row) {
      if (row.auditStatus <= 2) {
        row.auditStatus += 1;
      }
      this.modalTitle = "审核【商户】";
      editChannelApply(row).then(res => {
        if (res.data.code == 200) {
          // row.auditStatus = 2;
          this.getMerchant();
          this.$Message.info("已提交");
        }
      });
    },
    // 获取企业注册开户行
    getBankEnt(event) {
      this.formValidateEnt.receiveAccount = event.target.value
        .split(" ")
        .join("")
        .trim();
      searchBank(this.formValidateEnt.receiveAccount).then(res => {
        if (res.data.code == 200) {
          this.formValidateEnt.receiveBank = res.data.result;
        }
      });
    },
    // 获取个人注册开户行
    getBankPre() {
      this.formValidatePre.receiveAccount = event.target.value
        .split(" ")
        .join("")
        .trim();
      searchBank(this.formValidatePre.receiveAccount).then(res => {
        if (res.data.code == 200) {
          this.formValidatePre.receiveBank = res.data.result;
        }
      });
    },
    // 新增点击事件
    addModal() {
      this.$Spin.show();
      console.log(this.formValidatePre);
      console.log(this.formValidateEnt);
      this.isSeeReason = false;
      this.isEnterprise = true;
      this.isPerson = true;
      this.isdisabled = false;
      this.modalTitle = "新增【商户】";
      this.isTab = true;
      this.tabIndex = 2;
      this.isregester = true;
      this.remakedisabled = false;
      this.getProductType();
      setTimeout(() => {
        this.$refs.formValidatePre.resetFields();
        this.$refs.formValidateEnt.resetFields();
        this.formValidateEnt = {
          receiveTerminal: 1,
          receiveType: "2",
          sale: [],
          NewareaNames: [],
          accountType: 2,
          auditStatus: 1,
          sourceType: 2,
          operator: this.$store.state.user.userId, // 操作人
          parentId: this.$store.state.user.channelId, // 父渠道id
          parentIds:
            this.$store.state.user.merchant.parentIds +
            this.$store.state.user.channelId +
            "," //父渠道pids
        };
      }, 2000);
      setTimeout(() => {
        this.isShow = true;
        this.$Spin.hide();
      }, 2800);
    },
    // 编辑，查看显示方式
    showType(row) {
      this.getProductType();
      this.isShow = true;
      this.isTab = false;
      this.isregester = true;
      let array2 = [];
      row.areaIds.split(",").forEach(item => {
        array2.push(parseInt(item));
      });
      let arr2 = [];
      row.businessScope.split(",").forEach(item => {
        arr2.push(parseInt(item));
      });
      if (row.accountType == 1) {
        this.isPerson = true;
        this.isEnterprise = false;
        this.tabIndex = 1;
        this.formValidatePre = JSON.parse(JSON.stringify(row));
        this.formValidatePre.NewareaNames = array2;
        this.formValidatePre.sale = arr2;
        this.strPre = JSON.stringify(this.formValidatePre);
      } else if (row.accountType == 2) {
        this.isPerson = false;
        this.isEnterprise = true;
        this.tabIndex = 2;
        this.formValidateEnt = JSON.parse(JSON.stringify(row));
        this.formValidateEnt.NewareaNames = array2;
        this.formValidateEnt.sale = arr2;
        this.strEnt = JSON.stringify(this.formValidateEnt);
      }
    },

    // 编辑点击事件
    editModal(row) {
      console.log(row);
      this.modalTitle = "编辑【商户】";
      this.isSeeReason = false;
      this.isdisabled = false;
      this.showType(row);
    },

    // 查看
    async seeReason(row) {
      console.log(row);
      this.modalTitle = "查看详情";
      this.isSeeReason = true;
      row.parentChannelName == null
        ? (this.parentChannelName = row.channelName)
        : (this.parentChannelName = row.parentChannelName);
      this.isdisabled = true;
      this.showType(row);
      if (row.accountType == 1) {
        row.receiveTerminal == 1
          ? (this.formValidatePre.receiveTerminal = false)
          : (this.formValidatePre.receiveTerminal = true);
        this.saleChannelId = row.channelId;
        this.businessStr = row.businessScope;
        await this.getMerchantCategorySale();
        // }
      } else if (row.accountType == 2) {
        row.receiveTerminal == 1
          ? (this.formValidateEnt.receiveTerminal = false)
          : (this.formValidateEnt.receiveTerminal = true);
        this.saleChannelId = row.channelId;
        this.businessStr = row.businessScope;
        await this.getMerchantCategorySale();
      }
    },

    // 弹框确认的点击事件
    getMerchantModal(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          // 对的
          this.loading = true;
          if (this.modalTitle == "新增【商户】") {
            if (this.tabIndex == 1) {
              this.formValidatePre.areaNames = this.formValidatePre.NewareaNames.join(
                ","
              );
              this.formValidatePre.receiveName = this.formValidatePre.name;
              this.formValidatePre.receiveCard = this.formValidatePre.card;
              addChannelApply(this.formValidatePre)
                .then(res => {
                  if (res.data.code == 200) {
                    this.loading = false;
                    this.isShow = false;
                    this.$Message.info("新增成功");
                    this.getMerchant(); // 重新获取数据
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
              this.formValidateEnt.areaNames = this.formValidateEnt.NewareaNames.join(
                ","
              );
              this.formValidateEnt.companyName = this.formValidateEnt.channelName;
              this.formValidateEnt.card = this.formValidateEnt.receiveCard;
              // netWorkHttp("/channelApply/addChannelApply", this.formValidateEnt)
              addChannelApply(this.formValidateEnt)
                .then(res => {
                  if (res.data.code == 200) {
                    this.loading = false;
                    this.isShow = false;
                    this.$Message.info("新增成功");
                    this.getMerchant(); // 重新获取数据
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
          } else if (this.modalTitle == "编辑【商户】") {
            if (this.tabIndex == 1) {
              if (this.strPre == JSON.stringify(this.formValidatePre)) {
                this.isShow = false;
                this.loading = false;
              } else {
                this.formValidatePre.auditStatus = 1;
                this.formValidatePre.areaNames = this.formValidatePre.NewareaNames.join(
                  ","
                );
                this.formValidatePre.receiveName = this.formValidatePre.name;
                this.formValidatePre.receiveCard = this.formValidatePre.card;
                editChannelApply(this.formValidatePre)
                  .then(res => {
                    if (res.data.code == 200) {
                      this.loading = false;
                      this.isShow = false;
                      this.$Message.info("修改成功");
                      this.getMerchant();
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
            } else if (this.tabIndex == 2) {
              if (this.strEnt == JSON.stringify(this.formValidateEnt)) {
                this.isShow = false;
                this.loading = false;
              } else {
                this.formValidateEnt.auditStatus = 1;
                this.formValidateEnt.areaNames = this.formValidateEnt.NewareaNames.join(
                  ","
                );
                this.formValidateEnt.companyName = this.formValidateEnt.channelName;
                editChannelApply(this.formValidateEnt)
                  .then(res => {
                    if (res.data.code == 200) {
                      this.loading = false;
                      this.isShow = false;
                      this.$Message.info("修改成功");
                      this.getMerchant();
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
            }
          }
        }
      });
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
        parentId: this.parentId,
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
          });
        }
      });
    },
    // 查询渠道商的业务范围
    getMerchantCategorySale() {
      searchMerchantCategorySale(this.saleChannelId, this.businessStr).then(
        res => {
          if (res.data.code == 200) {
            this.saleData = res.data.result;
            this.saleData.forEach((item, index) => {
              item.activityAuthority == 1
                ? (item.activityAuthority = true)
                : (item.activityAuthority = false);
              item.benefitPercent == null
                ? (item.benefitPercent = 0)
                : (item.benefitPercent = item.benefitPercent);
              // item.categoryId = this.saleList.find(
              //   v => v.categoryName == item.categoryName
              // ).id;
            });
          }
        }
      );
    },
    // 据终端设备收款码应用id查询终端设备收款码信息
    getQRcodeByChannelId() {
      searchQRcodeByChannelId(this.channelId).then(res => {
        if (res.data.code == 200) {
          this.QRcodeList = res.data.result;
          let array = [];
          this.QRcodeList.forEach(item => {
            array = [...array, item.auditType];
            if (item.payType == 1) {
              if (item.configStat == 1) {
                this.isSaveWX = false;
              } else {
                this.isSaveWX = true;
              }
            } else if (item.payType == 2) {
              if (item.configStat == 1) {
                this.isSaveZFB = false;
              } else {
                this.isSaveZFB = true;
              }
            }
          });
          if (array.includes(3)) {
            this.auditType = 3;
          } else if (array.includes(2) && !array.includes(1)) {
            this.auditType = 2;
          } else if (array.includes(1)) {
            this.auditType = 1;
          }
        }
      });
    },
    // 检查校验
    searchFastCheck() {
      getFastCheck(this.checkParam, this.checkType).then(res => {
        if (res.data.code == 200) {
          if (!res.data.result) {
            if (this.checkType == 1) {
              this.$Message.error("用户名已存在，请重新输入");
              this.tabIndex == 1
                ? (this.formValidatePre.userName = null)
                : (this.formValidateEnt.userName = null);
            } else if (this.checkType == 2) {
              this.$Message.error("电话号码已存在，请重新输入");
              this.tabIndex == 1
                ? (this.formValidatePre.phone = null)
                : (this.formValidateEnt.phone = null);
            }
          }
        }
      });
    },
    // 查询收款余额
    searchPrice() {
      getPrice(this.$store.state.user.channelId).then(res => {
        if (res.data.code == 200) {
          this.balance = res.data.result.balance;
          this.receivableAmount = res.data.result.receivableAmount;
          this.refundAmount = res.data.result.refundAmount;
          this.settlementAmount = res.data.result.settlementAmount;
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
  mounted() {
    this.getMerchant();
    this.getProductType();
    this.getQRcodeByChannelId();
    if (this.$store.state.user.merchant.receiveTerminal == 2) {
      this.searchPrice();
    }
  }
};
</script>
<style lang="less" scoped>
.channelMerchants {
  .leftBox {
    // min-height: 900px;
    // float: left;
    // margin-right: 20px;
    .QRcode {
      margin: 0 auto;
      width: 206px;
      border: 1px solid #fff;
      padding: 15px 10px 0 10px;
      font-size: 14px;
      box-shadow: 0px 3px 5px 0px rgba(4, 0, 0, 0.2);
      border-radius: 4px;
      .ivu-divider-horizontal {
        margin: 8px 0;
      }
      .top {
        .topText {
          float: right;
        }
      }
      .content {
        font-size: 16px;
        font-weight: 700;
        margin: 10px 0;
        .price {
          overflow: hidden;
          .num {
            float: left;
            .PoptipTitle {
              // font-size: 12px;
              ul {
                overflow: hidden;
                margin: 10px 0;
                li {
                  float: left;
                  list-style: none;
                  margin-right: 30px;
                  text-align: center;
                  font-size: 14px;

                  p.textMore {
                    font-size: 12px;
                    font-weight: 400;
                  }
                }
              }
              .ivu-divider-horizontal {
                margin: 18px 0 10px 0;
              }
              .ivu-btn {
                float: right;
                margin-right: 0px;
              }
              .close {
                cursor: pointer;
              }
            }
            .numText {
              color: #2d8cf0;
            }
            .numText:hover {
              text-decoration: underline;
              cursor: pointer;
            }
          }
          .eye {
            float: right;
            img:hover {
              cursor: pointer;
            }
          }
        }
      }
      .btn {
        margin: 10px 42px;
      }
      .span {
        text-align: center;
        font-size: 14px;
      }
      .remark {
        text-align: center;
      }
    }
  }
}
.QRfooter {
  /deep/.ivu-modal-footer {
    border: 0;
    padding: 0px 0px 12px 0px;
  }
}
u-divider-horizontal {
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
  margin: 10px 0 30px 0;
  .check-text {
    color: #999;
    font-size: 10px;
  }
  .attestation {
    float: left;
    width: 100%;
    /deep/ .ivu-form-item-content {
      margin-left: 0px !important;
      line-height: 20px;
      // margin-top: -10px;
    }
  }
}
.ivu-form-item {
  margin-bottom: 20px;
}
.card_image {
  text-align: center;
  width: 143px;
  height: 100px;
  margin-top: 10px;
  margin-right: 10px;
  box-sizing: border-box;
  .ivu-form-item-content {
    margin-left: 0px !important;
  }
  /deep/ .ivu-form-item-error-tip {
    margin-left: 16%;
  }
  /deep/.ivu-upload-list-file-finish {
    display: none;
  }
  #exampleImg {
    background: url("../../../assets/images/example.png") no-repeat 0px 0px;
    width: 662px;
    height: 317px;
    position: absolute;
    bottom: 20px;
    z-index: 22;
    border: 2px solid green;
    display: none;
  }
  .example:hover #exampleImg {
    display: block;
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
</style>
