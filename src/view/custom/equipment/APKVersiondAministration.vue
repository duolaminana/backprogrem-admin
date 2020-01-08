<template>
  <div class="APKVersiondAministration">
    <div>
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
      <Table border ref="selection" :columns="columns" :data="datas">
        <template slot-scope="{ row, index }" slot="publishStatus">
          <span v-show="row.publishStatus==0">未发布</span>
          <span v-show="row.publishStatus==1">已发布</span>
        </template>
        <template slot-scope="{ row, index }" slot="edit">
          <Button
            type="success"
            size="small"
            class="marBtn"
            @click="enable(row,index)"
            v-show="row.enable==0"
          >启用</Button>
          <Button
            type="error"
            size="small"
            class="marBtn"
            @click="enable(row,index)"
            v-show="row.enable==1"
          >禁用</Button>
          <Button
            type="success"
            size="small"
            class="marBtn"
            @click="Release(row,index)"
            v-show="row.publishStatus==0"
          >发布</Button>
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
    <!-- 新增弹框的模态框 -->
    <Modal
      v-model="newlyAdded"
      width="600"
      :title="showNewlyType=='xz'?'新增apkVersiond':'编辑apkVersiond'"
      :mask-closable="false"
    >
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
        <FormItem label="应用版本号" prop="apkCode">
          <Input v-model.trim="formValidate.apkCode" placeholder />
        </FormItem>
        <FormItem label="应用" prop="apkId">
          <Select v-model="formValidate.apkId" :clearable="true">
            <Option v-for="item in apkList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="上传apk" prop="apkUrl">
          <template>
            <Upload
              :action="Upload"
              name="multipartFile"
              :on-format-error="formtError"
              :on-error="onError"
              :on-success="imgSuccess"
              :before-upload = 'beforeUpload'
            >
              <Button icon="ios-cloud-upload-outline">上传apk</Button>
            </Upload>
          </template>
        </FormItem>
        <FormItem label="apk链接" prop="apkUrl">
          <Input v-model.trim="formValidate.apkUrl" placeholder />
        </FormItem>
        <FormItem label="md5" prop="apkMd5">
          <Input v-model.trim="formValidate.apkMd5" placeholder />
        </FormItem>
        <FormItem label="升级描述" prop="upgradeDesc">
          <Input v-model.trim="formValidate.upgradeDesc" placeholder />
        </FormItem>
        <FormItem label="备注" prop="remark">
          <Input v-model.trim="formValidate.remark" placeholder />
        </FormItem>
        <FormItem label="是否启用">
          <RadioGroup v-model="formValidate.enable">
            <Radio label="1">
              <span>启用</span>
            </Radio>
            <Radio label="0">
              <span>不启用</span>
            </Radio>
          </RadioGroup>
        </FormItem>
      </Form>
      <template slot="footer">
        <Button type="text" size="large" @click="newlyAdded=false">取消</Button>
        <Button type="primary" size="large" @click="Added(formValidate,0,'formValidate')">确定</Button>
        <Button type="success" size="large" @click="Added(formValidate,1,'formValidate')">发布</Button>
      </template>
    </Modal>
  </div>
