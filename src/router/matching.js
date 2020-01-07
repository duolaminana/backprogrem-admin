export const matchingRoute = name => {
  switch (name) {
    case "MAIN":
      return () => import("@/components/main");
      break;
    case "HOME":
      return () => import("@/view/single-page/home/home");
      break;
    case "INFO":
      return () => import("@/view/custom/merchant/info");
      break;
    case "GOODSCOMMODITY":
      return () => import("@/view/custom/commodity/goodsCommodity");
      break;
    case "CHANNElGOODSCOMMODITY":
      return () => import("@/view/custom/commodity/channelGoodsCommodity");
      break;
    // case 'COMMODITYTYPES':
    //     return () => import('@/view/custom/commodity/commodityTypes');
    //     break;
    case "CHANNElCOMMODITYTYPES":
      return () => import("@/view/custom/commodity/channelCommodityTypes");
      break;
    case "COMMODITYPRICE":
      return () => import("@/view/custom/commodity/commodityPrice");
      break;
    // case 'COMMODITYPRICEDETAILS':
    //     return () => import('@/view/custom/commodity/commodityPriceDetails');
    //     break;
    case "DEVICEINFO":
      return () => import("@/view/custom/equipment/deviceInfo");
      break;
    case "DEVICEINFOCOPY":
      return () => import("@/view/custom/equipment/deviceInfoCopy");
      break;
    case "GIS":
      return () => import("@/view/custom/equipment/GIS");
      break;
    case "SUBAREALINE":
      return () => import("@/view/custom/equipment/subareaLine");
      break;
    // case 'GOODWAYGOODS':
    //   return () => import('@/view/custom/equipment/goodwayGoods')
    //   break
    case "CLIENTMANAGEMENT":
      return () => import("@/view/custom/platformManagement/clientManagement");
      break;
    // case 'INTEGRAL':
    //   return () => import('@/view/custom/client/integral')
    //   break
    case "STOCKCONTROL":
      return () => import("@/view/custom/stock/stockControl");
      break;
    case "STOCKADD":
      return () => import("@/view/custom/stock/stockAdd");
      break;
    case "USERMANAGEMENT":
      return () => import("@/view/custom/system/userManagement");
      break;
    case "ROLE":
      return () => import("@/view/custom/system/role");
      break;
    case "PURVIEW":
      return () => import("@/view/custom/system/purview");
      break;
    case "DICT":
      return () => import("@/view/custom/system/dict");
      break;
    case "APPMANAGE":
      return () => import("@/view/custom/system/appManage");
      break;
    case "APPSECRET":
      return () => import("@/view/custom/system/appSecret");
      break;
    case "PARENTVIEW":
      return () => import("@/components/parent-view");
      break;
    case "EQUIPMENTINFORMATION":
      return () => import("@/view/custom/equipment/equipmentInformation");
      break;
    case "POINTINFOMATION":
      return () => import("@/view/custom/equipment/pointInformation");
      break;
    case "EQUIPMENTTEMPLATE":
      return () => import("@/view/custom/equipment/equipmentTemplate");
      break;
    case "APKADMINISTRATION":
      return () => import("@/view/custom/equipment/APKAdministration");
      break;
    case "APKVERSIONADMINISTRATION":
      return () => import("@/view/custom/equipment/APKVersiondAministration");
      break;
    case "BENEFITDISTRIBUTION":
      return () => import("@/view/custom/equipment/benefitDistribution");
      break;
    // case 'OUTOFSTOCK':
    //   return () => import('@/view/custom/stock/outOfStock')
    //   break
    case "SETTLEMENTSTATEMENT":
      return () => import("@/view/custom/settlement/settlementStatement");
      break;
    case "SETTLEMENTRECORD":
      return () => import("@/view/custom/settlement/settlementRecord");
      break;
    case "TRANSACTIONSLIST":
      return () => import("@/view/custom/settlement/transactionsList");
      break;
    case "BENEFITTEMPLATE":
      return () => import("@/view/custom/equipment/benefitTemplate");
      break;
    case "BENEFITACCOUNT":
      return () => import("@/view/custom/equipment/benefitAccount");
      break;
    case "MERCHARTMANAGEMENT":
      return () =>
        import("@/view/custom/platformManagement/merchantManagement");
      break;
    case "QRCODEMANAGEMENT":
      return () => import("@/view/custom/platformManagement/QRcodeManagement");
      break;
    case "SETRECORDMANAGEMENT":
      return () =>
        import("@/view/custom/platformManagement/setRecordManagement");
      break;
    case "SETSTATEMENTMANAGEMENT":
      return () =>
        import("@/view/custom/platformManagement/setStatementManagement");
      break;
    case "TRANSACTIONSMANAGEMENT":
      return () =>
        import("@/view/custom/platformManagement/transactionsManagement");
      break;
    case "PROMOTIONLIST":
      return () => import("@/view/custom/promotion/promotionList");
      break;
    case "BIGDATA":
      return () => import("@/view/custom/bigData/bigData");
      break;
    case "MEMBERPERSONAL":
      return () => import("@/view/custom/member/memberPersonal");
      break;
    default:
      return () => import("@/view/single-page/home/home");
  }
}
