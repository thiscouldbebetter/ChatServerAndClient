
class Message
{
	constructor(timePosted, userSenderName, usersAddressedNames, body)
	{
		this.timePosted = timePosted;
		this.userSenderName = userSenderName;
		this.usersAddressedNames = usersAddressedNames;
		this.body = body;
	}

	toString()
	{
		var timeAsString =
			("" + this.timePosted.getHours()).padStart(2, "0")
			+ ":" + ("" + this.timePosted.getMinutes()).padStart(2, "0")
			+ ":" + ("" + this.timePosted.getSeconds()).padStart(2, "0");
		var returnValue =
			timeAsString + " " + this.userSenderName + ": " + this.body;
		return returnValue;
	}

	// Serialization.

	static deserialize(messageSerialized)
	{
		var messageParts = messageSerialized.split("|");
		var timePostedAsString = messageParts[0];
		var userSenderName = messageParts[1];
		var usersAddressedNamesJoined = messageParts[2];
		var usersAddressedNames =
		(
			usersAddressedNamesJoined == ""
			? null
			: usersAddressedNamesJoined.split(";")
		)
		var body = messageParts[3];
		var timePosted = new Date(Date.parse(timePostedAsString));
		var returnValue = new Message
		(
			timePosted, userSenderName, usersAddressedNames, body
		);
		return returnValue;
	}

	serialize()
	{
		var usersAddressedNamesJoined =
		(
			this.usersAddressedNames == null ? "" : this.usersAddressedNames.join(";")
		);

		var fields =
		[
			this.timePosted, this.userSenderName,
			usersAddressedNamesJoined, this.body
		];

		return fields.join("|");
	}
}
