import { Button } from "@mui/material";
import { useDispatch } from "react-redux";
import React, { useEffect } from "react";
import { setDirectories } from "../../lib/state/reducer";
import { openFolder } from "../../lib/utils/fileSystem";
import { connect } from "react-redux";
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TreeItem, { useTreeItem } from "@mui/lab/TreeItem";

interface PanelProps {
  state: any;
}

const RecursiveComponent = ({ name, items }) => {
  console.log(items);
  const hasChildren = items && items;
  console.log(hasChildren)

  return (
    <>
      <TreeItem nodeId={name} label={name} className="mt-1" key={name}>
        {hasChildren &&
          items.map((item) => <RecursiveComponent key={item.name} {...item} />)}
      </TreeItem>
    </>
  );
};

export const Explorer: React.FC<PanelProps> = ({ state }) => {
  const dispatch = useDispatch();
  async function onFolderSelect() {
    const folders = await openFolder();
    dispatch(setDirectories(folders));
  }
  return (
    <div className="mt-5 px-4 text-sm">
      {state && Object.keys(state).length ? (
        <TreeView
          aria-label="file system navigator"
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          sx={{ flexGrow: 1, maxWidth: 400, overflowY: "auto" }}
        >
          <RecursiveComponent {...state} />
        </TreeView>
      ) : (
        <div>
          <p>You have not yet added a folder to the workspace.</p>
          <Button className="mt-4" onClick={onFolderSelect}>
            Open Folder
          </Button>
        </div>
      )}
    </div>
  );
};

interface State {
  state: Object;
  app: any;
}
function mapStateToProps(state: State) {
  return {
    state: state.app.directories,
  };
}
export default connect(mapStateToProps, null)(Explorer);
