from __future__ import annotations

from pydantic import BaseModel


class Contributor(BaseModel):
    key: str
    label_ja: str
    value: int | None


class ActivityMetric(BaseModel):
    key: str
    label_ja: str
    value_raw: float | int | None
    value_display: str | None


class DailyReadiness(BaseModel):
    date: str
    timestamp: str | None
    score: int | None
    score_label: str | None
    temperature_deviation: float | None
    temperature_trend_deviation: float | None
    contributors: list[Contributor]


class DailyActivity(BaseModel):
    date: str
    timestamp: str | None
    score: int | None
    score_label: str | None
    metrics: list[ActivityMetric]
    contributors: list[Contributor]
