<template>
  <div>
    <div v-for='(v,i) in datas' :key='v+i' id='item' v-if='isDeviceInfo||(i!=datas.length-1)'>
      <Select v-model="v.benefitType" :disabled="(isDisabled||v.benefitType==1)||(isDeviceInfo&&(i==datas.length-1))">
        <Option  v-for="(item,index) in interestList" :disabled='item.disabled' :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
      <InputNumber
        v-if='v.benefitType==1'
        :value = 'null'
        disabled
      ></InputNumber>
      <InputNumber
        v-else
        v-model="v.benefitPercent"
        :formatter="value => `${value}%`"
        :max = '100'
        :min = '0'
        :parser="value => value.replace('%', '')"
        :disabled="(isDisabled||v.benefitType==1)||(isDeviceInfo&&(i==datas.length-1))"
        :active-change = 'false'
        @on-change = 'numChange($event,i)'
      ></InputNumber>
      <Select  :disabled="isDisabled||(isDeviceInfo&&(i==datas.length-1))" :value="v.accountId+''" @on-change='changeGetId($event,i)'>
        <Option v-for="item in receivablesList" :value="item.value" :key="item.value" :disabled='v.benefitType!=1&&item.type==1'>{{ item.label }}</Option>
      </Select>
      <Input  :disabled="isDisabled||(isDeviceInfo&&(i==datas.length-1))" v-model="v.payee"  placeholder="收款人"  :readonly='true'/>
      <Input :disabled="isDisabled||(isDeviceInfo&&(i==datas.length-1))" class='account' v-model="v.account" :readonly='true'  placeholder="收款人账号"/>
      <Button   v-show='isDel' type="error" style='margin-left:20px;' @click='del(i)' :disabled='(isDisabled||v.benefitType==1)||(isDeviceInfo&&(i==datas.length-1))'>删除</Button>
    </div>
  </div>
</template>

<script>
export default {
  name:'interestComponent',
  props:{
    isDeviceInfo:{  //设备列表里的利益分配
      default:true
    },
    cIndex:{  //change事件传值用
      default:null
    },
    datas:{
      default:()=>{
        return [];
      }
    },
    isDel:{
      default:true
    },
    isDisabled:{
      default: false
    },
    receivablesList:{
      default:()=>{
        return [];
      }
    },
    receivablesInfo:{
      default:()=>{
        return [];
      }
    },
  },
  data(){
    return{
      interestList:[
        {value:1,label:'本金',disabled:true},
        {value:2,label:'利润'},
        {value:3,label:'商户利润',disabled:true},
      ],
      constant:100,//常量值 商户利润100%
    }
  },
  methods:{
    numChange(value,index){
      console.log(value,index)
      // if(!this.isDeviceInfo){
        let max = 100;
        this.datas.forEach((v,i)=>{
          if(this.datas.length-1!=i&&i!=index){
            max -= parseInt(v.benefitPercent)
          }
        })
        if(this.datas[index].benefitPercent>max){
          this.datas[index].benefitPercent = max
        }else if(this.datas[index].benefitPercent<0){
          this.datas[index].benefitPercent = 0
        }


        if(this.datas[this.datas.length-1].benefitPercent<0){
          this.datas[this.datas.length-1].benefitPercent = 0;
        }else{
          let count = 0;
          this.datas.forEach((v,i)=>{
            if(this.datas.length-1!=i){
              count += v.benefitPercent
            }
          })
          this.datas[this.datas.length-1].benefitPercent = this.constant-count;
        }
        this.$emit('update:datas',this.datas);
      // }else{
      //   console.log(value)
      // }
    },
    changeGetId(event,i){
      let value = JSON.parse(JSON.stringify(this.datas));
      if(value[i].accountId){
        value[i].accountId = value[i].accountId.toString();
        this.$emit('update:datas',value)
      } 
      const data = this.receivablesInfo.find((v,i,ary)=>{
        return v.value == event
      })
      this.$emit('changeBen',{data,i,cIndex:this.cIndex})
    },
    del(index){
      this.$emit('delete',{index,cIndex:this.cIndex})
    }
  },
}
</script>

<style lang="less" scoped>
  #item{
    margin-bottom: 5px;
    >div{
      margin-right: 10px;
    }
    .ivu-select{
      width: 100px;
    }
    .ivu-input-number{
      width:70px;
    }
    .ivu-input-wrapper{
      width:100px;
    }
    .account{
      width: 160px;
    }
  }
</style>