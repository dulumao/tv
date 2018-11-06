var tvSetting = $.extend({}, tvOption);
var customLang = {
	'zh' : {
		title1 : "1分钟",
		timeList1 : "1分钟 - 范围1天",

		title5 : "5分钟",
		timeList5 : "5分钟 - 范围2天",

		title15 : "15分钟",
		timeList15 : "15分钟 - 范围3天",

		title30 : "30分钟",
		timeList30 : "30分钟 - 范围1个月",

		title60 : "1小时",
		timeList60 : "1小时 - 范围3个月",

		title240 : "4小时",
		timeList240 : "4小时 - 范围6个月",

		titleD : "1天",
		timeListD : "1天 - 范围1年",

		title3D : "3天",
		timeList3D : "3天 - 范围3年",

		datas: "周期：",
		zhibiao: "指标："
	},

	'en' : {
		title1 : "1M",
		timeList1 : "1M - Range 1D",

		title5 : "5M",
		timeList5 : "5M - Range 2D",

		title15 : "15M",
		timeList15 : "15M - Range 3D",

		title30 : "30M",
		timeList30 : "30M - Range 1Month",

		title60 : "1H",
		timeList60 : "1H - Range 3Month",

		title240 : "4H",
		timeList240 : "4H - Range 6Month",

		titleD : "1D",
		timeListD : "1D - Range 1Y",

		title3D : "3D",
		timeList3D : "3D - Range 1Y",

		datas: "Period：",
		zhibiao: "Indicatrix："
	}
};
var getCustomLang = function(name){
	var lang = tvGetParameterByName('lang') || 'zh';
	return customLang[lang][name];
}


var wdws = null;
var wdajax = null;
var loopTime = null;
var oldResolution = null;
var ajaxLoop = null;
var ajaxLoopTime = null;
var timeSpace = 2500;
var repeatCount = 0;

// 自定义周期按钮
var tvTimeList = {
	'1': { text: "1D", resolution: "1", description: getCustomLang('timeList1'), title: getCustomLang('title1'), millisecond: 60 * 1 },
	'5': { text: "1D", resolution: "5", description: getCustomLang('timeList5'), title: getCustomLang('title5'), millisecond: 60 * 5 },
	'15': { text: "2D", resolution: "15", description: getCustomLang('timeList15'), title: getCustomLang('title15'), millisecond: 60 * 15 },
	'30': { text: "5D", resolution: "30", description: getCustomLang('timeList30'), title: getCustomLang('title30'), millisecond: 60 * 30 },
	'60': { text: "10D", resolution: "60", description: getCustomLang('timeList60'), title: getCustomLang('title60'), millisecond: 60 * 60 },
	'240': { text: "1M", resolution: "240", description: getCustomLang('timeList240'), title: getCustomLang('title240'), millisecond: 60 * 240 },
	'D': { text: "1Y", resolution: "D", description: getCustomLang('timeListD'), title: getCustomLang('titleD'), millisecond: 60 * 60 * 24 },
	'3D': { text: "3Y", resolution: "3D", description: getCustomLang('timeList3D'), title: getCustomLang('title3D'), millisecond: 60 * 60 * 24 * 3 },
};
var tvTimeFrames = [];
for(var i in tvTimeList){
	tvTimeFrames.push({
		resolution: tvTimeList[i].resolution,
		text: tvTimeList[i].text,
		title: tvTimeList[i].title,
		description: tvTimeList[i].description
	});
}

var tvChangeTime = {
	second : function(time) {
		return tvTimeList[time].millisecond;
	},
	getTimeFrame : function(time) {
		return tvTimeList[time].text;
	}
};
function tvGetParameterByName (name) {
	var tvLang = $.getCookie('Language');
	// var tvLang = 'zh_CN';
	if(tvLang == 'zh_CN'){
		return 'zh';
	}
	else if(tvLang == 'en_US'){
		return 'en';
	}
	else {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g," "));
	}
};


