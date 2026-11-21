"""
Data fetcher for real 2026/27 La Liga (SP1) & Segunda División (SP2) matches.
Source: football-data.co.uk live season feed (updated weekly).
Includes:
- Official fixtures & dates
- Real final scores (FTHG, FTAG) and signs (FTR -> 1, X, 2)
- Real match xG (HxG, AxG)
- Per-team rolling xG and xGA averages (home and away)
"""

import csv
import io
import logging
import re
import unicodedata
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timedelta
from functools import lru_cache
from typing import Dict, List, Tuple
from urllib.parse import urlencode

import requests

SP1_URL = "https://www.football-data.co.uk/mmz4281/2627/SP1.csv"
SP2_URL = "https://www.football-data.co.uk/mmz4281/2627/SP2.csv"
ESPN_SCOREBOARD_URL = "https://site.api.espn.com/apis/site/v2/sports/soccer/{league}/scoreboard"
log = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}


def _fetch_csv(url: str) -> List[dict]:
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    # Handle BOM or encoding issues
    text = resp.text.lstrip("\ufeff")
    reader = csv.DictReader(io.StringIO(text))
    rows = []
    for r in reader:
        # Standardize fieldnames
        clean = {k.strip().replace("ï»¿", ""): v.strip() for k, v in r.items() if k}
        if clean.get("HomeTeam") and clean.get("AwayTeam"):
            rows.append(clean)
    return rows


@lru_cache(maxsize=1)
def fetch_all_matches_raw() -> Tuple[List[dict], List[dict]]:
    """Returns (sp1_matches, sp2_matches)."""
    sp1 = _fetch_csv(SP1_URL)
    sp2 = _fetch_csv(SP2_URL)
    return sp1, sp2


def _parse_date(date_str: str) -> datetime:
    for fmt in ("%d/%m/%Y", "%d/%m/%y"):
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            pass
    return datetime.min


def _week_start(day: date) -> date:
    return day - timedelta(days=day.weekday())


def _round_window_start(day: date) -> date:
    return day - timedelta(days=(day.weekday() - 4) % 7)


def _normalize_team_name(name: str) -> str:
    normalized = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii").lower()
    normalized = re.sub(r"[^a-z0-9 ]", " ", normalized)
    prefixes = {"cd", "cf", "rc", "rcd", "real", "sd", "ud"}
    normalized = " ".join(part for part in normalized.split() if part not in prefixes)
    aliases = {
        "atletico madrid": "ath madrid",
        "athletic club": "ath bilbao",
        "celta vigo": "celta",
        "racing santander": "santander",
        "racing de santander": "santander",
        "rayo vallecano": "vallecano",
    }
    return aliases.get(normalized, normalized)


def _parse_espn_event(event: dict, is_segunda: bool) -> dict | None:
    competitors = event.get("competitions", [{}])[0].get("competitors", [])
    home = next((team for team in competitors if team.get("homeAway") == "home"), None)
    away = next((team for team in competitors if team.get("homeAway") == "away"), None)
    if not home or not away:
        return None

    start_date = event.get("date", "")[:10]
    try:
        match_date = datetime.strptime(start_date, "%Y-%m-%d").date()
    except ValueError:
        return None

    status = event.get("status", {}).get("type", {})
    completed = status.get("completed", False)
    home_score = int(home["score"]) if completed and str(home.get("score", "")).isdigit() else None
    away_score = int(away["score"]) if completed and str(away.get("score", "")).isdigit() else None
    real_sign = None
    if home_score is not None and away_score is not None:
        real_sign = "1" if home_score > away_score else ("2" if home_score < away_score else "X")

    def team_form(team: dict) -> list[str]:
        form = team.get("form", "")
        return list(form[-5:]) if isinstance(form, str) and form else ["D", "D", "D", "D", "D"]

    return {
        "date": match_date,
        "is_segunda": is_segunda,
        "home": home["team"]["displayName"],
        "away": away["team"]["displayName"],
        "home_team_id": home["team"]["id"],
        "away_team_id": away["team"]["id"],
        "home_logo": home["team"].get("logo", ""),
        "away_logo": away["team"].get("logo", ""),
        "home_score": home_score,
        "away_score": away_score,
        "real_sign": real_sign,
        "home_form": team_form(home),
        "away_form": team_form(away),
    }


