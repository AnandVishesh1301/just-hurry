import pandas as pd
from catboost import CatBoostRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

# Load the dataset
df = pd.read_csv('final_combined_dataset_ml.csv')

# Define the risk factor calculation using the formula (Pressure * Wind)/(Income * Population)
def calculate_risk_factor(row):
    try:
        risk_factor = (row['Pressure'] * row['Wind Speed']) / (row['Median Income'] * row['Population'])
    except ZeroDivisionError:
        risk_factor = 0
    return risk_factor

# Calculate the risk factor to use as the target
df['Risk Factor'] = df.apply(calculate_risk_factor, axis=1)

# Define feature columns and target
features = ['Wind Speed', 'Pressure', 'Population', 'Median Income']
target = 'Risk Factor'

# Split the dataset into features (X) and target (y)
X = df[features]
y = df[target]

# Split into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize and train CatBoost Regressor
model = CatBoostRegressor(iterations=500, learning_rate=0.001, depth=6, verbose=0)
model.fit(X_train, y_train)

# Predict the risk factor for the test set
y_pred = model.predict(X_test)

# Calculate Mean Squared Error (MSE) for evaluation
mse = mean_squared_error(y_test, y_pred)
print(f'Mean Squared Error: {mse}')

# Predict the risk factor for the entire dataset
df['Predicted Risk Factor'] = model.predict(X)

# Save the modified dataset with predicted risk factors
df.to_csv('PLSPLSPLSWORK.csv', index=False)

print('WE ARE DONE GAHHHHHH Predicted risk factor added and saved as final_combined_with_predicted_risk_factor.csv')
import pandas as pd
from catboost import CatBoostRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

# Load the dataset
df = pd.read_csv('final_combined_dataset_ml.csv')

# Define the risk factor calculation using the formula (Pressure * Wind)/(Income * Population)
def calculate_risk_factor(row):
    try:
        risk_factor = (row['Pressure'] * row['Wind Speed']) / (row['Median Income'] * row['Population'])
    except ZeroDivisionError:
        risk_factor = 0
    return risk_factor

# Calculate the risk factor to use as the target
df['Risk Factor'] = df.apply(calculate_risk_factor, axis=1)

# Define feature columns and target
features = ['Wind Speed', 'Pressure', 'Population', 'Median Income']
target = 'Risk Factor'

# Split the dataset into features (X) and target (y)
X = df[features]
y = df[target]

# Split into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize and train CatBoost Regressor
model = CatBoostRegressor(iterations=500, learning_rate=0.001, depth=6, verbose=0)
model.fit(X_train, y_train)

# Predict the risk factor for the test set
y_pred = model.predict(X_test)

# Calculate Mean Squared Error (MSE) for evaluation
mse = mean_squared_error(y_test, y_pred)
print(f'Mean Squared Error: {mse}')

# Predict the risk factor for the entire dataset
df['Predicted Risk Factor'] = model.predict(X)

# Save the modified dataset with predicted risk factors
df.to_csv('PLSPLSPLSWORK.csv', index=False)

print('WE ARE DONE GAHHHHHH Predicted risk factor added and saved as final_combined_with_predicted_risk_factor.csv')