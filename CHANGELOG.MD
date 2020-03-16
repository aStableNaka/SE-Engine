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
- 