{

	"?xml": {
		"version": "1.0",
        "encoding": "utf-8"
	},
    "schema": {
    	"namespace": "MindForest.Models",
        "alias": "Self",
        "p1:UseStrongSpatialTypes": "false",
        "xmlns": "http://schemas.microsoft.com/ado/2009/11/edm",
        "xmlns:p1": "http://schemas.microsoft.com/ado/2009/02/edm/annotation",
        "cSpaceOSpaceMapping": "[[\"MindForest.Models.Node\",\"MindForest.Models.Node\"],[\"MindForest.Models.Connection\",\"MindForest.Models.Connection\"],[\"MindForest.Models.Membership\",\"MindForest.Models.Membership\"],[\"MindForest.Models.OAuthMembership\",\"MindForest.Models.OAuthMembership\"],[\"MindForest.Models.Role\",\"MindForest.Models.Role\"],[\"MindForest.Models.UserProfile\",\"MindForest.Models.UserProfile\"],[\"MindForest.Models.Permission\",\"MindForest.Models.Permission\"],[\"MindForest.Models.NodeText\",\"MindForest.Models.NodeText\"],[\"MindForest.Models.ConnectionText\",\"MindForest.Models.ConnectionText\"]]",
        "entityContainer": {
        	"name": "ForestEntities",
            "p1:LazyLoadingEnabled": "false",
            "entitySet": [
                {
                	"name": "Nodes",
                	"entityType": "MindForest.Models.Node"
                },
                {
                	"name": "Connections",
                	"entityType": "MindForest.Models.Connection"
                },
                {
                	"name": "Memberships",
                	"entityType": "MindForest.Models.Membership"
                },
                {
                	"name": "OAuthMemberships",
                	"entityType": "MindForest.Models.OAuthMembership"
                },
                {
                	"name": "Roles",
                	"entityType": "MindForest.Models.Role"
                },
                {
                	"name": "UserProfiles",
                	"entityType": "MindForest.Models.UserProfile"
                },
                {
                	"name": "Permissions",
                	"entityType": "MindForest.Models.Permission"
                },
                {
                	"name": "NodeTexts",
                	"entityType": "MindForest.Models.NodeText"
                },
                {
                	"name": "ConnectionTexts",
                	"entityType": "MindForest.Models.ConnectionText"
                }
            ],
            "associationSet": [ … ],
            "functionImport": [ … ]
        },
        "entityType": [
            { … },
            {
            	"name": "Connection",
            	"key": {
            		"propertyRef": {
            			"name": "Id"
            		}
            	},
            	"property": [
                    {
                    	"name": "Id",
                    	"type": "Edm.Int64",
                    	"nullable": "false",
                    	"p1:StoreGeneratedPattern": "Identity"
                    },
                    {
                    	"name": "Class",
                    	"type": "Edm.String",
                    	"maxLength": "200",
                    	"fixedLength": "false",
                    	"unicode": "true"
                    },
                    {
                    	"type": "Edm.Int64",
                    	"name": "FromId",
                    	"nullable": "false"
                    },
                    {
                    	"type": "Edm.Int64",
                    	"name": "ToId",
                    	"nullable": "false"
                    },
                    {
                    	"name": "Relation",
                    	"type": "Edm.Byte",
                    	"nullable": "false"
                    },
                    {
                    	"type": "Edm.Int32",
                    	"name": "Position",
                    	"nullable": "false"
                    },
                    {
                    	"type": "Edm.Boolean",
                    	"name": "IsVisible"
                    },
                    {
                    	"name": "AlwaysExpand",
                    	"type": "Edm.Boolean"
                    },
                    {
                    	"type": "Edm.String",
                    	"name": "Style",
                    	"maxLength": "1000",
                    	"fixedLength": "false",
                    	"unicode": "true"
                    },
                    {
                    	"type": "Edm.String",
                    	"name": "Color",
                    	"maxLength": "10",
                    	"fixedLength": "false",
                    	"unicode": "false"
                    },
                    {
                    	"type": "Edm.String",
                    	"name": "Width",
                    	"maxLength": "10",
                    	"fixedLength": "false",
                    	"unicode": "false"
                    },
                    {
                    	"type": "Edm.String",
                    	"name": "Hook",
                    	"maxLength": "Max",
                    	"fixedLength": "false",
                    	"unicode": "true"
                    },
                    {
                    	"type": "Edm.String",
                    	"name": "ForeignId",
                    	"maxLength": "40",
                    	"fixedLength": "false",
                    	"unicode": "false"
                    },
                    {
                    	"type": "Edm.String",
                    	"name": "ForeignOrigin",
                    	"maxLength": "200",
                    	"fixedLength": "false",
                    	"unicode": "true"
                    },
                    {
                    	"type": "Edm.DateTime",
                    	"name": "CreatedAt",
                    	"nullable": "false",
                    	"precision": "3"
                    },
                    {
                    	"type": "Edm.String",
                    	"name": "CreatedBy",
                    	"nullable": "false",
                    	"maxLength": "128",
                    	"fixedLength": "false",
                    	"unicode": "true"
                    },
                    {
                    	"type": "Edm.DateTime",
                    	"name": "ModifiedAt",
                    	"nullable": "false",
                    	"precision": "3"
                    },
                    {
                    	"type": "Edm.String",
                    	"name": "ModifiedBy",
                    	"nullable": "false",
                    	"maxLength": "128",
                    	"fixedLength": "false",
                    	"unicode": "true"
                    }
            	],
            	"navigationProperty": [
                    {
                    	"name": "ToNode",
                    	"relationship": "MindForest.Models.FK_Mind__Connection_ToNode",
                    	"fromRole": "Connection",
                    	"toRole": "Node"
                    },
                    {
                    	"name": "FromNode",
                    	"relationship": "MindForest.Models.FK_Mind_Connection_FromNode",
                    	"fromRole": "Connection",
                    	"toRole": "Node"
                    },
                    {
                    	"name": "Texts",
                    	"relationship": "MindForest.Models.FK_Mind_ConnectionTexts_Connections",
                    	"fromRole": "Connection",
                    	"toRole": "ConnectionText"
                    }
            	]
            },
            { … },
            { … },
            { … },
            { … },
            { … },
            { … },
            { … }
        ],
        "association": [ … ]
    }

}