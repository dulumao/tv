var tvOption = {
	coinid : 5,
	coinname : 'HPY_BTC',
	wsurl : 'wss://www.coinw.me/myecho/kline',
	ajaxurl : 'https://www.coinw.me/kline/klineJson.html?random=' + Math.round(Math.random() * 100),
	interval : '15',
	isWsStop : false,
	theme : 'night.css',
	toolbar_bg : '#212139',
	tvSideBar : true,
	cssBtn : {
		"background-color": "transparent",
		"color": "#FECB31",
	},
	cssBtnPath : {
		"fill": "#FECB31",
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

		"paneProperties.background" : "#1A192B", // 背景色
		"paneProperties.vertGridProperties.color" : "#292943", // 水平线颜色
		"paneProperties.horzGridProperties.color" : "#292943", // 竖线颜色
		"symbolWatermarkProperties.transparency" : 0,

		"mainSeriesProperties.candleStyle.upColor" : '#EF5030', // 蜡烛图 涨色
		"mainSeriesProperties.candleStyle.downColor" : '#32AD5D', // 蜡烛图 跌色
		"mainSeriesProperties.candleStyle.borderColor" : true, // 蜡烛图 边框色
		"mainSeriesProperties.candleStyle.borderUpColor" : '#EF5030', // 蜡烛图涨边框色
		"mainSeriesProperties.candleStyle.borderDownColor" : '#32AD5D', // 蜡烛图跌边框色

		"mainSeriesProperties.candleStyle.wickUpColor" : '#EF5030',  // 蜡烛图上阴影
		"mainSeriesProperties.candleStyle.wickDownColor" : '#32AD5D',  // 蜡烛图下阴影

		"scalesProperties.lineColor": "#292B44",
		"scalesProperties.textColor": "#625F96",

		// 隐藏图例
		// "paneProperties.legendProperties.showLegend": false,
		// "scalesProperties.showLeftScale":false,
		//成交量高度
		// "volumePaneSize": "tiny",
		// "MACDPaneSize":"tiny"
	}
};