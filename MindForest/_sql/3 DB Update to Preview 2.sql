--/media/Mutmacherei/logo.png, /media/Mutmacherei/logo_en.png 

Alter Table Mind.Connections
	Add Id bigint Not Null Identity(1,1)
;
go
ALTER TABLE Mind.Connections DROP CONSTRAINT PK_Mind_Connections
GO
ALTER TABLE Mind.Connections ADD  CONSTRAINT PK_Mind_Connections PRIMARY KEY NONCLUSTERED (Id ASC)
GO
Alter Table Mind.Connections 
	Drop Constraint DF_Mind_Connections_UniqueId
go
Alter Table Mind.Connections 
	Drop Column UniqueId
go


CREATE TABLE Mind.NodeTexts (
	Id						bigint IDENTITY(1,1) NOT NULL,
	NodeId				bigint NOT NULL,
	Lang					char(2) NULL,
	Position			int NOT NULL,
	Title					nvarchar(1000) NULL,
	RichTitle			nvarchar(max) NULL,
	Synopsis			nvarchar(1000) NULL,
	[Description] nvarchar(max) NULL,
	Comment				nvarchar(max) NULL,
	CONSTRAINT PK_Mind_NodeTexts PRIMARY KEY NONCLUSTERED (Id ASC)
)
GO
Create Clustered Index IX_Mind_NodeTexts
	On Mind.NodeText (NodeId ASC)
;

ALTER TABLE Mind.NodeTexts 
	WITH CHECK 
	ADD CONSTRAINT [FK_Mind_NodeTexts_Nodes] 
	FOREIGN KEY([NodeId]) REFERENCES Mind.Nodes (Id)
GO

ALTER TABLE [Mind].[NodeText] CHECK CONSTRAINT [FK_Mind_NodeText_Node]
GO

Alter Table Mind.NodeText 
	Add Constraint FK_Mind_NodeText_Node 
	Foreign Key (NodeId) References Mind.Node (Id)
;
go


Insert 
	Into Mind.NodeText (NodeId, Lang, Title, RichTitle, Synopsis) 
	Select Id, Lang, Title, RichTitle, Content  
	From Mind.Nodes
;

/*
-- Custom Data Changes
Update Mind.Nodes 
	Set Lang = Null
	Where Lang Is Not Null 
	And
	Id In (
		Select NodeId
		From Mind.NodeText
		Group By NodeId
		Having Count(NodeId) > 1
	)
;
*/
go

Create Table Mind.[Permissions] (
	NodeId			bigint	Not Null,
	RoleId			int			Not Null,
	Permission	tinyint Not Null Constraint DF_Mind_Permissions_Permission Default (1), -- 1=Select, (2=Insert, 3=Update, 4=Delete ... pro Tree)
	Constraint PK_Mind_Permissions Primary Key Clustered (NodeId, RoleId)
)
go
Alter Table Mind.[Permissions]
	Add Constraint FK_Mind_Permission_Node Foreign Key (NodeId) References Mind.Nodes(Id) 
	On Update Cascade
	On Delete	Cascade
;
Alter Table Mind.[Permissions]
	Add Constraint FK_Mind__Permission_Role Foreign Key (RoleId) References Web.Roles(RoleId) 
	On Update No Action
	On Delete	No Action
;
Alter Table Web.Membership
	Add Constraint FK_Web_Membership_UserProfile Foreign Key (UserId) References Web.UserProfiles (UserId)
	On Update Cascade
	On Delete	Cascade
;
Alter Table Web.OAuthMembership
	Add Constraint FK_Web_OAuthMembership_UserProfile Foreign Key (UserId) References Web.UserProfiles (UserId)
	On Update Cascade
	On Delete	Cascade
;

go
Alter Table Mind.Nodes 
	Drop Column Title, RichTitle, Content
;
go
Alter Table Mind.Nodes 
	Drop Constraint U_Mind_Nodes
