
class Space
{
	constructor(name, pos, size)
	{
		this.name = name;
		this.pos = pos;
		this.size = size;

		this.movablesPresentIds = [];
	}

	movableAdd(movableToAdd)
	{
		this.movablesPresentIds.push(movableToAdd.id);
		movableToAdd.spaceName = this.name;
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
}
