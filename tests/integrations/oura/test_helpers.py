from __future__ import annotations

from times_esa_talk.integrations.oura.helpers import (
    ACTIVITY_METRIC_LABELS,
    CONTRIBUTOR_LABELS_ACTIVITY,
    CONTRIBUTOR_LABELS_READINESS,
    format_int_count,
    format_jst_timestamp,
    format_kcal,
    format_meters_to_km,
    format_seconds_to_hm,
    score_to_activity_label,
    score_to_readiness_label,
)


def test_score_to_readiness_label() -> None:
    assert score_to_readiness_label(85) == "Optimal"
    assert score_to_readiness_label(100) == "Optimal"
    assert score_to_readiness_label(70) == "Good"
    assert score_to_readiness_label(84) == "Good"
    assert score_to_readiness_label(0) == "Pay Attention"
    assert score_to_readiness_label(69) == "Pay Attention"
    assert score_to_readiness_label(None) is None


def test_score_to_activity_label() -> None:
    assert score_to_activity_label(69) == "Below Average"


def test_format_seconds_to_hm() -> None:
    assert format_seconds_to_hm(0) == "0分"
    assert format_seconds_to_hm(1800) == "30分"
    assert format_seconds_to_hm(3600) == "1時間0分"
    assert format_seconds_to_hm(9000) == "2時間30分"
    assert format_seconds_to_hm(None) is None


def test_format_meters_to_km() -> None:
    assert format_meters_to_km(13200) == "13.2 km"
    assert format_meters_to_km(-3000) == "-3.0 km"
    assert format_meters_to_km(0) == "0.0 km"
    assert format_meters_to_km(None) is None


def test_format_kcal() -> None:
    assert format_kcal(520) == "520 kcal"
    assert format_kcal(None) is None


def test_format_int_count() -> None:
    assert format_int_count(12430, "歩") == "12430歩"
    assert format_int_count(None, "歩") is None


def test_format_jst_timestamp() -> None:
    assert format_jst_timestamp("2026-04-20T06:00:00+09:00") == "2026-04-20 06:00 JST"
    assert format_jst_timestamp("2026-04-20T00:00:00Z") == "2026-04-20 09:00 JST"
    assert format_jst_timestamp(None) is None


def test_contributor_labels_readiness_completeness() -> None:
    expected_keys = {
        "previous_night",
        "sleep_balance",
        "previous_day_activity",
        "activity_balance",
        "resting_heart_rate",
        "hrv_balance",
        "body_temperature",
        "recovery_index",
        "sleep_regularity",
    }
    assert set(CONTRIBUTOR_LABELS_READINESS.keys()) == expected_keys


def test_contributor_labels_activity_completeness() -> None:
    expected_keys = {
        "meet_daily_targets",
        "move_every_hour",
        "recovery_time",
        "stay_active",
        "training_frequency",
        "training_volume",
    }
    assert set(CONTRIBUTOR_LABELS_ACTIVITY.keys()) == expected_keys


def test_activity_metric_labels_completeness() -> None:
    expected_keys = {
        "steps",
        "active_calories",
        "total_calories",
        "equivalent_walking_distance",
        "high_activity_time",
        "medium_activity_time",
        "low_activity_time",
        "sedentary_time",
        "resting_time",
        "non_wear_time",
        "high_activity_met_minutes",
        "medium_activity_met_minutes",
        "low_activity_met_minutes",
        "sedentary_met_minutes",
        "average_met_minutes",
        "inactivity_alerts",
        "target_calories",
        "target_meters",
        "meters_to_target",
    }
    assert set(ACTIVITY_METRIC_LABELS.keys()) == expected_keys
