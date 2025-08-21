
# CSV Merge Tool — Streamlit (Python)

A Streamlit app to merge two types of CSVs into separate outputs:
- **Location On Hand**
- **DC On Hand**

## Features
- Drag & drop multiple CSVs.
- Detects groups by filename: contains `location` vs `dc` (case-insensitive).
- **Strict column matching** per group (order and names). If any file mismatches, processing **stops** and you get a clear error naming the file.
- Preview first 5 rows.
- Download merged CSVs.

## Run locally
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
streamlit run app.py
```

## Deploy on Streamlit Cloud
1. Push this repo to GitHub.
2. Go to https://share.streamlit.io/ and create a new app, pointing to `app.py` on the main branch.
3. Deploy. No Node.js required.

## File naming
- Files containing `location` (e.g., `Location On Hand.csv`, `store_location_2025-08-20.csv`) go to the **Location On Hand** group.
- Files containing `dc` (e.g., `DC Inventory Snapshot.csv`, `my_dc_on_hand.csv`) go to the **DC On Hand** group.
- Others are ignored.
