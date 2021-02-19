class SourceFileCompiler
{
	readClassesByNameFromSourceFiles()
	{
		var fs = require("fs");
		var sourceDirectoryPath = "./Common/";
		var commonFiles = fs.readdirSync(sourceDirectoryPath);
		var classesByName = new Map();
		for (var i = 0; i < commonFiles.length; i++)
		{
			var fileName = commonFiles[i];
			var className = fileName.split(".")[0];
			var filePath = sourceDirectoryPath + fileName;
			var fileAsString =
				fs.readFileSync(filePath).toString();
			var fileAsStringWrapped = "(" + fileAsString + ")";
			var fileAsClass = eval(fileAsStringWrapped);
			classesByName[className] = fileAsClass;
		}
		return classesByName;
	}
}

var compiler = new SourceFileCompiler();
var classesByName = compiler.readClassesByNameFromSourceFiles();
var Channel = classesByName["Channel"];
var Connection = classesByName["Connection"];
var Message = classesByName["Message"];
var Socket = classesByName["Socket"];
var User = classesByName["User"];

class Server
{
	constructor(portToListenOn, channel)
	{
		this.portToListenOn = portToListenOn;
		this.channel = channel;
	}

	initialize()
	{
		this.connections = [];

		Socket.listen
		(
			this.portToListenOn,
			this.handleEvent_UserConnecting.bind(this)
		);

		console.log("Server started at " + new Date().toLocaleTimeString() + ".");
		console.log("Listening on port " + this.portToListenOn + ".");
	}

	connectionDisconnect(connectionToRemove)
	{
		var user = connectionToRemove.user;
		this.channel.userRemove(user);

		var indexToRemoveAt = this.connections.indexOf(connectionToRemove);
		if (indexToRemoveAt != -1)
		{
			this.connections.splice(indexToRemoveAt, 1);
		}
	}

	// events

	handleEvent_UserConnecting(socketToClientInner)
	{
		var socketToClient = new Socket(socketToClientInner);

		var connectionId = socketToClient.id();

		var connection = new Connection
		(
			this, connectionId, socketToClient
		);
		this.connections.push(connection);

		console.log(
			"Client connected: " + connectionId + "."
			+ "  Current connection count: " + this.connections.length + "."
		);

		socketToClient.emit("connected", connectionId);
	}
}

function main()
{
	var args = process.argv;

	for (var a = 2; a < args.length; a++)
	{
		var arg = args[a];

		var argParts = arg.split("=");

		var argName = argParts[0];
		var argValue = argParts[1];

		args[argName] = argValue;
	}

	var argNameToDefaultLookup = 
	{
		"--port" : "8089",
	};

	for (var argName in argNameToDefaultLookup)
	{
		if (args[argName] == null)
		{
			var argValueDefault = argNameToDefaultLookup[argName];
			args[argName] = argValueDefault;
		}
	}

	var servicePort = parseInt(args["--port"]);

	var channel = new Channel("Main");

	new Server(servicePort, channel).initialize();
}

main();