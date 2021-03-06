//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using System.Data.Entity.Infrastructure.MappingViews;

[assembly: DbMappingViewCacheTypeAttribute(
    typeof(MindForest.Models.IdentityContext),
    typeof(Edm_EntityMappingGeneratedViews.ViewsForBaseEntitySets43259fd87b7153ab29cd1ab49303545c43cbe38fcc366ec8d8ebafa28a25f553))]

namespace Edm_EntityMappingGeneratedViews
{
    using System;
    using System.CodeDom.Compiler;
    using System.Data.Entity.Core.Metadata.Edm;

    /// <summary>
    /// Implements a mapping view cache.
    /// </summary>
    [GeneratedCode("Entity Framework Power Tools", "0.9.0.0")]
    internal sealed class ViewsForBaseEntitySets43259fd87b7153ab29cd1ab49303545c43cbe38fcc366ec8d8ebafa28a25f553 : DbMappingViewCache
    {
        /// <summary>
        /// Gets a hash value computed over the mapping closure.
        /// </summary>
        public override string MappingHashValue
        {
            get { return "43259fd87b7153ab29cd1ab49303545c43cbe38fcc366ec8d8ebafa28a25f553"; }
        }

        /// <summary>
        /// Gets a view corresponding to the specified extent.
        /// </summary>
        /// <param name="extent">The extent.</param>
        /// <returns>The mapping view, or null if the extent is not associated with a mapping view.</returns>
        public override DbMappingView GetView(EntitySetBase extent)
        {
            if (extent == null)
            {
                throw new ArgumentNullException("extent");
            }

            var extentName = extent.EntityContainer.Name + "." + extent.Name;

            if (extentName == "CodeFirstDatabase.IdentityRole")
            {
                return GetView0();
            }

            if (extentName == "CodeFirstDatabase.IdentityUserRole")
            {
                return GetView1();
            }

            if (extentName == "CodeFirstDatabase.IdentityUser")
            {
                return GetView2();
            }

            if (extentName == "CodeFirstDatabase.IdentityUserClaim")
            {
                return GetView3();
            }

            if (extentName == "CodeFirstDatabase.IdentityUserLogin")
            {
                return GetView4();
            }

            if (extentName == "IdentityContext.Roles")
            {
                return GetView5();
            }

            if (extentName == "IdentityContext.IdentityUserRoles")
            {
                return GetView6();
            }

            if (extentName == "IdentityContext.IdentityUser_Roles")
            {
                return GetView7();
            }

            if (extentName == "IdentityContext.IdentityUsers")
            {
                return GetView8();
            }

            if (extentName == "IdentityContext.IdentityUserClaims")
            {
                return GetView9();
            }

            if (extentName == "IdentityContext.IdentityUser_Claims")
            {
                return GetView10();
            }

            if (extentName == "IdentityContext.IdentityUserLogins")
            {
                return GetView11();
            }

            if (extentName == "IdentityContext.IdentityUser_Logins")
            {
                return GetView12();
            }

            return null;
        }

