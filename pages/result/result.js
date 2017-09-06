// result.js
var app = getApp()
var RequestUtil = require("../../utils/RequestUtil.js");
let SnackBar = require("../../library/snackbar/snackbar.js")
let timer1 = null //检测获取最新缓存版本号的定时器
Page({

  /**
   * 页面的初始数据
   */
  data: {
    resultboxAreaShowed: false,
    resultArticleLoadShowed: false,
    resultArticleNoDataShowed: true,
    resultArticleFailDataShowed: true,
    pfFinalIcoShow: {
      app: true,
      portals: true,
      search_engine: true,
      weixin: false,
      weibo: false,
      bbs: true
    },
    keywordVal: '',
    keyword_rule: '',
    productFormIco: {
      portals: 'icon_web.svg',
      search_engine: 'icon_search.svg',
      bbs: 'icon_forum.svg',
      app: 'icon_new.svg',
      weixin: 'icon_lock.svg',
      weibo: 'icon_lock.svg'
    },
    productFormScoreCal: {
      app: 0,
      portals: 0,
      search_engine: 0,
      weixin: 0,
      weibo: 0,
      bbs: 0
    },
    pfScore: {
      portals: '0',
      search_engine: '0',
      bbs: '0',
      app: '0',
      weixin: '0',
      weibo: '0'
    },
    resultArticleData: [], //定义上拉分页数据数组1
    resultArticleData2: [], //定义上拉分页数据数组2
    resultArticleData3: [], //定义上拉分页数据数组3
    resultArticleData4: [], //定义上拉分页数据数组4
    titleSignCount: 0,
    skip: 1, //设置列表请求页数的值
    cacheVersion: null, //列表数据缓存版本号
  },
  /**
   * 微博、微信分类图标的点击事件，显示提示信息
   */
  lockTipsTap: function (event) {
    console.log('lockTipsTap')
    wx.showModal({
      title: '该功能尚未开通，敬请期待！',
      content: '',
      showCancel: false,
      success: function(res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  /**
   * 媒体观点列表项的点击事件，传递页面数据参数
   */
  articleListTap: function (event) {
    console.log('articleListTap')
    console.log(event)
    let title_sign = event.currentTarget.dataset.article.title_sign
    title_sign = title_sign.replace('"', '')
    let keyword_rule = app.globalData.keywordRuleVal
    keyword_rule = JSON.stringify(keyword_rule)
    console.log(title_sign)
    let url = '../../pages/article/article?title_sign=' + title_sign + '&keyword_rule=' + keyword_rule 
    wx.navigateTo({
      url: url,
      success: function() {
        console.log('articleListTap url:', url)
        console.log('title_sign:', title_sign)
        console.log('keyword_rule:', keyword_rule)
      }
    })
  },

  /**
   * 通过 WebSocket 连接发送消息，获取最终分数
   */
  getScoreJsonrpc: function () {
    var that = this
    let source_keyword = app.globalData.keywordRuleVal.source_keyword
    let keyword_rule = app.globalData.keywordRuleVal
    let condition = {"keyword_rule": keyword_rule}
    let openid = app.globalData.openid
    RequestUtil.call(
      'focus_indicator_score', 
      {
        "keyword": source_keyword,
        "condition": condition,
        "document_id": openid
      }, 
      function(result) {
        console.log('successCb focus_indicator_score', result)
        if (result) {
          // let scores = JSON.parse(result);
          let scores = result;
          // 更新页面总分、分类分数数据
          that.setData({
            finalCrisisScore: scores.total_score,
            pfScore: scores.pf_score,
            titleSignCount: scores.title_sign_count
          });
        }
      },
      function(error) {
        console.log('errorCb focus_indicator_score', error)
      }
    )
  },

  /**
   * 通过 WebSocket 连接发送消息，获取列表
   */
  getTitleSignJsonrpc: function () {
    var that = this
    let keyword_rule = app.globalData.keywordRuleVal
    let skip = this.data.skip
    let source_keyword = app.globalData.keywordRuleVal.source_keyword
    let condition = {"keyword_rule": keyword_rule, "skip": skip}
    let openid = app.globalData.openid
    RequestUtil.call(
      'media_vane_title_sign_list', 
      {
        "keyword": source_keyword,
        "condition": condition,
        "document_id": openid
      }, 
      function(result) {
        console.log('successCb media_vane_title_sign_list', result)
        if (result) {
          try {
            let articles = result;
            // result为false显示加载失败
            if (articles.result == false) {
              that.setData({
                resultArticleLoadShowed: true,
                resultArticleFailDataShowed: false
              });
            }
            // 没有列表数据显示暂无数据
            if (articles.length == 0) {
              that.setData({
                resultArticleLoadShowed: true,
                resultArticleNoDataShowed: false
              });
            }
            // 正常显示列表数据
            if (articles.length > 0) {
              // 截取时间，只显示到年月日
              for (var i = 0; i < articles.length; i++) {
                let date = articles[i].publish_at.slice(0, 10)
                articles[i].publish_at = date
              }
              try {
                that.setData({
                  resultArticleLoadShowed: true,
                  resultArticleFailDataShowed: true,
                  resultArticleData: articles
                });
              } catch (err) {
                console.log(err)
              }
              that.data.skip = skip + 100
            }
          } catch (error) {
            console.log(error)
            that.setData({
              resultArticleLoadShowed: true,
              resultArticleFailDataShowed: false
            });
          }
        }
        else {
          that.setData({
            resultArticleLoadShowed: true,
            resultArticleFailDataShowed: false
          });
        }
      },
      function(error) {
        console.log('errorCb media_vane_title_sign_list', error)
      }
    )
  },

  /**
   * 通过 WebSocket 连接发送消息，获取列表数据，实现上拉刷新列表
   * 由于微信官方规定：
   * 1、直接修改 this.data 而不调用 this.setData 是无法改变页面的状态的，还会造成数据不一致。
   * 2、单次设置的数据不能超过1024kB，请尽量避免一次设置过多的数据。
   * 这里设置当列表数据 titleSignCount 大于400条时开始第二个数组及模版接收列表数据。
   */
  loadTitleSignJsonrpc: function () {
    var that = this
    let keyword_rule = app.globalData.keywordRuleVal
    let skip = this.data.skip
    let source_keyword = app.globalData.keywordRuleVal.source_keyword
    let condition = {"keyword_rule": keyword_rule, "skip": skip}
    let openid = app.globalData.openid
    let titleSignCount = this.data.titleSignCount
    let resultArticleData = this.data.resultArticleData
    let resultArticleData2 = this.data.resultArticleData2
    let listDataLength = resultArticleData.length + resultArticleData2.length
    if (listDataLength < titleSignCount && listDataLength < 600) {
      this.setData({
        resultArticleLoadShowed: false
      });
      RequestUtil.call(
        'media_vane_title_sign_list', 
        {
          "keyword": source_keyword,
          "condition": condition,
          "document_id": openid
        }, 
        function(result) {
          console.log('successCb media_vane_title_sign_list ', result)
          // for (let key in result) {
          //   if (result[key].abstract) {
          //     result[key].abstract = ''
          //   }
          // } 
          if (result) {
            try {
              let articles = result;
              if (result.result == false) {
                that.setData({
                  resultArticleLoadShowed: true
                });
                return
              }
              for (var i = 0; i < articles.length; i++) {
                let date = articles[i].publish_at.slice(0, 10)
                articles[i].publish_at = date
              }
              if (listDataLength < 400) {
                that.setData({
                  resultArticleData: resultArticleData.concat(articles),
                  resultArticleLoadShowed: true
                });
              }
              else if (listDataLength > 399 && listDataLength < 800) {
                try {
                  that.setData({
                    resultArticleData2: resultArticleData2.concat(articles),
                    resultArticleLoadShowed: true
                  });
                } catch (err) {
                  console.log(err)
                  that.setData({
                    resultArticleLoadShowed: true
                  });
                }
              }
              that.data.skip = skip + 100
            } catch (error) {
              console.log(error)
              that.setData({
                resultArticleLoadShowed: true
              });
            }
          }
        },
        function(error) {
          console.log('errorCb media_vane_title_sign_list', error)
        }
      )
    }
    // else if (listDataLength > 899) {
    //   this.setData({
    //     resultArticleLoadShowed: true
    //   });
    // }
  },

  /**
   * 通过 WebSocket 连接发送消息，获取最新缓存版本号，用于判断列表数据是否更新
   */
  getCacheVersion: function () {
    console.log('result getCacheVersion')
    let that = this
    let source_keyword = app.globalData.keywordRuleVal.source_keyword
    let keyword_rule = app.globalData.keywordRuleVal
    let condition = {"keyword_rule": keyword_rule}
    let openid = app.globalData.openid
    let cacheVersion = this.data.cacheVersion
    RequestUtil.call(
      'fi_cache_version', 
      {
        "keyword": source_keyword,
        "condition": condition,
        "document_id": openid
      }, 
      function(result) {
        console.log('successCb fi_cache_version', result) 
        if (cacheVersion) {
          // 判断版本号是否改变，即redis缓存数据改变，可提示更新数据
          if (result.version != cacheVersion) {
            // SnackBar底部提示栏，用于提醒用户更新列表数据
            SnackBar.getInstance().make({
              snack_title: "发现媒体观点有新的数据可更新",
              snack_action: '马上更新',
              onActionClick: "onUpdateList",
              duration: 20000,
              style_snack_action: 'display: block; border-radius: 5px;',
              style_snackbar: 'background-color:rgba(0, 0, 0, 0.6);',
              cancelSnackBarTap: 'cancelSnackBarTap'
            })
            // 更新列表数据版本号
            that.data.cacheVersion = result.version
          }
        }else {
          // 缓存当前列表数据版本号
          that.data.cacheVersion = result.version
        }
      },
      function(error) {
        console.log('errorCb fi_cache_version', error)
      }
    )
  },

  /**
   * snackbar点击事件，显示提示信息
   */
  snackbarTap: function () {
    console.log('result snackbarTap')
    SnackBar.getInstance().make({
      snack_title: "发现媒体观点有新的数据可更新",
      snack_action: '马上更新',
      onActionClick: "onUpdateList",
      duration: 10000,
      style_snack_action: 'display: block; border-radius: 5px;',
      style_snackbar: 'background-color:rgba(0, 0, 0, 0.6);',
      cancelSnackBarTap: 'cancelSnackBarTap'
    })
  },

  /**
   * snackbar提示栏的onUpdateList点击事件，更新列表数据
   */
  onUpdateList: function () {
    console.log('result onActionClick')
    // 隐藏提示栏
    SnackBar.getInstance().hide();
    // 初始化列表数据
    this.data.skip = 1;
    this.setData({
      resultArticleLoadShowed: false,
      resultArticleData: [],
      resultArticleData2: []
    });
    // 获取带时间排序的列表
    this.getTitleSignListJsonrpc()
  },

  /**
   * 隐藏snackbar提示栏的点击事件函数
   */
  cancelSnackBarTap: function () {
    console.log('result cancelSnackBarTap')
    // 隐藏提示栏
    SnackBar.getInstance().hide();
  },

  /**
   * 设定定时器，获取redis版本号，开启snackbar提示栏提示用户可更新列表数据
   */
  detectCacheVersion: function () {
    console.log('result detectCacheVersion')
    // 关闭检测获取最新缓存版本号的定时器timer1
    clearInterval(timer1);
    // 开启检测获取最新缓存版本号的定时器timer1
    timer1 = setInterval(() => {
      console.log('detectCacheVersion setInterval timer1')
      // 获取最新缓存版本号
      this.getCacheVersion()
    }, 60000)
  },

  /**
   * 通过 WebSocket 连接发送消息，获取
   */
  getTitleSignListJsonrpc: function () {
    var that = this
    let source_keyword = app.globalData.keywordRuleVal.source_keyword
    let keyword_rule = app.globalData.keywordRuleVal
    let condition = {"keyword_rule": keyword_rule, "sort": 'day'}
    let openid = app.globalData.openid
    console.log(openid)
    RequestUtil.call(
      'fi_title_sign_list', 
      {
        "keyword": source_keyword,
        "condition": condition,
        "document_id": openid
      }, 
      function(res) {
        console.log('getTitleSignListJsonrpc successCb', res)
        that.data.stream_id = res.stream_id
        // 开启订阅Jsonstream结果
        that.subscribeJsonstream(res.stream_id)
      },
      function(res) {
        console.log('getTitleSignListJsonrpc errorCb', res)
      }
    );
  },

  /**
   * 订阅Jsonstream进度
   */
  subscribeJsonstream: function (streamId) {
    var that = this
    let stream_id = streamId
    console.log('subscribeJsonstream stream_id:',stream_id)
    RequestUtil.subscribeJsonStream(
      stream_id,
      function(begin) {
        console.log('begin data', begin);
        
      },
      function(add) {
        console.log('add data', add);
        
      },
      function(end) {
        console.log('end data', end);
        
      },
      function(result) {
        console.log('result data', result);
        if (result) {
          try {
            let articles = result.data.title_sign_list;
            // result为false显示加载失败
            if (result.data.result == false) {
              that.setData({
                resultArticleLoadShowed: true,
                resultArticleFailDataShowed: false
              });
              return
            }
            // 没有列表数据显示暂无数据
            if (articles.length == 0) {
              that.setData({
                resultArticleLoadShowed: true,
                resultArticleNoDataShowed: false
              });
            }
            // 正常显示列表数据
            if (articles.length > 0) {
              // articles = articles.slice(0, 100);
              // json数组数据分类分组处理
              let map = {}, //定义一个对象用于存储不同项分类
                  dest = []; //定义一个数组用于存储分类分组后的数组
              // 遍历json数组中每一个对象数据
              for (let i = 0; i < articles.length; i++) {
                let art_i = articles[i];
                // 将发布时间中带00:00:00的过滤，只显示到年月日
                art_i.publish_at = art_i.publish_at.replace('00:00:00', '')
                // 判断是否为新的分类
                if (!map[art_i.publish_date]) {
                  // 存入新的一类数据
                  dest.push({
                    publish_date: art_i.publish_date,
                    data: [art_i]
                  });
                  // 把新的不同分类判断的存入map
                  map[art_i.publish_date] = art_i;
                } else {
                  // 将相同的存入对应一组分类中
                  for (let j = 0; j < dest.length; j++) {
                    let dj = dest[j];
                    if (dj.publish_date == art_i.publish_date) {
                      dj.data.push(art_i);
                      break;
                    }
                  }
                }
              }
              try {
                that.setData({
                  resultArticleLoadShowed: true,
                  resultArticleFailDataShowed: true,
                  resultArticleData: dest
                });
              } catch (err) {
                console.log(err)
              }
            }
            console.log('articles:', dest)
          } catch (error) {
            console.log(error)
          }
        } else {
          that.setData({
            resultArticleLoadShowed: true,
            resultArticleFailDataShowed: false
          });
        }
      }
    )
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('result onLoad')
    console.log(options)
    // this.data.keywordVal = decodeURIComponent(options.keywordVal)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log('result onReady')
    let keywordVal = app.globalData.keywordRuleVal.source_keyword
    let navTitle = '"' + keywordVal + '"' + '风口指数'
    //动态设置当前页面导航条的标题
    wx.setNavigationBarTitle({
      title: navTitle,
      success: function (res) {
      console.log('success result navTitle:', res)
      console.log('result navTitle:', navTitle)
      // 修改app全局变量传入为当前页面的标题
      app.globalData.NavigationBarTitle = navTitle;
      // console.log('app.globalData.NavigationBarTitle:', app.globalData.NavigationBarTitle)
      },
      fail: function(err) {
        console.log('fail result navTitle:', err)
      }
    });
    // 获取最终分数
    this.getScoreJsonrpc()
    // 获取redis版本号
    this.getCacheVersion()
    // 获取列表
    // this.getTitleSignJsonrpc()
    // 开启定时检测获取最新缓存版本号
    this.detectCacheVersion()
    // 获取带时间排序的列表
    this.getTitleSignListJsonrpc()

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('result onShow')
    // 显示当前页面的转发按钮，开启带 shareTicket 的转发
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('result onHide')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('result onUnload')
    // 关闭检测获取最新缓存版本号的定时器timer1
    clearInterval(timer1);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log('result onPullDownRefresh')
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('result onReachBottom')
    let resultArticleData = this.data.resultArticleData
    // 上拉刷新列表
    // if (resultArticleData.length > 0) {
    //   this.loadTitleSignJsonrpc()
    // }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    console.log('result onShareAppMessage')
    let keyword_rule = app.globalData.keywordRuleVal
    let source_keyword = app.globalData.keywordRuleVal.source_keyword
    let url = '/pages/resultLoad/resultLoad?keywordRuleVal=' + JSON.stringify(keyword_rule)
    let title = '"' + source_keyword + '"' + '风口指数'
    if (res.from === 'menu') {
      // 来自页面内转发按钮
      console.log('result onShareAppMessage from menu')
      // console.log(res.target)
    }
    return {
      title: title,
      path: url,
      success: function(res) {
        // 转发成功
        console.log('success result onShareAppMessage', res)
        console.log('result onShareAppMessage url:', url)
        console.log('result onShareAppMessage title:', title)
      },
      fail: function(res) {
        // 转发失败
        console.log('fail result onShareAppMessage')
      }
    }
  }
})