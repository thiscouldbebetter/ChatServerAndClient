
class Socket
{
	constructor(socketInner)
	{
		this.socketInner = socketInner;
	}

	static connect(urlToConnectTo, connectOptions)
	{
		var socketInner = new io.connect(urlToConnectTo, connectOptions);
		return new Socket(socketInner);
	}

	id()
	{
		return "_" + this.socketInner.id;
	}

	static listen(portToListenOn, handleEvent_Connection)
	{
		var socketIO = require("socket.io")();

		var listener = socketIO.listen
		(
			portToListenOn,
			{ log: false }
		);

		listener.sockets.on
		(
			"connection", 
			handleEvent_Connection
		);
	}

	disconnect()
	{
		this.socketInner.disconnect();
	}

	emit(eventTypeName, eventContent)
	{
		this.socketInner.emit(eventTypeName, eventContent);
	}

	isConnected()
	{
		return this.socketInner.connected;
	}

	on(eventTypeName, handleEvent)
	{
		this.socketInner.on(eventTypeName, handleEvent);
	}
}