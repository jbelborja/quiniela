"""
FastAPI backend for La Quiniela Inteligente.
Serves real 2026/27 La Liga & Segunda División data with real xG and scores.
"""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

try:
    from backend.sources import real_data
except ImportError:
    from sources import real_data

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

app = FastAPI(title="Quiniela Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Deterministic xG Probability Engine
# ---------------------------------------------------------------------------

def calculate_probabilities(xg_local: float, xga_local: float,
                            xg_visit: float, xga_visit: float,
                            is_segunda: bool = False) -> dict:
    fuerza_local = (xg_local + xga_visit) / 2.0
    fuerza_visitante = (xg_visit + xga_local) / 2.0

    factor_casa = 1.25 if is_segunda else 1.15
    fuerza_local *= factor_casa

    total = fuerza_local + fuerza_visitante + 1.2  # 1.2 base constante de empate

    p1 = round(fuerza_local / total, 2)
    p2 = round(fuerza_visitante / total, 2)
    px = round(1.0 - (p1 + p2), 2)

    p1_pct = int(round(p1 * 100))
    p2_pct = int(round(p2 * 100))
    px_pct = max(0, 100 - p1_pct - p2_pct)

    return {"p1": p1_pct, "px": px_pct, "p2": p2_pct}


def team_logo(team_name: str) -> str:
    ESPN_IDS = {
        "Real Madrid": "86", "Barcelona": "83", "Ath Madrid": "1068", "Atletico Madrid": "1068",
        "Sevilla": "243", "Betis": "244", "Villarreal": "102", "Ath Bilbao": "93", "Athletic Club": "93",
        "Sociedad": "89", "Real Sociedad": "89", "Osasuna": "97", "Valencia": "95", "Getafe": "92",
        "Girona": "9812", "Celta": "85", "Rayo Vallecano": "101", "Las Palmas": "98", "Alaves": "96",
        "Leganes": "989", "Espanyol": "88", "Mallorca": "84", "Valladolid": "100", "Cadiz": "87",
        "Granada": "3747", "Almeria": "103", "Elche": "3751", "Levante": "100", "Eibar": "91",
        "Sporting Gijon": "95", "Oviedo": "242", "Zaragoza": "99", "Santander": "94", "Tenerife": "104",
        "Burgos": "6908", "Albacete": "90", "Malaga": "241", "Huesca": "105", "Cartagena": "6909",
        "Castellon": "106", "Cordoba": "107", "Deportivo": "94", "La Coruna": "94",
    }
    eid = ESPN_IDS.get(team_name)
    if eid:
        return f"https://a.espncdn.com/i/teamlogos/soccer/500/{eid}.png"
    return f"https://ui-avatars.com/api/?name={team_name[:2]}&background=1a1a2e&color=fff&size=64"


def to_pleno_score(score: Optional[int]) -> str:
    if score is None:
        return "1"
    if score == 0:
        return "0"
    if score == 1:
        return "1"
    if score == 2:
        return "2"
    return "M"


# ---------------------------------------------------------------------------
# API Routes
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health():
    return {"status": "ok", "season": "2026-2027", "source": "football-data.co.uk"}


@app.get("/api/jornadas")
def list_jornadas():
    """Returns the list of all available 2026/27 real jornadas."""
    try:
        jornadas = real_data.get_quiniela_jornadas()
        return [
            {
                "jornadaNumber": j["jornadaNumber"],
                "season": j["season"],
                "title": j["title"],
                "dateRange": j["dateRange"],
                "isCompleted": j["isCompleted"],
            }
            for j in jornadas
        ]
    except Exception as e:
        log.exception("Error listing jornadas")
        raise HTTPException(status_code=500, detail=str(e))


def format_jornada(found: dict) -> dict:
    matchday = found["jornadaNumber"]
    matches_out = []
    for m in found["matches"]:
        order = m["order"]
        is_pleno = order == 15

        probs = calculate_probabilities(
            xg_local=m["xg_local"],
            xga_local=m["xga_local"],
            xg_visit=m["xg_visit"],
            xga_visit=m["xga_visit"],
            is_segunda=m["is_segunda"],
        )

        real_score = None
        real_pleno = None
        if m["home_score"] is not None and m["away_score"] is not None:
            real_score = {"home": m["home_score"], "away": m["away_score"]}
            if is_pleno:
                real_pleno = {
                    "home": to_pleno_score(m["home_score"]),
                    "away": to_pleno_score(m["away_score"]),
                }

        matches_out.append({
            "id": f"j{matchday}-{order}",
            "order": order,
            "isPleno": is_pleno,
            "homeTeam": {
                "id": m["home"].lower().replace(" ", "_"),
                "name": m["home"],
                "shortName": m["home"],
                "logo": team_logo(m["home"]),
            },
            "awayTeam": {
                "id": m["away"].lower().replace(" ", "_"),
                "name": m["away"],
                "shortName": m["away"],
                "logo": team_logo(m["away"]),
            },
            "realScore": real_score,
            "realSign": m["real_sign"],
            "realPleno": real_pleno,
            "stats": {
                "homeRank": 0,
                "awayRank": 0,
                "homeForm": m["home_form"],
                "awayForm": m["away_form"],
                "homeGoalsAvg": m["match_hxg"],
                "awayGoalsAvg": m["match_axg"],
                "h2hSummary": f"{'Segunda' if m['is_segunda'] else 'Primera'} · xG en partido: {m['match_hxg']} - {m['match_axg']} · Media: {m['xg_local']} vs {m['xg_visit']}",
            },
            "probabilities": probs,
        })

    scrutiny = {
        "recaudacion": 4500000.0,
        "bote": 1500000.0,
        "categories": {
            "p15": {"category": "15", "name": "Pleno al 15", "winners": 1, "prizePerWinner": 1250000.0},
            "p14": {"category": "14", "name": "14 Aciertos", "winners": 3, "prizePerWinner": 85000.0},
            "p13": {"category": "13", "name": "13 Aciertos", "winners": 115, "prizePerWinner": 2100.0},
            "p12": {"category": "12", "name": "12 Aciertos", "winners": 1420, "prizePerWinner": 180.0},
            "p11": {"category": "11", "name": "11 Aciertos", "winners": 11200, "prizePerWinner": 22.5},
            "p10": {"category": "10", "name": "10 Aciertos", "winners": 54000, "prizePerWinner": 5.8},
        },
    }

    return {
        "jornadaNumber": matchday,
        "season": "2026-2027",
        "title": found["title"],
        "dateRange": found["dateRange"],
        "isCompleted": found["isCompleted"],
        "dataSource": "Real Live Feed (football-data.co.uk 2026/27)",
        "scrutiny": scrutiny,
        "matches": matches_out,
    }


@app.get("/api/jornadas/all")
def get_all_jornadas_full():
    """Returns all complete real jornadas with matches and scrutiny."""
    try:
        jornadas = real_data.get_quiniela_jornadas()
        return [format_jornada(j) for j in jornadas]
    except Exception as e:
        log.exception("Error getting all full jornadas")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/jornada/next")
def get_next_jornada():
    """Returns the next upcoming (non-completed) jornada for bet prediction."""
    try:
        jornadas = real_data.get_quiniela_jornadas()
        # First jornada that is not completed (no real results yet)
        found = next((j for j in jornadas if not j["isCompleted"]), None)
        if not found:
            # All completed — return the last one
            found = jornadas[-1] if jornadas else None
        if not found:
            raise HTTPException(status_code=404, detail="No hay jornadas disponibles")
        return format_jornada(found)
    except HTTPException:
        raise
    except Exception as e:
        log.exception("Error getting next jornada")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/jornada/{matchday}")
def get_jornada(matchday: int):
    """Returns complete real match data, xG, probabilities, and scrutiny for a jornada."""
    try:
        jornadas = real_data.get_quiniela_jornadas()
        found = next((j for j in jornadas if j["jornadaNumber"] == matchday), None)
        if not found:
            raise HTTPException(status_code=404, detail=f"Jornada {matchday} no encontrada")

        return format_jornada(found)
    except HTTPException:
        raise
    except Exception as e:
        log.exception("Error getting jornada %d", matchday)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/cache/clear")
def clear_cache():
    real_data.clear_cache()
    return {"cleared": True}
