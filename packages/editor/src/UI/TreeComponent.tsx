import {
    __experimentalTreeGrid as TreeGrid,
    __experimentalTreeGridRow as TreeGridRow,
    __experimentalTreeGridCell as TreeGridCell,
    Button
} from "@wordpress/components";

function TreeComponent() {
  return (
      <TreeGrid>
          <TreeGridRow level={ 1 } positionInSet={ 1 } setSize={ 2 }>
              <TreeGridCell>
                  { ( props ) => (
                      <Button  { ...props }>Select</Button>
                  ) }
              </TreeGridCell>
              <TreeGridCell>
                  { ( props ) => (
                      <Button  { ...props }>Move</Button>
                  ) }
              </TreeGridCell>
          </TreeGridRow>
          <TreeGridRow level={ 1 } positionInSet={ 2 } setSize={ 2 }>
              <TreeGridCell>
                  { ( props ) => (
                      <Button  { ...props }>Select</Button>
                  ) }
              </TreeGridCell>
              <TreeGridCell>
                  { ( props ) => (
                      <Button  { ...props }>Move</Button>
                  ) }
              </TreeGridCell>
          </TreeGridRow>
          <TreeGridRow level={ 2 } positionInSet={ 1 } setSize={ 1 }>
              <TreeGridCell>
                  { ( props ) => (
                      <Button  { ...props }>Select</Button>
                  ) }
              </TreeGridCell>
              <TreeGridCell>
                  { ( props ) => (
                      <Button  { ...props }>Move</Button>
                  ) }
              </TreeGridCell>
          </TreeGridRow>
      </TreeGrid>
    );
}

export default TreeComponent;