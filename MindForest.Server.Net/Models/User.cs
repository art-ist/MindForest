//------------------------------------------------------------------------------
// <auto-generated>
//    This code was generated from a template.
//
//    Manual changes to this file may cause unexpected behavior in your application.
//    Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace MindForest.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class User
    {
        public User()
        {
            this.UserClaims = new HashSet<UserClaim>();
            this.UserExternalLogins = new HashSet<UserExternalLogin>();
            this.UserRoles = new HashSet<UserRole>();
        }
    
        public string Id { get; set; }
        public string Email { get; set; }
        public bool EmailConfirmed { get; set; }
        public string PasswordHash { get; set; }
        public string SecurityStamp { get; set; }
        public string PhoneNumber { get; set; }
        public bool PhoneNumberConfirmed { get; set; }
        public bool TwoFactorEnabled { get; set; }
        public Nullable<System.DateTime> LockoutEndDateUtc { get; set; }
        public bool LockoutEnabled { get; set; }
        public int AccessFailedCount { get; set; }
        public string UserName { get; set; }
        public string DisplayName { get; set; }
        public string Hometown { get; set; }
        public string Discriminator { get; set; }
    
        public virtual ICollection<UserClaim> UserClaims { get; set; }
        public virtual ICollection<UserExternalLogin> UserExternalLogins { get; set; }
        public virtual ICollection<UserRole> UserRoles { get; set; }
    }
}
