import mongoose, { Schema, Document } from 'mongoose';

export interface IWarehouse extends Document {
  warehouseCode: string;
  name: string;
  city: string;
  state: string;
  address: string;
  managerId?: mongoose.Types.ObjectId;
  isActive: boolean;
}

const WarehouseSchema = new Schema<IWarehouse>(
  {
    warehouseCode: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    address: { type: String, required: true },
    managerId: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Warehouse = mongoose.model<IWarehouse>('Warehouse', WarehouseSchema);

export interface IInventoryItem extends Document {
  sku: string;
  name: string;
  category:
    | 'SOLAR_PANEL'
    | 'INVERTER'
    | 'MOUNTING_STRUCTURE'
    | 'ACDB_DCDB'
    | 'DC_CABLE'
    | 'AC_CABLE'
    | 'LIGHTNING_ARRESTER'
    | 'EARTHING_ROD'
    | 'ACCESSORY';
  manufacturer: string;
  modelNumber: string;
  unit: 'NOS' | 'METERS' | 'SETS' | 'KG';
  currentStock: number;
  reservedStock: number;
  unitCostPaise: number;
  reorderLevel: number;
  warehouseId: mongoose.Types.ObjectId;
  serialNumbers: string[];
}

const InventoryItemSchema = new Schema<IInventoryItem>(
  {
    sku: { type: String, required: true, unique: true, uppercase: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'SOLAR_PANEL',
        'INVERTER',
        'MOUNTING_STRUCTURE',
        'ACDB_DCDB',
        'DC_CABLE',
        'AC_CABLE',
        'LIGHTNING_ARRESTER',
        'EARTHING_ROD',
        'ACCESSORY',
      ],
      index: true,
    },
    manufacturer: { type: String, required: true },
    modelNumber: { type: String, required: true },
    unit: { type: String, enum: ['NOS', 'METERS', 'SETS', 'KG'], default: 'NOS' },
    currentStock: { type: Number, required: true, default: 0, min: 0 },
    reservedStock: { type: Number, required: true, default: 0, min: 0 },
    unitCostPaise: { type: Number, required: true },
    reorderLevel: { type: Number, default: 10 },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
    serialNumbers: [{ type: String }],
  },
  { timestamps: true }
);

export const InventoryItem = mongoose.model<IInventoryItem>('InventoryItem', InventoryItemSchema);

export interface IStockMovement extends Document {
  movementId: string;
  sku: string;
  warehouseId: mongoose.Types.ObjectId;
  movementType: 'INWARD' | 'OUTWARD_DISPATCH' | 'RESERVE' | 'RELEASE_RESERVE' | 'DAMAGED';
  qty: number;
  referenceType?: 'PROJECT' | 'PURCHASE_ORDER' | 'ADJUSTMENT';
  referenceId?: string;
  performedBy: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
}

const StockMovementSchema = new Schema<IStockMovement>(
  {
    movementId: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, uppercase: true, index: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    movementType: {
      type: String,
      required: true,
      enum: ['INWARD', 'OUTWARD_DISPATCH', 'RESERVE', 'RELEASE_RESERVE', 'DAMAGED'],
    },
    qty: { type: Number, required: true },
    referenceType: { type: String, enum: ['PROJECT', 'PURCHASE_ORDER', 'ADJUSTMENT'] },
    referenceId: { type: String },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const StockMovement = mongoose.model<IStockMovement>('StockMovement', StockMovementSchema);
