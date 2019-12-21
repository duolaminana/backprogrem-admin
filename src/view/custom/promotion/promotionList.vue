<template>
  <div class="activity">
    <div class="leftBox">
      <channel-tree @clickTreeRow="clickTreeRow" ref='channelTree'></channel-tree>
    </div>
    <div class="rightDiv">
      <Input v-model="activityName" style="margin-right:10px" placeholder="活动名称" clearable />
      <Input v-model="machineCode" style="margin-right:10px" placeholder="设备编码" clearable />
      <Button type="primary" @click="searchSearchActivity" v-if="hasPerm('act:actList:see')">查询</Button>
      <Button type="primary" @click="reset" v-if="hasPerm('act:actList:see')">重置</Button>
      <Button
        type="primary"
        @click="addModal"
        class="xzbtn"
        relationDatarelationData
        v-if="channelId==$store.state.user.channelId&&hasPerm('act:actList:edit')"
      >新增</Button>

      <Table
        highlight-row
        :columns="columns"
        :data="dataTable"
        border
        ref="table"
        style="margin:20px 0"
      >
        <!-- 活动详情 -->
        <template slot-scope="{row,index}" slot="activityMore">
          <a class="lookDetails" @click="seeMore(row)">查看详情</a>
        </template>
        <!-- 活动时间 -->
        <template slot-scope="{row,index}" slot="activityTime">
          <span>{{row.startDate}} ~ {{row.endDate}}</span>
        </template>
        <!-- 关联设备 -->
        <template slot-scope="{row,index}" slot="num">
          <a
            class="lookDetails"
            v-if="row.activityMode==2&&hasPerm('act:actList:edit')&&channelId==$store.state.user.channelId"
            @click="showRelation(row)"
          >{{row.num}}台</a>
          <span v-if="row.activityMode==1">全部</span>
          <span
            v-if="(!hasPerm('act:actList:edit')||channelId!=$store.state.user.channelId)&&row.activityMode==2"
          >{{row.num}}台</span>
        </template>
        <!-- 活动状态 -->
        <template slot-scope="{row,index}" slot="status">
          <span v-show="row.status==0" style="color:#2d8cf0">待开始</span>
          <span v-show="row.status==1&&row.publish" style="color:#19be6b">活动中(已启用)</span>
          <span v-show="row.status==1&&!row.publish" style="color:#afb2b7">活动中(已停用)</span>
          <span v-show="row.status==2" style="color:#afb2b7">已结束</span>
        </template>
        <!-- 操作 -->
        <template slot-scope="{row,index}" slot="operation">
          <!-- 状态按钮 -->
          <Button
            type="primary"
            size="small"
            @click="toOpen(row)"
            v-if="channelId==$store.state.user.channelId&&hasPerm('act:actList:edit')&&!row.publish&&row.status!=2"
          >启用</Button>
          <Button
            disabled
            size="small"
            v-if="channelId==$store.state.user.channelId&&hasPerm('act:actList:edit')&&!row.publish&&row.status==2"
          >启用</Button>
          <Button
            type="error"
            size="small"
            @click="toClose(row)"
            v-if="channelId==$store.state.user.channelId&&hasPerm('act:actList:edit')&&row.publish&&row.status!=2"
          >停用</Button>
          <Button
            disabled
            size="small"
            v-if="channelId==$store.state.user.channelId&&hasPerm('act:actList:edit')&&row.publish&&row.status==2"
          >停用</Button>
          <!-- 编辑按钮 -->
          <Button
            type="primary"
            size="small"
            :disabled="row.status==2||(row.status==1&&row.publish)"
            @click="editModal(row)"
            v-if="channelId==$store.state.user.channelId&&hasPerm('act:actList:edit')"
          >编辑</Button>
          <!-- 删除按钮 -->
          <Button
          style="margin-right:0px"
            type="error"
            size="small"
            :disabled="row.status==1&&row.publish"
            @click="modalDel=true;delID=row.id;delIndex=index;changeData.id=row.id"
            v-if="channelId==$store.state.user.channelId&&hasPerm('act:actList:edit')"
          >删除</Button>
        </template>
      </Table>
      <Page
        :total="total"
        show-elevator
        :current="pageNum"
        @on-change="pageChange"
        :page-size="pageSize"
        @on-page-size-change="sizeChange"
        show-sizer
      />
    </div>
    <!-- 删除 -->
    <delete-component
      :modalDel="modalDel"
      :del_loading="modal_loading"
      @cancel="delCancel"
      @del="del"
    ></delete-component>
    <!-- 新增弹框的模态框 -->
    <Modal v-model="isShow" :mask-closable="false" :title="modalTitle" width="660">
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate">
        <FormItem label="活动名称：" class="activityName" prop="activityName">
          <Input
            v-model="formValidate.activityName"
            placeholder="活动名称"
            style="width: 220px"
            :disabled="isdisabled"
          ></Input>
        </FormItem>
        <Divider />
        <FormItem label="活动时间：" prop="startDate">
          <DatePicker
            style="width:220px"
            class="startvalue"
            type="datetime"
            :options="startOptions"
            placeholder="开始时间"
            v-model="formValidate.startDate"
            :disabled="isdisabled"
            @on-change="handleChangeStart"
          ></DatePicker>
          <span style="line-height:32px">&nbsp&nbsp至&nbsp&nbsp</span>
          <DatePicker
            style="width:220px"
            class="endvalue"
            type="datetime"
            :options="endOptions"
            placeholder="结束时间"
            v-model="formValidate.endDate"
            :disabled="isdisabled"
            @on-change="handleChangeEnd"
          ></DatePicker>
        </FormItem>
        <Divider />
        <FormItem label prop style="margin-bottom:6px">
          <RadioGroup v-model="formValidate.activityMode" @on-change="radioGroupChange">
            <Radio label="2" :disabled="modalTitle!='新增【活动】'">低价促销</Radio>
            <Radio label="1" :disabled="modalTitle!='新增【活动】'">限免(仅限环保购物袋)</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem
          v-for="(item3, index) in formDynamic1"
          :key="'0'+index"
          v-show="modalTitle!='新增【活动】'"
        >
          <input
            v-if="productList[index]"
            disabled
            type="text"
            style="width:360px;height:30px;"
            v-model="productList[index].boxVo.label"
          />
          <div v-if="isLimitedEdition==2" style="display:inline-block">
            <span>&nbsp&nbsp活动价格：</span>
            <Input
              v-model="item3.activityPrice"
              placeholder="请输入"
              :disabled="isdisabled"
              style="width: 60px"
            ></Input>
            <span>&nbsp元&nbsp&nbsp&nbsp&nbsp</span>
          </div>
          <div v-if="isLimitedEdition==1" style="display:inline-block">
            <span>&nbsp&nbsp活动数量：</span>
            <Input
              v-model="item3.activityNum"
              placeholder="请输入"
              :disabled="isdisabled"
              style="width: 60px"
            ></Input>
            <span>&nbsp件&nbsp&nbsp&nbsp</span>
          </div>
          <Button type="error" size="small" :disabled="isdisabled" @click="handleRemove1(index)">删除</Button>
        </FormItem>
        <FormItem v-for="(item, index) in formDynamic" :key="index" v-show="modalTitle!='查看【活动】详情'">
          <Select
            style="width:360px"
            v-model="item.productCode"
            @on-change="fasleChose($event,index)"
          >
            <Option
              v-for="item1 in list"
              :value="item1.productCode"
              :label="'名称:'+item1.productName+'进价:'+item1.buyPrice+'售价:'+item1.salePrice"
              :key="item1.id"
            ></Option>
          </Select>
          <div v-if="isLimitedEdition==2" style="display:inline-block">
            <span>&nbsp&nbsp活动价格：</span>
            <Input
              v-model="item.activityPrice"
              @on-blur="inputChange($event,index,item.productCode)"
              placeholder="请输入"
              style="width: 60px"
            ></Input>
            <span>&nbsp元&nbsp&nbsp&nbsp&nbsp</span>
          </div>
          <div v-if="isLimitedEdition==1" style="display:inline-block">
            <span>&nbsp&nbsp活动数量：</span>
            <Input
              v-model="item.activityNum"
              @on-blur="inputChange($event,index,item.productCode)"
              placeholder="请输入"
              style="width: 60px"
            ></Input>
            <span>&nbsp件&nbsp&nbsp&nbsp</span>
          </div>
          <Button type="error" size="small" @click="handleRemove(index)">删除</Button>
        </FormItem>
        <FormItem v-show="modalTitle!='查看【活动】详情'">
          <Button type="primary" size="small" @click="handleAdd">新增</Button>
        </FormItem>
      </Form>

      <div slot="footer">
        <Button
          type="text"
          size="large"
          style="border:1px solid #c6c9ce"
          v-show="modalTitle!='查看【活动】详情'"
          @click="cancel"
        >取消</Button>
        <Button
          type="text"
          size="large"
          style="border:1px solid"
          v-show="modalTitle=='查看【活动】详情'"
          @click="isShow = false;"
        >关闭</Button>
        <Button
          type="primary"
          size="large"
          :loading="loading"
          v-show="modalTitle!='查看【活动】详情'"
          @click="getActivityModal('formValidate')"
        >确定</Button>
      </div>
    </Modal>

    <!-- 关联设备弹框的模态框 -->
    <relation-component
      v-if="relationData.length"
      :modal="relationModal"
      title="模板关联信息"
      :name="relationName"
      :datas="relationData"
      :keys="relationKeys"
      :render="render"
      @cancel="relationCancel"
      @sure="relationSure"
      :activitystatus="activitystatus"
    ></relation-component>
  </div>
