
class InputOutputStreamUI
{
	readLine()
	{
		var d = document;
		var textareaInput = d.getElementById("textareaInput");
		var lineRead = textareaInput.value;
		textareaInput.value = "";
		return lineRead;
	}

	writeLine(lineToWrite)
	{
		var d = document;
		var textareaOutput = d.getElementById("textareaOutput");
		var newline = "\n";
		textareaOutput.value += newline + lineToWrite;
	}
}
