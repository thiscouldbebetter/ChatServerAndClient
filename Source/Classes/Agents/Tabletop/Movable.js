
class Movable
{
	constructor(name, spaceName)
	{
		this.id = Movable.idNext();
		this.name = name;
		this.spaceName = spaceName;
	}

	static idNext()
	{
		if (Movable._idNext == null)
		{
			Movable._idNext = 0;
		}
		Movable._idNext++;
		return Movable._idNext;
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
