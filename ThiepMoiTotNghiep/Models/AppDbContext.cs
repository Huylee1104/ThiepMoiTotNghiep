using GraduationInvite.Models;
using Microsoft.EntityFrameworkCore;

namespace GraduationInvite.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<KhachMoi> KhachMois { get; set; }
    }
}