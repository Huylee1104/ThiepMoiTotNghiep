using System.ComponentModel.DataAnnotations.Schema;

namespace ThiepMoiTotNghiep.Models
{
    public class messages
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("username")]
        public string? UserName { get; set; }

        [Column("content")]
        public string? Content { get; set; }

        [Column("createdat")]
        public DateTime? CreatedAt { get; set; }

        [Column("reply_to_username")]
        public string? ReplyToUserName { get; set; }

        [Column("reply_to_content")]
        public string? ReplyToContent { get; set; }
    }
}
