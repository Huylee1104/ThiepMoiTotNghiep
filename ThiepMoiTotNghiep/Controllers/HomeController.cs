using GraduationInvite.Data;
using GraduationInvite.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Text;
using System.Text.RegularExpressions;

namespace GraduationInvite.Controllers
{
    public class HomeController : Controller
    {
        private readonly AppDbContext _context;
        // Chuỗi Base64 ảnh mặc định (Bạn có thể thay bằng chuỗi thực tế của bạn)
        private readonly string DefaultImageBase64 = "/img/huy.png";
        private readonly IWebHostEnvironment _webHostEnvironment;


        public HomeController(AppDbContext context, IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            _webHostEnvironment = webHostEnvironment;
        }

        public IActionResult Index()
        {
            return View();
        }
        public IActionResult Privacy()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> CheckGuest(string rawName)
        {
            if (string.IsNullOrWhiteSpace(rawName)) return BadRequest("Tên không hợp lệ");

            string normalizedName = NormalizeVietnameseName(rawName);
            var guest = await _context.KhachMois.FirstOrDefaultAsync(k => k.TenKhachMoi == normalizedName);

            if (guest != null)
            {
                guest.SoLuotGheTham += 1;
                _context.Update(guest);
            }
            else
            {
                guest = new KhachMoi
                {
                    TenKhachMoi = normalizedName,
                    AnhBase64 = DefaultImageBase64,
                    SoLuotGheTham = 1,
                    SoLuotIn = 0,
                    ThamGia = null
                };
                _context.KhachMois.Add(guest);
            }

            await _context.SaveChangesAsync();

            return Json(new { id = guest.ID, displayName = rawName, image = guest.AnhBase64 });
        }

        [HttpPost]
        public async Task<IActionResult> UpdateAttendance(int id, bool isAttending)
        {
            var guest = await _context.KhachMois.FindAsync(id);
            if (guest != null)
            {
                guest.ThamGia = isAttending;
                _context.Update(guest);
                await _context.SaveChangesAsync();
                return Ok();
            }
            return NotFound();
        }

        [HttpGet]
        public async Task<IActionResult> GeneratePdf(int id, string displayName)
        {
            var guest = await _context.KhachMois.FindAsync(id);
            if (guest != null)
            {
                guest.SoLuotIn += 1;
                _context.Update(guest);
                await _context.SaveChangesAsync();
            }
            string imagePath = Path.Combine(_webHostEnvironment.WebRootPath, "img", "thiep_moi.png");

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A5.Landscape());
                    page.Margin(0);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(14));

                    page.Content().Layers(layers =>
                    {
                        // Layer 1: Ảnh nền phủ toàn trang
                        layers.Layer().Image(imagePath).FitArea();

                        // Layer 2: Nội dung chữ đè lên trên
                        layers.PrimaryLayer().Padding(1, Unit.Centimetre).Column(col =>
                        {
                            col.Item().PaddingTop(160).PaddingRight(183).AlignCenter().Text(displayName ?? "Bạn của tôi").FontSize(13).Bold().FontColor("#FFD700");
                        });
                    });
                });
            });

            var images = document.GenerateImages();
            byte[] imageBytes = images.First();

            return File(imageBytes, "image/png", $"ThiepMoi_{displayName}.png");
        }

        private string NormalizeVietnameseName(string text)
        {
            Regex regex = new Regex("\\p{IsCombiningDiacriticalMarks}+");
            string temp = text.Normalize(NormalizationForm.FormD);
            string result = regex.Replace(temp, String.Empty).Replace('\u0111', 'd').Replace('\u0110', 'D');
            return result.ToLower().Trim();
        }
    }
}