def _fetch_scoreboard(league: str, day: date, is_segunda: bool) -> list[dict]:
    url = f"{ESPN_SCOREBOARD_URL.format(league=league)}?{urlencode({'dates': day.strftime('%Y%m%d'), 'limit': 100})}"
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        events = response.json().get("events", [])
        return [
            match
            for event in events
            if (match := _parse_espn_event(event, is_segunda)) is not None
        ]
    except (requests.RequestException, ValueError) as exc:
        log.warning("Could not fetch ESPN %s fixtures for %s: %s", league, day, exc)
        return []


@lru_cache(maxsize=256)
def _fetch_team_matches_before(league: str, team_id: str, before_date: str) -> int | None:
    url = f"{ESPN_SCOREBOARD_URL.format(league=league).rsplit('/scoreboard', 1)[0]}/teams/{team_id}/schedule"
    try:
        response = requests.get(
            url,
            params={"season": 2026},
            headers=HEADERS,
            timeout=10,
        )
        response.raise_for_status()
        events = response.json().get("events", [])
        before = date.fromisoformat(before_date)
        return sum(
            1
            for event in events
            if (event.get("competitions") or [{}])[0].get("status", {}).get("type", {}).get("completed")
            and event.get("date", "")[:10]
            and date.fromisoformat(event["date"][:10]) < before
        )
    except (requests.RequestException, ValueError) as exc:
        log.warning("Could not determine ESPN match count for %s team %s: %s", league, team_id, exc)
        return None


def _upcoming_round_number(league: str, matches: list[dict], week_start: date) -> int | None:
    team_ids = {
        team_id
        for match in matches
        for team_id in (match["home_team_id"], match["away_team_id"])
    }
    with ThreadPoolExecutor(max_workers=8) as executor:
        counts = list(executor.map(
            lambda team_id: _fetch_team_matches_before(league, team_id, week_start.isoformat()),
            team_ids,
        ))
    valid_counts = [count for count in counts if count is not None]
    if not valid_counts:
        log.error("Cannot determine the upcoming %s matchday number; skipping its fixtures", league)
        return None
    return max(valid_counts) + 1


@lru_cache(maxsize=2)
def _fetch_upcoming_fixtures(week_start_iso: str, cache_bucket: str) -> tuple[list[dict], list[dict]]:
    start = date.fromisoformat(week_start_iso)
    days = [start + timedelta(days=offset) for offset in range(14)]
    jobs = [(league, day, is_segunda) for league, is_segunda in (("esp.1", False), ("esp.2", True)) for day in days]
    matches: list[dict] = []
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(_fetch_scoreboard, league, day, is_segunda) for league, day, is_segunda in jobs]
        for future in futures:
            matches.extend(future.result())
    return (
        [match for match in matches if not match["is_segunda"]],
        [match for match in matches if match["is_segunda"]],
    )


def _make_live_jornada(
    number: int,
    p1_matches: list[dict],
    p2_matches: list[dict],
    p1_stats: dict[str, dict],
    p2_stats: dict[str, dict],
) -> dict:
    fixtures = sorted(p1_matches, key=lambda match: match["date"])[:10]
    fixtures.extend(sorted(p2_matches, key=lambda match: match["date"])[:4])
    stat_indexes = {
        False: {_normalize_team_name(name): stats for name, stats in p1_stats.items()},
        True: {_normalize_team_name(name): stats for name, stats in p2_stats.items()},
    }
    ticket_matches = []
    for order, match in enumerate(fixtures, start=1):
        league_stats = stat_indexes[match["is_segunda"]]
        home_stats = league_stats.get(_normalize_team_name(match["home"]), {})
        away_stats = league_stats.get(_normalize_team_name(match["away"]), {})
        is_segunda = match["is_segunda"]
        home_xg = home_stats.get("xg_local", 1.3 if is_segunda else 1.4)
        away_xg = away_stats.get("xg_visit", 1.1 if is_segunda else 1.2)
        ticket_matches.append({
            **match,
            "order": order,
            "xg_local": home_xg,
            "xga_local": home_stats.get("xga_local", 1.1),
            "xg_visit": away_xg,
            "xga_visit": away_stats.get("xga_visit", 1.3),
            "match_hxg": home_xg,
            "match_axg": away_xg,
            "raw": {"Date": match["date"].strftime("%d/%m/%Y")},
        })

    if ticket_matches:
        ticket_matches.append({**ticket_matches[0], "order": 15, "is_pleno": True})

    dates = [match["date"] for match in fixtures]
    date_range = f"{min(dates):%d/%m/%Y} – {max(dates):%d/%m/%Y}" if dates else ""
    return {
        "jornadaNumber": number,
        "season": "2026-2027",
        "title": f"Jornada {number} (Próximos partidos)",
        "dateRange": date_range,
        "isUpcoming": any(match["date"] >= date.today() and match["real_sign"] is None for match in fixtures),
        "isCompleted": bool(ticket_matches) and all(match["real_sign"] is not None for match in ticket_matches),
        "dataSource": "ESPN fixtures",
        "matches": ticket_matches,
    }


