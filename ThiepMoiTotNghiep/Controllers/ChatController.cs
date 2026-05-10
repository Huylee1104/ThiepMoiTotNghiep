using GraduationInvite.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.RegularExpressions;
using ThiepMoiTotNghiep.Hubs;
using ThiepMoiTotNghiep.Models;

namespace ThiepMoiTotNghiep.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatController(AppDbContext context, IHubContext<ChatHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        // GET api/chat/messages
        [HttpGet("messages")]
        public async Task<IActionResult> GetMessages()
        {
            var msgs = await _context.messages
                .OrderByDescending(m => m.CreatedAt)
                .Take(100)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();

            return Ok(msgs.Select(m => new
            {
                m.UserName,
                m.Content,
                createdAt = m.CreatedAt?.ToString("HH:mm dd/MM")
            }));
        }

        // POST api/chat/send
        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Content))
                return BadRequest("Thiếu thông tin.");

            if (request.Content.Length > 500)
                return BadRequest("Tin nhắn quá dài.");

            var msg = new messages
            {
                UserName = NormalizeVietnameseName(request.UserName),
                Content = request.Content.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _context.messages.Add(msg);
            await _context.SaveChangesAsync();

            var timeStr = FormatVnTime(msg.CreatedAt);

            // ← Broadcast cho tất cả client qua SignalR
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", msg.UserName, msg.Content, timeStr);

            return Ok();
        }

        private string NormalizeVietnameseName(string text)
        {
            Regex regex = new Regex("\\p{IsCombiningDiacriticalMarks}+");
            string temp = text.Normalize(NormalizationForm.FormD);
            string result = regex.Replace(temp, String.Empty)
                .Replace('\u0111', 'd')
                .Replace('\u0110', 'D');
            return result.ToLower().Trim();
        }

        private static readonly TimeZoneInfo VnTimeZone =
    TimeZoneInfo.GetSystemTimeZones().Any(t => t.Id == "SE Asia Standard Time")
        ? TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time")
        : TimeZoneInfo.FindSystemTimeZoneById("Asia/Ho_Chi_Minh");

        private string FormatVnTime(DateTime? utcTime)
        {
            if (!utcTime.HasValue) return "";
            return TimeZoneInfo.ConvertTimeFromUtc(utcTime.Value, VnTimeZone).ToString("HH:mm dd/MM");
        }
    }

    public class SendMessageRequest
    {
        public string? UserName { get; set; }
        public string? Content { get; set; }
    }
}