<template>
  <div class="user-avator-dropdown">
    <Dropdown @on-click="handleClick">
      <Badge :dot="!!messageUnreadCount">
        <Avatar :src="userAvator"/>
        <span style='margin:0 10px'>欢迎您，{{name}}</span>
      </Badge>
      <Icon :size="18" type="md-arrow-dropdown"></Icon>
      <DropdownMenu slot="list">
        <DropdownItem name="password">密码修改</DropdownItem>
        <DropdownItem name="logo">更换logo</DropdownItem>
        <DropdownItem name="logout">退出登录</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    <Modal
      v-model="showLogo"
      title="更换logo"
    >
      <p style='margin-bottom:20px'>点击上传logo <span>(上传图片的大小不能超过100Kb)</span></p>
      <Upload
        class='uploadBox bigImg'
        ref = 'upload'
        :show-upload-list="false"
        :action="Upload"
        name="multipartFile"
        :format="['jpg','jpeg','png']"
        :before-upload="handleUpload"
        :on-format-error="formtError"
        :on-error="onError"
        :on-success="imgSuccess"
        :max-size="100"
      >
        <p style="margin-bottom:5px">logo1</p>
        <!-- <img  @click='ImgUpload(236,66,true)' :src="bigImgUrl?bigImgUrl:require('../../../../assets/images/add_img.png')" > -->
        <img  @click='ImgUpload(257,64,true)' :src="bigImgUrl?bigImgUrl:require('../../../../assets/images/add_img.png')" >
        <p style="color:#afb2b7">分辨率：257*64</p>
      </Upload>
      <Upload
        class='uploadBox'
        ref = 'upload'
        :show-upload-list="false"
        :action="Upload"
        name="multipartFile"
        :format="['jpg','jpeg','png']"
        :before-upload="handleUpload"
        :on-format-error="formtError"
        :on-error="onError"
        :on-success="imgSuccess"
        :max-size="100"
      >
        <p style="margin-bottom:5px">logo2</p>
        <img  @click='ImgUpload(44,44,false)' :src="smallImgUrl?smallImgUrl:require('../../../../assets/images/add_img.png')" >
        <p style="color:#afb2b7">分辨率：44*44</p>
      </Upload>
      <div slot="footer">
        <Button type="text" size="large" @click="showLogo=false">取消</Button>
        <Button type="primary" size="large" @click="logoSure">确定</Button>
      </div>
    </Modal>
    <img-tailoring
      :isShowCropper.sync = 'isShowCropper'
      :imgUrl.sync = 'imgUrl'
      :fileUpload = 'fileUpload'
      :autoCropWidth = 'autoCropWidth'
      :autoCropHeight = 'autoCropHeight'
      :fixedBox = 'true'
      @subeImg = 'subeImg'
    >
    </img-tailoring>
    <Modal
      v-model="showPswd"
      width="600"
      title="修改密码"
      :mask-closable="false"
    >
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
        <FormItem label="原始密码" prop="oldPassword" class='modelInput' >
          <Input :type='oldPswd?"text":"password"'  v-model.trim="formValidate.oldPassword" placeholder="原始密码" >
            <Icon  @click.native='oldPswd=!oldPswd' :type='oldPswd?"md-eye-off":"md-eye"' slot="suffix" />
          </Input>
        </FormItem>
        <FormItem label="新密码" prop="newPassword" class='modelInput'>
          <Input :type='newPswd?"text":"password"'  v-model.trim="formValidate.newPassword" placeholder="新密码">
            <Icon  @click.native='newPswd=!newPswd' :type='newPswd?"md-eye-off":"md-eye"' slot="suffix" />
          </Input>
        </FormItem>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="showPswd=false">取消</Button>
        <Button type="primary" size="large" @click='pswdSure(formValidate,"formValidate")' >确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import './user.less'