go
Alter Table Mind.Nodes 
	Drop Constraint DF_Mind_Nodes_UniqueId
go
Alter Table Mind.Nodes 
	Drop Column UniqueId
go

Alter Table Mind.Nodes 
	Add RestrictAccess bit Not Null Constraint DF_Mind_Nodes_RestrictAccess Default (0)
;

ALTER TABLE [Mind].[Nodes] 
	DROP CONSTRAINT [PK_Mind_Nodes]
;
go
ALTER TABLE [Mind].[Nodes] 
	ADD CONSTRAINT [U_Mind_Nodes] Unique NonClustered (UniqueId) 
;
ALTER TABLE [Mind].[Nodes] 
	ADD CONSTRAINT [PK_Mind_Nodes] Primary Key Clustered (Id) 
;
Alter Table Mind.NodeTexts 
	Add Constraint FK_Mind_NodeText_Node Foreign Key (NodeId) References Mind.Nodes(Id)
;
go
Alter Table Mind.Connections
	Add Constraint FK_Mind_Connections_FromNode Foreign Key (FromId) References Mind.Nodes(Id) 
	On Update No Action 
	On Delete No Action
;
Alter Table Mind.Connections
	Add Constraint FK_Mind__Connections_ToNode Foreign Key (ToId) References Mind.Nodes(Id) 
	On Update Cascade 
	On Delete Cascade
;
go
EXEC sp_rename 'Mind.U_Mind_Connections', 'U_Mind_Connections_FromTo', 'OBJECT';
go
USE [C:\DATEN\PROJEKTE\MINDFOREST\SOURCE\MINDFOREST\MINDFOREST\APP_DATA\MUTMACHEREI.MDF]
Create NonClustered Index IX_Mind_Connections_ToFrom 
	On Mind.Connections (ToId ASC)
;

EXEC sp_rename 'Mind.GetTreeInfo', 'GetTrees', 'OBJECT';
go

Alter Table Mind.Connections 
	Add 
		Relation tinyint Not Null Constraint DF_Mind_Connections_Relates Default (1)
;
go
Update Mind.Connections 
	Set Relation = IsVisible;
go

EXEC sp_rename 'Mind.Connections.IsExpanded', 'AlwaysExpand', 'COLUMN';
go


