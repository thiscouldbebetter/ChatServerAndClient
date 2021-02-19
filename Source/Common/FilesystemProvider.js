
class FilesystemProvider
{
	constructor()
	{
		this.fs = require("fs");
	}

	static Instance()
	{
		if (FilesystemProvider._instance == null)
		{
			FilesystemProvider._instance = new FilesystemProvider();
		}
		return FilesystemProvider._instance;
	}

	contentsOfFileAtPath(filePath)
	{
		var fileContentsAsString =
			fs.readFileSync(filePath).toString();
		return fileContentsAsString;
	}

	fileNamesInDirectoryAtPath(directoryPath)
	{
		var commonFiles = this.fs.readdirSync(directoryPath);
	}
}