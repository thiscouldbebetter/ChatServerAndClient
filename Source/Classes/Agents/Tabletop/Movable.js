
class Movable
{
	constructor(name, spaceName)
	{
		this.name = name;
		this.spaceName = spaceName;
	}

	moveToSpace(tabletop, spaceToMoveTo)
	{
		this.remove(tabletop);
		spaceToMoveTo.movableAdd(this);
	}

	remove(tabletop)
	{
		var spaceToMoveFrom = this.space(tabletop);
		if (spaceToMoveFrom != null)
		{
			spaceToMoveFrom.movableRemove(this);
		}
	}

	space(tabletop)
	{
		return tabletop.spaceByName(this.spaceName);
	}
}
