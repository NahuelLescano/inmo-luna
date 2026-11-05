import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../index.js";

export class PropertyImage extends Model<
  InferAttributes<PropertyImage>,
  InferCreationAttributes<PropertyImage>
> {
  declare id: CreationOptional<number>;
  declare propertyId: number;
  declare filename: string;
  declare mimeType: string;
  declare size: number;
  declare orden: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
}

PropertyImage.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    propertyId: { type: DataTypes.INTEGER, allowNull: false },
    filename: { type: DataTypes.STRING, allowNull: false },
    mimeType: { type: DataTypes.STRING, allowNull: false },
    size: { type: DataTypes.INTEGER, allowNull: false },
    orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "property_images",
    underscored: true,
    updatedAt: false,
  },
);
