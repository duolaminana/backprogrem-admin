<template>
  <div>
    <div style='display: inline-block;vertical-align: top;width:39%;margin-right:2%'>
      <div style="overflow: hidden;">
        <Select v-model="apkId" class="marginRight" :clearable="true" placeholder="应用">
          <Option v-for="item in apkList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <Select v-model="machineType" class="marginRight" :clearable="true" placeholder="机型">
          <Option
            v-for="item in machineTypeList"
            :value="item.value"
            :key="item.value"
          >{{ item.label }}</Option>
        </Select>
        <Button type="primary" @click="getPageDatas">查询</Button>
        <Button type="primary" @click="showNewlyAdded('xz')" class="xzbtn">新增</Button>
        <Button type="primary" @click="reset">重置</Button>
        <Table border ref="selection" :columns="columns" highlight-row :data="datas" @on-row-click='tableClick'>
          <template slot-scope="{ row, index }" slot="img">
            <viewer :images="[row.iconAddress]">
              <img :src="row.iconAddress" />
            </viewer>
          </template>
          <template slot-scope="{ row, index }" slot="edit">
            <Button
              type="primary"
              size="small"
              class="marBtn"
              @click="showNewlyAdded('bj',index,row)"
            >编辑</Button>
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
    </div>
    <apk-ver ref='apkVer' :rowData='tableRowData' style='display: inline-block;vertical-align: top;width:59%;'></apk-ver>
    <!-- 新增弹框的模态框 -->
    <Modal
      v-model="newlyAdded"
      width="600"
      :title="showNewlyType=='xz'?'新增apk':'编辑apk'"
      :mask-closable="false"
    >
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
        <FormItem label="apk名称" prop="apkName">
          <Input v-model.trim="formValidate.apkName" placeholder />
        </FormItem>
        <FormItem label="apk包名" prop="apkPackage">
          <Input v-model.trim="formValidate.apkPackage" placeholder />
        </FormItem>
        <FormItem label="机型" prop="machineType">
          <Select v-model="formValidate.machineType" :clearable="true">
            <Option
              v-for="item in machineTypeList"
              :value="item.value"
              :key="item.value"
            >{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="apk描述" prop="apkDesc">
          <Input v-model.trim="formValidate.apkDesc" placeholder />
        </FormItem>
        <FormItem label="备注" prop="remark">
          <Input v-model.trim="formValidate.remark" placeholder />
        </FormItem>
        <FormItem label="上传图片" prop="iconAddress">
          <img
            :src="formValidate.iconAddress"
            alt
            class="uploadImg"
            v-if="formValidate.iconAddress"
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
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="newlyAdded=false">取消</Button>
        <Button type="primary" size="large" @click="Added(formValidate)">确定</Button>
      </div>
    </Modal>
  </div>
</template> 
<script>
import { netWorkDevice, Upload } from "@/api/data";
import apkVer from './APKVersiondAministration'
export default {
  name: "APKAdministration",
  components:{
    apkVer
  },
  data() {
    return {
      tableRowData:{},
      Upload,
      formValidate: {
        //新增字段
        machineType: null,
        apkName: null,
        apkPackage: null,
        apkDesc: null,
        remark: null,
        icon: null,
        iconAddress: null
      },
      ruleValidate: {},
      showNewlyType: "xz",
      newlyAdded: false,
      apkList: [],
      apkId: null,
      machineType: null,
      machineTypeList: [],
      pageNum: 1,
      total: null,
      pageSize: 15,
      apkId: null,
      datas: [],
      columns: [
        {
          title: "apk名称",
          key: "apkName",
          align: "center",
          tooltip: true
        },
        {
          title: "apk包名",
          key: "apkPackage",
          align: "center",
          tooltip: true
        },
        {
          title: "应用版本号",
          key: "apkCode",
          align: "center",
          tooltip: true
        },
        {
          title: "apk描述",
          key: "apkDesc",
          align: "center",
          tooltip: true
        },
        {
          title: "备注",
          align: "center",
          key: "remark",
          tooltip: true
        },
        {
          title: "apk图标",
          align: "center",
          slot: "img",
          tooltip: true
        },
        {
          title: "操作",
          align: "center",
          slot: "edit",
          tooltip: true
        }
      ],
      operator: this.$store.state.user.userId,
      operatorName: this.$store.state.user.userName,
      channelId: this.$store.state.user.channelId
    };
  },
  methods: {
    tableClick(row){
      this.tableRowData = row;
      console.log(row)
      setTimeout(()=>{
        this.$refs.apkVer.getPageDatas();
      },1)
    },
    // 重置按钮
    reset() {
      this.apkId = null;
      this.machineType = null;
      this.pageNum = 1;
      this.getPageDatas();
    },
    showNewlyAdded(type, index, row) {
      this.showNewlyType = type;
      //初始化数据
      this.formValidate = {
        //新增字段
        machineType: null,
        apkName: null,
        apkPackage: null,
        apkDesc: null,
        remark: null,
        icon: null,
        iconAddress: null
      };
      if (type == "bj") {
        console.log(row);
        this.formValidate = JSON.parse(JSON.stringify(row));

        this.formValidate.machineType = this.formValidate.machineType.toString();
      }
      this.newlyAdded = true;
    },
    Added(value) {
      if (true) {
        let {
          machineType,
          apkName,
          apkPackage,
          apkDesc,
          remark,
          iconAddress,
          icon
        } = value;
        if (this.showNewlyType == "xz") {
          let data = {
            machineType,
            apkName,
            apkPackage,
            apkDesc,
            remark,
            iconAddress,
            icon,
            channelId: this.channelId
          };
          netWorkDevice("/apk/add", data).then(res => {
            this.getPageDatas(); //刷新页面
            this.$refs.apkVer.getapk()
            this.newlyAdded = false;
            this.$Message.success("新增成功");
          });
        } else if (this.showNewlyType == "bj") {
          let data = {
            machineType,
            apkName,
            apkPackage,
            apkDesc,
            remark,
            iconAddress,
            icon,
            operator: this.operator,
            operatorName: this.operatorName,
            channelId: this.channelId,
            id: value.id
          };
          netWorkDevice("/apk/modify", data).then(res => {
            this.getPageDatas(); //刷新页面
            this.newlyAdded = false;
            this.$Message.success("编辑成功");
          });
        }
      } else {
        this.$Message.error("信息填写不完整！");
      }
    },
    formtError(file, fileList) {
      this.$Message.error("上传文件类型错误");
    },
    onError(error) {
      this.$Message.error("上传失败");
    },
    imgSuccess(response) {
      if (response.code === 200) {
        this.$set(this.formValidate, "iconAddress", response.result.url);
        this.formValidate.icon = response.result.key;
        this.$Message.success("图片上传成功");
      } else if (response.code === 500) {
        this.$Message.error(response.message);
      }
    },
    pageChange(value) {
      this.pageNum = value;
      this.getPageDatas();
    },
    sizeChange(value) {
      this.pageSize = value;
      this.getPageDatas();
    },
    getEquipment() {
      let url = "/machineType/queryNameByCategoryId";
      netWorkDevice(url, null, "get").then(res => {
        this.machineTypeList = res.result;
      });
    },
    getapk() {
      let url = "/apk/queryApkNameByChannelId?channelId=" + this.channelId;
      netWorkDevice(url, null, "get").then(res => {
        this.apkList = res.result;
      });
    },
    getPageDatas() {
      let data = {
        apkId: this.apkId,
        machineType: this.machineType,
        channelId: this.channelId,
        pageNum: this.pageNum,
        pageSize: this.pageSize
      };
      netWorkDevice("/apk/list", data).then(res => {
        this.pageNum = res.result.pageNum;
        this.total = res.result.total;
        this.datas = res.result.list;
      });
    }
  },
  mounted() {
    this.getPageDatas();
    this.getEquipment();
    this.getapk();
  }
};
</script>

<style lang="less" scoped>
.ivu-btn {
  margin-right: 10px;
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
.ivu-table-cell {
  padding-left: 0px;
  padding-right: 0px;
}
.ivu-page {
  text-align: center;
  margin-top: 10px;
}
.ivu-table-cell img {
  width: 33px;
  height: 33px;
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