import { mapActions} from 'vuex';
import {Upload,netWorkHttp} from '@/api/data';
import  imgTailoring from "@/view/custom/components/imgTailoring";
export default {
  name: 'User',
  components: {
    imgTailoring
  },
  props: {
    userAvator: {
      type: String,
      default: ''
    },
    messageUnreadCount: {
      type: Number,
      default: 0
    },
    list: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data(){
    const validatePassword = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("输入不能为空"));
      } else if (!/^(?!^\d+$)(?!^[a-zA-Z]+$)[0-9a-zA-Z]+$/.test(value)) {
        callback(new Error("密码请用数字和字母组合"));
      } else {
        callback();
      }
    };
    return{
      name:this.$store.state.user.userName,
      newPswd:false,
      oldPswd:false,
      showPswd:false,
      formValidate:{
        oldPassword:null,
        newPassword:null
      },
      ruleValidate: {
        oldPassword: [
          { required: true, validator: validatePassword, trigger: "blur" },
          {  min: 6,max: 20, message: "密码长度6-20个字符", trigger: "blur" }
        ],
        newPassword: [
          { required: true, validator: validatePassword, trigger: "blur" },
          {  min: 6,max: 20, message: "密码长度6-20个字符", trigger: "blur" }
        ]
      },
      isBigImg:true,//判断是不是上传大的logo
      autoCropWidth:200,
      autoCropHeight:200,
      showLogo:false,
      Upload,
      imgUrl:'',
      fileUpload: null,
      isShowCropper:false,
      bigImgUrl:null,
      smallImgUrl:null,
      bigImgKey:null,
      smallImgKey:null,
    }
  },
  methods: {
    ...mapActions([
      'handleLogOut',
      "putMerchant"
    ]),
    pswdSure(value,name){
      this.$refs[name].validate(valid => {
        let {oldPassword:oldPwd, newPassword:newPwd} = value;
        if(valid){
          let data =  {
            oldPwd,
            newPwd,
            modifyType:2,
            id:this.$store.state.user.userId
          }
          netWorkHttp('/user/modifyUserPwd',data).then(res=>{
            if(res.result){
              this.$Message.success('设置成功');
              this.logout();
              this.showPswd = false;
            }else{
              this.$Message.error('设置失败');
            }
          })
        }
      })
    },
    ImgUpload(w,h,b){
      this.autoCropWidth = w;
      this.autoCropHeight = h;
      this.isBigImg = b;
    },
    subeImg(file){
      this.$refs.upload.post(file);
    },
    handleUpload(file){
      this.fileUpload = file;
      this.$nextTick(function () {
        let _this = this
        let reader = new FileReader()
        reader.onload = function (e) {
          _this.isShowCropper = true;
          _this.imgUrl = e.target.result // img里可以显示未上传的图片文件以供预览
        }
        reader.readAsDataURL(file)
      })
      return false
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
        if(this.isBigImg){
          this.bigImgUrl = response.result.url;
          this.bigImgKey = response.result.key;
        }else{
          this.smallImgUrl = response.result.url;
          this.smallImgKey = response.result.key;
        }
        this.$Message.success("图片上传成功");
        this.isShowCropper = false;
      } else if (response.code === 500) {
        this.$Message.error(response.message);
      }
    },
    logoSure(){
      if(this.bigImgUrl&&this.smallImgUrl){
        let data = {
          logo:this.bigImgKey,
          logoAddress:this.bigImgUrl,
          badge:this.smallImgKey,
          id:this.$store.state.user.merchant.id,
          badgeAddress:this.smallImgUrl,
          channelId:this.$store.state.user.channelId
        }
        netWorkHttp('/channelApply/updateLog',data).then(res=>{
          if(res.result){
            let {logoAddress,badgeAddress,id} = data;
            this.putMerchant({logoAddress,badgeAddress,id})
            this.$Message.success('设置成功');
            this.showLogo = false;
          }else{
            this.$Message.error('设置失败');
          }
        })
      }else{
        this.$Message.error('请先上传图片');
      }
      
    },
    async setPassword(){
      await this.initialization('formValidate');
      this.showPswd = true;
    },
    setLogo(){
      this.showLogo = true;
      this.bigImgUrl = null;
      this.smallImgUrl = null
    },
    logout () {
      this.handleLogOut().then(() => {
        let res = this.list.filter(item => item.name === this.$config.homeName)
        console.log(res,this.$config.homeName)
        this.$emit('on-close', res, 'all')
        this.$router.push({
          name: 'login'
        })
      })
    },
    handleClick (name) {
      switch (name) {
        case 'logout':
          this.$store.commit('setRoutersList', [])
          this.$store.commit('setMerchant', {})
          console.log(this.$store)
          this.logout()
          break
        case 'password': this.setPassword()
          break
        case 'logo': this.setLogo()
          break
      }
    }
  },
  mounted(){
  }
}
</script>
<style lang="less" scoped>
  .uploadBox{
    display: inline-block;
  }
  .bigImg{
    margin-right: 20px;
  }
</style>
