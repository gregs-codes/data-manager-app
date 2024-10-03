// src/app/components/SortableItem.js
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  TableCell,
  TableSortLabel,
  IconButton,
  TextField,
  Box,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

export const SortableItem = ({ id, label, onEdit, onSort, order, orderBy }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    // Do not set display: 'flex' here
  };

  const [isEditing, setIsEditing] = React.useState(false);
  const [editedLabel, setEditedLabel] = React.useState(label);

  const handleSave = () => {
    onEdit(id, editedLabel);
    setIsEditing(false);
  };

  return (
    <TableCell ref={setNodeRef} style={style} {...attributes}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {/* Drag Handle */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', mr: 1, cursor: 'grab' }}
          {...listeners}
        >
          <DragIndicatorIcon />
        </Box>
        
        {/* Sortable Label and Edit Button */}
        {isEditing ? (
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <TextField
              value={editedLabel}
              onChange={(e) => setEditedLabel(e.target.value)}
              size="small"
              variant="standard"
              sx={{ mr: 1 }}
            />
            <IconButton size="small" onClick={handleSave}>
              <SaveIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <TableSortLabel
              active={orderBy === id}
              direction={orderBy === id ? order : 'asc'}
              onClick={() => onSort(id)}
              sx={{ flexGrow: 1 }}
            >
              {label}
            </TableSortLabel>
            <IconButton size="small" onClick={() => setIsEditing(true)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
    </TableCell>
  );
};