// 基本配置项
var jsApiConfiguration = {
	description : tvSetting.coinname,
	session : "24x7",
	has_intraday : true,
	has_daily : true,
	has_weekly_and_monthly : false,
	timezone : "UTC",
	supported_resolutions: [ '1', '5', '15', '30', '60', '240', 'D', '3D' ]
};
// 币种基本配置项
var jsApiSymbolInfo = {
	"currency_code" : "",
	"data_status" : "",
	"description" : tvSetting.coinname,
	"exchange" : " ",
	"expiration_date" : "",
	"expired" : "",
	"force_session_rebuild" : "",
	"fractional" : false,
	"has_daily" : true,
	"has_empty_bars" : true,
	"has_intraday" : true,
	"has_no_volume" : !tvSetting.tvSideBar,
	"has_seconds" : false,
	"has_weekly_and_monthly" : false,
	"industry" : "",
	"intraday_multipliers" : "",
	"listed_exchange" : "",
	"minmov" : 1,
	"minmove2" : 0,
	"name" : tvSetting.coinid,
	"pricescale" : 100000,
	"seconds_multipliers" : "",
	"sector" : "",
	"session" : "24x7",
	"supported_resolutions" : [ '1', '5', '15', '30', '60', '240', 'D', '3D' ],
	"ticker" : tvSetting.coinid,
	"timezone" : "Asia/Shanghai",
	"type" : "",
	"volume_precision" : ""
}

// Tradingview 订阅配置
var wdUpdate = {
	_subscribers : {},
	_unsubscribeDataListener : function(listenerGUID) {
		delete this._subscribers[listenerGUID];
	},
	_subscribeDataListener : function(symbolInfo, resolution, onRealtimeCallback, listenerGUID) {
		if (!this._subscribers.hasOwnProperty(listenerGUID)) {
			this._subscribers[listenerGUID] = {
				symbolInfo : symbolInfo,
				resolution : resolution,
				listeners : ''
			};
		};
		this._subscribers[listenerGUID].listeners = onRealtimeCallback;
		// console.log('最新数据》发送：'+listenerGUID);
		if(tvSetting.isWsStop){
			// console.log('切换为ajax');
			wdajax.post(listenerGUID);
		}
		else {
			wdws.send(listenerGUID);
		}
	}
};


// TradingView weboskcet
function WdWebsocket() {
	this.ws = null;
	this.update = null;
	this.listenerGUID = '';
	this.duration = 10000;
	this.symbolInfo = jsApiSymbolInfo;
	this.repeatSendTime = null;
	this.init();
}
WdWebsocket.prototype.send = function(listenerGUID) {
	if (this.ws.readyState === window.WebSocket.OPEN) {
		this.listenerGUID = listenerGUID;
		if (this.symbolInfo && this.symbolInfo.ticker) {
			// console.log('最新数据》成功发送');
			this.ws.send(tvSetting.coinid +"," + tvChangeTime.second(wdUpdate._subscribers[this.listenerGUID].resolution)+",0,0,1");
		}
	}
};
WdWebsocket.prototype.init = function() {
	this.create();
};
WdWebsocket.prototype.repeatSend = function() {
	var _this = this;
	clearInterval(_this.repeatSendTime);
	// console.log('清除定时');
	_this.repeatSendTime = setInterval(function(){
		clearTimeout(loopTime);
		loopTime = null;
		clearInterval(_this.repeatSendTime);
		_this.repeatSendTime = null;
		//
		// tvSetting.isWsStop = true;
		// console.log(_this.listenerGUID);
		// wdajax.post(_this.listenerGUID);
		//
		// _this.ws.close();
		// if(wdUpdate._subscribers[_this.listenerGUID]){
		// 	wdajax.post(_this.listenerGUID);
		// }
		//

		if(wdUpdate._subscribers[_this.listenerGUID]){
			var b = wdUpdate._subscribers[_this.listenerGUID].resolution;
			_this.ws.send(tvSetting.coinid +"," + tvChangeTime.second(b)+",0,0,1");
		}
	}, _this.duration);
};
WdWebsocket.prototype.create = function(isSend) {
	var _this = this;
	if ("WebSocket" in window) {
		_this.ws = new WebSocket(tvSetting.wsurl);
		_this.ws.onopen = function() {
			// console.log("最新数据》已连接...");
			if(isSend){
				var b = wdUpdate._subscribers[_this.listenerGUID].resolution;
				_this.ws.send(tvSetting.coinid +"," + tvChangeTime.second(b)+",0,0,1");
			}
		};
		_this.ws.onclose = function() {
			if(wdUpdate._subscribers[_this.listenerGUID]){
				wdajax.post(_this.listenerGUID);
			}
			else {
				_this.create();
			}
		};
		_this.ws.onmessage = function(response) {
			var data = response ? JSON.parse(response.data) : '';
			// console.log(data);
			if(data != '' && JSON.stringify(data) != "{}" && JSON.stringify(data) != "[]"){
				if(wdUpdate._subscribers[_this.listenerGUID]){
					//最后一条数据
					// data = data[data.length - 1];
					// console.log('最新数据已更新');
					wdUpdate._subscribers[_this.listenerGUID].listeners({
						time : data[0],
						open : data[1],
						close : data[4],
						high : data[2],
						low : data[3],
						volume : data[5]
					});
					// 每次接受数据之后，主动再发送请求，达到轮循推送目的
					// 根据 tvSetting.coinid 和 resolution, 通过OR这个字符，直接返回当前币种的最后一条数据给我就好了。
				}
			}
			// if(wdUpdate._subscribers[_this.listenerGUID]){
				clearTimeout(loopTime);
				loopTime = setTimeout(function(){
					var b = wdUpdate._subscribers[_this.listenerGUID].resolution;
					_this.ws.send(tvSetting.coinid +"," + tvChangeTime.second(b)+",0,0,1");
					// console.log('发送请求');
					_this.repeatSend();
				}, timeSpace);
			// }
		}
	} else {
		console.log("您的浏览器不支持 WebSocket!");
	}
};

