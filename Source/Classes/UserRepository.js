
class UserRepository
{
	constructor()
	{
		this.filesystemProvider = FilesystemProvider.Instance();
		this.usersFilePath = "Users.json";

	}

	doesUserWithNameExist(userNameToCheck)
	{
		var returnValue = (this.userByName(userNameToCheck) != null);
		return returnValue;
	}

	userByName(userNameToFind)
	{
		var usersAll = usersAll();
		var userMatching = usersAll.filter(x => x.name == userNameToFind)[0];
		return userMatching;
	}

	userSave(userToSave)
	{
		var userExisting = this.userByName(userToSave.name);
		if (userExisting != null)
		{
			throw "todo";
		}
		var userSerialized = userToSave.serialize();
		this.filesystemProvider.appendStringToFileAtPath
		(
			this.usersFilePath, userSerialized
		);

	}

	usersAllAsObjects()
	{
		var usersAllAsString =
			this.filesystemProvider.contentsOfFileAtPath
			(
				this.usersFilePath
			);
		var usersAllAsLines = usersAllAsString.split("\n");
		var usersAll = usersAllAsLines.map(
			x => User.deserialize(x)
		);
		return usersAll;
	}
}