def calculate_team_xg_averages(matches: List[dict]) -> Dict[str, dict]:
    """
    Computes rolling averages for each team:
    - xg_local (when playing home)
    - xga_local (xG conceded at home)
    - xg_visit (when playing away)
    - xga_visit (xG conceded away)
    """
    stats: Dict[str, dict] = {}

    for m in matches:
        home = m["HomeTeam"]
        away = m["AwayTeam"]

        try:
            h_xg = float(m.get("HxG", 1.2))
            a_xg = float(m.get("AxG", 1.0))
        except (ValueError, TypeError):
            h_xg, a_xg = 1.2, 1.0

        if home not in stats:
            stats[home] = {"home_xg": [], "home_xga": [], "away_xg": [], "away_xga": [], "form": []}
        if away not in stats:
            stats[away] = {"home_xg": [], "home_xga": [], "away_xg": [], "away_xga": [], "form": []}

        stats[home]["home_xg"].append(h_xg)
        stats[home]["home_xga"].append(a_xg)
        stats[away]["away_xg"].append(a_xg)
        stats[away]["away_xga"].append(h_xg)

        # Form tracker
        ftr = m.get("FTR")
        if ftr == "H":
            stats[home]["form"].append("W")
            stats[away]["form"].append("L")
        elif ftr == "A":
            stats[home]["form"].append("L")
            stats[away]["form"].append("W")
        elif ftr == "D":
            stats[home]["form"].append("D")
            stats[away]["form"].append("D")

    # Averages
    summary = {}
    for team, d in stats.items():
        summary[team] = {
            "xg_local": round(sum(d["home_xg"][-6:]) / max(1, len(d["home_xg"][-6:])), 2) if d["home_xg"] else 1.3,
            "xga_local": round(sum(d["home_xga"][-6:]) / max(1, len(d["home_xga"][-6:])), 2) if d["home_xga"] else 1.1,
            "xg_visit": round(sum(d["away_xg"][-6:]) / max(1, len(d["away_xg"][-6:])), 2) if d["away_xg"] else 1.1,
            "xga_visit": round(sum(d["away_xga"][-6:]) / max(1, len(d["away_xga"][-6:])), 2) if d["away_xga"] else 1.3,
            "form": d["form"][-5:] if d["form"] else ["D", "D", "D", "D", "D"],
        }
    return summary