Begin Try Drop Function Mind.GetChildConnectionInfos; End Try
Begin Catch End Catch
go
Create Function Mind.GetChildConnectionInfos ( @NodeId int = null, @User sysname = null, @Levels int = null, @Lang varchar(2) = null ) Returns @result table (
		[Id] [bigint] NOT NULL,
		[FromId] [bigint] NOT NULL,
		[ToId] [bigint] NOT NULL,
		Relation tinyint Not Null,
		[Position] [int] NOT NULL,
		[IsVisible] [bit] NULL,
		AlwaysExpand [bit] NULL,
		[Class] [nvarchar](200) NULL,
		[Style] [nvarchar](1000) NULL,
		[Color] [varchar](10) NULL,
		[Width] [varchar](10) NULL,
		[Hook] [nvarchar](max) NULL,
		[CreatedAt] [datetime2](3) NOT NULL,
		[CreatedBy] [sysname] NOT NULL,
		[ModifiedAt] [datetime2](3) NOT NULL,
		[ModifiedBy] [sysname] NOT NULL,
		[ForeignId] [varchar](40) NULL,
		[ForeignOrigin] [nvarchar](200) NULL
		,[Level] int Not Null
	) As 
	Begin

		--Defaults
		Declare @UserId nvarchar(128) = Null;
		Declare @Roles table (RoleId bigint Not Null);
		If (@Levels Is Null) Set @Levels = 1; --default to 1 level up
		If (@Lang Is Null) Set @Lang = '%';		--default to all languages

		Declare @FromNodeIds Table (Id bigint Not Null);
		If (@NodeId Is Null) Begin --return connections from root or orphaned nodes
			Insert	
				Into		@FromNodeIds(Id)
				Select	n.Id
				From		Mind.Nodes n
				Where		(n.IsTreeRoot = 1 Or Not Exists(Select * From Mind.Connections c Where n.Id = c.ToId))
								And
								(n.RestrictAccess = 0 Or n.Id In (Select p.NodeId From Mind.[Permissions] p Where p.RoleId In (Select RoleId From @Roles) And p.Permission >= 1 /*Select*/ )) 
								And
								(n.Lang Like @Lang Or n.Lang Is Null)
			;
		End
		Else Begin
			Insert Into	@FromNodeIds(Id) Values(@NodeId);
		End
		
		--Get User credentials
		If (@User Is Not Null) Begin
			Set @UserId = (Select Id From App.Users Where UserName = @User);
			Insert Into @Roles Select RoleId From App.UserRoles Where UserId = @UserId;
		End;

		--Get Connections
		With it As (
			Select	
				c.Id, c.FromId, c.ToId, c.Relation, c.Position, c.IsVisible, c.AlwaysExpand, c.Class, c.Style, c.Color, c.Width, c.Hook
				, c.CreatedAt, c.CreatedBy, c.ModifiedAt, c.ModifiedBy, c.ForeignId, c.ForeignOrigin
				, 1 As [Level]
			From	
				Mind.Connections c Inner Join Mind.Nodes n On (n.Id = c.ToId)
			Where	
				c.FromId In (Select Id From @FromNodeIds)
				And
				(n.RestrictAccess = 0 Or n.Id In (Select p.NodeId From Mind.[Permissions] p Where p.RoleId In (Select RoleId From @Roles) And p.Permission >= 1 /*Select*/ )) 
				And
				(n.Lang Like @Lang Or n.Lang Is Null)
			Union All
			Select	 
				c.Id, c.FromId, c.ToId, c.Relation, c.Position, c.IsVisible, c.AlwaysExpand, c.Class, c.Style, c.Color, c.Width, c.Hook
				, c.CreatedAt, c.CreatedBy, c.ModifiedAt, c.ModifiedBy, c.ForeignId, c.ForeignOrigin
				, it.[Level]+1 
			From	
				Mind.Connections c Inner Join it On (it.ToId = c.FromId) Inner Join Mind.Nodes n On (n.Id = c.ToId)
			Where 
				it.[Level] < @Levels
				And
				(n.RestrictAccess = 0 Or n.Id In (Select p.NodeId From Mind.[Permissions] p Where p.RoleId In (Select RoleId From @Roles) And p.Permission >= 1 /*Select*/ )) 
				And
				(n.Lang Like @Lang Or n.Lang Is Null)
		) 
		Insert Into @result 
			Select 
				c.Id, c.FromId, c.ToId, c.Relation, c.Position, c.IsVisible, c.AlwaysExpand, c.Class, c.Style, c.Color, c.Width, c.Hook
				, c.CreatedAt, c.CreatedBy, c.ModifiedAt, c.ModifiedBy, c.ForeignId, c.ForeignOrigin
				, c.[Level]
			From 
				it c
		;
		Return --@result
	End
