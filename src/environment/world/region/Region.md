# Region Load States
### Uninstantiated
When the region is delcared to exist, but the contents and mesh are not yet loaded/generated

### Instantiated
When the region's contents and mesh are is available for use and modification

### Displayed / Loaded
When a region's mesh is rendered and appears on the player's screen

### Hidden / Unloaded
When a region's mesh is no longer rendered, but still performs tick tasks

### Disposed
When a region's content and mesh is destroyed and no longer available for use unless re-instantialzed;


# Region Rendering
Whenever a block gets placed, the region will reconstruct the mesh group belonging to said block.