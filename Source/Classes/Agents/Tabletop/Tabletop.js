
class Tabletop
{
	constructor
	(
		name, userStartingName, userCountMax,
		backgroundAsStrings, spaces, movables
	)
	{
		this.name = name;
		this.userStartingName = userStartingName;
		this.userCountMax = userCountMax;
		this.backgroundAsStrings = backgroundAsStrings;
		this.spaces = spaces;
		this.movables = movables;

		for (var m = 0; m < movables.length; m++)
		{
			var movable = movables[m];
			this.moveMovableWithNameToSpaceWithName
			(
				movable.name, movable.spaceName
			);
		}

		this.usersJoinedNames = [ this.userStartingName ];
	}

	static chess(userStartingName)
	{
		var backgroundAsStrings =
		[
			"+-----+-----+-----+-----+-----+-----+-----+-----+  ",
			"|     |     |     |     |     |     |     |     | 8",
			"|     |     |     |     |     |     |     |     |  ",
			"+-----+-----+-----+-----+-----+-----+-----+-----+  ",
			"|     |     |     |     |     |     |     |     | 7",
			"|     |     |     |     |     |     |     |     |  ",
			"+-----+-----+-----+-----+-----+-----+-----+-----+  ",
			"|     |     |     |     |     |     |     |     | 6",
			"|     |     |     |     |     |     |     |     |  ",
			"+-----+-----+-----+-----+-----+-----+-----+-----+  ",
			"|     |     |     |     |     |     |     |     | 5",
			"|     |     |     |     |     |     |     |     |  ",
			"+-----+-----+-----+-----+-----+-----+-----+-----+  ",
			"|     |     |     |     |     |     |     |     | 4",
			"|     |     |     |     |     |     |     |     |  ",
			"+-----+-----+-----+-----+-----+-----+-----+-----+  ",
			"|     |     |     |     |     |     |     |     | 3",
			"|     |     |     |     |     |     |     |     |  ",
			"+-----+-----+-----+-----+-----+-----+-----+-----+  ",
			"|     |     |     |     |     |     |     |     | 2",
			"|     |     |     |     |     |     |     |     |  ",
			"+-----+-----+-----+-----+-----+-----+-----+-----+  ",
			"|     |     |     |     |     |     |     |     | 1",
			"|     |     |     |     |     |     |     |     |  ",
			"+-----+-----+-----+-----+-----+-----+-----+-----+  ",
			"   a     b     c     d     e     f     g     h     "
		];

		var spaces = [];
		var spaceSizeInCells = new Coords(6, 3);
		var boardSizeInSpaces = new Coords(8, 8);
		for (var y = 0; y < boardSizeInSpaces.y; y++)
		{
			for (var x = 0; x < boardSizeInSpaces.x; x++)
			{
				var spaceName =
					String.fromCharCode("a".charCodeAt(0) + x)
					+ (boardSizeInSpaces.y - y);
				var spacePosInSpaces = new Coords(x, y);
				var spacePosInCells =
					spacePosInSpaces.clone().multiply(spaceSizeInCells);
				var space = new Space
				(
					spaceName, spacePosInCells, spaceSizeInCells
				);
				spaces.push(space);
			}
		}

		var movables =
		[
			// black

			new Movable("br1", "a8"), // rook
			new Movable("bn1", "b8"), // knight
			new Movable("bb1", "c8"), // bishop
			new Movable("bq", "d8"), // queen
			new Movable("bk", "e8"), // king
			new Movable("bb2", "f8"),
			new Movable("bn2", "g8"),
			new Movable("br2", "h8"),

			new Movable("bp1", "a7"), // pawn
			new Movable("bp2", "b7"),
			new Movable("bp3", "c7"),
			new Movable("bp4", "d7"),
			new Movable("bp5", "e7"),
			new Movable("bp6", "f7"),
			new Movable("bp7", "g7"),
			new Movable("bp8", "h7"),

			// white

			new Movable("wp1", "a2"),
			new Movable("wp2", "b2"),
			new Movable("wp3", "c2"),
			new Movable("wp4", "d2"),
			new Movable("wp5", "e2"),
			new Movable("wp6", "f2"),
			new Movable("wp7", "g2"),
			new Movable("wp8", "h2"),

			new Movable("wr1", "a1"),
			new Movable("wn1", "b1"),
			new Movable("wb1", "c1"),
			new Movable("wq", "d1"),
			new Movable("wk", "e1"),
			new Movable("wb2", "f1"),
			new Movable("wn2", "g1"),
			new Movable("wr2", "h1"),
		];

		var returnValue = new Tabletop
		(
			"Chess",
			userStartingName,
			2, // userCountMax
			backgroundAsStrings,
			spaces,
			movables
		);

		return returnValue;
	}

