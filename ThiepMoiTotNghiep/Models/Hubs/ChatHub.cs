using Microsoft.AspNetCore.SignalR;

namespace ThiepMoiTotNghiep.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(string userName, string content, string createdAt)
        {
            await Clients.All.SendAsync("ReceiveMessage", userName, content, createdAt);
        }
    }
}