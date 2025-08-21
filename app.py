import streamlit as st
import streamlit.components.v1 as components
import os

build_dir = os.path.join(os.path.dirname(__file__), "frontend/build")

st.set_page_config(page_title="CSV Merge Tool", layout="wide")
st.title("CSV Merge Tool (React + Streamlit)")

components.declare_component("csv_merge_tool", path=build_dir)
components.html(open(os.path.join(build_dir, "index.html")).read(), height=800)
