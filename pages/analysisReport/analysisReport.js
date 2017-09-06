// analysisReport.js
var app = getApp()
var wxCharts = require('../../utils/wxcharts.js');
var lineChart = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    resultCanvasShowed: false, // 图表区域显示／隐藏
    analysisLoadShowed: true, // 加载中区域显示／隐藏
    currentItem: null, // 定义当前选中项
    analysisData: [
      {
        id: 0,
        rank: 'A',
        count: 23,
        title: '微信牵头小程序风潮遭阿里模仿',
        media_name: '腾讯科技',
        publish_at: '2017-09-01'
      },
      {
        id: 1,
        rank: 'B',
        count: 37,
        title: '360安全卫士',
        media_name: '奇虎科技',
        publish_at: '2017-09-01'
      },
      {
        id: 2,
        rank: 'C',
        count: 28,
        title: '百度外卖严重掉队',
        media_name: '百度科技',
        publish_at: '2017-09-01'
      },
      {
        id: 3,
        rank: 'D',
        count: 22,
        title: '日本新任内阁大臣翌日发表声明',
        media_name: '凤凰网',
        publish_at: '2017-09-01'
      },
      {
        id: 4,
        rank: 'E',
        count: 28,
        title: 'NBA将于10月19日开战，联盟各队积极备战。',
        media_name: '新浪体育',
        publish_at: '2017-09-01'
      },
      {
        id: 5,
        rank: 'F',
        count: 16,
        title: '齐齐睇下香奈儿几款新品',
        media_name: '时尚追踪',
        publish_at: '2017-09-01'
      },
    ],
    series: [{ //required 数据列表
      name: '腾讯科技', //数据名称
      data: [15, 2, 45, 37, 4, 8, 37, 12], //required (饼图、圆环图为Number) 数据，如果传入null图表该处出现断点
      color: '#ffe3de', //不传入则使用系统默认配色方案
      format: function(val) { //自定义显示数据内容
        return val.toFixed(2) + '篇'; //显示小数点后两位
      }
    }, {
      name: '奇虎科技',
      data: [30, 37, 65, 78, 69, 54, 62, 47],
      color: '#d6f3ef',
      format: function(val) {
        return val.toFixed(0) + '篇'; //显示整数型
      }
    }, {
      name: '百度',
      data: [20, 37, 65, 48, 49, 24, 62, 17],
      color: '#ffd4de',
      format: function(val) {
        return val.toFixed(0) + '篇'; //显示整数型
      }
    }, {
      name: '凤凰网',
      data: [40, 37, 65, 28, 37, 48, 32, 70],
      color: '#d8f0f4',
      format: function(val) {
        return val.toFixed(0) + '篇'; //显示整数型
      }
    }, {
      name: '新浪体育',
      data: [20, 37, 35, 48, 39, 54, 52, 42],
      color: '#e3ddf9',
      format: function(val) {
        return val.toFixed(0) + '篇'; //显示整数型
      }
    }, {
      name: '时尚追踪',
      data: [20, 37, 35, 48, 39, 54, 52, 42],
      color: '#e2d5e6',
      format: function(val) {
        return val.toFixed(0) + '篇'; //显示整数型
      }
    }],
  },
  /**
   * 生成随机数据
   */
  createSimulationData: function() {
    var categories = [];
    var data = [];
    for (var i = 0; i < 8; i++) {
      categories.push('2016-' + (i + 1));
      data.push(Math.random() * (20 - 10) + 10);
    }
    // data[4] = null;
    return {
      categories: categories,
      data: data
    }
  },
  /**
   * 列表选中操作，用户点击列表改变当前列表样式
   * @ param  options  事件对象
   */
  tagChooseTap:function(options){
    var that = this
    let id = options.currentTarget.dataset.id;
    let currentItem = this.data.currentItem
    let series = this.data.series //全部图表数据
    let series_id = [this.data.series[id]] //对应列表项的图表数据
    console.log('tagChoose id:', id)
    console.log(this.data.currentItem)
    if (currentItem == id) {
      // 取消列表选中项的当前样式
      this.setData({
        'currentItem': -1
      })
      // 更新图表数据，显示全部
      lineChart.updateData({
        series: series
      });
    } else if (currentItem !== id) {
      //设置当前选中项的样式
      this.setData({
        'currentItem':id
      })
      var simulationData = this.createSimulationData();
      // var series = [{
      //     name: '焦点',
      //     data: simulationData.data,
      //     format: function (val, name) {
      //         return val.toFixed(2) + '篇';
      //     }
      // }];
      // 更新图表数据，显示当前选中项
      lineChart.updateData({
          // categories: simulationData.categories,
          series: series_id
      });
    }
  },
  /**
   * 显示全部图表
   */
  showAllTap:function(options){
    console.log('analysis showAllTap')
    var that = this
    var series = this.data.series
    // 取消列表选中的当前样式
    this.setData({
      'currentItem': -1
    })
    // 更新图表数据
    lineChart.updateData({
      series: series
    });
  },
  /**
   * wxCharts图表操作，用户点击图表显示数值
   */
  touchHandler: function (e) {
    console.log(e)
    console.log(lineChart.getCurrentDataIndex(e));
    lineChart.showToolTip(e, {
      // background: '#7cb5ec'
    });
  },
  /**
   * wxCharts图表绘制函数
   * updateData(data) 更新图表数据，data: object，data.categories(可选，具体见参数说明)，data.series(可选，具体见参数说明)，data.title(可选，具体见参数说明)，data.subtitle(可选，具体见参数说明)
   * stopAnimation() 停止当前正在进行的动画效果，直接展示渲染的最终结果
   * addEventListener(type, listener) 添加事件监听，type: String事件类型，listener: function 处理方法
   * getCurrentDataIndex(e) 获取图表中点击时的数据序列编号(-1表示未找到对应的数据区域), e: Object微信小程序标准事件，需要手动的去绑定touch事件
   * showToolTip(e, options?) 图表中展示数据详细内容(目前仅支持line和area图表类型)，e: Object微信小程序标准事件，options: Object可选，tooltip的自定义配置，支持option.background，默认为#000000; option.format, function类型，接受两个传入的参数，seriesItem(Object, 包括seriesItem.name以及seriesItem.data)和category，可自定义tooltip显示内容。
   */
  wxCharts: function(options) {
    var windowWidth = 320; //定义初始化图表宽度
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
      console.log('windowWidth:', windowWidth)
      // 更新页面图表宽度
      this.setData({
        windowWidth: windowWidth
      })
    } catch (options) {
      console.error('getSystemInfoSync failed!');
    }
    lineChart = new wxCharts({
      canvasId: 'areaCanvas', //required 微信小程序canvas-id
      type: 'area', //required 图表类型，可选值为pie, line, column, area, ring, radar
      categories: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月'], //required (饼图、圆环图不需要) 数据类别分类
      animation: true, //Boolean类型 default true 是否动画展示
      legend: true, //default true 是否显示图表下方各类别的标识
      background: '#f5f5f5',
      // series: [{ //required 数据列表
      //   name: '微信', //数据名称
      //   data: [15, 2, 45, 37, 4, 8, 37, 12], //required (饼图、圆环图为Number) 数据，如果传入null图表该处出现断点
      //   color: '#ff553e', //不传入则使用系统默认配色方案
      //   format: function(val) { //自定义显示数据内容
      //     return val.toFixed(2) + '篇'; //显示小数点后两位
      //   }
      // }, {
      //   name: '今日头条',
      //   data: [30, 37, 65, 78, 69, 54, 62, 47],
      //   color: '#ffe63e',
      //   format: function(val) {
      //     return val.toFixed(0) + '篇'; //显示整数型
      //   }
      // }],
      series: this.data.series,
      xAxis: {
        gridColor: '#7cb5ec', //default #cccccc X轴网格颜色
        fontColor: '#333333', //default #666666 X轴数据点颜色
        disableGrid: false, //default false 不绘制X轴网格
        type: 'calibration' //可选值calibration(刻度) 默认为包含样式
      },
      yAxis: { //Y轴配置
        format: function(val) { //自定义Y轴文案显示
          return val.toFixed(0);
        },
        min: 0, //Y轴起始值
        // max: 0, //Y轴终止值
        title: '文章数 (篇)', //Y轴title
        gridColor: '#e2e2e2', //default #cccccc Y轴网格颜色
        fontColor: '#333333', //default #666666 Y轴数据点颜色
        titleFontColor: '#333333', //default #333333 Y轴title颜色
        // disabled:  true //不绘制Y轴
      },
      width: windowWidth, //required canvas宽度，单位为px
      height: 200, //required canvas高度，单位为px
      dataLabel: false, //default true 是否在图表中显示数据内容值
      dataPointShape: true, //default true 是否在图表中显示数据点图形标识
      extra: {
        // ringWidth: 10, //ringChart圆环宽度，单位为px
        lineStyle: 'curve', //(仅对line, area图表有效) 可选值：curve曲线，straight直线 (default)
        // column: { //柱状图相关配置
        //   width: 10 //柱状图每项的图形宽度，单位为px
        // },
        // legendTextColor: '#ffffff', //default #cccccc legend文案颜色
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('analysisReport onLoad')
  },

  /**
   * 生命周期函数--监听页面初次渲染完成 
   */
  onReady: function () {
    console.log('analysisReport onReady')
    // 绘制图表
    this.wxCharts()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('analysisReport onShow')
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('analysisReport onHide')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('analysisReport onUnload')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log('analysisReport onPullDownRefresh')
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('analysisReport onReachBottom')
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  
  // }
})