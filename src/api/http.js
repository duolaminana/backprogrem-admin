import axios from "@/libs/api.request";
import qs from "qs";

// 上传文件地址
// 图片上传
export const Upload =
  "https://vendor-platform-test.sun-hyt.com/system/file/uploadFile";

// ---------------------------------------角色模块--------------------------------------------

//新增角色
export const addRole = info => {
  return axios.request({
    url: "/system/role/addRole",
    data: info,
    method: "post"
  });
};
// 删除角色
export const delRole = roleId => {
  return axios.request({
    url: "/system/role/deleteRole",
    params: {
      roleId
    },
    method: "delete"
  });
};
// 编辑角色
export const editRole = info => {
  return axios.request({
    url: "/system/role/modifyRole",
    data: info,
    method: "put"
  });
};
// 查询角色
export const searchRole = info => {
  return axios.request({
    url: "/system/role/queryRoleListByCondition",
    data: info,
    method: "post"
  });
};
// 查询角色的权限树
export const permissionByRole = (channelId, roleId) => {
  return axios.request({
    url: "/system/role/queryPermissionByRole",
    params: {
      channelId,
      roleId
    },
    method: "get"
  });
};
// 分配权限给角色
export const permissionToRole = ({ pids, roleId }) => {
  const data = {
    pids: pids,
    roleId: roleId
  };
  return axios.request({
    url: "/system/permission/allotPermissionToRole",
    data: qs.stringify(data),
    method: "post"
  });
};

// -------------------------------------------------应用模块--------------------------------------------------------------
//新增应用
export const addAppManage = info => {
  return axios.request({
    url: "/system/app/addApp",
    data: info,
    method: "post"
  });
};
// 删除应用
export const delAppManage = id => {
  return axios.request({
    url: "/system/app/deleteApp",
    params: {
      id
    },
    method: "delete"
  });
};
// 编辑应用
export const editAppManage = info => {
  return axios.request({
    url: "/system/app/modifyApp",
    data: info,
    method: "post"
  });
};
// 查询应用
export const searchAppManage = info => {
  return axios.request({
    url: "/system/app/queryAppListByCondition",
    data: info,
    method: "post"
  });
};
// -------------------------------------------------秘钥模块--------------------------------------------------------------
//新增秘钥
export const addAppSecret = info => {
  return axios.request({
    url: "/system/appSecret/addAppSecret",
    data: info,
    method: "post"
  });
};
// 删除秘钥
export const delAppSecret = id => {
  return axios.request({
    url: "/system/appSecret/deleteAppSecret",
    params: {
      id
    },
    method: "delete"
  });
};
// 编辑秘钥
export const editAppSecret = info => {
  return axios.request({
    url: "/system/appSecret/modifyAppSecret",
    data: info,
    method: "post"
  });
};
// 查询秘钥
export const searchAppSecret = info => {
  return axios.request({
    url: "/system/appSecret/queryAppSecretListByCondition",
    data: info,
    method: "post"
  });
};
// -------------------------------------------------字典模块--------------------------------------------------------------
//新增字典类型
export const addDictType = info => {
  return axios.request({
    url: "/system/dict/addDict",
    data: info,
    method: "post"
  });
};
// 删除字典类型
export const delDictType = id => {
  return axios.request({
    url: "/system/dict/deleteDict",
    params: {
      id
    },
    method: "delete"
  });
};
// 编辑字典类型
export const editDictType = info => {
  return axios.request({
    url: "/system/dict/modifyDict",
    data: info,
    method: "put"
  });
};
// 查询字典类型
export const searchDictType = info => {
  return axios.request({
    url: "/system/dict/queryDictListByCondition",
    data: info,
    method: "post"
  });
};
// 根据字典id获取字典类型信息
export const searchDictTypeById = id => {
  return axios.request({
    url: "/system/dict/queryDictById",
    params: {
      id
    },
    method: "get"
  });
};
//新增字典数据
export const addDictData = info => {
  return axios.request({
    url: "/system/dictData/addDictData",
    data: info,
    method: "post"
  });
};
// 删除字典数据
export const delDictData = id => {
  return axios.request({
    url: "/system/dictData/deleteDictData",
    params: {
      id
    },
    method: "delete"
  });
};
// 编辑字典数据
export const editDictData = info => {
  return axios.request({
    url: "/system/dictData/modifyDictData",
    data: info,
    method: "put"
  });
};
// 查询字典数据
export const searchDictData = info => {
  return axios.request({
    url: "/system/dictData/queryDictDataListByCondition",
    data: info,
    method: "post"
  });
};
// -------------------------------------------------用户模块--------------------------------------------------------------
//新增部门
export const addDept = info => {
  return axios.request({
    url: "/system/dept/addDept",
    data: info,
    method: "post"
  });
};
// 删除部门
export const delDept = id => {
  return axios.request({
    url: "/system/dept/deleteDept",
    params: {
      id
    },
    method: "delete"
  });
};
// 编辑部门
export const editDept = info => {
  return axios.request({
    url: "/system/dept/modifyDept",
    data: info,
    method: "post"
  });
};
// 根据渠道id获取部门树
export const searchDeptBychannelId = channelId => {
  return axios.request({
    url: "/system/dept/queryDeptTreeByChannelId",
    params: {
      channelId
    },
    method: "get"
  });
};
// 根据部门id查询部门信息
export const searchDeptById = id => {
  return axios.request({
    url: "/system/dept/queryDeptById",
    params: {
      id
    },
    method: "get"
  });
};
//新增用户
export const addUser = info => {
  return axios.request({
    url: "/system/user/addUser",
    data: info,
    method: "post"
  });
};
// 删除用户
export const delUser = id => {
  return axios.request({
    url: "/system/user/deleteUser",
    params: {
      id
    },
    method: "delete"
  });
};
// 编辑用户
export const editUser = info => {
  return axios.request({
    url: "/system/user/modifyUser",
    data: info,
    method: "put"
  });
};
// 查询用户
export const searchUser = info => {
  return axios.request({
    url: "/system/user/queryUserListByCondition",
    data: info,
    method: "post"
  });
};
// 查询渠道商的所有角色
export const searchRoleByChannelId = channelId => {
  return axios.request({
    url: "/system/role/queryRoleByChannelId",
    params: {
      channelId
    },
    method: "get"
  });
};
// 根据用户id查询用户的角色
export const searchRoleByUserId = userId => {
  return axios.request({
    url: "/system/role/queryRoleByUserId",
    params: {
      userId
    },
    method: "get"
  });
};
//更新用户机器管理权限
export const modifyUserMachine = info => {
  return axios.request({
    url: "/system/user/modifyUserMachine",
    data: info,
    method: "post"
  });
};
// 根据渠道id查询线路级联列表
export const searchRouteListByChannelId = channelId => {
  return axios.request({
    url: "/position/route/queryRouteSelectTreeByChannelId",
    params: {
      channelId
    },
    method: "get"
  });
};
// 根据渠道id查询线路树
export const searchRouteTreeByChannelId = (channelId, userId) => {
  return axios.request({
    url: "/position/route/queryUserRouteTree",
    params: {
      channelId,
      userId
    },
    method: "get"
  });
};

