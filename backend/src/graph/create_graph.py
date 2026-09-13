import networkx as nx


def create_graph(dataframe):
    G = nx.DiGraph()

    for _, row in dataframe.iterrows():
        enfermedad = row["prognosis"]
        sintomas = [col for col, value in row.items() if value == 1 and col != "prognosis"]

        G.add_node(enfermedad, tipo="enfermedad")

        for sintoma in sintomas:
            G.add_node(sintoma, tipo="sintoma")
            G.add_edge(enfermedad, sintoma)

    return G
