"""
Understat scraper — fetches real xG data for La Liga 2026/27.
Understat embeds data as JSON strings inside <script> tags.
No API key needed — completely free and public.
"""

import json
import re
from functools import lru_cache

import requests

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
}

CURRENT_SEASON = "2026"
LEAGUE = "La_liga"


def _parse_embedded_json(html: str, var_name: str):
    pattern = rf"var\s+{var_name}\s*=\s*JSON\.parse\('(.*?)'\);"
    match = re.search(pattern, html, re.DOTALL)
    if not match:
        raise ValueError(f"Could not find variable '{var_name}' in page HTML")
    raw = match.group(1).encode("utf-8").decode("unicode_escape")
    return json.loads(raw)


def fetch_league_page(season: str = CURRENT_SEASON) -> str:
    url = f"https://understat.com/league/{LEAGUE}/{season}"
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    return resp.text


@lru_cache(maxsize=4)
def get_team_xg_stats(season: str = CURRENT_SEASON) -> dict:
    """
    Per-team rolling xG/xGA averages for the season.
    Shape: { 'Real Madrid': { 'xg_90': 2.1, 'xga_90': 0.8, 'history': [...] } }
    """
    html = fetch_league_page(season)
    teams_raw = _parse_embedded_json(html, "teamsData")

    stats = {}
    for _team_id, info in teams_raw.items():
        name = info["title"]
        history = info.get("history", [])
        if not history:
            stats[name] = {"xg_90": 1.2, "xga_90": 1.2, "history": []}
            continue

        # Last 6 matches weighted average (more recent = more weight)
        recent = history[-6:]
        weights = list(range(1, len(recent) + 1))
        total_w = sum(weights)

        xg_avg = sum(w * float(m["xG"]) for w, m in zip(weights, recent)) / total_w
        xga_avg = sum(w * float(m["xGA"]) for w, m in zip(weights, recent)) / total_w

        stats[name] = {
            "xg_90": round(xg_avg, 3),
            "xga_90": round(xga_avg, 3),
            "history": history,
        }

    return stats


@lru_cache(maxsize=4)
def get_all_matches(season: str = CURRENT_SEASON) -> list:
    """All La Liga matches from datesData, with matchday derived from order."""
    html = fetch_league_page(season)
    return _parse_embedded_json(html, "datesData")


def _assign_matchdays(matches: list) -> list:
    """Group matches chronologically: 10 matches = 1 jornada."""
    sorted_m = sorted(matches, key=lambda x: x.get("datetime", ""))
    for idx, m in enumerate(sorted_m):
        m["_matchday"] = (idx // 10) + 1
    return sorted_m


def get_jornada_matches(matchday: int, season: str = CURRENT_SEASON) -> list:
    all_m = list(get_all_matches(season))  # list() to avoid mutating cached tuple
    grouped = _assign_matchdays(all_m)
    return [m for m in grouped if m["_matchday"] == matchday]


def available_matchdays(season: str = CURRENT_SEASON) -> list:
    all_m = list(get_all_matches(season))
    grouped = _assign_matchdays(all_m)
    return sorted({m["_matchday"] for m in grouped})


def get_team_form(history: list, n: int = 5) -> list:
    results = []
    for m in history[-n:]:
        gf = int(m.get("scored", 0))
        ga = int(m.get("missed", 0))
        if gf > ga:
            results.append("W")
        elif gf < ga:
            results.append("L")
        else:
            results.append("D")
    return results


def clear_cache():
    get_team_xg_stats.cache_clear()
    get_all_matches.cache_clear()
