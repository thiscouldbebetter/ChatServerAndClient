
class Movable
{
	constructor(name, defnName, spaceName)
	{
		this.name = name;
		this.defnName = defnName;
		this.spaceName = spaceName;

		this.id = Movable.idNext();
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

	defn(tabletop)
	{
		return tabletop.defn.movableDefnbyName(this.defnName);
	}

	describe(tabletop)
	{
		return this.defn(tabletop).describe(tabletop, this);
	}

	moveToSpace(tabletop, spaceToMoveTo)
	{
		this.remove(tabletop);
		spaceToMoveTo.movableAdd(this);
	}

	moveToSpaceWithName(tabletop, spaceToMoveToName)
	{
		var space = tabletop.spaceByName(spaceToMoveToName);
		this.moveToSpace(tabletop, space);
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