// 查询开门权限设备列表信息
export const searchUserMachineList = ({ channelId, userId, managerRoute }) => {
  const data = {
    channelId: channelId,
    userId: userId,
    managerRoute: managerRoute
  };
  return axios.request({
    url: "/position/userMachine/list",
    data: qs.stringify(data),
    method: "post"
  });
};
//编辑开门权限设备信息
export const addOrModifyUserMachine = info => {
  return axios.request({
    url: "/position/userMachine/addOrModify",
    data: info,
    method: "post"
  });
};
// 用户重置密码
export const resetPwd = info => {
  return axios.request({
    url: "/system/user/modifyUserPwd",
    data: info,
    method: "post"
  });
};
// -------------------------------------------------商户模块--------------------------------------------------------------
//新增商户
export const addChannelApply = info => {
  return axios.request({
    url: "/system/channelApply/addChannelApply",
    data: info,
    method: "post"
  });
};
// 删除商户
export const delChannelApply = channelApplyId => {
  return axios.request({
    url: "/system/channelApply/deleteChannelApply",
    params: {
      channelApplyId
    },
    method: "delete"
  });
};
// 编辑商户
export const editChannelApply = info => {
  return axios.request({
    url: "/system/channelApply/modifyChannelApply",
    data: info,
    method: "post"
  });
};
// 查询商户
export const searchChannelApply = info => {
  return axios.request({
    url: "/system/channelApply/queryChannelApplyListByCondition",
    data: info,
    method: "post"
  });
};
// 渠道商审核
export const auditChannel = info => {
  return axios.request({
    url: "/system/channelApply/auditChannel",
    data: info,
    method: "post"
  });
};
// 查询基础商品类型树形结构数据
export const productType = () => {
  return axios.request({
    url: "/product/category/findChannelRootCategory",
    method: "get"
  });
};
// 查询渠道商的业务范围
export const searchMerchantCategory = channelId => {
  return axios.request({
    url: "/product/channelBusiness/queryChannelBusinessByChannelId",
    params: {
      channelId
    },
    method: "get"
  });
};
// 查询渠道商的业务范围
export const searchMerchantCategorySale = (channelId, businessStr) => {
  return axios.request({
    url: "/product/channelBusiness/queryChannelApplyChannelBusiness",
    params: {
      channelId,
      businessStr
    },
    method: "get"
  });
};
// 获取开户行
export const searchBank = cardNumber => {
  return axios.request({
    url: "/system/channelApply/getChannelBankOfDeposit",
    params: {
      cardNumber
    },
    method: "get"
  });
};
// 根据id查询渠道树
export const searchTreeData = channelId => {
  return axios.request({
    url: "/system/channel/querySelectChannelTreeByChannelId",
    params: {
      channelId
    },
    method: "post"
  });
};
// 根据id查询渠道树
export const getFastCheck = (checkParam, checkType) => {
  return axios.request({
    url: "/system/channelApply/fastCheck",
    params: {
      checkParam,
      checkType
    },
    method: "get"
  });
};
// 根据渠道商id查询收款余额
export const getPrice = channelId => {
  return axios.request({
    url: "/order/order/queryBalance",
    params: {
      channelId
    },
    method: "get"
  });
};
// -------------------------------------------------库存监控和补货模块--------------------------------------------------------------
// 查询商品库存(明细)
export const searchStockControl = info => {
  return axios.request({
    url: "/position/machineRoad/queryMachineRoadByCondition",
    data: info,
    method: "post"
  });
};
// 查询商品库存(汇总)
export const searchStockControlAll = info => {
  return axios.request({
    url: "/position/machineProduct/queryProductStock",
    data: info,
    method: "post"
  });
};
// 查询商品出入库记录信息
export const searchStock = info => {
  return axios.request({
    url: "/position/productPut/queryProductPutByCondition",
    data: info,
    method: "post"
  });
};
// 根据渠道id查询线路名称列表
export const searchRouteList = (channelId, managerRoute, userId) => {
  return axios.request({
    url: "/position/route/queryRouteNameByChannelId",
    params: {
      channelId,
      managerRoute,
      userId
    },
    method: "get"
  });
};
// -------------------------------------------------活动列表模块--------------------------------------------------------------
//新增活动列表信息
export const addActivity = info => {
  return axios.request({
    url: "/position/activity/add",
    data: info,
    method: "post"
  });
};
// 编辑活动列表信息
export const editActivity = info => {
  return axios.request({
    url: "/position/activity/modify",
    data: info,
    method: "post"
  });
};
// 查询活动列表信息
export const searchActivity = info => {
  return axios.request({
    url: "/position/activity/list",
    data: info,
    method: "post"
  });
};

