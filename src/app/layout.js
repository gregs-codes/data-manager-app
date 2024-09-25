// src/app/layout.js
'use client';

import React, { useState } from 'react';
import Navbar from './components/Navbar';
import { CssBaseline, Container } from '@mui/material';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import DataTable from './components/DataTable';
import Typography from '@mui/material/Typography';

export default function RootLayout({ children }) {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  // Function to ensure unique column names and generate column objects with id and label
  const ensureUniqueColumns = (cols) => {
    const uniqueCols = [];
    const colCount = {};

    cols.forEach((col) => {
      const trimmedCol = col.trim();
      const baseName = trimmedCol || 'Unnamed Column';
      if (colCount[baseName]) {
        colCount[baseName] += 1;
        uniqueCols.push({ id: `${baseName}-${colCount[baseName]}`, label: `${baseName} (${colCount[baseName]})` });
      } else {
        colCount[baseName] = 1;
        uniqueCols.push({ id: `${baseName}-1`, label: baseName });
      }
    });

    return uniqueCols;
  };

  // Handler for importing files
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    const fileExtension = file.name.split('.').pop().toLowerCase();

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      let parsedData = [];
      let parsedColumns = [];

      if (fileExtension === 'csv') {
        // Attempt to parse with headers
        const result = Papa.parse(bstr, { header: true, skipEmptyLines: true });

        if (result.meta && result.meta.fields && result.meta.fields.length > 0) {
          parsedColumns = ensureUniqueColumns(result.meta.fields);
          parsedData = result.data.map((row) => {
            const rowData = {};
            parsedColumns.forEach((col) => {
              rowData[col.id] = row[col.label] || '';
            });
            return rowData;
          });
        } else {
          // No headers detected; parse without headers and generate default column names
          const resultNoHeader = Papa.parse(bstr, { header: false, skipEmptyLines: true });
          const rows = resultNoHeader.data;

          if (rows.length > 0) {
            const numCols = rows[0].length;
            const defaultLabels = Array.from({ length: numCols }, (_, i) => `col ${i + 1}`);
            parsedColumns = ensureUniqueColumns(defaultLabels);
            parsedData = rows.map((row) => {
              const rowData = {};
              parsedColumns.forEach((col, idx) => {
                rowData[col.id] = row[idx] || '';
              });
              return rowData;
            });
          }
        }
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        if (jsonData.length > 0) {
          const firstRow = jsonData[0];
          const hasHeaders = firstRow.every(cell => typeof cell === 'string' && cell.trim() !== '');

          if (hasHeaders) {
            parsedColumns = ensureUniqueColumns(firstRow);
            parsedData = jsonData.slice(1).map((row) => {
              const rowData = {};
              parsedColumns.forEach((col, idx) => {
                rowData[col.id] = row[idx] || '';
              });
              return rowData;
            });
          } else {
            // No headers detected; generate default column names
            const numCols = firstRow.length;
            const defaultLabels = Array.from({ length: numCols }, (_, i) => `col ${i + 1}`);
            parsedColumns = ensureUniqueColumns(defaultLabels);
            parsedData = jsonData.map((row) => {
              const rowData = {};
              parsedColumns.forEach((col, idx) => {
                rowData[col.id] = row[idx] || '';
              });
              return rowData;
            });
          }
        }
      } else {
        alert('Unsupported file format');
        return;
      }

      // Handle cases where parsedColumns might still be empty
      if (!parsedColumns || parsedColumns.length === 0) {
        // Attempt to determine the number of columns from data
        if (parsedData.length > 0) {
          const numCols = Math.max(...parsedData.map(row => Object.keys(row).length));
          const defaultLabels = Array.from({ length: numCols }, (_, i) => `col ${i + 1}`);
          parsedColumns = ensureUniqueColumns(defaultLabels);
          // Update existing rows with new column names
          parsedData = parsedData.map(row => {
            const rowData = {};
            parsedColumns.forEach((col, idx) => {
              rowData[col.id] = row[col.label] || '';
            });
            return rowData;
          });
        } else {
          alert('No data found in the file.');
          return;
        }
      }

      setColumns(parsedColumns);
      setData(parsedData);
    };

    if (fileExtension === 'csv') {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  // Handler for exporting files
  const handleExport = (format) => {
    if (format === 'csv') {
      exportToCSV();
    } else if (format === 'xlsx') {
      exportToExcel();
    }
  };

  // Export data to CSV
  const exportToCSV = () => {
    if (columns.length === 0 || data.length === 0) {
      alert('No data available to export.');
      return;
    }

    // Prepare data with headers
    const headers = columns.map(col => col.label);
    const csvData = data.map(row => {
      return columns.map(col => row[col.id]);
    });
    csvData.unshift(headers);

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'exported_data.csv');
  };

  // Export data to Excel
  const exportToExcel = () => {
    if (columns.length === 0 || data.length === 0) {
      alert('No data available to export.');
      return;
    }

    // Prepare data with headers
    const headers = columns.map(col => col.label);
    const excelData = data.map(row => {
      return columns.map(col => row[col.id]);
    });
    excelData.unshift(headers);

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const wbout = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'exported_data.xlsx');
  };

  return (
    <html lang="en">
      <head>
        <title>Data Manager App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <CssBaseline />
        <Navbar onImport={handleImport} onExport={handleExport} />
        <Container>
          <Typography variant="h4" align="center" sx={{ mt: 5 }}>
            Welcome to Data Manager App
          </Typography>
          <DataTable
            data={data}
            columns={columns}
            setData={setData}
            setColumns={setColumns}
          />
          {children}
        </Container>
      </body>
    </html>
  );
}
