import numpy as np


def calculate_probabilities(dataframe, alpha=1.0):
    data = dataframe.to_numpy()
    diagnosis_values, diagnosis_counts = np.unique(data[:, -1], return_counts=True)
    diagnosis_probs = diagnosis_counts / diagnosis_counts.sum()
    diagnosis_indices = {
        diag: np.where(data[:, -1] == diag)[0] for diag in diagnosis_values
    }

    symptom_probs = {}
    for symptom in dataframe.columns[:-1]:
        symptom_idx = dataframe.columns.get_loc(symptom)
        symptom_given_diagnosis = np.zeros((2, len(diagnosis_values)))

        for j, diag in enumerate(diagnosis_values):
            n = len(diagnosis_indices[diag])
            values = data[diagnosis_indices[diag], symptom_idx]
            ones = np.mean(values == 1) * n
            zeros = n - ones
            # Laplace: un síntoma que no aparece en una enfermedad no anula el resto.
            symptom_given_diagnosis[0, j] = (zeros + alpha) / (n + 2 * alpha)
            symptom_given_diagnosis[1, j] = (ones + alpha) / (n + 2 * alpha)

        symptom_probs[symptom] = symptom_given_diagnosis

    return diagnosis_values, diagnosis_probs, symptom_probs


def infer_diagnosis(evidence, diagnosis_values, diagnosis_probs, symptom_probs):
    log_probs = np.log(np.clip(diagnosis_probs, 1e-12, 1.0))
    for symptom, value in evidence.items():
        table = symptom_probs.get(symptom)
        if table is None:
            continue
        log_probs += np.log(np.clip(table[value], 1e-12, 1.0))

    log_probs -= log_probs.max()
    posterior = np.exp(log_probs)
    total = posterior.sum()
    if total == 0:
        return {}
    posterior /= total
    return dict(zip(diagnosis_values, posterior))


def calculate_symptoms_given_diagnosis(diagnosis, G):
    if diagnosis not in G:
        return set()
    return set(G.successors(diagnosis))


def _graph_overlap(diagnosis, evidence_ids, graph):
    if graph is None or diagnosis not in graph:
        return 0, 0
    related = set(graph.successors(diagnosis))
    overlap = len(related & evidence_ids)
    return overlap, len(related)


def top_diagnoses(
    evidence,
    diagnosis_values,
    diagnosis_probs,
    symptom_probs,
    top_n=4,
    graph=None,
):
    query_result = infer_diagnosis(
        evidence, diagnosis_values, diagnosis_probs, symptom_probs
    )
    evidence_ids = {name for name, value in evidence.items() if value == 1}
    ranked = []

    for disease, probability in query_result.items():
        probability = float(probability)
        if probability <= 0:
            continue
        overlap, related_n = _graph_overlap(disease, evidence_ids, graph)
        if graph is not None and evidence_ids and overlap == 0:
            continue
        coverage = overlap / len(evidence_ids) if evidence_ids else 0
        specificity = overlap / related_n if related_n else 0
        # El grafo solo ordena: Bayes manda; cobertura y especificidad desempata.
        ranked.append((disease, probability, coverage, specificity))

    ranked.sort(
        key=lambda item: (
            item[1] * (0.65 + 0.35 * item[2]),
            item[3] if len(evidence_ids) >= 2 else 0,
            item[1],
        ),
        reverse=True,
    )
    return [(disease, probability) for disease, probability, _, _ in ranked[:top_n]]


def infer_diagnosis_with_fallback(
    evidence,
    diagnosis_values,
    diagnosis_probs,
    symptom_probs,
    min_symptoms=1,
    top_n=4,
    graph=None,
):
    if not evidence:
        return []
    return top_diagnoses(
        evidence,
        diagnosis_values,
        diagnosis_probs,
        symptom_probs,
        top_n=top_n,
        graph=graph,
    )


def symptoms_to_evidence(symptoms):
    return {symptom: 1 for symptom in symptoms}
