
class AgentRockPaperScissors
{
	constructor(name, serviceUrlToConnectTo)
	{
		this.name = name;

		var ioStream = new InputOutputStreamNull();

		this.client = new Client
		(
			ioStream, ioStream, this.messageReceive.bind(this)
		);

		var agent = this;

		this.client.connect
		(
			serviceUrlToConnectTo,
			this.name,
			() =>
			{
				agent.client.messageBodySend
				(
					"Send 'rps [username]' to start a game of Rock, Paper, Scissors."
				);
			}
		);

		this.gameInProgress = null;
	}

	messageReceive(messageReceived)
	{
		var userSenderName = messageReceived.userSenderName;
		var messageReceivedBody = messageReceived.body;
		var messageParts = messageReceivedBody.split(" ");
		var messagePart0 = messageParts[0];

		if (messagePart0 == "rps")
		{
			var userTargetedName = messageParts[1];

			if (userTargetedName == userSenderName)
			{
				var messageToSendBody = "You can't challenge yourself to Rock, Paper, Scissors!";
				this.client.messageBodySend(messageToSendBody);
			}
			else if (this.gameInProgress != null)
			{
				var messageToSendBody =
					"Game already in progress: "
					+ this.gameInProgress.toString()
					+ ".  Send '/to @" + this.name + " quit' to forfeit.";
				this.client.messageBodySend(messageToSendBody);
			}
			else if (messageParts < 2)
			{
				this.client.messageBodySend("Send 'rps [username]' to start a game.");
			}
			else
			{
				var game = new AgentRockPaperScissors_Game(userSenderName, userTargetedName);
				this.gameInProgress = game;
				var messageToSendBody =
					userSenderName
					+ " has challenged "
					+ userTargetedName
					+ " to Rock, Paper, Scissors.  Send any of "
					+ "'/to @" + this.name + " rock', "
					+ "'/to @" + this.name + " paper', or "
					+ "'/to @" + this.name + " scissors' to play.";
				this.client.messageBodySend(messageToSendBody);
			}
		}
		else if
		(
			messageReceived.usersAddressedNames != null
			&& messageReceived.usersAddressedNames.indexOf(this.name) >= 0
		)
		{
			if (this.gameInProgress == null)
			{
				this.client.messageBodySend("No game in progress!");
			}
			else
			{
				var choiceChosen = messageParts[messageParts.length - 1];
				if (this.gameInProgress.isValidChoice(choiceChosen))
				{
					this.gameInProgress.userWithNameChooses
					(
						userSenderName, choiceChosen
					);
					this.client.messageBodySend(userSenderName + " has chosen.");
				}
				else
				{
					this.client.messageBodySendToUsersWithNames
					(
						"Invalid choice!", [userSenderName]
					);
				}

				if (this.gameInProgress.isDone())
				{
					var gameResult = this.gameInProgress.result();
					this.client.messageBodySend(gameResult);
					this.gameInProgress = null;
				}
			}
		}
	}
}
