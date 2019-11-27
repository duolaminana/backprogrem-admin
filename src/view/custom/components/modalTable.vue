a<template>
	<div class="modalTable">
      <!-- 点击商品弹框 -->
		<Modal v-model="showModal" width="600" :mask-closable='false' :closable='false'>
			<Input v-model="name"  placeholder="商品名称" clearable class='GoodsIdname' />
			<Button @click='query'>查询</Button>
			<Table border :columns="modalColumns" :data="modalDatas" height="400" class="goodsIDTable" @on-row-click='rowClick'>
				<template slot-scope="{ row}" slot="img">
						<img :src="row.imageAddress" >
				</template>
			</Table>
			<Page :total="modalTotal" show-elevator :current='modalPageNum' @on-change='PageChange' :page-size='modalPageSize' class="modalPage"/>
			<div slot="footer">
		    <Button type="primary" size="large" @click='hide'>取消</Button>
		   </div>
		</Modal>
  </div>
</template>
<script>
export default {
	name: 'modalTable',
	props:{
		modalDatas:{
			default:()=>{
				return []
			}
		},
		modalTotal:{
			default:null
		},
		modalPageSize:{
			default:15
		},
		modalPageNum:{
			default:1
		},
		showModal:{
			default:false
		},
		modalColumns:{
			default:()=>{
				return []
			}
		}
	},
  data () {
    return {
      name:null,
    }
  },
  methods: {
		rowClick(row){
			this.$emit('modalGetRow',row)
			this.$emit('modalHide')
		},
		hide(){
			this.$emit('modalHide')
		},
		query(){
			this.$emit('modalGetDatas',this.name)
		},
    PageChange(value){
			this.$emit('modalPageChange',value)
		}
	},
	mounted(){
	}
} 
</script>

<style lang="less" scoped>
  .getOnModal{
    display: inline-block;
    width: 100%;
    height: 32px;
    line-height: 1.5;
    padding: 4px 7px;
    font-size: 12px;
    border: 1px solid #dcdee2;
    border-radius: 4px;
    color: #515a6e;
    background-color: #fff;
    background-image: none;
    position: relative;
    cursor:pointer;
  }
  div.GoodsIdname{
    width: 180px;
    margin-right:5px;
  }
  div.goodsIDTable{
		margin-top: 10px;
  }
  .modalPage{
    text-align: center;
    margin-top: 10px;
	}
	/deep/ .ivu-table-cell{
		padding-left: 0px;
		padding-right:0px;
	}
	.ivu-table-cell img {
    width: 33px;
    height: 33px;
  }
</style>
