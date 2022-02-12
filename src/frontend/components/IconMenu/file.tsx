import FileNew from '@mui/icons-material/AddBox';
import FileOpen from '@mui/icons-material/OpenInNew';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import SaveIcon from '@mui/icons-material/Save';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import React, { useState } from "react";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Typography from "@mui/material/Typography";
import Paper from '@mui/material/Paper';
import { openFile, openNewFile, saveNotebookToFileSystem } from "../../lib/FileSystem/fileSystem";
import { addNotebook, setActiveNotebookTabNumber, updateActiveNotebookName } from "../../lib/state/reducer"
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../lib/typings/types';

export default function FileMenu() {
  const dispatch = useDispatch()
  const { activeNotebookTabNumber, notebooks, activeNotebookName } = useSelector((state: { app: AppState }) => state.app)

  const handleOpenNewFile = async () => {
    const newNotebook = await openNewFile()
    dispatch(addNotebook(newNotebook))
    dispatch(setActiveNotebookTabNumber(activeNotebookTabNumber + 1))
    dispatch(updateActiveNotebookName(newNotebook.name));

  }

  const handleOpenExistingFile = async () => {
    const notebook = await openFile();
    dispatch(addNotebook(notebook))
    dispatch(setActiveNotebookTabNumber(activeNotebookTabNumber + 1))
    dispatch(updateActiveNotebookName(notebook.name))

  }

  const handleSaveFile = async () => {
    const currentNotebook = notebooks[activeNotebookName]
    const fileHandle = currentNotebook.metadata?.fileHandle
    const contents = JSON.stringify(currentNotebook)
    await saveNotebookToFileSystem(fileHandle, contents)
  }

  return (
    <Paper sx={{ width: 320, maxWidth: '100%' }}>
      <MenuList>
        <MenuItem onClick={() => handleOpenNewFile()}>
          <ListItemIcon>
            <FileNew fontSize="small" />
          </ListItemIcon>
          <ListItemText>New</ListItemText>
          <Typography variant="body2" color="text.secondary">
            ⌘N
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleOpenExistingFile()}>
          <ListItemIcon>
            <FileOpen fontSize="small" />
          </ListItemIcon>
          <ListItemText>Open</ListItemText>
          <Typography variant="body2" color="text.secondary">
            ⌘O
          </Typography>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <DriveFileRenameOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename Notebook</ListItemText>
          <Typography variant="body2" color="text.secondary">
            ⌘R
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleSaveFile()}>
          <ListItemIcon>
            <SaveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Save Notebook</ListItemText>
          <Typography variant="body2" color="text.secondary">
            ⌘S
          </Typography>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <SaveAltIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
          <Typography variant="body2" color="text.secondary">
            ⌘D
          </Typography>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <ImportExportIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export Notebook as ...</ListItemText>
          <Typography variant="body2" color="text.secondary">
            ⌘DE
          </Typography>
        </MenuItem>
      </MenuList>
    </Paper>
  );
};
