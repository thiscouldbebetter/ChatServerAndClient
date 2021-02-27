
class AgentRockPaperScissors
{
	constructor(name, serviceUrlToConnectTo, outputStream)
	{
		this.name = name;

		var inputStream = new InputOutputStreamNull();
		this.outputStream = outputStream || new InputOutputStreamUI();

		this.client = new Client
		(
			inputStream, this.outputStream, this.messageReceive.bind(this)
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
			this.outputStream.writeLine(messageReceived.toString());

			var userTargetedName = messageParts[1];

			if (userTargetedName == userSenderName)
			{
				var messageToSendBody = "You can't challenge yourself to Rock, Paper, Scissors!";
				this.messageBodySend(messageToSendBody);
			}
			else if (this.gameInProgress != null)
			{
				var messageToSendBody =
					"Game already in progress: "
					+ this.gameInProgress.toString()
					+ ".  Send '/to @" + this.name + " quit' to forfeit.";
				this.messageBodySend(messageToSendBody);
			}
			else if (messageParts < 2 || userTargetedName == "")
			{
				this.messageBodySend("Send 'rps [username]' to start a game.");
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
				this.messageBodySend(messageToSendBody);
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
				this.messageBodySend("No game in progress!");
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
					this.messageBodySend(userSenderName + " has chosen.");
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
					this.messageBodySend(gameResult);
					this.gameInProgress = null;
				}
			}
		}
	}

	messageBodySend(messageBody)
	{
		this.outputStream.writeLine("Sending: " + messageBody);
		this.client.messageBodySend(messageBody);
	}
}