def get_quiniela_jornadas() -> List[dict]:
    """
    Constructs Quiniela jornadas of 15 matches (10 from Primera + 4 from Segunda + 1 Pleno)
    grouped chronologically by weekend.
    """
    sp1_raw, sp2_raw = fetch_all_matches_raw()

    # Sort each league by date
    sp1 = sorted(sp1_raw, key=lambda x: _parse_date(x.get("Date", "")))
    sp2 = sorted(sp2_raw, key=lambda x: _parse_date(x.get("Date", "")))

    # Compute team rolling stats across the entire 2026/27 season
    sp1_stats = calculate_team_xg_averages(sp1)
    sp2_stats = calculate_team_xg_averages(sp2)

    # La Liga has 10 matches per matchday, Segunda has 11 matches per matchday
    total_jornadas = min(len(sp1) // 10, len(sp2) // 4)
    today = date.today()

    jornadas = []
    for j_idx in range(total_jornadas):
        j_num = j_idx + 1
        p1_matches = sp1[j_idx * 10 : (j_idx + 1) * 10]
        p2_matches = sp2[j_idx * 4 : (j_idx + 1) * 4]

        # Combine into Quiniela ticket: 10 Primera + 4 Segunda + 1 Pleno al 15
        ticket_matches = []
        order = 1

        dates = []

        # 10 Primera matches
        for m in p1_matches:
            dates.append(m.get("Date", ""))
            home = m["HomeTeam"]
            away = m["AwayTeam"]
            h_stat = sp1_stats.get(home, {"xg_local": 1.4, "xga_local": 1.0, "form": ["W", "D", "L"]})
            a_stat = sp2_stats.get(away, sp1_stats.get(away, {"xg_visit": 1.0, "xga_visit": 1.3, "form": ["L", "D", "W"]}))

            ftr = m.get("FTR")
            real_sign = "1" if ftr == "H" else ("2" if ftr == "A" else ("X" if ftr == "D" else None))
            fthg = int(m["FTHG"]) if m.get("FTHG", "").isdigit() else None
            ftag = int(m["FTAG"]) if m.get("FTAG", "").isdigit() else None

            ticket_matches.append({
                "raw": m,
                "order": order,
                "is_segunda": False,
                "home": home,
                "away": away,
                "xg_local": h_stat["xg_local"],
                "xga_local": h_stat["xga_local"],
                "xg_visit": a_stat["xg_visit"],
                "xga_visit": a_stat["xga_visit"],
                "match_hxg": float(m.get("HxG", h_stat["xg_local"])),
                "match_axg": float(m.get("AxG", a_stat["xg_visit"])),
                "home_score": fthg,
                "away_score": ftag,
                "real_sign": real_sign,
                "home_form": h_stat["form"],
                "away_form": a_stat["form"],
            })
            order += 1

        # 4 Segunda matches
        for m in p2_matches:
            dates.append(m.get("Date", ""))
            home = m["HomeTeam"]
            away = m["AwayTeam"]
            h_stat = sp2_stats.get(home, {"xg_local": 1.2, "xga_local": 1.0, "form": ["D", "D", "D"]})
            a_stat = sp2_stats.get(away, {"xg_visit": 0.9, "xga_visit": 1.1, "form": ["D", "D", "D"]})

            ftr = m.get("FTR")
            real_sign = "1" if ftr == "H" else ("2" if ftr == "A" else ("X" if ftr == "D" else None))
            fthg = int(m["FTHG"]) if m.get("FTHG", "").isdigit() else None
            ftag = int(m["FTAG"]) if m.get("FTAG", "").isdigit() else None

            ticket_matches.append({
                "raw": m,
                "order": order,
                "is_segunda": True,
                "home": home,
                "away": away,
                "xg_local": h_stat["xg_local"],
                "xga_local": h_stat["xga_local"],
                "xg_visit": a_stat["xg_visit"],
                "xga_visit": a_stat["xga_visit"],
                "match_hxg": float(m.get("HxG", h_stat["xg_local"])),
                "match_axg": float(m.get("AxG", a_stat["xg_visit"])),
                "home_score": fthg,
                "away_score": ftag,
                "real_sign": real_sign,
                "home_form": h_stat["form"],
                "away_form": a_stat["form"],
            })
            order += 1

        # Pleno al 15: choose the marquee Primera match (match #1 or top clash)
        pleno_source = ticket_matches[0]
        ticket_matches.append({
            **pleno_source,
            "order": 15,
            "is_pleno": True,
        })

        parsed_dates = [parsed for d in dates if (parsed := _parse_date(d)) != datetime.min]
        date_range = f"{min(parsed_dates):%d/%m/%Y} – {max(parsed_dates):%d/%m/%Y}" if parsed_dates else ""
        has_upcoming_matches = any(
            (parsed := _parse_date(match["raw"].get("Date", ""))) != datetime.min and parsed.date() >= today
            for match in ticket_matches
            if not match.get("is_pleno")
        )

        jornadas.append({
            "jornadaNumber": j_num,
            "season": "2026-2027",
            "title": f"Jornada {j_num} (Temporada Real 26/27)",
            "dateRange": date_range,
            "isUpcoming": has_upcoming_matches,
            "isCompleted": all(m["real_sign"] is not None for m in ticket_matches),
            "matches": ticket_matches,
        })

    # football-data.co.uk updates results later and may not list future fixtures.
    # ESPN's scoreboard supplies scheduled fixtures so the next round remains predictable.
    current_week = _round_window_start(today)
    espn_p1, espn_p2 = _fetch_upcoming_fixtures(
        current_week.isoformat(),
        datetime.now().strftime("%Y%m%d%H"),
    )
    weeks = sorted({
        _round_window_start(match["date"])
        for match in espn_p1 + espn_p2
        if match["date"] >= current_week
    })
    for week in weeks:
        week_p1 = [match for match in espn_p1 if _round_window_start(match["date"]) == week]
        week_p2 = [match for match in espn_p2 if _round_window_start(match["date"]) == week]
        if len(week_p1) < 10 or len(week_p2) < 4:
            continue
        round_number = _upcoming_round_number("esp.1", week_p1, week)
        if round_number is None:
            continue
        jornadas.append(_make_live_jornada(
            round_number,
            week_p1,
            week_p2,
            sp1_stats,
            sp2_stats,
        ))

    return jornadas


def clear_cache():
    fetch_all_matches_raw.cache_clear()
    _fetch_upcoming_fixtures.cache_clear()
    _fetch_team_matches_before.cache_clear()
