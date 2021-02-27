class AgentRockPaperScissors_Game
{
	constructor(userChallengerName, userChallengedName)
	{
		this.userChallengerName = userChallengerName;
		this.userChallengedName = userChallengedName;

		this.userChallengerChoice = null;
		this.userChallengedChoice = null;
	}

	isDone()
	{
		var returnValue =
		(
			this.userChallengerChoice == "quit"
			|| this.userChallengedChoice == "quit"
			||
			(
				this.isValidChoice(this.userChallengerChoice)
				&& this.isValidChoice(this.userChallengedChoice)
			)
		);

		return returnValue;
	}

	isValidChoice(choiceToCheck)
	{
		var returnValue =
		(
			choiceToCheck == "rock"
			|| choiceToCheck == "paper"
			|| choiceToCheck == "scissors"
			|| choiceToCheck == "quit"
		);

		return returnValue;
	}

	result()
	{
		var winnerName = null;

		if
		(
			this.isValidChoice(this.userChallengerChoice)
			&& this.isValidChoice(this.userChallengedChoice)
		)
		{
			if (this.userChallengerChoice == "quit")
			{
				winnerName = this.userChallengedChoice;
			}
			else if (this.userChallengerChoice == "quit")
			{
				winnerName = this.userChallengerChoice;
			}
			else if (this.userChallengerChoice == "rock")
			{
				if (this.userChallengedChoice == "paper")
				{
					winnerName = this.userChallengedName;
				}
				else if (this.userChallengedChoice == "scissors")
				{
					winnerName = this.userChallengerName;
				}
			}
			else if (this.userChallengerChoice == "paper")
			{
				if (this.userChallengedChoice == "rock")
				{
					winnerName = this.userChallengerName;
				}
				else if (this.userChallengedChoice == "scissors")
				{
					winnerName = this.userChallengedName;
				}
			}
			else if (this.userChallengerChoice == "scissors")
			{
				if (this.userChallengedChoice == "rock")
				{
					winnerName = this.userChallengedName;
				}
				else if (this.userChallengedChoice == "paper")
				{
					winnerName = this.userChallengerName;
				}
			}
		}

		var resultText;
		if (winnerName == null)
		{
			resultText = "It's a tie.";
		}
		else
		{
			resultText = winnerName + " wins!";
		}
		
		var returnValue =
			this.userChallengerName + " chose " + this.userChallengerChoice + ", "
			+ this.userChallengedName + " chose " + this.userChallengedChoice + ": "
			+ resultText;

		return returnValue;
	}

	toString()
	{
		return this.userChallengerName + " versus " + this.userChallengedName;
	}

	userWithNameChooses(userName, choice)
	{
		if (userName == this.userChallengerName)
		{
			this.userChallengerChoice = choice;
		}
		else if (userName == this.userChallengedName)
		{
			this.userChallengedChoice = choice;
		}
		else
		{
			throw "User is neither challenger or challenged.";
		}
	}
}
