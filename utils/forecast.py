import pandas as pd
import numpy as np
from scipy import stats

def linear_forecast(series: pd.Series, years: list[int], horizon: int = 4) -> dict:
    x = np.array(years, dtype=float)
    y = series.values.astype(float)
    mask = ~np.isnan(y)
    x, y = x[mask], y[mask]
    if len(x) < 2:
        return {"points": [], "metadata": {}}
    
    slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
    last_year = int(x[-1])
    forecast_years = list(range(last_year + 1, last_year + 1 + horizon))
    forecast_vals  = [float(slope * yr + intercept) for yr in forecast_years]
    
    n = len(x)
    x_mean = x.mean()
    # Confidence interval calculation
    se_pred = std_err * np.sqrt(1 + 1/n + (np.array(forecast_years, dtype=float) - x_mean)**2 / ((x - x_mean)**2).sum())
    ci95 = (1.96 * se_pred).tolist()
    
    points = [
        {"tahun": int(yr), "nilai": float(v), "nilai_lower": float(v - ci),
         "nilai_upper": float(v + ci), "is_forecast": True}
        for yr, v, ci in zip(forecast_years, forecast_vals, ci95)
    ]
    
    return {
        "points": points,
        "metadata": {
            "r_squared": float(r_value**2),
            "slope": float(slope),
            "n_samples": int(n),
            "last_value": float(y[-1])
        }
    }

def build_forecast_series(tren_df: pd.DataFrame, indicator: str, horizon: int = 4) -> dict:
    sub = (
        tren_df[tren_df["indikator"] == indicator]
        .groupby("tahun")["nilai"].mean()
        .reset_index()
    )
    if len(sub) < 2:
        return {"data": [], "metadata": {}}
    years  = sub["tahun"].tolist()
    series = sub["nilai"]
    hist = [
        {"tahun": int(yr), "nilai": float(v), "is_forecast": False}
        for yr, v in zip(years, series.values)
    ]
    
    forecast_res = linear_forecast(series, years, horizon=horizon)
    return {
        "data": hist + forecast_res["points"],
        "metadata": forecast_res["metadata"]
    }