// 获取渠道商活动权限的商品信息
export const searchProductChannelAll = (channelId, isLimitedEdition) => {
  return axios.request({
    url: "/product/productChannel/queryAllAcivityProductByChannelId",
    params: {
      channelId,
      isLimitedEdition
    },
    method: "get"
  });
};
export const searchmachinePosition = info => {
  return axios.request({
    url: "/position/machinePosition/list",
    data: info,
    method: "post"
  });
};

// 获取活动商品列表信息
export const searchactivityProduct = info => {
  return axios.request({
    url: "/position/activityProduct/list",
    data: info,
    method: "post"
  });
};
// 更改活动状态
export const changeactivity = info => {
  return axios.request({
    url: "/position/activity/modifyById",
    data: info,
    method: "post"
  });
};
// 编辑活动设备信息
export const searchActivityMachine = info => {
  return axios.request({
    url: "/position/activityMachine/list",
    data: info,
    method: "post"
  });
};
// 编辑活动设备信息
export const addOrModifyActivityMachine = info => {
  return axios.request({
    url: "/position/activityMachine/addOrModify",
    data: info,
    method: "post"
  });
};
// -------------------------------------------------终端设备收款码模块--------------------------------------------------------------
//新增收款码
export const addQRcode = info => {
  return axios.request({
    url: "/system/channelIPayment/addChannelIPayment",
    data: info,
    method: "post"
  });
};
// 删除收款码
export const delQRcode = id => {
  return axios.request({
    url: "/system/channelIPayment/deleteIPaymentById",
    params: {
      id
    },
    method: "get"
  });
};

// 编辑收款码(根据id修改终端设备收款码信息)
export const editQRcode = info => {
  return axios.request({
    url: "/system/channelIPayment/modifyChannelIPayment",
    data: info,
    method: "post"
  });
};
// 查询收款码
export const searchQRcode = info => {
  return axios.request({
    url: "/system/channelIPayment/queryChannelIPaymentListByCondition",
    data: info,
    method: "post"
  });
};
// 据终端设备收款码应用id查询终端设备收款码信息
export const searchQRcodeByChannelId = channelId => {
  return axios.request({
    url: "/system/channelIPayment/queryChannelIPaymentByChannelId",
    params: {
      channelId
    },
    method: "get"
  });
};