</template> 
<script>
import { netWorkDevice, Upload } from "@/api/data";
export default {
  name: "APKVersiondAministration",
  props:['rowData'],
  data() {
    return {
      Upload,
      formValidate: {
        //新增字段
        apkCode: null,
        apkId:null,
        upgradeDesc: null,
        remark: null,
        enable: "1",
        apkUrl: null,
        apkFile: null,
        apkSize: null,
        apkMd5:null,
      },
      ruleValidate: {
        apkCode: [
          {
            required: true,
            message: "不能为空",
            trigger: "blur"
          }
        ],
        apkId: [
          {
            required: true,
            message: "不能为空",
            trigger: "change"
          }
        ],
        apkUrl: [
          {
            required: true,
            message: "未上传apk",
            trigger: "change"
          }
        ],
        apkMd5: [
          {
            required: true,
            message: "md5不能为空",
            trigger: "change"
          }
        ],
        upgradeDesc: [
          {
            required: true,
            message: "不能为空",
            trigger: "blur"
          }
        ],
      },
      showNewlyType: "xz",
      newlyAdded: false,
      apkList: [],
      apkId: null,
      machineType: null,
      machineTypeList: [],
      pageNum: 1,
      total: null,
      pageSize: 15,
      datas: [],
      columns: [
        {
          title: "apk地址",
          key: "apkUrl",
          align: "center",
          tooltip: true
        },
        {
          title: "apk文件",
          key: "apkFile",
          align: "center",
          tooltip: true
        },
        {
          title: "应用名称",
          key: "apkName",
          align: "center",
          tooltip: true
        },
        {
          title: "版本号",
          key: "apkCode",
          align: "center",
          tooltip: true
        },
        {
          title: "应用大小",
          key: "apkSize",
          align: "center",
          tooltip: true
        },
        {
          title: "升级描述",
          key: "upgradeDesc",
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
          title: "apk是否发布",
          align: "center",
          slot: "publishStatus",
          tooltip: true
        },
        {
          title: "操作",
          align: "center",
          slot: "edit",
          width: "200",
          tooltip: true
        }
      ],
      operator: this.$store.state.user.userId,
      operatorName: this.$store.state.user.userName,
      channelId: this.$store.state.user.channelId
    };
  },
  methods: {
    // 重置按钮
    reset() {
      this.apkId = null;
      this.machineType = null;
      this.pageNum = 1;
      this.getPageDatas();
    },
    Release(row, index) {
      let { id } = row;
      let data = {
        publishStatus: 1,
        id
      };
      netWorkDevice("/apkVersion/modify", data)
        .then(res => {
          this.$set(this.datas[index], "publishStatus", 1);
          this.$Message.success("操作成功");
        })
        .catch(err => {
          this.$Message.error(err);
        });
    },
    enable(row, index) {
      let { enable, id } = row;
      let data = {
        enable: enable == 1 ? 0 : 1,
        id
      };
      netWorkDevice("/apkVersion/modify", data).then(res => {
        this.$set(this.datas[index], "enable", data.enable);
        this.$Message.success("操作成功");
      });
      // .catch(err => {
      //   this.$Message.error(err);
      // });
    },
    async showNewlyAdded(type, index, row) {
      await this.initialization('formValidate');
      this.showNewlyType = type;
      //初始化数据
      this.formValidate = {
        //新增字段
        apkCode: null,
        apkId: null,
        upgradeDesc: null,
        remark: null,
        enable: "1",
        apkUrl: null,
        apkFile: null,
        apkSize: null,
        apkMd5:null
      };
      if (type == "bj") {
        
        this.formValidate = JSON.parse(JSON.stringify(row));
        console.log(1111);
        // this.formValidate.enable = this.formValidate.enable.toString();
        this.formValidate.apkId = this.formValidate.apkId.toString();
        console.log(row);
        console.log(this.formValidate.enable);
      }
      this.newlyAdded = true;
    },
    Added(value, publishStatus,name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          let {
            apkCode,
            apkId,
            upgradeDesc,
            remark,
            enable,
            apkUrl,
            apkFile,
            apkSize,
            apkMd5
          } = value;
          if (this.showNewlyType == "xz") {
            let data = {
              apkCode,
              apkId,
              upgradeDesc,
              remark,
              enable,
              apkUrl,
              apkFile,
              apkSize,
              apkMd5,
              publishStatus,
              operator: this.operator,
              operatorName: this.operatorName,
              channelId: this.channelId
            };
            netWorkDevice("/apkVersion/upload", data).then(res => {
              this.getPageDatas(); //刷新页面
              this.newlyAdded = false;
              this.$Message.success("新增成功");
            });
          } else if (this.showNewlyType == "bj") {
            let data = {
              apkCode,
              apkId,
              upgradeDesc,
              remark,
              enable,
              apkUrl,
              apkFile,
              apkSize,
              apkMd5,
              publishStatus,
              operator: this.operator,
              operatorName: this.operatorName,
              channelId: this.channelId,
              id: value.id
            };
            netWorkDevice("/apkVersion/modify", data).then(res => {
              this.getPageDatas(); //刷新页面
              this.newlyAdded = false;
              this.$Message.success("编辑成功");
            });
          }
        }
      })
    },
    beforeUpload(){
      this.$set(this.formValidate, "apkUrl", null);
      this.formValidate.apkFile = null;
      this.formValidate.apkMd5 = null;
      this.formValidate.apkSize = null;
    },
    formtError(file, fileList) {
      this.$Message.error("上传文件类型错误");
    },
    onError(error) {
      this.$Message.error("上传失败");
    },
    imgSuccess(response, file) {
      if (response.code === 200) {
        this.$set(this.formValidate, "apkUrl", response.result.url);
        this.formValidate.apkFile = response.result.key;
        this.formValidate.apkMd5 = response.result.md5;
        this.formValidate.apkSize = (file.size / 1024 / 1024).toFixed(2) + "M";
        this.$Message.success("上传成功");
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
        apkId:this.apkId?this.apkId:this.rowData.id,
        machineType: this.machineType,
        channelId: this.channelId,
        pageNum: this.pageNum,
        pageSize: this.pageSize
      };
      netWorkDevice("/apkVersion/list", data).then(res => {
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
