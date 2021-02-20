
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
		var timePosted = new Date(Date.parse(timePostedAsString));
		var returnValue = new Message
		(
			timePosted, messageParts[1], null, messageParts[2]
		);
		return returnValue;
	}

	serialize()
	{
		return [ this.timePosted, this.userSenderName, this.body ].join("|");
	}
}