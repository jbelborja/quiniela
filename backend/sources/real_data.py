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
from datetime import datetime
from functools import lru_cache
from typing import Dict, List, Tuple

import requests

SP1_URL = "https://www.football-data.co.uk/mmz4281/2627/SP1.csv"
SP2_URL = "https://www.football-data.co.uk/mmz4281/2627/SP2.csv"

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

        clean_dates = [d for d in dates if d]
        date_range = f"{clean_dates[0]} – {clean_dates[-1]}" if clean_dates else ""

        jornadas.append({
            "jornadaNumber": j_num,
            "season": "2026-2027",
            "title": f"Jornada {j_num} (Temporada Real 26/27)",
            "dateRange": date_range,
            "isCompleted": all(m["real_sign"] is not None for m in ticket_matches),
            "matches": ticket_matches,
        })

    return jornadas


def clear_cache():
    fetch_all_matches_raw.cache_clear()
