<template>
  <div class="commodityTypes">
    <div class="leftBox">
      <channel-tree @clickTreeRow="clickTreeRow" ref='channelTree'></channel-tree>
    </div>
    <div class="rightDiv">
      <Select v-model="rangeValue" class="marginRight" placeholder="销售范围" clearable>
        <Option v-for="item in rangeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
      <Input v-model="name" placeholder="分类名称" clearable class="marginRight" />
      <Button  @click="clickQuery" type="primary">查询</Button>
      <Button  @click='reset' type="primary">重置</Button>
      <Button type="primary" @click="showNewlyAdded('xz')" class="xzbtn" icon="md-add" v-if="channelId==$store.state.user.userVo.channelId&&hasPerm('pro:type:edit')">新增</Button>
      <Table border ref="selection" :columns="columns" :data="datas">
        <template slot-scope="{ row, index }" slot="edit">
          <Button v-if="channelId==$store.state.user.userVo.channelId&&hasPerm('pro:type:edit')" type="primary" size="small" class="marBtn" @click="showNewlyAdded('bj',index)">编辑</Button>
          <Button v-if="channelId==$store.state.user.userVo.channelId&&hasPerm('pro:type:edit')" type="error" size="small" @click="modalDel=true;delID=row.id;delIndex=index">删除</Button>
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
    <Modal
      v-model="newlyAdded"
      width="600"
      :title="showNewlyType=='xz'?'新增渠道商商品分类':'编辑渠道商商品分类'"
      :mask-closable="false"
    >
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
        <FormItem label="销售范围"  prop="categoryId" class='modelInput'>
          <Select v-model="formValidate.categoryId">
              <Option v-for="item in rangeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <Divider />
        <FormItem label="分类名称" prop="categoryName" class='modelInput'>
          <Input v-model.trim="formValidate.categoryName" placeholder="例如：芙蓉王" />
        </FormItem>
        <FormItem label="备注" prop="remark" class='modelInput'>
          <Input v-model.trim="formValidate.remark" placeholder="请输入备注" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="newlyAdded=false">取消</Button>
        <Button type="primary" size="large" :loading="sure_loading" @click="Added(formValidate,'formValidate')">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import { netWorkGoods } from "@/api/data";
