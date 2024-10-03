// src/app/components/DataTable.js
'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
} from '@mui/material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';

const DataTable = ({ data, columns, setData, setColumns }) => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');

  // Initialize sensors for DnD
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load layout from localStorage on mount
  useEffect(() => {
    const savedColumns = localStorage.getItem('columns');
    if (savedColumns) {
      setColumns(JSON.parse(savedColumns));
    }
  }, [setColumns]);

  // Save layout to localStorage whenever columns change
  useEffect(() => {
    localStorage.setItem('columns', JSON.stringify(columns));
  }, [columns]);

  // Handle drag end event
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = columns.findIndex((col) => col.id === active.id);
      const newIndex = columns.findIndex((col) => col.id === over.id);
      const newColumns = arrayMove(columns, oldIndex, newIndex);
      setColumns(newColumns);
    }
  };

  // Handle sorting
  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setOrder(newOrder);
    setOrderBy(columnId);
  };

  // Handle editing column names
  const handleEditColumn = (columnId, newLabel) => {
    const updatedColumns = columns.map((col) =>
      col.id === columnId ? { ...col, label: newLabel } : col
    );
    setColumns(updatedColumns);
  };

  // Reset layout to original state
  const resetLayout = () => {
    localStorage.removeItem('columns');
    window.location.reload();
    // Clear localStorage if used
  };

  // Undo header detection: Move current headers back to data and reset columns to defaults
  const undoHeaderDetection = () => {
    if (columns.length === 0) return;

    // Create a new data row with current column labels
    const headerRow = {};
    columns.forEach((col) => {
      headerRow[col.id] = col.label;
    });

    // Prepend the header row to data
    const newData = [headerRow, ...data];
    setData(newData);

    // Reset columns to default names
    const defaultColumns = columns.map((col, index) => ({
      id: `col-${index + 1}`,
      label: `col ${index + 1}`,
    }));
    setColumns(defaultColumns);
    // Reset sorting
    setOrder('asc');
    setOrderBy('');
  };

  // Promote the first data row to headers
  const handleUseFirstRowAsHeaders = () => {
    if (data.length === 0) return;

    const firstRow = data[0];
    console.log('first row', firstRow);
    const newColumns = Object.keys(firstRow).map((key, index) => ({
      id: key, // Use the actual key for sorting consistency
      label: firstRow[key] || `col ${index + 1}`,
    }));

    const newData = data.slice(1);

    setColumns(newColumns);
    setData(newData);
    // Reset sorting
    setOrder('asc');
    setOrderBy('');
  };

  // Ensure `orderBy` corresponds to a valid column
  useEffect(() => {
    if (columns.length > 0) {
      if (!columns.some((col) => col.id === orderBy)) {
        setOrder('asc');
        setOrderBy(columns[0].id);
      }
    }
  }, [columns, orderBy]);

  // Apply sorting whenever `order` or `orderBy` changes
  useEffect(() => {
    if (orderBy) {
      const sortedData = [...data].sort((a, b) => {
        const aValue = a[orderBy] || '';
        const bValue = b[orderBy] || '';
        if (aValue < bValue) return order === 'asc' ? -1 : 1;
        if (aValue > bValue) return order === 'asc' ? 1 : -1;
        return 0;
      });
      setData(sortedData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, orderBy]);

  return (
    <>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Data Table
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="outlined" color="secondary" onClick={resetLayout}>
          Reset Layout
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={undoHeaderDetection}
          disabled={columns.length === 0}
        >
          Undo Header Detection
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleUseFirstRowAsHeaders}
          disabled={data.length === 0}
        >
          Use First Row as Headers
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={columns.map((col) => col.id)}
            strategy={horizontalListSortingStrategy}
          >
            <Table sx={{ minWidth: 650 }} aria-label="data table">
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <SortableItem
                      key={col.id}
                      id={col.id}
                      label={col.label}
                      onEdit={handleEditColumn}
                      onSort={handleSort}
                      order={order}
                      orderBy={orderBy}
                    />
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length > 0 ? (
                  data.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map((col) => (
                        <TableCell key={col.id}>{row[col.id]}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      No data available. Please import a CSV or Excel file.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </SortableContext>
        </DndContext>
      </TableContainer>
    </>
  );
};

export default DataTable;