// TradingView Ajax
function WdAjax() {
	this.listenerGUID = '';
	this.symbolInfo = jsApiSymbolInfo;
}
WdAjax.prototype.post = function(listenerGUID){
	var _this = this;
	// console.log(listenerGUID);
	_this.listenerGUID = listenerGUID;
	if (this.symbolInfo && this.symbolInfo.ticker) {
		$.ajax({
			type: 'POST',
			url: tvSetting.ajaxurl,
			data: {
				message: tvSetting.coinid + "," + tvChangeTime.second(wdUpdate._subscribers[_this.listenerGUID].resolution) + ",0,0,1"
			},
			success: function (evt) {
				var data = evt;
				// console.log('ajax'+data);
				if (data != '' && JSON.stringify(data) != "{}" && JSON.stringify(data) != '[]') {
					wdUpdate._subscribers[_this.listenerGUID].listeners({
						time: data[0],
						open: data[1],
						close: data[4],
						high: data[2],
						low: data[3],
						volume: data[5]
					});
				}
				// console.log('ajax循环数据更新');
				clearTimeout(loopTime);
				loopTime = setTimeout(function () {
					_this.post(_this.listenerGUID);
				}, timeSpace);
			},
			error: function(){
				// console.log('ajax循环数据更新失败');
				clearTimeout(loopTime);
				loopTime = setTimeout(function () {
					_this.post(_this.listenerGUID);
				}, timeSpace);
			},
			dataType: 'json'
		});
	}
};
WdAjax.prototype.post2 = function(data, callback){
};


// 默认widget配置
var widgetDefaultOption = {
	//初始商品
	// debug: true, // uncomment this line to see Library errors and warnings in the console
	symbol : tvSetting.coinname,
	interval : tvSetting.interval,
	container_id : "tv_chart_container",
	datafeed : new DataRenderApi(),
	custom_css_url: tvSetting.theme,
	library_path : "charting_library/",
	locale : tvGetParameterByName('lang') || "zh",
	timezone : "Asia/Shanghai",
	fullscreen : true,
	autosize : true,
	charts_storage_url : location.host,
	charts_storage_api_version : "1.1",
	source_selection_markers: 'off',
	use_localstorage_for_settings: 'off',
	side_toolbar_in_fullscreen_mode: 'on',
	toolbar_bg : tvSetting.toolbar_bg,
	user_id : 'public_user_id',
	time_frames: tvTimeFrames,

	// 禁用项
	disabled_features : [
		// "left_toolbar",
		"border_around_the_chart",
		"volume_force_overlay",
		"header_symbol_search",
		"symbol_search_hot_key",
		"header_compare",
		"header_undo_redo",
		"header_chart_type",
		// "timeframes_toolbar",
		"go_to_date",
		"header_saveload",
		"header_resolutions",
		// "header_indicators",
		// "header_settings",
		"context_menus.legend_context_menu",
		// "edit_buttons_in_legend",
		"context_menus",
		"dont_show_boolean_study_arguments",
		"hide_last_na_study_output",
	],
	// 使用项
	enabled_features : [
		"move_logo_to_main_pane",
		"same_data_requery",
		"side_toolbar_in_fullscreen_mode"
	],
	// 时间显示格式
	customFormatters: {
		timeFormatter: {
			format: function (date) {
				var _format_str = '%h:%m';
				return _format_str.replace('%h', date.getUTCHours()).replace('%m', date.getUTCMinutes()).replace('%s', date.getUTCSeconds());
			}
		},
		dateFormatter: {
			format: function (date) {
				return date.getUTCFullYear() + '/' + (date.getUTCMonth() + 1) + '/' + (date.getUTCDate());
			}
		}
	},
	overrides : tvSetting.overrides,
	studies_overrides : tvSetting.studies_overrides
};

