import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../index.js";
import { PropertyImage } from "./PropertyImage.js";

export class Property extends Model<
  InferAttributes<Property>,
  InferCreationAttributes<Property>
> {
  declare id: CreationOptional<number>;
  declare titulo: string;
  declare tipo: "venta" | "alquiler";
  declare precio: number;
  declare moneda: string;
  declare habitaciones: number;
  declare banos: number;
  declare m2: number;
  declare ubicacion: string;
  declare descripcion: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare imagenes?: PropertyImage[];
}

Property.init(
  {
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
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "properties",
    underscored: true,
  },
);

Property.hasMany(PropertyImage, {
  as: "imagenes",
  foreignKey: "propertyId",
  onDelete: "CASCADE",
  hooks: true,
});

PropertyImage.belongsTo(Property, {
  foreignKey: "propertyId",
  onDelete: "CASCADE",
});
