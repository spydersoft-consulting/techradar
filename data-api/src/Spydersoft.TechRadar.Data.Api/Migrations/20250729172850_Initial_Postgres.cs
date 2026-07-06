using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using System;

#nullable disable

namespace Spydersoft.TechRadar.Data.Api.Migrations;

/// <inheritdoc />
public partial class Initial_Postgres : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterDatabase()
            .Annotation("Npgsql:PostgresExtension:uuid-ossp", ",,");

        migrationBuilder.CreateTable(
            name: "audits",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                table_name = table.Column<string>(type: "text", nullable: true),
                audit_date_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                key_values = table.Column<string>(type: "text", nullable: true),
                old_values = table.Column<string>(type: "text", nullable: true),
                new_values = table.Column<string>(type: "text", nullable: true),
                user_id = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_audits", x => x.id);
            });

        migrationBuilder.CreateTable(
            name: "quadrants",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                radar_id = table.Column<int>(type: "integer", nullable: false),
                name = table.Column<string>(type: "text", nullable: false),
                color = table.Column<string>(type: "text", nullable: false),
                position = table.Column<int>(type: "integer", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_quadrants", x => x.id);
            });

        migrationBuilder.CreateTable(
            name: "radar_arcs",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                radar_id = table.Column<int>(type: "integer", nullable: false),
                name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                radius = table.Column<int>(type: "integer", nullable: false),
                color = table.Column<string>(type: "text", nullable: false),
                position = table.Column<int>(type: "integer", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_radar_arcs", x => x.id);
            });

        migrationBuilder.CreateTable(
            name: "radar_item_notes",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                radar_item_id = table.Column<int>(type: "integer", nullable: false),
                notes = table.Column<string>(type: "text", nullable: true),
                user_id = table.Column<string>(type: "text", nullable: true),
                date_created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                date_updated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_radar_item_notes", x => x.id);
            });

        migrationBuilder.CreateTable(
            name: "radar_items",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                quadrant_id = table.Column<int>(type: "integer", nullable: false),
                radar_id = table.Column<int>(type: "integer", nullable: false),
                arc_id = table.Column<int>(type: "integer", nullable: false),
                name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                url = table.Column<string>(type: "text", nullable: true),
                rank = table.Column<int>(type: "integer", nullable: false),
                legend_key = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                movement_direction = table.Column<int>(type: "integer", nullable: false),
                date_created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                date_updated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_radar_items", x => x.id);
            });

        migrationBuilder.CreateTable(
            name: "radars",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                title = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                description = table.Column<string>(type: "text", nullable: false),
                background_color = table.Column<string>(type: "text", nullable: false),
                gridline_color = table.Column<string>(type: "text", nullable: false),
                inactive_color = table.Column<string>(type: "text", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_radars", x => x.id);
            });

        migrationBuilder.CreateTable(
            name: "tags",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                radar_id = table.Column<int>(type: "integer", nullable: false),
                name = table.Column<string>(type: "text", nullable: false),
                description = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_tags", x => x.id);
            });

        migrationBuilder.CreateTable(
            name: "radar_item_tags",
            columns: table => new
            {
                radar_item_id = table.Column<int>(type: "integer", nullable: false),
                tag_id = table.Column<int>(type: "integer", nullable: false),
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_radar_item_tags", x => new { x.radar_item_id, x.tag_id });
                table.ForeignKey(
                    name: "fk_radar_item_tags_radar_items_radar_item_id",
                    column: x => x.radar_item_id,
                    principalTable: "radar_items",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_radar_item_tags_tags_tag_id",
                    column: x => x.tag_id,
                    principalTable: "tags",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "ix_radar_item_tags_tag_id",
            table: "radar_item_tags",
            column: "tag_id");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "audits");

        migrationBuilder.DropTable(
            name: "quadrants");

        migrationBuilder.DropTable(
            name: "radar_arcs");

        migrationBuilder.DropTable(
            name: "radar_item_notes");

        migrationBuilder.DropTable(
            name: "radar_item_tags");

        migrationBuilder.DropTable(
            name: "radars");

        migrationBuilder.DropTable(
            name: "radar_items");

        migrationBuilder.DropTable(
            name: "tags");
    }
}
