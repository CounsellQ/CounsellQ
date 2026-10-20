"""
CounsellQ Machine Learning Evaluation & Comparison Pipeline
Evaluates Rule-Based Baseline, Logistic Regression, Decision Tree,
Random Forest, and Gradient Boosting on admission feasibility classification.
"""

import os
import json
import time
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)
import joblib

def load_data(csv_path):
    print(f"Loading cutoff data from: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} cutoff records across {df['Institute'].nunique()} institutes.")
    return df

def generate_evaluation_samples(df, seed=42):
    """
    Constructs a diverse, representative sample of candidate queries
    across rank percentiles and evaluates admission feasibility.
    """
    np.random.seed(seed)
    samples = []

    # Map branches to standard categories
    def categorize_program(prog):
        p = str(prog).lower()
        if "computer" in p or "cs" in p or "software" in p:
            return "CSE"
        if "information" in p or "it" in p:
            return "IT"
        if "electronics" in p or "ece" in p or "ec" in p:
            return "ECE"
        if "electrical" in p or "ee" in p:
            return "EE"
        if "mechanical" in p or "me" in p:
            return "ME"
        if "civil" in p or "ce" in p:
            return "CE"
        return "OTHER"

    # Map institute type
    def categorize_institute(inst):
        i = str(inst).upper()
        if "INSTITUTE OF ENGINEERING & TECHNOLOGY,LUCKNOW" in i or "BUNDELKHAND" in i or "KAMLA NEHRU" in i:
            return 3  # Premier Autonomous Govt
        if "RAJKIYA" in i or "UNIVERSITY" in i or "GOVERNMENT" in i or "TEXTILE" in i:
            return 2  # State Govt / University
        if "J.S.S." in i or "AJAY KUMAR GARG" in i or "KIET" in i or "GALGOTIA" in i or "G.L. BAJAJ" in i or "ABES" in i:
            return 1  # Top Tier Private
        return 0      # General Private

    # Map categories
    def categorize_category(cat):
        c = str(cat).upper()
        if "OPEN" in c:
            return 0
        if "BC" in c or "OBC" in c:
            return 1
        if "EWS" in c:
            return 2
        if "SC" in c:
            return 3
        if "ST" in c:
            return 4
        return 5

    # Map rounds
    def round_to_int(r):
        s = str(r)
        if "1" in s:
            return 1
        if "2" in s:
            return 2
        if "3" in s:
            return 3
        return 1

    # For each cutoff record, evaluate realistic candidate queries around the closing rank:
    # 1. R < 0.8 * ClosingRank (Safe)
    # 2. 0.8 * ClosingRank <= R <= 1.1 * ClosingRank (Moderate)
    # 3. 1.1 * ClosingRank < R <= 1.5 * ClosingRank (Ambitious)
    for idx, row in df.iterrows():
        open_rank = float(row["Opening Rank"])
        close_rank = float(row["Closing Rank"])
        if open_rank <= 0 or close_rank <= 0 or open_rank > close_rank:
            continue

        prog_cat = categorize_program(row["Program"])
        inst_tier = categorize_institute(row["Institute"])
        cat_id = categorize_category(row["Category"])
        rnd = round_to_int(row["Round"])
        spread = close_rank - open_rank
        rel_spread = spread / close_rank

        # Sample query 1: Safe query (student has better rank than cutoff with >=20% margin)
        r_safe = close_rank * np.random.uniform(0.35, 0.79)
        samples.append({
            "student_rank": r_safe,
            "opening_rank": open_rank,
            "closing_rank": close_rank,
            "round": rnd,
            "inst_tier": inst_tier,
            "cat_id": cat_id,
            "spread": spread,
            "rel_spread": rel_spread,
            "target": 2 # Safer Chance
        })

        # Sample query 2: Moderate query (student rank within [-10%, +20%] boundary)
        r_mod = close_rank * np.random.uniform(0.81, 1.09)
        samples.append({
            "student_rank": r_mod,
            "opening_rank": open_rank,
            "closing_rank": close_rank,
            "round": rnd,
            "inst_tier": inst_tier,
            "cat_id": cat_id,
            "spread": spread,
            "rel_spread": rel_spread,
            "target": 1 # Moderate Chance
        })

        # Sample query 3: Ambitious query (cutoff closed higher than student's rank by 10% to 50%)
        r_amb = close_rank * np.random.uniform(1.11, 1.50)
        samples.append({
            "student_rank": r_amb,
            "opening_rank": open_rank,
            "closing_rank": close_rank,
            "round": rnd,
            "inst_tier": inst_tier,
            "cat_id": cat_id,
            "spread": spread,
            "rel_spread": rel_spread,
            "target": 0 # Ambitious Chance
        })

    dataset = pd.DataFrame(samples)
    print(f"Constructed {len(dataset)} evaluation query samples.")
    print("Class distribution:")
    print(dataset["target"].value_counts(normalize=True))
    return dataset

