var tvOption = {
	coinid : 5,
	coinname : 'HPY_BTC',
	wsurl : 'wss://www.coinw.me/myecho/kline',
	ajaxurl : 'https://www.coinw.me/kline/klineJson.html?random=' + Math.round(Math.random() * 100),
	interval : '15',
	isWsStop : false,
	theme : 'day.css',
	toolbar_bg : '#fff',
	tvSideBar : false,
	cssBtn : {
		"background-color": "#424578",
		"color": "#fff",
	},
	cssBtnPath : {
		"fill": "#fff",
	},
	studies_overrides : {
		"volume.volume.color.0": "#32AD5D",
		"volume.volume.color.1": "#EF5030"
	},
	overrides : {
		"paneProperties.legendProperties.showLegend": false,
		"paneProperties.legendProperties.showStudyArguments": true,
		"paneProperties.legendProperties.showStudyTitles": true,
		"paneProperties.legendProperties.showStudyValues": true,
		"paneProperties.legendProperties.showSeriesTitle": true,
		"paneProperties.legendProperties.showSeriesOHLC": true,

		"paneProperties.background" : "#fff", // 背景色
		"paneProperties.vertGridProperties.color" : "#fff", // 水平线颜色
		"paneProperties.horzGridProperties.color" : "#fff", // 竖线颜色
		"symbolWatermarkProperties.transparency" : 0,

		"mainSeriesProperties.candleStyle.upColor" : '#EE5030', // 蜡烛图 涨色
		"mainSeriesProperties.candleStyle.downColor" : '#32AD5D', // 蜡烛图 跌色
		"mainSeriesProperties.candleStyle.borderColor" : true, // 蜡烛图 边框色
		"mainSeriesProperties.candleStyle.borderUpColor" : '#EE5030', // 蜡烛图涨边框色
		"mainSeriesProperties.candleStyle.borderDownColor" : '#32AD5D', // 蜡烛图跌边框色

		"mainSeriesProperties.candleStyle.wickUpColor" : '#a9cdd3',  // 蜡烛图上阴影
		"mainSeriesProperties.candleStyle.wickDownColor" : '#f5a6ae',  // 蜡烛图下阴影

		"scalesProperties.lineColor": "rgba(0,0,0,0)",
		"scalesProperties.textColor": "#999",

		// 隐藏图例
		// "paneProperties.legendProperties.showLegend": false,
		// "scalesProperties.showLeftScale":false,
		//成交量高度
		"volumePaneSize": "tiny",
		// "MACDPaneSize":"tiny"
	}
};