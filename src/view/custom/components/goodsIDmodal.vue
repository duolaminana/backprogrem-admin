<template>
	<div class="showGoodsIDmodal">
      <!-- 点击商品弹框 -->
		<Modal v-model="showGoodsIDmodal" width="600" :mask-closable='false' :closable='false'>
			<!-- <Input v-model="GoodsIdnum"  placeholder="商品编号" clearable/> -->
			<Input v-model="GoodsIdname"  placeholder="商品名称" clearable class='GoodsIdname' />
			<!-- <Cascader :data="selectData" v-model="selectValue" @on-change="selectChange" v-if='selectData.length' ></Cascader> -->
			<Button @click='query'>查询</Button>
			<Table border :columns="GoodsIDColumns" :data="GoodsIDdatas" height="400" class="goodsIDTable" @on-row-click='rowClick'>
				<template slot-scope="{ row}" slot="img">
						<img :src="row.imageAddress" >
				</template>
			</Table>
			<Page :total="GoodsIdTotal" show-elevator :current='GoodsIDPageNum' @on-change='PageChange' :page-size='GoodsIDPageSize' class="modalPage"/>
			<div slot="footer">
		    <Button type="primary" size="large" @click='hide'>取消</Button>
		   </div>
		</Modal>
  </div>
</template>
<script>
export default {
	name: 'goodsIDmodal',
	props:{
		GoodsIDdatas:{
			default:()=>{
        return [];
      }
		},
		GoodsIdTotal:{
			default:null
		},
		GoodsIDPageSize:{
			default:15
		},
		GoodsIDPageNum:{
			default:1
		},
		showGoodsIDmodal:{
			default:false
		},
	},
  data () {
    return {
      GoodsIDColumns:[
        {
          title: '商品名称',
          key: 'productName',
					align: 'center',
					minWidth:137,
          tooltip:true
        },
        {
          title: '进价',
          key: 'buyPrice',
					align: 'center',
					minWidth:137,
          tooltip:true
        },
        {
          title: '售价',
          key: 'salePrice',
					align: 'center',
					minWidth:137,
          tooltip:true
        },
				{
          title: '商品图片',
          align: 'center',
					slot: 'img',
					minWidth:137,
          tooltip:true
				}
      ],
      GoodsIdname:null,
    }
  },
  methods: {
		rowClick(row){
			this.$emit('getGoodsId',row)
			this.$emit('hideGoodsIdModal')
		},
		hide(){
			this.$emit('hideGoodsIdModal')
		},
		query(){
			this.$emit('getGoodsIDPageDatas',this.GoodsIdname)
		},
    PageChange(value){
			this.$emit('GoodsIDPageChange',value)
		}
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
