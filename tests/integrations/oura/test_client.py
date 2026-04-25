from __future__ import annotations

from collections.abc import Callable
from typing import Any
from unittest.mock import AsyncMock

import aiohttp
import pytest

from times_esa_talk.integrations.oura.client import OURA_API_BASE_URL, OuraClient


class DummyResponse:
    def __init__(self, *, payload: dict[str, Any], status: int, request_info: Any = None) -> None:
        self._payload = payload
        self.status = status
        self.request_info = request_info

    async def __aenter__(self) -> DummyResponse:
        return self

    async def __aexit__(self, exc_type: Any, exc: Any, tb: Any) -> None:
        return None

    def raise_for_status(self) -> None:
        if self.status >= 400:
            raise aiohttp.ClientResponseError(
                request_info=self.request_info,
                history=(),
                status=self.status,
                message=f"HTTP {self.status}",
            )

    async def json(self) -> dict[str, Any]:
        return self._payload


class DummySession:
    def __init__(self, handler: Callable[[str, dict[str, str], dict[str, str]], DummyResponse]) -> None:
        self._handler = handler

    async def __aenter__(self) -> DummySession:
        return self

    async def __aexit__(self, exc_type: Any, exc: Any, tb: Any) -> None:
        return None

    def get(self, url: str, *, params: dict[str, str], headers: dict[str, str]) -> DummyResponse:
        return self._handler(url, params, headers)


@pytest.fixture
def token_store() -> AsyncMock:
    mock = AsyncMock()
    mock.get_access_token.return_value = "dummy-token"
    return mock


def patch_client_session(
    monkeypatch: pytest.MonkeyPatch,
    handler: Callable[[str, dict[str, str], dict[str, str]], DummyResponse],
) -> None:
    monkeypatch.setattr(
        "times_esa_talk.integrations.oura.client.aiohttp.ClientSession",
        lambda: DummySession(handler),
    )


@pytest.mark.asyncio
async def test_fetch_daily_readiness_success(token_store: AsyncMock, monkeypatch: pytest.MonkeyPatch) -> None:
    payload = {
        "data": [
            {
                "day": "2026-04-20",
                "score": 82,
                "temperature_deviation": 0.1,
                "temperature_trend_deviation": -0.2,
                "timestamp": "2026-04-20T06:00:00+09:00",
                "contributors": {"previous_night": 70, "sleep_balance": 60},
            }
        ]
    }

    patch_client_session(
        monkeypatch,
        lambda _url, _params, _headers: DummyResponse(payload=payload, status=200),
    )

    client = OuraClient(token_store=token_store)
    result = await client.fetch_daily_readiness("2026-04-20")

    assert result is not None
    assert result.score_label == "Good"


@pytest.mark.asyncio
async def test_fetch_daily_readiness_date_workaround(token_store: AsyncMock, monkeypatch: pytest.MonkeyPatch) -> None:
    calls: list[dict[str, Any]] = []

    def handler(url: str, params: dict[str, str], headers: dict[str, str]) -> DummyResponse:
        calls.append({"url": url, "params": params, "headers": headers})
        return DummyResponse(payload={"data": []}, status=200)

    patch_client_session(monkeypatch, handler)

    client = OuraClient(token_store=token_store)
    await client.fetch_daily_readiness("2026-04-20")

    assert len(calls) == 1
    assert calls[0]["url"] == f"{OURA_API_BASE_URL}/daily_readiness"
    assert calls[0]["params"] == {"start_date": "2026-04-19", "end_date": "2026-04-21"}


