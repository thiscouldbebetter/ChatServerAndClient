
class AgentEcho
{
	constructor(name, serviceUrlToConnectTo, outputStream)
	{
		this.name = name;

		var inputStream = new InputOutputStreamNull();
		this.outputStream = outputStream || inputStream;

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
					"I'm an echo agent.  I repeat what you say.  It's annoying."
				);
			}
		);
	}

	messageReceive(messageReceived)
	{
		if (messageReceived.userSenderName != this.name)
		{
			this.client.messageBodySend(messageReceived.body);
		}
	}
}
