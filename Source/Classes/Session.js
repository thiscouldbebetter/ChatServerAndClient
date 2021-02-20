
class Session
{
	constructor()
	{
		this.channel = new Channel();
		this.timeStarted = new Date();
		this.timeLastUpdated = new Date();
	}
}