@pytest.mark.asyncio
async def test_fetch_daily_readiness_returns_none_when_day_not_found(
    token_store: AsyncMock,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    payload = {"data": [{"day": "2026-04-19"}, {"day": "2026-04-21"}]}
    patch_client_session(
        monkeypatch,
        lambda _url, _params, _headers: DummyResponse(payload=payload, status=200),
    )

    client = OuraClient(token_store=token_store)
    result = await client.fetch_daily_readiness("2026-04-20")

    assert result is None


@pytest.mark.asyncio
async def test_fetch_daily_readiness_picks_matching_entry(
    token_store: AsyncMock,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    payload = {
        "data": [
            {"day": "2026-04-19", "score": 30},
            {
                "day": "2026-04-20",
                "score": 90,
                "timestamp": "2026-04-20T00:00:00Z",
                "contributors": {},
            },
            {"day": "2026-04-21", "score": 40},
        ]
    }
    patch_client_session(
        monkeypatch,
        lambda _url, _params, _headers: DummyResponse(payload=payload, status=200),
    )

    client = OuraClient(token_store=token_store)
    result = await client.fetch_daily_readiness("2026-04-20")

    assert result is not None
    assert result.score == 90


@pytest.mark.asyncio
async def test_fetch_daily_activity_success_and_metric_format(
    token_store: AsyncMock,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    payload = {
        "data": [
            {
                "day": "2026-04-20",
                "score": 87,
                "timestamp": "2026-04-20T00:00:00Z",
                "steps": 12430,
                "active_calories": 520,
                "high_activity_time": 1800,
                "equivalent_walking_distance": 13200,
                "inactivity_alerts": 3,
                "average_met_minutes": 1.5,
                "contributors": {
                    "meet_daily_targets": 80,
                    "move_every_hour": 70,
                },
            }
        ]
    }
    patch_client_session(
        monkeypatch,
        lambda _url, _params, _headers: DummyResponse(payload=payload, status=200),
    )

    client = OuraClient(token_store=token_store)
    result = await client.fetch_daily_activity("2026-04-20")

    assert result is not None
    assert result.score_label == "Optimal"
    display_by_key = {metric.key: metric.value_display for metric in result.metrics}
    assert display_by_key["steps"] == "12430歩"
    assert display_by_key["active_calories"] == "520 kcal"
    assert display_by_key["high_activity_time"] == "30分"
    assert display_by_key["equivalent_walking_distance"] == "13.2 km"
    assert display_by_key["inactivity_alerts"] == "3回"
    assert display_by_key["average_met_minutes"] == "1.5"


@pytest.mark.asyncio
async def test_null_contributors_are_excluded(token_store: AsyncMock, monkeypatch: pytest.MonkeyPatch) -> None:
    payload = {
        "data": [
            {
                "day": "2026-04-20",
                "score": 80,
                "timestamp": "2026-04-20T06:00:00+09:00",
                "contributors": {
                    "previous_night": 70,
                    "sleep_balance": None,
                },
            }
        ]
    }
    patch_client_session(
        monkeypatch,
        lambda _url, _params, _headers: DummyResponse(payload=payload, status=200),
    )

    client = OuraClient(token_store=token_store)
    result = await client.fetch_daily_readiness("2026-04-20")

    assert result is not None
    assert len(result.contributors) == 1
    assert result.contributors[0].key == "previous_night"


@pytest.mark.asyncio
async def test_authorization_header_is_set(token_store: AsyncMock, monkeypatch: pytest.MonkeyPatch) -> None:
    calls: list[dict[str, Any]] = []

    def handler(url: str, params: dict[str, str], headers: dict[str, str]) -> DummyResponse:
        calls.append({"url": url, "params": params, "headers": headers})
        return DummyResponse(payload={"data": []}, status=200)

    patch_client_session(monkeypatch, handler)

    client = OuraClient(token_store=token_store)
    await client.fetch_daily_readiness("2026-04-20")

    assert calls[0]["headers"]["Authorization"] == "Bearer dummy-token"


@pytest.mark.asyncio
async def test_429_raises(token_store: AsyncMock, monkeypatch: pytest.MonkeyPatch) -> None:
    patch_client_session(
        monkeypatch,
        lambda _url, _params, _headers: DummyResponse(payload={}, status=429),
    )

    client = OuraClient(token_store=token_store)

    with pytest.raises(aiohttp.ClientResponseError, match="HTTP 429"):
        await client.fetch_daily_readiness("2026-04-20")


@pytest.mark.asyncio
async def test_500_raises(token_store: AsyncMock, monkeypatch: pytest.MonkeyPatch) -> None:
    patch_client_session(
        monkeypatch,
        lambda _url, _params, _headers: DummyResponse(payload={}, status=500),
    )

    client = OuraClient(token_store=token_store)

    with pytest.raises(aiohttp.ClientResponseError, match="HTTP 500"):
        await client.fetch_daily_activity("2026-04-20")


@pytest.mark.asyncio
async def test_empty_response_returns_none(token_store: AsyncMock, monkeypatch: pytest.MonkeyPatch) -> None:
    patch_client_session(
        monkeypatch,
        lambda _url, _params, _headers: DummyResponse(payload={"data": []}, status=200),
    )

    client = OuraClient(token_store=token_store)
    result = await client.fetch_daily_readiness("2026-04-20")

    assert result is None


@pytest.mark.asyncio
async def test_get_access_token_called_once_per_fetch(
    token_store: AsyncMock,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    patch_client_session(
        monkeypatch,
        lambda _url, _params, _headers: DummyResponse(payload={"data": []}, status=200),
    )

    client = OuraClient(token_store=token_store)
    await client.fetch_daily_readiness("2026-04-20")
    await client.fetch_daily_activity("2026-04-20")

    assert token_store.get_access_token.await_count == 2
