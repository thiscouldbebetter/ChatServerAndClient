
class TabletopDefn
{
	constructor(name, userCountMax, backgroundAsStrings, spaceDefns, movableDefns)
	{
		this.name = name;
		this.userCountMax = userCountMax;
		this.backgroundAsStrings = backgroundAsStrings;
		this.spaceDefns = spaceDefns;
		this.movableDefns = movableDefns;

		this.spaceDefnsByName = new Map(this.spaceDefns.map( x => [x.name, x] ) );
		this.movableDefnsByName = new Map(this.movableDefns.map( x => [x.name, x] ) );
	}

	movableDefnByName(name)
	{
		return this.movableDefnsByName.get(name);
	}

	spaceDefnByName(name)
	{
		return this.spaceDefnsByName.get(name);
	}
}