        /// <summary>
        /// Gets the view for CodeFirstDatabase.IdentityRole.
        /// </summary>
        /// <returns>The mapping view.</returns>
        private static DbMappingView GetView0()
        {
            return new DbMappingView(@"
    SELECT VALUE -- Constructing IdentityRole
        [CodeFirstDatabaseSchema.IdentityRole](T1.IdentityRole_Id, T1.IdentityRole_Name)
    FROM (
        SELECT 
            T.Id AS IdentityRole_Id, 
            T.Name AS IdentityRole_Name, 
            True AS _from0
        FROM IdentityContext.Roles AS T
    ) AS T1");
        }

        /// <summary>
        /// Gets the view for CodeFirstDatabase.IdentityUserRole.
        /// </summary>
        /// <returns>The mapping view.</returns>
        private static DbMappingView GetView1()
        {
            return new DbMappingView(@"
    SELECT VALUE -- Constructing IdentityUserRole
        [CodeFirstDatabaseSchema.IdentityUserRole](T3.IdentityUserRole_UserId, T3.IdentityUserRole_RoleId, T3.[IdentityUserRole.IdentityUser_Id])
    FROM (
        SELECT T1.IdentityUserRole_UserId, T1.IdentityUserRole_RoleId, T2.[IdentityUserRole.IdentityUser_Id], (T2._from0 AND T2._from0 IS NOT NULL) AS _from0, T1._from1
        FROM  (
            SELECT 
                T.UserId AS IdentityUserRole_UserId, 
                T.RoleId AS IdentityUserRole_RoleId, 
                True AS _from1
            FROM IdentityContext.IdentityUserRoles AS T) AS T1
            LEFT OUTER JOIN (
            SELECT 
                Key(T.IdentityUser_Roles_Target).UserId AS IdentityUserRole_UserId, 
                Key(T.IdentityUser_Roles_Target).RoleId AS IdentityUserRole_RoleId, 
                Key(T.IdentityUser_Roles_Source).Id AS [IdentityUserRole.IdentityUser_Id], 
                True AS _from0
            FROM IdentityContext.IdentityUser_Roles AS T) AS T2
            ON T1.IdentityUserRole_UserId = T2.IdentityUserRole_UserId AND T1.IdentityUserRole_RoleId = T2.IdentityUserRole_RoleId
    ) AS T3");
        }

        /// <summary>
        /// Gets the view for CodeFirstDatabase.IdentityUser.
        /// </summary>
        /// <returns>The mapping view.</returns>
        private static DbMappingView GetView2()
        {
            return new DbMappingView(@"
    SELECT VALUE -- Constructing IdentityUser
        [CodeFirstDatabaseSchema.IdentityUser](T2.IdentityUser_Id, T2.IdentityUser_Email, T2.IdentityUser_EmailConfirmed, T2.IdentityUser_PasswordHash, T2.IdentityUser_SecurityStamp, T2.IdentityUser_PhoneNumber, T2.IdentityUser_PhoneNumberConfirmed, T2.IdentityUser_TwoFactorEnabled, T2.IdentityUser_LockoutEndDateUtc, T2.IdentityUser_LockoutEnabled, T2.IdentityUser_AccessFailedCount, T2.IdentityUser_UserName, T2.IdentityUser_Discriminator)
    FROM (
        SELECT -- Constructing Discriminator
            T1.IdentityUser_Id, 
            T1.IdentityUser_Email, 
            T1.IdentityUser_EmailConfirmed, 
            T1.IdentityUser_PasswordHash, 
            T1.IdentityUser_SecurityStamp, 
            T1.IdentityUser_PhoneNumber, 
            T1.IdentityUser_PhoneNumberConfirmed, 
            T1.IdentityUser_TwoFactorEnabled, 
            T1.IdentityUser_LockoutEndDateUtc, 
            T1.IdentityUser_LockoutEnabled, 
            T1.IdentityUser_AccessFailedCount, 
            T1.IdentityUser_UserName, 
            CASE
                WHEN T1._from1 THEN N'AppUser'
                ELSE N'IdentityUser'
            END AS IdentityUser_Discriminator
        FROM (
            SELECT 
                T.Id AS IdentityUser_Id, 
                T.Email AS IdentityUser_Email, 
                T.EmailConfirmed AS IdentityUser_EmailConfirmed, 
                T.PasswordHash AS IdentityUser_PasswordHash, 
                T.SecurityStamp AS IdentityUser_SecurityStamp, 
                T.PhoneNumber AS IdentityUser_PhoneNumber, 
                T.PhoneNumberConfirmed AS IdentityUser_PhoneNumberConfirmed, 
                T.TwoFactorEnabled AS IdentityUser_TwoFactorEnabled, 
                T.LockoutEndDateUtc AS IdentityUser_LockoutEndDateUtc, 
                T.LockoutEnabled AS IdentityUser_LockoutEnabled, 
                T.AccessFailedCount AS IdentityUser_AccessFailedCount, 
                T.UserName AS IdentityUser_UserName, 
                True AS _from0, 
                CASE WHEN T IS OF (ONLY [MindForest.Models.AppUser]) THEN True ELSE False END AS _from1, 
                CASE WHEN T IS OF (ONLY [MindForest.Models.IdentityUser]) THEN True ELSE False END AS _from2
            FROM IdentityContext.IdentityUsers AS T
        ) AS T1
    ) AS T2");
        }

        /// <summary>
        /// Gets the view for CodeFirstDatabase.IdentityUserClaim.
        /// </summary>
        /// <returns>The mapping view.</returns>
        private static DbMappingView GetView3()
        {
            return new DbMappingView(@"
    SELECT VALUE -- Constructing IdentityUserClaim
        [CodeFirstDatabaseSchema.IdentityUserClaim](T3.IdentityUserClaim_Id, T3.IdentityUserClaim_UserId, T3.IdentityUserClaim_ClaimType, T3.IdentityUserClaim_ClaimValue, T3.[IdentityUserClaim.IdentityUser_Id])
    FROM (
        SELECT T1.IdentityUserClaim_Id, T1.IdentityUserClaim_UserId, T1.IdentityUserClaim_ClaimType, T1.IdentityUserClaim_ClaimValue, T2.[IdentityUserClaim.IdentityUser_Id], T1._from0, (T2._from1 AND T2._from1 IS NOT NULL) AS _from1
        FROM  (
            SELECT 
                T.Id AS IdentityUserClaim_Id, 
                T.UserId AS IdentityUserClaim_UserId, 
                T.ClaimType AS IdentityUserClaim_ClaimType, 
                T.ClaimValue AS IdentityUserClaim_ClaimValue, 
                True AS _from0
            FROM IdentityContext.IdentityUserClaims AS T) AS T1
            LEFT OUTER JOIN (
            SELECT 
                Key(T.IdentityUser_Claims_Target).Id AS IdentityUserClaim_Id, 
                Key(T.IdentityUser_Claims_Source).Id AS [IdentityUserClaim.IdentityUser_Id], 
                True AS _from1
            FROM IdentityContext.IdentityUser_Claims AS T) AS T2
            ON T1.IdentityUserClaim_Id = T2.IdentityUserClaim_Id
    ) AS T3");
        }

        /// <summary>
        /// Gets the view for CodeFirstDatabase.IdentityUserLogin.
        /// </summary>
        /// <returns>The mapping view.</returns>
        private static DbMappingView GetView4()
        {
            return new DbMappingView(@"
    SELECT VALUE -- Constructing IdentityUserLogin
        [CodeFirstDatabaseSchema.IdentityUserLogin](T3.IdentityUserLogin_LoginProvider, T3.IdentityUserLogin_ProviderKey, T3.IdentityUserLogin_UserId, T3.[IdentityUserLogin.IdentityUser_Id])
    FROM (
        SELECT T1.IdentityUserLogin_LoginProvider, T1.IdentityUserLogin_ProviderKey, T1.IdentityUserLogin_UserId, T2.[IdentityUserLogin.IdentityUser_Id], (T2._from0 AND T2._from0 IS NOT NULL) AS _from0, T1._from1
        FROM  (
            SELECT 
                T.LoginProvider AS IdentityUserLogin_LoginProvider, 
                T.ProviderKey AS IdentityUserLogin_ProviderKey, 
                T.UserId AS IdentityUserLogin_UserId, 
                True AS _from1
            FROM IdentityContext.IdentityUserLogins AS T) AS T1
            LEFT OUTER JOIN (
            SELECT 
                Key(T.IdentityUser_Logins_Target).LoginProvider AS IdentityUserLogin_LoginProvider, 
                Key(T.IdentityUser_Logins_Target).ProviderKey AS IdentityUserLogin_ProviderKey, 
                Key(T.IdentityUser_Logins_Target).UserId AS IdentityUserLogin_UserId, 
                Key(T.IdentityUser_Logins_Source).Id AS [IdentityUserLogin.IdentityUser_Id], 
                True AS _from0
            FROM IdentityContext.IdentityUser_Logins AS T) AS T2
            ON T1.IdentityUserLogin_LoginProvider = T2.IdentityUserLogin_LoginProvider AND T1.IdentityUserLogin_ProviderKey = T2.IdentityUserLogin_ProviderKey AND T1.IdentityUserLogin_UserId = T2.IdentityUserLogin_UserId
    ) AS T3");
        }

        /// <summary>
        /// Gets the view for IdentityContext.Roles.
        /// </summary>
        /// <returns>The mapping view.</returns>
        private static DbMappingView GetView5()
        {
            return new DbMappingView(@"
    SELECT VALUE -- Constructing Roles
        [MindForest.Models.IdentityRole](T1.IdentityRole_Id, T1.IdentityRole_Name)
    FROM (
        SELECT 
            T.Id AS IdentityRole_Id, 
            T.Name AS IdentityRole_Name, 
            True AS _from0
        FROM CodeFirstDatabase.IdentityRole AS T
    ) AS T1");
        }

        /// <summary>
        /// Gets the view for IdentityContext.IdentityUserRoles.
        /// </summary>
        /// <returns>The mapping view.</returns>
        private static DbMappingView GetView6()
        {
            return new DbMappingView(@"
    SELECT VALUE -- Constructing IdentityUserRoles
        [MindForest.Models.IdentityUserRole](T1.IdentityUserRole_UserId, T1.IdentityUserRole_RoleId) WITH 
        RELATIONSHIP(CREATEREF(IdentityContext.IdentityUsers, ROW(T1.[IdentityUser_Roles.IdentityUser_Roles_Source.Id]),[MindForest.Models.IdentityUser]),[MindForest.Models.IdentityUser_Roles],IdentityUser_Roles_Target,IdentityUser_Roles_Source) 
    FROM (
        SELECT 
            T.UserId AS IdentityUserRole_UserId, 
            T.RoleId AS IdentityUserRole_RoleId, 
            True AS _from0, 
            T.IdentityUser_Id AS [IdentityUser_Roles.IdentityUser_Roles_Source.Id]
        FROM CodeFirstDatabase.IdentityUserRole AS T
    ) AS T1");
        }

        /// <summary>
        /// Gets the view for IdentityContext.IdentityUser_Roles.
        /// </summary>
        /// <returns>The mapping view.</returns>
        private static DbMappingView GetView7()
        {
            return new DbMappingView(@"
    SELECT VALUE -- Constructing IdentityUser_Roles
        [MindForest.Models.IdentityUser_Roles](T3.[IdentityUser_Roles.IdentityUser_Roles_Source], T3.[IdentityUser_Roles.IdentityUser_Roles_Target])
    FROM (
        SELECT -- Constructing IdentityUser_Roles_Source
            CreateRef(IdentityContext.IdentityUsers, row(T2.[IdentityUser_Roles.IdentityUser_Roles_Source.Id]), [MindForest.Models.IdentityUser]) AS [IdentityUser_Roles.IdentityUser_Roles_Source], 
            T2.[IdentityUser_Roles.IdentityUser_Roles_Target]
        FROM (
            SELECT -- Constructing IdentityUser_Roles_Target
                T1.[IdentityUser_Roles.IdentityUser_Roles_Source.Id], 
                CreateRef(IdentityContext.IdentityUserRoles, row(T1.[IdentityUser_Roles.IdentityUser_Roles_Target.UserId], T1.[IdentityUser_Roles.IdentityUser_Roles_Target.RoleId]), [MindForest.Models.IdentityUserRole]) AS [IdentityUser_Roles.IdentityUser_Roles_Target]
            FROM (
                SELECT 
                    T.IdentityUser_Id AS [IdentityUser_Roles.IdentityUser_Roles_Source.Id], 
                    T.UserId AS [IdentityUser_Roles.IdentityUser_Roles_Target.UserId], 
                    T.RoleId AS [IdentityUser_Roles.IdentityUser_Roles_Target.RoleId], 
                    True AS _from0
                FROM CodeFirstDatabase.IdentityUserRole AS T
                WHERE T.IdentityUser_Id IS NOT NULL
            ) AS T1
        ) AS T2
    ) AS T3");
        }

        /// <summary>
        /// Gets the view for IdentityContext.IdentityUsers.
        /// </summary>
        /// <returns>The mapping view.</returns>
        private static DbMappingView GetView8()
        {
            return new DbMappingView(@"
    SELECT VALUE -- Constructing IdentityUsers
        CASE
            WHEN T1._from2 THEN [MindForest.Models.IdentityUser](T1.IdentityUser_Id, T1.IdentityUser_Email, T1.IdentityUser_EmailConfirmed, T1.IdentityUser_PasswordHash, T1.IdentityUser_SecurityStamp, T1.IdentityUser_PhoneNumber, T1.IdentityUser_PhoneNumberConfirmed, T1.IdentityUser_TwoFactorEnabled, T1.IdentityUser_LockoutEndDateUtc, T1.IdentityUser_LockoutEnabled, T1.IdentityUser_AccessFailedCount, T1.IdentityUser_UserName)
            ELSE [MindForest.Models.AppUser](T1.IdentityUser_Id, T1.IdentityUser_Email, T1.IdentityUser_EmailConfirmed, T1.IdentityUser_PasswordHash, T1.IdentityUser_SecurityStamp, T1.IdentityUser_PhoneNumber, T1.IdentityUser_PhoneNumberConfirmed, T1.IdentityUser_TwoFactorEnabled, T1.IdentityUser_LockoutEndDateUtc, T1.IdentityUser_LockoutEnabled, T1.IdentityUser_AccessFailedCount, T1.IdentityUser_UserName)
        END
    FROM (
        SELECT 
            T.Id AS IdentityUser_Id, 
            T.Email AS IdentityUser_Email, 
            T.EmailConfirmed AS IdentityUser_EmailConfirmed, 
            T.PasswordHash AS IdentityUser_PasswordHash, 
            T.SecurityStamp AS IdentityUser_SecurityStamp, 
            T.PhoneNumber AS IdentityUser_PhoneNumber, 
            T.PhoneNumberConfirmed AS IdentityUser_PhoneNumberConfirmed, 
            T.TwoFactorEnabled AS IdentityUser_TwoFactorEnabled, 
            T.LockoutEndDateUtc AS IdentityUser_LockoutEndDateUtc, 
            T.LockoutEnabled AS IdentityUser_LockoutEnabled, 
            T.AccessFailedCount AS IdentityUser_AccessFailedCount, 
            T.UserName AS IdentityUser_UserName, 
            True AS _from0, 
            CASE WHEN T.Discriminator = N'AppUser' THEN True ELSE False END AS _from1, 
            CASE WHEN T.Discriminator = N'IdentityUser' THEN True ELSE False END AS _from2
        FROM CodeFirstDatabase.IdentityUser AS T
        WHERE T.Discriminator IN {N'AppUser', N'IdentityUser'}
    ) AS T1");
        }

        /// <summary>
        /// Gets the view for IdentityContext.IdentityUserClaims.
        /// </summary>
        /// <returns>The mapping view.</returns>
        private static DbMappingView GetView9()
        {
            return new DbMappingView(@"
    SELECT VALUE -- Constructing IdentityUserClaims
        [MindForest.Models.IdentityUserClaim](T1.IdentityUserClaim_Id, T1.IdentityUserClaim_UserId, T1.IdentityUserClaim_ClaimType, T1.IdentityUserClaim_ClaimValue) WITH 
        RELATIONSHIP(CREATEREF(IdentityContext.IdentityUsers, ROW(T1.[IdentityUser_Claims.IdentityUser_Claims_Source.Id]),[MindForest.Models.IdentityUser]),[MindForest.Models.IdentityUser_Claims],IdentityUser_Claims_Target,IdentityUser_Claims_Source) 
    FROM (
        SELECT 
            T.Id AS IdentityUserClaim_Id, 
            T.UserId AS IdentityUserClaim_UserId, 
            T.ClaimType AS IdentityUserClaim_ClaimType, 
            T.ClaimValue AS IdentityUserClaim_ClaimValue, 
            True AS _from0, 
            T.IdentityUser_Id AS [IdentityUser_Claims.IdentityUser_Claims_Source.Id]
        FROM CodeFirstDatabase.IdentityUserClaim AS T
    ) AS T1");
        }

        /// <summary>
        /// Gets the view for IdentityContext.IdentityUser_Claims.
        /// </summary>
        /// <returns>The mapping view.</returns>
        private static DbMappingView GetView10()
        {
            return new DbMappingView(@"
    SELECT VALUE -- Constructing IdentityUser_Claims
        [MindForest.Models.IdentityUser_Claims](T3.[IdentityUser_Claims.IdentityUser_Claims_Source], T3.[IdentityUser_Claims.IdentityUser_Claims_Target])
    FROM (
        SELECT -- Constructing IdentityUser_Claims_Source
            CreateRef(IdentityContext.IdentityUsers, row(T2.[IdentityUser_Claims.IdentityUser_Claims_Source.Id]), [MindForest.Models.IdentityUser]) AS [IdentityUser_Claims.IdentityUser_Claims_Source], 
            T2.[IdentityUser_Claims.IdentityUser_Claims_Target]
        FROM (
            SELECT -- Constructing IdentityUser_Claims_Target
                T1.[IdentityUser_Claims.IdentityUser_Claims_Source.Id], 
                CreateRef(IdentityContext.IdentityUserClaims, row(T1.[IdentityUser_Claims.IdentityUser_Claims_Target.Id]), [MindForest.Models.IdentityUserClaim]) AS [IdentityUser_Claims.IdentityUser_Claims_Target]
            FROM (
                SELECT 
                    T.IdentityUser_Id AS [IdentityUser_Claims.IdentityUser_Claims_Source.Id], 
                    T.Id AS [IdentityUser_Claims.IdentityUser_Claims_Target.Id], 
                    True AS _from0
                FROM CodeFirstDatabase.IdentityUserClaim AS T
                WHERE T.IdentityUser_Id IS NOT NULL
            ) AS T1
        ) AS T2
    ) AS T3");
        }

        /// <summary>
        /// Gets the view for IdentityContext.IdentityUserLogins.
        /// </summary>
        /// <returns>The mapping view.</returns>
        private static DbMappingView GetView11()
        {
            return new DbMappingView(@"
    SELECT VALUE -- Constructing IdentityUserLogins
        [MindForest.Models.IdentityUserLogin](T1.IdentityUserLogin_LoginProvider, T1.IdentityUserLogin_ProviderKey, T1.IdentityUserLogin_UserId) WITH 
        RELATIONSHIP(CREATEREF(IdentityContext.IdentityUsers, ROW(T1.[IdentityUser_Logins.IdentityUser_Logins_Source.Id]),[MindForest.Models.IdentityUser]),[MindForest.Models.IdentityUser_Logins],IdentityUser_Logins_Target,IdentityUser_Logins_Source) 
    FROM (
        SELECT 
            T.LoginProvider AS IdentityUserLogin_LoginProvider, 
            T.ProviderKey AS IdentityUserLogin_ProviderKey, 
            T.UserId AS IdentityUserLogin_UserId, 
            True AS _from0, 
            T.IdentityUser_Id AS [IdentityUser_Logins.IdentityUser_Logins_Source.Id]
        FROM CodeFirstDatabase.IdentityUserLogin AS T
    ) AS T1");
        }

        /// <summary>
        /// Gets the view for IdentityContext.IdentityUser_Logins.
        /// </summary>
        /// <returns>The mapping view.</returns>
        private static DbMappingView GetView12()
        {
            return new DbMappingView(@"
    SELECT VALUE -- Constructing IdentityUser_Logins
        [MindForest.Models.IdentityUser_Logins](T3.[IdentityUser_Logins.IdentityUser_Logins_Source], T3.[IdentityUser_Logins.IdentityUser_Logins_Target])
    FROM (
        SELECT -- Constructing IdentityUser_Logins_Source
            CreateRef(IdentityContext.IdentityUsers, row(T2.[IdentityUser_Logins.IdentityUser_Logins_Source.Id]), [MindForest.Models.IdentityUser]) AS [IdentityUser_Logins.IdentityUser_Logins_Source], 
            T2.[IdentityUser_Logins.IdentityUser_Logins_Target]
        FROM (
            SELECT -- Constructing IdentityUser_Logins_Target
                T1.[IdentityUser_Logins.IdentityUser_Logins_Source.Id], 
                CreateRef(IdentityContext.IdentityUserLogins, row(T1.[IdentityUser_Logins.IdentityUser_Logins_Target.LoginProvider], T1.[IdentityUser_Logins.IdentityUser_Logins_Target.ProviderKey], T1.[IdentityUser_Logins.IdentityUser_Logins_Target.UserId]), [MindForest.Models.IdentityUserLogin]) AS [IdentityUser_Logins.IdentityUser_Logins_Target]
            FROM (
                SELECT 
                    T.IdentityUser_Id AS [IdentityUser_Logins.IdentityUser_Logins_Source.Id], 
                    T.LoginProvider AS [IdentityUser_Logins.IdentityUser_Logins_Target.LoginProvider], 
                    T.ProviderKey AS [IdentityUser_Logins.IdentityUser_Logins_Target.ProviderKey], 
                    T.UserId AS [IdentityUser_Logins.IdentityUser_Logins_Target.UserId], 
                    True AS _from0
                FROM CodeFirstDatabase.IdentityUserLogin AS T
                WHERE T.IdentityUser_Id IS NOT NULL
            ) AS T1
        ) AS T2
    ) AS T3");
        }
    }
}
