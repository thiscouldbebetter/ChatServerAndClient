
class AgentDiceRoll
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
					"Send 'roll 3d6', for example, to roll three six-sided dice."
				);
			}
		);
	}

	messageReceive(messageReceived)
	{
		var messageReceivedBody = messageReceived.body;
		if (messageReceivedBody.startsWith("roll "))
		{
			var parts = messageReceivedBody.split(" ");
			var dieRollToMake = parts[1];
			var numberOfDiceAndSidesPerDie = dieRollToMake.split("d");
			if (numberOfDiceAndSidesPerDie.length == 2)
			{
				var numberOfDice = parseInt(numberOfDiceAndSidesPerDie[0]);
				var sidesPerDie = parseInt(numberOfDiceAndSidesPerDie[1]);

				var numbersRolledOnDice = [];
				var sumOfDiceSoFar = 0;

				for (var d = 0; d < numberOfDice; d++)
				{
					var numberRolledOnThisDie = Math.floor
					(
						Math.random() * sidesPerDie
					) + 1;
					numbersRolledOnDice.push(numberRolledOnThisDie);
					sumOfDiceSoFar += numberRolledOnThisDie;
				}

				var diceRollResultMessage =
					messageReceived.userSenderName + " rolls "
					+ dieRollToMake + ": "
					+ numbersRolledOnDice.join(" + ")
					+ (numberOfDice > 1 ? " = " + sumOfDiceSoFar : "");

				this.client.messageBodySend(diceRollResultMessage);

				this.outputStream.writeLine(diceRollResultMessage);
			}
		}
	}
}
