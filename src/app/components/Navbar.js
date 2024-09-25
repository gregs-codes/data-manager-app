// src/components/Navbar.js
'use client';

import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import BoxMUI from '@mui/material/Box';
import Input from '@mui/material/Input';

const Navbar = ({ onImport, onExport }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openExportModal, setOpenExportModal] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenExport = () => {
    setOpenExportModal(true);
    handleCloseMenu();
  };

  const handleCloseExport = () => setOpenExportModal(false);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Data Manager
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button color="inherit" component="label">
              Import
              <Input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={onImport}
                sx={{ display: 'none' }}
              />
            </Button>
            <Button color="inherit" onClick={handleOpenExport}>
              Export
            </Button>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem>
                <Button
                  color="inherit"
                  component="label"
                  sx={{ width: '100%' }}
                >
                  Import
                  <Input
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={onImport}
                    sx={{ display: 'none' }}
                  />
                </Button>
              </MenuItem>
              <MenuItem onClick={handleOpenExport}>Export</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Export Modal */}
      <Modal
        open={openExportModal}
        onClose={handleCloseExport}
        aria-labelledby="export-modal-title"
        aria-describedby="export-modal-description"
      >
        <BoxMUI
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 300,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
          }}
        >
          <Typography id="export-modal-title" variant="h6" component="h2">
            Export Options
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button variant="contained" onClick={() => onExport('csv')}>
              Export as CSV
            </Button>
            <Button variant="contained" onClick={() => onExport('xlsx')}>
              Export as Excel
            </Button>
          </Box>
        </BoxMUI>
      </Modal>
    </Box>
  );
};

export default Navbar;
