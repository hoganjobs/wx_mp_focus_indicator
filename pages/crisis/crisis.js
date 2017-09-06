// crisis.js
var app = getApp()
var RequestUtil = require("../../utils/RequestUtil.js");
var datascore = 0
Page({
  /**
   * 页面的初始数据
   */
  data: {
    crisisboxAreaShowed: true, //
    scoreboxAreaShowed: false,
    checkboxAreaShowed: false,
    loadingDetailShow: false,
    loadingDecIcoShow: true,
    loadingDecShow: false,
    // resultboxAreaShowed: false,
    resultboxAreaShowed: true,
    resultArticleLoadShowed: false,
    resultArticleNoDataShowed: true,
    resultArticleFailDataShowed: true,
    pfIcoShow: {
        app: false,
        portals: false,
        search_engine: false,
        weixin: false,
        weibo: false,
        bbs: false
    },
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
    crisisboxAnimationData: {},
    totalCrisisScore: '0',
    totalCrisisScoreCal: 0,
    cursor_count: 0,
    productFormNameData: '开始查询',
    loadingDecData: '',
    productFormStyle: {
      portals: '',
      search_engine: '',
      bbs: '',
      app: '',
      weixin: 'border-color: #FFFFFF',
      weibo: 'border-color: #FFFFFF'
    },
    productFormNameStyle: {
      portals: '',
      search_engine: '',
      bbs: '',
      app: '',
      weixin: 'color: #FFFFFF',
      weibo: 'color: #FFFFFF'
    },
    productFormIco: {
        portals: 'icon_web.svg',
        search_engine: 'icon_search.svg',
        bbs: 'icon_forum.svg',
        app: 'icon_new.svg',
        weixin: 'icon_lock.svg',
        weibo: 'icon_lock.svg'
    },
    productFormScore: {
        portals: '0',
        search_engine: '0',
        bbs: '0',
        app: '0',
        weixin: '0',
        weibo: '0'
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
    stream_id: '', //定义stream_id用于判断websocket中added消息
    skip: 1, //设置列表请求页数的值
    stopFlag: true, //定义stopSocketJsonrpc执行标志
    user: 0
  },
  /**
   * 检测完成页面切换
   */
  changePage: function () {

    setTimeout(function() {
      console.log('changePage 检测页隐藏')
      var animation = wx.createAnimation({
        duration: 600,
        timingFunction: 'ease',
      })
      this.animation = animation
        // this.animation.scaleY(0).step()
      this.animation.translateY(-600).opacity(0).step()
      this.setData({
        crisisboxAnimationData: this.animation.export(),
        loadingDecIcoShow: true
      })
      setTimeout(function() {
        console.log('changePage 结果页显示')
        // let navTitle = '"' + this.data.keywordVal + '"' + '风口指数'
        this.setData({
          crisisboxAreaShowed: true,
          resultboxAreaShowed: false
        })
        //动态设置当前页面导航条的标题
        // wx.setNavigationBarTitle({
        //   title: navTitle
        // })
      }.bind(this), 800)
    }.bind(this), 1000)
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
    let keyword_rule = this.data.keyword_rule
    keyword_rule = JSON.stringify(keyword_rule)
    console.log(title_sign)
    let url = '../../pages/article/article?title_sign=' + title_sign + '&keyword_rule=' + keyword_rule
    // wx.navigateTo({
    //   url: url,
    //   success: function() {
    //     console.log('articleListTap url:', url)
    //     console.log('title_sign:', title_sign)
    //     console.log('keyword_rule:', keyword_rule)
    //   }
    // })    
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
   * 计算分类的总分
   */
  calPfScore: function (item_pf_score, isdraw) {
    // console.log(item_pf_score)
    let s_pf_id = item_pf_score.pf_id;
    let s_pf_score = item_pf_score.pf_score;
    let pf_score = this.data.productFormScore;
    let pf_score_cal= this.data.productFormScoreCal;
    let current_s_pf_score = pf_score_cal[s_pf_id] + s_pf_score;
    pf_score_cal[s_pf_id] = current_s_pf_score;
    pf_score[s_pf_id] = String(current_s_pf_score);
    // console.log(pf_score[s_pf_id])
    if (current_s_pf_score > 99999) {
      pf_score[s_pf_id] = String(Math.round(current_s_pf_score / 10000)) + '万';
    }
    this.data.productFormScoreCal = pf_score_cal
    if (isdraw) {
      this.setData({
        productFormScore: pf_score,
        // productFormScoreCal: pf_score_cal
      });
    }
  },
  /**
   * 根据检测状态操作样式
   */
  switchPfSign: function (item_pf_sign) {
    console.log(item_pf_sign)
    let i_pf_id = item_pf_sign.pf_id;
    let i_pf_sign = item_pf_sign.pf_sign;
    let pf_sign = this.data.pfIcoShow
    let pf_style = this.data.productFormStyle
    let pfn_style = this.data.productFormNameStyle
    let pf_ico = this.data.productFormIco
    let pf_score = this.data.productFormScore

    pf_sign[i_pf_id] = true;
    pf_style[i_pf_id] = 'border-color: #FFFFFF';
    pfn_style[i_pf_id] = 'color: #FFFFFF';
    if(i_pf_sign == 'pf_done' && pf_score[i_pf_id] == '0') {
      console.log('pf_done')
      // pf_ico[i_pf_id] = 'icon_complete.svg';
      // pf_sign[i_pf_id] = false;
      // console.log(typeof i_pf_id)
      // console.log(i_pf_id)
      if (i_pf_id == 'weixin' || i_pf_id == 'weibo') {
        pf_sign[i_pf_id] = false;
        pf_ico[i_pf_id] = 'icon_lock.svg';
      }
    }
    this.setData({
      pfIcoShow: pf_sign,
      productFormStyle: pf_style,
      productFormNameStyle: pfn_style,
      productFormIco: pf_ico

    });
  },

  /**
   * canvas圆环进度条
   * @ param  cavprogressPercent  进度百分比
   */
  canvasArc: function (cavprogressPercent) {
    if (cavprogressPercent <= 0) {
      return
    }
    var cxt_arc_arc = wx.createCanvasContext('canvasArc');
    cxt_arc_arc.setLineWidth(12); 
    cxt_arc_arc.setStrokeStyle('#00e4ff'); 
    cxt_arc_arc.setLineCap('round')
    cxt_arc_arc.beginPath();//开始一个新的路径 
    cxt_arc_arc.arc(116, 116, 100, Math.PI * 1 / 2, Math.PI*(1 / 2 + cavprogressPercent), false); 
    cxt_arc_arc.stroke();//对当前路径进行描边 
    cxt_arc_arc.draw(); 
    // console.log('canvasArc')
  },

  /**
   * canvas圆环进度条背景圆环
   */
  canvasArcBackground: function () {
    var cxt_arc = wx.createCanvasContext('canvasArcBg');//创建并返回绘图上下文context对象。 
    cxt_arc.setLineWidth(12); 
    cxt_arc.setShadow(0, 0, 20, '#0c94ec');
    cxt_arc.setStrokeStyle('#64b4ff'); 
    cxt_arc.setLineCap('round') 
    cxt_arc.beginPath();//开始一个新的路径
    cxt_arc.arc(116, 116, 100, 0, 2*Math.PI, false);//设置一个原点(116,116)，半径为100的圆的路径到当前路径 
    cxt_arc.stroke();//对当前路径进行描边 
    cxt_arc.draw();
  },

  /**
   * 检测历史storage写入
   */
  searchHistorySetStorage: function() {
    console.log('searchHistorySetStorage')
    var curTime = new Date().getTime();
    var keyword = this.data.keywordVal
    let keywordSearch = {
      data:keyword,
      time:curTime
    }
    let keywordArr;
    // 从本地缓存中异步获取指定 key 对应的内容。
    wx.getStorage({
      key: 'search_history',
      success: function(res) {
        keywordArr = res.data;
        if (keyword != '') {
          let repeat = false;
          // 对关键词数组元素进行去重
          for ( let key in keywordArr) {
            if (keywordArr[key].data == keyword) {
              repeat = true;
              keywordArr.splice(key, 1, keywordSearch)
            }
          }
          if (!repeat) {
            keywordArr.unshift(keywordSearch);
          }
          console.log('search_history records: ',keywordArr)
          // 将数据存储在本地缓存中指定的 key 中，会覆盖掉原来该 key 对应的内容。
          wx.setStorage({
            key:"search_history",
            data: keywordArr
          })
        }
      } 
    })
  },

  /**
   * 通过 WebSocket 连接发送消息，高级搜索
   */
  getKeywordsExtraction: function () {
    var that = this
    let keyword = this.data.keywordVal
    let get_stream = (this.data.getStream == 'false') ? false : true;
    RequestUtil.call(
      'fi_keywords_extraction', 
      {
        "keyword": keyword
      }, 
      function(result) {
        console.log('successCb fi_keywords_extraction', result)
        that.data.keyword_rule = result.keyword_rule;
        that.checkRedisResult();
      },
      function(error) {
        console.log('errorCb fi_keywords_extraction', error)
      }
    )
  },

  /**
   * 通过 WebSocket 连接发送消息，查询redis是否有结果
   */
  checkRedisResult: function () {
    var that = this
    let source_keyword = this.data.keyword_rule.source_keyword
    let keyword_rule = this.data.keyword_rule
    let condition = {"keyword_rule": keyword_rule}
    let get_stream = (this.data.getStream == 'false') ? false : true;
    RequestUtil.call(
      'check_redis_result', 
      {
        "keyword": source_keyword,
        "condition": condition
      }, 
      function(result) {
        console.log('successCb check_redis_result', result)
        // getStream为true显示检测页面
        if (!get_stream && result.result) {
          // 显示结果区域
          that.setData({
            resultboxAreaShowed: false
          });
          // that.getSocketJsonrpcMessage()
          // 获取最终分数
          that.getScoreJsonrpc()
          // 获取列表
          that.getTitleSignJsonrpc()
        }
        // 否则getStream为false时直接显示结果列表页面
        else {
          // 显示检测区域
          that.setData({
            crisisboxAreaShowed: false,
            loadingDecIcoShow: false
          });
          // 调用websocket发送消息，请求获取对应关键词jsonrpc数据
          that.getSocketJsonrpcMessage()
        }
      },
      function(error) {
        console.log('errorCb check_redis_result', error)
      }
    )
  },

  /**
   * 通过 WebSocket 连接发送消息，获取进度
   */
  getSocketJsonrpcMessage: function () {
    var that = this
    let get_stream = (this.data.getStream == 'false') ? false : true;
    let source_keyword = this.data.keyword_rule.source_keyword
    let keyword_rule = this.data.keyword_rule
    let condition = {"keyword_rule": keyword_rule, "get_stream": get_stream}
    let openid = app.globalData.openid
    console.log(openid)
    RequestUtil.call(
      'media_vane_scan', 
      {
        "keyword": source_keyword,
        "condition": condition,
        "document_id": openid
      }, 
      function(res) {
        console.log('successCb', res)
        // 判断start返回值，以判断服务端是否写入数据完成。
        if (res.start == false) {
          wx.showModal({
            title: '当前服务器忙，请稍后查询',
            content: '',
            showCancel: false,
            success: function(res) {
              if (res.confirm) {
                console.log('用户点击确定')
                // 在页面内 navigateBack，返回主页面
                wx.navigateBack({
                  delta: 1
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
        // 如果get_stream为false
        // if (!get_stream) {
        //   // 获取最终分数
        //   that.getScoreJsonrpc()
        //   // 获取列表
        //   that.getTitleSignJsonrpc()
        // }
      },
      function(res) {
        console.log('errorCb', res)
      },
      {
        onBegin: function (data) {
          console.log('onBegin', data)
          that.onJsonstreamBegin(data)
        },
        onAdd: function (data) {
          console.log('onAdd', data)
          that.onJsonstreamAdded(data)
        },
        onEnd: function (data) {
          console.log('onEnd', data)
          that.onJsonstreamEnd(data)
        }
      }
    );
  },

  /**
   * 针对websocket服务端发送消息，Jsonstream的Begin消息事件处理
   */
  onJsonstreamBegin: function (data) {
    this.data.stream_id = data.data.stream_id
    this.data.totalCrisisScoreCal = 0;
    this.setData({
      totalCrisisScore: '0',
      pfScore: {
          portals: '0',
          search_engine: '0',
          bbs: '0',
          app: '0',
          weixin: '0',
          weibo: '0'
      }
    });
    // 初始化圆环进度
    this.canvasArc(0)
  },

  /**
   * 针对websocket服务端发送消息，Jsonstream的Added消息事件处理
   */
  onJsonstreamAdded: function (data) {
    let isdraw = (data.data.cursor_current%10 == 0) ? true : false; //每10条消息绘制
    let second_time = parseInt((data.data.cursor_count - data.data.cursor_current) * 0.03)
    let cavprogressPercent = (data.data.cursor_current/data.data.cursor_count) * 2
    let article_product_form_id = data.data.product_form_id;
    let article_score = data.data.score;
    let article_media_name = data.data.media_name;
    let pf_IcoShow = this.data.pfIcoShow
    // 定义分类平台ID的传参变量
    let item_pf_sign = {
      pf_id: article_product_form_id,
      pf_sign: 'pf_active'
    }
    // 定义分类平台ID和分数
    let item_pf_score = {
      pf_id: article_product_form_id,
      pf_score: article_score
    }
    // 改变分类图标样式
    if (!pf_IcoShow[article_product_form_id]) {
      this.switchPfSign(item_pf_sign)
    }
    // 判断stream_id是否正确，执行总分、分类得分计算，执行进度绘制、进度描述的数据更新
    if (article_score > 0 && this.data.stream_id == data.data.stream_id) {
      let total_score_cal = this.data.totalCrisisScoreCal;
      total_score_cal = total_score_cal + article_score;
      let total_score = String(total_score_cal)
      //超过指定位数时，转换为单位显示
      if (total_score_cal > 999999) {
        total_score = String(Math.round(total_score_cal / 10000)) + '万';
      }
      // 
      this.data.totalCrisisScoreCal = total_score_cal;
      if (isdraw) {
        // 更新总分数据、更新查询描述的媒体、查询的剩余时间
        this.setData({
          totalCrisisScore: total_score,
          productFormNameData: '正在查询: ' + article_media_name,
          estimateTimeData: '预计查询时间：' + second_time + ' 秒'
        });
        // 绘制圆环进度
        this.canvasArc(cavprogressPercent)
        // 计算分类分数，更新分类数据
        this.calPfScore(item_pf_score, isdraw)
      }
    }
  },

  /**
   * 针对websocket服务端发送消息，Jsonstream的End消息事件处理
   */
  onJsonstreamEnd: function (data) {
    let result_loading_dec = '完成';
    let pf_score = data.data.pf_score;
    let key;
    if (this.data.stream_id == data.data.stream_id) {
      // 遍历分类分数，判断是否为0，更改图标显示
      for ( key in pf_score) {
        console.log(pf_score[key])
        if(pf_score[key] == '0') {
          let item_pf_sign = {
            pf_id: key,
            pf_sign: 'pf_done'
          }
          this.switchPfSign(item_pf_sign)
        }
      }
      // 
      this.data.stopFlag = false;
      // 更新页面，查询完成
      this.setData({
        loadingDecIcoShow: true,
        productFormNameData: result_loading_dec
      });
      // 闭合圆环进度
      this.canvasArc(2)
      // 检测完成，调用页面切换动画
      this.changePage()
      // 写入查询记录
      this.searchHistorySetStorage()
      // 获取最终分数
      this.getScoreJsonrpc()
      // 获取列表
      this.getTitleSignJsonrpc()
    }
  },

  /**
   * 通过 WebSocket 连接发送消息，获取最终分数
   */
  getScoreJsonrpc: function () {
    var that = this
    let source_keyword = this.data.keyword_rule.source_keyword
    let keyword_rule = this.data.keyword_rule
    let condition = {"keyword_rule": keyword_rule}
    RequestUtil.call(
      'focus_indicator_score', 
      {
        "keyword": source_keyword,
        "condition": condition
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
    let keyword_rule = this.data.keyword_rule
    let skip = this.data.skip
    let source_keyword = this.data.keyword_rule.source_keyword
    let condition = {"keyword_rule": keyword_rule, "skip": skip}
    let list = {"title_sign_wind": 12, "media_name_sign": "\u7535\u5b50\u4ea7\u54c1\u4e16\u754c", "media_name": "\u7535\u5b50\u4ea7\u54c1\u4e16\u754c", "score": 692, "title": "\u4f59\u627f\u4e1c\u5439\u725b\u9010\u6e10\u6210\u771f,\u534e\u4e3a\u624b\u673a\u4e09\u5b63\u5ea6\u6709\u671b\u8d85\u82f9\u679c\u6210\u5168\u7403\u7b2c\u4e8c", "title_sign": "18308525811439881464", "is_sensitive": false, "abstract": "\u201c\u4e09\u5e74\u8d85\u82f9\u679c,\u4e94\u5e74\u8d85\u4e09\u661f\u201d\u2014\u2014\u8fd9\u662f2016\u5e742\u6708,\u6d88\u8d39\u8005\u4e1a\u52a1CEO \u4f59\u627f\u4e1c\u5728\u5a92\u4f53\u9762\u524d\u653e\u51fa\u7684\u8c6a\u8a00\u3002\u2028\u8fd9\u6837\u7684\u8a00\u8bba\u4e00\u77f3\u6fc0\u8d77\u5343\u5c42\u6d6a,\u7f51\u4e0a\u5f88\u591a\u4eba\u79f0", "product_form_id": "search_engine", "url": "http://www.eepw.com.cn/article/201708/362862.htm", "media_wind": 4, "title_sign_score": 809, "media_score": 692, "publish_at": "2017-08-11 08:16:45", "category_id": "baidu", "media_num": 2, "id": "59910023482ff75050b6e290"}
    RequestUtil.call(
      'media_vane_title_sign_list', 
      {
        "keyword": source_keyword,
        "condition": condition
      }, 
      function(result) {
        console.log('successCb media_vane_title_sign_list', result)
        if (result) {
          try {
            let articles = result;
            if (articles.result == false) {
              that.setData({
                resultArticleLoadShowed: true,
                resultArticleFailDataShowed: false
              });
            }
            // 没有列表数据显示暂无
            if (articles.length == 0) {
              that.setData({
                resultArticleLoadShowed: true,
                resultArticleNoDataShowed: false
              });
            }
            if (articles.length > 0) {
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
    let keyword_rule = this.data.keyword_rule
    let skip = this.data.skip
    let source_keyword = this.data.keyword_rule.source_keyword
    let condition = {"keyword_rule": keyword_rule, "skip": skip}
    let titleSignCount = this.data.titleSignCount
    let resultArticleData = this.data.resultArticleData
    let resultArticleData2 = this.data.resultArticleData2
    let resultArticleData3 = this.data.resultArticleData3
    let listDataLength = resultArticleData.length + resultArticleData2.length + resultArticleData3.length
    if (listDataLength < titleSignCount && listDataLength < 600) {
      this.setData({
        resultArticleLoadShowed: false
      });
      RequestUtil.call(
        'media_vane_title_sign_list', 
        {
          "keyword": source_keyword,
          "condition": condition
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
              // else if (listDataLength > 599 && listDataLength < 1000) {
              //   try {
              //     that.setData({
              //       resultArticleData3: resultArticleData3.concat(articles),
              //       resultArticleLoadShowed: true
              //     });
              //   } catch (err) {
              //     console.log(err)
              //     that.setData({
              //       resultArticleLoadShowed: true
              //     });
              //   }
              // }
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
   * 通过 WebSocket 连接发送消息，停止该关键词查询消息推送
   */
  stopSocketJsonrpc: function () {
    var that = this
    let source_keyword = this.data.keyword_rule.source_keyword
    let keyword_rule = this.data.keyword_rule
    let condition = {"keyword_rule": keyword_rule}
    // 初始化stream_id的值
    this.data.stream_id = 0;
    // 初始化圆环进度
    this.canvasArc(0);
    RequestUtil.call(
      'media_vane_stop', 
      {
        "keyword": source_keyword,
        "condition": condition
      }, 
      function(result) {
        console.log('successCb media_vane_stop', result)
      },
      function(error) {
        console.log('errorCb media_vane_stop', error)
      }
    )
  },

  /**
   * 获取用户设备信息函数
   */
  getSystemInfo: function() {
    // 调用微信API获取用户设备信息
    wx.getSystemInfo({
      success: function(res) {
        console.log(res.model)
        console.log(res.pixelRatio)
        console.log(res.windowWidth)
        console.log(res.windowHeight)
        console.log(res.language)
        console.log(res.version)
        console.log(res.platform)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('crisis onLoad')
    console.log(options)
    // this.data.keywordVal = options.keywordVal //关键词传递赋值
    this.data.keywordVal = decodeURIComponent(options.keywordVal) //关键词传递赋值
    this.data.getStream = options.getStream //是否需要进度

    // //动态设置当前页面导航条的背景颜色, 经验证ios设备下有兼容问题
    // wx.setNavigationBarColor({
    //     frontColor: '#ffffff',
    //     backgroundColor: '#1788fb',
    //     animation: {
    //         duration: 400,
    //         timingFunc: 'easeIn'
    //     }
    // })

    // 调用websocket发送消息，请求获取对应关键词jsonrpc数据
    this.getKeywordsExtraction()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log('crisis onReady')
    // 绘制canvas圆环进度条背景圆环
    this.canvasArcBackground()
    let navTitle = '"' + this.data.keywordVal + '"' + '风口指数'
    //动态设置当前页面导航条的标题
    wx.setNavigationBarTitle({
      title: navTitle,
      success: function (res) {
      console.log('success crisis navTitle:', res)
      console.log('crisis navTitle:', navTitle)
      // 修改app全局变量传入为当前页面的标题
      app.globalData.NavigationBarTitle = navTitle;
      // console.log('app.globalData.NavigationBarTitle:', app.globalData.NavigationBarTitle)
      },
      fail: function(err) {
        console.log('fail crisis navTitle:', err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('crisis onShow')
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('crisis onHide') 
    // this.stopSocketMessage()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('crisis onUnload')
    let that = this
    // 发送WebSocket的stop消息，以停止检测
    if (this.data.stopFlag) {
      this.stopSocketJsonrpc()
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log('crisis onPullDownRefresh')
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('crisis onReachBottom')
    let resultArticleData = this.data.resultArticleData
    // 上拉刷新列表
    if (resultArticleData.length > 0) {
      this.loadTitleSignJsonrpc()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    console.log('crisis onShareAppMessage')
    let keywordVal = this.data.keywordVal
    let getStream = this.data.getStream
    // keywordVal = encodeURIComponent(keywordVal)
    let url = '/pages/crisis/crisis?keywordVal=' + keywordVal +'&getStream=' + getStream
    let title = '"' + this.data.keywordVal + '"' + '风口指数'
    if (res.from === 'menu') {
      // 来自页面内转发按钮
      console.log('crisis onShareAppMessage from menu')
      console.log(res.target)
    }
    return {
      title: title,
      path: url,
      success: function(res) {
        // 转发成功
        console.log('success crisis onShareAppMessage')
        console.log('crisis onShareAppMessage url:', url)
        console.log('crisis onShareAppMessage title:', title)
      },
      fail: function(res) {
        // 转发失败
        console.log('fail crisis onShareAppMessage')
      }
    }
  }
})