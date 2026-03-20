import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../theme/colors';

interface TradingViewChartProps {
  symbol: string;
  height?: number;
}

export function TradingViewChart({ symbol, height = 300 }: TradingViewChartProps) {
  const baseSymbol = symbol.replace('-PERP', '');
  const tvSymbol = `BINANCE:${baseSymbol}USDT`;

  const html = useMemo(() => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: ${colors.bgCard}; overflow: hidden; }
    #tv_chart { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="tv_chart"></div>
  <script src="https://s3.tradingview.com/tv.js"></script>
  <script>
    new TradingView.widget({
      container_id: "tv_chart",
      symbol: "${tvSymbol}",
      interval: "15",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      toolbar_bg: "${colors.bgCard}",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_side_toolbar: true,
      allow_symbol_change: false,
      save_image: false,
      width: "100%",
      height: "100%",
      backgroundColor: "${colors.bgCard}",
      gridColor: "rgba(255,255,255,0.03)",
      overrides: {
        "paneProperties.background": "${colors.bgCard}",
        "paneProperties.backgroundType": "solid",
        "paneProperties.vertGridProperties.color": "rgba(255,255,255,0.03)",
        "paneProperties.horzGridProperties.color": "rgba(255,255,255,0.03)",
        "scalesProperties.textColor": "${colors.textSecondary}",
        "scalesProperties.lineColor": "${colors.border}",
        "mainSeriesProperties.candleStyle.upColor": "${colors.profit}",
        "mainSeriesProperties.candleStyle.downColor": "${colors.loss}",
        "mainSeriesProperties.candleStyle.wickUpColor": "${colors.profit}",
        "mainSeriesProperties.candleStyle.wickDownColor": "${colors.loss}",
        "mainSeriesProperties.candleStyle.borderUpColor": "${colors.profit}",
        "mainSeriesProperties.candleStyle.borderDownColor": "${colors.loss}",
      }
    });
  </script>
</body>
</html>`, [tvSymbol]);

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        originWhitelist={['*']}
        mixedContentMode="always"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.bgCard,
  },
});
