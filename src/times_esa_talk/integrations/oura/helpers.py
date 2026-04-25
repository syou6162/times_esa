from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Final

JST: Final = timezone(timedelta(hours=9))

CONTRIBUTOR_LABELS_READINESS: Final[dict[str, str]] = {
    "previous_night": "睡眠(previous_night)",
    "sleep_balance": "睡眠バランス(sleep_balance)",
    "previous_day_activity": "前日のアクティビティ(previous_day_activity)",
    "activity_balance": "アクティビティバランス(activity_balance)",
    "resting_heart_rate": "安静時心拍数(resting_heart_rate)",
    "hrv_balance": "心拍変動バランス(hrv_balance)",
    "body_temperature": "体表温(body_temperature)",
    "recovery_index": "回復指数(recovery_index)",
    "sleep_regularity": "睡眠の規則性(sleep_regularity)",
}

CONTRIBUTOR_LABELS_ACTIVITY: Final[dict[str, str]] = {
    "meet_daily_targets": "目標達成度(meet_daily_targets)",
    "move_every_hour": "毎時間移動(move_every_hour)",
    "recovery_time": "回復時間(recovery_time)",
    "stay_active": "アクティブ維持(stay_active)",
    "training_frequency": "運動頻度(training_frequency)",
    "training_volume": "運動量(training_volume)",
}

ACTIVITY_METRIC_LABELS: Final[dict[str, str]] = {
    "steps": "歩数(steps)",
    "active_calories": "アクティブカロリー(active_calories)",
    "total_calories": "総カロリー(total_calories)",
    "equivalent_walking_distance": "歩行相当距離(equivalent_walking_distance)",
    "high_activity_time": "高強度時間(high_activity_time)",
    "medium_activity_time": "中強度時間(medium_activity_time)",
    "low_activity_time": "低強度時間(low_activity_time)",
    "sedentary_time": "座位時間(sedentary_time)",
    "resting_time": "休息時間(resting_time)",
    "non_wear_time": "非装着時間(non_wear_time)",
    "high_activity_met_minutes": "高強度MET分(high_activity_met_minutes)",
    "medium_activity_met_minutes": "中強度MET分(medium_activity_met_minutes)",
    "low_activity_met_minutes": "低強度MET分(low_activity_met_minutes)",
    "sedentary_met_minutes": "座位MET分(sedentary_met_minutes)",
    "average_met_minutes": "平均MET(average_met_minutes)",
    "inactivity_alerts": "非活動アラート(inactivity_alerts)",
    "target_calories": "目標カロリー(target_calories)",
    "target_meters": "目標距離(target_meters)",
    "meters_to_target": "目標残り(meters_to_target)",
}


def score_to_readiness_label(score: int | None) -> str | None:
    if score is None:
        return None
    if score >= 85:
        return "Optimal"
    if score >= 70:
        return "Good"
    return "Pay Attention"


def score_to_activity_label(score: int | None) -> str | None:
    if score is None:
        return None
    if score >= 85:
        return "Optimal"
    if score >= 70:
        return "Good"
    return "Below Average"


def format_seconds_to_hm(seconds: int | None) -> str | None:
    if seconds is None:
        return None
    minutes_total = seconds // 60
    hours, minutes = divmod(minutes_total, 60)
    if hours == 0:
        return f"{minutes}分"
    return f"{hours}時間{minutes}分"


def format_meters_to_km(meters: float | int | None) -> str | None:
    if meters is None:
        return None
    return f"{float(meters) / 1000:.1f} km"


def format_kcal(kcal: float | int | None) -> str | None:
    if kcal is None:
        return None
    return f"{int(kcal)} kcal"


def format_int_count(value: int | None, suffix: str) -> str | None:
    if value is None:
        return None
    return f"{value}{suffix}"


def format_jst_timestamp(iso_str: str | None) -> str | None:
    if iso_str is None:
        return None
    iso_normalized = iso_str.replace("Z", "+00:00")
    parsed = datetime.fromisoformat(iso_normalized)
    return parsed.astimezone(JST).strftime("%Y-%m-%d %H:%M JST")
