import streamlit as st
import pandas as pd
from dataclasses import dataclass
from typing import List, Tuple
import time

st.set_page_config(page_title="Quiniela Analytics by xG", layout="wide")
st.title("⚽ Optimizador de Quinielas: Histórico Real 26/27")
st.markdown("Esta aplicación descarga los datos reales de La Liga y Segunda División desde **FBRef**, genera el boleto de la jornada, realiza las predicciones usando tu algoritmo de xG y evalúa los resultados reales.")

# --- CORE LOGIC ---
@dataclass
class Partido:
    id: int
    local: str
    visitante: str
    xg_local: float
    xga_local: float
    xg_visitante: float
    xga_visitante: float
    resultado_real: str = None
    es_segunda: bool = False

@dataclass
class PronosticoPartido:
    partido: Partido
    prob_1: float
    prob_x: float
    prob_2: float
    tipo_apuesta: str
    signos: str

class GeneradorQuinielaDeterminista:
    def __init__(self, presupuesto_max: float = 24.0):
        self.precio_apuesta = 0.75
        self.max_apuestas = int(presupuesto_max / self.precio_apuesta)

    def calcular_probabilidades(self, p: Partido) -> Tuple[float, float, float]:
        fuerza_local = (p.xg_local + p.xga_visitante) / 2.0
        fuerza_visitante = (p.xg_visitante + p.xga_local) / 2.0
        
        factor_casa = 1.15 if not p.es_segunda else 1.25
        fuerza_local *= factor_casa

        total = fuerza_local + fuerza_visitante + 1.2
        
        prob_1 = round(fuerza_local / total, 2)
        prob_2 = round(fuerza_visitante / total, 2)
        prob_x = round(1.0 - (prob_1 + prob_2), 2)
        
        return prob_1, prob_x, prob_2

    def optimizar_boleto(self, partidos: List[Partido], num_dobles: int = 4, num_triples: int = 1) -> List[PronosticoPartido]:
        analizados = []
        for p in partidos:
            p1, px, p2 = self.calcular_probabilidades(p)
            probs = sorted([('1', p1), ('X', px), ('2', p2)], key=lambda x: x[1], reverse=True)
            max_prob = probs[0][1]
            margen = probs[0][1] - probs[1][1]
            
            analizados.append({
                'partido': p, 'p1': p1, 'px': px, 'p2': p2,
                'max_prob': max_prob, 'margen': margen,
                'top_signos': [probs[0][0], probs[1][0]]
            })

        analizados_ordenados = sorted(analizados, key=lambda x: (x['margen'], -x['max_prob']))

        partido_triple_ids = [x['partido'].id for x in analizados_ordenados[:num_triples]]
        partidos_dobles_ids = [x['partido'].id for x in analizados_ordenados[num_triples:num_triples+num_dobles]]

        resultado = []
        for item in analizados:
            p = item['partido']
            p_id = p.id
            
            if p_id in partido_triple_ids:
                tipo = 'TRIPLE'
                signos = '1X2'
            elif p_id in partidos_dobles_ids:
                tipo = 'DOBLE'
                signos_ordenados = sorted(item['top_signos'])
                signos = "".join(signos_ordenados)
                if signos == "2X": signos = "X2"
            else:
                tipo = 'FIJO'
                top_signo = max([('1', item['p1']), ('X', item['px']), ('2', item['p2'])], key=lambda x: x[1])[0]
                signos = top_signo

            resultado.append(PronosticoPartido(
                partido=p, prob_1=item['p1'], prob_x=item['px'], prob_2=item['p2'],
                tipo_apuesta=tipo, signos=signos
            ))

        return resultado

# --- SCRAPING FBREF (BYPASS CLOUDFLARE) ---
@st.cache_data(ttl=3600)
def fetch_fbref_data():
    from curl_cffi import requests as cffi_requests
    
    def get_table(url):
        r = cffi_requests.get(url, impersonate="chrome")
        if r.status_code != 200:
            raise Exception(f"Status Code {r.status_code}")
        dfs = pd.read_html(r.text)
        return dfs[0]

    try:
        st.info("Descargando calendario de La Liga (FBRef)...")
        df_liga_sched = get_table("https://fbref.com/en/comps/12/schedule/La-Liga-Scores-and-Fixtures")
        df_liga_sched['es_segunda'] = False
        time.sleep(2)
        
        st.info("Descargando calendario de Segunda División (FBRef)...")
        df_seg_sched = get_table("https://fbref.com/en/comps/17/schedule/Segunda-Division-Scores-and-Fixtures")
        df_seg_sched['es_segunda'] = True
        time.sleep(2)

        st.info("Descargando métricas xG de La Liga...")
        df_liga_stats = get_table("https://fbref.com/en/comps/12/stats/La-Liga-Stats")
        df_liga_stats.columns = ['_'.join(col).strip() if type(col) is tuple else col for col in df_liga_stats.columns]
        time.sleep(2)
        
        st.info("Descargando métricas xG de Segunda...")
        df_seg_stats = get_table("https://fbref.com/en/comps/17/stats/Segunda-Division-Stats")
        df_seg_stats.columns = ['_'.join(col).strip() if type(col) is tuple else col for col in df_seg_stats.columns]

        return df_liga_sched, df_seg_sched, df_liga_stats, df_seg_stats
    except Exception as e:
        st.error(f"Error descargando datos de FBRef: {e}")
        return None, None, None, None

