// src/app/components/SortableItem.js
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const SortableItem = ({ id, label, onEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isDragging ? '#f0f0f0' : 'inherit',
    cursor: 'grab',
  };

  return (
    <TableCell ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <IconButton size="small" sx={{ mr: 1, cursor: 'grab' }}>
          <DragIndicatorIcon />
        </IconButton>
        <EditableHeader label={label} onEdit={(newLabel) => onEdit(id, newLabel)} />
      </div>
    </TableCell>
  );
};

const EditableHeader = ({ label, onEdit }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [currentLabel, setCurrentLabel] = React.useState(label);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onEdit(currentLabel.trim() || 'Unnamed Column');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      onEdit(currentLabel.trim() || 'Unnamed Column');
    }
  };

  return isEditing ? (
    <input
      type="text"
      value={currentLabel}
      onChange={(e) => setCurrentLabel(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      autoFocus
      style={{
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '2px 4px',
        width: '100%',
      }}
    />
  ) : (
    <span onDoubleClick={handleDoubleClick} style={{ flexGrow: 1 }}>
      {label}
    </span>
  );
};

export { SortableItem };