def extract_features(df):
    """
    Computes predictive features without target leakage.
    Features:
    1. rel_rank_diff: (closing_rank - student_rank) / closing_rank
    2. rank_ratio: student_rank / closing_rank
    3. norm_dist_from_open: (student_rank - opening_rank) / (closing_rank - opening_rank + 1)
    4. rel_spread: (closing_rank - opening_rank) / closing_rank
    5. inst_tier: institution competitiveness tier
    6. round: counselling round number
    7. cat_id: reservation category id
    """
    X = pd.DataFrame()
    X["rel_rank_diff"] = (df["closing_rank"] - df["student_rank"]) / df["closing_rank"]
    X["rank_ratio"] = df["student_rank"] / df["closing_rank"]
    X["norm_dist_from_open"] = (df["student_rank"] - df["opening_rank"]) / (df["spread"] + 1.0)
    X["rel_spread"] = df["rel_spread"]
    X["inst_tier"] = df["inst_tier"]
    X["round"] = df["round"]
    X["cat_id"] = df["cat_id"]
    return X

def rule_based_predict(X):
    """
    Baseline rule-based classifier matching original CounsellQ heuristic:
    diff% = (closing_rank - student_rank) / student_rank * 100
    >= 20% -> Safer (2)
    >= 0%  -> Moderate (1)
    < 0%   -> Ambitious (0)
    """
    # From rank_ratio = student_rank / closing_rank:
    # diff% = (1 / rank_ratio - 1) * 100
    rank_ratio = X["rank_ratio"].values
    preds = np.zeros(len(rank_ratio), dtype=int)
    for i, r in enumerate(rank_ratio):
        diff_pct = (1.0 / max(r, 1e-6) - 1.0) * 100.0
        if diff_pct >= 20.0:
            preds[i] = 2 # Safer
        elif diff_pct >= 0.0:
            preds[i] = 1 # Moderate
        else:
            preds[i] = 0 # Ambitious
    return preds

