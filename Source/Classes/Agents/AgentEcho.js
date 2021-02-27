
class AgentEcho
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
		if (messageReceived.userSenderName != this.name)
		{
			this.client.messageBodySend(messageReceived.body);
		}
	}
}