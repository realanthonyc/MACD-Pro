// This Pine Script® code is subject to the terms of the Mozilla Public License 2.0 at https://mozilla.org/MPL/2.0/
// © Anthony C. https://x.com/anthonycxc

//@version=6
// ------------------------------------------------------------
//  MACD Pro
//  v1.1.2 beta
// ------------------------------------------------------------
indicator(title="MACD Pro", shorttitle="MACD Pro", timeframe="", timeframe_gaps=true)

// Input for MACD Setup
macd_mode = input.string(title="MACD Mode", defval="Adaptive", options=["Fixed", "Adaptive"], group="MACD Mode", display=display.data_window)

// Fixed Inputs
fast_length_fixed = input.int(title="Fast Length", defval=12, minval=1, group="Fixed")
slow_length_fixed = input.int(title="Slow Length", defval=26, minval=1, group="Fixed")
signal_length_fixed = input.int(title="Signal Smoothing", defval=9, minval=1, maxval=50, group="Fixed", display=display.data_window)

// Adaptive Inputs: 3m or below
fast_length_3m = input.int(title="Fast Length", defval=5, minval=1, group="Adaptive - 3m or below")
slow_length_3m = input.int(title="Slow Length", defval=20, minval=1, group="Adaptive - 3m or below")
signal_length_3m = input.int(title="Signal Smoothing", defval=5, minval=1, maxval=50, group="Adaptive - 3m or below", display=display.data_window)

// Adaptive Inputs: 5m to 45m
fast_length_5m_45m = input.int(title="Fast Length", defval=5, minval=1, group="Adaptive - 5m to 45m")
slow_length_5m_45m = input.int(title="Slow Length", defval=35, minval=1, group="Adaptive - 5m to 45m")
signal_length_5m_45m = input.int(title="Signal Smoothing", defval=5, minval=1, maxval=50, group="Adaptive - 5m to 45m", display=display.data_window)

// Adaptive Inputs: 1h to 2h
fast_length_1h_2h = input.int(title="Fast Length", defval=8, minval=1, group="Adaptive - 1h to 2h")
slow_length_1h_2h = input.int(title="Slow Length", defval=40, minval=1, group="Adaptive - 1h to 2h")
signal_length_1h_2h = input.int(title="Signal Smoothing", defval=9, minval=1, maxval=50, group="Adaptive - 1h to 2h", display=display.data_window)

// Adaptive Inputs: 3h to 4h
fast_length_3h_4h = input.int(title="Fast Length", defval=12, minval=1, group="Adaptive - 3h to 4h")
slow_length_3h_4h = input.int(title="Slow Length", defval=50, minval=1, group="Adaptive - 3h to 4h")
signal_length_3h_4h = input.int(title="Signal Smoothing", defval=9, minval=1, maxval=50, group="Adaptive - 3h to 4h", display=display.data_window)

// Adaptive Inputs: 1d or above
fast_length_1d = input.int(title="Fast Length", defval=12, minval=1, group="Adaptive - 1d or above")
slow_length_1d = input.int(title="Slow Length", defval=26, minval=1, group="Adaptive - 1d or above")
signal_length_1d = input.int(title="Signal Smoothing", defval=9, minval=1, maxval=50, group="Adaptive - 1d or above", display=display.data_window)

// Other Inputs
src = input(title="Source", defval=close, group="Other Settings")
sma_source = input.string(title="Oscillator MA Type", defval="EMA", options=["SMA", "EMA"], group="Other Settings", display=display.data_window)
sma_signal = input.string(title="Signal Line MA Type", defval="EMA", options=["SMA", "EMA"], group="Other Settings", display=display.data_window)

// Determine timeframe in seconds for robust handling
int tf_seconds = timeframe.in_seconds()
string tf_value = na
if na(tf_seconds)
    tf_value := "1d"  // Default for non-time-based timeframes like ticks or ranges
else if tf_seconds <= 180  // 3 minutes or below (including seconds)
    tf_value := "3m"
else if tf_seconds <= 2700  // 45 minutes or below
    tf_value := "5m_45m"
else if tf_seconds <= 7200  // 2 hours or below
    tf_value := "1h_2h"
else if tf_seconds <= 14400  // 4 hours or below
    tf_value := "3h_4h"
else
    tf_value := "1d"

// Select parameters based on MACD Setup
var int fast_length = 0
var int slow_length = 0
var int signal_length = 0

if macd_mode == "Fixed"
    fast_length := fast_length_fixed
    slow_length := slow_length_fixed
    signal_length := signal_length_fixed
else
    switch tf_value
        "3m" =>
            fast_length := fast_length_3m
            slow_length := slow_length_3m
            signal_length := signal_length_3m
        "5m_45m" =>
            fast_length := fast_length_5m_45m
            slow_length := slow_length_5m_45m
            signal_length := signal_length_5m_45m
        "1h_2h" =>
            fast_length := fast_length_1h_2h
            slow_length := slow_length_1h_2h
            signal_length := signal_length_1h_2h
        "3h_4h" =>
            fast_length := fast_length_3h_4h
            slow_length := slow_length_3h_4h
            signal_length := signal_length_3h_4h
        "1d" =>
            fast_length := fast_length_1d
            slow_length := slow_length_1d
            signal_length := signal_length_1d

// Calculating
fast_ma = sma_source == "SMA" ? ta.sma(src, fast_length) : ta.ema(src, fast_length)
slow_ma = sma_source == "SMA" ? ta.sma(src, slow_length) : ta.ema(src, slow_length)
macd = fast_ma - slow_ma
signal = sma_signal == "SMA" ? ta.sma(macd, signal_length) : ta.ema(macd, signal_length)
hist = macd - signal

// Alerts
alertcondition(hist[1] >= 0 and hist < 0, title="Rising to falling", message="The MACD histogram switched from a rising to falling state")
alertcondition(hist[1] <= 0 and hist > 0, title="Falling to rising", message="The MACD histogram switched from a falling to rising state")

// Plotting
hline(0, "Zero Line", color=color.new(#787B86, 50))
plot(hist, title="Histogram", style=plot.style_columns, color=(hist >= 0 ? (hist[1] < hist ? #26A69A : #B2DFDB) : (hist[1] < hist ? #FFCDD2 : #FF5252)))
plot(macd, title="MACD", color=#2962FF)
plot(signal, title="Signal", color=#FF6D00)