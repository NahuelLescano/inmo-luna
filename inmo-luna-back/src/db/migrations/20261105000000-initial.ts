import { DataTypes } from "sequelize";
import type { MigrationFn } from "umzug";
import type { QueryInterface } from "sequelize";

const migration: MigrationFn<QueryInterface> = async ({ context: queryInterface }) => {
  await queryInterface.createTable("properties", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    titulo: { type: DataTypes.STRING, allowNull: false },
    tipo: { type: DataTypes.ENUM("venta", "alquiler"), allowNull: false },
    precio: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    moneda: { type: DataTypes.STRING(3), allowNull: false, defaultValue: "USD" },
    habitaciones: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    banos: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    m2: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    ubicacion: { type: DataTypes.STRING, allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    created_at: { type: DataTypes.DATE, allowNull: false },
    updated_at: { type: DataTypes.DATE, allowNull: false },
  });

  await queryInterface.createTable("property_images", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "properties", key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    filename: { type: DataTypes.STRING, allowNull: false },
    mime_type: { type: DataTypes.STRING, allowNull: false },
    size: { type: DataTypes.INTEGER, allowNull: false },
    orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, allowNull: false },
  });

  await queryInterface.addIndex("property_images", ["property_id"]);
};

const down: MigrationFn<QueryInterface> = async ({ context: queryInterface }) => {
  await queryInterface.dropTable("property_images");
  await queryInterface.dropTable("properties");
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_properties_tipo";');
};

export { migration as up, down };