go
Begin Try Drop Function Mind.GetParentConnectionInfos; End Try
Begin Catch End Catch
go
Create Function Mind.GetParentConnectionInfos ( @NodeId int, @User sysname = null, @Levels int = null, @Lang varchar(2) = null ) Returns @result table (
		[Id] [bigint] NOT NULL,
		[FromId] [bigint] NOT NULL,
		[ToId] [bigint] NOT NULL,
		Relation tinyint Not Null,
		[Position] [int] NOT NULL,
		[IsVisible] [bit] NULL,
		AlwaysExpand [bit] NULL,
		[Class] [nvarchar](200) NULL,
		[Style] [nvarchar](1000) NULL,
		[Color] [varchar](10) NULL,
		[Width] [varchar](10) NULL,
		[Hook] [nvarchar](max) NULL,
		[CreatedAt] [datetime2](3) NOT NULL,
		[CreatedBy] [sysname] NOT NULL,
		[ModifiedAt] [datetime2](3) NOT NULL,
		[ModifiedBy] [sysname] NOT NULL,
		[ForeignId] [varchar](40) NULL,
		[ForeignOrigin] [nvarchar](200) NULL
		,[Level] int Not Null
	) As 
	Begin

		--Defaults
		Declare @UserId nvarchar(128) = Null;
		Declare @Roles table (RoleId bigint Not Null);
		If (@Levels Is Null) Set @Levels = 1; --default to 1 level up
		If (@Lang Is Null) Set @Lang = '%';		--default to all languages
		
		--Get User credentials
		If (@User Is Not Null) Begin
			Set @UserId = (Select Id From App.Users Where UserName = @User);
			Insert Into @Roles Select RoleId From App.UserRoles Where UserId = @UserId;
		End;

		--Get Connections
		With it As (
			Select 
				c.Id, c.FromId, c.ToId, c.Relation, c.Position, c.IsVisible, c.AlwaysExpand, c.Class, c.Style, c.Color, c.Width, c.Hook
				, c.CreatedAt, c.CreatedBy, c.ModifiedAt, c.ModifiedBy, c.ForeignId, c.ForeignOrigin
				, 1 As [Level]
			From	
				Mind.Connections c Inner Join Mind.Nodes n On (n.Id = c.FromId)
			Where	
				c.ToId = @NodeId 
				And
				(n.RestrictAccess = 0 Or n.Id In (Select p.NodeId From Mind.[Permissions] p Where p.RoleId In (Select RoleId From @Roles) And p.Permission >= 1 /*Select*/ )) 
				And
				(n.Lang Like @Lang Or n.Lang Is Null)
			Union All
			Select					
				c.Id, c.FromId, c.ToId, c.Relation, c.Position, c.IsVisible, c.AlwaysExpand, c.Class, c.Style, c.Color, c.Width, c.Hook
				, c.CreatedAt, c.CreatedBy, c.ModifiedAt, c.ModifiedBy, c.ForeignId, c.ForeignOrigin
				, it.[Level]+1
			From	
				Mind.Connections c Inner Join it On (it.FromId = c.ToId) Inner Join Mind.Nodes n On (n.Id = c.FromId)
			Where 
				it.[Level] < @Levels
				And
				(n.RestrictAccess = 0 Or n.Id In (Select p.NodeId From Mind.[Permissions] p Where p.RoleId In (Select RoleId From @Roles) And p.Permission >= 1 /*Select*/ )) 
				And
				(n.Lang Like @Lang Or n.Lang Is Null)
		) 
		Insert Into @result 
			Select 
				c.Id, c.FromId, c.ToId, c.Relation, c.Position, c.IsVisible, c.AlwaysExpand, c.Class, c.Style, c.Color, c.Width, c.Hook
				, c.CreatedAt, c.CreatedBy, c.ModifiedAt, c.ModifiedBy, c.ForeignId, c.ForeignOrigin
				, c.[Level]
			From 
				it c
		;
		Return --@result
	End
go

