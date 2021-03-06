
class Tabletop
{
	constructor
	(
		name,
		defn,
		userStartingName,
		spaces,
		movables
	)
	{
		this.name = name;
		this.defn = defn;
		this.userStartingName = userStartingName;
		this.spaces = spaces;
		this.movables = movables;

		this.spacesByName = new Map(this.spaces.map(x => [x.name, x] ) );
		for (var m = 0; m < movables.length; m++)
		{
			var movable = movables[m];
			var space = this.spaceByName(movable.spaceName);
			space.movableAdd(movable);
		}

		this.usersJoinedNames = [ this.userStartingName ];
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

	movableById(movableToFindId)
	{
		return this.movables.filter(x => x.id == movableToFindId)[0];
	}

	movableByNameAndSpaceName(movableToFindName, spaceToFindInName)
	{
		return this.movables.filter(
			x => x.name == movableToFindName && x.spaceName == spaceToFindInName
		)[0];
	}

	movableWithNameAddToSpaceWithName(movableName, spaceName)
	{
		var wasSuccessful = false;

		var doesMovableWithSameNameExist =
			this.movables.some(x => x.name == movableName);
		var spaceToMoveTo = this.spaces.filter(x => x.name == spaceName)[0];
		var movableDefnName = MovableDefn.byName("Default").name;

		if (doesMovableWithSameNameExist == false && spaceToMoveTo != null)
		{
			var movable = new Movable(movableName, movableDefnName);
			this.movables.push(movable);
			movable.moveToSpace(this, spaceToMoveTo);
			wasSuccessful = true;
		}

		return wasSuccessful;
	}

	moveMovableWithNameFromSpaceWithNameToSpaceWithName(movableName, spaceFromName, spaceToName)
	{
		var wasSuccessful = false;

		var spaceToMoveFrom = this.spaces.filter(x => x.name == spaceFromName)[0];
		var movablesInSpaceToMoveFrom = spaceToMoveFrom.movablesPresent(this);
		var movableToMove =
			movablesInSpaceToMoveFrom.filter(x => x.name == movableName)[0];
		var spaceToMoveTo = this.spaces.filter(x => x.name == spaceToName)[0];

		if (movableToMove != null && spaceToMoveTo != null)
		{
			var isMoveAllowed =
				this.isMoveAllowedForMovableNameAndSpaceName(movableName, spaceToName);
			if (isMoveAllowed)
			{
				movableToMove.moveToSpace(this, spaceToMoveTo);
				wasSuccessful = true;
			}
		}

		return wasSuccessful;
	}

	removeMovableWithNameFromSpaceWithName(movableToRemoveName, spaceToRemoveFromName)
	{
		var wasSuccessful = false;

		var movableToRemove =
			this.movableByNameAndSpaceName(movableToRemoveName, spaceToRemoveFromName);
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
		var rowsAsStrings = this.defn.backgroundAsStrings.slice(0);

		for (var i = 0; i < this.spaces.length; i++)
		{
			var space = this.spaces[i];
			space.show(this, rowsAsStrings);
		}

		var newline = "\n";
		var returnValue = newline + rowsAsStrings.join(newline);

		return returnValue;
	}

	spaceByName(spaceToFindName)
	{
		return this.spacesByName.get(spaceToFindName);
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

	// Game types.

	static cards(userStartingName, numberOfPlayers)
	{
		var backgroundAsStrings =
		[
			" deck    hand1   hand2   hand3   hand4    play ",
			"+-----+ +-----+ +-----+ +-----+ +-----+ +-----+",
			"|     | |     | |     | |     | |     | |     |",
			"+-----+ |     | |     | |     | |     | |     |",
			"        |     | |     | |     | |     | |     |",
			"        |     | |     | |     | |     | |     |",
			"        |     | |     | |     | |     | |     |",
			"        |     | |     | |     | |     | |     |",
			"        |     | |     | |     | |     | |     |",
			"        |     | |     | |     | |     | |     |",
			"        |     | |     | |     | |     | |     |",
			"        |     | |     | |     | |     | |     |",
			"        |     | |     | |     | |     | |     |",
			"        |     | |     | |     | |     | |     |",
			"        |     | |     | |     | |     | |     |",
			"        |     | |     | |     | |     | |     |",
			"        |     | |     | |     | |     | |     |",
			"        +-----+ +-----+ +-----+ +-----+ |     |",
			" dump    disc1   disc2   disc3   disc4  |     |",
			"+-----+ +-----+ +-----+ +-----+ +-----+ |     |",
			"|     | |     | |     | |     | |     | |     |",
			"+-----+ +-----+ +-----+ +-----+ +-----+ +-----+",
		];

		var spaceWidth = 6;
		var cardsPerHandMax = 13;
		var cardsPerPlayMax = 17;
		var spaceDeckName = "deck";
		var spaceDeckSize = new Coords(spaceWidth, 2);
		var spaceHandSize = new Coords(spaceWidth, cardsPerHandMax + 2);
		var spacePlaySize = new Coords(spaceWidth, cardsPerPlayMax + 2);
		var spaceDefnName = SpaceDefn.byName("Default").name;

		var spaces =
		[
			new Space(spaceDeckName, spaceDefnName, new Coords(0, 1), spaceDeckSize),

			new Space("hand1", spaceDefnName, new Coords(8, 1), spaceHandSize),
			new Space("hand2", spaceDefnName, new Coords(16, 1), spaceHandSize),
			new Space("hand3", spaceDefnName, new Coords(24, 1), spaceHandSize),
			new Space("hand4", spaceDefnName, new Coords(32, 1), spaceHandSize),

			new Space("play", spaceDefnName, new Coords(32, 1), spacePlaySize),

			// discards

			new Space("dump", spaceDefnName, new Coords(0, 19), spaceDeckSize),

			new Space("disc1", spaceDefnName, new Coords(8, 19), spaceDeckSize),
			new Space("disc2", spaceDefnName, new Coords(16, 19), spaceDeckSize),
			new Space("disc3", spaceDefnName, new Coords(24, 19), spaceDeckSize),
			new Space("disc4", spaceDefnName, new Coords(32, 19), spaceDeckSize),
		];

		var suits = [ "c", "d", "h", "s" ];
		var ranks =
		[
			" 2", " 3", " 4", " 5", " 6", " 7", " 8",
			" 9", "10", " j", " q", " k", " a"
		];
		var movables = [];
		var movableDefnName = MovableDefn.byName("Default").name;
		for (var s = 0; s < suits.length; s++)
		{
			var suit = suits[s];

			for (var r = 0; r < ranks.length; r++)
			{
				var rank = ranks[r];

				var cardName = rank + suit;

				var movableForCard = new Movable
				(
					cardName, movableDefnName, spaceDeckName
				);
				movables.push(movableForCard);
			}
		}

		var spaceDefns =
		[
			SpaceDefn.byName("Default")
		];

		var movableDefns =
		[
			MovableDefn.byName("Default")
		];

		var defn = new TabletopDefn
		(
			"Cards",
			numberOfPlayers, // userCountMax
			backgroundAsStrings,
			spaceDefns,
			movableDefns
		);

		var returnValue = new Tabletop
		(
			defn.name,
			defn,
			userStartingName,
			spaces,
			movables
		);

		return returnValue;
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
		var spaceDefnName = SpaceDefn.byName("Default").name;
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
					spaceName, spaceDefnName, spacePosInCells, spaceSizeInCells
				);
				spaces.push(space);
			}
		}

