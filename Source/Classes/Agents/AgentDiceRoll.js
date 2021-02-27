
class AgentDiceRoll
{
	constructor(name, serviceUrlToConnectTo)
	{
		this.name = name;

		var ioStream = new InputOutputStreamNull();

		this.client = new Client
		(
			ioStream, ioStream, this.messageReceive.bind(this)
		);

		this.client.connect(serviceUrlToConnectTo, this.name);
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
					messageReceived.userSenderName + " rolls: "
					+ numbersRolledOnDice.join(" + ")
					+ " = " + sumOfDiceSoFar;

				this.client.messageBodySend(diceRollResultMessage);
			}
		}
	}
}
