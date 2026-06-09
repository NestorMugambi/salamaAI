# SalamaAI: Explainable Cardiovascular Disease Prediction and Monitoring System

## Overview

SalamaAI is an AI-powered healthcare decision support system designed to assist in the early detection and monitoring of cardiovascular diseases. The platform leverages Machine Learning (ML) and Explainable Artificial Intelligence (XAI) techniques to provide accurate risk assessments while maintaining transparency and interpretability for healthcare practitioners and patients.

The current implementation focuses on three major cardiovascular conditions:

- Coronary Heart Disease (CHD)
- Cardiovascular Disease (CVD)
- Stroke

In addition to disease risk prediction, SalamaAI provides blood pressure trend monitoring through graphical visualizations, enabling users and healthcare professionals to track cardiovascular health over time.

---

## Problem Statement

Cardiovascular diseases are among the leading causes of death worldwide. Early identification of individuals at risk can significantly improve patient outcomes through timely intervention, preventive care, and lifestyle modification.

Traditional risk assessment approaches often rely on static clinical evaluations and may not fully leverage the predictive capabilities of modern machine learning techniques. Furthermore, many AI systems operate as "black boxes," making it difficult for healthcare professionals to understand how predictions are generated.

SalamaAI addresses these challenges by combining predictive analytics with Explainable AI (XAI) to provide accurate, transparent, and clinically interpretable risk assessments.

---

## Objectives

The primary objectives of SalamaAI are:

1. To predict the likelihood of Coronary Heart Disease (CHD), Cardiovascular Disease (CVD), and Stroke.
2. To provide transparent model explanations using Explainable AI techniques.
3. To monitor blood pressure trends over time for improved cardiovascular health management.
4. To support healthcare professionals with interpretable risk assessments.
5. To promote early detection and prevention of cardiovascular diseases.

---

## Key Features

### Disease Risk Prediction

SalamaAI predicts the likelihood of:

- Coronary Heart Disease (CHD)
- Cardiovascular Disease (CVD)
- Stroke

using patient demographic, lifestyle, and clinical information.

### Explainable Artificial Intelligence (XAI)

The system incorporates **SHAP (SHapley Additive exPlanations)** to explain machine learning predictions.

SHAP explanations enable users to:

- Understand why a prediction was generated.
- Identify the most influential risk factors.
- Visualize positive and negative feature contributions.
- Improve trust and transparency in AI-assisted healthcare decisions.

### Blood Pressure Trend Monitoring

SalamaAI continuously tracks blood pressure readings and presents them through interactive trend graphs.

This functionality enables:

- Longitudinal patient monitoring.
- Early detection of hypertension patterns.
- Assessment of treatment effectiveness.
- Improved patient engagement and self-management.

### Risk Factor Analysis

The platform evaluates multiple cardiovascular risk factors, including:

- Age
- Blood Pressure
- Cholesterol Levels
- Body Mass Index (BMI)
- Smoking Status
- Diabetes Indicators
- Physical Activity Levels
- Family Medical History

---

## System Workflow

```text
Patient Data
      │
      ▼
Data Preprocessing
      │
      ▼
Feature Engineering
      │
      ▼
Machine Learning Models
      │
      ├── CHD Prediction
      ├── CVD Prediction
      └── Stroke Prediction
      │
      ▼
SHAP Explainability Layer
      │
      ▼
Risk Assessment Dashboard
      │
      ├── Prediction Results
      ├── SHAP Explanations
      └── Blood Pressure Trend Graphs
```

---

## Machine Learning Pipeline

### Data Preprocessing

The preprocessing stage includes:

- Data Cleaning
- Missing Value Handling
- Feature Engineering
- Feature Selection
- Data Normalization
- Categorical Variable Encoding

### Class Imbalance Handling

Medical datasets often contain significantly fewer positive disease cases than negative cases. To address this challenge, SalamaAI employs:

- Synthetic Minority Oversampling Technique (SMOTE)

This helps improve model learning and predictive performance on minority disease classes.

### Model Development

Multiple machine learning algorithms are evaluated, including:

- XGBoost
- Random Forest
- Logistic Regression
- Gradient Boosting
- Ensemble Learning Models

### Model Evaluation

Performance is assessed using:

- Accuracy
- Precision
- Recall
- F1-Score
- ROC-AUC Score

Particular emphasis is placed on Recall and F1-Score due to the importance of minimizing false negatives in healthcare applications.

---

## Explainability with SHAP

### Global Explanations

Global explanations provide insights into:

- Overall feature importance.
- Population-level risk factors.
- General model behavior.

### Local Explanations

Local explanations provide patient-specific insights by:

- Identifying factors that increase disease risk.
- Identifying factors that decrease disease risk.
- Quantifying each feature's contribution to the final prediction.

This improves transparency and supports evidence-based clinical decision-making.

---

## Blood Pressure Trend Analysis

The blood pressure monitoring module records and visualizes:

- Systolic Blood Pressure (SBP)
- Diastolic Blood Pressure (DBP)

Trend visualization supports:

- Detection of hypertension progression.
- Identification of abnormal fluctuations.
- Monitoring treatment effectiveness.
- Long-term cardiovascular health assessment.

---

## Technology Stack

### Frontend

- Vite
- JavaScript / TypeScript
- Tailwind CSS

### Backend

- FastAPI
- Python
- PostgreSQL

### Machine Learning & AI

- Scikit-learn
- XGBoost
- SHAP
- Pandas
- NumPy

### Data Visualization

- Chart.js
- Recharts
- SHAP Visualizations

---

## Future Enhancements

Planned improvements include:

- Real-time health monitoring.
- Wearable device integration.
- Personalized health recommendations.
- Advanced cardiovascular risk forecasting.
- Large Language Model (LLM)-powered health explanations.
- Clinical decision support systems.
- Expansion to additional non-communicable diseases.

---

## Expected Impact

SalamaAI aims to contribute to preventive healthcare by:

- Facilitating early disease detection.
- Improving patient awareness of cardiovascular risks.
- Enhancing clinician understanding of AI predictions.
- Supporting data-driven healthcare interventions.
- Promoting explainable and trustworthy AI in healthcare.

---

## Project Team

SalamaAI is being developed as an AI-driven healthcare research and software engineering project focused on delivering accurate, interpretable, and clinically relevant cardiovascular disease prediction and monitoring solutions.