</template>
<script>
import channelTree from "@/view/custom/components/channelTree";
import deleteComponent from "@/view/custom/components/deleteComponent";
import relationComponent from "@/view/custom/components/relationComponent";
import timeRange from "@/view/custom/components/timeRange";
import format from "@/plugin/format.js"; //格式化时间YYYY-MM-DD
import {
  searchActivity,
  searchProductChannelAll,
  addActivity,
  editActivity,
  searchactivityProduct,
  changeactivity,
  searchActivityMachine,
  addOrModifyActivityMachine
} from "@/api/http";
export default {
  components: {
    channelTree,
    deleteComponent,
    relationComponent,
    timeRange
  },
  name: "activity",

  data() {
    return {
      activitystatus: null,
      isLimitedEdition: null,
      timer: "",
      endDateList: [],
      startDateList: [],
      codeList: [],
      relationName: null,
      rowData: null,
      relationKeys: [],
      relationData: [],
      relationModal: false,
      formDynamic: [
        //新增的数据
        {
          productCode: null,
          activityPrice: null,
          activityNum: null
        }
      ],
      formDynamic1: [
        //活动商品的数据
        {
          productCode: null,
          activityPrice: null,
          activityNum: null
        }
      ],
      modalDel: false, //删除弹框显示方式
      modal_loading: false, //删除的loading
      delID: null, //删除的ID
      changeData: {
        id: null, //
        enable: null, //是否删除 0 未删除 1 已删除
        publish: null //是否启用 0 未启用 1 已启用
      },
      isShowModel: false, // 是否显示组件
      total: null, // 页码数
      delFormVisible: false, // 删除模态框显示方式
      isShow: false, // 弹框显示状态
      isdisabled: false, // 是否可编辑
      modalTitle: null, // 模式标题
      list: [], //渠道商的所有商品信息
      list2: [],
      productList: [], //活动的商品列表
      loading: false, //模态框确定按钮的延时
      // 新增模态框表单数据
      formValidate: {
        activityMode: "2",
        channelId: this.$store.state.user.channelId, // 渠道id
        operator: this.$store.state.user.userId, // 操作人
        operatorName: this.$store.state.user.userName, // 操作人姓名
        activityName: null, //活动名称
        startDate: "", //开始时间
        endDate: "", //结束时间
        enable: false, //是否删除（默认未删除）
        publish: true, //是否启用（默认启用）
        remark: "", // 备注
        list: [], //渠道商的所有商品信息
        productList: [] //活动的商品列表
      },
      // 新增模态框表单规则
      ruleValidate: {
        activityName: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          },
          { max: 8, message: "最多输入8个字符", trigger: "blur" }
        ]
      },
      total: null, // 页码数
      channelId: this.$store.state.user.channelId, // 渠道ID
      pageNum: 1, // 页码
      pageSize: 15, // 页容量
      activityName: null, //活动名称
      machineCode: null, //设备编码
      activityId: null, //活动id
      // 数据结构
      columns: [
        {
          title: "序号",
          type: "index",
          maxWidth: 60,
          minWidth: 30,
          align: "center"
        },
        {
          title: "活动名称",
          key: "activityName",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "优惠详情",
          slot: "activityMore",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "活动时间",
          slot: "activityTime",
          align: "center",
          minWidth: 180,
          tooltip: true
        },
        {
          title: "关联设备",
          slot: "num",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "操作人",
          key: "operatorName",
          align: "center",
          minWidth: 50,
          tooltip: true
        },
        {
          title: "操作时间",
          key: "createDate",
          align: "center",
          minWidth: 60,
          tooltip: true
        },
        {
          title: "活动状态",
          slot: "status",
          align: "center",
          minWidth: 80,
          tooltip: true
        },
        {
          title: "操作",
          align: "center",
          slot: "operation",
          width: 160,
          tooltip: true
        }
      ],
      // 数据
      dataTable: [],
      operator: this.$store.state.user.userId,
      operatorName: this.$store.state.user.userName,
      channelId: this.$store.state.user.channelId
    };
  },
  computed: {
    startOptions: function() {
      //开始时间的限制，不能选择结束时间之后的时间
      let limitTime = this.formValidate.endDate; //获取结束时间
      return {
        disabledDate(time) {
          if (limitTime) {
            return (
              time > new Date(limitTime) ||
              (time && time.valueOf() < Date.now() - 86400000)
            );
          } else {
            return time && time.valueOf() < Date.now() - 86400000;
          }
        }
      };
    },
    endOptions: function() {
      //结束时间的限制，不能选择开始时间之前的时间
      let limitTime = this.formValidate.startDate; //获取开始时间
      return {
        disabledDate(time) {
          if (limitTime) {
            return time < new Date(limitTime);
          } else {
            return time && time.valueOf() < Date.now() - 86400000;
          }
        }
      };
    }
  },
  methods: {
    radioGroupChange(value) {
      this.formDynamic = [
        { productCode: null, activityPrice: null, activityNum: null }
      ];
      this.formValidate.activityMode = value;
      this.isLimitedEdition = value;
      this.getProductChannelAll();
    },
    render(item) {
      if (item.disabled) {
        if (this.activitystatus != 2) {
          return `${item.machineCode} - ${item.label}(已关联) `;
        }
      }
      return `${item.machineCode} - ${item.label}`;
    },
    relationSure(list) {
      if (list.join(",") == this.relationKeys.join(",")) {
        return (this.relationModal = false);
      }
      const data = {
        activityId: this.rowData.id,
        list,
        channelId: this.channelId,
        operatorName: this.operatorName,
        operator: this.operator
      };
      addOrModifyActivityMachine(data).then(res => {
        if (res.data.code == 200) {
          this.relationModal = false;
          this.$Message.success("操作成功");
          this.getActivity();
        }
      });
    },
    showRelation(row) {
      console.log(row);
      this.rowData = row;
      this.relationName = row.activityName;
      this.activitystatus = row.status;
      let data = {
        channelId: this.channelId,
        activityId: row.id,
        startDate: row.startDate,
        endDate: row.endDate
      };
      searchActivityMachine(data).then(res => {
        if (res.data.code == 200) {
          this.relationData = res.data.result.data;
          this.relationKeys = res.data.result.targetKeys;
          this.relationModal = true;
          res.data.result.data.forEach(item => {
            item.value = item.label;
            item.label = item.machineCode + item.value;
          });
        }
      });
    },
    relationCancel() {
      this.relationModal = false;
    },
    handleChangeStart(value) {
      if (this.formValidate.startDate == "") {
        this.formValidate.endDate = "";
      } else {
        if (new Date(value).valueOf() < Date.now()) {
          this.formValidate.startDate = format(
            new Date(Date.now()),
            "YYYY-MM-DD HH:mm:ss"
          );
        } else {
          this.formValidate.startDate = format(
            new Date(value),
            "YYYY-MM-DD HH:mm:ss"
          );
        }
      }
    },
    handleChangeEnd(value) {
      if (this.formValidate.startDate == "") {
        this.$Message.error("请先选择活动开始时间!");
        this.formValidate.endDate = "";
      } else {
        new Date(value).valueOf() < Date.now()
          ? (this.formValidate.endDate = format(
              new Date(Date.now()),
              "YYYY-MM-DD HH:mm:ss"
            ))
          : (this.formValidate.endDate = value);
      }
    },

    handleAdd() {
      if (this.isLimitedEdition == 2) {
        if (this.formDynamic.length) {
          if (
            !this.formDynamic[this.formDynamic.length - 1].productCode ||
            !this.formDynamic[this.formDynamic.length - 1].activityPrice
          ) {
            return this.$Message.error("请将数据填写完整");
          }
        }
      } else {
        if (this.formDynamic.length) {
          if (
            !this.formDynamic[this.formDynamic.length - 1].productCode ||
            !this.formDynamic[this.formDynamic.length - 1].activityNum
          ) {
            return this.$Message.error("请将数据填写完整");
          }
        }
      }
      this.formDynamic.push({
        productCode: null,
        activityPrice: null,
        activityNum: null
      });
    },
    fasleChose(value, index) {
      this.isLimitedEdition == 2
        ? (this.formDynamic[index].activityPrice = "")
        : (this.formDynamic[index].activityNum = "");
      if (this.codeList.indexOf(value) != -1) {
        this.$Message.error("此商品已在活动列表中，请重新选择");
        this.$nextTick(() => {
          this.formDynamic[index].productCode = "";
          this.formDynamic[index].activityNum = "";
        });
      }
    },
    inputChange(event, index, code) {
      const value = event.target.value;
      const item = this.list.find(v => v.productCode == code);
      if (this.formValidate.activityMode == "1") {
        if (value <= 0) {
          this.$Message.error("活动数量需大于0，请重新输入");
          this.formDynamic[index].activityNum = "";
        }
        this.formDynamic[index].activityNum = parseInt(value);
      } else {
        // if (value < item.buyPrice) {
        //   this.$Message.error("活动价格需要高于成本价，请重新输入");
        //   this.formDynamic[index].activityPrice = "";
        // }
        this.formDynamic[index].activityPrice = parseFloat(value).toFixed(2);
      }
    },
    handleRemove(index) {
      this.formDynamic.splice(index, 1);
    },
    handleRemove1(index) {
      this.formDynamic1.splice(index, 1);
    },
    // 删除按钮操作
    delCancel() {
      this.modal_loading = false;
      this.modalDel = false;
    },
    del() {
      this.modal_loading = true;
      this.changeData.enable = true;
      changeactivity(this.changeData)
        .then(res => {
          // if (res.data.code == 200) {
          this.modal_loading = false;
          this.modalDel = false;
          this.delID = null; //删除的ID
          this.$Message.success("删除成功");
          this.dataTable.splice(this.delIndex, 1);
          this.delIndex = null; //删除的索引
          // }
        })
        .catch(err => {
          this.modal_loading = false;
        });
    },

    clickTreeRow(value) {
      if (value) {
        this.channelId = value.id;
        this.getActivity();
      }
    },
    // 用户重置按钮
    reset() {
      this.activityName = null;
      this.machineCode = null;
      this.pageNum = 1;
      this.pageSize = 15;
      this.total = null;
      this.channelId = this.$store.state.user.channelId;
      this.getActivity(); // 重新获取数据
      this.$refs.channelTree.getTreeData();
    },
    // 页码改变时触发
    pageChange(value) {
      this.pageNum = value;
      this.getActivity(); // 重新获取数据
    },
    // 页容量改变时触发
    sizeChange(value) {
      this.pageSize = value;
      this.getActivity(); // 重新获取数据
    },
    cancel() {
      this.loading = false;
      this.isShow = false;
      this.$Message.info("取消操作");
      this.$refs.formValidate.resetFields();
    },
    // 去启用
    toOpen(row) {
      this.changeData.id = row.id;
      this.changeData.publish = true;
      this.changeData.enable = false;
      changeactivity(this.changeData).then(res => {
        if (res.data.code == 200) {
          this.getActivity();
        }
      });
    },
    // 去停用
    toClose(row) {
      this.changeData.id = row.id;
      this.changeData.publish = false;
      this.changeData.enable = false;
      changeactivity(this.changeData).then(res => {
        if (res.data.code == 200) {
          this.getActivity();
        }
      });
    },
    // 新增点击事件
    addModal() {
      this.isdisabled = false;
      this.modalTitle = "新增【活动】";
      this.isShow = true;
      this.isLimitedEdition = 2;
      this.getProductChannelAll();
      this.formValidate = {
        channelId: this.$store.state.user.channelId, // 渠道id
        operator: this.$store.state.user.userId, // 操作人
        operatorName: this.$store.state.user.userName, // 操作人姓名
        activityMode: "2", //活动模式
        activityName: null, //活动名称
        startDate: "", //开始时间
        endDate: "", //结束时间
        enable: false, //是否删除（默认未删除）
        publish: true, //是否启用（默认启用）
        remark: "", // 备注
        list: []
      };
      this.formDynamic = [
        {
          productCode: null,
          activityPrice: null,
          activityNum: null
        }
      ];
      this.formDynamic1 = [];
    },
    // 查看详情
    seeMore(row) {
      this.isdisabled = true;
      this.modalTitle = "查看【活动】详情";
      this.formValidate = JSON.parse(JSON.stringify(row));
      this.formValidate.activityMode = row.activityMode + "";
      this.isLimitedEdition = row.activityMode;
      this.activityId = row.id;
      this.getActivityProduct();
      this.$nextTick(() => {
        this.isShow = true;
      });
    },
    // 编辑点击事件
    editModal(row) {
      console.log(row);
      this.isdisabled = false;
      this.modalTitle = "编辑【活动】";
      (this.formDynamic = [
        {
          productCode: null,
          activityPrice: null,
          activityNum: null
        }
      ]),
        (this.formValidate = JSON.parse(JSON.stringify(row)));
      this.formValidate.activityMode = row.activityMode + "";
      this.isLimitedEdition = row.activityMode;
      this.getProductChannelAll();
      this.activityId = row.id;
      this.getActivityProduct();
      this.$nextTick(() => {
        this.isShow = true;
      });
    },

    // 弹框确认的点击事件
    getActivityModal(name) {
      if (this.isLimitedEdition == 2) {
        if (this.formDynamic.length) {
          if (
            !this.formDynamic[this.formDynamic.length - 1].productCode ||
            !this.formDynamic[this.formDynamic.length - 1].activityPrice
          ) {
            return this.$Message.error("请将数据填写完整");
          }
        }
      } else {
        if (this.formDynamic.length) {
          if (
            !this.formDynamic[this.formDynamic.length - 1].productCode ||
            !this.formDynamic[this.formDynamic.length - 1].activityNum
          ) {
            return this.$Message.error("请将数据填写完整");
          }
        }
      }
      this.formValidate.startDate = format(
        this.formValidate.startDate,
        "YYYY-MM-DD HH:mm:ss"
      );
      this.formValidate.endDate = format(
        this.formValidate.endDate,
        "YYYY-MM-DD HH:mm:ss"
      );
      this.$refs[name].validate(valid => {
        if (valid) {
          // 对的
          this.loading = true;
          if (this.modalTitle == "新增【活动】") {
            // if(this.isLimitedEdition==1){
            //   this.formDynamic.activityNum=parseInt(this.formDynamic.activityNum)
            // }
            this.formValidate.list = this.formDynamic;
            addActivity(this.formValidate)
              .then(res => {
                if (res.data.code == 200) {
                  this.loading = false;
                  this.isShow = false;
                  this.$Message.info("新增成功");
                  this.getActivity();
                } else {
                  this.loading = false;
                  this.$Message.error(res.data.message);
                }
              })
              .catch(err => {
                this.loading = false;
                this.$Message.error(res.data.message);
              });
          } else if (this.modalTitle == "编辑【活动】") {
            this.formValidate.list = [
              ...this.formDynamic,
              ...this.formDynamic1
            ];

            editActivity(this.formValidate)
              .then(res => {
                if (res.data.code == 200) {
                  this.loading = false;
                  this.isShow = false;
                  this.$Message.info("修改成功");
                  this.getActivity();
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
      });
    },

    // 获取渠道商所有的商品信息
    getProductChannelAll() {
      searchProductChannelAll(this.channelId, this.isLimitedEdition).then(
        res => {
          if (res.data.code == 200) {
            this.formValidate.list = res.data.result;
            this.list = res.data.result;
          }
        }
      );
    },
    searchSearchActivity() {
      this.pageNum = 1;
      this.getActivity();
    },
    // 获取活动信息
    getActivity() {
      let data = {
        channelId: this.channelId,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        activityName: this.activityName,
        machineCode: this.machineCode
      };
      return searchActivity(data).then(res => {
        if (res.data.code == 200) {
          this.dataTable = res.data.result.list;
          this.total = res.data.result.total;
          this.pageNum = res.data.result.pageNum;
          this.dataTable.forEach(item => {
            if (item.status == 0) {
              this.startDateList.push(item.startDate);
              this.endDateList.push(item.endDate);
            }
          });
        }
      });
    },
    // 获取活动商品列表
    getActivityProduct() {
      this.formDynamic1 = [];
      let data = {
        channelId: this.channelId,
        activityId: this.activityId
      };
      searchactivityProduct(data).then(res => {
        if (res.data.code == 200) {
          this.productList = res.data.result;
          this.productList.forEach((item, index) => {
            const { productCode, activityPrice, activityNum } = item;
            this.formDynamic1.push({
              productCode,
              activityPrice,
              activityNum
            });
          });
        }
      });
    }
  },
  mounted() {
    this.getActivity();
    
    // this.getActivity().then(() => {
    //   this.countDown();
    // });
    // this.getProductChannelAll();
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
  watch: {
    formDynamic1: {
      handler: function(newValue, oldValue) {
        const arr = [];
        newValue.forEach(item => {
          arr.push(item.productCode);
        });
        this.formDynamic.forEach(item => {
          if (item.productCode) {
            arr.push(item.productCode);
          }
        });
        this.codeList = arr;
      },
      deep: true
    },
    formDynamic: {
      handler: function(newValue, oldValue) {
        const arr = [];
        newValue.forEach(item => {
          if (item.productCode != null) {
            arr.push(item.productCode);
          }
        });
        this.formDynamic1.forEach(item => {
          arr.push(item.productCode);
        });
        this.codeList = arr;
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.activity {
  .ivu-input-wrapper {
    width: 300px;
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
  .ivu-form-item {
    margin-bottom: 0px;
  }
  .leftBox {
    min-height: 780px;
    float: left;
    margin-right: 20px;
  }
  .lookDetails {
    text-decoration: underline;
  }
}
.activityName {
  /deep/ .ivu-form-item-label:before {
    content: "";
  }
}
</style>
