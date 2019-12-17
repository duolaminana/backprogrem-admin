<template>
  <div class='modal' v-show='isShowCropper'>
    <vueCropper
      ref="cropper"
      :img="imgUrl"
      :outputSize="option.size"
      :outputType="option.outputType"
      :canScale="option.canScale"
      :autoCrop="option.autoCrop"
      :autoCropWidth="autoCropWidth"
      :autoCropHeight="autoCropHeight"
      :fixed="option.fixed"
      :fixedNumber="option.fixedNumber"
      :fixedBox = 'fixedBox'
    ></vueCropper>
    <div class='btnBox'>
      <Button  style="margin-right:20px" @click="cancel" >取消</Button>
      <Button  @click="onCubeImg" >确定裁剪图片</Button>
    </div>
  </div>
</template>

<script>
import { VueCropper }  from 'vue-cropper' ;
export default {
  name:'imgTailoring',
  components: {
    VueCropper
  },
  props:{
    isShowCropper:{
      default:false,
      type:Boolean
    },
    imgUrl:{
      default:'',
      type:String
    },
    autoCropWidth:{ // 默认生成截图框宽度
      default:150,
    },
    autoCropHeight:{ // 默认生成截图框高度
      default:150,
    },
    fileUpload:{},
    fixedBox:{
      default:false
    }
  },
  data(){
    return{
      option:{
        info: true,                      //裁剪框的大小信息
        outputSize: 1,                   // 裁剪生成图片的质量
        outputType: 'png',              //裁剪生成图片的格式
        canScale: true,                 // 图片是否允许滚轮缩放
        autoCrop: true,                  // 是否默认生成截图框
        fixed: false,                    //是否开启截图框宽高固定比例
        fixedNumber: [4, 4]              //截图框的宽高比例
      },
      fileinfo:{},
    }
  },
  methods:{
    cancel(){
      this.$emit('update:isShowCropper',false)
    },
    // 确定裁剪图片
    onCubeImg() {
      // 获取cropper的截图的base64 数据
      this.$refs.cropper.getCropData(data => {
        this.fileinfo.url = data
        this.$emit('update:isShowCropper',false)
       //先将显示图片地址清空，防止重复显示
        this.$emit('update:imgUrl','')
       //将剪裁后base64的图片转化为file格式
        let file = this.convertBase64UrlToBlob(data)
        file.name = this.fileUpload.name
        //将剪裁后的图片执行上传
        this.$emit('subeImg',file)
      })
    },
    // 将base64的图片转换为file文件
    convertBase64UrlToBlob(urlData) {
      let bytes = window.atob(urlData.split(',')[1]);//去掉url的头，并转换为byte
      //处理异常,将ascii码小于0的转换为大于0
      let ab = new ArrayBuffer(bytes.length);
      let ia = new Uint8Array(ab);
      for (var i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
      }
      return new Blob([ab], { type: 'image/jpeg' });
    }
  }
}
</script>

<style lang="less" scoped>
  .modal{
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(55, 55, 55, 0.6);
    height: 100%;
    z-index: 9999;
    .vue-cropper{
      height: 80%;
      width: 80%;
      position:absolute;
      top:50%;
      left: 50%;
      transform: translate(-50%,-50%);
      /deep/.cropper-modal{
        background: none
      }
    }
    .btnBox{
      position: absolute;
      left:50%;
      bottom: 4%;
      transform: translateX(-50%)
    }
  }
</style>