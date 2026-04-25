from __future__ import annotations

from datetime import date as dt_date
from datetime import timedelta
from typing import TYPE_CHECKING, Any, Final

import aiohttp

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
from times_esa_talk.integrations.oura.types import (
    ActivityMetric,
    Contributor,
    DailyActivity,
    DailyReadiness,
)

OURA_API_BASE_URL: Final[str] = "https://api.ouraring.com/v2/usercollection"

if TYPE_CHECKING:
    from times_esa_talk.integrations.oura.token_store import OuraTokenStore


class OuraClient:
    def __init__(self, token_store: OuraTokenStore) -> None:
        self._token_store = token_store

    async def fetch_daily_readiness(self, date: str) -> DailyReadiness | None:
        item = await self._fetch_range("daily_readiness", date)
        if not item:
            return None

        contributors = self._build_contributors(
            item.get("contributors", {}), CONTRIBUTOR_LABELS_READINESS
        )
        score = item.get("score")
        return DailyReadiness(
            date=date,
            timestamp=format_jst_timestamp(item.get("timestamp")),
            score=score,
            score_label=score_to_readiness_label(score),
            temperature_deviation=item.get("temperature_deviation"),
            temperature_trend_deviation=item.get("temperature_trend_deviation"),
            contributors=contributors,
        )

    async def fetch_daily_activity(self, date: str) -> DailyActivity | None:
        item = await self._fetch_range("daily_activity", date)
        if not item:
            return None

        contributors = self._build_contributors(
            item.get("contributors", {}), CONTRIBUTOR_LABELS_ACTIVITY
        )
        metrics = self._build_activity_metrics(item)
        score = item.get("score")
        return DailyActivity(
            date=date,
            timestamp=format_jst_timestamp(item.get("timestamp")),
            score=score,
            score_label=score_to_activity_label(score),
            metrics=metrics,
            contributors=contributors,
        )

    async def _fetch_range(self, endpoint: str, date: str) -> dict[str, Any]:
        target_day = dt_date.fromisoformat(date)
        params = {
            "start_date": (target_day - timedelta(days=1)).isoformat(),
            "end_date": (target_day + timedelta(days=1)).isoformat(),
        }

        access_token = await self._token_store.get_access_token()
        headers = {"Authorization": f"Bearer {access_token}"}

        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{OURA_API_BASE_URL}/{endpoint}",
                params=params,
                headers=headers,
            ) as response:
                response.raise_for_status()
                payload: dict[str, Any] = await response.json()

        for item in payload.get("data", []):
            if item.get("day") == date:
                return item
        return {}

    @staticmethod
    def _build_contributors(
        raw_contributors: dict[str, int | None],
        labels: dict[str, str],
    ) -> list[Contributor]:
        contributors: list[Contributor] = []
        for key, label in labels.items():
            value = raw_contributors.get(key)
            if value is None:
                continue
            contributors.append(Contributor(key=key, label_ja=label, value=value))
        return contributors

    @staticmethod
    def _build_activity_metrics(item: dict[str, Any]) -> list[ActivityMetric]:
        metrics: list[ActivityMetric] = []
        for key, label in ACTIVITY_METRIC_LABELS.items():
            value_raw = item.get(key)
            if value_raw is None:
                continue
            metrics.append(
                ActivityMetric(
                    key=key,
                    label_ja=label,
                    value_raw=value_raw,
                    value_display=OuraClient._format_activity_metric(key, value_raw),
                )
            )
        return metrics

    @staticmethod
    def _format_activity_metric(key: str, value: float | int) -> str | None:
        if key in {
            "high_activity_time",
            "medium_activity_time",
            "low_activity_time",
            "sedentary_time",
            "resting_time",
            "non_wear_time",
        }:
            return format_seconds_to_hm(int(value))

        if key in {"equivalent_walking_distance", "target_meters", "meters_to_target"}:
            return format_meters_to_km(value)

        if key in {"active_calories", "total_calories", "target_calories"}:
            return format_kcal(value)

        if key == "steps":
            return format_int_count(int(value), "歩")

        if key == "inactivity_alerts":
            return format_int_count(int(value), "回")

        if key in {
            "high_activity_met_minutes",
            "medium_activity_met_minutes",
            "low_activity_met_minutes",
            "sedentary_met_minutes",
        }:
            return str(int(value))

        if key == "average_met_minutes":
            return str(value)

        return str(value)