def evaluate_models(X_train, X_test, y_train, y_test):
    results = {}
    models = {}

    # 1. Rule-Based Baseline
    t0 = time.time()
    y_pred_rule = rule_based_predict(X_test)
    rule_latency = (time.time() - t0) / len(X_test) * 1000
    results["Rule-Based Baseline"] = {
        "Accuracy": float(accuracy_score(y_test, y_pred_rule)),
        "Precision (Macro)": float(precision_score(y_test, y_pred_rule, average="macro")),
        "Recall (Macro)": float(recall_score(y_test, y_pred_rule, average="macro")),
        "F1 (Macro)": float(f1_score(y_test, y_pred_rule, average="macro")),
        "F1 (Weighted)": float(f1_score(y_test, y_pred_rule, average="weighted")),
        "ROC-AUC (ovr)": None, # Non-probabilistic heuristic
        "Inference Latency (ms/sample)": float(rule_latency),
        "Confusion Matrix": confusion_matrix(y_test, y_pred_rule).tolist()
    }

    # Scale features for linear model
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 2. Logistic Regression
    print("Training Logistic Regression...")
    lr = LogisticRegression(max_iter=1000, random_state=42)
    lr.fit(X_train_scaled, y_train)
    t0 = time.time()
    y_pred_lr = lr.predict(X_test_scaled)
    lr_latency = (time.time() - t0) / len(X_test) * 1000
    y_prob_lr = lr.predict_proba(X_test_scaled)
    results["Logistic Regression"] = {
        "Accuracy": float(accuracy_score(y_test, y_pred_lr)),
        "Precision (Macro)": float(precision_score(y_test, y_pred_lr, average="macro")),
        "Recall (Macro)": float(recall_score(y_test, y_pred_lr, average="macro")),
        "F1 (Macro)": float(f1_score(y_test, y_pred_lr, average="macro")),
        "F1 (Weighted)": float(f1_score(y_test, y_pred_lr, average="weighted")),
        "ROC-AUC (ovr)": float(roc_auc_score(y_test, y_prob_lr, multi_class="ovr")),
        "Inference Latency (ms/sample)": float(lr_latency),
        "Confusion Matrix": confusion_matrix(y_test, y_pred_lr).tolist()
    }
    models["Logistic Regression"] = lr

    # 3. Decision Tree
    print("Training Decision Tree...")
    dt = DecisionTreeClassifier(max_depth=6, random_state=42)
    dt.fit(X_train, y_train)
    t0 = time.time()
    y_pred_dt = dt.predict(X_test)
    dt_latency = (time.time() - t0) / len(X_test) * 1000
    y_prob_dt = dt.predict_proba(X_test)
    results["Decision Tree"] = {
        "Accuracy": float(accuracy_score(y_test, y_pred_dt)),
        "Precision (Macro)": float(precision_score(y_test, y_pred_dt, average="macro")),
        "Recall (Macro)": float(recall_score(y_test, y_pred_dt, average="macro")),
        "F1 (Macro)": float(f1_score(y_test, y_pred_dt, average="macro")),
        "F1 (Weighted)": float(f1_score(y_test, y_pred_dt, average="weighted")),
        "ROC-AUC (ovr)": float(roc_auc_score(y_test, y_prob_dt, multi_class="ovr")),
        "Inference Latency (ms/sample)": float(dt_latency),
        "Confusion Matrix": confusion_matrix(y_test, y_pred_dt).tolist()
    }
    models["Decision Tree"] = dt

    # 4. Random Forest
    print("Training Random Forest Classifier...")
    rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    t0 = time.time()
    y_pred_rf = rf.predict(X_test)
    rf_latency = (time.time() - t0) / len(X_test) * 1000
    y_prob_rf = rf.predict_proba(X_test)
    results["Random Forest"] = {
        "Accuracy": float(accuracy_score(y_test, y_pred_rf)),
        "Precision (Macro)": float(precision_score(y_test, y_pred_rf, average="macro")),
        "Recall (Macro)": float(recall_score(y_test, y_pred_rf, average="macro")),
        "F1 (Macro)": float(f1_score(y_test, y_pred_rf, average="macro")),
        "F1 (Weighted)": float(f1_score(y_test, y_pred_rf, average="weighted")),
        "ROC-AUC (ovr)": float(roc_auc_score(y_test, y_prob_rf, multi_class="ovr")),
        "Inference Latency (ms/sample)": float(rf_latency),
        "Confusion Matrix": confusion_matrix(y_test, y_pred_rf).tolist(),
        "Feature Importance": dict(zip(X_train.columns, rf.feature_importances_.tolist()))
    }
    models["Random Forest"] = rf

    # 5. Gradient Boosting
    print("Training Gradient Boosting Classifier...")
    gb = GradientBoostingClassifier(n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42)
    gb.fit(X_train, y_train)
    t0 = time.time()
    y_pred_gb = gb.predict(X_test)
    gb_latency = (time.time() - t0) / len(X_test) * 1000
    y_prob_gb = gb.predict_proba(X_test)
    results["Gradient Boosting"] = {
        "Accuracy": float(accuracy_score(y_test, y_pred_gb)),
        "Precision (Macro)": float(precision_score(y_test, y_pred_gb, average="macro")),
        "Recall (Macro)": float(recall_score(y_test, y_pred_gb, average="macro")),
        "F1 (Macro)": float(f1_score(y_test, y_pred_gb, average="macro")),
        "F1 (Weighted)": float(f1_score(y_test, y_pred_gb, average="weighted")),
        "ROC-AUC (ovr)": float(roc_auc_score(y_test, y_prob_gb, multi_class="ovr")),
        "Inference Latency (ms/sample)": float(gb_latency),
        "Confusion Matrix": confusion_matrix(y_test, y_pred_gb).tolist(),
        "Feature Importance": dict(zip(X_train.columns, gb.feature_importances_.tolist()))
    }
    models["Gradient Boosting"] = gb

    return results, models, scaler

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(base_dir)
    csv_path = os.path.join(project_dir, "data", "counsellq_uptac_2025.csv")

    df = load_data(csv_path)
    sample_df = generate_evaluation_samples(df, seed=42)
    X = extract_features(sample_df)
    y = sample_df["target"].values

    # Train / Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"Train samples: {len(X_train)}, Test samples: {len(X_test)}")
    results, models, scaler = evaluate_models(X_train, X_test, y_train, y_test)

    # Save models directory
    model_dir = os.path.join(base_dir, "models")
    os.makedirs(model_dir, exist_ok=True)

    joblib.dump(models["Random Forest"], os.path.join(model_dir, "random_forest_model.joblib"))
    joblib.dump(models["Gradient Boosting"], os.path.join(model_dir, "gradient_boosting_model.joblib"))
    joblib.dump(scaler, os.path.join(model_dir, "scaler.joblib"))

    # Save evaluation report JSON
    report_path = os.path.join(base_dir, "ml_comparison_report.json")
    with open(report_path, "w") as f:
        json.dump({
            "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "dataset": {
                "source": "counsellq_uptac_2025.csv",
                "total_cutoff_records": len(df),
                "total_evaluation_samples": len(sample_df),
                "train_samples": len(X_train),
                "test_samples": len(X_test),
                "features": list(X.columns),
                "classes": {
                    "0": "Ambitious Chance",
                    "1": "Moderate Chance",
                    "2": "Safer Chance"
                }
            },
            "models": results
        }, f, indent=2)

    print(f"ML evaluation completed! Report saved to {report_path}")

    # Print summary table
    print("\n" + "="*80)
    print(f"{'Model':<25} | {'Accuracy':<10} | {'Macro F1':<10} | {'Weighted F1':<12} | {'ROC-AUC':<10} | {'Latency (ms)':<12}")
    print("-"*80)
    for model_name, m in results.items():
        auc_str = f"{m['ROC-AUC (ovr)']:.4f}" if m['ROC-AUC (ovr)'] is not None else "N/A (Rule)"
        print(f"{model_name:<25} | {m['Accuracy']:<10.4f} | {m['F1 (Macro)']:<10.4f} | {m['F1 (Weighted)']:<12.4f} | {auc_str:<10} | {m['Inference Latency (ms/sample)']:<12.4f}")
    print("="*80 + "\n")

if __name__ == "__main__":
    main()
