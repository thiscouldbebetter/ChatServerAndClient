
class Space
{
	constructor(name, defnName, pos, size)
	{
		this.name = name;
		this.defnName = defnName;
		this.pos = pos;
		this.size = size;

		this.movablesPresentIds = [];
	}

	defn(tabletop)
	{
		return tabletop.defn.spaceDefnByName(this.defnName);
	}

	describe(tabletop)
	{
		return this.defn(tabletop).describe(tabletop, this);
	}

	movableAdd(movableToAdd)
	{
		this.movablesPresentIds.push(movableToAdd.id);
		movableToAdd.spaceName = this.name;
	}

	movablesDistributeToSpacesWithNames(tabletop, spaceNames, roundsMax)
	{
		var roundsSoFar = 0;
		while
		(
			(roundsMax == null || roundsSoFar < roundsMax)
			&&
			this.movablesPresentIds.length > 0
		)
		{
			for (var s = 0; s < spaceNames.length; s++)
			{
				var movableCount = this.movablesPresentIds.length;
				if (movableCount <= 0)
				{
					break;
				}
				else
				{
					var spaceName = spaceNames[s];
					var movableId =
						this.movablesPresentIds[movableCount - 1];
					var movable = tabletop.movableById(movableId);
					movable.moveToSpaceWithName(tabletop, spaceName);
				}
			}
			roundsSoFar++;
		}
	}

	movableRemove(movableToRemove)
	{
		var indexToRemoveAt =
			this.movablesPresentIds.indexOf(movableToRemove.id);
		if (indexToRemoveAt != -1)
		{
			this.movablesPresentIds.splice
			(
				indexToRemoveAt, 1
			);
		}
		movableToRemove.spaceName = null;
	}

	movablesPresent(tabletop)
	{
		var returnValues = this.movablesPresentIds.map
		(
			x => tabletop.movableById(x)
		)
		return returnValues;
	}

	movablesShuffle()
	{
		var movableIdsToShuffle = this.movablesPresentIds.slice(0);
		var movableIdsShuffled = [];
		while (movableIdsToShuffle.length > 0)
		{
			var movableIdIndex = Math.floor(Math.random() * movableIdsToShuffle);
			var movableId = movableIdsToShuffle[movableIdIndex];
			movableIdsShuffled.push(movableId);
			movableIdsToShuffle.splice(movableIdIndex, 1);
		}
		this.movablesPresentIds = movableIdsShuffled;
	}

	movablesSort(tabletop)
	{
		this.movablesPresentIds.sort
		(
			(a, b) => tabletop.movableById(b).name - tabletop.movableById(a).name
		);
	}

	show(tabletop, rowsAsStrings)
	{
		var defn = this.defn(tabletop);
		defn.show(tabletop, this, rowsAsStrings);
	}

}
