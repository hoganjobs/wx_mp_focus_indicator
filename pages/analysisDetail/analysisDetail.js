// pages/analysisDetail/analysisDetail.js
var app = getApp()
var RequestUtil = require("../../utils/RequestUtil.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // abstractShow: true,
    currentItem: [],
    label: '',
  },

  /**
   * 更多相关信息的点击事件
   */
  loadMoreTap: function(event) {
    var self = this
    console.log('analysisDetail loadMoreTap')
    console.log(event)
    let idx = event.currentTarget.dataset.id
    let currentItem = this.data.currentItem
    console.log(idx)
    if (currentItem[idx] == idx) {
      currentItem[idx] = -1;
      this.setData({
        currentItem: currentItem
      })
    } else {
      currentItem[idx] = idx;
      this.setData({
        currentItem: currentItem
      })
    }
  },

  /**
   * 通过 WebSocket 连接发送消息，以获取数据
   */
  getSocketJsonrpcLabelDetail: function () {
    var self = this
    let label = this.data.label
    let source_keyword = app.globalData.keywordRuleVal.source_keyword
    let keyword_rule = app.globalData.keywordRuleVal
    let condition = {"keyword_rule": keyword_rule, "label": label}
    let openid = app.globalData.openid
    // let source_keyword = '百度'
    // let keyword_rule = {"source_keyword":"百度","and_keyword":[],"not_keyword":[]}
    // let condition = {"keyword_rule": keyword_rule, "label": label}
    // let openid = 'owrXu0Pjm42svXnSgfnV_2-q1PUg'
    console.log(openid)
    RequestUtil.call(
      'fi_label_detail', 
      {
        "keyword": source_keyword,
        "condition": condition,
        "document_id": openid
      }, 
      function(res) {
        console.log('getSocketJsonrpcLabelDetail successCb', res)
        if (res) {
          self.setData({
            analysisData: res
          })
        }
        // that.data.stream_id = res.stream_id
        // that.subscribeJsonstream(res.stream_id)
      },
      function(res) {
        console.log('getSocketJsonrpcLabelDetail errorCb', res)
      }
    );
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('analysisDetail onLoad')
    this.data.label = JSON.parse(decodeURIComponent(options.label))
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log('analysisDetail onReady')
    // 设置可滚动视图区域高度
    let windowHeight = app.globalData.systemInfo.windowHeight
    let scrollHeight = windowHeight - 30 // 减去高度
    this.setData({
      scrollHeight: scrollHeight
    })
    let searchTitle = app.globalData.searchTitle
    let navTitle = '"' + searchTitle + '"' + '焦点分析(详情)'
    //动态设置当前页面导航条的标题
    wx.setNavigationBarTitle({
      title: navTitle,
      success: function (res) {
      console.log('success analysisDetail navTitle:', res)
      console.log('analysisDetail navTitle:', navTitle)
      // 修改app全局变量传入为当前页面的标题
      app.globalData.NavigationBarTitle = navTitle;
      // console.log('app.globalData.NavigationBarTitle:', app.globalData.NavigationBarTitle)
      },
      fail: function(err) {
        console.log('fail analysisDetail navTitle:', err)
      }
    })
    // 
    this.getSocketJsonrpcLabelDetail();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('analysisDetail onShow')
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('analysisDetail onHide')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('analysisDetail onUnload')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log('analysisDetail onPullDownRefresh')
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('analysisDetail onReachBottom')
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  //   console.log('analysisDetail onShareAppMessage')
  // }
})