import os

import pandas as pd

current_dir = os.path.dirname(os.path.abspath(__file__))
dataframe_dir = os.path.join(current_dir, "data.csv")


def load_dataframe():
    return pd.read_csv(dataframe_dir)