import channelTree from "../components/channelTree";
import deleteComponent from "@/view/custom/components/deleteComponent";
export default {
  components: {
    channelTree,
    deleteComponent
  },
  name: "commodityTypes",
  data() {
    return {
      valueInput:5,
      rangeValue:null,
      rangeList:[],
      sure_loading:false,
      modalDel: false,
      modal_loading: false, //删除的loading
      delID: null, //删除的ID
      delIndex: null, //删除的索引
      pIdValue: [],
      showNewlyType: "xz",
      newlyAdded: false, //新增按钮的弹框
      formValidate: {
        //新增字段
        categoryName: null, //分类名称
        remark: null, //备注
        categoryId:null,
      },
      ruleValidate: {
        categoryName: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "blur"
          },
          { max: 8, message: "长度最多是8个字符", trigger: "blur" }
        ],
        remark: [
          { max: 20, message: "长度最多是20个字符", trigger: "blur" }
        ],
        categoryId: [
          {
            required: true,
            message: "输入不能为空",
            trigger: "change",
            type:'number'
          }
        ],
      },
      pageNum: 1, //当前页数
      total: null, //总条数
      pageSize: 15, //每页条数
      name: null,
      datas: [],
      columns: [
        {
          title: '序号',
          type: 'index',
          width:80,
          align: 'center',
        },
        {
          title: '销售范围',
          key: 'categoryScope',
          align: 'center',
          tooltip:true
        },
        {
          title: "分类名称",
          key: "categoryName",
          align: "center",
          tooltip: true
        },
        {
          title: "操作人姓名",
          key: "operatorName",
          align: "center",
          tooltip: true
        },
        {
          title: "备注",
          key: "remark",
          align: "center",
          tooltip: true
        },
        {
          title: "创建时间",
          key: "createDate",
          align: "center",
          tooltip: true
        },
        {
          title: "修改时间",
          key: "updateDate",
          align: "center",
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
    clickQuery(){
      this.pageNum = 1;
      this.getPageDatas();
    },
    reset(){
      this.rangeValue = null;
      this.pageNum = 1;
      this.total = null;
      this.pageSize = 15;
      this.name = null;
      this.channelId = this.$store.state.user.channelId;
      this.getPageDatas();
      this.$refs.channelTree.getTreeData();
    },
    delCancel() {
      this.modal_loading = false;
      this.modalDel = false;
    },
    clickTreeRow(value) {
      if (value) {
        this.channelId = value.id;
        this.getPageDatas();
      }
    },
    del() {
      this.modal_loading = true;
      let url = "/categoryChannel/categoryChannelDelete?id=" + this.delID;
      netWorkGoods(url)
        .then(res => {
          this.modal_loading = false;
          this.modalDel = false;
          this.datas.splice(this.delIndex, 1);
          this.delID = null; //删除的ID
          this.delIndex = null; //删除的索引
          this.$Message.success("删除成功");
        })
        .catch(err => {
          this.modal_loading = false;
        });
    },
    async showNewlyAdded(type, index) {
      await this.initialization('formValidate');
      this.showNewlyType = type;
      this.sure_loading = false;
      //初始化数据
      this.formValidate = {
        //新增字段
        categoryName: null, //分类名称
        remark:null, //备注
        categoryId:null,
      };
      this.pIdValue = [];
      if (type == "bj") {
        this.formValidate = JSON.parse(JSON.stringify(this.datas[index]));
      }
      this.newlyAdded = true;
    },
    Added(value,name) {
      this.sure_loading = true;
      this.$refs[name].validate(valid => {
        if (valid) {
          let { categoryName, remark,categoryId } = value;
          if (this.showNewlyType == "xz") {
            let data = {
              categoryName,
              remark,
              categoryId,
              operator: this.operator,
              operatorName: this.operatorName,
              channelId: this.channelId
            };
            netWorkGoods("/categoryChannel/categoryChannelSave", data).then(
              res => {
                this.getPageDatas(); //刷新页面
                this.newlyAdded = false;
                this.$Message.success("新增成功");
                this.sure_loading = false;
              }).catch(()=>{
                this.sure_loading = false;
              });
          } else if (this.showNewlyType == "bj") {
            let data = {
              categoryName,
              categoryId,
              remark,
              id: value.id,
              operator: this.operator,
              operatorName: this.operatorName,
              channelId: this.channelId
            };
            netWorkGoods("/categoryChannel/categoryChannelModified", data).then(
              res => {
                this.getPageDatas(); //刷新页面
                this.newlyAdded = false;
                this.$Message.success("编辑成功");
                this.sure_loading = false;
              }).catch(()=>{
                this.sure_loading = false;
              });
          }
        } else {
          this.sure_loading = false;
        }
      })
      
    },
    pageChange(value) {
      this.pageNum = value;
      this.getPageDatas();
    },
    sizeChange(value) {
      this.pageSize = value;
      this.getPageDatas();
    },
    getRange(){
      const url = `/channelBusiness/queryChannelBusinessByChannelId?channelId=${this.channelId}`
      return netWorkGoods(url,null,'get').then(res=>{
        this.rangeList = res.result.map(v=> {
          return {value:v.categoryId,label:v.categoryName}
        })
      })
    },
    getPageDatas() {
      let data = {
        categoryName: this.name,
        channelId: this.channelId,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        categoryId:this.rangeValue
      };
      netWorkGoods("/categoryChannel/findCategoryChannelPage", data).then(
        res => {
          this.pageNum = res.result.pageNum;
          this.total = res.result.total;
          this.datas = res.result.list;
        }
      );
    }
  },
  mounted() {
    // this.$Spin.show()
    let p1 = this.getPageDatas();
    this.getRange();
    // Promise.all('p1').then(()=>{
    //   this.$Spin.hide()
    // }).catch(()=>{
    //   this.$Spin.hide()
    // })
  }
};
</script>

<style lang="less" scoped>
.commodityTypes {
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
  /deep/ .ivu-table-cell {
    padding-left: 0px;
    padding-right: 0px;
  }
  .ivu-page {
    text-align: center;
    margin-top: 10px;
  }
  .leftBox {
    // min-width: 250px;
    min-height: 900px;
    float: left;
    margin-right: 20px;
  }
}
</style>
