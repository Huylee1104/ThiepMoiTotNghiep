using System.ComponentModel.DataAnnotations;

namespace GraduationInvite.Models
{
    public class KhachMoi
    {
        [Key]
        public int ID { get; set; }
        public string? TenKhachMoi { get; set; }
        public string? AnhBase64 { get; set; }
        public int? SoLuotGheTham { get; set; }
        public int? SoLuotIn { get; set; }
        public bool? ThamGia { get; set; }
    }
}