Begin Try Drop Function Mind.GetChildConnections; End Try
Begin Catch End Catch
go
Create Function Mind.GetChildConnections ( @NodeId int = null, @User sysname = null, @Levels int = null, @SkipLevels int = null, @Lang varchar(2) = null ) Returns @result table (
		[Id] [bigint] NOT NULL,
		[FromId] [bigint] NOT NULL,
		[ToId] [bigint] NOT NULL,
		Relation tinyint Not Null,
		[Position] [int] NOT NULL,
		[IsVisible] [bit] NULL,
		AlwaysExpand [bit] NULL,
		[Class] [nvarchar](200) NULL,
		[Style] [nvarchar](1000) NULL,
		[Color] [varchar](10) NULL,
		[Width] [varchar](10) NULL,
		[Hook] [nvarchar](max) NULL,
		[CreatedAt] [datetime2](3) NOT NULL,
		[CreatedBy] [sysname] NOT NULL,
		[ModifiedAt] [datetime2](3) NOT NULL,
		[ModifiedBy] [sysname] NOT NULL,
		[ForeignId] [varchar](40) NULL,
		[ForeignOrigin] [nvarchar](200) NULL
	) As 
	Begin
		--Defaults (missing values are explicitly pased as null)
		If (@SkipLevels Is Null) Set @SkipLevels = 0; --don't skip levels
		--Create result
		Insert Into @result 
		Select 				 
				c.Id, c.FromId, c.ToId, c.Relation, c.Position, c.IsVisible, c.AlwaysExpand, c.Class, c.Style, c.Color, c.Width, c.Hook
				, c.CreatedAt, c.CreatedBy, c.ModifiedAt, c.ModifiedBy, c.ForeignId, c.ForeignOrigin
		From 
			Mind.GetChildConnectionInfos(@NodeId, @User, @Levels, @Lang) c
		Where 
			c.[Level] > @SkipLevels
		;
		Return; --@result
	End
go
Begin Try Drop Function Mind.GetParentConnections; End Try
Begin Catch End Catch
go
Create Function Mind.GetParentConnections ( @NodeId int, @User sysname = null, @Levels int = null, @SkipLevels int = null, @Lang varchar(2) = null ) Returns @result table (
		[Id] [bigint] NOT NULL,
		[FromId] [bigint] NOT NULL,
		[ToId] [bigint] NOT NULL,
		Relation tinyint Not Null,
		[Position] [int] NOT NULL,
		[IsVisible] [bit] NULL,
		AlwaysExpand [bit] NULL,
		[Class] [nvarchar](200) NULL,
		[Style] [nvarchar](1000) NULL,
		[Color] [varchar](10) NULL,
		[Width] [varchar](10) NULL,
		[Hook] [nvarchar](max) NULL,
		[CreatedAt] [datetime2](3) NOT NULL,
		[CreatedBy] [sysname] NOT NULL,
		[ModifiedAt] [datetime2](3) NOT NULL,
		[ModifiedBy] [sysname] NOT NULL,
		[ForeignId] [varchar](40) NULL,
		[ForeignOrigin] [nvarchar](200) NULL
	) As 
	Begin
		--Defaults (missing values are explicitly pased as null)
		If (@SkipLevels Is Null) Set @SkipLevels = 0; --don't skip levels
		--Create result
		Insert Into @result 
			Select 				 
				c.Id, c.FromId, c.ToId, c.Relation, c.Position, c.IsVisible, c.AlwaysExpand, c.Class, c.Style, c.Color, c.Width, c.Hook
				, c.CreatedAt, c.CreatedBy, c.ModifiedAt, c.ModifiedBy, c.ForeignId, c.ForeignOrigin
		From 
			Mind.GetParentConnectionInfos(@NodeId, @User, @Levels, @Lang) c
		Where 
			c.[Level] > @SkipLevels
		;
		Return; --@result
	End
