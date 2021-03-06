
class SpaceDefn
{
	constructor(name, show, describe)
	{
		this.name = name;
		this.show = show;
		this.describe = describe;
	}

	static byName(nameToFind)
	{
		if (SpaceDefn._instancesByName == null)
		{
			var spaceDefns =
			[
				new SpaceDefn
				(
					"Default",
					SpaceDefn.show_Default,
					(tabletop, space) =>
					{
						var description = "Space: " + space.name + ", Movables: ";
						var movables = space.movablesPresent(tabletop);
						var movablesAsStrings = movables.map(x => x.name);
						description += movablesAsStrings.join(", ");
						return description;
					}
				),
				new SpaceDefn
				(
					"GroupedByName",
					SpaceDefn.show_GroupedByName,
					(tabletop, space) => "A space showing groups."
				)
			];

			var spaceDefnsByName = new Map();
			spaceDefns.forEach(x => spaceDefnsByName.set(x.name, x));

			SpaceDefn._instancesByName = spaceDefnsByName;
		}

		var returnValue = SpaceDefn._instancesByName.get(nameToFind);

		return returnValue;
	}

	// Show.

	static show_Default(tabletop, space, rowsAsStrings)
	{
		var movablesPresent = space.movablesPresent(tabletop);
		var movableNames = movablesPresent.map(x => x.name);
		SpaceDefn.writeStringsIntoSpaceAndOverStrings(movableNames, space, rowsAsStrings);
	}

	static show_GroupedByName(tabletop, space, rowsAsStrings)
	{
		var movablesPresent = space.movablesPresent(tabletop);
		var movableCountsByName = new Map();
		movablesPresent.forEach
		(
			movable =>
			{
				var movableName = movable;
				if (movableCountsByName.has(movableName) == false)
				{
					movableCountsByName.set(movableName, 0);
				}
				var movableCount = movableCountsByName.get(movableName);
				movableCount += 1;
				movableCountsByName.set(movableName, movableCount);
			}
		);
		var movableNames = [...movableCountsByName.keys()];
		var movableNamesAndCountsAsStrings = movableNames.map
		(
			x => x + ":" + movableCountsByName.get(x)
		);
		SpaceDefn.writeStringsIntoSpaceAndOverStrings
		(
			movableNamesAndCountsAsStrings, space, rowsAsStrings
		);
	}

	// Helpers.

	static writeStringsIntoSpaceAndOverStrings
	(
		stringsToWrite, space, stringsToBeOverwritten
	)
	{
		var offsetOfMovableWithinSpace = new Coords(1, 1);

		var spacePos = space.pos;
		var spaceSize = space.size;

		var offsetWithinString = spacePos.x + offsetOfMovableWithinSpace.x;
		var linesInSpace = spaceSize.y - 1; // For border.
		var linesOverflow = stringsToWrite.length - linesInSpace;
		var areThereMoreLinesThanSpace = (linesOverflow > 0);
		var iMax = (areThereMoreLinesThanSpace ? linesInSpace - 1 : stringsToWrite.length);

		for (var i = 0; i < iMax; i++)
		{
			var stringToWrite = stringsToWrite[i];
			var stringIndex =
				spacePos.y + i + offsetOfMovableWithinSpace.y;

			SpaceDefn.overwriteStringIntoStringArrayAtIndexAndOffset
			(
				stringToWrite, stringsToBeOverwritten, stringIndex, offsetWithinString
			);
		}

		if (areThereMoreLinesThanSpace)
		{
			var plusMoreText = "[+" + (linesOverflow + 1) + "]";
			SpaceDefn.overwriteStringIntoStringArrayAtIndexAndOffset
			(
				plusMoreText, stringsToBeOverwritten,
				spacePos.y + offsetOfMovableWithinSpace.y + spaceSize.y - 2,
				offsetWithinString
			);
		}
	}

	static overwriteStringIntoStringArrayAtIndexAndOffset
	(
		stringToWrite, stringsToBeOverwritten, stringIndex, offsetWithinString
	)
	{
		var stringToUpdate = stringsToBeOverwritten[stringIndex];
		var stringUpdated =
			stringToUpdate.substr
			(
				0, offsetWithinString
			)
			+ stringToWrite
			+ stringToUpdate.substr
			(
				offsetWithinString
				+ stringToWrite.length
			);
		stringsToBeOverwritten[stringIndex] = stringUpdated;
	}
}
