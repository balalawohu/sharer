// Model：用户模型（对应 user 表）
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            comment: '用户ID（主键）'
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: 'uk_username',
            comment: '用户昵称'
        },
        account: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: 'uk_account',
            comment: '登录账号'
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: '密码（bcrypt加密后的哈希值）'
        },
        avatar: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '头像URL'
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: 'uk_email',
            comment: '邮箱'
        },
        status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: '状态：1-正常 0-禁用'
        }
    },
    {
        tableName: 'user',      // 对应 SQL 中的表名
        underscored: true,      // 时间字段使用下划线命名：created_at / updated_at
        timestamps: true,       // 启用 createdAt / updatedAt
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
    }
);

export default User;
