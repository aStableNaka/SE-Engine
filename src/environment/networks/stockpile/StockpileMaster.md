# ItemData attributes
+ ItemData.stockpile: Stockpile	*Used only when inside a stockpile*
+ ItemData.position: Vector2		*Used only when outside of stockpile*
+ ItemData.carrier: ActorEntity	*Used only when carried by an actor*
+ ItemData.unique: number		*A unique number assigned on construction*
+ ItemData.isAvailable: Boolean	*Used as a check to make sure no two actors try using the same itemdata at once. Used only if active ItemData.carrier*

# Stockpile attrbutes
+ Stockpile.itemMap: Map<itemID,ItemData[]>
+ Stockpile.items: ItemData[]
+ Stockpile.priority: number

# StockpileMaster attributes
+ StockpileMaster.itemMap: Map<itemID,ItemData[]>
+ StockpileMaster.itemAccumulation: Map<itemID,number>
+ StockpileMaster.stockpiles: Stockpile[]				*Sorted by priority*
+ StockpileMaster.global: ItemData[];

# Workshop attributrs
+ Workshop.stockpileFilter: Stockpile[]

# StockpileMaster
	The endpoint for high-level interactions with stockpiles

	High level in this case being the organization and locationation of stockpiles as well
	as providing tools to ensure smooth stockpile transactions

# Considerations
	- Prevent item access collisions

# Use cases
	- 1) Locating an item that can be in any one of the stockpiles on the map
	- 2) Preventing two actors from accessing the same item at the same time
	- 3) Providing instructions to actors for performing high-level operations on potentially many stockpiles
	- 4) Accounting for every item on the map and sorting appropriately to ensure fast locatability
	- 5) Merging ItemData to sort out a stockpile's capacity

# Data structures for various scenarios

### 1) Locating an item that can potentially be inside any stockpile on the map

#### Restrictions
	- All stockpile operations must done through the StockpileMaster
	- Insert and takeout operations must be recorded by the StockpileMaster
	- All item construction and deconstruction must be done through the StockpileMaster

#### Data Structure
*HashMap*:
	- Each unique item type will have an entry within the StockpileMaster's ItemHashmap. Each entry stores an array of ItemData, all instances of the same item type.
		+ O(n)
	- Insertion and takeout will modify the ItemData, changing the ItemData's values and references to reflect any changes. Ex. Position, Carrier reference or stockpile references.
	- Construction of an itemData will insert the itemData into the appropriate ItemHashMap entry array.
	- Construction and deconstruction of itemData will update itemAccumulation which tallys the amount of items on the map

*Priority Stockpiles*
	- Each stockpile will be stored in an array, sorted by the priority of the stockpile.
	- Insertion and takeouts from a stockpile will prioritize stockpiles with higher priority values, unless modified by any of the following
		- Workshop stockpile filter
	- For stockpiles with the same priority, the stockpile closest to the actor will be prioritized.

### 2) Preventing two actors from accessing the same item at the same time

#### Solution
	- Add a check for ItemData.isAvailable that marks the item as unavailable
	- Prevent access of ItemData by any actors other than the current holder of the ItemData if the check is met

### 3) Providing instructions to actors for performing high-level operations on potentially many stockpiles

#### Restrictions
	- Entities must know what they need beforehand
	- The stockpilemaster will locate the items that the entity needs and will reserve them for the entity to use
	- Searching for the items will follow this priority
		- Stockpile priority
		- World
	