	closeToNewUsers()
	{
		this._isClosedToNewUsers = true;
	}

	isClosedToNewUsers()
	{
		return this._isClosedToNewUsers;
	}

	isMoveAllowedForMovableNameAndSpaceName(movableName, spaceName)
	{
		return true; // todo
	}

	movableByName(movableToFindName)
	{
		return this.movables.filter(x => x.name == movableToFindName)[0];
	}

	movableWithNameAddToSpaceWithName(movableName, spaceName)
	{
		var wasSuccessful = false;

		var doesMovableWithSameNameExist =
			this.movables.some(x => x.name == movableName);
		var spaceToMoveTo = this.spaces.filter(x => x.name == spaceName)[0];

		if (doesMovableWithSameNameExist == false && spaceToMoveTo != null)
		{
			var movable = new Movable(movableName);
			this.movables.push(movable);
			movable.moveToSpace(this, spaceToMoveTo);
			wasSuccessful = true;
		}

		return wasSuccessful;
	}

	moveMovableWithNameToSpaceWithName(movableName, spaceName)
	{
		var wasSuccessful = false;

		var movableToMove = this.movables.filter(x => x.name == movableName)[0];
		var spaceToMoveTo = this.spaces.filter(x => x.name == spaceName)[0];

		if (movableToMove != null && spaceToMoveTo != null)
		{
			var isMoveAllowed =
				this.isMoveAllowedForMovableNameAndSpaceName(movableName, spaceName);
			if (isMoveAllowed)
			{
				movableToMove.moveToSpace(this, spaceToMoveTo);
				wasSuccessful = true;
			}
		}

		return wasSuccessful;
	}

	removeMovableWithName(movableName)
	{
		var wasSuccessful = false;

		var movableToRemove = this.movables.filter(x => x.name == movableName)[0];
		if (movableToRemove != null)
		{
			var indexToRemoveAt = this.movables.indexOf(movableToRemove);
			if (indexToRemoveAt >= 0)
			{
				movableToRemove.remove(this);
				this.movables.splice(indexToRemoveAt, 1);
			}
		}
	}

	show()
	{
		var rowsAsStrings = this.backgroundAsStrings.slice(0);

		var offsetOfMovableWithinSpace = new Coords(2, 1);
		for (var i = 0; i < this.spaces.length; i++)
		{
			var space = this.spaces[i];
			var spacePos = space.pos;
			var spaceSize = space.size;

			var movablesPresent = space.movablesPresent(this);
			for (var m = 0; m < movablesPresent.length; m++)
			{
				var movable = movablesPresent[m];
				var movableAsString = movable.name;

				var rowIndex = spacePos.y + m + offsetOfMovableWithinSpace.y;
				var rowAsString = rowsAsStrings[rowIndex];
				var rowAsStringUpdated =
					rowAsString.substr
					(
						0, spacePos.x + offsetOfMovableWithinSpace.x
					)
					+ movableAsString
					+ rowAsString.substr
					(
						spacePos.x + offsetOfMovableWithinSpace.x
						+ movableAsString.length
					);
				rowsAsStrings[rowIndex] = rowAsStringUpdated;
			}
		}

		var newline = "\n";
		var returnValue = newline + rowsAsStrings.join(newline);

		return returnValue;
	}

	spaceByName(spaceToFindName)
	{
		return this.spaces.filter(x => x.name == spaceToFindName)[0];
	}

	userJoinWithName(userToJoinName)
	{
		if (this.usersJoinedNames.length < this.userCountMax)
		{
			if (this.userWithNameHasJoined(userToJoinName) == false)
			{
				this.usersJoinedNames.push(userToJoinName);
				if (this.usersJoinedNames.length >= this.userCountMax)
				{
					this.closeToNewUsers();
				}
			}
		}
	}

	userWithNameHasJoined(userNameToCheck)
	{
		return (this.usersJoinedNames.indexOf(userNameToCheck) >= 0);
	}
}