// -------------------------------------------------结算模块--------------------------------------------------------------
//新增结算列表

// 删除结算列表

// 编辑结算列表

// 查询待结算列表
export const searchSettlement = info => {
  return axios.request({
    url: "/order/clearing/findWaitPageClearing",
    data: info,
    method: "post"
  });
};
// 查询已结算列表
export const searchSettlementOver = info => {
  return axios.request({
    url: "/order/clearing/findOverPageClearing",
    data: info,
    method: "post"
  });
};
// 查询结算详情
export const searchSettlementMore = info => {
  return axios.request({
    url: "/order/clearingDetail/findPageClearingDetail",
    data: info,
    method: "post"
  });
};
// 根据id查询收款人账户信息
export const searchAccountByAccountId = accountId => {
  return axios.request({
    url: "/position/benefitAccount/queryById",
    params: {
      accountId
    },
    method: "get"
  });
};
// 根据账号id查询关联设备信息
export const searchMachineByAccountId = (accountId, channelId) => {
  return axios.request({
    url: "/position/benefitMachine/queryByAccountId",
    params: {
      accountId,
      channelId
    },
    method: "get"
  });
};
// 导出待结算订单详情
export const getSettlementExcle = info => {
  return axios.request({
    url: "/order/clearingDetail/exportClearingDetail",
    data: info,
    method: "post",
    responseType: "blob" // 表明返回服务器返回的数据类型
  });
};
// 利益分配账户下拉列表
export const searchBenefitAccount = channelId => {
  return axios.request({
    url: "/position/benefitAccount/getBox",
    params: {
      channelId
    },
    method: "get"
  });
};

//-------------------------------------------------订单模块--------------------------------------------------------------
//新增交易列表

// 删除交易列表
export const delOrder = id => {
  return axios.request({
    url: "/order/clearing/deleteClearing",
    params: {
      id
    },
    method: "delete"
  });
};
// 编辑交易列表

// 查询交易列表
export const searchOrder = info => {
  return axios.request({
    url: "/order/order/findPageOrder",
    data: info,
    method: "post"
  });
};
// 查询交易详情
export const searchOrderMore = info => {
  return axios.request({
    url: "/order/orderDetail/findAllOrderDetail",
    data: info,
    method: "post"
  });
};

// 根据id查询利益分配详情信息
export const searchBenefitMachine = benefitId => {
  return axios.request({
    url: "/position/benefitMachine/queryById",
    params: {
      benefitId
    },
    method: "get"
  });
};

// 导出表格的接口方法
export const getOrderExcle = info => {
  return axios.request({
    url: "/order/order/exportOrderFile",
    data: info,
    method: "post",
    responseType: "blob" // 表明返回服务器返回的数据类型
  });
};

// 删除订单
export const deleteOrder = id => {
  return axios.request({
    url: "/order/order/deleteOrder",
    params: {
      id
    },
    method: "delete"
  });
};

// 查看是否有收款权限
export const seeReceiveTerminal = (chooseChannelId, loginChannelId) => {
  return axios.request({
    url: "/system/channelApply/getLoginChannelApplyIsTrue",
    params: {
      chooseChannelId,
      loginChannelId
    },
    method: "get"
  });
};

// 根据用户查询线路树
export const searchTreeByUser = info => {
  return axios.request({
    url: "/position/route/queryRouteTreeByUser",
    data: info,
    method: "post"
  });
};

// 退款
export const refundOrder = info => {
  return axios.request({
    url: "/order/refundOrder/saveRefundOrder",
    data: info,
    method: "post"
  });
};
//-------------------------------------------------会员模块--------------------------------------------------------------
//新增会员

// 删除会员
export const delMember = id => {
  return axios.request({
    url: "/order/clearing/deleteClearing",
    params: {
      id
    },
    method: "delete"
  });
};
// 编辑会员

// 查询会员
export const searchMember = info => {
  return axios.request({
    url: "/order/member/findPageMember",
    data: info,
    method: "post"
  });
};
// 根据会员身份证号查询所有
export const searchMemberMore = info => {
  return axios.request({
    url: "/order/memberProfit/findAllMemberProfit",
    data: info,
    method: "post"
  });
};

// 查询会员购买过的订单记录
export const searchMemberOrder = id => {
  return axios.request({
    url: "/order/orderDetail/findMemberOrderDetail",
    params: {
      id
    },
    method: "get"
  });
};
