
import io
import pandas as pd
import streamlit as st

st.set_page_config(page_title="CSV Merge Tool (Location & DC)", layout="wide")
st.title("CSV Merge Tool — Location On Hand & DC On Hand")

st.markdown(
    """
    **How it works**
    - Drag & drop multiple CSV files.
    - Files will be split into two groups based on filename: anything containing **"location"** vs **"dc"** (case-insensitive).
    - If any file in a group has **mismatched columns**, processing stops and you'll see an error naming that file.
    - You'll get two outputs if both groups are valid.
    """
)

uploaded_files = st.file_uploader(
    "Drag & drop your CSVs here",
    type=["csv"],
    accept_multiple_files=True
)

def read_csv_safe(file):
    # Try utf-8 first, then fallback to latin-1
    try:
        return pd.read_csv(file)
    except UnicodeDecodeError:
        file.seek(0)
        return pd.read_csv(file, encoding="latin-1")

def merge_group(files, group_label):
    headers = None
    frames = []
    for f in files:
        # Rewind in case it was read before
        f.seek(0)
        df = read_csv_safe(f)
        cols = list(df.columns)
        if headers is None:
            headers = cols
        else:
            if cols != headers:
                st.error(f"❌ Stopped: **{f.name}** has mismatched columns for **{group_label}**.\n\n"
                         f"Expected columns: `{headers}`\n"
                         f"Found columns: `{cols}`")
                st.stop()
        frames.append(df)
    if frames:
        merged = pd.concat(frames, ignore_index=True)
        # Ensure column order stays consistent
        merged = merged[headers]
        return merged, headers
    return None, headers

if uploaded_files:
    # Split into groups by filename
    loc_files = [f for f in uploaded_files if "location" in f.name.lower()]
    dc_files = [f for f in uploaded_files if "dc" in f.name.lower()]
    other_files = [f for f in uploaded_files if f not in loc_files + dc_files]

    if other_files:
        st.warning("The following files don't look like 'Location' or 'DC' and were ignored: "
                   + ", ".join(f"**{f.name}**" for f in other_files))

    # Merge groups (each call can st.stop() on error)
    loc_df, loc_headers = merge_group(loc_files, "Location On Hand") if loc_files else (None, None)
    dc_df, dc_headers = merge_group(dc_files, "DC On Hand") if dc_files else (None, None)

    # Show results
    col1, col2 = st.columns(2, gap="large")

    with col1:
        st.subheader("Location On Hand")
        if loc_df is not None:
            st.caption("Preview (first 5 rows)")
            st.dataframe(loc_df.head(5), use_container_width=True)
            csv_bytes = loc_df.to_csv(index=False).encode("utf-8")
            st.download_button(
                "⬇️ Download Location_On_Hand_Merged.csv",
                data=csv_bytes,
                file_name="Location_On_Hand_Merged.csv",
                mime="text/csv",
                use_container_width=True,
            )
        else:
            st.info("No Location files detected.")

    with col2:
        st.subheader("DC On Hand")
        if dc_df is not None:
            st.caption("Preview (first 5 rows)")
            st.dataframe(dc_df.head(5), use_container_width=True)
            csv_bytes = dc_df.to_csv(index=False).encode("utf-8")
            st.download_button(
                "⬇️ Download DC_On_Hand_Merged.csv",
                data=csv_bytes,
                file_name="DC_On_Hand_Merged.csv",
                mime="text/csv",
                use_container_width=True,
            )
        else:
            st.info("No DC files detected.")
else:
    st.info("Upload your CSV files to begin.")
