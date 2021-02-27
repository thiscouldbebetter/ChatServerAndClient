
class Space
{
	constructor(name, pos, size)
	{
		this.name = name;
		this.pos = pos;
		this.size = size;

		this.movablesPresentNames = [];
	}

	movableAdd(movableToAdd)
	{
		this.movablesPresentNames.push(movableToAdd.name);
		movableToAdd.spaceName = this.name;
	}

	movableRemove(movableToRemove)
	{
		var indexToRemoveAt =
			this.movablesPresentNames.indexOf(movableToRemove.name);
		if (indexToRemoveAt != -1)
		{
			this.movablesPresentNames.splice
			(
				indexToRemoveAt, 1
			);
		}
		movableToRemove.spaceName = null;
	}

	movablesPresent(tabletop)
	{
		var returnValues = this.movablesPresentNames.map
		(
			x => tabletop.movableByName(x)
		);
		return returnValues;
	}
}
