# 0.0.3

## CODEBASE
- Updated build scripts
- Added config options for debugging, control and graphics defaults, and entity behavior
- Added keyboard code definitions
- CursorHelper now handles cursor events and emissions (why?)
- changed BlockFactory.recallBlockData to BlockFactory.restateBlockData (deserialization)
- changed BlockData.variant to BlockData.uniqueData for lack of a better name
- camera now follows the camera anchor instead of some mythical "player" entity. There's representation of a player in this game. it's a freaking colony sim.
- Entitys now can handle their own mesh construction
- EntityActors exist now
- The framework for ActorBehaviors now exist
- More (failed) attempts at proper serialization
- Global events are handled under the SuperHooks structure (why?)


# 0.0.2

## CODEBASE
- Delegated world loading and handling to GameController
- TODO: Delegate world loading to GameSession
- Changed world.player to world.cameraAnchor
- Added Verboosie and Verbose.log to organize logging
- Moved IMR handling to RegionDisplayBehavior
- Moved collection objects to their own subdirectory under /utils

# 0.0.1
*This is to keep a record of changes to the core codebase*

## GAMEPLAY
- none

## CODEBASE
- Added changelog.md
- Changed valuesScope to valuesScopeRef to reflect the identifier's purpose
- Added a main config location. *Future constant values should be placed here*
- Migrated controls to ControlRouter, ControlBehavior, CursorBehavior. *To delegate the action responsibilities of user inputs based on game-state*
- Added BlockBoundingBox
- Added failsafes to TaskDenominators. *TickTasks now have a limit on how many times they can fail before they are ignored by the TickScheduler*
- Added TickAnalytics. *The TickScheduler can now enable analytics for certain ScheduledTickTasks*
- Added boundingBox to Block abstract class
- Changed BlockVariantData.data from an integer an object. *This was to accompany the storage of block rotation data*
- All BlockData now contains a rotation property. *It is a float that represents the block's vertical axis rotation in radians*
- Entity absract class now has a addToWorld method, invoked when the entity is *added to the world*.
- SimonsWorld controls have been moved
- ControlRouter performs a tick before rendering.
- World has a new method, getBlockModelTransform, which returns a vector4 describing a blocks rendered transformation.*This is used by the renderer and also by the cursor to mimic ray tracing with a cursor*. *I know it's a hack, but what can I do when the THREE library doesn't want to cooperate?*
- GLTFModels now support a static "shadow"
- IndividualModels added. *IndividualModels are models that cannot be instanced. These models should be used sparingly since they can cause significant rendering performance issues.*
- Models now have the option of having a raycastable. A raycastable allows precise cursor interaction with a model. For models where no raycastable is needed, there is a flag in ModelOptions that can be set to true named "noRaycasting".
- UniformModels updated to accompany the addition of static shadows.
- Hello my name is naka gaming
- ModelRegistry updated to detect discriminators in model names
- Created AlwaysMap, which is a map that will always return a valid value.
- Bloons tower defense 2 is the most revolutionary game of our generation.
- Updated Electron to display the window ion kisok mode.