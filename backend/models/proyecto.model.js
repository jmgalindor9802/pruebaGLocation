import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class Proyecto extends Model {}

Proyecto.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El nombre es obligatorio",
        },
        len: {
          args: [3, 120],
          msg: "El nombre debe tener entre 3 y 120 caracteres",
        },
      },
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fechaInicio: {
      field: "fecha_inicio",
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "La fecha de inicio es obligatoria",
        },
        isDate: {
          msg: "La fecha de inicio debe tener un formato válido",
        },
      },
    },
    fechaFin: {
      field: "fecha_fin",
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: {
          msg: "La fecha de fin debe tener un formato válido",
        },
      },
    },
    estado: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "planeado",
      validate: {
        notEmpty: {
          msg: "El estado es obligatorio",
        },
      },
    },
    },
  {
    sequelize,
    modelName: "Proyecto",
    tableName: "proyectos",
    underscored: true,
    timestamps: true,
  }
);