go
Begin Try Drop Function Mind.GetNeighbourConnections; End Try
Begin Catch End Catch
go
Create Function Mind.GetNeighbourConnections ( @NodeId int, @User sysname = null, @Levels int = null, @SkipLevels int = null, @Lang varchar(2) = null ) Returns @result table (
		[Id] [bigint] NOT NULL,
		[FromId] [bigint] NOT NULL,
		[ToId] [bigint] NOT NULL,
		Relation tinyint Not Null,
		[Position] [int] NOT NULL,
		[IsVisible] [bit] NULL,
		AlwaysExpand [bit] NULL,
		[Class] [nvarchar](200) NULL,
		[Style] [nvarchar](1000) NULL,
		[Color] [varchar](10) NULL,
		[Width] [varchar](10) NULL,
		[Hook] [nvarchar](max) NULL,
		[CreatedAt] [datetime2](3) NOT NULL,
		[CreatedBy] [sysname] NOT NULL,
		[ModifiedAt] [datetime2](3) NOT NULL,
		[ModifiedBy] [sysname] NOT NULL,
		[ForeignId] [varchar](40) NULL,
		[ForeignOrigin] [nvarchar](200) NULL
	) As 
	Begin
		--Defaults (missing values are explicitly pased as null)
		If (@SkipLevels Is Null) Set @SkipLevels = 0; --don't skip levels
		Insert Into @result 
			Select 			 
				c.Id, c.FromId, c.ToId, c.Relation, c.Position, c.IsVisible, c.AlwaysExpand, c.Class, c.Style, c.Color, c.Width, c.Hook
				, c.CreatedAt, c.CreatedBy, c.ModifiedAt, c.ModifiedBy, c.ForeignId, c.ForeignOrigin
		From 
			Mind.GetParentConnectionInfos(@NodeId, @User, @Levels, @Lang) c
		Where 
			c.[Level] > @SkipLevels
		Union
		Select 				 
				c.Id, c.FromId, c.ToId, c.Relation, c.Position, c.IsVisible, c.AlwaysExpand, c.Class, c.Style, c.Color, c.Width, c.Hook
				, c.CreatedAt, c.CreatedBy, c.ModifiedAt, c.ModifiedBy, c.ForeignId, c.ForeignOrigin
		From 
			Mind.GetChildConnectionInfos(@NodeId, @User, @Levels, @Lang) c
		Where 
			c.[Level] > @SkipLevels
		;
		Return; --@result
	End
go

Alter Table Mind.Nodes
	Alter Column 	CreatedAt datetime2(3) NOT NULL;
Alter Table Mind.Nodes
	Alter Column 	ModifiedAt datetime2(3) NOT NULL;
go
Alter Table Mind.Connections
	Alter Column 	CreatedAt datetime2(3) NOT NULL;
Alter Table Mind.Connections
	Alter Column 	ModifiedAt datetime2(3) NOT NULL;
go


Create Function Mind.GetNodes ( @User sysname = null, @Lang varchar(2) = null ) RETURNS TABLE AS
	Return (
		Select	
			n.*
		From	
			Mind.Nodes n
		Where	
			(n.RestrictAccess = 0 
				Or 
				n.Id In (Select p.NodeId 
									From Mind.[Permissions] p 
									Where 
										p.RoleId In (Select RoleId From App.UserRoles r Inner Join App.Users up On (up.Id = r.UserId) Where UserName = @User)
										And 
										p.Permission >= 1 /*Select*/ 
									)
			) 
			And
			(n.Lang Like @Lang Or n.Lang Is Null)
	)
;

CREATE TABLE [Mind].[ConnectionTexts](
	[Id] [bigint] IDENTITY(1,1) NOT NULL,
	[ConnectionId] [bigint] NOT NULL,
	[Lang] [char](2) NULL,
	[StartText] [nvarchar](1000) NULL,
	[LineText] [nvarchar](1000) NULL,
	[EndText] [nvarchar](1000) NULL,
	[Description] [nvarchar](max) NULL,
	[Comment] [nvarchar](max) NULL,
 CONSTRAINT [PK_Mind_ConnectionTexts] PRIMARY KEY NONCLUSTERED ([Id] ASC)
);
GO
CREATE CLUSTERED INDEX IX_Mind_ConnectionTexts 
	ON Mind.ConnectionTexts (ConnectionId ASC);
GO
ALTER TABLE Mind.ConnectionTexts  
	WITH CHECK 
	ADD CONSTRAINT FK_Mind_ConnectionTexts_Connections 
		FOREIGN KEY(ConnectionId)
		REFERENCES Mind.Connections (Id)
GO


Alter Table Mind.Nodes 
	Alter Column Id bigint IDENTITY(1,1) NOT NULL