var period = function(widget){
	var btns = {};
	var tvResolution = tvWidget.chart().resolution();

	var changeCss = function(resolution){
		for(var i in btns){
			btns[i].removeAttr('style');
			btns[i].find('path').removeAttr('style');
		}
		btns['r'+resolution].css(tvSetting.cssBtn).find('path').css(tvSetting.cssBtnPath);
	};
	var createBtn = function(info){
		return widget.createButton()
				.attr('resolution', info.resolution)
				.addClass("mydate")
				.text(info.title)
				.on('click', function () {
					var resolution = $(this).attr('resolution');
					widget.chart().setResolution(resolution, function onReadyCallback(){});
				});
	};

	widget.createButton()
			.addClass("mydate")
			.text(getCustomLang('dates'))
			.css({'padding-right': '0'});

	for(var i=0; i<tvTimeFrames.length; i++){
		var resolution = tvTimeFrames[i].resolution;
		var title = tvTimeFrames[i].title;
		var btnName = 'r'+ resolution;
		btns[btnName] = createBtn({
			resolution: resolution,
			title: title
		});
	}
	changeCss(tvResolution);
	widget.chart().onIntervalChanged().subscribe(null, function(interval, obj) {
		changeCss(interval);
		var a = interval;
		var b = tvChangeTime.getTimeFrame(a);
		if(b){
			obj.timeframe = b;
		}
	});
};
// 各项指标
var indicators = function(widget){
	var studiesOption = {
		isMacd : false,
		isKdj : false,
		isVolume : tvSetting.tvSideBar
	};
	// 均线
	var addMa = function(){
		widget.chart().createStudy("Moving Average", false, false, [20], null, {"plot.color": "#60407f"});
		widget.chart().createStudy("Moving Average", false, false, [15], null, {"plot.color": "#397d51"});
		widget.chart().createStudy("Moving Average", false, false, [10], null, {"plot.color": "#5c7798"});
		widget.chart().createStudy("Moving Average", false, false, [5], null, {"plot.color": "#821f68"});
	};
	// MACD
	var addMacd = function(){
		widget.chart().createStudy('MACD', false, false, [14, 30, "close", 9])
	};
	// KDJ
	var addKdj = function(){
		widget.chart().createStudy('Stochastic', false, false, [10], null, {"%d.color" : "#FF0000"});
	};
	// Volume
	var addVolume = function(){
		widget.chart().createStudy('Volume', false, false);
	};


	// 添加指标
	addMa();
	var showStudies = function(){
		widget.chart().removeAllStudies();
		addMa();
		if(studiesOption.isVolume){
			addVolume();
		}
		if(studiesOption.isMacd){
			addMacd();
		}
		if(studiesOption.isKdj){
			addKdj();
		}
	};

	// 指标各项按钮
	widget.createButton()
			.addClass("mydate")
			.text(getCustomLang('zhibiao'))
			.css({'padding-right': '0', 'border-left': '1px solid rgba(255,255,255,0.1)'});
	widget.createButton()
			.addClass("mydate")
			.text('KDJ')
			.on('click', function () {
				if(studiesOption.isKdj){
					$(this).removeAttr('style');
				}
				else {
					$(this).css(tvSetting.cssBtn);
				}
				studiesOption.isKdj = !studiesOption.isKdj;
				showStudies();
			});
	widget.createButton()
			.addClass("mydate")
			.text('MACD')
			.on('click', function () {
				if(studiesOption.isMacd){
					$(this).removeAttr('style');
				}
				else {
					$(this).css(tvSetting.cssBtn);
				}
				studiesOption.isMacd = !studiesOption.isMacd;
				showStudies();
			});
}





// 初始化Tradingview
TradingView.onready(function() {
	var widget = window.tvWidget = new TradingView.widget(widgetDefaultOption);
	widget.onChartReady(function() {
		// 自定义的加载动画
		$('.coin-chart > .chart-bg').hide();

		// 动态加载配置
		tvWidget.applyOverrides(tvSetting.overrides);

		// 左边栏目初始化收缩
		if(!tvSetting.tvSideBar){
			widget.chart().executeActionById("undo");
			widget.chart().executeActionById("drawingToolbarAction");
		}

		// 自定义分辨率按钮
		period(widget);

		//指标
		indicators(widget);
	});
});
// 自定义加载动画
setTimeout(function(){
	$('.coin-chart > .chart-bg').hide();
}, 6000);



