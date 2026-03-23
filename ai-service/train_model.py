import pandas as pd
import pickle
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# Load dataset
df = pd.read_csv("synthetic_career_dataset_2000_extended.csv")

# Convert skills to list
df["skills_list"] = df["skills"].apply(lambda x: x.split(","))

# Multi-hot encoding for skills
mlb = MultiLabelBinarizer()
X = mlb.fit_transform(df["skills_list"])

# Target labels
y = df["job_role"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Evaluate
accuracy = model.score(X_test, y_test)
print("Model Accuracy:", accuracy)

# Save model + encoder
pickle.dump(model, open("career_model.pkl", "wb"))
pickle.dump(mlb, open("skill_encoder.pkl", "wb"))

print("Model training complete!")