def preparar_datos():
    df_ls, df_ss, df_lst, df_sst = fetch_fbref_data()
    if df_ls is None:
        return None, None
    
    df_sched = pd.concat([df_ls, df_ss])
    df_sched = df_sched.dropna(subset=['Wk', 'Home', 'Away'])
    df_sched = df_sched[df_sched['Wk'].astype(str).str.isnumeric()]
    
    stats_cols_xg = [c for c in df_lst.columns if 'xG' in c and '90' in c]
    stats_cols_xga = [c for c in df_lst.columns if 'xGA' in c and '90' in c]
    
    def extract_xg(df_stats):
        res = {}
        squad_col = [c for c in df_stats.columns if 'Squad' in c][0]
        mp_col = [c for c in df_stats.columns if 'MP' in c][0]
        xg_col = [c for c in df_stats.columns if 'xG' in c and 'Per' not in c and 'Net' not in c][0]
        
        try:
            xga_col = [c for c in df_stats.columns if 'xGA' in c][0]
        except:
            xga_col = [c for c in df_stats.columns if 'GA' in c and 'x' not in c][0]

        for _, row in df_stats.iterrows():
            team = row[squad_col]
            mp = max(1, float(row[mp_col]))
            xg_90 = float(row[xg_col]) / mp
            xga_90 = float(row[xga_col]) / mp
            res[team] = {'xg': xg_90, 'xga': xga_90}
        return res

    team_stats = {}
    team_stats.update(extract_xg(df_lst))
    try:
        team_stats.update(extract_xg(df_sst))
    except Exception as e:
        st.warning("No se pudo procesar xG real de Segunda, usando proxy.")

    return df_sched, team_stats

df_sched, team_stats = preparar_datos()

if df_sched is not None:
    st.sidebar.header("Configuración")
    jornadas_disponibles = sorted(df_sched['Wk'].unique().astype(int).tolist())
    jornada_sel = st.sidebar.selectbox("Selecciona Jornada (Semana FBRef)", jornadas_disponibles)
    
    presupuesto = st.sidebar.number_input("Presupuesto máximo (€)", min_value=0.75, value=24.0, step=0.75)
    num_dobles = st.sidebar.slider("Número de Dobles", 0, 14, 4)
    num_triples = st.sidebar.slider("Número de Triples", 0, 14, 1)
    
    partidos_semana = df_sched[df_sched['Wk'].astype(int) == jornada_sel].head(14)
    
    lista_partidos = []
    idx = 1
    for _, row in partidos_semana.iterrows():
        local = row['Home']
        visitante = row['Away']
        score = str(row['Score']) if pd.notna(row['Score']) else ""
        
        res_real = None
        if "-" in score or "–" in score:
            parts = score.replace("–", "-").split("-")
            if len(parts) == 2:
                try:
                    gl, gv = int(parts[0]), int(parts[1])
                    if gl > gv: res_real = "1"
                    elif gl < gv: res_real = "2"
                    else: res_real = "X"
                except:
                    pass
        
        stat_l = team_stats.get(local, {'xg': 1.2, 'xga': 1.2})
        stat_v = team_stats.get(visitante, {'xg': 1.2, 'xga': 1.2})
        
        lista_partidos.append(Partido(
            id=idx, local=local, visitante=visitante,
            xg_local=stat_l['xg'], xga_local=stat_l['xga'],
            xg_visitante=stat_v['xg'], xga_visitante=stat_v['xga'],
            resultado_real=res_real, es_segunda=row['es_segunda']
        ))
        idx += 1
        
    st.header(f"Boleto Generado: Jornada {jornada_sel}")
    if len(lista_partidos) < 14:
        st.warning(f"Solo se encontraron {len(lista_partidos)} partidos esta semana. La quiniela necesita 14.")
        
    df_partidos = pd.DataFrame([{
        "ID": p.id, "Local": p.local, "Visitante": p.visitante,
        "xG L": round(p.xg_local,2), "xG V": round(p.xg_visitante,2),
        "División": "Segunda" if p.es_segunda else "Primera",
        "Res. Real": p.resultado_real if p.resultado_real else "Pendiente"
    } for p in lista_partidos])
    st.dataframe(df_partidos, use_container_width=True)
    
    if st.button("Calcular Pronóstico"):
        engine = GeneradorQuinielaDeterminista(presupuesto_max=presupuesto)
        try:
            pronosticos = engine.optimizar_boleto(lista_partidos, num_dobles, num_triples)
            
            st.header("Resultado y Evaluación")
            
            aciertos = 0
            pendientes = 0
            res_list = []
            for p in pronosticos:
                acierto = "⏳"
                if p.partido.resultado_real:
                    if p.partido.resultado_real in p.signos:
                        acierto = "✅"
                        aciertos += 1
                    else:
                        acierto = "❌"
                else:
                    pendientes += 1
                    
                res_list.append({
                    "ID": p.partido.id,
                    "Partido": f"{p.partido.local} vs {p.partido.visitante}",
                    "Prob (1-X-2)": f"{p.prob_1:.2f} | {p.prob_x:.2f} | {p.prob_2:.2f}",
                    "Tipo": p.tipo_apuesta,
                    "Signos": p.signos,
                    "Acierto": acierto
                })
            
            st.dataframe(pd.DataFrame(res_list), use_container_width=True)
            
            st.subheader("Escrutinio")
            c1, c2, c3 = st.columns(3)
            c1.metric("Aciertos Confirmados", aciertos)
            c2.metric("Partidos Pendientes", pendientes)
            
            premios_mock = {14: 150000, 13: 5000, 12: 300, 11: 45, 10: 9}
            premio = premios_mock.get(aciertos, 0)
            coste = (3 ** num_triples) * (2 ** num_dobles) * 0.75
            
            c3.metric("Beneficio Estimado (Sin reducción)", f"€{premio - coste:.2f}", f"{premio}€ Premio - {coste}€ Coste")
            
        except Exception as e:
            st.error(f"Error generando quiniela: {e}")