		var movableDefnName = MovableDefn.byName("Default").name;
		var movables =
		[
			// black

			new Movable("br", movableDefnName, "a8"), // rook
			new Movable("bn", movableDefnName, "b8"), // knight
			new Movable("bb", movableDefnName, "c8"), // bishop
			new Movable("bq", movableDefnName, "d8"), // queen
			new Movable("bk", movableDefnName, "e8"), // king
			new Movable("bb", movableDefnName, "f8"),
			new Movable("bn", movableDefnName, "g8"),
			new Movable("br", movableDefnName, "h8"),

			new Movable("bp", movableDefnName, "a7"), // pawn
			new Movable("bp", movableDefnName, "b7"),
			new Movable("bp", movableDefnName, "c7"),
			new Movable("bp", movableDefnName, "d7"),
			new Movable("bp", movableDefnName, "e7"),
			new Movable("bp", movableDefnName, "f7"),
			new Movable("bp", movableDefnName, "g7"),
			new Movable("bp", movableDefnName, "h7"),

			// white

			new Movable("wp", movableDefnName, "a2"),
			new Movable("wp", movableDefnName, "b2"),
			new Movable("wp", movableDefnName, "c2"),
			new Movable("wp", movableDefnName, "d2"),
			new Movable("wp", movableDefnName, "e2"),
			new Movable("wp", movableDefnName, "f2"),
			new Movable("wp", movableDefnName, "g2"),
			new Movable("wp", movableDefnName, "h2"),

			new Movable("wr", movableDefnName, "a1"),
			new Movable("wn", movableDefnName, "b1"),
			new Movable("wb", movableDefnName, "c1"),
			new Movable("wq", movableDefnName, "d1"),
			new Movable("wk", movableDefnName, "e1"),
			new Movable("wb", movableDefnName, "f1"),
			new Movable("wn", movableDefnName, "g1"),
			new Movable("wr", movableDefnName, "h1"),
		];

		var spaceDefns =
		[
			SpaceDefn.byName("Default")
		];

		var movableDefns =
		[
			MovableDefn.byName("Default")
		];

		var defn = new TabletopDefn
		(
			"Chess",
			2, // userCountMax
			backgroundAsStrings,
			spaceDefns,
			movableDefns
		);

		var returnValue = new Tabletop
		(
			defn.name,
			defn,
			userStartingName,
			spaces,
			movables
		);

		return returnValue;
	}
}
