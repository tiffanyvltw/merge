import React, { useState } from \"react\";
import Papa from \"papaparse\";

export default function CSVCombiner() {
  const [locationData, setLocationData] = useState(null);
  const [dcData, setDcData] = useState(null);
  const [error, setError] = useState(null);

  const handleFiles = (files) => {
    let locationAll = [];
    let dcAll = [];
    let locationHeaders = null;
    let dcHeaders = null;
    let stopped = false;

    Array.from(files).forEach((file, index) => {
      if (stopped) return;

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (stopped) return;
          const name = file.name.toLowerCase();
          const fileHeaders = result.meta.fields;

          if (name.includes(\"location\")) {
            if (!locationHeaders) {
              locationHeaders = fileHeaders;
            } else if (JSON.stringify(locationHeaders) !== JSON.stringify(fileHeaders)) {
              setError(`❌ Stopped: File ${file.name} has mismatched columns for Location On Hand.`);
              stopped = true;
              setLocationData(null);
              setDcData(null);
              return;
            }
            locationAll = [...locationAll, ...result.data];
          } else if (name.includes(\"dc\")) {
            if (!dcHeaders) {
              dcHeaders = fileHeaders;
            } else if (JSON.stringify(dcHeaders) !== JSON.stringify(fileHeaders)) {
              setError(`❌ Stopped: File ${file.name} has mismatched columns for DC On Hand.`);
              stopped = true;
              setLocationData(null);
              setDcData(null);
              return;
            }
            dcAll = [...dcAll, ...result.data];
          }

          if (index === files.length - 1 && !stopped) {
            setError(null);
            setLocationData(locationAll.length ? { headers: locationHeaders, data: locationAll } : null);
            setDcData(dcAll.length ? { headers: dcHeaders, data: dcAll } : null);
          }
        },
      });
    });
  };

  const downloadCSV = (dataset, filename) => {
    if (!dataset) return;
    const csv = Papa.unparse({
      fields: dataset.headers,
      data: dataset.data,
    });
    const blob = new Blob([csv], { type: \"text/csv;charset=utf-8;\" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement(\"a\");
    link.href = url;
    link.setAttribute(\"download\", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPreview = (dataset, title) => {
    if (!dataset) return null;
    const previewRows = dataset.data.slice(0, 5);
    return (
      <div className=\"my-6 w-full\">\n        <h2 className=\"text-xl font-semibold mb-2\">{title} Preview</h2>\n        <div className=\"overflow-x-auto border rounded-lg shadow\">\n          <table className=\"min-w-full text-sm text-left\">\n            <thead className=\"bg-gray-200\">\n              <tr>\n                {dataset.headers.map((h, i) => (\n                  <th key={i} className=\"px-3 py-2 border-b\">{h}</th>\n                ))}\n              </tr>\n            </thead>\n            <tbody>\n              {previewRows.map((row, rowIndex) => (\n                <tr key={rowIndex} className=\"odd:bg-white even:bg-gray-50\">\n                  {dataset.headers.map((h, i) => (\n                    <td key={i} className=\"px-3 py-2 border-b\">{row[h]}</td>\n                  ))}\n                </tr>\n              ))}\n            </tbody>\n          </table>\n        </div>\n        <p className=\"text-gray-500 mt-1\">Showing first 5 rows only...</p>\n      </div>\n    );
  };

  return (
    <div className=\"flex flex-col items-center p-6 w-full\">\n      <h1 className=\"text-2xl font-bold mb-4\">CSV Merge Tool</h1>\n      <input\n        type=\"file\"\n        multiple\n        accept=\".csv\"\n        onChange={(e) => handleFiles(e.target.files)}\n        className=\"mb-4\"\n      />\n      {error && <p className=\"text-red-600 font-bold mb-4\">{error}</p>}\n      <div className=\"flex gap-4 mb-6\">\n        {locationData && (\n          <button\n            onClick={() => downloadCSV(locationData, \"Location_On_Hand_Merged.csv\")}\n            className=\"bg-green-500 text-white px-4 py-2 rounded-lg shadow\"\n          >\n            Download Location On Hand CSV\n          </button>\n        )}\n        {dcData && (\n          <button\n            onClick={() => downloadCSV(dcData, \"DC_On_Hand_Merged.csv\")}\n            className=\"bg-blue-500 text-white px-4 py-2 rounded-lg shadow\"\n          >\n            Download DC On Hand CSV\n          </button>\n        )}\n      </div>\n      {renderPreview(locationData, \"Location On Hand\")}\n      {renderPreview(dcData, \"DC On Hand\")}\n    </div>\n  );
}