// Tradingview JSAPI
function DataRenderApi() {
	this.configuration = jsApiConfiguration;
	this.symbolInfo = jsApiSymbolInfo;
}
DataRenderApi.prototype.getMarks = function(symbolInfo, startDate, endDate, onDataCallback, resolution){
	// console.log(symbolInfo, startDate, endDate, onDataCallback, resolution);
};
DataRenderApi.prototype.onReady = function(callback) {
	var _this = this;

	if (this.configuration) {
		setTimeout(function() {
			callback(_this.configuration);
		}, 0);
	} else {
		this.on('configuration_ready', function() {
			callback(_this.configuration);
		});
	}
};


DataRenderApi.prototype.getBars = function(symbolInfo, resolution, rangeStartDate, rangeEndDate, onDataCallback, onErrorCallback, firstGet) {
	if (rangeStartDate > 0 && (rangeStartDate + '').length > 10) {
		throw new Error([ 'Got a JS time instead of Unix one.', rangeStartDate, rangeEndDate ]);
	}
	if(!wdajax) {
		wdajax = new WdAjax();
	}
    if (!wdws) {
        wdws = new WdWebsocket();
    }

    $.ajax({
        type: 'POST',
        url: tvSetting.ajaxurl,
        data: {
            message : tvSetting.coinid +"," + tvChangeTime.second(resolution) +","+ rangeStartDate +","+ rangeEndDate +",0"
        },
        success: function (evt) {
            var data = evt;
            // console.log("ajax"+data);
            var bars = [];
            var nodata = !data.length;
            for (var i = 0; i < data.length; i++) {
                if(data[i][0] <= new Date().getTime()){
                    bars.push({
                        time : data[i][0],
                        open : data[i][1],
                        close : data[i][4],
                        high : data[i][2],
                        low : data[i][3],
                        volume : data[i][5]
                    });
                }
            }

            if(oldResolution == resolution && bars.length <= 1){
                onDataCallback([], {
                    noData : true
                });
            }
            else {
                onDataCallback(bars, {
                    noData : nodata
                });
            }
        },
        dataType: 'json'
    });


    // 暂时不能跨域，使用ws
    /*if ("WebSocket" in window) {
        var wsFirst = window.wsFirst = new WebSocket(tvSetting.wsurl);
        wsFirst.onopen = function() {
            wsFirst.send(tvSetting.coinid +"," + tvChangeTime.second(resolution)+"," +rangeStartDate+"," +rangeEndDate+",0");
        };
        wsFirst.onmessage = function(evt) {
            var data = JSON.parse(evt.data);
            var bars = [];
            var nodata = !data.length;
            for (var i = 0; i < data.length; i++) {
                if(data[i][0] <= new Date().getTime()){
                    bars.push({
                        time : data[i][0],
                        open : data[i][1],
                        close : data[i][4],
                        high : data[i][2],
                        low : data[i][3],
                        volume : data[i][5]
                    });
                }
            }

            if(oldResolution == resolution && bars.length <= 1){
                // oldData = bars[0].time;
                onDataCallback([], {
                    noData : true
                });
            }
            else {
                // oldData = bars[0].time;
                onDataCallback(bars, {
                    noData : nodata
                });
            }
            isSuccess = true;
            wsFirst.close();
        };
        wsFirst.onclose = function() {
            console.log("ws历史记录链接已关闭...");
        };
    }*/
};
DataRenderApi.prototype.resolveSymbol = function(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
	var _this = this;
	setTimeout(function() {
		onSymbolResolvedCallback(_this.symbolInfo);
	}, 0);
};

DataRenderApi.prototype.unsubscribeBars = function(listenerGUID) {
	// console.log('取消订阅'+listenerGUID);
	// console.log('-------------');
	if(tvSetting.isWsStop){
		ajaxLoop = null;
		clearTimeout(ajaxLoopTime);
	}
	else {
		clearTimeout(loopTime);
		if (window.wsFirst) {
			try {
				window.wsFirst.close();
			} catch(e) {}
		}
	}
	wdUpdate._unsubscribeDataListener(listenerGUID);
};
DataRenderApi.prototype.subscribeBars = function(symbolInfo, resolution, onRealtimeCallback, listenerGUID, onResetCacheNeededCallback) {
	// console.log('订阅'+listenerGUID);
	oldResolution = resolution;
	wdUpdate._subscribeDataListener(symbolInfo, resolution, onRealtimeCallback, listenerGUID);
};