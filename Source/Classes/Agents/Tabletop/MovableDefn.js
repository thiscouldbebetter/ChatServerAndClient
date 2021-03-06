
class MovableDefn
{
	constructor(name, description)
	{
		this.name = name;
		this.description = description;
	}

	static byName(nameToFind)
	{
		if (MovableDefn._instancesByName == null)
		{
			var defns =
			[
				new MovableDefn("Default", "A generic movable."),
			];

			var defnsByName = new Map();
			defns.forEach(x => defnsByName.set(x.name, x));

			MovableDefn._instancesByName = defnsByName;
		}

		var returnValue = MovableDefn._instancesByName.get(nameToFind);

		return returnValue;
	}

	describe(tabletop, movable)
	{
		return this.description;
	}
}
